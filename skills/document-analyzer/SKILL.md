---
name: document-analyzer
description: >
  Motor analítico de documentos para extração e estruturação profunda de PDFs.
  Lê arquivos não estruturados e aplica frameworks de extração semântica 
  (classificação de entidades, SLAs, Prazos, CNPJs, etc.).
version: "1.0.0"
type: "custom"
categories: [data, parsing, legal]
---

# Document Analyzer

## When to use

Use a ferramenta `document-analyzer` quando você ou outro Agente precisar inferir e extrair inteligência processável a partir de contratos, relatórios, peças processuais ou arquivos PDF enviados por usuários. Esta skill consolida extração óptica/vetorial (OCR/Parsing) com a sua própria capacidade nativa cognitiva para devolver formatos padronizados (JSON, Markdown) livres de ruído estrutural.

## Instructions

Esta Skill invoca scripts locais do Node.js (via bash) juntamente com suas próprias heurísticas de extração semântica.

### Key capabilities

- **Text Extraction (PDFs):** Extração bruta de texto de vetores locais usando algoritmos otimizados para evitar alucinações de formatação.
- **Data Extractor Pipeline:** Extração estruturada de dados densos (ex: Cláusulas de Quebra, Multas, Prazos Recusais, Qualificação de Partes) de forma determinística.
- **Noise Reduction:** Limpeza de cabeçalhos/rodapés mortos que gastam cota de tokens no prompt.

### Best practices

- **Sempre Verifique o Retorno:** Ao ler um arquivo grande usando a ferramenta de extração, procure limitar a resposta fatiando-a, se for necessário analisar em múltiplos passos.
- **Saída Estruturada:** Se o usuário pedir os "termos chave", elabore um mapeamento estrito retornando num formato de blocos demarcados (`JSON` ou `lista md`).
- **Anonimização (LGPD):** Se você for rotear o resultado documentado para fora do ambiente de auditoria, Oculte CPFs e nomes sensíveis.

## Available operations

Abaixo explicamos o wrapper integrado para consumo. Execute o script com sua sandbox local:

- `node skills/document-analyzer/scripts/parse-doc.js <caminho.pdf>`: Recebe um arquivo PDF e tenta extrair o texto via parsing nativo. Caso retorne texto vazio (indicando ser um arquivo digitalizado/imagem), **fará um fallback automático** para leitura via LLM (Gemini Vision) em background requerendo a chave de ambiente `GEMINI_API_KEY`.
- `node skills/document-analyzer/scripts/parse-doc.js <caminho.pdf> --vision`: Força imediatamente a leitura visual multimodal desabilitando a decodificação pura do arquivo local.
- `node skills/document-analyzer/scripts/parse-doc.js <caminho.pdf> --extract="Extraia apenas os valores e datas em formato JSON"`: Além de fazer OCR/Vision do documento, embute um system prompt customizado onde a extração será orientada de modo formidável a retornar dados pré-estruturados conforme seu pedido.
