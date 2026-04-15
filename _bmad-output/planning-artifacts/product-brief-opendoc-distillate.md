---
title: "Product Brief Distillate: OpenDoc"
type: llm-distillate
source: "product-brief-opendoc.md"
created: "2026-04-13T00:38:20-03:00"
purpose: "Token-efficient context for downstream PRD creation"
---

# Distilado — OpenDoc Product Brief

## Arquitetura Técnica Existente (do codebase)

- **CLI backend:** Node.js >=20 ESM puro, `bin/conectese.js` como entrypoint
- **Dashboard:** React 19 + Vite 6 + TypeScript, Zustand 5 para state, Phaser 3.90 para visualização isométrica
- **Real-time:** WebSocket via Vite plugin customizado (`teamWatcher.ts`), chokidar para file watching
- **REST API embutida no Vite:** `/api/upload` (busboy multipart), `/api/snapshot`, `/api/team/:name/checkpoint`
- **Upload pipeline existente:** IngestionModal → `PROCESSOS/` com auto-geração de case ID `DD_MM_YYYY_NNNN`
- **CheckpointModal** já implementado para aprovação humana
- **SDK disponível:** `@google/genai` ^1.48.0, `@modelcontextprotocol/sdk` ^1.29.0
- **Extração:** `pdf-parse` ^2.4.5, `cheerio` ^1.2.0, `marked` ^17.0.5, `html-to-docx` ^1.8.0
- **Scraping:** `puppeteer` ^24.40.0, `cloudscraper` ^4.6.0
- **i18n:** 3 locales (en, pt-BR, es) com `t(key, vars)` e fallback

## Agentes Existentes (51 no diretório agents/)

### Pipeline Core (8 agentes)
- `lgpd-anonymizer` — v1.0, 13 categorias de PII com tokens padronizados, gera dicionário JSON
- `lgpd-restorer` — restaura dados reais a partir do dicionário
- `task-router` — orquestrador/roteador de competência jurídica
- `data-extractor` — conversão multi-formato para texto
- `legal-analyst` — análise geral do caso
- `legal-synthesizer` — redação da peça jurídica
- `legal-designer` — Visual Law & Legal Design
- `conectese_admin` — administração do sistema

### Especialistas Jurídicos (43 agentes, todos com AGENT.md)
- Todos em v2.0 com: workflow operacional, veto conditions, skills protocol
- Skills integradas: `conectese-scraper`, `jurisprudencia-validator`, `legal-pricing`
- Estrutura padrão: Persona → Core Capabilities → Workflow Operacional → Skills Protocol → Veto Conditions → LGPD Strict Mode
- Ramos cobertos: civil, penal, tributário, trabalhista, consumidor, família, constitucional, administrativo, empresarial, ambiental, ECA, digital, eleitoral, militar, previdenciário, agrário, imobiliário, bancário, securitário, marítimo, aduaneiro, aeroportuário, desportivo, urbanístico, indígena, sindical, societário, financeiro, econômico, internacional, médico/saúde, notarial/registral, propriedade intelectual, trânsito, direitos humanos + processuais (civil, penal, trabalhista, militar)

### Observação: Duplicatas
- Existem pares duplicados: `direito-processu*al*-civil` e `direito-process*u*al-civil` (com variação ortográfica). Verificar e consolidar no PRD.

## Requisitos Técnicos Implícitos (não mencionados mas necessários)

- **OCR:** Tesseract.js ou similar para imagens → texto (não existe ainda no package.json)
- **Transcrição de áudio:** Whisper API ou Google Speech-to-Text (não existe ainda)
- **XLS parsing:** `xlsx` ou `exceljs` para extrair texto de planilhas (não existe ainda)
- **Hash para audit trail:** `crypto.createHash('sha256')` nativo do Node.js — sem dependência extra
- **PDF generation:** Para exportação final — `puppeteer` já disponível como dependência opcional
- **Docker:** Dockerfile para self-hosted — inexistente, precisa ser criado

## Decisões do Usuário Confirmadas

- **43 agentes no MVP:** Confirmado — todos os 43 ramos + 8 pipeline core. Já existem no codebase
- **Jusbrasil:** Scraping de dados públicos (sem sigilo), extração do número do processo no código-fonte
- **Licença:** Open-core (versão light gratuita + versão completa paga com mais funcionalidades)
- **Deployment:** SaaS hospedado como padrão (com limites por NPJ, coordenadores como admins) + Docker self-hosted opcional
- **Multi-LLM:** Admin cadastra API keys de qualquer provedor (OpenRouter, OpenAI, Google, Anthropic, etc.)
- **Revisão humana:** Obrigatória — enforced na UX (não bypassável)
- **Audit trail:** Log de anonimização assinado por hash para prova LGPD

## Competidores Identificados

- **jusIA:** IA jurídica brasileira, modelo caixa-preta, sem transparência de pipeline
- **ProLex:** IA jurídica, sem garantia LGPD pré-envio

## Sinais de Escopo (In/Out/Maybe para MVP)

### In (confirmado):
- Pipeline completo 12 estágios
- Todos os 43+ agentes
- Gestão: prazos + WhatsApp + financeiro
- Painel admin com multi-LLM
- Controle de usuários/permissões
- Visual Law com branding
- Exportação PDF + DOCX
- Audit trail com hash
- Dashboard isométrico com métricas de tokens

### Out (confirmado):
- App mobile nativo
- Integração PJe/e-SAJ
- Análise preditiva
- Marketplace de templates

### Maybe (não discutido):
- Modo offline para escritórios sem internet estável
- Integração com e-mail para recebimento automático de intimações
- API pública para integração com sistemas de terceiros
- Módulo de relatórios/analytics avançados

## Oportunidades Endossadas pelo Usuário

- **Visual Law como diferenciador visual** — peças bonitas com design profissional viram argumento competitivo
- **NPJs como canal de distribuição** — alunos formados levam cultura OpenDoc para escritórios, criando flywheel natural
- **Dicionário de placeholders** como módulo standalone de "LGPD as a Service" (não endossado explicitamente mas tem potencial)

## Questões Abertas Para o PRD

1. Quais funcionalidades específicas diferenciam a versão light (gratuita) da completa (paga)?
2. Qual é o modelo de pricing da versão paga? (por usuário/mês? por petição? por NPJ?)
3. Limite de espaço por NPJ no SaaS hospedado — quanto? Baseado em quê?
4. WhatsApp: via API oficial (Business API) ou integração com serviço terceiro?
5. Financeiro: nível de detalhe do módulo (básico = honorários/custas? ou ERP completo?)
6. Como os coordenadores de NPJ cadastram e gerenciam os alunos/estagiários?
7. Consolidar duplicatas nos agents/ (`processu*al*` vs `process*u*al`)
