import cloudscraper from 'cloudscraper';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { fileURLToPath } from 'url';
import path from 'path';

puppeteer.use(StealthPlugin());

/**
 * Valida uma única URL
 * Retorna { url, status: 'ok'|'dead'|'unknown', title: string|null, reason?: string }
 */
async function validateUrl(url) {
  try {
    // 1. Tentar cloudscraper primeiro para maior velocidade
    const html = await cloudscraper.get(url, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7' } });
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    
    // Checar se é bloqueio ou CAPTCHA disfarçado de sucesso
    const titleLower = title.toLowerCase();
    if (titleLower.includes('captcha') || titleLower.includes('acesso negado') || html.includes('Incapsula')) {
        throw new Error('Cloudscraper bloqueado/captcha, caindo para fallback Puppeteer');
    }

    return {
      url,
      status: 'ok',
      title: title || 'Sem Título',
    };
  } catch (error) {
    // Se for 404 real no cloudscraper
    if (error.statusCode === 404) {
      return { url, status: 'dead', reason: 'Página não encontrada (404)' };
    }
    
    // 2. Fallback para Puppeteer (Contorno mais robusto para JS Challenges/Cloudflare)
    let browser = null;
    try {
      browser = await puppeteer.launch({ 
          headless: "new",
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      const page = await browser.newPage();
      
      // Timeout longo pois acessos jurídicos podem ser lentos e captchas invisiveis tomam tempo
      page.setDefaultNavigationTimeout(30000); 
      
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      const status = response ? response.status() : null;
      let title = await page.title();
      title = title ? title.trim() : null;
      
      if (status === 404) {
         return { url, status: 'dead', reason: `Erro ${status}` };
      }

      if (status && status >= 200 && status < 400) {
         return { url, status: 'ok', title: title || 'Sem Título' };
      }

      return { url, status: 'unknown', reason: `Status HTTP: ${status}` };

    } catch (pupError) {
      return { url, status: 'unknown', reason: `Inconclusivo (timeout/rede): ${pupError.message}` };
    } finally {
      if (browser) {
          await browser.close();
      }
    }
  }
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Uso: node validate-urls.js <url1> [url2] ...");
        process.exit(1);
    }

    const results = [];
    for (const url of args) {
        // Log para stderr para não poluir o stdout que terá o JSON
        console.error(`Validando URL: ${url}`);
        const res = await validateUrl(url);
        results.push(res);
    }

    // Output estrito em JSON para o stdout (útil para parse das LLMs)
    console.log(JSON.stringify(results, null, 2));
}

// Execução direta a partir do terminal
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
    main().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

export { validateUrl };
