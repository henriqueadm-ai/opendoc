import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { tenantResolver } from '../middlewares/tenant.middleware.js';
import { llmGateway } from '../services/llm-gateway.service.js';
import { analyzeSentiment } from '../services/sentiment.service.js';

const router = Router();

// ─────────────────────────────────────────────────────────
// POST /api/whatsapp/webhook — recebe mensagem do WhatsApp Business API
// (rota pública — validada por token de verificação)
// ─────────────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  try {
    const { from, message, orgId, channel } = req.body;
    if (!from || !message || !orgId) {
      return res.status(400).json({ error: 'from, message, and orgId are required' });
    }

    // 1. Analisar sentimento
    const sentiment = await analyzeSentiment(message);

    // 2. Se deve escalar, criar registro de escalação
    if (sentiment.shouldEscalate) {
      // Nota: em produção, tenantPrisma seria resolvido pelo orgId do webhook
      res.status(200).json({
        success: true,
        action: 'ESCALATED',
        sentiment,
        reply: `Entendo sua situação e quero ajudar. Estou encaminhando sua mensagem para seu advogado responsável, que entrará em contato em breve. 🙏`,
      });
      return;
    }

    // 3. Responder via RAG (simulado — em produção, consulta embeddings)
    let aiReply = '';
    try {
      const result = await llmGateway.complete({
        system: `Você é o assistente virtual de um escritório de advocacia. 
Responda de forma profissional, empática e objetiva.
Se não souber a resposta, diga que vai encaminhar para o advogado responsável.
Nunca invente informações sobre processos ou prazos.
Formato: WhatsApp (use emojis moderadamente, parágrafos curtos).`,
        user: `Cliente pergunta: ${message}`,
        maxTokens: 300,
      });
      aiReply = result.text;
    } catch (err) {
      aiReply = 'No momento não consigo acessar as informações do seu caso. Vou encaminhar sua mensagem para o advogado responsável. 📋';
    }

    res.status(200).json({
      success: true,
      action: 'AI_REPLIED',
      sentiment,
      reply: aiReply,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/whatsapp/webhook — verificação do Meta Webhook
// ─────────────────────────────────────────────────────────
router.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'opendoc_verify_2026';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/whatsapp/conversations — listar conversas escaladas (auth required)
// ─────────────────────────────────────────────────────────
router.get('/conversations', requireAuth, tenantResolver, async (req, res) => {
  try {
    const conversations = await req.tenantPrisma.conversation.findMany({
      where: { status: { in: ['ESCALATED', 'ACTIVE'] } },
      orderBy: { updated_at: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/whatsapp/conversations/:id/reply — coordenador responde
// ─────────────────────────────────────────────────────────
router.post('/conversations/:id/reply', requireAuth, tenantResolver, async (req, res) => {
  try {
    const convId = parseInt(req.params.id);
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    // Salvar resposta do coordenador
    const msg = await req.tenantPrisma.conversationMessage.create({
      data: {
        conversation_id: convId,
        sender: 'HUMAN',
        message,
        user_id: req.user.sub,
      },
    });

    // Em produção: enviar via WhatsApp Business API
    // await whatsappApi.sendMessage(conversation.client_phone, message);

    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
