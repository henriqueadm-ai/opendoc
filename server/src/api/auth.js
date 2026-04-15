import { Router } from 'express';
import {
  createInvite,
  acceptInvite,
  verifyCredentials,
  verifyTOTP,
  generateTOTPSecret,
  confirmTOTPSetup
} from '../services/auth.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { checkPermissions } from '../middlewares/rbac.middleware.js';

const router = Router();

// ─────────────────────────────────────────────
// POST /api/auth/register — aceitar convite
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const user = await acceptInvite({ token, password });
    res.status(201).json({
      success: true,
      data: { id: user.id, email: user.email, role: user.role, plan: user.plan }
    });
  } catch (err) {
    const status = err.message.includes('expired') ? 410 : 400;
    res.status(status).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login — credenciais (step 1)
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await verifyCredentials(email, password);
    // Retorna userId para o step 2 (TOTP)
    res.json({ success: true, data: { userId: result.userId, requires2FA: true } });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/verify-2fa — TOTP (step 2)
// ─────────────────────────────────────────────
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ error: 'userId and code are required' });
    }
    const tokens = await verifyTOTP(userId, code);
    res.json({ success: true, data: tokens });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/2fa/setup — gerar QR (auth required)
// ─────────────────────────────────────────────
router.post('/2fa/setup', requireAuth, async (req, res) => {
  try {
    const result = await generateTOTPSecret(req.user.sub);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/2fa/confirm — confirmar TOTP
// ─────────────────────────────────────────────
router.post('/2fa/confirm', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    const result = await confirmTOTPSetup(req.user.sub, code);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/invite — criar convite (ADMIN only)
// ─────────────────────────────────────────────
router.post('/invite',
  requireAuth,
  checkPermissions({ roles: ['ADMIN'] }),
  async (req, res) => {
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
  }
);

export default router;
