import crypto from 'crypto';

/**
 * Anonymizer Service
 * Local-First PII purification. Dados entram brutos na memória e saem anonimizados.
 * Dicionário é criptografado AES-256-GCM em repouso.
 */
export class AnonymizerService {
  
  static ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Deve ter obrigatórios 32 bytes hex
  static ALGORITHM = 'aes-256-gcm';

  /**
   * Anonimiza o texto bruto e armazena o dicionário criptografado.
   * 
   * @param {Object} tenantPrisma Instância conectada ao tenant schema
   * @param {number} processId O ID do processo
   * @param {string} rawText O texto extraido bruto via OCR/PDF-Parse
   * @returns {string} O texto protegido (com placeholders)
   */
  static async anonymizeText(tenantPrisma, processId, rawText) {
    if (!rawText) return '';

    // WIP: Em produção, usaríamos abordagens combinadas (Regex Patterns robustos + NER Machine Learning).
    // Para simplificar a fundação arquitetural, criaremos detecção de Email, CPF estrito, etc.
    let anonymizedText = rawText;
    const dictionary = {};
    let pessoaCounter = 1;
    let cpfCounter = 1;

    // Regras Fake: Detecta emails
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    anonymizedText = anonymizedText.replace(emailRegex, (match) => {
      const ph = `[PESSOA_${pessoaCounter++}]`;
      dictionary[ph] = match;
      return ph;
    });

    // WIP: Detecta CPFs
    const cpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
    anonymizedText = anonymizedText.replace(cpfRegex, (match) => {
      const ph = `[CPF_${cpfCounter++}]`;
      dictionary[ph] = match;
      return ph;
    });

    // Registra no dicionário no Prisma caso matches tenham ocorrido
    if (Object.keys(dictionary).length > 0) {
      await this.saveDictionary(tenantPrisma, processId, dictionary);
    }

    return anonymizedText;
  }

  /**
   * Restaura (de-anonimiza) o documento final substituindo de volta os dados reais antes do Export.
   */
  static async restoreText(tenantPrisma, processId, anonymizedText) {
    const dict = await this.readDictionary(tenantPrisma, processId);
    if (!dict) return anonymizedText;

    let restoredText = anonymizedText;
    for (const [placeholder, realValue] of Object.entries(dict)) {
      // replaceAll ou regex global. placeholder tem colchetes, requer escape
      const escapedPh = placeholder.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
      const phRegex = new RegExp(escapedPh, 'g');
      restoredText = restoredText.replace(phRegex, realValue);
    }

    return restoredText;
  }

  /**
   * Criptografa e salva na base AES-256-GCM.
   */
  static async saveDictionary(tenantPrisma, processId, dictionary) {
    // Caso de uso: processId só pode ter um dicionario per pipeline. Usa upsert se necessário (re-rolls).
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY, 'hex'), iv);
    
    // Criptografa o JSON string do dic
    let encryptedDict = cipher.update(JSON.stringify(dictionary), 'utf8', 'hex');
    encryptedDict += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex'); // GCM requires AuthTag
    
    // Save as: IV:encryptedText:AuthTag for easier splitting during decryption
    const finalStoredBlob = `${iv.toString('hex')}:${encryptedDict}:${authTag}`;

    await tenantPrisma.anonymizationDict.upsert({
      where: { process_id: processId },
      update: {
        encrypted_dict: finalStoredBlob,
        iv: iv.toString('hex')
      },
      create: {
        process_id: processId,
        encrypted_dict: finalStoredBlob,
        iv: iv.toString('hex')
      }
    });
  }

  /**
   * Obtém, decripta e devolve o POJO dictionary para RAM.
   */
  static async readDictionary(tenantPrisma, processId) {
    const record = await tenantPrisma.anonymizationDict.findUnique({
      where: { process_id: processId }
    });

    if (!record) return null;

    const [ivHex, encryptedText, authTagHex] = record.encrypted_dict.split(':');
    
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM, 
      Buffer.from(this.ENCRYPTION_KEY, 'hex'), 
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}
