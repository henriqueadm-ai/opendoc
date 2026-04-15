---
title: "Product Brief: OpenDoc — Plataforma de Peticionamento Jurídico com IA Multi-Agente"
status: "complete"
created: "2026-04-13T00:26:20-03:00"
updated: "2026-04-13T00:38:20-03:00"
inputs: ["brain-dump do usuário", "análise do codebase conectese", "dashboard existente", "51 agentes existentes em agents/"]
---

# Product Brief: OpenDoc

## Resumo Executivo

Advogados brasileiros vivem uma contradição: precisam da IA para competir, mas não podem usá-la sem violar a LGPD. Cada documento processado por um modelo de linguagem pode expor dados sensíveis de clientes — e a responsabilidade é do escritório. O resultado? Escritórios que usam IA clandestinamente sem proteção, ou que simplesmente não usam e perdem competitividade.

**OpenDoc** resolve isso com um pipeline transparente de peticionamento jurídico onde **nada vai para a IA sem antes ser anonimizado**. O advogado sobe os documentos do caso, define o tipo de petição e a tese jurídica, e assiste — em tempo real — cada etapa do processamento: conversão de documentos, anonimização LGPD, categorização jurídica, pesquisa de jurisprudência, redação especializada, design visual da peça e revisão final com dados reais restaurados. Como um carro com capô transparente: o advogado vê cada engrenagem girar.

O diferencial fundamental não é apenas a IA jurídica (jusIA e ProLex já fazem isso) — é a **orquestração transparente de 43+ agentes especializados** operando sob um fluxo LGPD-compliant com **audit trail assinado por hash**, combinada com uma solução completa de gestão de escritório (prazos, WhatsApp, financeiro). A primeira versão será open-source (modelo open-core: versão light gratuita + versão completa comercial), voltada inicialmente para Núcleos de Prática Jurídica (NPJs) universitários como serviço hospedado.

## O Problema

Escritórios de advocacia enfrentam uma tríade de dores:

**1. LGPD como barreira à IA.** Advogados que usam ChatGPT ou similares expõem dados de processos — nomes, CPFs, endereços, detalhes íntimos de casos — diretamente a provedores de IA. Não existe fluxo confiável que garanta anonimização antes do envio. O risco é real: sanções da ANPD, perda de OAB, e danos morais dos clientes.

**2. Produção artesanal de peças jurídicas.** Cada petição exige pesquisa jurisprudencial manual (horas em sites de tribunais e Jusbrasil), redação especializada por ramo do direito, formatação em padrões visuais do escritório, e revisão cruzada. Um NPJ universitário com estagiários em formação precisa produzir volume com qualidade pedagógica, usando sistemas mistos e processos manuais.

**3. Gestão fragmentada.** Prazos em planilhas, comunicação com clientes por WhatsApp pessoal, financeiro em sistemas separados. Cada ferramenta é uma ilha que não conversa com o fluxo de trabalho real do advogado.

## A Solução

OpenDoc é uma plataforma web com um **escritório virtual isométrico** (Phaser.js) onde agentes de IA são visualizados como personagens trabalhando em tempo real. O fluxo central:

### Pipeline de Peticionamento (11 estágios visíveis)

1. **Requisição** — Advogado seleciona tipo de petição (inicial, contestação, impugnação, etc.) e fornece um brief com a tese jurídica buscada
2. **Ingestão** — Upload de documentos (PDF, DOCX, XLS, áudio, imagens) via drag-and-drop
3. **Conversão** — Extração de texto de todos os formatos (OCR para imagens, transcrição para áudio)
4. **Anonimização LGPD** — Agente `lgpd-anonymizer` identifica e remove dados sensíveis (dados bancários, contas, valores sigilosos) usando 13 categorias de PII
5. **Pseudonimização** — Dados pessoais (nomes, CPFs, endereços, OAB, CNPJ, telefones, e-mails, empresas, placas, cidades) substituídos por placeholders padronizados (`[PESSOA_1]`, `[CPF_1]`, etc.)
6. **Dicionário de Placeholders** — Mapa JSON seguro de dados reais ↔ placeholders, armazenado localmente na pasta do processo
7. **Categorização Jurídica** — Agente `task-router` identifica sub-ramos do direito e define competência, roteando para especialistas
8. **Especialistas** — 43 agentes especializados (cível, penal, tributário, trabalhista, ECA, administrativo, digital, ambiental, etc.) — cada um com v2.0 incluindo workflow operacional, veto conditions, e skills de scraping/validação
9. **Jurisprudência** — Busca automatizada em sites .jus.br e scraping do Jusbrasil (dados públicos sem sigilo) para localizar número do processo no código-fonte da página, com preferência pelo tribunal do estado do processo. Toda URL validada pelo `jurisprudencia-validator`
10. **Redação Jurídica** — Agente `legal-synthesizer` compõe a peça com o estilo, tom, voz, sentimento e fundamentação adequados à tese solicitada no brief
11. **Visual Law & Legal Design** — Agente `legal-designer` formata com logo e cores do escritório, seguindo princípios de Legal Design
12. **Revisão & Restauração** — Agente `lgpd-restorer` identifica os placeholders, restaura dados reais usando o dicionário, e exporta em PDF e DOCX

> **Revisão humana obrigatória:** A peça finalizada requer aprovação explícita do advogado antes de ser considerada concluída (Provimento nº 205/2021 CFOAB). A UX enforça este checkpoint — não é opcional.

### Gestão do Escritório

- **Controle de prazos processuais** com alertas e dashboard de vencimentos
- **Atendimento a clientes via WhatsApp** integrado ao dashboard
- **Gestão financeira** do escritório (honorários, custas, fluxo de caixa)
- **Dashboard de produtividade** com métricas de tokens consumidos por atividade e por petição

### Transparência Total ("Capô Transparente")

Cada etapa é visível no escritório isométrico. O advogado vê qual agente está trabalhando, quantos tokens está consumindo, e pode intervir em checkpoints decisórios. O orquestrador executa às claras — nada acontece em caixa-preta.

## O Que Torna Isto Diferente

| Aspecto | jusIA / ProLex | OpenDoc |
|---------|---------------|---------|
| Pipeline LGPD | Confia no prompt | Anonimização pré-envio + dicionário reversível + **audit trail com hash** |
| Transparência | Caixa-preta | Capô transparente — cada agente visível com métricas |
| Agentes especializados | 1-5 genéricos | 43+ agentes v2.0 com veto conditions e skills |
| Jurisprudência | Busca genérica | Scraping .jus.br + Jusbrasil com validação automática de URLs |
| Visual Law | Texto puro | Design com marca do escritório (logo + cores) |
| Gestão integrada | Só IA | Prazos + WhatsApp + Financeiro |
| Modelo de negócio | Proprietário/SaaS | Open-core (light grátis + completa paga) |
| Multi-LLM | 1 provedor fixo | Todos os provedores via admin (OpenRouter, Google, OpenAI, Anthropic...) |
| Conformidade | Autogerida | Audit trail assinado por hash para provar anonimização |

O **moat real** é a orquestração: 43+ agentes especializados v2.0, cada um com veto conditions que impedem erros jurídicos graves, coordenados por um orquestrador que entende competência jurídica e hierarquia de tribunais — tudo executando de forma transparente, auditável e LGPD-compliant.

## Quem Isto Serve

**Primeiro mercado: Núcleos de Prática Jurídica (NPJs)**
- Universidades com clínicas jurídicas para alunos de Direito
- Volume alto, orçamento zero, necessidade pedagógica
- Serviço hospedado com espaço limitado por NPJ, acesso restrito a coordenadores
- Alunos que aprendem com OpenDoc levam para seus escritórios ao se formar — **flywheel natural de aquisição**

**Usuário primário: Advogado-gestor de escritório pequeno/médio**
- 3-20 advogados, precisa de volume e qualidade
- Não é técnico — precisa de interface visual e intuitiva
- Responsável pela LGPD do escritório
- Acompanha métricas de custo e produtividade

**Usuário secundário: Estagiários e advogados juniores**
- Aprendem vendo o pipeline operar
- Usam os checkpoints para validar teses jurídicas com supervisores

## Critérios de Sucesso

| Métrica | Meta MVP |
|---------|----------|
| Tempo médio de produção de petição | < 30 min (vs 4-8h manual) |
| % de dados sensíveis anonimizados corretamente | > 99% |
| NPJs utilizando ativamente | 3+ nos primeiros 6 meses |
| Custo médio de tokens por petição | Visível e < R$ 5 |
| Peças que passam revisão humana sem alteração estrutural | > 70% |

## Escopo

### MVP (v1.0) — Inclui:
- Pipeline completo de peticionamento (12 estágios)
- 43+ agentes especializados por ramo do direito (v2.0 com veto conditions)
- Agentes de pipeline: `lgpd-anonymizer`, `lgpd-restorer`, `task-router`, `legal-analyst`, `legal-synthesizer`, `legal-designer`, `data-extractor`
- Pesquisa de jurisprudência com scraping .jus.br + Jusbrasil + `jurisprudencia-validator`
- Visual Law & Legal Design com branding do escritório
- Exportação PDF e DOCX
- Dashboard isométrico com visualização em tempo real e métricas de tokens
- Módulo de controle de prazos processuais
- Integração WhatsApp para atendimento a clientes
- Módulo financeiro básico (honorários, custas, fluxo de caixa)
- Painel de administração com gestão segura de API keys multi-provedor (OpenRouter, OpenAI, Google, Anthropic, etc.)
- Controle de usuários e permissões (coordenadores para NPJs)
- Audit trail assinado por hash (prova de anonimização para LGPD)
- Revisão humana obrigatória enforced na UX

### Modelo de licenciamento: Open-Core
- **Versão Light (gratuita):** Pipeline básico de peticionamento, agentes core, 1 LLM provider
- **Versão Completa (paga):** Todos os 43+ agentes, multi-LLM, gestão integrada (prazos, WhatsApp, financeiro), Visual Law avançado, audit trail completo

### Deployment:
- **SaaS hospedado** (padrão para NPJs) — limites de espaço por organização, coordenadores como admins
- **Self-hosted Docker** (opcional para escritórios) — controle total dos dados locais

### Fora do escopo v1.0:
- App mobile nativo
- Integração automática com PJe/e-SAJ
- Análise preditiva de decisões judiciais
- Marketplace de templates de peças jurídicas

## Visão

Se o OpenDoc funcionar, em 2-3 anos ele se torna a **plataforma open-source de referência para prática jurídica assistida por IA no Brasil**. NPJs adotam como ferramenta padrão de ensino — alunos formados levam a cultura OpenDoc para seus escritórios. Escritórios pequenos migram do SaaS caro para uma solução open-core que podem hospedar ou usar hospedada, com total transparência e controle sobre seus dados.

O pipeline LGPD-compliant com audit trail se torna um padrão replicável para outras áreas reguladas (saúde, finanças). A arquitetura de 43+ agentes especializados com orquestração visual vira referência para aplicações de IA que precisam da confiança do usuário final. O Visual Law como diferenciador eleva o padrão estético das peças jurídicas brasileiras.

## Conformidade & Regulatório

- **LGPD:** Pipeline de anonimização/pseudonimização é o pilar central — dados sensíveis NUNCA chegam ao LLM. Audit trail assinado por hash para provar conformidade
- **OAB (Provimento 205/2021):** Peças são ferramentas de apoio — revisão humana obrigatória enforced na UX como checkpoint final
- **Dados em trânsito:** HTTPS obrigatório. Self-hosted via Docker para escritórios que exigem controle local total
- **Multi-tenant:** Controle de acesso garante isolamento entre organizações (NPJs/escritórios)
- **API keys:** Cada organização gerencia suas próprias chaves via painel de administração seguro — OpenDoc não centraliza credenciais
- **Jusbrasil:** Acesso apenas a dados públicos (sem sigilo processual), extraindo número do processo do código-fonte das páginas
