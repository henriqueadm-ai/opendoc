import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { tenantResolver } from '../middlewares/tenant.middleware.js';

const router = Router();
router.use(requireAuth, tenantResolver);

// ─────────────────────────────────────────────────────────
// GET /api/analytics/productivity — métricas de produtividade
// ─────────────────────────────────────────────────────────
router.get('/productivity', async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from && to) {
      dateFilter.created_at = { gte: new Date(from), lte: new Date(to) };
    }

    // Total de processos
    const totalProcesses = await req.tenantPrisma.process.count({ where: dateFilter });

    // Processos concluídos
    const completedProcesses = await req.tenantPrisma.process.count({
      where: { ...dateFilter, status: 'COMPLETED' },
    });

    // Processos por tipo
    const byType = await req.tenantPrisma.process.groupBy({
      by: ['type'],
      _count: true,
      where: dateFilter,
    });

    // Token consumption
    const tokenData = await req.tenantPrisma.process.aggregate({
      _sum: { total_tokens: true, total_cost: true },
      where: dateFilter,
    });

    // Processos por usuário (top 10)
    const byUser = await req.tenantPrisma.process.groupBy({
      by: ['created_by'],
      _count: true,
      where: dateFilter,
      orderBy: { _count: { created_by: 'desc' } },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        total_processes: totalProcesses,
        completed_processes: completedProcesses,
        completion_rate: totalProcesses > 0 ? ((completedProcesses / totalProcesses) * 100).toFixed(1) : '0',
        by_type: byType,
        by_user: byUser,
        tokens: {
          total: tokenData._sum.total_tokens || 0,
          cost: parseFloat(tokenData._sum.total_cost || 0),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/analytics/token-costs — custos de token por provider
// ─────────────────────────────────────────────────────────
router.get('/token-costs', async (req, res) => {
  try {
    // Agregar por stages (que carregam agent_name ~ provider hint)
    const stages = await req.tenantPrisma.pipelineStage.groupBy({
      by: ['agent_name'],
      _sum: { tokens_used: true, cost: true },
      _count: true,
      orderBy: { _sum: { cost: 'desc' } },
    });

    const total = stages.reduce((a, s) => a + parseFloat(s._sum.cost || 0), 0);

    res.json({
      success: true,
      data: {
        by_agent: stages.map(s => ({
          agent: s.agent_name,
          tokens: s._sum.tokens_used || 0,
          cost: parseFloat(s._sum.cost || 0),
          runs: s._count,
        })),
        total_cost: total,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
