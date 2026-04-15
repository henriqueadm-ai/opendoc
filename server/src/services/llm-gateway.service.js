import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

// Singleton para o SDK da Google
let googleAi = null;

export class LLMGatewayService {
  /**
   * Resolve e instabecia provedores conforme as chaves da Organização.
   * Em produção, isso viria da tabela `ApiKey` criptografada no Prisma publicos.
   */
  static async resolveProviderConfig(organizationId, preferredProvider) {
    // WIP: const keys = await prisma.apiKey.findMany({ where: { organization_id: ... }})
    // Mocking provisório da infraestrutura de chaves
    return {
      provider: preferredProvider || 'GOOGLE',
      apiKey: process.env.GOOGLE_API_KEY || process.env.OPENROUTER_API_KEY || 'dummy_key'
    };
  }

  /**
   * Envia o prompt anonimizado ao LLM solicitado e gerencia fallbacks.
   * Calcula tokens de Input e Output.
   * 
   * @param {number} organizationId O id do inquilino para débito
   * @param {string} prompt O texto já sanitizado e as instruções (Agents prompt)
   * @param {Object} options Configurações de temperature, maxTokens, model
   */
  static async generate(organizationId, prompt, options = {}) {
    // Tenta Google primeiro (Default), com fallback genérico
    const config = await this.resolveProviderConfig(organizationId, options.provider);
    const modelStr = options.model || (config.provider === 'GOOGLE' ? 'gemini-2.5-pro' : 'anthropic/claude-3-haiku');

    console.log(`[LLM Gateway] Enviando Request. Prov: ${config.provider} | Model: ${modelStr}`);

    let responseText = '';
    let tokensUsed = 0;

    try {
      if (config.provider === 'GOOGLE') {
        const result = await this.callGoogle(config.apiKey, modelStr, prompt, options);
        responseText = result.text;
        // Mock estimate as genai SDK doesn't always reliably output tokens directly without counting utility
        tokensUsed = result.usageMetadata?.totalTokenCount || Math.floor((prompt.length + responseText.length) / 4);
      } else {
        const result = await this.callOpenRouter(config.apiKey, modelStr, prompt, options);
        responseText = result.text;
        tokensUsed = result.tokens;
      }
    } catch (e) {
      console.error(`[LLM Gateway] Falha no provider principal:`, e.message);
      throw new Error('Falha no provedor de IA. Fallbacks esgotados.');
    }

    // Cost billing calculation logic: 
    // Ex: R$ 0,02 por 1000 tokens num modelo básico.
    const cost = parseFloat(((tokensUsed / 1000) * 0.02).toFixed(4));
    
    // WIP: Debitar `current_spend` da tabela public.ApiKey 
    
    return {
      text: responseText,
      tokensUsed,
      cost
    };
  }

  static async callGoogle(apiKey, model, prompt, options) {
    if (!googleAi) {
      // API Key deve idealmente ser enviada por inicialização se o env não existir
      googleAi = new GoogleGenAI({ apiKey }); 
    }
    
    const response = await googleAi.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: options.temperature ?? 0.3, // Baixa temperatura para law
      }
    });

    return {
      text: response.text,
      usageMetadata: response.usageMetadata
    };
  }

  static async callOpenRouter(apiKey, model, prompt, options) {
    // Abstração RESTful para OpenAI Compatible endpoint like OpenRouter
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://opendoc.io'
      }
    });

    return {
      text: res.data.choices[0].message.content,
      tokens: res.data.usage?.total_tokens || 0
    };
  }
}
