#!/usr/bin/env node

/**
 * Conectese-Scraper MCP Server
 * Prototype (Option A): Uses a Search API to scrape real legal data from justice domains.
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

require('dotenv').config();

const server = new Server(
  {
    name: "conectese-scraper",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tenta extrair a numeração unificada do processo (CNJ) varrendo o HTML bruto
 * O padrão CNJ é NNNNNNN-NN.NNNN.J.TR.OOOO
 */
function extrairNumeroJusbrasil(htmlString) {
  // Regex para o padrão do CNJ (ex: 0001234-56.2023.8.26.0000 ou variações de pontos)
  const regexCNJ = /\b\d{7}[-]?\d{2}[.]?\d{4}[.]?\d{1}[.]?\d{2}[.]?\d{4}\b/;
  const match = htmlString.match(regexCNJ);

  if (match) {
    // Normaliza para garantir os hífens e pontos se as vezes vier formatado estranho mas com 20 digitos
    return match[0];
  }

  // Fallback: Se não achar formato exato do CNJ, tentar caçar na meta tag og:title (as vezes cortado)
  const titleMatch = htmlString.match(/<meta property="og:title" content="([^"]+)"/i);
  if (titleMatch) {
    const possivelNumero = titleMatch[1].match(/\d[\d\-.\s]{15,}\d/);
    if(possivelNumero) return possivelNumero[0].trim();
  }

  return "Número Ofuscado pelo Portal";
}

/**
 * Funçao de busca na Web usando Search API Serper vinculada à chave real.
 * Fase 1: Encontra a ementa via Serper.
 * Fase 2: Inspeciona as páginas do Jusbrasil em busca do número de processo oculto.
 */
async function searchJurisprudence(query, tribunal) {
  let domainTarget = `${tribunal.toLowerCase()}.jus.br`;
  
  // Se o usuário explicitly mencionar Jusbrasil, usamos a base gigance deles, senao os proprios tribunais.
  if (tribunal.toLowerCase() === 'jusbrasil') {
      domainTarget = 'jusbrasil.com.br/jurisprudencia';
  }

  console.log(`[Conectese-Scraper] Buscando dados REAIS via Serper.dev para: "${query}" (alvo: ${domainTarget})`);

  try {
    const url = 'https://google.serper.dev/search';
    
    // Filtro cirúrgico: restringe a busca ao domínio oficial ou ao Jusbrasil
    const searchPayload = JSON.stringify({
      q: `site:${domainTarget} ${query}`,
      hl: 'pt-br',
      gl: 'br'
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: searchPayload
    });

    const result = await response.json();

    if (!result.organic || result.organic.length === 0) {
      return {
        success: false,
        message: `Nenhuma jurisprudência encontrada em ${domainTarget} para o termo: ${query}`,
        recommendation: "Tente mudar as palavras-chave ou buscar sem usar o identificador restrito de site."
      };
    }

    // Top 3 de resultados brutos
    const topResults = result.organic.slice(0, 3);
    
// Adicionar um novo mock real para evitar Cloudflare ou usar proxies se for estritamente ambiente fechado.
// Para fins de teste e prova de conceito do Assistente:

    // Fase 2: Deep Fetch via Puppeteer Stealth (bypassa Cloudflare e raspa o HTML oculto)
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
    
    let browser = null;
    try {
      browser = await puppeteer.launch({ 
        headless: "new", 
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--no-zygote'
        ] 
      });
    } catch(e) {
      console.error("[Conectese-Scraper] Erro ao instanciar Puppeteer", e);
    }

    const enrichedData = await Promise.all(topResults.map(async (item) => {
      let numeroProcesso = "Não Identificado na Busca Rápida";
      let ementa = item.snippet;

      // Só tentar inspecionar se for ambiente jusbrasil e browser subiu
      if (item.link.includes('jusbrasil.com.br') && browser) {
         try {
             const page = await browser.newPage();
             // Bloqueia imagens/css para ser ultra rapido
             await page.setRequestInterception(true);
             page.on('request', req => {
                 if(['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                     req.abort();
                 } else {
                     req.continue();
                 }
             });

             await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 10000 });
             const rawHtml = await page.content();
             numeroProcesso = extrairNumeroJusbrasil(rawHtml);
             
             await page.close();
         } catch (fetchErr) {
             numeroProcesso = "[Ofuscado - Timeout Inspecionador]";
         }
      }

      return {
          tribunal: tribunal.toUpperCase(),
          titulo_processo: item.title,
          numero_oculto_processo: numeroProcesso,
          ementa: ementa,
          link_fonte: item.link,
          auditable: true
      };
    }));
    
    if (browser) await browser.close();

    return {
      success: true,
      data: enrichedData,
      instructions: "AGENTE SÊNIOR: Proibido inventar dados de processo. Escolha UM dos resultados acima (data array) que melhor embasa a sua tese. Ao citar, OBRIGATORIAMENTE cite o 'numero_oculto_processo', decodificado do Jusbrasil, e o 'link_fonte' como referência para o advogado poder checar."
    };

  } catch (error) {
    console.error(`[Conectese-Scraper] Erro de rede: `, error);
    throw new Error(`Falha na integração com API de scraper: ${error.message}`);
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_jurisprudence",
        description: "Busca jurisprudências auditáveis e reaias nos tribunais. Retorna ementa, número e link da fonte.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Os termos principais de busca da tese jurídica (ex: nulidade interceptação telefônica).",
            },
            tribunal: {
              type: "string",
              description: "Sigla do tribunal alvo (ex: STJ, STF, TJSP).",
            },
          },
          required: ["query", "tribunal"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "search_jurisprudence") {
    const { query, tribunal } = request.params.arguments;
    try {
      const results = await searchJurisprudence(query, tribunal);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `Erro fatal ao acessar módulo scraper: ${e.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Ferramenta não encontrada: ${request.params.name}`);
});

// Inicialização do Servidor MCP
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Conectese-Scraper MCP Server está rodando no protocolo Stdio.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
