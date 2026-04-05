---
name: conectese-design
description: >
  Motor de design jurídico (Visual Law). Converte Markdown judicial em PDFs
  e DOCXs estilizados com timbre do escritório, empregando CSS premium e
  Puppeteer para renderização fiel. Inclui geração de contratos, procurações,
  recibos e peças processuais formatadas.
type: mcp
version: "1.0.0"
mcp:
  server_name: conectese-design
  command: node
  args: ["skills/conectese-design/index.cjs"]
  transport: stdio
categories: [design, legal, pdf, visual-law]
---

# Conectese Design (Visual Law Engine)

## When to use

Use esta skill quando o pipeline precisar gerar documentos jurídicos em PDF ou DOCX com formatação profissional e timbre do escritório. Ela é o motor de saída visual da plataforma Conecte.se.

## Instructions

### Ferramentas disponíveis (MCP Tools)

- **`generate_visual_law_pdf`**: Recebe Markdown + ID do processo, gera PDF estilizado com timbre institucional.
- **`generate_visual_law_docx`**: Mesmo fluxo mas gera DOCX editável.
- **`generate_contract_pdf`**: Gera PDF de contrato preenchido a partir de modelo + dados do cliente.

### Parâmetros obrigatórios

| Parâmetro | Descrição |
|-----------|-----------|
| `markdownContent` | O conteúdo Markdown da peça/documento |
| `processId` | ID do processo (ex: `P05_04_0001`) ou `ADMINISTRATIVO` para documentos fora de processos |
| `outputFormat` | `pdf` ou `docx` |

### Comportamento de saída

- PDFs e DOCXs são salvos automaticamente em `PROCESSOS/{processId}/` ou `ADMINISTRATIVO/`.
- O timbre do escritório é carregado de `_conectese/_memory/company/dados.json`.
- CSS premium aplicado com fontes profissionais e espaçamento tipográfico adequado.

### Best practices

- Sempre passe o `processId` correto para organização automática de arquivos.
- O Markdown de entrada deve usar as tags de anonimização `[PESSOA_1]` até o `lgpd-restorer` fazer a restauração final.
- Para documentos administrativos (contratos, procurações), use `ADMINISTRATIVO` como processId.
