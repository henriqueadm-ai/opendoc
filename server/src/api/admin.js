import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { checkPermissions } from '../middlewares/rbac.middleware.js';
import { createInvite } from '../services/auth.service.js';
import { completeOnboarding } from '../services/organization.service.js';

const globalPrisma = new PrismaClient();
const router = Router();

// Todas as rotas admin exigem ADMIN role
router.use(requireAuth);
router.use(checkPermissions({ roles: ['ADMIN'] }));

// ─────────────────────────────────────────────
// GET /api/admin/org — dados da organização
// ─────────────────────────────────────────────
router.get('/org', async (req, res) => {
  try {
    const org = await globalPrisma.organization.findUnique({
      where: { id: req.user.org_id },
      include: { _count: { select: { users: true } } }
    });
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/admin/org — atualizar organização
// ─────────────────────────────────────────────
router.put('/org', async (req, res) => {
  try {
    const { name, logo_url, colors } = req.body;
    const org = await globalPrisma.organization.update({
      where: { id: req.user.org_id },
      data: {
        ...(name && { name }),
        ...(logo_url !== undefined && { logo_url }),
        ...(colors && { colors })
      }
    });
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/admin/org/onboarding-complete
// ─────────────────────────────────────────────
router.post('/org/onboarding-complete', async (req, res) => {
  try {
    const org = await completeOnboarding(req.user.org_id);
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/users — listar usuários da org
// ─────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await globalPrisma.user.findMany({
      where: { organization_id: req.user.org_id },
      select: {
        id: true, email: true, role: true, plan: true,
        oab_number: true, totp_enabled: true, created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/users/:id — remover usuário
// ─────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    // Impedir auto-deleção
    if (userId === req.user.sub) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    // Verificar que o user pertence à org
    const user = await globalPrisma.user.findFirst({
      where: { id: userId, organization_id: req.user.org_id }
    });
    if (!user) return res.status(404).json({ error: 'User not found in this organization' });

    await globalPrisma.user.delete({ where: { id: userId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/admin/users/invite — convidar usuário
// ─────────────────────────────────────────────
router.post('/users/invite', async (req, res) => {
  try {
    const { email, role, plan } = req.body;
    if (!email || !role || !plan) {
      return res.status(400).json({ error: 'email, role, and plan are required' });
    }
    const token = await createInvite({
      email,
      orgId: req.user.org_id,
      role,
      plan
    });
    res.status(201).json({ success: true, data: { inviteToken: token } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/invites — listar convites pendentes
// ─────────────────────────────────────────────
router.get('/invites', async (req, res) => {
  try {
    const invites = await globalPrisma.invite.findMany({
      where: {
        organization_id: req.user.org_id,
        used: false,
        expires_at: { gt: new Date() }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: invites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
