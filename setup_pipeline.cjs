const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'teams', 'conectese-case');
if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR, { recursive: true });
}

const pipelineYaml = `name: Conectese Case Processing Pipeline
description: Pipeline rigoroso de 6 estagios para extracao, anonimizacao, analise, distribuicao, sintese e restauracao de pecas juridicas.
version: 1.0.0

stages:
  - id: data-extraction
    name: "A. Extracao de Dados"
    agent: data-extractor
    input: raw_files/
    output: workspace/context_raw.md
    instructions: "Extraia todo o conteudo bruto dos arquivos enviados e converta para Markdown legivel. NAO modifique ou anonimize."

  - id: lgpd-anonymization
    name: "B. Anonimizacao LGPD"
    agent: lgpd-anonymizer
    input: workspace/context_raw.md
    output: workspace/context_sanitized.md
    artifacts: 
      - workspace/lgpd_dictionary.json
    instructions: "Varra o documento, mascare todas as PIIs gerando tags como [PESSOA_1] e salve o mapeamento no dicionario JSON."

  - id: legal-analysis
    name: "C. Analise Juridica Tatica"
    agent: legal-analyst
    input: workspace/context_sanitized.md
    output: workspace/legal_skeleton.md
    instructions: "Analise os fatos sanitizados, defina as taticas macro, identifique principais teses e gere o esqueleto juridico do caso."

  - id: jurisprudence-search
    name: "D. Busca de Jurisprudencia"
    agent: jurisprudencia-validator
    input: workspace/legal_skeleton.md
    output: workspace/jurisprudence_data.md
    instructions: "Raspe e valide teses nos tribunais (STJ, STF, TJ) fortalecendo o esqueleto juridico com jurisprudencias atualizadas."

  - id: task-routing
    name: "E. Distribuicao de Teses"
    agent: task-router
    input: workspace/jurisprudence_data.md
    output: workspace/expert_responses.md
    dynamic_routing: true
    instructions: "Quebre o esqueleto enriquecido em topicos juridicos e invoque os especialistas corretos para fundamentar."

  - id: synthesis
    name: "F. Sintese e Redacao"
    agent: legal-synthesizer
    input: workspace/expert_responses.md
    output: workspace/draft_sanitized.md
    instructions: "Costure a fundamentacao em uma minuta coesa e forense. Mantenha as tags pseudonimizadas intocadas."

  - id: visual-law
    name: "G. Visual Law"
    agent: legal-designer
    input: workspace/draft_sanitized.md
    output: workspace/draft_formatted.md
    instructions: "Aplique tecnicas de Visual Law e Legal Design estruturando o documento de forma limpa, com iconografias e diagramas onde aplicavel."

  - id: lgpd-restoration
    name: "H. Restauracao de Dados LGPD"
    agent: lgpd-restorer
    input: workspace/draft_formatted.md
    dictionary: workspace/lgpd_dictionary.json
    output: workspace/final_document.md
    instructions: "Substitua todas as tags pelas informacoes reais usando rigorosamente o dicionario gerado no passo B. Entregue a peca final."
`;

fs.writeFileSync(path.join(DIR, 'pipeline.yaml'), pipelineYaml, 'utf8');

const stateJson = {
  "team": "conectese-case",
  "status": "idle",
  "step": { "current": 0, "total": 8, "label": "Pipeline Pronto" },
  "agents": [
    { "id": "data-extractor", "name": "Extrator", "icon": "📄", "status": "idle" },
    { "id": "lgpd-anonymizer", "name": "LGPD Anonimizador", "icon": "🛡️", "status": "idle" },
    { "id": "legal-analyst", "name": "Analista", "icon": "🔎", "status": "idle" },
    { "id": "jurisprudencia-validator", "name": "Busca de Jurisprudencia", "icon": "⚖️", "status": "idle" },
    { "id": "task-router", "name": "Router", "icon": "🚦", "status": "idle" },
    { "id": "legal-synthesizer", "name": "Sintetizador", "icon": "✍️", "status": "idle" },
    { "id": "legal-designer", "name": "Legal Designer", "icon": "🎨", "status": "idle" },
    { "id": "lgpd-restorer", "name": "LGPD Restaurador", "icon": "🔓", "status": "idle" }
  ],
  "startedAt": null,
  "updatedAt": new Date().toISOString()
};

fs.writeFileSync(path.join(DIR, 'state.json'), JSON.stringify(stateJson, null, 2), 'utf8');
console.log('Pipeline files written successfully.');
