#!/usr/bin/env node

/**
 * Conecte.se Design (Visual Law)
 * MCP Server that takes Markdown inputs from the Legal Designer agent and produces
 * high-fidelity, highly scannable PDF documents using Puppeteer and aesthetic CSS.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const puppeteer = require('puppeteer');
const { marked } = require('marked');
const path = require('path');
const fs = require('fs');
const HTMLToDOCX = require('html-to-docx');

// The Root Project Directory
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const PROCESSOS_DIR = path.join(PROJECT_ROOT, 'PROCESSOS');
const ADMIN_DIR = path.join(PROJECT_ROOT, 'ADMINISTRATIVO');
const DATA_FILE = path.join(PROJECT_ROOT, '_conectese/_memory/company/dados.json');

const server = new Server(
  {
    name: 'conectese-design',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Ensures the target output is within the `/PROCESSOS` or `/ADMINISTRATIVO` sandbox.
 */
function getSecureOutputPath(processId, filename) {
  const isAdmin = processId.toUpperCase() === 'ADMINISTRATIVO';
  const safeProcessId = processId.replace(/[^a-zA-Z0-9_-]/g, '');
  
  const baseDir = isAdmin ? ADMIN_DIR : path.join(PROCESSOS_DIR, safeProcessId);
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '');
  return path.join(baseDir, safeFilename);
}

const CSS_TEMPLATE = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      margin: 0;
      padding: 40px;
    }
    
    h1 {
      color: #0b2341;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
      font-size: 24pt;
    }
    
    h2 {
      color: #1c3d5a;
      margin-top: 30px;
      font-size: 18pt;
    }
    
    p {
      margin-bottom: 16px;
      text-align: justify;
    }
    
    blockquote {
      border-left: 5px solid #2779bd;
      background-color: #f8fafc;
      margin: 20px 0;
      padding: 15px 20px;
      font-style: italic;
      color: #3d4852;
      border-radius: 4px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 11pt;
    }
    
    th, td {
      border: 1px solid #dae1e7;
      padding: 12px;
      text-align: left;
    }
    
    th {
      background-color: #f1f5f8;
      color: #22292f;
      font-weight: 600;
    }

    ul, ol {
      margin-bottom: 16px;
      padding-left: 20px;
    }

    li {
      margin-bottom: 8px;
    }

    .footer {
      position: fixed;
      bottom: 20px;
      left: 40px;
      right: 40px;
      font-size: 8pt;
      color: #8795a1;
      border-top: 1px solid #e0e0e0;
      padding-top: 10px;
      text-align: right;
    }
    
    .brand-header {
      text-align: left;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0b2341;
    }

    .brand-header span {
      font-weight: 700;
      font-size: 18pt;
      color: #0b2341;
      letter-spacing: 1px;
    }
  </style>
`;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_visual_law_pdf',
        description: 'Converts Markdown text formatted by the legal-designer into a premium, styled PDF document. Must be used to finalize Visual Law cases. Saves directly to the isolated PROCESSOS folder.',
        inputSchema: {
          type: 'object',
          properties: {
            processId: {
              type: 'string',
              description: 'The internal ID of the process (e.g. P05_04_0001). This dictates the safe output folder.',
            },
            filename: {
              type: 'string',
              description: 'The desired filename for the PDF (e.g. Parecer_Visual_Law.pdf). MUST end in .pdf',
            },
            markdownContent: {
              type: 'string',
              description: 'The full markdown content prepared by the legal-designer agent.',
            },
          },
          required: ['processId', 'filename', 'markdownContent'],
        },
      },
      {
        name: 'generate_visual_law_docx',
        description: 'Converts Markdown text formatted by the legal-designer into a styled Word Document (.docx). Saves directly to the isolated PROCESSOS folder.',
        inputSchema: {
          type: 'object',
          properties: {
            processId: {
              type: 'string',
              description: 'The internal ID of the process (e.g. P05_04_0001). This dictates the safe output folder.',
            },
            filename: {
              type: 'string',
              description: 'The desired filename for the DOCX (e.g. Parecer_Visual_Law.docx). MUST end in .docx',
            },
            markdownContent: {
              type: 'string',
              description: 'The full markdown content prepared by the legal-designer agent.',
            },
          },
          required: ['processId', 'filename', 'markdownContent'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'generate_visual_law_pdf': {
      const { processId, filename, markdownContent } = request.params.arguments;

      if (!filename.endsWith('.pdf')) {
        throw new Error("Filename must end with .pdf");
      }

      // Read Company Profile if available
      let companyProfile = { officeName: 'CONECTE.SE', oab: '', logoUrl: '', whatsapp: '', address: '' };
      if (fs.existsSync(DATA_FILE)) {
        try {
          companyProfile = { ...companyProfile, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) };
        } catch(e) {}
      }

      // Convert Markdown to HTML
      const htmlContent = marked.parse(markdownContent);

      const headerHtml = companyProfile.logoUrl 
        ? `<img src="${companyProfile.logoUrl}" style="height: 45px; margin-bottom: 10px;" alt="Logo" /><br>`
        : '';
        
      const officeTitle = companyProfile.officeName || 'Escritório';
      const oabText = companyProfile.oab ? ` | OAB ${companyProfile.oab}` : '';

      // Assemble final HTML with CSS
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          ${CSS_TEMPLATE}
        </head>
        <body>
          <div class="brand-header">
            ${headerHtml}
            <span>${officeTitle}</span>${oabText}
          </div>
          
          <div class="content">
            ${htmlContent}
          </div>
          
          <div class="footer">
            Gerado por Conecte.se Intelligence - ${processId} <br>
            ${companyProfile.address ? companyProfile.address.substring(0,60) + ' | ' : ''} Contato: ${companyProfile.whatsapp}
          </div>
        </body>
        </html>
      `;

      // Resolve safe path
      const outputPath = getSecureOutputPath(processId, filename);

      let browser;
      try {
        // Launch puppeteer in headless mode with optimizations
        browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        });
        
        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        
        // Print to PDF
        await page.pdf({
          path: outputPath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20px',
            bottom: '40px',
            left: '20px',
            right: '20px'
          }
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ Visual Law PDF successfully generated and saved to: ${outputPath}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error generating PDF: ${error.message}`,
            },
          ],
          isError: true,
        };
      } finally {
        if (browser) await browser.close();
      }
    }

    case 'generate_visual_law_docx': {
      const { processId, filename, markdownContent } = request.params.arguments;

      if (!filename.endsWith('.docx')) {
        throw new Error("Filename must end with .docx");
      }

      // Read Company Profile if available
      let companyProfile = { officeName: 'CONECTE.SE', oab: '', logoUrl: '', whatsapp: '', address: '' };
      if (fs.existsSync(DATA_FILE)) {
        try {
          companyProfile = { ...companyProfile, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) };
        } catch(e) {}
      }

      // Convert Markdown to HTML
      const htmlContent = marked.parse(markdownContent);

      const headerHtml = companyProfile.logoUrl 
        ? `<img src="${companyProfile.logoUrl}" style="height: 45px; margin-bottom: 10px;" alt="Logo" /><br>`
        : '';
        
      const officeTitle = companyProfile.officeName || 'Escritório';
      const oabText = companyProfile.oab ? ` | OAB ${companyProfile.oab}` : '';

      // Assemble final HTML with inline CSS for DOCX
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          ${CSS_TEMPLATE}
        </head>
        <body>
          <div style="text-align: left; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #0b2341;">
            ${headerHtml}
            <span style="font-weight: 700; font-size: 18pt; color: #0b2341; letter-spacing: 1px;">${officeTitle}</span>${oabText}
          </div>
          
          <div>
            ${htmlContent}
          </div>
          
          <div style="margin-top: 40px; font-size: 8pt; color: #8795a1; border-top: 1px solid #e0e0e0; padding-top: 10px; text-align: right;">
            Gerado por Conecte.se Intelligence - ${processId} <br>
            ${companyProfile.address ? companyProfile.address.substring(0,60) + ' | ' : ''} Contato: ${companyProfile.whatsapp}
          </div>
        </body>
        </html>
      `;

      // Resolve safe path
      const outputPath = getSecureOutputPath(processId, filename);

      try {
        const fileBuffer = await HTMLToDOCX(fullHtml, null, {
          table: { row: { cantSplit: true } },
          footer: true,
          pageNumber: true
        });
        
        fs.writeFileSync(outputPath, fileBuffer);
        return {
          content: [
            {
              type: 'text',
              text: `✅ Documento DOCX gerado com sucesso em: ${outputPath}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Erro ao gerar DOCX: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    default:
      throw new Error('Unknown tool');
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('conectese-design MCP server running on stdio');
}

run().catch(console.error);
