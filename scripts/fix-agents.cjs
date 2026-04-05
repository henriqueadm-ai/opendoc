#!/usr/bin/env node
/**
 * Script to batch-fix all 39 specialist agent AGENT.md files:
 * 1. Remove phantom skills (document-analyzer and *-toolbox) from frontmatter
 * 2. Remove toolbox references from body text
 * 3. Fix any old corrupted names in internal text
 */
const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'agents');

// Map of old corrupted names to new correct names (for fixing internal text)
const NAME_FIXES = {
  'Direito Adaneiro': 'Direito Aduaneiro',
  'Direito Aeroportário': 'Direito Aeroportuário',
  'Direito Agrário': 'Direito Agrário',
  'Direito Bancário': 'Direito Bancário',
  'Direito Constitcional': 'Direito Constitucional',
  'Direito da Propriedade Intelectal': 'Direito da Propriedade Intelectual',
  'Direito do Consmidor': 'Direito do Consumidor',
  'Direito Econômico': 'Direito Econômico',
  'Direito Imobiliário': 'Direito Imobiliário',
  'Direito Inanceiro': 'Direito Financeiro',
  'Direito Marítimo': 'Direito Marítimo',
  'Direito Previdenciário': 'Direito Previdenciário',
  'Direito Rbanístico': 'Direito Urbanístico',
  'Direito Secritário': 'Direito Securitário',
  'Direito Societário': 'Direito Societário',
  'Direito Tribtário': 'Direito Tributário',
  'Direitos Hmanos': 'Direitos Humanos',
  'Direito Ndiário': 'Direito Indígena',
};

const entries = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
let fixedCount = 0;

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (!entry.name.startsWith('direito') && entry.name !== 'direitos-humanos') continue;

  const agentFile = path.join(AGENTS_DIR, entry.name, 'AGENT.md');
  if (!fs.existsSync(agentFile)) continue;

  let content = fs.readFileSync(agentFile, 'utf8');
  const original = content;

  // 1. Remove document-analyzer and *-toolbox from skills array
  // Replace the skills block to only keep conectese-scraper
  content = content.replace(
    /skills:\n\s+- conectese-scraper\n\s+- document-analyzer\n\s+- [\w-]+-toolbox/,
    'skills:\n  - conectese-scraper'
  );

  // 2. Remove toolbox reference from body text
  content = content.replace(
    /\* Se for necessário buscar uma norma ou acórdão específico do seu nicho de atuação: Chame `[\w-]+-toolbox` \(ou utilize o `conectese-scraper` passando o contexto da sua área\)\.\n/,
    '* Se for necessário buscar uma norma ou acórdão específico do seu nicho de atuação: Utilize o `conectese-scraper` passando o contexto detalhado da sua área como parâmetro de busca.\n'
  );

  // 3. Fix any corrupted internal names
  for (const [wrong, right] of Object.entries(NAME_FIXES)) {
    if (content.includes(wrong)) {
      content = content.replaceAll(wrong, right);
    }
  }

  if (content !== original) {
    fs.writeFileSync(agentFile, content, 'utf8');
    fixedCount++;
    console.log(`✅ ${entry.name}`);
  } else {
    console.log(`⏭️  ${entry.name} (no changes needed)`);
  }
}

// Also fix legal-analyst which references document-analyzer
const analystFile = path.join(AGENTS_DIR, 'legal-analyst', 'AGENT.md');
if (fs.existsSync(analystFile)) {
  let content = fs.readFileSync(analystFile, 'utf8');
  if (content.includes('document-analyzer')) {
    content = content.replace(
      /skills:\n\s+- document-analyzer/,
      'skills:\n  - conectese-scraper'
    );
    fs.writeFileSync(analystFile, content, 'utf8');
    fixedCount++;
    console.log('✅ legal-analyst (removed document-analyzer)');
  }
}

console.log(`\n🏁 Total fixed: ${fixedCount} agents`);
