# conectese

Crie equipes (times) de agentes de IA focadas no ambiente jurídico — direto da sua IDE.

O conectese é um framework de orquestração multi-agente voltado inteiramente para **Advogados Especializados e Escritórios de Advocacia**. Descreva a necessidade do seu caso em linguagem natural, e o conectese cria uma equipe de agentes e analistas jurídicos de IA que trabalham juntos para melhorar a análise processual, garantir a privacidade (LGPD) e dar suporte na sua tomada de decisão.

## Conheça mais

[conecte.se](https://conecte.se) - **Contato:** carlos@conecte.se

## O que é um time Conectese Jurídico?

Um time jurídico é uma equipe de agentes de IA que colaboram para destrinchar e solucionar um caso ou analisar um conjunto probatório. Cada agente tem um papel específico (como extração, anonimização e formação de tese). Eles executam em pipeline com *checkpoints* onde o agente pausa e pede sua aprovação antes de tomar qualquer decisão sensível.

Exemplo do nosso **Pipeline Conectese**:

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
npx conectese init
```

Para atualizar uma instalação existente:

```bash
npx conectese update
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

## Escritório Virtual (Conectese Dashboard)

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando no seu caso em tempo real.

**Passo 1 — Gere o dashboard** (na sua IDE):

```
/conectese dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve teams/<nome-do-time>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

## Criando sua Conexão

Abra o menu:

```
/conectese
```

O **Conectese** vai te mostrar as opções disponíveis. 

Para criar um novo time personalizado, o **Arquiteto** fará algumas perguntas sobre qual a área do seu escritório e o tipo de casos, e projetará o time ideal configurando tudo. Você sempre aprova o design (a "tese") antes de qualquer execução.

## Executando uma conexão

Você pode executar a triagem de um caso pedindo diretamente:

```
/conectese rode o time <nome-do-time>
```

A equipe de IA inicia, pausando nos checkpoints onde os analistas jurídicos pedirão o input estratégico do Advogado (Human-in-the-Loop).

## Exemplos

```
/conectese
/conectese crie um Time que receba sentenças de primeiro grau e levante possibilidades de embargo ou apelação
/conectese quero um Time focado em Direito Tributário que analise autos de infração e sugira defesas
/conectese crie um Time que higieniza dados LGPD de processos de Direito de Família e gera resumos seguros
/conectese roda o time analise-tributaria
```

## Comandos

| Comando | O que faz |
|---------|-----------|
| `/conectese` | Abre o menu principal |
| `/conectese help` | Mostra todos os comandos |
| `/conectese create` | Cria um novo time / equipe de IA |
| `/conectese run <nome>` | Analisa um caso no time |
| `/conectese list` | Lista seus times de IA |
| `/conectese edit <nome>` | Modifica as diretrizes de uma equipe |
| `/conectese skills` | Navega pelas habilidades jurídicas instaladas |
| `/conectese install <nome>` | Instala uma habilidade do catálogo |
| `/conectese uninstall <nome>` | Remove uma habilidade instalada |

## Custo de Tokens

O conectese é open source e pode ser usado gratuitamente como software de orquestração. O uso de LLMs locais mantém os dados sigilosos na sua máquina (usando Ollama, LM Studio, etc).

No uso de inteligência de fronteira (Claude Pro/Max, OpenAI API, Gemini Advanced):
- O repasse das peças anonimizadas aos LLMs tem custo de tokens de acordo com o tamanho do processo escaneado.
- Recomenda-se estritamente o uso dos agentes **LGPD-Anonymizers** primeiro, para que apenas os dados anonimizados trafeguem nas APIs.

## Sessões de Navegador e Privacidade

Caso um agente precise buscar atualizações de jurisprudência ativas, ele usa um navegador automatizado.
- **Isolamento de Sessão:** Cookies de jusbrasil/STJ são salvos apenas em `_conectese/_browser_profile/` que nunca sai da sua máquina ou vai para o Git.

## Sobre

O conectese é mantido como base de um projeto open source. Esta implementação específica foi transformada em um motor de inteligência e segurança jurídica projetado para advogados e escritórios de advocacia que precisam escalar o raciocínio forense humano com confiança.

Saiba mais em [conecte.se](https://conecte.se) ou entre em contato via carlos@conecte.se.

## Licença

MIT — use como quiser.

---

# conectese (English)

Create AI teams specialized in the Legal environment — right from your IDE.

conectese is a multi-agent orchestration framework geared entirely towards **Lawyers, Law Firms, and Corporate Legal Departments**. Describe your case needs in plain language, and conectese creates a team of AI legal analysts and agents who work together to enhance procedural analysis, guarantee privacy (GDPR/LGPD), and support your decision-making.

## Learn more

[conecte.se](https://conecte.se) - **Contact:** carlos@conecte.se

## What is a Legal Team?

A legal team is a team of AI agents that collaborate to dissect a lawsuit, draft legal documents, or anonymize evidence. They run in a pipeline with checkpoints where the agent pauses and asks for the Head Human Lawyer's approval before proceeding with sensitive decisions.

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
npx conectese init
```

To update an existing installation:

```bash
npx conectese update
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
/conectese dashboard
```

**Step 2 — Serve it locally** (in terminal):
```bash
npx serve teams/<team-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.

## Creating your Team

Describe what you need:

```
/conectese create "A team that reviews M&A contracts and flags liabilities"
```

The **Architect** asks a few questions, designs the legal team, and sets everything up safely. You approve the design before execution.

## Running a Team

```
/conectese run <team-name>
```

The team runs automatically, pausing at critical junctures if legal interpretation is ambiguous to ask for your strategic guidance.

## Examples

```
/conectese create "Team that reads 1st degree sentences and draft grounds for appeal"
/conectese create "Team that sanitizes GDPR/LGPD data on family court proceedings"
/conectese create "Team that audits labor contracts against current regulations"
```

## Token Cost

conectese itself is completely free and open source. For utmost confidentiality, you can use OpenCode with local offline LLMs. 
When leveraging frontier models (Claude, OpenAI):
- Passing massive case dossiers will incur higher token costs per run.
- Using the **Anonymizer** agent beforehand ensures you are not passing sensitive PII into external APIs inadvertently.

## Browser Sessions & Privacy

When fetching active jurisprudence, conectese can perform browser actions locally.
- **Persistent cookies:** stored completely locally in `_conectese/_browser_profile/`.

## About

This implementation of conectese has been heavily customized to serve as a legal intelligence engine, designed for law firms needing to scale their forensic rationale confidently and safely.

Learn more at [conecte.se](https://conecte.se) or reach out at carlos@conecte.se.

## License

MIT — use it however you want.
