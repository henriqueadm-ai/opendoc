# opendoc

Crie equipes (squads) de agentes de IA focadas no ambiente jurídico — direto da sua IDE.

O opendoc é um framework de orquestração multi-agente voltado inteiramente para **Advogados Especializados e Escritórios de Advocacia**. Descreva a necessidade do seu caso em linguagem natural, e o opendoc cria uma equipe de agentes e analistas jurídicos de IA que trabalham juntos para melhorar a análise processual, garantir a privacidade (LGPD) e dar suporte na sua tomada de decisão.

## Conheça mais

[conecte.se](https://conecte.se) - **Contato:** carlos@conecte.se

## O que é um Squad Jurídico?

Um squad jurídico é uma equipe de agentes de IA que colaboram para destrinchar e solucionar um caso ou analisar um conjunto probatório. Cada agente tem um papel específico (como extração, anonimização e formação de tese). Eles executam em pipeline com *checkpoints* onde o agente pausa e pede sua aprovação antes de tomar qualquer decisão sensível.

Exemplo do nosso **Pipeline OpenLaw**:

- **Extrator de Dados** lê peças e provas processuais brutas
- **Especialista LGPD (Anonimizador)** higieniza os dados e mascara informações pessoais e sensíveis
- **Analista Jurídico Geral** monta o panorama probatório e interroga o advogado humano
- **Orquestrador de Pareceres** convoca os Especialistas (Direito Penal, Civil, Tributário, etc)
- **Compositor de Minutas** redige a fundamentação coesa e unificada
- **Restaurador LGPD** reverte a anonimização e insere os dados reais no documento final

## Para quem?

Para profissionais do Direito e equipes que desejam alavancar produtividade com máxima segurança e privacidade usando IA.

- **Advogados Autônomos** — ganhe suporte de especialistas virtuais em todas as áreas do direito
- **Escritórios de Advocacia (Boutiques e Massificados)** — crie pipelines reutilizáveis para triar centenas de peças por dia
- **Departamentos Jurídicos In-House** — automatize análise de contratos, due diligence corporativa e adequação à LGPD
- **Pesquisadores Jurídicos** — encontre teses, jurisprudências e sumulas relacionadas aos autos rapidamente

## O que dá pra fazer?

- **Análise de Iniciais e Defesas** — ler autos densos, extrair fatias de prazo, pedidos e fatos principais
- **Anonimização Automática LGPD** — preparar documentos protegidos para análise de modelos de LLM na nuvem
- **Elaboração de Minutas e Pareceres** — cruzar argumentos de especialistas para redigir peças processuais
- **Triagem Massificada** — ler publicações nos diários oficiais e encaminhar para a frente de trabalho correta
- **Auditoria de Contratos** — revisar cláusulas buscando riscos para a empresa ou para o cliente

## Instalação

**Pré-requisito:** Node.js 20+

```bash
npx opendoc init
```

Para atualizar uma instalação existente:

```bash
npx opendoc update
```

## IDEs Suportadas

| IDE | Status |
|-----|--------|
| Claude Code | Disponível |
| Cursor | Disponível |
| VS Code + Copilot | Disponível |
| Codex (OpenAI) | Disponível |
| Open Code | Disponível |
| Antigravity | Disponível |

## Escritório Virtual (Opendoc Dashboard)

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando no seu caso em tempo real.

**Passo 1 — Gere o dashboard** (na sua IDE):

```
/opendoc dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve squads/<nome-do-squad>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

## Criando seu Squad

Abra o menu:

```
/opendoc
```

O **Opendoc** vai te mostrar as opções disponíveis. 

Para criar um novo squad personalizado, o **Arquiteto** fará algumas perguntas sobre qual a área do seu escritório e o tipo de casos, e projetará o squad ideal configurando tudo. Você sempre aprova o design (a "tese") antes de qualquer execução.

## Executando um Squad

Você pode executar a triagem de um caso pedindo diretamente:

```
/opendoc rode o squad <nome-do-squad>
```

A equipe de IA inicia, pausando nos checkpoints onde os analistas jurídicos pedirão o input estratégico do Advogado (Human-in-the-Loop).

## Exemplos

```
/opendoc
/opendoc crie um Squad que receba sentenças de primeiro grau e levante possibilidades de embargo ou apelação
/opendoc quero um Squad focado em Direito Tributário que analise autos de infração e sugira defesas
/opendoc crie um Squad que higieniza dados LGPD de processos de Direito de Família e gera resumos seguros
/opendoc roda o squad analise-tributaria
```

## Comandos

| Comando | O que faz |
|---------|-----------|
| `/opendoc` | Abre o menu principal |
| `/opendoc help` | Mostra todos os comandos |
| `/opendoc create` | Cria um novo squad / equipe de IA |
| `/opendoc run <nome>` | Analisa um caso no squad |
| `/opendoc list` | Lista seus squads de IA |
| `/opendoc edit <nome>` | Modifica as diretrizes de uma equipe |
| `/opendoc skills` | Navega pelas habilidades jurídicas instaladas |
| `/opendoc install <nome>` | Instala uma habilidade do catálogo |
| `/opendoc uninstall <nome>` | Remove uma habilidade instalada |

## Custo de Tokens

O opendoc é open source e pode ser usado gratuitamente como software de orquestração. O uso de LLMs locais mantém os dados sigilosos na sua máquina (usando Ollama, LM Studio, etc).

No uso de inteligência de fronteira (Claude Pro/Max, OpenAI API, Gemini Advanced):
- O repasse das peças anonimizadas aos LLMs tem custo de tokens de acordo com o tamanho do processo escaneado.
- Recomenda-se estritamente o uso dos agentes **LGPD-Anonymizers** primeiro, para que apenas os dados anonimizados trafeguem nas APIs.

## Sessões de Navegador e Privacidade

Caso um agente precise buscar atualizações de jurisprudência ativas, ele usa um navegador automatizado.
- **Isolamento de Sessão:** Cookies de jusbrasil/STJ são salvos apenas em `_opendoc/_browser_profile/` que nunca sai da sua máquina ou vai para o Git.

## Sobre

O opendoc é mantido como base de um projeto open source. Esta implementação específica foi transformada em um motor de inteligência e segurança jurídica projetado para advogados e escritórios de advocacia que precisam escalar o raciocínio forense humano com confiança.

Saiba mais em [conecte.se](https://conecte.se) ou entre em contato via carlos@conecte.se.

## Licença

MIT — use como quiser.

---

# opendoc (English)

Create AI squads specialized in the Legal environment — right from your IDE.

opendoc is a multi-agent orchestration framework geared entirely towards **Lawyers, Law Firms, and Corporate Legal Departments**. Describe your case needs in plain language, and opendoc creates a team of AI legal analysts and agents who work together to enhance procedural analysis, guarantee privacy (GDPR/LGPD), and support your decision-making.

## Learn more

[conecte.se](https://conecte.se) - **Contact:** carlos@conecte.se

## What is a Legal Squad?

A legal squad is a team of AI agents that collaborate to dissect a lawsuit, draft legal documents, or anonymize evidence. They run in a pipeline with checkpoints where the agent pauses and asks for the Head Human Lawyer's approval before proceeding with sensitive decisions.

Example:

- **Data Extractor** parses raw PDF filings
- **LGPD Anonymizer** redacts PII and sanitizes the facts
- **Legal Analyst** maps out the procedural landscape
- **Specialists Routing** channels tasks to domain-specific AIs (Tax, Civil, Criminal)
- **Legal Draftsperson** sews arguments into a final brief
- **Data Restorer** reinjects real names maintaining confidentiality

## Installation

**Prerequisite:** Node.js 20+

```bash
npx opendoc init
```

To update an existing installation:

```bash
npx opendoc update
```

## Supported IDEs

| IDE | Status |
|-----|--------|
| Claude Code | Available |
| Cursor | Available |
| VS Code + Copilot | Available |
| Codex (OpenAI) | Available |
| Open Code | Available |
| Antigravity | Available |

## Virtual Office

The Virtual Office is a 2D interface showing your AI legal team working in real time.

**Step 1 — Generate the dashboard** (in your IDE):
```
/opendoc dashboard
```

**Step 2 — Serve it locally** (in terminal):
```bash
npx serve squads/<squad-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.

## Creating your Squad

Describe what you need:

```
/opendoc create "A squad that reviews M&A contracts and flags liabilities"
```

The **Architect** asks a few questions, designs the legal squad, and sets everything up safely. You approve the design before execution.

## Running a Squad

```
/opendoc run <squad-name>
```

The squad runs automatically, pausing at critical junctures if legal interpretation is ambiguous to ask for your strategic guidance.

## Examples

```
/opendoc create "Squad that reads 1st degree sentences and draft grounds for appeal"
/opendoc create "Squad that sanitizes GDPR/LGPD data on family court proceedings"
/opendoc create "Squad that audits labor contracts against current regulations"
```

## Token Cost

opendoc itself is completely free and open source. For utmost confidentiality, you can use OpenCode with local offline LLMs. 
When leveraging frontier models (Claude, OpenAI):
- Passing massive case dossiers will incur higher token costs per run.
- Using the **Anonymizer** agent beforehand ensures you are not passing sensitive PII into external APIs inadvertently.

## Browser Sessions & Privacy

When fetching active jurisprudence, opendoc can perform browser actions locally.
- **Persistent cookies:** stored completely locally in `_opendoc/_browser_profile/`.

## About

This implementation of opendoc has been heavily customized to serve as a legal intelligence engine, designed for law firms needing to scale their forensic rationale confidently and safely.

Learn more at [conecte.se](https://conecte.se) or reach out at carlos@conecte.se.

## License

MIT — use it however you want.
