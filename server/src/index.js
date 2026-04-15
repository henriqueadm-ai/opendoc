import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { attachWebSocketHub } from './ws/hub.js';
import { requireAuth } from './middlewares/auth.middleware.js';
import { tenantResolver, disconnectAllTenants } from './middlewares/tenant.middleware.js';

// API Routers
import authRoutes from './api/auth.js';
import adminRoutes from './api/admin.js';
import processesRoutes from './api/processes.js';
import settingsRoutes from './api/settings.js';
import discussionRoutes from './api/discussion.js';
import whatsappRoutes from './api/whatsapp.js';
import deadlinesRoutes from './api/deadlines.js';
import financialsRoutes from './api/financials.js';
import analyticsRoutes from './api/analytics.js';
import transfersRoutes from './api/transfers.js';
import { exportPdfHandler } from './services/export.service.js';

const app = express();
const server = createServer(app);

// ── Global Middleware ──────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Health ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', component: 'opendoc-server', timestamp: new Date().toISOString() });
});

// ── Public Routes (no auth) ────────────────────
app.use('/api/auth', authRoutes);

// ── Protected Routes (auth + tenant) ───────────
app.use('/api/admin', adminRoutes);
app.use('/api/processes', requireAuth, tenantResolver, processesRoutes);
app.use('/api/processes/:id/discussion', requireAuth, tenantResolver, discussionRoutes);
app.get('/api/processes/:id/export/pdf', requireAuth, tenantResolver, exportPdfHandler);
app.use('/api/settings', settingsRoutes);
app.use('/api/deadlines', deadlinesRoutes);
app.use('/api/financials', financialsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/transfers', transfersRoutes);

// ── WhatsApp Webhook (parcialmente público) ─────
app.use('/api/whatsapp', whatsappRoutes);

// ── WebSocket Hub (Pipeline updates) ───────────
attachWebSocketHub(server);

// ── Graceful shutdown ──────────────────────────
const shutdown = async () => {
  console.log('[Server] Shutting down gracefully...');
  await disconnectAllTenants();
  server.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ── Start ──────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Server] OpenDoc Server rodando na porta ${PORT}`);
  console.log(`[Server] WebSocket disponível em ws://localhost:${PORT}/__pipeline_ws`);
});
