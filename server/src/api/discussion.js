import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { tenantResolver } from '../middlewares/tenant.middleware.js';
import { llmGateway } from '../services/llm-gateway.service.js';

const router = Router({ mergeParams: true });
router.use(requireAuth, tenantResolver);

// ─────────────────────────────────────────────────────────
// GET /api/processes/:id/discussion — histórico de mensagens
// ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const processId = parseInt(req.params.id);
    const messages = await req.tenantPrisma.discussion.findMany({
      where: { process_id: processId },
      orderBy: { created_at: 'asc' },
    });
    
    // Buscar o rascunho atual do processo
    const process = await req.tenantPrisma.process.findUnique({
      where: { id: processId },
      select: { id: true, type: true, brief: true, status: true },
    });
    
    res.json({ success: true, data: { process, messages } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/processes/:id/discussion — enviar mensagem humana → IA responde
// ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const processId = parseInt(req.params.id);
    const { message, current_draft } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    // 1. Salvar mensagem humana
    await req.tenantPrisma.discussion.create({
      data: { process_id: processId, sender: 'HUMAN', message },
    });

    // 2. Montar contexto para a IA
    const history = await req.tenantPrisma.discussion.findMany({
      where: { process_id: processId },
      orderBy: { created_at: 'asc' },
      take: 20, // últimas 20 trocas
    });

    const historyText = history
      .map(m => `${m.sender === 'HUMAN' ? 'Advogado' : 'IA'}: ${m.message}`)
      .join('\n');

    const systemPrompt = `Você é um assistente jurídico especializado na revisão colaborativa de peças processuais brasileiras.
Sua função é analisar o rascunho atual e as orientações do advogado e sugerir melhorias precisas.
Quando sugerir uma edição textual, apresente-a assim:
DIFF_OLD: <trecho original>
DIFF_NEW: <trecho sugerido>
Seja objetivo, técnico e direto. Cite fundamentos legais quando pertinente.`;

    const userPrompt = `RASCUNHO ATUAL DA PEÇA:\n${current_draft || '[rascunho não fornecido]'}\n\nHISTÓRICO DA DISCUSSÃO:\n${historyText}\n\nÚLTIMA MENSAGEM DO ADVOGADO: ${message}`;

    // 3. Chamar LLM
    let aiResponse = '';
    let diffOld = null;
    let diffNew = null;

    try {
      const result = await llmGateway.complete({
        system: systemPrompt,
        user: userPrompt,
        maxTokens: 1000,
      });
      aiResponse = result.text;

      // Extrair diff se presente
      const diffOldMatch = aiResponse.match(/DIFF_OLD:\s*(.+?)(?=DIFF_NEW:|$)/s);
      const diffNewMatch = aiResponse.match(/DIFF_NEW:\s*(.+?)(?=\n\n|$)/s);
      if (diffOldMatch) diffOld = diffOldMatch[1].trim();
      if (diffNewMatch) diffNew = diffNewMatch[1].trim();
    } catch (llmErr) {
      aiResponse = 'Serviço de IA temporariamente indisponível. Tente novamente em instantes.';
    }

    // 4. Salvar resposta da IA
    const aiMessage = await req.tenantPrisma.discussion.create({
      data: {
        process_id: processId,
        sender: 'AI',
        message: aiResponse,
        diff_old: diffOld,
        diff_new: diffNew,
        diff_status: diffOld ? 'PENDING' : null,
      },
    });

    res.status(201).json({ success: true, data: aiMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/processes/:id/discussion/:msgId/diff — aceitar/rejeitar diff
// ─────────────────────────────────────────────────────────
router.put('/:msgId/diff', async (req, res) => {
  try {
    const msgId = parseInt(req.params.msgId);
    const { action } = req.body; // 'ACCEPTED' | 'REJECTED'
    if (!['ACCEPTED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ error: 'action must be ACCEPTED or REJECTED' });
    }
    const msg = await req.tenantPrisma.discussion.update({
      where: { id: msgId },
      data: { diff_status: action },
    });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
