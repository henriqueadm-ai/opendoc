import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { tenantResolver } from '../middlewares/tenant.middleware.js';

const router = Router();
router.use(requireAuth, tenantResolver);

// ─────────────────────────────────────────────────────────
// POST /api/transfers — transferir processo Light→PRO
// ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { process_id, coordinator_id } = req.body;
    if (!process_id || !coordinator_id) {
      return res.status(400).json({ error: 'process_id and coordinator_id are required' });
    }

    // Verificar que o processo pertence ao usuário
    const process = await req.tenantPrisma.process.findFirst({
      where: { id: parseInt(process_id), created_by: req.user.sub },
    });
    if (!process) {
      return res.status(404).json({ error: 'Process not found or unauthorized' });
    }
    if (process.status !== 'COMPLETED' && process.status !== 'DISCUSSION') {
      return res.status(400).json({ error: 'Process must be COMPLETED or in DISCUSSION to transfer' });
    }

    // Atualizar o processo
    const updated = await req.tenantPrisma.process.update({
      where: { id: parseInt(process_id) },
      data: {
        status: 'TRANSFERRED',
        assigned_to: parseInt(coordinator_id),
      },
    });

    // Registrar no audit log
    await req.tenantPrisma.auditLog.create({
      data: {
        process_id: parseInt(process_id),
        event_type: 'TRANSFER',
        description: `Processo transferido de user ${req.user.sub} para coordenador ${coordinator_id}`,
        hash: '',  // Hash será calculado pelo audit service
        user_id: req.user.sub,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/transfers/received — processos recebidos por transferência
// ─────────────────────────────────────────────────────────
router.get('/received', async (req, res) => {
  try {
    const processes = await req.tenantPrisma.process.findMany({
      where: {
        assigned_to: req.user.sub,
        status: 'TRANSFERRED',
      },
      orderBy: { updated_at: 'desc' },
    });
    res.json({ success: true, data: processes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
