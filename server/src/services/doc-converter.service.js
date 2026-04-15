import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

export class DocConverterService {
  /**
   * Converte múltiplos documentos na RAM (Buffers) em texto estruturado bruto.
   * 
   * @param {Array} documents Array contendo objetos com info do arquivo
   * @param {Array} fileBuffers Array associado de buffers processados pelo multer
   * @returns {string} O texto agrupado consolidado pronto para anonimização
   */
  static async convertProcessDocuments(documents, fileBuffers) {
    if (documents.length !== fileBuffers.length) {
      throw new Error('Divergência entre metadados de documento e buffers em memória.');
    }

    let consolidatedText = '';

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const buffer = fileBuffers[i];
      
      console.log(`[Doc Converter] Extraindo texto de Documento: ${doc.filename} (${doc.mime_type})`);
      
      let text = '';
      try {
        if (doc.mime_type === 'application/pdf') {
          text = await this.extractFromPdf(buffer);
        } else if (doc.mime_type.startsWith('image/')) {
          text = await this.extractFromImage(buffer);
        } else if (doc.mime_type === 'text/plain') {
          text = buffer.toString('utf8');
        } else {
          // Fallback para tipos não suportados
          text = `[CONTEUDO_NAO_EXTRAIVEL: ${doc.filename}]`;
        }
      } catch (e) {
        console.error(`[Doc Converter] Erro ao extrair texto do documento ${doc.filename}:`, e);
        // Exibimos notificação de falha mas permitimos retomada dependendo do processo de negócio
        text = `[FALHA_NA_EXTRAÇÃO: Verificar integridade do arquivo ${doc.filename}]`;
      }

      consolidatedText += `\n\n--- INÍCIO DO DOCUMENTO: ${doc.filename} ---\n`;
      consolidatedText += text;
      consolidatedText += `\n--- FIM DO DOCUMENTO: ${doc.filename} ---\n`;
    }

    return consolidatedText;
  }

  /**
   * Extração de texto de PDF.
   */
  static async extractFromPdf(buffer) {
    // pdf-parse requer um buffer de dados e lida com o parse raw.
    // WIP: Para scanned PDFs, seria necessário renderizar e jogar no OCR.
    // Estamos assumindo PDFs com text layer para fundação minimalista.
    const data = await pdfParse(buffer);
    return data.text;
  }

  /**
   * Extração de texto de Imagem usando processamento local de OCR (Tesseract.js).
   */
  static async extractFromImage(buffer) {
    // Tesseract suporta Buffer diretamente. O worker roda localmente por padrão.
    // Aviso de Memória: Em produção, o tesseract pode escalar o uso da ram para chunks longos,
    // podendo necessitar otimização.
    const { data: { text } } = await Tesseract.recognize(
      buffer,
      'por', // Português
      { logger: m => {} } // silenciar os progress logs
    );
    
    return text;
  }
}
