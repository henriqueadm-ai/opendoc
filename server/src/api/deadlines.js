import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { tenantResolver } from '../middlewares/tenant.middleware.js';

const router = Router();
router.use(requireAuth, tenantResolver);

// ─────────────────────────────────────────────────────────
// GET /api/deadlines — listar prazos (filtro por mês/status)
// ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const where = {};
    
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.due_date = { gte: start, lte: end };
    }
    if (status) where.status = status;

    const deadlines = await req.tenantPrisma.deadline.findMany({
      where,
      include: { process: { select: { id: true, case_id: true, type: true } } },
      orderBy: { due_date: 'asc' },
    });
    res.json({ success: true, data: deadlines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/deadlines — criar prazo
// ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { process_id, title, description, due_date, priority } = req.body;
    if (!process_id || !title || !due_date) {
      return res.status(400).json({ error: 'process_id, title, and due_date are required' });
    }
    const deadline = await req.tenantPrisma.deadline.create({
      data: {
        process_id: parseInt(process_id),
        title,
        description: description || null,
        due_date: new Date(due_date),
        priority: priority || 'NORMAL',
        created_by: req.user.sub,
      },
    });
    res.status(201).json({ success: true, data: deadline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/deadlines/:id — atualizar prazo
// ─────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, due_date, priority, status } = req.body;
    const deadline = await req.tenantPrisma.deadline.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(due_date && { due_date: new Date(due_date) }),
        ...(priority && { priority }),
        ...(status && { status }),
      },
    });
    res.json({ success: true, data: deadline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/deadlines/:id
// ─────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await req.tenantPrisma.deadline.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/deadlines/upcoming — próximos 7 dias
// ─────────────────────────────────────────────────────────
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const deadlines = await req.tenantPrisma.deadline.findMany({
      where: {
        due_date: { gte: now, lte: nextWeek },
        status: 'PENDING',
      },
      include: { process: { select: { id: true, case_id: true, type: true } } },
      orderBy: { due_date: 'asc' },
    });
    res.json({ success: true, data: deadlines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
