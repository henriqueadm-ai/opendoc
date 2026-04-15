#!/usr/bin/env node

/**
 * pricing-engine.js
 * 
 * Script que lida com a matemática e as regras de precificação.
 * Sua principal responsabilidade é jogar uma âncora de segurança (Halt & Catch) se faltarem os requisitos brutos
 * da equipe ou dos extratores (por exemplo, qual o valor da causa/imóvel/etc).
 */

const args = process.argv.slice(2);

// Expected payload format: --payload='{"valorDaCausa": 50000, "tabelaOabTaxa": 0.20, "tipoAcao": "civel"}'
let payloadStr = args.find(a => a.startsWith('--payload='))?.split('=')[1];

if (!payloadStr) {
  console.error(JSON.stringify({
    status: "ERROR",
    message: "--payload ausente"
  }));
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(payloadStr);
} catch (e) {
  console.error(JSON.stringify({
    status: "ERROR",
    message: "Falha no parse do payload JSON"
  }));
  process.exit(1);
}

// HALT & CATCH (User Input Required Mechanism)
const missingFields = [];
if (typeof payload.valorDaCausa !== 'number') missingFields.push('valorDaCausa');

// If there's missing critical parameters, throw an instruction for the agent to prompt the human
if (missingFields.length > 0) {
  const response = {
    status: "REQUIRED_USER_INPUT",
    target: "Advogado",
    missingFields: missingFields,
    instruction: `Você não possui dados vitais financeiros para prosseguir. Pergunte explicitamente ao usuário (Advogado): 'Para prosseguir com a precificação, por favor me informe o valor da causa exato. Qual seria este valor?'`
  };
  console.error(JSON.stringify(response, null, 2));
  process.exit(2);
}

// CÁLCULO GERAL (Mockado com premissas base ou customizadas no payload)
const taxaCustasTj = payload.taxaCustasTj || 0.01; // default 1% custas inciais ex: TJ-SP
const taxaHonorarios = payload.tabelaOabTaxa || 0.20; // default 20% honorários OAB

const valorDaCausa = payload.valorDaCausa;
const estimativaCustasIniciais = valorDaCausa * taxaCustasTj;
const honorariosEstimados = valorDaCausa * taxaHonorarios;
const totalEstimado = valorDaCausa + estimativaCustasIniciais + honorariosEstimados;

const result = {
  status: "SUCCESS",
  data: {
    valorDaCausa: valorDaCausa.toFixed(2),
    custasIniciaisEstimadas: estimativaCustasIniciais.toFixed(2),
    honorariosEstimados: honorariosEstimados.toFixed(2),
    totalResponsabilidadeFinanceira: totalEstimado.toFixed(2),
    aviso: "Cálculos matemáticos realizados pelo módulo Engine e validados via script seguro."
  }
};

console.log(JSON.stringify(result, null, 2));
process.exit(0);
