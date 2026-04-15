import { Router } from 'express';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { tenantResolver } from '../middlewares/tenant.middleware.js';
import { checkPermissions } from '../middlewares/rbac.middleware.js';

const router = Router();

// Todas as rotas exigem ADMIN
router.use(requireAuth, tenantResolver, checkPermissions({ roles: ['ADMIN'] }));

// ─────────────────────────────────────────────────────────
// Helpers de crypto
// ─────────────────────────────────────────────────────────
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');

function encryptKey(plaintext) {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    encrypted_key: Buffer.concat([encrypted, authTag]).toString('hex'),
    iv: iv.toString('hex'),
  };
}

function decryptKey(encryptedHex, ivHex) {
  const data = Buffer.from(encryptedHex, 'hex');
  const encrypted = data.slice(0, -16);
  const authTag = data.slice(-16);
  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

function maskKey(plaintext) {
  if (plaintext.length <= 8) return '•'.repeat(plaintext.length);
  return plaintext.slice(0, 4) + '•'.repeat(Math.min(20, plaintext.length - 8)) + plaintext.slice(-4);
}

// ─────────────────────────────────────────────────────────
// GET /api/settings/api-keys — listar chaves (mascaradas)
// ─────────────────────────────────────────────────────────
router.get('/api-keys', async (req, res) => {
  try {
    const keys = await req.tenantPrisma.apiKey.findMany({
      orderBy: { created_at: 'desc' },
    });
    const masked = keys.map(k => ({
      id: k.id,
      provider: k.provider,
      alias: k.alias,
      is_active: k.is_active,
      masked_key: maskKey(decryptKey(k.encrypted_key, k.iv)),
      last_used_at: k.last_used_at,
      created_at: k.created_at,
    }));
    res.json({ success: true, data: masked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/settings/api-keys — adicionar chave
// ─────────────────────────────────────────────────────────
router.post('/api-keys', async (req, res) => {
  try {
    const { provider, plaintext_key, alias } = req.body;
    if (!provider || !plaintext_key) {
      return res.status(400).json({ error: 'provider and plaintext_key are required' });
    }
    const { encrypted_key, iv } = encryptKey(plaintext_key);
    const key = await req.tenantPrisma.apiKey.create({
      data: { provider, encrypted_key, iv, alias: alias || null },
    });
    res.status(201).json({
      success: true,
      data: { id: key.id, provider: key.provider, alias: key.alias, masked_key: maskKey(plaintext_key) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/settings/api-keys/:id — ativar/desativar
// ─────────────────────────────────────────────────────────
router.put('/api-keys/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { is_active, alias } = req.body;
    const key = await req.tenantPrisma.apiKey.update({
      where: { id },
      data: {
        ...(is_active !== undefined && { is_active }),
        ...(alias !== undefined && { alias }),
      },
    });
    res.json({ success: true, data: { id: key.id, is_active: key.is_active, alias: key.alias } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/settings/api-keys/:id — remover chave
// ─────────────────────────────────────────────────────────
router.delete('/api-keys/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await req.tenantPrisma.apiKey.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/settings/branding — ler TenantSettings
// ─────────────────────────────────────────────────────────
router.get('/branding', async (req, res) => {
  try {
    let settings = await req.tenantPrisma.tenantSettings.findFirst();
    if (!settings) {
      // Criar singleton padrão na primeira chamada
      settings = await req.tenantPrisma.tenantSettings.create({ data: { id: 1 } });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/settings/branding — atualizar TenantSettings
// ─────────────────────────────────────────────────────────
router.put('/branding', async (req, res) => {
  try {
    const { primary_color, logo_url, org_name, disclaimer_text } = req.body;
    const settings = await req.tenantPrisma.tenantSettings.upsert({
      where: { id: 1 },
      update: {
        ...(primary_color && { primary_color }),
        ...(logo_url !== undefined && { logo_url }),
        ...(org_name && { org_name }),
        ...(disclaimer_text && { disclaimer_text }),
      },
      create: {
        id: 1,
        ...(primary_color && { primary_color }),
        ...(logo_url && { logo_url }),
        ...(org_name && { org_name }),
        ...(disclaimer_text && { disclaimer_text }),
      },
    });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
