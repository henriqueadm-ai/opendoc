---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# OpenDoc - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for OpenDoc, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Advogado pode criar nova requisição selecionando tipo de petição
FR2: Advogado pode fornecer brief textual com a tese jurídica
FR3: Advogado pode fazer upload de múltiplos documentos (PDF, DOCX, XLS, imagens, áudio)
FR4: Sistema pode converter documentos multi-formato em texto (OCR, transcrição)
FR5: Sistema pode detectar e sinalizar erros de conversão com opções de ação
FR6: Sistema pode anonimizar dados sensíveis automaticamente antes de envio ao LLM
FR7: Sistema pode pseudonimizar dados pessoais com dicionário de placeholders reversível
FR8: Sistema pode categorizar o ramo do direito e definir competência
FR9: Sistema pode encaminhar o caso para agentes especializados do ramo identificado
FR10: Sistema pode pesquisar jurisprudência em sites .jus.br e Jusbrasil
FR11: Agente especialista pode vetar produção sem fundamentação verificada
FR12: Sistema pode redigir peça jurídica com base nos dados anonimizados e jurisprudência
FR13: Advogado pode discutir e refinar o documento com a IA na tela de discussão
FR14: Sistema pode formatar a peça em Visual Law com branding do escritório
FR15: Sistema pode restaurar dados reais no documento final
FR16: Advogado pode exportar peça em PDF e DOCX
FR17: Sistema pode gerar audit log assinado por hash SHA-256
FR18: Pipeline pode retomar do ponto de interrupção sem reiniciar
FR19: Advogado Light pode transferir processo para coordenador PRO
FR20: Advogado pode visualizar cada agente trabalhando em tempo real no escritório isométrico
FR21: Advogado pode ver contador de tokens e custo em tempo real
FR22: Advogado pode ver dados sendo anonimizados em tempo real
FR23: Advogado pode clicar em agente para ver log detalhado
FR24: Sistema pode exibir disclaimer obrigatório sobre revisão por advogado OAB
FR25: Admin pode configurar métodos de autenticação da organização
FR26: Sistema pode exigir 2FA em todas as combinações de login
FR27: Admin pode criar contas Light e PRO com convite por e-mail
FR28: Admin pode atribuir roles (admin, coordenador, advogado)
FR29: Sistema pode isolar dados entre organizações (banco separado)
FR30: Admin pode gerenciar API keys de múltiplos provedores de LLM
FR31: Admin pode definir limites de gasto mensal por API key
FR32: IA pode responder automaticamente mensagens de clientes com base no RAG
FR33: IA pode detectar sentimento do cliente e escalar para humano
FR34: Admin pode configurar prompt inicial e regras de escalação
FR35: Admin pode fazer upload de até 50 documentos para a base RAG
FR36: Coordenador PRO pode responder diretamente pelo dashboard
FR37: Coordenador pode gerenciar prazos processuais com calendário
FR38: Sistema pode enviar notificações push de prazos
FR39: Sistema pode receber intimações por e-mail (IMAP)
FR40: Sistema pode parsear conteúdo de intimações recebidas
FR41: Coordenador pode registrar honorários por processo
FR42: Coordenador pode registrar custas processuais
FR43: Coordenador pode visualizar fluxo de caixa do escritório
FR44: Coordenador PRO pode visualizar dashboard de produtividade
FR45: Sistema pode gerar comparativos de produtividade entre períodos
FR46: Admin pode monitorar custos de tokens por organização
FR47: Admin pode configurar branding do escritório para Visual Law
FR48: Admin pode definir espaço de armazenamento da organização
FR49: Sistema pode provisionar banco de dados automaticamente para nova organização
FR50: Wizard de onboarding pode guiar admin pelo setup inicial
FR51: Advogado pode criar draft de processo offline com sync quando online
FR52: Advogado pode acessar manual de texto integrado ao dashboard
FR53: Sistema pode exigir aceite do disclaimer antes de exportar
FR54: Sistema pode incluir disclaimer no rodapé de cada página do PDF
FR55: Sistema pode gerenciar assinaturas recorrentes via gateway de pagamento
FR56: Sistema pode ser deployado como container Docker com docker-compose
FR57: Admin self-hosted pode configurar via variáveis de ambiente (.env)
FR58: Sistema self-hosted pode operar sem dependência de serviços SaaS externos
FR59: Advogado pode alternar entre tema claro e escuro no dashboard

### NonFunctional Requirements

NFR1: Pipeline completo (13 estágios) deve completar em < 15 minutos
NFR2: Tela de discussão H↔IA deve responder em < 5 segundos
NFR3: Dashboard isométrico deve renderizar a 60fps
NFR4: Upload de documentos deve aceitar até 50MB/arquivo e 200MB/processo
NFR5: Fallback do Phaser para lista textual quando FPS < 30
NFR6: WebSocket deve atualizar status dos agentes em < 500ms
NFR7: Todos os dados em trânsito devem usar TLS 1.3
NFR8: Dicionário de placeholders criptografado em repouso com AES-256
NFR9: API keys de LLM armazenadas criptografadas
NFR10: 2FA obrigatório em 100% dos logins
NFR11: Sessions JWT com expiração máxima de 8 horas
NFR12: Audit log imutável após geração (append-only, hash encadeado)
NFR13: Zero dados sensíveis devem atingir o LLM
NFR14: Isolamento total entre tenants
NFR15: Senhas hasheadas com Argon2id + pepper
NFR16: Sistema deve suportar 50 organizações simultâneas no MVP
NFR17: Cada organização deve suportar até 50 usuários concorrentes
NFR18: Database provisioning deve completar em < 60 segundos
NFR19: Arquitetura deve permitir escalar para 500+ organizações
NFR20: Dashboard deve seguir WCAG 2.1 nível AA
NFR21: Fallback textual do Phaser deve ser acessível por leitores de tela
NFR22: Todas as ações devem ser executáveis via teclado
NFR23: WebSocket deve reconectar automaticamente em caso de queda
NFR24: Fallback para REST polling se WebSocket indisponível
NFR25: Rate limiting em scraping Jusbrasil/.jus.br para máximo 10 req/min
NFR26: Multi-LLM com fallback automático em < 30 segundos
NFR27: Uptime do SaaS ≥ 99%
NFR28: Pipeline deve implementar retomada automática após falha de rede
NFR29: Modo offline deve sincronizar sem perda de dados
NFR30: Backup automático de dados de cada organização diariamente
NFR31: Tempo de recuperação de backup (RTO) < 4 horas

### Additional Requirements

- ADR-001: Schema-per-tenant PostgreSQL com provisioning automático
- ADR-002: Pipeline async com BullMQ (Redis-backed), retomável após crash
- ADR-003: Server separado Express/Fastify (migração do Vite plugin)
- ADR-004: Prisma multi-schema com schema dinâmico via URL
- Docker Compose setup (PostgreSQL + Redis + Server + Dashboard)
- LLM Gateway multi-provider com fallback chain e billing tracking
- Audit trail hash chain SHA-256 append-only
- WebSocket real-time hub para pipeline updates (ws v8)
- JWT + Refresh Token auth flow com tenant resolver middleware
- RBAC enforcement middleware com plan restrictions

### UX Design Requirements

UX-DR1: Setup shadcn/ui + Tailwind CSS v4 no projeto Vite existente
UX-DR2: Implementar Zinc theme dark/light com CSS variables e classe .dark
UX-DR3: Instalar 17 componentes shadcn (Sidebar, Command, Card, Table, Data Table, Progress, Badge, Sonner, Dialog, Tabs, Resizable, Scroll Area, Switch, Input, Textarea, Checkbox, Skeleton)
UX-DR4: Criar componente PipelineCard (extends Card, estados: idle/active/done/error/veto)
UX-DR5: Criar componente ChatBubble (variantes ai/human, role="log")
UX-DR6: Criar componente DiffBlock (aceitar/rejeitar diffs, estados pending/accepted/rejected)
UX-DR7: Criar componente IsometricView (container Phaser 3 + fallback timeline textual)
UX-DR8: Criar componente AuditTimeline (hash chain visual, variantes compact/full)
UX-DR9: Implementar button hierarchy (1 primário por contexto, destructive sempre com Dialog)
UX-DR10: Implementar feedback patterns (Sonner toasts, Dialog veto, Skeleton loading, Progress pipeline)
UX-DR11: Implementar navigation (Sidebar 240px, ⌘K Command palette, atalhos teclado)
UX-DR12: Implementar empty states com CTAs específicos por contexto
UX-DR13: Implementar responsive desktop-first (breakpoints Tailwind, Sidebar→Sheet em mobile)
UX-DR14: Implementar WCAG AA (contraste 4.5:1, keyboard nav, ARIA labels, skip links, prefers-reduced-motion)

### FR Coverage Map

FR1: Epic 3 — Criar nova requisição
FR2: Epic 3 — Brief textual
FR3: Epic 3 — Upload multi-formato
FR4: Epic 3 — Conversão OCR/transcrição
FR5: Epic 3 — Erros de conversão
FR6: Epic 3 — Anonimização LGPD
FR7: Epic 3 — Pseudonimização placeholders
FR8: Epic 3 — Categorização ramo direito
FR9: Epic 3 — Roteamento agente especialista
FR10: Epic 3 — Pesquisa jurisprudência
FR11: Epic 3 — Veto sem fundamentação
FR12: Epic 3 — Redação da peça
FR13: Epic 5 — Discussão H↔IA
FR14: Epic 5 — Visual Law
FR15: Epic 5 — Restauração dados reais
FR16: Epic 5 — Exportar PDF/DOCX
FR17: Epic 3 — Audit log SHA-256
FR18: Epic 3 — Retomada do pipeline
FR19: Epic 9 — Transferência Light→PRO
FR20: Epic 4 — Escritório isométrico real-time
FR21: Epic 4 — Contador tokens/custo
FR22: Epic 4 — Anonimização visível
FR23: Epic 4 — Log de agente clicável
FR24: Epic 4 — Disclaimer obrigatório
FR25: Epic 1 — Config auth
FR26: Epic 1 — 2FA obrigatório
FR27: Epic 1 — Criar contas convite
FR28: Epic 1 — Atribuir roles
FR29: Epic 1 — Isolamento banco
FR30: Epic 6 — Gerenciar API keys
FR31: Epic 6 — Limites gasto
FR32: Epic 7 — IA responde WhatsApp
FR33: Epic 7 — Sentimento e escalação
FR34: Epic 7 — Config prompt/escalação
FR35: Epic 7 — Upload RAG
FR36: Epic 7 — Coordenador responde dashboard
FR37: Epic 8 — Prazos processuais
FR38: Epic 8 — Notificações push
FR39: Epic 8 — E-mail IMAP intimações
FR40: Epic 8 — Parsear intimações
FR41: Epic 8 — Honorários
FR42: Epic 8 — Custas
FR43: Epic 8 — Fluxo de caixa
FR44: Epic 9 — Dashboard produtividade
FR45: Epic 9 — Comparativos
FR46: Epic 9 — Custos tokens
FR47: Epic 6 — Branding Visual Law
FR48: Epic 6 — Espaço armazenamento
FR49: Epic 1 — Provisioning schema
FR50: Epic 1 — Wizard onboarding
FR51: Epic 10 — Draft offline
FR52: Epic 10 — Manual integrado
FR53: Epic 5 — Aceite disclaimer export
FR54: Epic 5 — Disclaimer rodapé PDF
FR55: Epic 9 — Billing assinaturas
FR56: Epic 10 — Docker deploy
FR57: Epic 10 — Config .env
FR58: Epic 10 — Operação sem SaaS
FR59: Epic 2 — Tema claro/escuro

## Epic List

### Epic 1: Fundação, Auth & Multi-Tenant
Admin pode criar organização, convidar usuários, e todos logam com 2FA. Isolamento por schema.
**FRs:** FR25-29, FR49-50

### Epic 2: Design System & Layout
Dashboard com shadcn/ui, tema dark/light, navegação global, acessibilidade WCAG AA.
**FRs:** FR59. **UX-DRs:** UX-DR1-14

### Epic 3: Pipeline de Peticionamento
Advogado sobe documentos, pipeline executa 13 estágios com anonimização, redação e audit log.
**FRs:** FR1-12, FR17-18

### Epic 4: Visualização Real-time
Advogado vê agentes no escritório isométrico com custos e logs em tempo real.
**FRs:** FR20-24

### Epic 5: Discussão H↔IA & Exportação
Advogado discute com IA, aceita/rejeita diffs, aprova e exporta PDF/DOCX com disclaimer.
**FRs:** FR13-16, FR53-54

### Epic 6: Administração & LLM Gateway
Admin gerencia API keys multi-provider, branding Visual Law e limites de armazenamento.
**FRs:** FR30-31, FR47-48

### Epic 7: WhatsApp & Instagram
Clientes atendidos por IA com RAG, detecção de sentimento e escalação para humano.
**FRs:** FR32-36

### Epic 8: Gestão Processual & Financeiro
Coordenador gerencia prazos, intimações por e-mail, honorários e custas.
**FRs:** FR37-43

### Epic 9: Analytics, Billing & Transferências
Dashboard produtividade, custos de tokens, billing automático e transferência Light→PRO.
**FRs:** FR19, FR44-46, FR55

### Epic 10: Offline, Documentação & Docker
Modo offline com sync, manual integrado e deploy Docker self-hosted.
**FRs:** FR51-52, FR56-58

---

## Epic 1: Fundação, Auth & Multi-Tenant

Admin pode criar organização com schema dedicado, convidar usuários com roles, e todos logam com 2FA obrigatório.

### Story 1.1: Provisioning de Organização

As a Admin,
I want to create a new organization with automatic schema provisioning,
So that each tenant has isolated data from day one.

**Acceptance Criteria:**

**Given** Admin submits organization creation form (name, slug)
**When** the system processes the request
**Then** a new schema `tenant_{id}` is created in PostgreSQL "opendoc"
**And** all tenant tables are migrated (Prisma) in < 60 seconds (NFR18)
**And** the organization record is stored in `public.organizations`

### Story 1.2: Registro de Usuário via Convite

As a Admin,
I want to invite users via email with role and plan assignment,
So that only authorized people access my organization.

**Acceptance Criteria:**

**Given** Admin fills invite form (email, role, plan)
**When** invite is sent
**Then** user receives email with registration link
**And** link expires in 48 hours
**And** user creates account with password (hashed Argon2id, NFR15)

### Story 1.3: Login com E-mail/Senha + 2FA

As a User,
I want to login with email/password and verify with 2FA,
So that my account is secure (NFR10).

**Acceptance Criteria:**

**Given** user enters valid email and password
**When** credentials are verified
**Then** system prompts for TOTP code
**And** on valid TOTP, returns JWT (8h expiry, NFR11) with org_id, role, plan claims
**And** refresh token is stored for session renewal

### Story 1.4: Setup 2FA (TOTP)

As a User,
I want to set up my authenticator app for 2FA,
So that I can complete the mandatory 2FA requirement.

**Acceptance Criteria:**

**Given** user accesses 2FA setup page
**When** they scan QR code with authenticator app
**Then** TOTP secret is encrypted (AES-256) and stored
**And** user must confirm with a valid code before activation

### Story 1.5: RBAC Middleware & Plan Restrictions

As a System,
I want to enforce role-based access and plan restrictions on every request,
So that users only access what their role and plan allow (FR28).

**Acceptance Criteria:**

**Given** a request with JWT containing role and plan
**When** RBAC middleware processes the request
**Then** ADMIN has all permissions, COORDINATOR has PRO modules, LAWYER has pipeline only
**And** LIGHT plan restricts to pipeline + transfer modules
**And** unauthorized requests return 403

### Story 1.6: Wizard de Onboarding

As a Admin,
I want a guided setup wizard after first login,
So that I can configure my organization step by step (FR50).

**Acceptance Criteria:**

**Given** Admin logs in for the first time
**When** onboarding wizard starts
**Then** guides through: API keys → Users → Branding → WhatsApp (optional)
**And** each step can be skipped and completed later
**And** wizard marks as complete when all steps done

---

## Epic 2: Design System & Layout

Dashboard com shadcn/ui + Tailwind CSS v4, tema Zinc dark/light, navegação global e acessibilidade WCAG AA.

### Story 2.1: Setup shadcn/ui + Tailwind CSS v4

As a Developer,
I want shadcn/ui and Tailwind CSS v4 configured in the Vite project,
So that all future components use the standard design system (UX-DR1).

**Acceptance Criteria:**

**Given** the existing dashboard Vite project
**When** dependencies are installed (tailwindcss, @tailwindcss/vite, shadcn CLI)
**Then** `@import "tailwindcss"` works in index.css
**And** `@/` path alias resolves to `dashboard/src/`
**And** `components.json` is configured for shadcn

### Story 2.2: Zinc Theme Dark/Light Mode

As a Advogado,
I want to switch between dark and light themes (FR59),
So that I can work comfortably in any lighting (UX-DR2).

**Acceptance Criteria:**

**Given** the Zinc theme CSS variables are configured
**When** user clicks the theme toggle (Switch component)
**Then** `.dark` class toggles on `<html>` element
**And** all CSS variables update (--background, --foreground, --muted, etc.)
**And** preference is persisted in localStorage

### Story 2.3: Layout Shell (Sidebar + Workspace)

As a Advogado,
I want a consistent layout with sidebar navigation and main workspace,
So that I can navigate between sections efficiently (UX-DR11).

**Acceptance Criteria:**

**Given** user is authenticated
**When** dashboard loads
**Then** Sidebar (240px) shows on the left with nav items
**And** main workspace fills remaining space
**And** Sidebar collapses to icons at `md` breakpoint (UX-DR13)
**And** Sidebar becomes Sheet overlay on mobile

### Story 2.4: Command Palette (⌘K)

As a Advogado,
I want a command palette for quick search and actions,
So that I can find processes and execute actions fast (UX-DR11).

**Acceptance Criteria:**

**Given** user presses ⌘K (or Ctrl+K)
**When** Command palette opens
**Then** shows search input with recent processes
**And** results filter as user types
**And** Enter navigates to selected item
**And** Esc closes the palette

### Story 2.5: WCAG AA Accessibility Foundation

As a User with accessibility needs,
I want the dashboard to be WCAG AA compliant,
So that I can use all features regardless of ability (UX-DR14).

**Acceptance Criteria:**

**Given** the dashboard is loaded
**When** user navigates with keyboard
**Then** all interactive elements have visible focus ring (2px accent)
**And** skip link "Pular para conteúdo" is first in DOM
**And** all icon-only buttons have aria-label
**And** contrast ratio ≥ 4.5:1 for text (NFR20)
**And** `prefers-reduced-motion` disables animations

### Story 2.6: Install Core shadcn Components

As a Developer,
I want the 17 core shadcn components installed and available,
So that all epics can use standard components (UX-DR3).

**Acceptance Criteria:**

**Given** shadcn CLI is configured
**When** components are added (Sidebar, Command, Card, Table, Dialog, etc.)
**Then** all 17 components exist in `src/components/ui/`
**And** each imports correctly with `@/components/ui/` path
**And** Sonner toast provider is configured in App root

---

## Epic 3: Pipeline de Peticionamento

Advogado submete documentos, pipeline executa 13 estágios com conversão, anonimização LGPD, roteamento, redação por agente e audit trail.

### Story 3.1: Criar Processo e Brief

As a Advogado,
I want to create a new petition request with type and brief,
So that the pipeline knows what to produce (FR1, FR2).

**Acceptance Criteria:**

**Given** Advogado clicks "Nova Petição"
**When** they select petition type and write the brief
**Then** a new Process record is created with status DRAFT
**And** case_id is auto-generated (date-based)

### Story 3.2: Upload de Documentos Multi-Formato

As a Advogado,
I want to upload multiple documents (PDF, DOCX, images, audio),
So that the pipeline has all case materials (FR3).

**Acceptance Criteria:**

**Given** a process in DRAFT status
**When** Advogado drag-drops ou configura pasta local de sincronização
**Then** documentos brutos são carregados apenas na RAM do servidor de forma efêmera e não salvos fisicamente (NFR32)
**And** max 50MB/file and 200MB/process (NFR4)
**And** o servidor destrói os originais após extração/anonimização (Zero Persistência Bruta)
**And** Document records link to the process (apontando local path se sincronizado)

### Story 3.3: Pipeline Engine (BullMQ)

As a System,
I want an async pipeline engine that processes 13 stages sequentially,
So that long-running pipelines don't block HTTP (ADR-002).

**Acceptance Criteria:**

**Given** Advogado clicks "Iniciar Pipeline"
**When** pipeline job is enqueued
**Then** PipelineRun record created with status RUNNING
**And** stages execute sequentially (stage 1 → 2 → ... → 13)
**And** each stage creates PipelineStage record with tokens/cost/duration
**And** WebSocket sends PIPELINE_STAGE_UPDATE per stage (NFR6)

### Story 3.4: Conversão de Documentos (OCR + Transcrição)

As a System,
I want to convert all uploaded documents to text,
So that agents can process the content (FR4, FR5).

**Acceptance Criteria:**

**Given** pipeline reaches stage 2
**When** doc-converter processes each document
**Then** PDFs extracted via pdf-parse, images via OCR, audio via Whisper
**And** errors show toast with options: reenviar, digitar, pular (FR5)
**And** pipeline can resume from error point (FR18)

### Story 3.5: Anonimização & Pseudonimização LGPD

As a System,
I want to anonymize all PII before sending to LLM,
So that zero sensitive data reaches the model (FR6, FR7, NFR13).

**Acceptance Criteria:**

**Given** pipeline reaches stage 4-5
**When** lgpd-anonymizer processes text
**Then** names, CPFs, addresses replaced with [PESSOA_1], [CPF_1] etc.
**And** placeholder dictionary saved encrypted (AES-256-GCM, NFR8)
**And** anonymization > 99% accuracy (NFR13)

### Story 3.6: Roteamento por Ramo do Direito

As a System,
I want to categorize the case and route to the specialist agent,
So that the right legal expert handles the petition (FR8, FR9).

**Acceptance Criteria:**

**Given** pipeline reaches stage 6
**When** case-router analyzes the brief and documents
**Then** identifies the legal domain (civil, penal, tributário, etc.)
**And** routes to the correct specialized agent (43 available)

### Story 3.7: Pesquisa de Jurisprudência

As a System,
I want to search for relevant case law on .jus.br and Jusbrasil,
So that the petition has verified legal precedents (FR10).

**Acceptance Criteria:**

**Given** pipeline reaches stage 8
**When** juris-validator searches case law
**Then** returns relevant precedents with valid URLs
**And** rate limiting max 10 req/min (NFR25)
**And** fallback from Jusbrasil to .jus.br sites

### Story 3.8: Redação com Agente Especialista + Veto

As a System,
I want the specialist agent to draft the petition with veto power,
So that legally unsupported content is blocked (FR11, FR12).

**Acceptance Criteria:**

**Given** pipeline reaches stage 7+9
**When** specialist agent drafts the petition
**Then** text is produced based on anonymized data + jurisprudence
**And** agent can VETO if fundamentação is insufficient (FR11)
**And** veto triggers Dialog with reason and options

### Story 3.9: Audit Trail Hash Chain

As a System,
I want every pipeline event logged with SHA-256 hash chain,
So that processing is provably immutable (FR17, NFR12).

**Acceptance Criteria:**

**Given** any pipeline event occurs
**When** AuditLog entry is created
**Then** hash = SHA-256(event + prev_hash + timestamp)
**And** logs are append-only, never edited or deleted
**And** full chain is downloadable as audit report

---

## Epic 4: Visualização Real-time

Advogado vê agentes trabalhando no escritório isométrico com contadores de tokens e custos em tempo real.

### Story 4.1: WebSocket Hub para Pipeline Updates

As a System,
I want a WebSocket hub that broadcasts pipeline stage updates,
So that the frontend receives real-time data (NFR6).

**Acceptance Criteria:**

**Given** pipeline is running
**When** a stage starts, completes, or errors
**Then** WebSocket sends typed message to all connected clients for that process
**And** latency < 500ms (NFR6)
**And** auto-reconnect on disconnect (NFR23)
**And** fallback to REST polling if WS unavailable (NFR24)

### Story 4.2: Escritório Isométrico Phaser (Pipeline View)

As a Advogado,
I want to see agents working in the isometric office,
So that I understand what's happening in the pipeline (FR20).

**Acceptance Criteria:**

**Given** pipeline is active
**When** dashboard shows the IsometricView
**Then** each agent is visualized as a character at a desk
**And** active agent has pulsing animation
**And** 60fps rendering (NFR3)
**And** fallback to timeline if FPS < 30 (NFR5)

### Story 4.3: Contadores de Tokens & Custo

As a Advogado,
I want to see token count and cost in real-time,
So that I know how much the pipeline costs (FR21).

**Acceptance Criteria:**

**Given** pipeline is running
**When** each stage reports tokens used
**Then** cumulative token counter and R$ cost update live
**And** displayed in the pipeline view header

### Story 4.4: Anonimização Visível & Log de Agentes

As a Advogado,
I want to see PII being anonymized and click agents for details,
So that I trust the process is working (FR22, FR23).

**Acceptance Criteria:**

**Given** anonymization stage is active
**When** user watches the pipeline
**Then** PIIs are shown being replaced in a scrolling view
**And** clicking any agent opens a Sheet with detailed log
**And** disclaimer is always visible (FR24)

---

## Epic 5: Discussão H↔IA & Exportação

Advogado entra em sessão de discussão com a IA para refinar a peça, depois aprova e exporta com disclaimers.

### Story 5.1: Tela de Discussão (Chat + Doc)

As a Advogado,
I want a split view with document and chat to discuss with AI,
So that I can refine the petition iteratively (FR13).

**Acceptance Criteria:**

**Given** pipeline completes stage 9 (draft ready)
**When** user enters discussion view
**Then** Resizable split shows document (left) and chat (right)
**And** ChatBubble component shows AI and Human messages
**And** ⌘Enter sends message
**And** AI responds in < 5 seconds (NFR2)

### Story 5.2: Diffs Aceitar/Rejeitar

As a Advogado,
I want to accept or reject AI-suggested changes inline,
So that I control exactly what goes into the final petition.

**Acceptance Criteria:**

**Given** AI suggests a text change
**When** DiffBlock is rendered (old vs new)
**Then** user can click Accept (✓) or Reject (✗)
**And** accepted diffs update the document text
**And** rejected diffs keep original text
**And** diff status stored in Discussion record

### Story 5.3: Visual Law Formatting

As a Advogado,
I want the approved petition formatted with my office branding,
So that the result looks professional (FR14).

**Acceptance Criteria:**

**Given** user clicks "Aprovar e Formatar"
**When** legal-designer processes the text
**Then** applies logo, colors and Visual Law principles from org branding
**And** data is restored from anonymized to real (FR15)

### Story 5.4: Export PDF/DOCX com Disclaimer

As a Advogado,
I want to export the final petition as PDF and DOCX,
So that I can file it with the court (FR16, FR53, FR54).

**Acceptance Criteria:**

**Given** Visual Law formatting is complete
**When** user clicks Export
**Then** Dialog requires disclaimer acceptance (checkbox, FR53)
**And** PDF generated with disclaimer in footer of every page (FR54)
**And** DOCX generated alongside
**And** audit log attached as separate file (FR17)

---

## Epic 6: Administração & LLM Gateway

Admin gerencia API keys multi-provider, branding e limites de armazenamento.

### Story 6.1: CRUD de API Keys Multi-Provider

As a Admin,
I want to manage API keys for multiple LLM providers,
So that my organization can use different AI models (FR30).

**Acceptance Criteria:**

**Given** Admin accesses API Keys settings
**When** creating/editing an API key
**Then** selects provider (Google, OpenRouter, OpenAI, Anthropic)
**And** key is encrypted with AES-256-GCM before storage (NFR9)
**And** never displayed in plaintext after save

### Story 6.2: Limites de Gasto Mensal

As a Admin,
I want to set monthly spending limits per API key,
So that costs stay under control (FR31).

**Acceptance Criteria:**

**Given** API key has a monthly limit set
**When** cumulative spend reaches 90%
**Then** admin receives warning notification
**And** at 100%, pipeline uses fallback provider or pauses
**And** spend resets on 1st of each month

### Story 6.3: Branding Visual Law

As a Admin,
I want to upload logo and define colors for Visual Law,
So that exported petitions carry my office identity (FR47).

**Acceptance Criteria:**

**Given** Admin accesses Branding settings
**When** uploads logo and selects primary/secondary colors
**Then** branding is saved to tenant schema
**And** legal-designer uses these for all exports

### Story 6.4: Configuração de Armazenamento

As a Admin,
I want to see and manage storage limits for my organization,
So that I know how much space remains (FR48).

**Acceptance Criteria:**

**Given** organization has a storage limit (default 5GB)
**When** uploads approach the limit
**Then** dashboard shows usage bar
**And** at 90%, warns admin
**And** at 100%, blocks new uploads until cleared

---

## Epic 7: WhatsApp & Instagram

Clientes atendidos por IA com RAG, detecção de sentimento e escalação automática.

### Story 7.1: IA Responde via WhatsApp/Instagram

As a Cliente,
I want to ask about my case status via WhatsApp,
So that I get instant answers without calling (FR32).

**Acceptance Criteria:**

**Given** client sends message to org WhatsApp
**When** IA processes with RAG knowledge base
**Then** responds with case status and next deadline
**And** response in < 10 seconds

### Story 7.2: Detecção de Sentimento & Escalação

As a System,
I want to detect negative sentiment and escalate to human,
So that distressed clients get personal attention (FR33).

**Acceptance Criteria:**

**Given** client message has negative sentiment (fear, anger)
**When** sentiment analysis flags it
**Then** empathetic response + "estou encaminhando para seu advogado"
**And** conversation transferred to Coordinator dashboard
**And** full context (history + sentiment) preserved

### Story 7.3: Config RAG & Escalation Rules

As a Admin,
I want to upload documents and configure escalation rules,
So that the AI responds accurately (FR34, FR35).

**Acceptance Criteria:**

**Given** Admin accesses WhatsApp Config
**When** uploads documents (max 50) and sets prompt/rules
**Then** RAG index is rebuilt with new documents
**And** escalation rules applied to all conversations

### Story 7.4: Coordenador Responde pelo Dashboard

As a Coordenador,
I want to respond to escalated conversations from the dashboard,
So that I don't need a separate WhatsApp device (FR36).

**Acceptance Criteria:**

**Given** escalated conversation appears in dashboard
**When** Coordinator types reply
**Then** message sent via WhatsApp Business API to client
**And** conversation history is unified

---

## Epic 8: Gestão Processual & Financeiro

Coordenador gerencia prazos, intimações por e-mail, honorários e custas.

### Story 8.1: Calendário de Prazos

As a Coordenador,
I want to manage deadlines with a calendar view,
So that no deadline is missed (FR37).

**Acceptance Criteria:**

**Given** Coordinator accesses Deadlines module
**When** creates/edits deadline for a process
**Then** deadline appears in calendar view
**And** push notification sent 48h and 24h before (FR38)

### Story 8.2: Recebimento de Intimações (IMAP)

As a System,
I want to receive court notifications via IMAP,
So that intimações are automatically captured (FR39, FR40).

**Acceptance Criteria:**

**Given** IMAP email is configured for the org
**When** email arrives from court
**Then** system parses content and extracts deadline/process data
**And** creates deadline entry automatically
**And** notifies Coordinator

### Story 8.3: Honorários & Custas

As a Coordenador,
I want to register fees and costs per process,
So that I can track the office finances (FR41, FR42).

**Acceptance Criteria:**

**Given** Coordinator opens process financial tab
**When** registers honorário or custa
**Then** record is linked to the process
**And** totals visible per process

### Story 8.4: Fluxo de Caixa

As a Coordenador,
I want to see a cash flow overview,
So that I understand the office financial health (FR43).

**Acceptance Criteria:**

**Given** Coordinator accesses Financial module
**When** dashboard renders
**Then** shows monthly income (honorários) vs expenses (custas)
**And** filterable by period

---

## Epic 9: Analytics, Billing & Transferências

Dashboard produtividade, custos de tokens, billing automático e transferência Light→PRO.

### Story 9.1: Transferência de Processo Light→PRO

As a Advogado Light,
I want to transfer my process to a Coordinator,
So that they can review and finalize it (FR19).

**Acceptance Criteria:**

**Given** Light user has a completed pipeline
**When** clicks "Transferir para Coordenador"
**Then** selects coordinator from org user list
**And** process status changes to TRANSFERRED
**And** notification sent to coordinator (in-app + WhatsApp)
**And** full audit trail transfers with process

### Story 9.2: Dashboard de Produtividade

As a Coordenador,
I want to see productivity metrics,
So that I can optimize the team's output (FR44, FR45).

**Acceptance Criteria:**

**Given** Coordinator accesses Analytics
**When** dashboard renders
**Then** shows petitions/week, avg time, top users
**And** can compare with previous periods (FR45)

### Story 9.3: Monitoramento de Custos de Tokens

As a Admin,
I want to monitor token costs per organization,
So that I can manage AI spending (FR46).

**Acceptance Criteria:**

**Given** Admin accesses cost analytics
**When** dashboard renders
**Then** shows spend by provider, by user, by period
**And** charts show trend over time (shadcn Chart)

### Story 9.4: Billing & Assinaturas

As a System,
I want to manage recurring subscriptions automatically,
So that organizations are billed correctly (FR55).

**Acceptance Criteria:**

**Given** organization has active subscription
**When** billing cycle runs
**Then** charges via payment gateway (Light R$19,90 / PRO R$99,90)
**And** on failure, retries 3x then notifies admin
**And** plan downgrade on persistent failure

---

## Epic 10: Offline, Documentação & Docker

Modo offline com sync, manual integrado e deploy Docker self-hosted.

### Story 10.1: Draft Offline com Sync

As a Advogado,
I want to create process drafts offline,
So that I can work without internet (FR51).

**Acceptance Criteria:**

**Given** user is offline (service worker detects)
**When** creates process draft
**Then** data saved in IndexedDB
**And** when online, syncs to server without data loss (NFR29)
**And** conflict resolution: server wins on conflicts

### Story 10.2: Manual de Texto Integrado

As a Advogado,
I want to access a built-in user manual,
So that I learn the platform without external training (FR52).

**Acceptance Criteria:**

**Given** user clicks Help icon
**When** manual opens in Sheet (lateral)
**Then** searchable text with sections for each feature
**And** contextual: shows relevant section based on current page

### Story 10.3: Docker Compose Deploy

As a Admin Self-Hosted,
I want to deploy OpenDoc via Docker Compose,
So that I run it on my own infrastructure (FR56, FR58).

**Acceptance Criteria:**

**Given** admin has Docker installed
**When** runs `docker-compose up`
**Then** PostgreSQL, Redis, Server and Dashboard start
**And** accessible on configured ports
**And** works without external SaaS (except LLM providers)

### Story 10.4: Configuração via .env

As a Admin Self-Hosted,
I want to configure the system via environment variables,
So that setup is standardized and secure (FR57).

**Acceptance Criteria:**

**Given** `.env.example` exists with all variables documented
**When** admin copies to `.env` and fills values
**Then** system reads DB_URL, JWT_SECRET, ENCRYPTION_KEY, etc.
**And** missing required vars cause startup error with clear message

