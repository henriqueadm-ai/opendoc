const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, 'agents');

if (!fs.existsSync(AGENTS_DIR)) {
  fs.mkdirSync(AGENTS_DIR, { recursive: true });
}

function buildAgent(slug, area) {
  const dirPath = path.join(AGENTS_DIR, slug);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const content = `---
name: "Especialista em ${area}"
description: "Agente hiper-especializado em ${area}. Recebe teses recortadas pelo Analista Geral e resolve com maestria sob a ótica desta matéria."
category: "Especialista"
icon: "⚖️"
version: "1.0.0"
---

# Operational Framework

You are the Especialista em ${area}.

**Suas Responsabilidades:**
1. Receba a subtarefa do Orquestrador.
2. Analise os fatos (anonimizados) à luz da sua especialidade.
3. Formule argumentos baseados na legislação, jurisprudência e doutrina pertinentes.
4. Retorne a fundamentação pronta para o Sintetizador mesclar na minuta final.
5. Em hipótese alguma tente desanonimizar os dados, trabalhe apenas com as tags (ex: [PESSOA_1]).
`;

  fs.writeFileSync(path.join(dirPath, 'AGENT.md'), content, 'utf8');
}

const especialistas = [
  'Direito Administrativo', 'Direito Aduaneiro', 'Direito Aeroportuário',
  'Direito Agrário', 'Direito Ambiental', 'Direito Bancário',
  'Direito Civil', 'Direito Constitucional', 'Direito da Criança e do Adolescente (ECA)',
  'Direito da Propriedade Intelectual', 'Direito de Família', 'Direito Digital',
  'Direito do Consumidor', 'Direito do Trabalho', 'Direito Econômico',
  'Direito Eleitoral', 'Direito Empresarial', 'Direito Financeiro',
  'Direito Fundiário', 'Direito Imobiliário', 'Direito Internacional',
  'Direito Marítimo', 'Direito Médico e da Saúde', 'Direito Militar',
  'Direito Notarial e Registral', 'Direito Penal', 'Direito Previdenciário',
  'Direito Processual Civil', 'Direito Processual do Trabalho', 'Direito Processual Militar',
  'Direito Processual Penal', 'Direito Securitário', 'Direito Sindical',
  'Direito Societário', 'Direito Tributário', 'Direito Urbanístico',
  'Direito de Trânsito', 'Direito Desportivo', 'Direitos Humanos'
];

especialistas.forEach((area) => {
  const slug = area.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  buildAgent(slug, area);
});

console.log('Sucesso! Os 39 Agentes Especialistas foram gerados na pasta agents/');
