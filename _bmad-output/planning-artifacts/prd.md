---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - product-brief-opendoc.md
  - product-brief-opendoc-distillate.md
  - project-context.md
workflowType: 'prd'
documentCounts:
  briefs: 2
  research: 0
  brainstorming: 0
  projectDocs: 50
classification:
  projectType: saas_b2b
  domain: legaltech
  complexity: high
  projectContext: brownfield
---

# Product Requirements Document - OpenDoc

**Autor:** Henrique
**Data:** 2026-04-13T00:43:07-03:00

## Executive Summary

O **OpenDoc** é uma plataforma SaaS B2B de peticionamento jurídico assistido por IA, construída sobre o framework Conectese de orquestração multi-agente. Resolve o principal bloqueio da adoção de IA por advogados brasileiros: a impossibilidade de provar que dados sensíveis dos clientes não foram expostos a modelos de linguagem. O OpenDoc implementa um pipeline de 13 estágios onde documentos do caso são convertidos, anonimizados e pseudonimizados **antes** de qualquer envio à IA, com cada etapa visível em tempo real num escritório virtual isométrico — e um audit log assinado por hash como prova documental de conformidade LGPD.

O sistema orquestra **43 agentes especializados** nos ramos do direito brasileiro (cível, penal, tributário, trabalhista, ECA, digital, entre outros), cada um com regras de veto que impedem erros jurídicos graves, apoiados por pesquisa jurisprudencial automatizada em sites .jus.br e Jusbrasil. Após a redação, o advogado participa de uma **sessão de discussão interativa com a IA** para refinar argumentação e tom antes da formatação em Visual Law com identidade visual do escritório. O documento final é exportado em PDF e DOCX com dados reais restaurados, acompanhado do audit log.

O modelo é **open-core** (versão light gratuita + versão completa paga), disponível como **SaaS hospedado** para NPJs (Núcleos de Prática Jurídica) ou como **Docker self-hosted** para escritórios que exigem controle local total. Suporta **qualquer provedor de LLM** — OpenRouter, Google, OpenAI, Anthropic — com gestão segura de API keys por organização.

### O Que Torna Isto Especial

- **Transparência radical:** Cada agente é visualizado trabalhando em tempo real no escritório isométrico, com contador de tokens e progresso visível — zero caixa-preta
- **LGPD auditável & Zero Persistência:** Pipeline de anonimização/pseudonimização com dicionário de placeholders reversível e audit log assinado por hash. Em prol da privacidade extrema (Privacy by Design), o servidor opera em **modo de processamento efêmero** para dados brutos: os documentos cruéis são processados, têm seu texto extraído e anonimizado em memória e, opcionalmente, sincronizados de volta para uma pasta na máquina local do cliente. O servidor apaga (destrói) o arquivo fonte original imediatamente após essa etapa, não realizando backups do arquivo bruto em nuvem. O advogado pode provar que nenhum dado sensível chegou à IA nem permaneceu indevidamente no servidor.
- **Human-in-the-Loop deliberado:** Tela de discussão Humano ↔ IA entre redação e design, onde o advogado opina, ajusta argumentação e valida antes da formatação — checkpoint obrigatório (Provimento 205/2021 CFOAB)
- **43 agentes com veto conditions:** Cada ramo do direito tem um especialista v2.0 que recusa produzir conteúdo sem fundamentação verificada — sem alucinações jurisprudenciais
- **Liberdade de LLM:** Sem lock-in de provedor. Admin cadastra qualquer API key e visualiza custos em tempo real
- **Visual Law integrado:** Peças jurídicas formatadas com logo, cores e princípios de Legal Design do escritório — diferenciador visual competitivo

## Classificação do Projeto

| Aspecto | Valor |
|---------|-------|
| **Tipo de projeto** | SaaS B2B (multi-tenant, tiers de subscription) |
| **Domínio** | LegalTech |
| **Complexidade** | Alta (ética OAB, LGPD, sigilo advogado-cliente, integração tribunais) |
| **Contexto** | Brownfield — evolução do framework Conectese existente (51 agentes, dashboard Phaser, WebSocket, upload pipeline) |

## Critérios de Sucesso

### Sucesso do Usuário

- **Momento "audit log":** O advogado termina o pipeline e recebe o relatório auditável com hash — sente segurança de que pode provar conformidade LGPD para a OAB, ANPD e seus clientes
- **Momento "Visual Law":** A peça jurídica chega formatada com logo, cores e design profissional — o advogado percebe que o resultado é superior ao manual
- Advogado completa petição em **< 30 min** (vs 4-8h manual)
- Advogado usa a plataforma **sem treinamento técnico** — interface auto-explicativa + manual de texto integrado
- Em caso de **erro na conversão de documentos**, o advogado recebe feedback visual claro e opções de ação (reenviar, corrigir manualmente, pular documento)

### Sucesso de Negócio

| Métrica | Meta |
|---------|------|
| NPJs utilizando ativamente | 3+ nos primeiros 6 meses |
| Conversão Light → PRO | > 15% ao mês |
| Churn mensal PRO | < 5% |
| Revenue por NPJ (1 PRO + N Light) | R$ 99,90 + (N × R$ 19,90)/mês |
| MRR meta 12 meses | R$ 5.000+ |

**Modelo de Pricing:**

| Plano | Preço | Inclui |
|-------|-------|--------|
| **Light** | R$ 19,90/mês | Pipeline de peticionamento, histórico das 4 últimas análises |
| **PRO** | R$ 99,90/mês | Todos os processos, agenda, prazos, atendimento WhatsApp, histórico completo |

**Modelo NPJ:** 1 licença PRO para o coordenador + licenças Light para cada advogado iniciante/estagiário. Advogados Light podem transferir processos para o usuário PRO do coordenador.

### Sucesso Técnico

| Métrica | Meta MVP | Meta 12 meses |
|---------|----------|---------------|
| Taxa de anonimização correta | > 99% | > 99.5% |
| Jurisprudências com URLs válidas | > 95% | > 98% |
| Tempo do pipeline completo (13 estágios) | < 15 min | < 8 min |
| Taxa de aprovação no checkpoint humano (1º ciclo) | > 70% | > 85% |
| Custo médio de tokens por petição | < R$ 5 | < R$ 3 |
| Uptime da plataforma SaaS | > 99% | > 99.5% |
| Taxa de conversão de documentos sem erro | > 90% | > 97% |

### Resultados Mensuráveis

- Redução de **80%** no tempo de produção de peças jurídicas para NPJs
- **100%** das petições acompanhadas de audit log com hash LGPD
- **Zero** dados sensíveis enviados ao LLM (verificável pelo audit log)
- Manual de texto disponível e acessível a partir do dashboard desde o MVP

## Jornadas do Usuário

### Jornada 1: Dra. Carla — Coordenadora de NPJ (PRO) — Caminho de Sucesso

**Situação:** Dra. Carla coordena o NPJ da Universidade Federal do Paraná. São 12 estagiários atendendo 40+ casos/mês de direito civil e consumidor para comunidades carentes. Cada petição leva 6-8 horas entre pesquisa, redação e formatação. Ela revisa todas pessoalmente.

**Cena de Abertura:** Segunda-feira, 8h. Carla abre o dashboard e vê o escritório isométrico com 3 novos processos transferidos por estagiários no fim de semana. Seu painel de prazos mostra 2 audiências essa semana e 1 prazo recursal em 48h.

**Ação Crescente:** Ela clica no processo mais urgente — um caso de danos morais por negativação indevida. O estagiário já rodou o pipeline completo: documentos convertidos, dados anonimizados, análise do especialista em direito do consumidor concluída, jurisprudência do TJPR validada, redação pronta. Carla vê no log que o agente `lgpd-anonymizer` mascarou 14 PIIs e zero dados sensíveis chegaram ao LLM. O contador mostra R$ 2,30 em tokens gastos.

**Clímax:** Carla entra na **tela de discussão Humano ↔ IA**. Pede ao agente redator para reforçar a fundamentação em dano moral presumido (Súmula 385/STJ). A IA ajusta em 20 segundos, citando o precedente correto. Carla aprova. A peça segue para o `legal-designer` que formata com o logo e cores do NPJ.

**Resolução:** Em 25 minutos, Carla tem uma petição inicial profissional em PDF e DOCX, acompanhada do audit log com hash SHA-256 provando conformidade LGPD. Ela checa o WhatsApp integrado — a IA já respondeu 3 clientes com informações básicas sobre andamento processual, e escalou 1 caso com sentimento negativo para atendimento humano. Carla responde pessoalmente. Antes de sair, confere o dashboard de produtividade: o NPJ produziu 8 peças essa semana, com custo médio de R$ 2,80/peça.

---

### Jornada 2: Lucas — Estagiário de Direito (Light) — Caminho de Sucesso + Transferência

**Situação:** Lucas é aluno do 7º período, estagiário no NPJ da Dra. Carla. Recebeu um caso de direito de família — guarda compartilhada. É seu segundo processo na plataforma.

**Cena de Abertura:** Lucas abre o dashboard Light. Vê seu histórico com 3 processos anteriores (o 4º mais antigo já saiu do histórico do plano Light). Clica em "Nova Petição", seleciona "Petição Inicial" e escreve no brief: *"Guarda compartilhada. Pai busca regulamentação de visitas. Mãe alega risco emocional para criança de 5 anos. Tese: melhor interesse da criança, art. 1.583-A CC."*

**Ação Crescente:** Faz upload de 4 documentos: laudo psicológico (PDF), relatório escolar (DOCX), prints de WhatsApp (imagens), áudio de depoimento da avó (MP3). Assiste no escritório isométrico: `data-extractor` converte tudo — o OCR das imagens demora um pouco. O áudio é transcrito. De repente, o agente de conversão sinaliza **erro em 1 imagem** (baixa resolução). Lucas vê a notificação visual com 3 opções: reenviar em melhor qualidade, digitar o texto manualmente, ou pular. Ele digita o texto do print manualmente.

O `lgpd-anonymizer` entra em ação — Lucas vê os nomes, CPFs e endereços sendo substituídos por `[PESSOA_1]`, `[CPF_1]`, etc. O `task-router` categoriza como Direito de Família e encaminha para o agente `direito-de-familia`. A pesquisa jurisprudencial busca precedentes no TJPR sobre guarda compartilhada.

**Clímax:** O `legal-synthesizer` redige a petição. Lucas entra na **tela de discussão** — é sua chance de aprender. Pergunta: *"Por que você usou o art. 1.584 e não o 1.583?"* A IA explica a distinção técnica. Lucas sugere adicionar menção ao ECA. A IA incorpora. Lucas está satisfeito, mas quer que Dra. Carla revise antes da formatação.

**Resolução:** Lucas clica em **"Transferir para Coordenador"**. O processo aparece na fila da Dra. Carla como "Aguardando revisão". Lucas gastou 35 minutos e R$ 3,10 em tokens. Aprendeu sobre a diferença entre os artigos 1.583 e 1.584 do CC — valor pedagógico que nenhum sistema anterior oferecia.

---

### Jornada 3: Dra. Carla — Erro no Pipeline (Edge Case)

**Situação:** Um estagiário subiu um arquivo corrompido (PDF escaneado com páginas em branco) e o pipeline travou no estágio 3 (conversão).

**Cena de Abertura:** Carla recebe notificação push: *"Erro no pipeline — processo P13_04_0042"*. Abre o dashboard e vê o agente `data-extractor` parado com ícone vermelho.

**Ação Crescente:** Clica no agente e vê o log detalhado: *"Páginas 3, 7, 12: conteúdo vazio após OCR. Resolução < 72dpi. Ação necessária."* São 3 opções: (1) ignorar páginas vazias e continuar, (2) reenviar o documento em melhor resolução, (3) inserir o texto manualmente.

**Clímax:** Carla pede ao estagiário que escaneie novamente as 3 páginas. O estagiário reenvia. O pipeline retoma do ponto onde parou — não recomeça do zero. Os tokens já gastos não são desperdiçados.

**Resolução:** O pipeline completa normalmente. O audit log registra a interrupção e retomada, mantendo rastreabilidade completa.

---

### Jornada 4: Dr. Marcos — Admin do Sistema

**Situação:** Dr. Marcos é o responsável técnico do NPJ. Ele configura a plataforma para o time.

**Cena de Abertura:** Marcos acessa o painel de administração após o primeiro deploy (SaaS hospedado). Precisa configurar o NPJ para 1 coordenador (Dra. Carla) + 12 estagiários.

**Ação Crescente:**
1. **API Keys:** Cadastra as chaves — Google Gemini como modelo principal, OpenRouter como fallback. Define limites de gasto mensal por chave.
2. **Usuários:** Cria conta PRO para Dra. Carla (coordenadora). Cria 12 contas Light para estagiários via convite por e-mail.
3. **Branding:** Sobe o logo do NPJ, define as cores institucionais para o Visual Law.
4. **WhatsApp:** Configura o prompt inicial da IA de atendimento, sobe 50 documentos para o RAG (FAQ do NPJ, modelos de petição, orientações de atendimento), e define regras de escalação (sentimento negativo → humano).
5. **Limites:** Define o espaço de armazenamento do NPJ conforme o plano contratado.

**Resolução:** Em 40 minutos, o NPJ está operacional. Marcos monitora custos de tokens semanalmente no dashboard de analytics e ajusta os limites conforme o orçamento.

---

### Jornada 5: Ana (Cliente) + IA — Atendimento WhatsApp

**Situação:** Ana é cliente do NPJ, tem um caso de direito do consumidor em andamento.

**Cena de Abertura:** Ana manda mensagem no WhatsApp do NPJ: *"Oi, queria saber como tá meu processo da geladeira que veio quebrada"*.

**Ação Crescente:** A IA de atendimento responde em 10 segundos. Com base no RAG (50 arquivos do NPJ) e no prompt configurado pelo admin, identifica o processo de Ana e responde: *"Olá, Ana! Seu processo contra a loja X está na fase de contestação. A audiência está marcada para 22/04. Posso ajudar com mais alguma dúvida?"*

Ana responde: *"Tô muito nervosa, eles me ligaram ameaçando cobrar e eu tô com medo"*.

**Clímax:** A IA detecta **sentimento negativo + medo** e responde com empatia: *"Entendo sua preocupação, Ana. Não se preocupe, a cobrança durante o processo pode configurar prática abusiva. Vou encaminhar para a Dra. Carla para que ela oriente você pessoalmente."*

**Resolução:** A conversa é escalada para Dra. Carla com contexto completo (histórico + análise de sentimento). Carla responde diretamente pelo WhatsApp integrado no dashboard PRO.

---

### Resumo dos Requisitos das Jornadas

| Jornada | Capacidades Reveladas |
|---------|----------------------|
| **Dra. Carla (PRO)** | Dashboard isométrico, pipeline 13 estágios, discussão H↔IA, Visual Law, audit log, prazos, produtividade, WhatsApp integrado |
| **Lucas (Light)** | Upload multi-formato, erro de conversão, anonimização visível, discussão pedagógica H↔IA, transferência para PRO |
| **Edge Case (erro)** | Tratamento de erros, retomada do pipeline, log de interrupção, notificação push |
| **Admin** | API keys multi-provedor, gestão de usuários/roles, branding, config WhatsApp/RAG, limites de espaço |
| **WhatsApp (cliente)** | IA com RAG, análise de sentimento, escalação para humano, contexto preservado |

## Requisitos Específicos do Domínio (LegalTech)

### Compliance & Regulatório

| Regulação | Requisito | Como o OpenDoc atende |
|-----------|-----------|----------------------|
| **LGPD (Lei 13.709/2018)** | Anonimização de dados pessoais antes de processamento | Pipeline de 13 estágios com `lgpd-anonymizer` + dicionário reversível + audit log com hash |
| **Provimento 205/2021 CFOAB** | IA como apoio, não substituto do advogado | Checkpoint humano obrigatório (tela de discussão H↔IA) enforced na UX |
| **Art. 133 CF + Estatuto OAB** | Sigilo profissional advogado-cliente | Isolamento multi-tenant, dados por organização, API keys por organização |
| **ANPD** | Provar que dados foram tratados corretamente | Audit trail assinado por hash SHA-256 como prova documental |
| **Marco Civil da Internet** | Retenção e proteção de dados em trânsito | HTTPS obrigatório, Docker self-hosted opcional |

### Disclaimer Obrigatório (Front-End)

- **Disclaimer permanente no dashboard:** Mensagem visível: *"Este documento foi gerado com auxílio de inteligência artificial e deve ser obrigatoriamente revisado por advogado(a) habilitado(a) na OAB antes de utilização."*
- **Aceite obrigatório na exportação:** Antes de exportar PDF/DOCX, o usuário deve confirmar que revisou e assume responsabilidade pela peça
- **Rodapé no PDF:** Cada página do documento gerado inclui o disclaimer no rodapé
- **Tela de discussão:** Checkpoint humano obrigatório — não é possível pular para Visual Law sem passar pela revisão

### Restrições Técnicas

- **Criptografia em repouso:** Dicionário de placeholders criptografado (AES-256)
- **Zero Persistência Bruta (LGPD Local-First):** Documentos brutos (fontes originais) NÃO são armazenados persistentemente no servidor corporativo. Eles entram em processamento efêmero na RAM para OCR e Anonimização. Caso não seja configurada uma "pasta de sincronização local" na máquina do cliente, o sistema destruirá o dado final irreversivelmente do pipeline, não guardando cópia nem backups de arquivos não anonimizados.
- **Retenção de dados anonimizados:** Apenas log hash e textos já purificados podem residir no servidor a longo prazo (política configurável por NPJ/organização).
- **Isolamento de dados:** Zero acesso cruzado entre organizações — nem admin do sistema pode ver dados de processos
- **API keys:** Armazenamento criptografado, nunca em texto plano

### Requisitos de Integração

- **Jusbrasil / .jus.br:** Scraping de dados públicos com rate limiting para evitar bloqueio
- **WhatsApp Business API:** Integração oficial para atendimento
- **E-mail (IMAP/SMTP):** Recebimento automático de intimações com parsing de conteúdo
- **Exportação PDF/DOCX:** Compatibilidade com padrões de tribunais para peticionamento eletrônico

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|----------|
| Anonimização falha (dado escapa) | Violação LGPD + sanção OAB | Dupla validação: regex + LLM verificador. Taxa mínima >99% |
| Jurisprudência inventada (alucinação) | Peça com fundamentação falsa | Veto conditions dos agentes + `jurisprudencia-validator` obrigatório |
| Jusbrasil bloqueia scraping | Pipeline de jurisprudência quebra | Fallback para sites .jus.br oficiais. Rate limiting. Cache de jurisprudências validadas |
| Dados de clientes expostos | Ação judicial + perda de clientes | Isolamento multi-tenant rigoroso + criptografia em repouso + audit trail |
| Provedor de LLM fora do ar | Pipeline interrompido | Multi-LLM com fallback automático |

## Inovação & Padrões Novos

### Áreas de Inovação Detectadas

1. **Orquestração multi-agente transparente** — 43 agentes especializados coordenados com visualização em tempo real no escritório isométrico. Inédito em LegalTech no Brasil. Concorrentes (jusIA, ProLex) operam como caixas-pretas.

2. **Pipeline LGPD pré-envio** — Paradigma de anonimizar ANTES de enviar ao LLM com dicionário reversível. Concorrentes confiam no prompt para proteger dados — o OpenDoc garante que dados sensíveis nunca saem do escritório.

3. **Audit trail com hash como prova jurídica** — Log de processamento como prova documental para ANPD/OAB. Uso inovador de conceitos de integridade de dados aplicados a compliance regulatório.

4. **Human-in-the-Loop pedagógico** — Tela de discussão H↔IA não é apenas revisão — é aprendizado. Estagiários aprendem direito perguntando "por quê?" à IA. Transforma ferramenta de produtividade em ferramenta de ensino.

5. **Capô transparente (Glass-Box AI)** — Escritório isométrico Phaser como metáfora visual para orquestração de IA. Inédito em LegalTech e em plataformas de IA em geral.

### Contexto de Mercado & Paisagem Competitiva

- **jusIA / ProLex:** IA jurídica brasileira com modelos caixa-preta, sem garantia LGPD pré-envio, sem transparência de pipeline, sem multi-agente visível
- **Mercado global:** Plataformas como Harvey AI e CoCounsel oferecem IA jurídica, mas sem transparência radical e sem pipeline LGPD brasileiro
- **Timing:** IA generativa mainstream + fiscalização LGPD endurecendo + advogados adotando IA sem processos seguros = janela de oportunidade clara

### Abordagem de Validação

- **Pipeline LGPD:** Testar com dados reais de processos e medir taxa de escape de PIIs (meta >99% captura)
- **Pedagogia:** Medir perguntas de estagiários na tela de discussão vs correções necessárias
- **Transparência:** Medir confiança do advogado antes/depois do uso via pesquisa NPS
- **Visual Law:** Avaliar satisfação com qualidade visual das peças vs produção manual

### Mitigação de Riscos de Inovação

| Inovação | Risco | Fallback |
|----------|-------|----------|
| Escritório isométrico Phaser | Performance em browsers fracos | Degradar para lista textual de progresso |
| Scraping Jusbrasil | Bloqueio de acesso | Fallback para sites .jus.br + cache local |
| 43 agentes especializados | Manutenção complexa | Versionamento por agente + testes automatizados |
| Audit trail com hash | Validade jurídica do hash | Consultar jurídico para validar aceitabilidade como prova |

## Requisitos Específicos SaaS B2B

### Modelo Multi-Tenant

- **Isolamento físico:** Cada organização (NPJ/escritório) terá banco de dados separado
- **Provisioning:** Ao criar nova organização, o sistema cria automaticamente uma base de dados dedicada
- **Vantagens:** Segurança máxima (zero acesso cruzado), backup/restauração por organização, compliance simplificado

### Modelo de Autenticação (Configurável pelo Admin)

O administrador define quais métodos de login estão disponíveis para sua organização. **2FA é obrigatório** em todas as combinações.

| Método de Login | 2FA |
|-----------------|-----|
| E-mail/senha | Authenticator (TOTP) |
| E-mail/senha | E-mail (código) |
| Google OAuth | Authenticator (TOTP) |
| Magic Link | Authenticator (TOTP) |
| Número OAB/senha | Authenticator (TOTP) |
| Número OAB/senha | E-mail (código) |

### Tiers de Subscription

| | Light (R$ 19,90/mês) | PRO (R$ 99,90/mês) |
|--|---|---|
| Pipeline peticionamento | ✅ Completo | ✅ Completo |
| Histórico | 4 últimas análises | Ilimitado |
| Prazos processuais | ❌ | ✅ + notificações push |
| WhatsApp / Instagram | ❌ | ✅ IA + escalação |
| Financeiro | ❌ | ✅ Honorários, custas, fluxo |
| E-mail (intimações) | ❌ | ✅ IMAP automático |
| Analytics avançado | ❌ | ✅ Comparativos produtividade |
| Transferir processos | ✅ Para PRO | ✅ Receber de Light |

### RBAC (Role-Based Access Control)

| Role | Permissões |
|------|----------|
| **Admin** | Gerenciar API keys, usuários, branding, limites, config WhatsApp/RAG, métricas de custo |
| **Coordenador (PRO)** | Tudo do advogado + receber transferências + revisar peças + responder WhatsApp + analytics |
| **Advogado (Light/PRO)** | Criar petições, rodar pipeline, usar tela de discussão, transferir processos |

### Integrações

| Integração | Status | Detalhes |
|------------|--------|----------|
| **WhatsApp Business API (Meta)** | ✅ Existente | Webhook próprio, API oficial |
| **Instagram API (Meta)** | ✅ Existente | Webhook próprio, API oficial |
| **Google GenAI SDK** | ✅ No codebase | `@google/genai` ^1.48.0 |
| **MCP SDK** | ✅ No codebase | `@modelcontextprotocol/sdk` ^1.29.0 |
| **Jusbrasil/.jus.br** | ✅ No codebase | `puppeteer` + `cloudscraper` |
| **E-mail IMAP/SMTP** | 🔨 A construir | Recebimento de intimações |
| **OpenRouter** | 🔨 A construir | Multi-LLM provider |

### Considerações de Implementação

- **Database por tenant:** PostgreSQL com schema de provisioning automatizado
- **Session management:** JWT com refresh tokens, expiração configurável pelo admin
- **Rate limiting:** Por organização e por plano (Light = limites menores de pipeline/dia)
- **Billing:** Integração com gateway de pagamento para assinaturas recorrentes
- **Onboarding:** Wizard de setup guiado para novos admins (API keys → usuários → branding → WhatsApp)

## Escopo do Projeto & Desenvolvimento Faseado

### Estratégia MVP & Filosofia

**Abordagem MVP:** Big-bang — lançamento completo com todas as funcionalidades core (Light + PRO) desde o dia 1. O produto só tem valor quando pipeline de peticionamento + módulos de gestão (WhatsApp, financeiro, prazos) + modo offline estão todos operacionais.

**Justificativa:** NPJs precisam de solução completa que substitua vários sistemas fragmentados. Pipeline sem gestão não resolve a dor. Gestão sem pipeline não diferencia. O valor está na soma.

### Feature Set MVP (Completo)

**Jornadas Suportadas:** Todas as 5 (Coordenadora PRO, Estagiário Light, Edge Case, Admin, Cliente WhatsApp)

**Must-Have:**
- Pipeline 13 estágios com 43 agentes + visualização em tempo real
- Anonimização LGPD + audit trail com hash
- Tela de discussão H↔IA + disclaimer obrigatório
- Visual Law + exportação PDF/DOCX
- Dashboard isométrico Phaser com métricas de tokens
- Planos Light (R$19,90) + PRO (R$99,90) com transferência
- Auth configurável (6 métodos) + 2FA obrigatório
- Isolamento físico multi-tenant (DB por organização)
- WhatsApp + Instagram (Meta API oficial)
- Prazos processuais + notificações push
- Financeiro (honorários, custas, fluxo de caixa)
- E-mail IMAP para intimações
- Analytics avançado com produtividade
- Modo offline (draft local, sync)
- Manual de texto integrado
- Admin com API keys multi-provedor

### Post-MVP (Growth)

- API pública para integrações de terceiros
- Integração com PJe/e-SAJ
- Templates de peças por tipo/ramo
- App mobile nativo

### Expansão (Visão)

- Marketplace de agentes e templates pela comunidade
- Análise preditiva de decisões judiciais
- "LGPD as a Service" para outras áreas reguladas

### Estratégia de Mitigação de Riscos

| Tipo | Risco | Mitigação |
|------|-------|----------|
| Técnico | Complexidade big-bang (muitos módulos) | Desenvolvimento modular — módulos independentes que plugam no core |
| Técnico | OCR/transcrição de áudio | Validar Tesseract.js + Whisper API nos primeiros sprints |
| Técnico | Modo offline com sync | Service worker + IndexedDB com resolução de conflitos |
| Técnico | Multi-tenant com DB físico | Automatizar provisioning com scripts de migração versionados |
| Mercado | NPJs não adotarem | Parceria com 1-2 NPJs piloto antes do lançamento público |
| Mercado | Pricing inadequado | Beta gratuito de 3 meses para NPJs piloto |
| Recurso | Equipe reduzida | Priorizar pipeline core + auth + 1 módulo de gestão se necessário |
| Recurso | Custo de tokens alto | Otimização de prompts + cache + modelos menores para tarefas simples |

## Requisitos Funcionais

### Gestão de Processos & Pipeline

- **FR1:** Advogado pode criar nova requisição selecionando tipo de petição (inicial, contestação, impugnação, etc.)
- **FR2:** Advogado pode fornecer brief textual com a tese jurídica desejada
- **FR3:** Advogado pode fazer upload de múltiplos documentos (PDF, DOCX, XLS, imagens, áudio)
- **FR4:** Sistema pode converter documentos multi-formato em texto (OCR, transcrição de áudio)
- **FR5:** Sistema pode detectar e sinalizar erros de conversão com opções de ação (reenviar, digitar, pular)
- **FR6:** Sistema pode anonimizar dados sensíveis automaticamente antes de envio ao LLM
- **FR7:** Sistema pode pseudonimizar dados pessoais com dicionário de placeholders reversível
- **FR8:** Sistema pode categorizar o ramo do direito e definir competência do processo
- **FR9:** Sistema pode encaminhar o caso para agentes especializados do ramo identificado
- **FR10:** Sistema pode pesquisar jurisprudência em sites .jus.br e Jusbrasil
- **FR11:** Agente especialista pode vetar produção de conteúdo sem fundamentação verificada
- **FR12:** Sistema pode redigir peça jurídica com base nos dados anonimizados e jurisprudência
- **FR13:** Advogado pode discutir e refinar o documento com a IA na tela de discussão
- **FR14:** Sistema pode formatar a peça em Visual Law com branding do escritório
- **FR15:** Sistema pode restaurar dados reais no documento final
- **FR16:** Advogado pode exportar peça em PDF e DOCX
- **FR17:** Sistema pode gerar audit log assinado por hash SHA-256 para cada processo
- **FR18:** Pipeline pode retomar do ponto de interrupção sem reiniciar
- **FR19:** Advogado Light pode transferir processo para coordenador PRO

### Visualização & Transparência

- **FR20:** Advogado pode visualizar cada agente trabalhando em tempo real no escritório isométrico
- **FR21:** Advogado pode ver contador de tokens e custo em tempo real durante o pipeline
- **FR22:** Advogado pode ver os dados sendo anonimizados/pseudonimizados em tempo real
- **FR23:** Advogado pode clicar em qualquer agente para ver log detalhado
- **FR24:** Sistema pode exibir disclaimer obrigatório sobre revisão por advogado OAB

### Gestão de Usuários & Acesso

- **FR25:** Admin pode configurar métodos de autenticação disponíveis para a organização
- **FR26:** Sistema pode exigir 2FA em todas as combinações de login
- **FR27:** Admin pode criar contas Light e PRO com convite por e-mail
- **FR28:** Admin pode atribuir roles (admin, coordenador, advogado)
- **FR29:** Sistema pode isolar dados entre organizações (banco de dados separado)
- **FR30:** Admin pode gerenciar API keys de múltiplos provedores de LLM
- **FR31:** Admin pode definir limites de gasto mensal por API key

### Atendimento WhatsApp & Instagram

- **FR32:** IA pode responder automaticamente mensagens de clientes com base no RAG configurado
- **FR33:** IA pode detectar sentimento do cliente e escalar para atendimento humano
- **FR34:** Admin pode configurar prompt inicial e regras de escalação
- **FR35:** Admin pode fazer upload de até 50 documentos para a base RAG
- **FR36:** Coordenador PRO pode responder diretamente pelo dashboard

### Gestão Processual

- **FR37:** Coordenador pode gerenciar prazos processuais com calendário
- **FR38:** Sistema pode enviar notificações push de prazos
- **FR39:** Sistema pode receber intimações por e-mail (IMAP) automaticamente
- **FR40:** Sistema pode parsear conteúdo de intimações recebidas

### Financeiro

- **FR41:** Coordenador pode registrar honorários por processo
- **FR42:** Coordenador pode registrar custas processuais
- **FR43:** Coordenador pode visualizar fluxo de caixa do escritório

### Analytics & Produtividade

- **FR44:** Coordenador PRO pode visualizar dashboard de produtividade
- **FR45:** Sistema pode gerar comparativos de produtividade entre períodos
- **FR46:** Admin pode monitorar custos de tokens por organização

### Administração & Configuração

- **FR47:** Admin pode configurar branding do escritório (logo, cores) para Visual Law
- **FR48:** Admin pode definir espaço de armazenamento da organização
- **FR49:** Sistema pode provisionar banco de dados automaticamente para nova organização
- **FR50:** Wizard de onboarding pode guiar admin pelo setup inicial

### Modo Offline & Documentação

- **FR51:** Advogado pode criar draft de processo offline com sync quando online
- **FR52:** Advogado pode acessar manual de texto integrado ao dashboard
- **FR53:** Sistema pode exigir aceite do disclaimer antes de exportar documento
- **FR54:** Sistema pode incluir disclaimer no rodapé de cada página do PDF gerado

### Billing & Assinaturas

- **FR55:** Sistema pode gerenciar assinaturas recorrentes (Light/PRO) com cobrança automática via gateway de pagamento

### Docker Self-Hosted

- **FR56:** Sistema pode ser deployado como container Docker com docker-compose
- **FR57:** Admin self-hosted pode configurar o sistema via variáveis de ambiente (.env)
- **FR58:** Sistema self-hosted pode operar sem dependência de serviços SaaS externos (exceto LLM providers)

### Tema & Aparência

- **FR59:** Advogado pode alternar entre tema claro e escuro no dashboard

## Requisitos Não-Funcionais

### Performance

- **NFR1:** Pipeline completo (13 estágios) deve completar em < 15 minutos para processo com até 10 documentos
- **NFR2:** Tela de discussão H↔IA deve responder em < 5 segundos por interação
- **NFR3:** Dashboard isométrico deve renderizar a 60fps em browsers modernos (Chrome, Firefox, Safari)
- **NFR4:** Upload de documentos deve aceitar até 50MB por arquivo e 200MB por processo
- **NFR5:** Fallback do Phaser para lista textual quando FPS < 30
- **NFR6:** WebSocket deve atualizar status dos agentes em < 500ms de latência

### Segurança

- **NFR7:** Todos os dados em trânsito devem usar TLS 1.3
- **NFR8:** Dicionário de placeholders criptografado em repouso com AES-256
- **NFR9:** API keys de LLM armazenadas criptografadas, nunca em texto plano
- **NFR10:** 2FA obrigatório em 100% dos logins
- **NFR11:** Sessions JWT com expiração máxima de 8 horas de inatividade
- **NFR12:** Audit log imutável após geração (append-only, hash encadeado)
- **NFR13:** Zero dados sensíveis devem atingir o LLM — verificável pelo audit trail
- **NFR14:** Isolamento total entre tenants — zero acesso cruzado entre bancos de dados
- **NFR15:** Senhas hasheadas com Argon2id + pepper (OWASP recomendado, memory-hard, resistente a GPU/ASIC)

### Escalabilidade

- **NFR16:** Sistema deve suportar 50 organizações simultâneas no MVP (SaaS)
- **NFR17:** Cada organização deve suportar até 50 usuários concorrentes
- **NFR18:** Database provisioning deve completar em < 60 segundos para nova organização
- **NFR19:** Arquitetura deve permitir escalar para 500+ organizações sem redesign

### Acessibilidade

- **NFR20:** Dashboard deve seguir WCAG 2.1 nível AA para elementos de formulário e navegação
- **NFR21:** Fallback textual do Phaser deve ser acessível por leitores de tela
- **NFR22:** Todas as ações devem ser executáveis via teclado

### Integração

- **NFR23:** WebSocket deve reconectar automaticamente em caso de queda de conexão
- **NFR24:** Fallback para REST polling se WebSocket indisponível
- **NFR25:** Rate limiting em scraping Jusbrasil/.jus.br para máximo 10 req/min
- **NFR26:** Multi-LLM com fallback automático em < 30 segundos se provedor primário falhar

### Confiabilidade

- **NFR27:** Uptime do SaaS ≥ 99% (máximo ~7h de downtime/mês)
- **NFR28:** Pipeline deve implementar retomada automática após falha de rede
- **NFR29:** Modo offline deve sincronizar sem perda de dados quando conectividade retornar
- **NFR30:** Backup automático de dados de cada organização diariamente
- **NFR31:** Tempo de recuperação de backup (RTO) < 4 horas
