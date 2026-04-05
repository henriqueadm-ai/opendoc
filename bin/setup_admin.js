#!/usr/bin/env node

import input from '@inquirer/input';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_DIR = path.resolve(__dirname, '../_conectese/_memory/company');
const DATA_FILE = path.join(MEMORY_DIR, 'dados.json');

async function runSetup() {
  console.log('🏛️  Bem-vindo ao Setup Administrativo da Conecte.se');
  console.log('Vamos coletar as informações do seu escritório para gerar documentos imponentes.\\n');

  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }

  let existingData = {};
  if (fs.existsSync(DATA_FILE)) {
    existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }

  const officeName = await input({ 
    message: 'Nome do Escritório ou Advogado(a):',
    default: existingData.officeName || ''
  });

  const oab = await input({ 
    message: 'Número da OAB:',
    default: existingData.oab || ''
  });

  const whatsapp = await input({ 
    message: 'Contato / WhatsApp do Escritório:',
    default: existingData.whatsapp || ''
  });

  const address = await input({ 
    message: 'Endereço Completo do Escritório:',
    default: existingData.address || ''
  });

  const logoUrl = await input({ 
    message: 'URL pública da Logo do Escritório (opcional):',
    default: existingData.logoUrl || 'https://via.placeholder.com/150x50?text=LOGO+AQUI'
  });

  const newData = {
    officeName,
    oab,
    whatsapp,
    address,
    logoUrl
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));

  console.log('\\n✅ Memória da empresa atualizada com sucesso em _conectese/_memory/company/dados.json');
  console.log('A partir de agora as IAs administrativas poderão formatar recibos e procurações para você.');
}

runSetup().catch((err) => {
  console.error("Erro no setup:", err);
});
