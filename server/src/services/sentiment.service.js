/**
 * Serviço de análise de sentimento via LLM.
 * Detecta emoções negativas e define se deve escalar para humano.
 */
import { llmGateway } from './llm-gateway.service.js';

const SENTIMENT_PROMPT = `Analise o sentimento da mensagem abaixo de um cliente de escritório jurídico.
Responda APENAS em JSON válido:
{
  "sentiment": "positive" | "neutral" | "negative" | "urgent",
  "emotion": "<emoção principal: medo, raiva, ansiedade, frustração, satisfação, neutro>",
  "shouldEscalate": true | false,
  "confidence": 0.0-1.0,
  "reason": "<razão breve caso shouldEscalate=true>"
}

Regras de escalação:
- sentiment "negative" com confidence > 0.7 → escalar
- sentiment "urgent" → sempre escalar
- Palavras-chave de risco: "processo", "audiência amanhã", "preso", "urgente" → escalar
- Cliente reclamando do atendimento → escalar

MENSAGEM:`;

/**
 * @param {string} message
 * @returns {Promise<{sentiment: string, emotion: string, shouldEscalate: boolean, confidence: number, reason: string}>}
 */
export async function analyzeSentiment(message) {
  try {
    const result = await llmGateway.complete({
      system: 'Você é um analisador de sentimento para escritório jurídico. Responda apenas JSON.',
      user: `${SENTIMENT_PROMPT}\n${message}`,
      maxTokens: 200,
    });

    // Extrair JSON da resposta
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { sentiment: 'neutral', emotion: 'neutro', shouldEscalate: false, confidence: 0.5, reason: '' };
    }
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[SentimentService] Erro:', err.message);
    // Fallback: não escalar se o serviço falhar
    return { sentiment: 'neutral', emotion: 'neutro', shouldEscalate: false, confidence: 0, reason: 'service unavailable' };
  }
}
