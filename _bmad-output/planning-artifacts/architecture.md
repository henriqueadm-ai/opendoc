---
status: draft
inputDocuments:
  - prd.md
  - ux-design-specification.md
  - project-context.md
date: '2026-04-13T09:25:00-03:00'
---

# Arquitetura Técnica — OpenDoc

## 1. Visão Geral

OpenDoc é uma plataforma SaaS B2B LegalTech multi-tenant com pipeline de 13 estágios, 43 agentes IA especializados, e dashboard interativo com escritório isométrico.

### Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | React 19 + TypeScript 5.8 + Vite 6 | Stack existente no codebase |
| **UI Framework** | shadcn/ui + Tailwind CSS v4 | Decisão UX step-06 |
| **Visualização** | Phaser 3.90 | Escritório isométrico existente |
| **State** | Zustand 5 | State existente no codebase |
| **Backend** | Node.js ≥ 20 (ESM puro) | Runtime existente |
| **API** | Express/Fastify + WebSocket (ws v8) | REST + real-time |
| **Banco** | PostgreSQL (localhost "opendoc") | Multi-tenant, isolamento físico |
| **ORM** | Prisma 6 | Type-safe, migrations, multi-schema |
| **Auth** | JWT + Refresh Token + 2FA (TOTP) | NFR10: 2FA obrigatório |
| **Crypto** | AES-256-GCM (dicionário), Argon2id (senhas) | NFR8, NFR15 |
| **Cache** | Redis (opcional) ou in-memory Map | Rate limiting, sessions |
| **Queue** | BullMQ (Redis) ou file-based queue | Pipeline assíncrono |
| **LLM** | @google/genai + OpenRouter SDK | Multi-provider |
| **Real-time** | WebSocket nativo (ws v8) | NFR6: < 500ms |
| **Scraping** | Puppeteer + Cheerio + Cloudscraper | Jurisprudência |
| **PDF/DOCX** | html-to-docx + Puppeteer (PDF) | Visual Law export |
| **Deploy SaaS** | Docker Compose | FR56-58 |

---

## 2. Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19)                       │
│  shadcn/ui + Phaser 3 + Zustand                                │
│  ┌──────────┬────────────┬──────────┬───────────┬────────────┐  │
│  │ Dashboard│  Pipeline  │Discussão │  Módulos  │   Admin    │  │
│  │(isométr.)│  (stages)  │  H↔IA    │(PRO only) │  (config)  │  │
│  └──────────┴────────────┴──────────┴───────────┴────────────┘  │
│                    ↕ WebSocket + REST                             │
├─────────────────────────────────────────────────────────────────┤
│                     API GATEWAY (Node.js)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Auth Middleware │ Tenant Resolver │ Rate Limiter │ RBAC  │   │
│  └──────────────────────────────────────────────────────────┘   │
│     ↕                ↕                 ↕                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐             │
│  │REST API  │  │WebSocket Hub │  │Pipeline Engine│             │
│  │(Express) │  │ (ws v8)      │  │  (BullMQ)     │             │
│  └──────────┘  └──────────────┘  └───────────────┘             │
│        ↕              ↕                 ↕                       │
├─────────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                               │
│  ┌──────┬─────────┬────────┬────────┬─────────┬──────────────┐ │
│  │Auth  │Pipeline │Anon    │LLM     │Juris    │WhatsApp/IG   │ │
│  │Svc   │Orchest. │LGPD    │Gateway │Scraper  │Integration   │ │
│  └──────┴─────────┴────────┴────────┴─────────┴──────────────┘ │
│        ↕              ↕         ↕         ↕                     │
├─────────────────────────────────────────────────────────────────┤
│                     DATA LAYER                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL "opendoc" (localhost)                           │  │
│  │ ┌────────┬────────────┬────────────┬────────────────────┐ │  │
│  │ │ public │ tenant_001 │ tenant_002 │ tenant_N           │ │  │
│  │ │(master)│ (NPJ UFPR) │ (Escritório)│                   │ │  │
│  │ └────────┴────────────┴────────────┴────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ Ephemeral │  │ Redis        │  │ File System             │  │
│  │ RAM/Tmp   │  │ (sessions,   │  │ (Via File System/Sync)  │  │
│  │ (Destrói) │  │  queues)     │  │                         │  │
│  └───────────┘  └──────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Multi-Tenancy — Isolamento por Schema

### Decisão: Schema-per-Tenant (PostgreSQL)

Cada organização recebe um **schema dedicado** dentro do mesmo banco `opendoc`. Isso evita a complexidade de múltiplos bancos mas mantém isolamento total.

**Banco:** `postgresql://localhost:5432/opendoc`

```
opendoc (database)
├── public (schema master)
│   ├── organizations        → dados de cada tenant
│   ├── users                → auth global (e-mail, hash, 2fa_secret)
│   ├── subscriptions        → billing/planos
│   ├── api_keys_global      → chaves criptografadas (AES-256)
│   └── audit_login          → log de autenticação
│
├── tenant_001 (schema NPJ UFPR)
│   ├── processes            → processos jurídicos
│   ├── documents            → documentos do caso
│   ├── pipeline_runs        → execuções do pipeline
│   ├── pipeline_stages      → estágio-a-estágio com status
│   ├── anonymization_dict   → dicionário de placeholders (AES-256)
│   ├── audit_logs           → hash chain imutável
│   ├── discussions          → mensagens H↔IA
│   ├── deadlines            → prazos processuais
│   ├── finances             → honorários, custas
│   ├── whatsapp_sessions    → conversas WhatsApp
│   ├── rag_documents        → base de conhecimento
│   └── branding             → logo, cores Visual Law
│
├── tenant_002 (schema Escritório X)
│   └── ... (mesma estrutura)
```

### Tenant Resolver Middleware

```typescript
// Toda request resolve o tenant via JWT claim
async function tenantResolver(req, res, next) {
  const tenantId = req.user.organization_id;
  const schema = `tenant_${tenantId.toString().padStart(3, '0')}`;
  
  // Prisma client com schema dinâmico
  req.prisma = new PrismaClient({
    datasourceUrl: `postgresql://localhost:5432/opendoc?schema=${schema}`
  });
  
  next();
}
```

### Provisioning Automático (FR49)

```sql
-- Ao criar nova organização:
CREATE SCHEMA tenant_003;
-- Rodar migrations Prisma no schema
-- Tempo alvo: < 60s (NFR18)
```

---

## 4. Modelo de Dados Principal

### Schema `public` (Master)

```prisma
model Organization {
  id          Int       @id @default(autoincrement())
  name        String
  slug        String    @unique
  schema_name String    @unique  // "tenant_001"
  plan        Plan      @default(LIGHT)
  logo_url    String?
  colors      Json?     // { primary, secondary, accent }
  storage_limit_mb Int  @default(5000)
  created_at  DateTime  @default(now())
  users       User[]
  api_keys    ApiKey[]
  subscription Subscription?
}

model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  password_hash   String    // Argon2id
  oab_number      String?
  role            Role      // ADMIN, COORDINATOR, LAWYER
  plan            Plan      // LIGHT, PRO
  totp_secret     String?   // criptografado AES-256
  totp_enabled    Boolean   @default(false)
  organization_id Int
  organization    Organization @relation(fields: [organization_id], references: [id])
  created_at      DateTime  @default(now())
}

model ApiKey {
  id              Int       @id @default(autoincrement())
  provider        LLMProvider  // GOOGLE, OPENROUTER, OPENAI, ANTHROPIC
  encrypted_key   String    // AES-256-GCM
  monthly_limit   Decimal?  // R$ limite
  current_spend   Decimal   @default(0)
  organization_id Int
  organization    Organization @relation(fields: [organization_id], references: [id])
}

enum Role { ADMIN COORDINATOR LAWYER }
enum Plan { LIGHT PRO }
enum LLMProvider { GOOGLE OPENROUTER OPENAI ANTHROPIC }
```

### Schema Tenant (por organização)

```prisma
model Process {
  id            Int       @id @default(autoincrement())
  case_id       String    @unique   // "13_04_2026_0001"
  type          PetitionType
  brief         String
  status        ProcessStatus
  created_by    Int       // user_id (ref public.users)
  assigned_to   Int?      // coordenador (transferência)
  total_tokens  Int       @default(0)
  total_cost    Decimal   @default(0)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  documents     Document[]
  pipeline_run  PipelineRun?
  discussions   Discussion[]
  audit_logs    AuditLog[]
}

model Document {
  id              Int       @id @default(autoincrement())
  filename        String
  mime_type       String
  size_bytes      Int
  storage_mode    StorageMode // EPHEMERAL_RAM, LOCAL_SYNC
  sync_local_path String?     // path na máquina do user se aplicável
  extracted_text  String?     // texto bruto (DELETADO após anonimização)
  anonymized_text String?     // Mantido a longo prazo
  process_id      Int
  process         Process   @relation(fields: [process_id], references: [id])
}

enum StorageMode { EPHEMERAL_RAM LOCAL_SYNC }

model PipelineRun {
  id          Int       @id @default(autoincrement())
  process_id  Int       @unique
  process     Process   @relation(fields: [process_id], references: [id])
  status      PipelineStatus  // RUNNING, PAUSED, COMPLETED, ERROR
  current_stage Int     @default(1)
  started_at  DateTime  @default(now())
  completed_at DateTime?
  stages      PipelineStage[]
}

model PipelineStage {
  id            Int       @id @default(autoincrement())
  pipeline_id   Int
  pipeline      PipelineRun @relation(fields: [pipeline_id], references: [id])
  stage_number  Int       // 1-13
  stage_name    String    // "ingestao", "conversao", etc.
  agent_name    String    // "file-reader", "lgpd-anonymizer"
  status        StageStatus  // PENDING, RUNNING, DONE, ERROR, VETOED
  tokens_used   Int       @default(0)
  cost          Decimal   @default(0)
  duration_ms   Int?
  error_message String?
  started_at    DateTime?
  completed_at  DateTime?
}

model AnonymizationDict {
  id          Int       @id @default(autoincrement())
  process_id  Int
  encrypted_dict String  // AES-256-GCM JSON { "[PESSOA_1]": "José da Silva", ... }
  iv          String    // initialization vector
  created_at  DateTime  @default(now())
}

model AuditLog {
  id          Int       @id @default(autoincrement())
  process_id  Int
  process     Process   @relation(fields: [process_id], references: [id])
  event_type  String    // "DOCUMENT_UPLOADED", "ANONYMIZED", "AGENT_STARTED", etc.
  agent_name  String?
  description String
  hash        String    // SHA-256
  prev_hash   String?   // hash encadeado (chain)
  user_id     Int?
  metadata    Json?     // dados extra
  created_at  DateTime  @default(now())
  
  @@index([process_id, created_at])
}

model Discussion {
  id          Int       @id @default(autoincrement())
  process_id  Int
  process     Process   @relation(fields: [process_id], references: [id])
  sender      SenderType  // AI, HUMAN
  message     String
  diff_old    String?   // texto original (se sugestão)
  diff_new    String?   // texto sugerido
  diff_status DiffStatus? // PENDING, ACCEPTED, REJECTED
  created_at  DateTime  @default(now())
}

enum PetitionType { INICIAL CONTESTACAO IMPUGNACAO RECURSO MANIFESTACAO OUTRO }
enum ProcessStatus { DRAFT PIPELINE DISCUSSION FORMATTING COMPLETED TRANSFERRED }
enum PipelineStatus { RUNNING PAUSED COMPLETED ERROR }
enum StageStatus { PENDING RUNNING DONE ERROR VETOED }
enum SenderType { AI HUMAN }
enum DiffStatus { PENDING ACCEPTED REJECTED }
```

---

## 5. Pipeline Engine — 13 Estágios

### Arquitetura do Pipeline

```
Pipeline Engine (BullMQ ou file-based)
│
├── Stage 1:  Ingestão        → file-reader
├── Stage 2:  Conversão       → doc-converter (OCR, transcrição)
├── Stage 3:  Validação       → content-validator
├── Stage 4:  Anonimização    → lgpd-anonymizer
├── Stage 5:  Pseudonimização → lgpd-pseudonymizer
├── Stage 6:  Roteamento      → case-router
├── Stage 7:  Especialista    → direito-{ramo} (43 agentes)
├── Stage 8:  Jurisprudência  → juris-validator
├── Stage 9:  Redação         → draft-writer
├── Stage 10: Checkpoint H↔IA → (pausa para discussão)
├── Stage 11: Visual Law      → legal-designer
├── Stage 12: Restauração     → data-restorer
└── Stage 13: Exportação      → exporter (PDF + DOCX)
```

### Contrato de Estágio

```typescript
interface PipelineStageHandler {
  name: string;
  agentName: string;
  
  execute(context: PipelineContext): Promise<StageResult>;
  
  canRetry: boolean;        // pode ser re-executado
  requiresHuman: boolean;   // pausa para input humano (stage 10)
  maxRetries: number;
}

interface PipelineContext {
  processId: number;
  tenantSchema: string;
  documents: Document[];
  anonymizedText: string;
  placeholderDict: Record<string, string>;
  routedDomain: string;    // "previdenciario", "consumidor", etc.
  agentResult: any;
  jurisprudence: JurisprudenceResult[];
  draftText: string;
  ws: WebSocket;           // para updates real-time
}

interface StageResult {
  status: 'done' | 'error' | 'vetoed' | 'paused';
  tokensUsed: number;
  cost: number;
  output: any;
  error?: string;
  vetoReason?: string;
}
```

### WebSocket Real-time Updates

```typescript
// Server → Client messages
type WSMessage =
  | { type: 'PIPELINE_STAGE_UPDATE'; data: { processId: number; stage: number; status: StageStatus; agentName: string; tokensUsed: number; cost: number; durationMs: number; } }
  | { type: 'PIPELINE_LOG'; data: { processId: number; stage: number; message: string; level: 'info' | 'warn' | 'error'; } }
  | { type: 'PIPELINE_COMPLETE'; data: { processId: number; totalTokens: number; totalCost: number; totalDurationMs: number; } }
  | { type: 'PIPELINE_ERROR'; data: { processId: number; stage: number; error: string; recoveryOptions: string[]; } };
```

---

## 6. Autenticação & Segurança

### Fluxo de Auth

```
Login → Validar credenciais → Verificar 2FA (TOTP) → Gerar JWT + Refresh Token
                                                         ↓
                                              JWT payload:
                                              {
                                                sub: userId,
                                                org: organizationId,
                                                schema: "tenant_001",
                                                role: "COORDINATOR",
                                                plan: "PRO",
                                                exp: 8h
                                              }
```

### Decisões de Segurança

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Hash de senha | Argon2id | NFR15: memory-hard, OWASP recomendado |
| Token format | JWT (access) + opaque (refresh) | Stateless API + revogação via DB |
| 2FA | TOTP (Authenticator) ou e-mail OTP | NFR10: obrigatório em todos os logins |
| Crypto dicionário | AES-256-GCM | NFR8: repouso criptografado |
| Crypto API keys | AES-256-GCM | NFR9: nunca plaintext |
| Session expiry | 8h inatividade | NFR11 |
| TLS | 1.3 mínimo | NFR7 |

### RBAC Enforcement

```typescript
const permissions = {
  ADMIN:       ['manage:org', 'manage:users', 'manage:apikeys', 'manage:branding', 'view:analytics', 'manage:whatsapp'],
  COORDINATOR: ['create:process', 'run:pipeline', 'discuss:ai', 'transfer:receive', 'view:analytics', 'manage:deadlines', 'manage:finances', 'respond:whatsapp'],
  LAWYER:      ['create:process', 'run:pipeline', 'discuss:ai', 'transfer:send'],
};

// Light plan restrictions aplicadas no middleware
const planRestrictions = {
  LIGHT: { historyLimit: 4, modules: ['pipeline', 'transfer'] },
  PRO:   { historyLimit: Infinity, modules: ['pipeline', 'transfer', 'deadlines', 'whatsapp', 'finances', 'analytics', 'email'] },
};
```

---

## 7. LLM Gateway — Multi-Provider

### Decisão: Abstração por Provider

```typescript
interface LLMGateway {
  generate(prompt: string, options: LLMOptions): Promise<LLMResponse>;
  stream(prompt: string, options: LLMOptions): AsyncGenerator<string>;
}

interface LLMOptions {
  provider?: LLMProvider;  // fallback automático se não especificado
  model?: string;
  maxTokens?: number;
  temperature?: number;
  organizationId: number;  // para billing
}

// Fallback chain: provider primário → provider secundário → erro
```

### Billing por Organização

- Cada chamada ao LLM registra `tokens_in` + `tokens_out` + custo
- Custo calculado por modelo (tabela de preços por provider)
- Rate limiting por organização: `api_keys.monthly_limit`
- Dashboard admin mostra consumo em tempo real

---

## 8. Audit Trail — Hash Chain

### Contrato

```typescript
function createAuditEntry(processId: number, event: AuditEvent): AuditLog {
  const prevHash = getLastHash(processId); // último hash do processo
  const data = JSON.stringify({ processId, event, timestamp: Date.now(), prevHash });
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  return {
    process_id: processId,
    event_type: event.type,
    description: event.description,
    agent_name: event.agentName,
    hash,
    prev_hash: prevHash,
    metadata: event.metadata,
  };
}
```

A chain é **append-only** — nenhum registro pode ser editado ou deletado (NFR12).

---

## 9. Estrutura de Diretórios do Projeto

```
opendoc/
├── dashboard/                    # Frontend (React 19 + Vite 6)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components (copy-paste)
│   │   │   ├── pipeline/        # PipelineCard, StageIndicator
│   │   │   ├── discussion/      # ChatBubble, DiffBlock
│   │   │   ├── layout/          # Sidebar, Header, Workspace
│   │   │   └── modules/         # Deadlines, Finances, WhatsApp
│   │   ├── hooks/               # useTeamSocket, useAuth, usePipeline
│   │   ├── store/               # Zustand stores
│   │   ├── office/              # Phaser 3 (isométrico)
│   │   ├── lib/                 # utils, api client
│   │   └── styles/              # globals.css (Tailwind + shadcn tokens)
│   └── vite.config.ts
│
├── server/                       # Backend (Node.js ESM)
│   ├── src/
│   │   ├── api/                 # REST routes
│   │   │   ├── auth.ts          # login, register, 2fa
│   │   │   ├── processes.ts     # CRUD processos
│   │   │   ├── pipeline.ts      # start, status, resume
│   │   │   ├── discussion.ts    # chat H↔IA
│   │   │   ├── admin.ts         # org config, users, api keys
│   │   │   └── modules.ts       # deadlines, finances, whatsapp
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── pipeline.service.ts
│   │   │   ├── anonymizer.service.ts
│   │   │   ├── llm-gateway.service.ts
│   │   │   ├── juris-scraper.service.ts
│   │   │   ├── audit.service.ts
│   │   │   ├── export.service.ts
│   │   │   └── whatsapp.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── rbac.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── ws/                  # WebSocket hub
│   │   ├── queue/               # BullMQ pipeline jobs
│   │   └── crypto/              # AES-256, Argon2id utilities
│   ├── prisma/
│   │   ├── schema.prisma        # schema public (master)
│   │   ├── schema-tenant.prisma # schema tenant (template)
│   │   └── migrations/
│   └── package.json
│
├── agents/                       # 43 agentes especializados
├── skills/                       # Skills do framework Conectese
├── PROCESSOS/                    # File storage (uploads)
├── docker-compose.yml            # Deploy
├── .env                          # Config
└── package.json                  # Root
```

---

## 10. Deploy — Docker Compose

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: opendoc
      POSTGRES_USER: opendoc
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

  server:
    build: ./server
    environment:
      DATABASE_URL: postgresql://opendoc:${DB_PASSWORD}@postgres:5432/opendoc
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
    depends_on: [postgres, redis]
    ports:
      - "3001:3001"

  dashboard:
    build: ./dashboard
    depends_on: [server]
    ports:
      - "5173:5173"

volumes:
  pgdata:
  redisdata:
```

---

## 11. Decisões Arquiteturais — ADRs

### ADR-001: Schema-per-Tenant vs DB-per-Tenant

**Decisão:** Schema-per-Tenant no mesmo banco `opendoc`

**Contexto:** PRD exige isolamento físico (FR29). DB-per-Tenant é mais isolado mas tem overhead de conexões. Schema é o sweet-spot: isolamento SQL total + gerenciamento simples.

**Consequências:** 
- ✅ Backup por schema possível via `pg_dump -n tenant_001`
- ✅ Uma conexão pool compartilhada
- ✅ Migrations aplicadas em loop por schema
- ⚠️ Se precisar 500+ tenants, considerar sharding por DB

### ADR-002: Pipeline Sync vs Async

**Decisão:** Async com BullMQ (Redis-backed)

**Contexto:** Pipeline de 13 estágios leva até 15 min. Não pode bloquear HTTP request.

**Consequências:**
- ✅ Pipeline roda em background worker
- ✅ Retomável após crash (FR18, NFR28)
- ✅ WebSocket notifica frontend em tempo real
- ⚠️ Requer Redis rodando

### ADR-003: Vite Plugin vs Server Separado

**Decisão:** Server separado (Express/Fastify)

**Contexto:** O codebase atual usa Vite plugin como backend. Mas para SaaS multi-tenant com auth, RBAC, Prisma e WebSocket, um server dedicado é necessário.

**Consequências:**
- ✅ Separação de concerns
- ✅ Deploy independente (frontend estático + API)
- ✅ Horizontal scaling do backend
- ⚠️ Migração gradual do Vite plugin existente

### ADR-004: Prisma Multi-Schema

**Decisão:** PrismaClient com `schema` dinâmico via URL

**Contexto:** Prisma suporta `?schema=` no connection string para PostgreSQL.

**Consequências:**
- ✅ Type-safe queries
- ✅ Migrations versionadas
- ✅ Um schema Prisma define a estrutura do tenant (DRY)
- ⚠️ Precisa regenerar client quando schema muda

---

## 12. Interfaces de API — Endpoints Principais

### Auth
| Method | Path | Desc |
|--------|------|------|
| POST | `/api/auth/register` | Cadastro (convite) |
| POST | `/api/auth/login` | Login (email+senha ou OAB) |
| POST | `/api/auth/verify-2fa` | Verificar TOTP |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Revogar session |

### Processos
| Method | Path | Desc |
|--------|------|------|
| GET | `/api/processes` | Listar (paginado, filtrado por role/plan) |
| POST | `/api/processes` | Criar novo processo |
| GET | `/api/processes/:id` | Detalhes |
| POST | `/api/processes/:id/upload` | Upload documentos |
| POST | `/api/processes/:id/pipeline/start` | Iniciar pipeline |
| GET | `/api/processes/:id/pipeline/status` | Status (fallback REST) |
| POST | `/api/processes/:id/pipeline/resume` | Retomar após erro |
| POST | `/api/processes/:id/transfer` | Transferir para coordenador |

### Discussão
| Method | Path | Desc |
|--------|------|------|
| GET | `/api/processes/:id/discussion` | Histórico do chat |
| POST | `/api/processes/:id/discussion` | Enviar mensagem |
| PATCH | `/api/processes/:id/discussion/:msgId/diff` | Aceitar/rejeitar diff |
| POST | `/api/processes/:id/approve` | Aprovar e seguir para Visual Law |

### Export
| Method | Path | Desc |
|--------|------|------|
| POST | `/api/processes/:id/export` | Gerar PDF/DOCX |
| GET | `/api/processes/:id/export/:format` | Download |
| GET | `/api/processes/:id/audit-log` | Audit trail completo |

### Admin
| Method | Path | Desc |
|--------|------|------|
| GET/PUT | `/api/admin/org` | Config da organização |
| CRUD | `/api/admin/users` | Gestão de usuários |
| CRUD | `/api/admin/api-keys` | API keys |
| PUT | `/api/admin/branding` | Logo + cores |
| GET | `/api/admin/analytics` | Métricas de uso |

### WebSocket
| Path | Desc |
|------|------|
| `ws://host/__pipeline_ws` | Updates real-time do pipeline |
