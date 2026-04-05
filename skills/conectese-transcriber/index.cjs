#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// Try finding .env dynamically from the project root
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const server = new Server(
  {
    name: "conectese-transcriber",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "transcribe_media",
        description: "Transcreve arquivos de Áudio e Vídeo locais utilizando I.A. multimodal super-avançada. Extrai locutores, minutagem e texto perfeito.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Caminho absoluto ou relativo para o arquivo de mídia (.mp3, .mp4, .wav).",
            },
            contextPrompt: {
                type: "string",
                description: "Contexto opcional sobre o áudio (ex: 'Isso é um depoimento da testemunha Joao'). Ajuda muito na identificação das falas."
            }
          },
          required: ["filePath"],
        },
      },
    ],
  };
});

async function transcribeMedia(filePath, contextPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY não foi encontrada no arquivo .env.');
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Arquivo não encontrado: ${absolutePath}`);
  }

  // Obter MIME type
  let mimeType = mime.lookup(absolutePath);
  if (!mimeType) {
    if (absolutePath.endsWith('.mp3')) mimeType = 'audio/mp3';
    else if (absolutePath.endsWith('.wav')) mimeType = 'audio/wav';
    else if (absolutePath.endsWith('.mp4')) mimeType = 'video/mp4';
    else mimeType = 'application/octet-stream';
  }

  // Verifica o tamanho do arquivo
  const stats = fs.statSync(absolutePath);
  const sizeMB = stats.size / (1024 * 1024);
  if (sizeMB > 20) {    
      console.error(`Tamanho do arquivo: ${sizeMB.toFixed(2)} MB. Pode haver instabilidade de envio por conta do Payload Limit.`);
  }

  // Ler em Base64
  console.error("Lendo arquivo da mídia...");
  const fileBuffer = fs.readFileSync(absolutePath);
  const base64Data = fileBuffer.toString('base64');
  const base64Uri = `data:${mimeType};base64,${base64Data}`;

  const defaultPrompt = `
Você é um oficial de justiça especialista em degravação forense e transcrição textual rigorosa.
Seu trabalho é ouvir/assistir ao anexo a seguir e transcrever cada palavra falada, indicando precisamente os LOCUTORES (ex: Locutor 1, Locutor 2, Juiz, Testemunha - deduza caso o contexto sugira).
Você DEVE obrigatoriamente adicionar o CARIMBO DE TEMPO (Timestamp) para cada fala nova, no formato [mm:ss].
Entregue a transcrição formatada de maneira limpa em Markdown.
Exemplo esperado:
[00:15] **Locutor 1**: Eu não concordo com a autuação.
[00:18] **Locutor 2**: Mas as regras foram explicadas, senhor.

Se houver pausas ou sons relevantes, pontue como (pausa de 5 segundos) ou (som de porta batendo).
${contextPrompt ? `\nCONTEXTO DO ARQUIVO: ${contextPrompt}` : ''}
`;

  console.error("Enviando requisição via OpenRouter (Gemini 1.5 Flash)...");
  
  // Utilizando o Gemini Flash via OpenRouter. A OpenRouter mapeia image_url para multimodais genericamente.
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: "google/gemini-1.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: defaultPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: base64Uri
              }
            }
          ]
        }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://conectese.app', // opcional para openrouter
        'X-Title': 'Conectese Transcriber' 
      },
      // Max payload limits para envio de base64 pode requerer timeout alto e limites grandes (aqui lidamos no axios)
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    }
  );

  if (response.data && response.data.choices && response.data.choices.length > 0) {
    return response.data.choices[0].message.content;
  } else {
    throw new Error('Falha na resposta do OpenRouter: formato inesperado.');
  }
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "transcribe_media") {
    const { filePath, contextPrompt } = request.params.arguments;
    try {
      const report = await transcribeMedia(filePath, contextPrompt);
      return {
        content: [
          {
            type: "text",
            text: report,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Erro ao transcrever arquivo de mídia: ${error.message} \n\n${error.response ? JSON.stringify(error.response.data) : ''}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Tool unknown: ${request.params.name}`);
});

// Run server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("conectese-transcriber MCP server running on stdio");
}

run().catch((error) => {
  console.error("Runtime error:", error);
  process.exit(1);
});
