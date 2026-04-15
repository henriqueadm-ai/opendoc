#!/usr/bin/env node

/**
 * parse-doc.js
 * 
 * Script utilitário integrado à skill document-analyzer.
 * Recebe o caminho de um PDF e extrai o texto bruto para que os
 * agentes possam processá-lo estruturalmente.
 * Fallback embutido com Google Gemini Vision para PDF achatados.
 */

import fs from 'fs/promises';
import path from 'path';
import * as pdfParse from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

async function parsePDF(filePath, useVision = false, extractPrompt = null) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const dataBuffer = await fs.readFile(absolutePath);
    
    // Tentativa 1: Parseia o PDF rapidamente via pdf-parse nativo
    let parsedText = '';
    let numpages = 0;
    
    if (!useVision) {
       const parser = typeof pdfParse.default === 'function' ? pdfParse.default : (pdfParse.pdf || pdfParse.extract || pdfParse);
       try {
           const data = await parser(dataBuffer);
           parsedText = data.text.replace(/\s+\n/g, '\n').trim();
           numpages = data.numpages;
       } catch (err) {
           console.error("Aviso: pdf-parse falhou (limitação estrutural do arquivo). Fallback automático requisitado.");
           parsedText = '';
       }
    }

    // Threshold de segurança: Se retornou pouquíssimo texto, possivelmente é uma imagem/escaneado
    const isImagePdf = parsedText.length < 50;

    let visionText = null;
    let strategy = 'pdf-parse';

    if (useVision || isImagePdf) {
        strategy = 'gemini-vision';
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Arquivo escaneado detectado ou flag --vision usada, mas GEMINI_API_KEY não localizada.");
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        let prompt = "Extract all readable text from this document exactly as it is presented. Remove any unnecessary formatting output and just output raw text.";
        if (extractPrompt) {
            prompt = extractPrompt;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: dataBuffer.toString("base64"),
                        mimeType: "application/pdf"
                    }
                }
            ]
        });
        visionText = response.text;
    }

    const finalResult = {
      success: true,
      file: filePath,
      strategy,
      numpages: numpages || 'unknown',
      text: visionText || parsedText
    };
    
    console.log(JSON.stringify(finalResult, null, 2));

  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message || 'Erro crítico ao processar o arquivo.',
      file: filePath
    }, null, 2));
    process.exit(1);
  }
}

const args = process.argv.slice(2);
let filePath = null;
let useVision = false;
let extractPrompt = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--vision') {
        useVision = true;
    } else if (args[i].startsWith('--extract=')) {
        extractPrompt = args[i].split('=')[1];
        useVision = true;
    } else {
        filePath = args[i];
    }
}

if (!filePath) {
  console.error("Uso: node parse-doc.js <pdf-path> [--vision] [--extract=\"Prompt json custom\"]");
  process.exit(1);
}

parsePDF(filePath, useVision, extractPrompt);