import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { tenantResolver } from '../middlewares/tenant.middleware.js';

const router = Router();
router.use(requireAuth, tenantResolver);

// ─────────────────────────────────────────────────────────
// GET /api/financials — fluxo de caixa por período
// ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) {
      where.created_at = { gte: new Date(from), lte: new Date(to) };
    }

    const fees = await req.tenantPrisma.fee.findMany({
      where,
      include: { process: { select: { id: true, case_id: true, type: true } } },
      orderBy: { created_at: 'desc' },
    });

    // Calcular totais
    const honorarios = fees.filter(f => f.type === 'HONORARIO');
    const custas = fees.filter(f => ['CUSTA', 'TAXA'].includes(f.type));

    const totalReceitas = honorarios.reduce((a, f) => a + parseFloat(f.amount), 0);
    const totalDespesas = custas.reduce((a, f) => a + parseFloat(f.amount), 0);

    res.json({
      success: true,
      data: {
        fees,
        summary: {
          total_receitas: totalReceitas,
          total_despesas: totalDespesas,
          saldo: totalReceitas - totalDespesas,
          count: fees.length,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/financials — registrar honorário ou custa
// ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { process_id, type, description, amount, due_date } = req.body;
    if (!process_id || !type || !description || amount === undefined) {
      return res.status(400).json({ error: 'process_id, type, description, and amount are required' });
    }
    const fee = await req.tenantPrisma.fee.create({
      data: {
        process_id: parseInt(process_id),
        type,
        description,
        amount: parseFloat(amount),
        due_date: due_date ? new Date(due_date) : null,
        created_by: req.user.sub,
      },
    });
    res.status(201).json({ success: true, data: fee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/financials/:id/pay — marcar como pago
// ─────────────────────────────────────────────────────────
router.put('/:id/pay', async (req, res) => {
  try {
    const fee = await req.tenantPrisma.fee.update({
      where: { id: parseInt(req.params.id) },
      data: { paid: true },
    });
    res.json({ success: true, data: fee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/financials/:id
// ─────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await req.tenantPrisma.fee.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
