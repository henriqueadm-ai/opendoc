---
project_name: 'opendoc'
user_name: 'Henrique'
date: '2026-04-15T11:07:36-03:00'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 62
optimized_for_llm: true
---

# Contexto do Projeto para Agentes de IA

_Este arquivo contém regras críticas e padrões que agentes de IA devem seguir ao implementar código neste projeto. Foco em detalhes não-óbvios que os agentes podem perder._

---

## Technology Stack & Versions

### Server (Express Backend)
- **Runtime:** Node.js >= 20 (ESM puro, `"type": "module"`)
- **Framework:** Express 4 com `express.json({ limit: '10mb' })`
- **ORM:** Prisma 6.19.3 (dual schema: `schema.prisma` público + `schema-tenant.prisma` por tenant)
- **Fila:** BullMQ + Redis 7 (pipeline 13 estágios)
- **Auth:** Argon2id (senhas) + TOTP (2FA) + JWT (sessions 8h)
- **Crypto:** AES-256-GCM nativo (API keys, dicionários de anonimização)
- **PDF:** pdf-lib (geração server-side Visual Law)
- **WebSocket:** ws nativo (pipeline real-time hub)

### Dashboard (React Frontend)
- **Framework:** React 19 + TypeScript 5.8
- **Bundler:** Vite 6.3 com `@vitejs/plugin-react`
- **State:** Zustand 5 (useAuthStore, usePipelineStore)
- **UI:** shadcn/ui (21 componentes) + Tailwind CSS v4
- **Routing:** React Router DOM 7
- **Visualização:** Phaser 3.90 (escritório isométrico)
- **Real-time:** WebSocket nativo via hook `usePipelineSocket`

### Infra
- **Database:** PostgreSQL 16 (multi-tenant via schemas isolados)
- **Cache/Queue:** Redis 7 Alpine
- **Deploy:** Docker Compose (PG + Redis + Server + Nginx)
- **Proxy:** Nginx Alpine (SPA fallback + reverse proxy API/WS)

### Dependências CLI (conectese)
| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `@google/genai` | ^1.48.0 | Google AI |
| `dotenv` | ^17.4.0 | Variáveis de ambiente |
| `pdf-parse` | ^2.4.5 | Extração de texto de PDFs |
| `marked` | ^17.0.5 | Markdown parser |
| `cheerio` | ^1.2.0 | Parsing HTML |

---

## Regras Críticas de Implementação

### Regras Específicas da Linguagem (JavaScript ESM + TypeScript)

#### Server (JavaScript ESM)
- **OBRIGATÓRIO:** `import`/`export` apenas — `require()` proibido
- **Node.js builtins:** Prefixo `node:` — `import { readFile } from 'node:fs/promises'`
- **`__dirname` em ESM:** Recriar manualmente com `dirname(fileURLToPath(import.meta.url))`
- **Async/Await exclusivo:** Sem callbacks, sem `.then()` chains
- **Tratamento de erros:** `try/catch` com `{ cause: err }` em Error wrapping
- **env vars:** Sempre via `process.env` — nunca hardcodar credenciais
- **Prisma tenantPrisma:** Injetado via middleware `req.tenantPrisma` — nunca instanciar PrismaClient direto nos routers

#### Dashboard (TypeScript Strict)
- **Named exports apenas:** `export function MinhaPage()` — nunca default export
- **Path alias:** `@/` resolve para `dashboard/src/`
- **useRef com tipo:** Sempre passar valor inicial — `useRef<T>(null)` ou `useRef<T | undefined>(undefined)`
- **Imports de shadcn/ui:** Componentes ficam em `@/components/ui/` (código local, não node_modules)
- **apiFetch helper:** Usar `apiFetch()` do `useAuthStore` — injeta Authorization header automaticamente
- **Zustand patterns:** Actions e state no mesmo `create<Store>()`, imutabilidade com spread

#### Crypto (Padrão do Projeto)
- **AES-256-GCM:** `createCipheriv`/`createDecipheriv` nativos — sem bibliotecas externas
- **IV:** `randomBytes(16)` por operação — nunca reutilizar
- **AuthTag:** Concatenado ao ciphertext (`Buffer.concat([encrypted, authTag])`)
- **ENCRYPTION_KEY:** 64 hex chars (32 bytes) via `process.env.ENCRYPTION_KEY`

---

### Regras do Framework

#### Express Backend (Padrões de Router)
- **Router pattern:** Cada domínio é um arquivo em `server/src/api/<domain>.js`
- **Middlewares em cadeia:** `requireAuth` → `tenantResolver` → router (nesta ordem)
- **RBAC dentro do router:** `checkPermissions({ roles: ['ADMIN'] })` — não no index.js
- **Respostas:** `{ success: true, data: ... }` ou `{ error: "mensagem" }` — nunca objetos soltos
- **IDs de params:** Sempre `parseInt(req.params.id)` — Express params são strings
- **mergeParams:** Routers aninhados (ex: discussion) usam `Router({ mergeParams: true })`

#### Multi-Tenancy (Prisma Schema Isolation)
- **2 schemas Prisma:** `schema.prisma` (public: Org, User, Invite) + `schema-tenant.prisma` (tenant: Process, Discussion, etc.)
- **PrismaClient pool:** `tenant.middleware.js` mantém `Map<string, PrismaClient>` — 1 client por schema
- **req.tenantPrisma:** Todos os routers protegidos recebem o client correto via middleware
- **Schema name:** Extraído do JWT do usuário (`req.user.schema`)
- **Graceful shutdown:** `disconnectAllTenants()` no SIGINT/SIGTERM

#### React Frontend (Padrões de Page)
- **Pages:** Componentes em `dashboard/src/pages/<name>.tsx` — named export
- **Routing:** `App.tsx` com `<ProtectedRoute>` → `<LayoutShell>` → `<Page />`
- **Data fetching:** `useEffect` + `apiFetch()` no mount — sem React Query/SWR
- **Forms:** Estado local com `useState` — sem form libraries
- **Loading states:** `useState<boolean>(false)` com try/finally pattern
- **WebSocket:** Hook dedicado (`usePipelineSocket`) com auto-reconnect 3s

#### Zustand Stores
- **useAuthStore:** JWT persist em localStorage, `apiFetch` helper, 2FA intermediate state
- **usePipelineStore:** 13 stages tracking, alimentado via WebSocket, sem persistência

---

### Regras de Testes

#### Status Atual
- **Testes E2E:** Ainda não implementados (backlog Epic futura)
- **Testes unitários CLI:** `node:test` nativo com `node:assert/strict`
- **Dashboard:** Sem testes configurados (nem Vitest nem Jest instalados)

#### Regras para Implementação Futura
- **Backend API:** Testar com supertest contra Express app (não mockar Prisma — usar test schema)
- **Frontend:** Vitest + React Testing Library (alinhado com Vite)
- **E2E:** Playwright (preferido) ou Cypress
- **Test DB:** Schema isolado `test_tenant` — nunca testar contra dados reais
- **Fixtures:** Factory pattern para criar Process, Discussion, etc.
- **Auth em testes:** Helper que gera JWT válido com role configurável
- **Cleanup:** Truncar tabelas entre testes — nunca depender de estado anterior

---

### Regras de Qualidade e Estilo

#### Organização de Arquivos
```
server/src/
├── api/           → 1 router por domínio (auth.js, deadlines.js, etc.)
├── services/      → Lógica de negócio (auth.service.js, pipeline.service.js)
├── middlewares/    → Auth, RBAC, Tenant resolver
├── queue/         → BullMQ workers (pipeline.queue.js)
├── ws/            → WebSocket hub
└── index.js       → Entry-point único (registra todas as rotas)

dashboard/src/
├── pages/         → 1 page por rota (login.tsx, analytics.tsx, etc.)
├── store/         → Zustand stores (useAuthStore.ts, usePipelineStore.ts)
├── hooks/         → Custom hooks (usePipelineSocket.ts)
├── components/    → Componentes reutilizáveis + shadcn/ui
├── office/        → Phaser game (PhaserGame.tsx, OfficeScene)
└── styles/        → globals.css (Tailwind + CSS variables)
```

#### Convenções de Naming
- **Backend files:** kebab-case (`auth.service.js`, `tenant.middleware.js`)
- **Frontend pages:** kebab-case (`admin-settings.tsx`, `new-petition.tsx`)
- **Stores:** camelCase com prefixo `use` (`useAuthStore.ts`)
- **Components:** PascalCase export, kebab-case file (`protected-route.tsx` → `ProtectedRoute`)
- **API routes:** kebab-case plural (`/api/deadlines`, `/api/financials`)
- **Prisma models:** PascalCase singular (`Process`, `Deadline`, `Fee`)
- **Enums Prisma:** UPPER_SNAKE_CASE (`PENDING`, `COMPLETED`, `HONORARIO`)

#### Documentação
- Comentários em português para lógica de negócio jurídica
- JSDoc com `@param` e `@returns` em services exportados
- Separadores visuais `// ─────` entre blocos de rotas no mesmo arquivo

---

### Regras de Workflow de Desenvolvimento

#### Git & Commits
- **Conventional Commits:** `feat(server):`, `feat(dashboard):`, `feat(infra):`, `fix:`, `chore:`
- **Scope por componente:** `server`, `dashboard`, `infra`, `agents`
- **Push direto em master** (MVP — migrar para branches quando time crescer)

#### Prisma Workflow
- **Alterar schema:** Editar `schema.prisma` ou `schema-tenant.prisma`
- **Gerar client:** `npx prisma generate --schema=prisma/<schema>.prisma`
- **Aplicar ao DB:** `npx prisma db push --schema=prisma/<schema>.prisma`
- **NUNCA usar `prisma migrate`** em tenant schemas (multi-schema não suporta migrations nativas)

#### Adição de Novas Rotas (Checklist)
1. Criar router em `server/src/api/<domain>.js`
2. Importar e registrar no `server/src/index.js`
3. Criar page em `dashboard/src/pages/<name>.tsx`
4. Importar e adicionar `<Route>` no `dashboard/src/App.tsx`
5. Se usar componente shadcn novo: `npx shadcn@latest add <component>`

#### Deploy
- **Dev:** `npm run dev` (server) + `npm run dev` (dashboard) — portas 3001 e 5173
- **Produção:** `docker-compose up -d` — portas 3001 (API) e 3000 (Nginx)
- **Variáveis:** Copiar `.env.example` → `.env` e preencher secrets reais

---

### Regras Críticas — Não Esquecer!

#### Anti-Patterns a Evitar
- ❌ **NUNCA** instanciar `new PrismaClient()` nos routers — usar `req.tenantPrisma`
- ❌ **NUNCA** expor API keys em plaintext na resposta — sempre mascarar (`sk-••••`)
- ❌ **NUNCA** enviar dados PII ao LLM — tudo passa por anonimização AES-256-GCM primeiro
- ❌ **NUNCA** usar `require()` — projeto é ESM puro
- ❌ **NUNCA** usar default exports — sempre named exports
- ❌ **NUNCA** hardcodar credenciais — sempre `process.env.*`
- ❌ **NUNCA** usar `existsSync()` no server — usar `stat()` + try/catch
- ❌ **NUNCA** reutilizar IV em operações AES — `randomBytes(16)` cada vez

#### Segurança (LGPD + CNJ)
- **Disclaimer obrigatório:** Todo PDF exportado DEVE conter disclaimer no rodapé sobre revisão por advogado OAB
- **Anonimização antes do LLM:** Dados pessoais → placeholders com dicionário criptografado reversível
- **Audit trail imutável:** Hash chain SHA-256 — cada log aponta para hash do anterior
- **2FA obrigatório:** 100% dos logins exigem TOTP após email+senha
- **Tenant isolation:** Schemas PostgreSQL separados por organização — zero crossover

#### Edge Cases Críticos
- **`req.params.id` é string:** Sempre `parseInt()` antes de passar ao Prisma
- **Prisma Decimal:** Retorna string — `parseFloat()` para cálculos
- **WebSocket reconnect:** 3 segundos de delay — não spam de reconexão
- **clearTimeout(undefined):** Funciona sem erro — safe to call sem verificação
- **DIFF parsing na Discussion:** Regex `DIFF_OLD:` e `DIFF_NEW:` — formato frágil, tratar ausência graciosamente
- **Singleton TenantSettings:** `id: 1` fixo com upsert — nunca criar id > 1

#### Performance
- **PrismaClient pool:** Cache em Map — nunca criar novo client por request
- **WebSocket hub:** Broadcast nativo sem Socket.io — sem overhead de rooms/namespaces
- **Pipeline stages:** BullMQ com concurrency=1 por processo — sequencial por design
- **PDF generation:** Server-side com pdf-lib — zero dependência de browser/puppeteer

---

## Diretrizes de Uso

**Para Agentes de IA:**

- Ler este arquivo antes de implementar qualquer código
- Seguir TODAS as regras exatamente como documentado
- Em caso de dúvida, preferir a opção mais restritiva
- Atualizar este arquivo se novos padrões emergirem

**Para Humanos:**

- Manter este arquivo enxuto e focado nas necessidades dos agentes
- Atualizar quando o stack tecnológico mudar
- Revisar trimestralmente para remover regras obsoletas
- Remover regras que se tornarem óbvias com o tempo

Última atualização: 2026-04-15T11:07:36-03:00
