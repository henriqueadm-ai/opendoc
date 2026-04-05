---
name: conectese-scraper
description: >
  Motor de busca nativo do Conectese para rastreabilidade de jurisprudências,
  processos, acórdãos e doutrinas. Realiza pesquisas em fontes estritas de
  tribunais e indexadores jurídicos retornando citações auditáveis focadas em LGPD.
version: "1.0.0"
type: "custom"
categories: [scraping, data, legal]
---

# Conectese Scraper

## When to use

Use a ferramenta \`conectese-scraper\` quando o agente Sênior (ex: Especialista em Direito Penal, Direito Civil) precisar embasar sua argumentação jurídica. O scraper impede alucinações (inventar leis ou números de processos) forçando a captura de trechos reais, dados jurisprudenciais atualizados e suas respectivas URLs oficiais.

## Instructions

Esta Skill encapsula conectores de pesquisa web voltados para o domínio brasileiro jurídico.

### Key capabilities

- **Jurisprudência Verídica:** Busca acórdãos recentes em tribunais brasileiros.
- **Doutrina Rápida:** Captura links ou resumos de artigos jurídicos.
- **Rastreabilidade (Link Auditável):** Todas as chamadas geram o "Link da Fonte", permitindo que humanos garantam a validade dos fatos.
- **Anonimização Passiva:** Assegura que nenhum dado privado será devolvido expandido do seu formato LGPD (ex: \`[PESSOA_1]\`).

### Best practices

- **Sempre cite a Fonte:** Exija que a ferramenta devolva a URL e ponha na sua tese gerada.
- **Use Aspas Inteligentes:** Para termos polêmicos (ex: \`"nulidade" "violação de domicílio" site:stj.jus.br\`), instrua o payload de busca.

## Available operations

- \`search_jurisprudence\`: Insere um termo de busca e retorna JSON com tribunal, processo e ementa. (Inclui engine interno que inspeciona HTML do Jusbrasil para extrair número de processo oculto)
- \`verify_case\`: Faz lookup de um número de processo específico num portal (futuro).
