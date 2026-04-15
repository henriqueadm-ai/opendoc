---
project_name: 'opendoc'
user_name: 'Henrique'
date: '2026-04-12T23:52:22-03:00'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 47
optimized_for_llm: true
---

# Contexto do Projeto para Agentes de IA

_Este arquivo contém regras críticas e padrões que agentes de IA devem seguir ao implementar código neste projeto. Foco em detalhes não-óbvios que os agentes podem perder._

---

## Technology Stack & Versions

- **Runtime:** Node.js >= 20.0.0
- **Módulo:** ESM puro (`"type": "module"` em package.json) — NÃO usar `require()`
- **CLI entrypoint:** `bin/conectese.js` (shebang `#!/usr/bin/env node`)
- **Package name:** `conectese` v0.2.0
- **Test runner:** `node --test` nativo (Node.js built-in test runner)
- **Linter:** ESLint v10 (`eslint.config.js` flat config) com `@eslint/js` recommended + `globals.node`
- **Argument parsing:** `node:util` `parseArgs` (zero dependências externas para CLI arg parsing)

### Dashboard (Sub-projeto `dashboard/`)

- **Framework:** React 19 + TypeScript 5.8
- **Bundler:** Vite 6.3 com `@vitejs/plugin-react`
- **State:** Zustand 5
- **Visualização:** Phaser 3.90 (escritório isométrico com sprites de agentes)
- **YAML parsing:** `yaml` v2.7 (apenas no dashboard — CLI parseia YAML com regex)
- **Real-time:** WebSocket nativo (`ws` v8) via Vite plugin customizado (`teamWatcher`)
- **Upload:** `busboy` v1 para multipart form parsing

### Dependências de Produção (CLI)

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `@google/genai` | ^1.48.0 | Integração com Google AI |
| `@inquirer/checkbox` | ^5.1.0 | Prompts interativos multi-seleção |
| `@inquirer/input` | ^5.0.0 | Prompts interativos texto |
| `@inquirer/select` | ^5.1.0 | Prompts interativos seleção |
| `@modelcontextprotocol/sdk` | ^1.29.0 | Protocolo MCP |
| `cheerio` | ^1.2.0 | Parsing HTML |
| `cloudscraper` | ^4.6.0 | Web scraping com anti-bot bypass |
| `dotenv` | ^17.4.0 | Variáveis de ambiente |
| `html-to-docx` | ^1.8.0 | Conversão HTML → DOCX |
| `marked` | ^17.0.5 | Markdown parser |
| `pdf-parse` | ^2.4.5 | Extração de texto de PDFs |

### Dependências Opcionais

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `puppeteer` | ^24.40.0 | Automação de browser |
| `puppeteer-extra` | ^3.3.6 | Plugins para Puppeteer |
| `puppeteer-extra-plugin-stealth` | ^2.11.2 | Stealth mode para scraping |

---

## Regras Críticas de Implementação

### Regras Específicas da Linguagem (JavaScript ESM)

#### Imports e Módulos
- **OBRIGATÓRIO:** Usar apenas `import`/`export` — `require()` é proibido (ESM puro)
- **Imports de Node.js:** Sempre usar o prefixo `node:` — ex: `import { readFile } from 'node:fs/promises'`
- **`__dirname` não existe em ESM.** Recriá-lo manualmente:
  ```js
  const __dirname = dirname(fileURLToPath(import.meta.url));
  ```
  Requer: `import { dirname } from 'node:path'` e `import { fileURLToPath } from 'node:url'`
- **Imports de @inquirer:** São feitos com dynamic `import()` dentro das funções (lazy loading), não no topo do arquivo. Ver padrão em `src/prompt.js`

#### Tratamento de Erros
- **Padrão silencioso para operações não-críticas:** Blocos `catch` vazios são **intencionais** em logging, leitura de preferências e verificação de arquivos. Logging NUNCA deve quebrar a operação principal
- **`{ cause: err }` em Error wrapping:** Usar `new Error('mensagem', { cause: err })` — padrão nativo Node.js
- **Verificação de existência via `stat()` + try/catch:** NÃO usar `existsSync()`. Tentar `stat()` e tratar `ENOENT` no catch
- **Erros de filesystem:** Sempre verificar `err.code === 'ENOENT'` antes de propagar — retornar `[]`, `null` ou `''` como fallback

#### Parsing de YAML Frontmatter (CLI — NÃO no Dashboard)
- **NÃO usar bibliotecas YAML no CLI.** O projeto parseia frontmatter manualmente com regex:
  ```js
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  ```
- Campos extraídos com regex por linha: `fm.match(/^campo:\s*(.+)$/m)`
- YAML folded scalar (`>`) suportado manualmente — ver `getAgentMeta()` e `getSkillMeta()`
- **Normalização de line endings:** Sempre aplicar `.replace(/\r\n/g, '\n')` antes de parsear frontmatter

#### Padrões Async/Await
- **Todas as funções de I/O são `async`** — sem callbacks ou `.then()` chains
- **`fs/promises`** exclusivamente — nunca usar a API síncrona (`readFileSync`, etc.)
- **Top-level await** utilizado no entrypoint CLI (`bin/conectese.js`)
- **Exceção:** `fs.existsSync()` e `fs.readdirSync()` são usados no `teamWatcher.ts` do dashboard em hot-path de upload

---

### Regras do Framework (Dashboard React/Vite)

#### Arquitetura do Dashboard
- **Vite plugin customizado** (`src/plugin/teamWatcher.ts`) serve como backend — NÃO existe server Express/Fastify separado
- O plugin cria um WebSocket em `/__teams_ws` dentro do HTTP server do Vite, coexistindo com o HMR
- **REST API** embutida no middleware Vite: `/api/upload`, `/api/snapshot`, `/api/team/:name/checkpoint`
- **File watcher** usa `chokidar` com `awaitWriteFinish` para evitar leituras de arquivos parciais

#### State Management (Zustand)
- Store em `src/store/useTeamStore.ts`
- Usa `Map<string, T>` (não objetos) para teams e activeStates
- Imutabilidade via `new Map(prev.map)` — nunca mutar Maps diretamente
- Padrão: actions e state no mesmo `create<Store>()` call

#### Componentes React
- **Design System:** shadcn/ui (componentes copy-paste em `src/components/ui/`) + Tailwind CSS v4
- **Tema:** shadcn/ui Zinc theme com CSS variables, dark mode via classe `.dark`
- CSS variables: `var(--background)`, `var(--foreground)`, `var(--muted)`, `var(--border)`, `var(--accent)`
- Path alias `@/` resolve para `dashboard/src/`
- Componentes são funções exportadas nombradas (não default export)

#### WebSocket (Frontend)
- Hook `useTeamSocket` em `src/hooks/` gerencia conexão e reconexão
- Mensagens tipadas: `SNAPSHOT`, `TEAM_UPDATE`, `TEAM_INACTIVE`
- Frontend é read-only via WebSocket — mudanças de estado vêm dos watchers

---

### Regras de Testes

- **Framework:** `node:test` nativo (NÃO Jest, NÃO Vitest)
- **Assertions:** `node:assert/strict` — sempre strict
- **Comando:** `node --test 'tests/**/*.test.js' 'tests/*.test.js'`
- **Padrão de nome:** `<módulo>.test.js` na pasta `tests/`
- **Setup/Teardown:** Diretórios temporários criados com `mkdtemp(join(tmpdir(), 'conectese-test-'))` e limpos com `rm(dir, { recursive: true })` no `finally`
- **Cache:** Sempre chamar `clearMetaCache()` no início de testes que tocam agents/skills
- **Skip gracioso:** Testes que dependem de agentes/skills bundled fazem early return se `listAvailable().length === 0`
- **Sem mocks de filesystem:** Testes usam o filesystem real (tmpdir) — sem stubs

---

### Regras de Qualidade e Estilo

#### Organização de Arquivos (CLI)
```
bin/              → CLI entrypoints (shebang, parseArgs, routing)
src/              → Core lógica (módulos puros, sem side-effects no import)
src/locales/      → Arquivos i18n (en.json, pt-BR.json, es.json)
tests/            → Testes unitários (espelham src/)
agents/           → Definições de agentes bundled (AGENT.md com frontmatter YAML)
skills/           → Skills bundled (SKILL.md + scripts/ + references/)
templates/        → Templates copiados no `init` (incluindo ide-templates/)
_conectese/       → Dados do projeto inicializado (core, config, _memory)
teams/            → Times criados pelo usuário (team.yaml + state.json + output/)
```

#### Convenções de Naming
- **Arquivos:** kebab-case para tudo (`agents-cli.js`, `skills-cli.js`)
- **Funções exportadas:** camelCase (`listInstalled`, `installAgent`, `getAgentMeta`)
- **Funções privadas:** camelCase com prefixo semântico (`validateAgentId`, `copyCommonTemplates`)
- **IDs de agentes/skills:** kebab-case, regex: `/^[a-z0-9][a-z0-9_-]*$/` (agentes) ou `/^[a-z0-9][a-z0-9-]*$/` (skills)
- **Constantes:** UPPER_SNAKE_CASE (`TEMPLATES_DIR`, `CANONICAL_SOURCES`, `MAX_RUNS`)

#### i18n (Internacionalização)
- **3 locales suportados:** `en`, `pt-BR`, `es`
- Função `t(key, vars)` com fallback para inglês quando key ausente
- Variáveis interpoladas com `{key}` (não template literals)
- **Descrições de agents/skills** usam campos separados: `description`, `description_pt-BR`, `description_es`
- Linguagem do prompt inicial é sempre inglês, locale carregado após seleção do idioma

#### Caching
- Agents e Skills usam `Map` como cache de metadados (`metaCache`)
- Cache invalidado manualmente em `install`, `remove` e `clearMetaCache()`
- **NÃO usar TTL ou expiração automática** — invalidação explícita apenas

---

### Regras de Workflow de Desenvolvimento

#### Git & Branches
- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `perf:`, `test:`
- **Branches:** `feat/minha-feature` ou `fix/meu-fix`
- **PR ideal:** 200-400 linhas. Acima de 800 linhas deve ser dividido

#### Filosofia de Design
- **File-based**: O filesystem é a fonte de verdade — sem bancos de dados
- **Dependency-light**: Cada dependência nova é uma barreira — evitar ao máximo
- **Zero setup além de Node.js**: O projeto deve funcionar com `npx conectese init`
- **Verticalizar, não complicar**: Estender via skills/agents, não mudar o core
- **Token-conscious**: Todo conteúdo adicionado (skills, agents, guides) aumenta consumo de tokens

#### Caminhos Protegidos (Update)
- `_conectese/_memory`, `agents/`, `teams/` — NUNCA sobrescrevidos durante `update`
- Backup automático (`.bak`) antes de sobrescrita durante update

---

### Regras Críticas — Não Esquecer!

#### Anti-Patterns a Evitar
- ❌ **NUNCA** usar `require()` — projeto é ESM puro
- ❌ **NUNCA** usar `existsSync()` no CLI — usar `stat()` + try/catch
- ❌ **NUNCA** adicionar bibliotecas YAML no CLI — frontmatter é parseado com regex
- ❌ **NUNCA** sobrescrever `_conectese/_memory/` ou `teams/` durante `update`
- ❌ **NUNCA** quebrar operações por falha de logging — catch silencioso é design
- ❌ **NUNCA** usar callbacks ou `.then()` chains — sempre async/await
- ❌ **NUNCA** usar default exports — sempre named exports

#### Edge Cases Críticos
- **Confirmação bilíngue:** `confirm()` aceita tanto `'y'` (English) quanto `'s'` (Português "sim")
- **Self-copy protection:** `installSkill()` verifica se src === dest para evitar loops infinitos
- **Path normalization:** Windows paths normalizados com `.replace(/\\/g, '/')` antes de comparação
- **Dashboard PROCESSOS dir:** Resolve tanto `../PROCESSOS` (rodando de `dashboard/`) quanto `PROCESSOS` (rodando da raiz)
- **Upload filename sanitization:** `filename.replace(/[^a-zA-Z0-9_.-]/g, '_')` — caracteres especiais substituídos por underscore
- **Case ID sanitization:** `caseId.replace(/[^a-zA-Z0-9_-]/g, '')` — apenas alfanuméricos, underscore e hífens
- **Case ID auto-gerado:** Formato `DD_MM_YYYY_NNNN` com sequencial baseado em contagem de diretórios existentes

#### Segurança
- Skills executam com permissões integrais do usuário local — **sem sandbox**
- Skills MCP recebem tokens do `.env` — nunca hardcodar credenciais
- Skills devem documentar quais serviços externos acessam
- Upload de arquivos vai para `PROCESSOS/` — pasta excluída do git via `.gitignore`

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

Última atualização: 2026-04-12T23:52:22-03:00
