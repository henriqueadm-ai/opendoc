---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-core-experience', 'step-04-emotional-response', 'step-05-inspiration', 'step-06-design-system', 'step-07-defining-experience', 'step-08-visual-foundation', 'step-09-design-directions', 'step-10-user-journeys', 'step-11-component-strategy', 'step-12-ux-patterns', 'step-13-responsive-accessibility', 'step-14-complete']
inputDocuments:
  - prd.md
  - product-brief-opendoc.md
  - product-brief-opendoc-distillate.md
  - project-context.md
  - implementation-readiness-report-2026-04-13.md
---

# UX Design Specification — OpenDoc

**Autor:** Henrique
**Data:** 2026-04-13T05:09:01-03:00

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Visão do Projeto

O OpenDoc é uma plataforma onde advogados e estagiários submetem documentos de um caso e recebem uma petição jurídica pronta, formatada em Visual Law, com garantia LGPD. O diferencial visual é a transparência radical: o usuário vê os agentes trabalhando em um escritório isométrico em tempo real. O sistema é projetado para ser usado sem treinamento técnico, com manual integrado.

### Usuários-Alvo

| Persona | Tech-Savviness | Dispositivo | Contexto de Uso |
|---------|---------------|-------------|----------------|
| **Coordenador NPJ (PRO)** | Médio | Desktop (escritório) | Revisa peças, gerencia equipe, prazos, WhatsApp |
| **Estagiário (Light)** | Baixo-Médio | Desktop (lab universitário/casa) | Cria petições, aprende direito |
| **Admin** | Alto | Desktop | Setup inicial, API keys, usuários |
| **Cliente (WhatsApp)** | Baixo | Mobile | Consulta andamento do processo |

### Desafios de Design

1. **Complexidade vs. Simplicidade:** 59 FRs, 13 estágios de pipeline, 43 agentes — mas o estagiário precisa usar sem treinamento. Esconder complexidade sem perder transparência.
2. **Escritório isométrico (Phaser):** Game engine dentro de plataforma jurídica. Informativo e bonito sem ser distrativo. Fallback textual igualmente útil.
3. **Tela de discussão H↔IA:** Intuitiva como WhatsApp, poderosa como editor de documentos.
4. **Tema claro/escuro:** Dashboard funcional nos dois modos sem perder legibilidade.
5. **Disclaimer sem fricção:** 3 locais de disclaimer visíveis sem irritar o uso diário.

### Oportunidades de Design

1. **Onboarding dramático:** Primeiro pipeline do estagiário como "momento wow" no escritório isométrico.
2. **Transferência como feature social:** Não apenas handoff, mas aprendizado colaborativo.
3. **Audit log como narrativa visual:** Timeline visual que conta a "história" do processo ao invés de JSON técnico.
4. **Dark mode como padrão:** Advogados trabalham longas horas — dark mode padrão, light mode como alternativa.

## Core User Experience

> *"Nunca confie em nada que eu disser, confira e tire suas próprias conclusões"*
> — Slogan do OpenDoc

### Experiência Definidora

**Ação core:** Tela de Discussão Humano ↔ IA — o momento onde o advogado lê a peça gerada, questiona decisões da IA, sugere mudanças e aprova o resultado. É simultaneamente revisão jurídica, aprendizado e controle de qualidade.

**Loop principal:** Upload → Ver pipeline (transparência) → Discussão H↔IA (core) → Visual Law → Exportar

### Estratégia de Plataforma

| Aspecto | Decisão |
|---------|--------|
| Plataforma primária | Web (SPA React 19 + Vite 6) |
| Interação primária | Mouse/teclado (desktop-first) |
| Modo offline | Service Worker + IndexedDB para drafts |
| Game engine | Phaser 3 para escritório isométrico (com fallback textual) |
| Tema | Dark mode padrão, light mode alternativa |
| Responsividade | Desktop-first, responsivo para tablets, WhatsApp via API |

### Interações Sem Esforço

| Interação | Design Goal |
|-----------|------------|
| Upload de documentos | Drag & drop, aceitar qualquer formato, mostrar progresso |
| Criar nova petição | 3 cliques: tipo → brief → upload → start |
| Alternar entre processos | Sidebar sempre visível com lista de processos |
| Ver progresso do pipeline | Escritório isométrico auto-atualiza via WebSocket |
| Aprovar no checkpoint | Botão verde destacado, discussão disponível |
| Exportar PDF/DOCX | 1 clique após aceite do disclaimer |
| Trocar tema | Toggle no header, persiste por usuário |

### Momentos Críticos de Sucesso

| Momento | O que o usuário sente | Se falhar... |
|---------|----------------------|-------------|
| Primeiro pipeline | "Wow, posso VER tudo acontecendo!" | Perde confiança na plataforma |
| Discussão H↔IA | "A IA entende minha pergunta e melhora a peça" | Abandona a plataforma |
| Audit log | "Posso PROVAR que foi seguro" | Não há diferencial vs concorrentes |
| Visual Law | "A peça ficou profissional" | Achará que é "mais uma ferramenta" |
| Transferência | "Meu coordenador pode revisar" | Workflow do NPJ quebra |

### Princípios de Experiência

1. **Transparência primeiro:** Cada ação da IA deve ser visível e compreensível. Nunca "confie em mim" — sempre "veja por si mesmo".
2. **Segurança sem fricção:** LGPD, disclaimers e audit trail funcionam automaticamente. O advogado sente segurança sem fazer nada extra.
3. **Aprendizado embutido:** A interface ensina enquanto o advogado trabalha. A tela de discussão é uma sala de aula disfarçada.
4. **Progressão visual:** O usuário deve sentir progresso constante — do upload ao PDF final, cada etapa com feedback visual.

## Desired Emotional Response

### Objetivos Emocionais Primários

| Emoção | Como se manifesta | Por que importa |
|--------|------------------|----------------|
| **Confiança verificável** | "Eu SEI que está seguro porque CONFERI" | Core do slogan — não é "confie", é "confira" |
| **Competência amplificada** | "Eu fiz isso, a IA me ajudou" | O advogado se sente autor, não dependente |
| **Controle total** | "Nada aconteceu sem eu ver" | Transparência radical gera controle |

### Jornada Emocional

| Etapa | Emoção Desejada | Anti-emoção a Evitar |
|-------|----------------|---------------------|
| Primeiro acesso | Curiosidade + "Isso é diferente" | Intimidação |
| Upload | Facilidade + "Foi rápido" | Frustração com formatos |
| Pipeline rodando | Fascínio + "Posso ver tudo" | Ansiedade de espera |
| Anonimização | Alívio + "Meus dados estão protegidos" | Desconfiança |
| Discussão H↔IA | Inteligência + "Estou aprendendo" | Confusão |
| Erro no pipeline | Calma + "Sei o que fazer" | Pânico |
| Visual Law | Orgulho + "Ficou profissional" | Decepção |
| Audit log | Segurança + "Posso provar" | Irrelevância |
| Exportação | Satisfação + "Feito em 30min" | Mais trabalho? |
| Retorno | Familiaridade + "Sei onde tudo está" | Reaprender |

### Micro-emoções Críticas

| Par Emocional | Posição do OpenDoc | Como garantir |
|---------------|-------------------|---------------|
| Confiança vs Ceticismo | Confiança verificável | Mostrar TUDO — tokens, PIIs, audit trail |
| Competência vs Dependência | Competência | IA como assistente, humano como autor |
| Calma vs Ansiedade | Calma | Progress bars, estimativas de tempo, erros amigáveis |
| Orgulho vs Vergonha | Orgulho | Visual Law profissional, peça bonita |
| Curiosidade vs Tédio | Curiosidade | Escritório isométrico, agentes com personalidade visual |

### Implicações de Design

| Emoção Desejada | Decisão de UX |
|----------------|---------------|
| Confiança verificável | Audit log como timeline visual, não JSON. Contadores em tempo real. |
| Competência amplificada | Tela de discussão permite perguntar "por quê?" — IA explica, humano decide |
| Controle total | Nenhuma ação irreversível sem confirmação. Pipeline pausável. |
| Calma em erros | Notificações gentis com opções claras. Nunca vermelho gritante. |
| Orgulho na entrega | Preview do PDF final antes da exportação. Branding profissional visível. |
| Curiosidade contínua | Agentes com nomes e ícones próprios no isométrico. Micro-animações. |

### Princípios de Design Emocional

1. **"Confira"** — Todo elemento de IA que gera conteúdo deve ter um CTA para o humano verificar. Nunca auto-aprovar.
2. **"Você é o autor"** — A peça é do advogado, não da IA. Linguagem sempre "sua petição", nunca "a petição gerada".
3. **"Calma sob pressão"** — Erros são oportunidades, não falhas. Linguagem positiva + opções claras.
4. **"Progresso, não espera"** — Substituir spinners genéricos por visualização de progresso real (agentes trabalhando).

## UX Pattern Analysis & Inspiration

### Produtos Inspiradores (Cross-Domain)

**GitHub Actions** — Pipeline visual com estágios, logs expansíveis, status em tempo real. Modelo para os 13 estágios do pipeline jurídico.

**Linear** — UI premium dark-first, tipografia limpa, atalhos de teclado, micro-animações sutis. Modelo de design system base.

**Midjourney** — "Assistir a IA trabalhar": resultado construído progressivamente. Modelo para anonimização e redação em tempo real.

**Vercel Deploy** — Timeline vertical com steps, tempo decorrido, expandível. Modelo para fallback textual do Phaser.

**WhatsApp** — Chat com balões, timestamps, status. Modelo para Tela de Discussão H↔IA.

### Padrões Transferíveis

| Categoria | Padrão | Fonte | Uso no OpenDoc |
|-----------|--------|-------|---------------|
| Navegação | Sidebar fixa + workspace | Linear/Notion | Lista de processos à esquerda, conteúdo à direita |
| Pipeline | Estágios visuais com status | GitHub Actions | 13 estágios com ícones de agente, duração, custo |
| Progresso | Resultado construído progressivamente | Midjourney | Anonimização visível, peça tomando forma |
| Fallback | Timeline vertical expandível | Vercel Deploy | Modo texto quando Phaser não performa |
| Discussão | Chat com balões + inline actions | WhatsApp | Tela H↔IA com diffs e botões aprovar/rejeitar |
| Tema | Dark-first com toggle suave | Linear | Dark padrão, light alternativa |
| Atalhos | Command palette (Cmd+K) | Linear | Busca global de processos, agentes, ações |
| Erros | Toast gentil + ação inline | Vercel | Erros de conversão com opções no toast |

### Anti-Padrões a Evitar

| Anti-Padrão | Por que evitar no OpenDoc |
|-------------|--------------------------|
| Caixa-preta | Vai contra o slogan "confira" |
| Excesso de modais | Interrompe fluxo. Usar inline actions. |
| Dashboards sobrecarregados | Advogados não são analistas de dados |
| Loading spinner sem contexto | Substituir por agentes trabalhando no isométrico |
| Formulários longos | Brief textual livre + upload drag&drop |
| Vermelho = erro | Usar amber/yellow para recuperáveis. Vermelho só para bloqueio total. |

### Estratégia de Inspiração

**Adotar:** Sidebar + workspace (Linear), Chat para H↔IA (WhatsApp), Dark-first (Linear)

**Adaptar:** Pipeline visual (GitHub Actions → isométrico Phaser), Progresso progressivo (Midjourney → anonimização em tempo real), Command palette (Linear → busca de processos)

**Inovar:** Escritório isométrico como metáfora de pipeline jurídico, Audit log como timeline narrativa, Agentes com personalidade visual

## Design System Foundation

### Escolha: shadcn/ui + Tailwind CSS v4

Componentes copy-paste shadcn/ui sobre Tailwind CSS v4. Você é dono do código — cada componente é copiado para `src/components/ui/` e pode ser customizado livremente.

### Justificativa

1. **Padrão da indústria** — shadcn/ui é o standard em 2026 para SaaS premium (Linear, Vercel, etc.)
2. **React 19 + Vite 6 + TypeScript** — compatibilidade nativa confirmada
3. **Copy-paste, não dependência** — sem lock-in, código é seu
4. **Dark mode nativo** — CSS variables com classe `.dark`, sem config adicional
5. **70+ componentes prontos** — Sidebar, Command (⌘K), Data Table, Sonner (toast), Chart, etc.
6. **Phaser 3 coexiste** — componentes shadcn envolvem o canvas Phaser sem conflito

### Componentes shadcn/ui para OpenDoc

```
Layout
├── Sidebar         → Lista de processos
├── Resizable       → Split view da Discussão H↔IA
├── Tabs            → Alternância de views
└── Scroll Area     → Chat, documento, audit log

Interação
├── Command         → ⌘K busca global (processos, agentes, ações)
├── Dialog          → Confirmações, disclaimers
├── Sonner          → Toast de feedback (erros, sucesso)
└── Switch          → Dark/light toggle

Dados
├── Card            → Stats, pipeline stage cards
├── Table           → Lista de processos
├── Data Table      → Audit log, processos com filtros
├── Badge           → Status do pipeline
├── Progress        → Barra de progresso do pipeline
└── Chart           → Analytics, uso de tokens

Custom (OpenDoc-specific)
├── PipelineCard    → Card expandido com ícone de agente e status
├── ChatBubble      → Balões de conversa H↔IA
├── DiffBlock       → Antes/depois com aceitar/rejeitar
├── IsometricView   → Wrapper do canvas Phaser 3
└── AuditTimeline   → Timeline narrativa com hashes
```

### Design Tokens (shadcn/ui Zinc Theme)

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| `--background` | `240 10% 3.9%` | `0 0% 100%` |
| `--foreground` | `0 0% 98%` | `240 10% 3.9%` |
| `--card` | `240 10% 3.9%` | `0 0% 100%` |
| `--muted` | `240 3.7% 15.9%` | `240 4.8% 95.9%` |
| `--muted-foreground` | `240 5% 64.9%` | `240 3.8% 46.1%` |
| `--accent` | `240 3.7% 15.9%` | `240 4.8% 95.9%` |
| `--border` | `240 3.7% 15.9%` | `240 5.9% 90%` |
| `--destructive` | `0 62.8% 30.6%` | `0 84.2% 60.2%` |
| `--ring` | `240 4.9% 83.9%` | `240 5.9% 10%` |
| `--radius` | `0.5rem` | `0.5rem` |
| **Font** | Inter + JetBrains Mono | Inter + JetBrains Mono |

### Design Direction Decision

**Direções exploradas:** Dashboard completo, Pipeline visual, Discussão H↔IA, Audit Timeline, Feedback/Toasts, Export Preview — todas aplicando tokens shadcn/ui Zinc.

**Direção escolhida:** shadcn/ui Zinc dark-first com componentes compostos, inspiração cross-domain (GitHub Actions + Linear + WhatsApp + Midjourney + Vercel Deploy).

**Rationale:** Estética premium monocromática com acentos sutis é o padrão visual de SaaS moderno. shadcn/ui fornece a base, componentes custom (PipelineCard, ChatBubble, DiffBlock, IsometricView, AuditTimeline) criam a inovação.

## Defining Core Experience

> "Você submete os documentos do caso, assiste os agentes trabalhando no escritório, discute a peça com a IA, e exporta com prova de que nenhum dado sensível vazou."

### Modelo Mental

**Antes (manual):** Pegar documentos → pesquisar jurisprudência → redigir no Word → formatar manualmente → rezar para não errar. 4-8 horas. Sem prova LGPD.

**OpenDoc:** Entregar documentos → equipe virtual trabalha → revisar e ajustar → receber peça pronta com prova de segurança. < 30 min.

### Mecânicas da Experiência

#### Iniciação — "Nova Petição" (3 cliques)
- Botão proeminente na sidebar ou centro do workspace vazio
- Selecionar tipo (inicial, contestação, recurso...)
- Escrever brief textual da tese (textarea livre)
- Drag & drop dos documentos do caso
- Botão "Iniciar Pipeline" — transição animada para escritório isométrico

#### Interação — "Assistir + Intervir"
- Escritório isométrico renderiza agentes em suas mesas
- Cada agente acende quando ativo, mostra progresso
- Painel lateral: tokens gastos, tempo decorrido, estágio atual
- Anonimização visível em tempo real (placeholder tags destacadas)
- Erro: toast amber com opções inline (reenviar/digitar/pular)
- Transição automática para tela de discussão quando redação completa

#### Discussão H↔IA — "O Momento Core"
- Layout split: peça redigida à esquerda, chat à direita
- Chat com balões (WhatsApp-style) para perguntas/respostas
- Modificações da IA: diff inline (antes/depois) com ✓ aceitar / ✗ rejeitar
- Advogado pode editar texto diretamente na peça
- Botão "Aprovar e Formatar" quando satisfeito
- Disclaimer visível mas não bloqueante durante discussão

#### Conclusão — "Exportar com Orgulho"
- Preview do PDF em Visual Law (branding do escritório)
- Audit log como timeline visual narrativa
- Aceite obrigatório do disclaimer (checkbox + botão)
- Download em PDF e/ou DOCX
- Métricas finais: tempo total, custo, tokens, PIIs anonimizados

### Padrões UX

| Elemento | Tipo | Referência |
|----------|------|-----------|
| Sidebar com processos | ✅ Established | Linear, Notion |
| Chat para discussão | ✅ Established | WhatsApp, ChatGPT |
| Drag & drop upload | ✅ Established | Google Drive |
| Escritório isométrico | 🆕 Novel | Inovação OpenDoc |
| Anonimização em tempo real | 🆕 Novel | Inspirado em Midjourney |
| Diff inline na peça | 🔄 Adapted | GitHub PR reviews |
| Audit log como timeline | 🔄 Adapted | Vercel Deploy |

### Critérios de Sucesso

| Critério | Métrica |
|----------|---------|
| "Isso funciona" | Primeiro pipeline sem ajuda |
| "Estou no controle" | 100% usam tela de discussão |
| "Foi rápido" | Pipeline < 30 min |
| "É seguro" | Advogado confere audit log ≥ 1x |
| "Quero usar de novo" | Retorno > 80% na 2ª semana |

## Visual Design Foundation

### Color System — Dark Mode (Padrão)

| Role | HSL | Uso |
|------|-----|-----|
| `--bg-base` | `hsl(222, 22%, 8%)` | Fundo principal |
| `--bg-surface` | `hsl(222, 20%, 12%)` | Cards, panels, sidebar |
| `--bg-elevated` | `hsl(222, 18%, 16%)` | Modais, hover |
| `--border` | `hsl(222, 15%, 20%)` | Bordas sutis |
| `--accent` | `hsl(215, 100%, 58%)` | CTAs, links, seleção |
| `--success` | `hsl(152, 72%, 46%)` | Pipeline ok, aprovação |
| `--warning` | `hsl(38, 95%, 55%)` | Erros recuperáveis |
| `--danger` | `hsl(0, 72%, 55%)` | Bloqueio total, veto |
| `--text-primary` | `hsl(220, 15%, 93%)` | Texto principal |
| `--text-secondary` | `hsl(220, 12%, 60%)` | Labels |
| `--text-muted` | `hsl(220, 10%, 42%)` | Timestamps |

### Color System — Light Mode

| Role | HSL |
|------|-----|
| `--bg-base` | `hsl(220, 20%, 98%)` |
| `--bg-surface` | `hsl(220, 18%, 95%)` |
| `--bg-elevated` | `hsl(0, 0%, 100%)` |
| `--accent` | `hsl(215, 90%, 48%)` |
| `--text-primary` | `hsl(222, 22%, 12%)` |

### Cores de Pipeline (Agentes)

| Estágio | Cor HSL |
|---------|---------|
| Ingestão | `hsl(200, 80%, 55%)` cyan |
| Conversão | `hsl(270, 70%, 55%)` purple |
| Anonimização | `hsl(330, 75%, 55%)` pink |
| Roteamento | `hsl(45, 90%, 55%)` gold |
| Especialista | `hsl(150, 70%, 45%)` green |
| Jurisprudência | `hsl(180, 70%, 45%)` teal |
| Redação | `hsl(215, 100%, 58%)` blue |
| Discussão H↔IA | `hsl(30, 90%, 55%)` orange |
| Visual Law | `hsl(290, 65%, 55%)` violet |
| Exportação | `hsl(120, 65%, 45%)` green |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 28px | 700 |
| H2 | Inter | 22px | 600 |
| H3 | Inter | 18px | 600 |
| Body | Inter | 14px | 400 |
| Caption | Inter | 12px | 400 |
| Mono | JetBrains Mono | 13px | 400 |
| Label | Inter | 11px | 500 |

### Spacing (4px/8px Grid)

`--space-1` 4px · `--space-2` 8px · `--space-3` 12px · `--space-4` 16px · `--space-5` 24px · `--space-6` 32px · `--space-8` 48px

### Layout Principal

```
┌──────────────────────────────────────────────┐
│ Header (48px) — Logo, Search, Theme, User    │
├────────┬─────────────────────────────────────┤
│ Sidebar│          Workspace                  │
│ (240px)│   (isométrico / discussão /         │
│ Lista  │    formulário / analytics)          │
│ de     │                                     │
│ proc.  ├─────────────────────────────────────┤
│        │  Panel (opcional, 240px)             │
│        │  Métricas, audit log, tokens         │
└────────┴─────────────────────────────────────┘
```

### Acessibilidade

- Contraste WCAG AA: 4.5:1 texto, 3:1 UI grande
- Focus ring accent 2px em todos interativos
- `prefers-reduced-motion` desativa Phaser animations
- Fallback textual com ARIA labels para isométrico
- Rem-based, zoom 200%

### Micro-animações

| Elemento | Duração |
|----------|---------|
| Fade page transition | 150ms ease-out |
| Agente pulse glow | 1.5s infinite |
| Toast slide-in | 200ms ease-out |
| Theme cross-fade | 300ms ease |
| Diff highlight | 500ms ease |
| Pipeline step check | 300ms spring |

## User Journey Flows

### J1: Primeira Petição (Onboarding)

Login → Dashboard vazio → Click 'Nova Petição' → Selecionar tipo → Brief da tese → Drag & drop docs → Validação → Iniciar Pipeline → Escritório Isométrico → Discussão H↔IA → Aprovar → Visual Law → Disclaimer → Download → 🎉 Métricas

**Entry:** Dashboard vazio · **Steps to value:** 6 cliques · **Tempo:** < 30 min

### J2: Discussão H↔IA (Core)

Pipeline entrega peça → Split view (Doc + Chat) → IA apresenta sugestões → Advogado escolhe: pergunta / aceita diff / rejeita diff / edita direto → Loop até satisfeito → Aprovar e Formatar → Visual Law

**Entry:** Auto-transição pós-pipeline · **Padrão:** WhatsApp + GitHub PR diff

### J3: Transferência Coordenador

Estagiário conclui → Transferir → Seleciona coordenador → Notificação WhatsApp + in-app → Coordenador abre → Vê audit trail → Revisa → Aprova ou devolve com comentários → Exportar final

**Entry:** Botão transferência · **Padrão:** Handoff + audit trail

### J4: Erro no Pipeline (Recovery)

Pipeline em execução → Tipo de erro: conversão (toast amber, reenviar/digitar/pular) | jurisprudência (sugerir termos) | veto agente (alert vermelho, editar brief)

**Princípio:** Calma, não pânico. Amber = recuperável, Vermelho = veto fundamentado.

### J5: Cliente via WhatsApp

Cliente envia msg → Bot identifica processo → Status + prazo → Opções: detalhes / documento PDF / falar com advogado

**Entry:** Mensagem WhatsApp · **Padrão:** Chatbot + handoff humano

### Padrões de Jornada

| Padrão | Componente shadcn |
|--------|-------------------|
| Entry points claros | Button, Empty |
| Feedback progressivo | Sonner, Progress |
| Decisão inline | Custom DiffBlock |
| Recovery gentil | Sonner com actions |
| Handoff com contexto | Dialog + AuditTimeline |
| Confirmação irreversível | Dialog + Checkbox |

## Component Strategy

### shadcn/ui — Cobertura Direta (17 componentes)

Sidebar, Command, Button, Card, Table, Data Table, Progress, Badge, Sonner, Dialog, Tabs, Resizable, Scroll Area, Switch, Input/Textarea, Checkbox, Skeleton

### Custom Components (5)

#### PipelineCard
Extends shadcn Card. Estados: idle | active (pulse) | done (✓) | error (amber) | veto (red). Click expande log do agente. `aria-live="polite"`.

#### ChatBubble
Variantes: `ai` (esquerda, bg-muted) | `human` (direita, bg-foreground). `role="log"` no container.

#### DiffBlock
Antes/depois com botões aceitar/rejeitar (shadcn Button). Estados: pending | accepted | rejected. `aria-label="Sugestão da IA"`.

#### IsometricView
Container Phaser 3. Fallback: timeline textual. `prefers-reduced-motion` → fallback automático.

#### AuditTimeline
Timeline narrativa com hashes encadeados. Variantes: compact (sidebar) | full (workspace). `role="list"`.

### Roadmap

| Fase | Componentes |
|------|------------|
| P1: Core | Sidebar, Command, Card, Button, Dialog, Input, Textarea, Badge, Switch, Tabs |
| P2: Pipeline | PipelineCard, Progress, Sonner, Skeleton, IsometricView |
| P3: Discussão | ChatBubble, DiffBlock, Resizable, Scroll Area |
| P4: Dados | Table, Data Table, AuditTimeline, Chart |

## UX Consistency Patterns

### Button Hierarchy

| Nível | shadcn | Quando |
|-------|--------|--------|
| Primário | `default` | 1 por tela: "Nova Petição", "Aprovar", "Enviar" |
| Secundário | `secondary` | Complementar: "Exportar DOCX", "Ver Audit" |
| Outline | `outline` | Filtros, opções |
| Ghost | `ghost` | Ícones, toggle |
| Destructive | `destructive` | "Excluir" + sempre pede Dialog |

Máximo 1 primário por contexto. Disabled = `cursor-not-allowed` + tooltip.

### Feedback Patterns

| Situação | Componente | Comportamento |
|----------|-----------|---------------|
| Sucesso | Sonner | 4s auto-dismiss |
| Erro recuperável | Sonner + action | Persist até ação, amber |
| Veto agente | Dialog | Modal blocking, destructive |
| Loading | Skeleton | Placeholders animados |
| Pipeline ativo | PipelineCard pulse | Dot pulsando |
| Progresso | Progress | Barra N/M estágios |
| Validação form | Inline text | blur, destructive |

**Regra:** Amber = recuperável. Vermelho = pare e olhe.

### Form Patterns

Validação ao blur. Labels acima (nunca placeholder-only). Error recovery: focus no primeiro campo com erro. Upload: drag & drop + click + preview. Disabled: opacity 0.5 + tooltip.

### Navigation Patterns

| Contexto | Padrão |
|----------|--------|
| Global | Sidebar fixa 240px |
| Busca | ⌘K Command palette |
| Contexto | Tabs no workspace |
| Mobile | Sidebar → Sheet overlay |

Atalhos: `⌘K` busca, `⌘N` nova petição, `⌘Enter` enviar chat, `Esc` fechar modal.

### Empty States

| Contexto | CTA |
|----------|-----|
| Dashboard sem processos | [+ Nova Petição] |
| Busca sem resultados | [Limpar filtros] |
| Chat novo | Focus no input |

### Modal Patterns

Dialog para confirmações. Sheet lateral para detalhes. Nunca empilha modais.

## Responsive Design & Accessibility

### Responsive Strategy — Desktop-first

| Tier | Foco | Layout |
|------|------|--------|
| Desktop (1024px+) | Primário | Sidebar + workspace + panel |
| Tablet (768-1023px) | Secundário | Sidebar colapsável, workspace full |
| Mobile (320-767px) | Consulta | Sheet, 1 coluna, pipeline simplificado |

### Breakpoints (Tailwind v4)

`sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px · `2xl` 1536px

### Adaptações

| Componente | Desktop | Mobile |
|-----------|---------|--------|
| Sidebar | 240px visível | Sheet overlay |
| Pipeline | Grid 5 cols | Stack vertical |
| Discussão | Split doc+chat | Tabs |
| Isométrico | Canvas Phaser | Fallback timeline |
| Data Table | Colunas | Cards empilhados |

### Acessibilidade — WCAG AA

- Contraste: 4.5:1 texto, 3:1 UI (shadcn Zinc comply)
- Focus ring: 2px accent em interativos
- Teclado: ⌘K, ⌘N, ⌘Enter, Esc, Tab order lógico
- Skip links: "Pular para conteúdo"
- ARIA: `role="log"` chat, `role="list"` timeline, `aria-live="polite"` pipeline
- Touch: 44×44px mínimo mobile
- Motion: `prefers-reduced-motion` desativa Phaser + pulse
- Zoom: rem-based até 200%
- Cor: nunca único indicador (sempre + ícone + texto)

### Testing

| Tipo | Ferramenta | Frequência |
|------|-----------|-----------|
| A11y | axe-core/Playwright | Cada PR |
| Keyboard | Manual QA | Cada sprint |
| Screen reader | VoiceOver + NVDA | Cada release |
| Responsive | Playwright viewports | Cada PR |
| Performance | Lighthouse ≥ 90 | Cada PR |
