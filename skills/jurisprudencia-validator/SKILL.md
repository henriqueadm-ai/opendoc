---
name: jurisprudencia-validator
description: Skill de validação de URLs anti-alucinação para links de jurisprudência e doutrina.
---

# Jurisprudencia Validator

## Objetivo
O objetivo principal desta skill é auditar petições, teses e pareceres elaborados pelos agentes para evitar a inclusão de "alucinações" - links quebrados, URLs inventadas para jurisprudências e metadados falsos. O script central faz um fetch das URLs, evadindo bloqueios de raspagem simples, para confirmar que a página está ativa e o título condiz com a tese.

## Como Usar

Sempre que atuar numa revisão de documento ou após pesquisar jurisprudência para inserção em uma peça, você **DEVE OBRIGATORIAMENTE** passar as URLs citadas pelo validador antes de entregar para o usuário final.

### Executando a Validação

Utilize o script Node.js incluso no diretório da skill passando a(s) URL(s) como argumento:

```bash
node skills/jurisprudencia-validator/scripts/validate-urls.js "https://stj.jus.br/exemplo1" "https://jusbrasil.com.br/exemplo2"
```

### Interpretando a Resposta JSON

O script joga erros genéricos/logs no banco de dados interno ou `stderr`, então sempre faça o parse do `stdout` na resposta. O retorno será similar a isto:

```json
[
  {
    "url": "https://stj.jus.br/exemplo1",
    "status": "ok",
    "title": "Superior Tribunal de Justiça - AgRg no Resp 1234..."
  },
  {
    "url": "https://jusbrasil.com.br/exemplo2",
    "status": "dead",
    "reason": "Página não encontrada (404)"
  }
]
```

### Regras de Ouro
1. **Política Zero Alucinação**: Se o link retornar `status: "dead"`, **remova a citação imediatamente** da peça documental e procure outra, ou avise a `Team` que a jurisprudência está inválida e perigosa.
2. **Páginas Inconclusivas**: Se o link retornar `status: "unknown"`, você tem permissão legal e discricionária para manter a URL caso a argumentação da jurisprudência seja muito sólida (Tribunais podem estar indisponíveis periodicamente). No entanto, inclua um disclaimer.
3. **Validação de Conformidade**: Valide se o `title` retornado pertence ao Tribunal ou assunto narrado para garantir assertividade contextual.
