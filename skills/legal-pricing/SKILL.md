---
name: "Precificação Jurídica"
description: "Motor de precificação de custas processuais e honorários advocatícios para o Conecte.se, contendo diretrizes anti-alucinação."
version: "1.0.0"
category: "Pipeline Secundário"
---

# Precificação Jurídica - Diretrizes para o Agente

## Objetivo
Esta skill permite ao agente estimar valores de honorários e custas processuais, utilizando os preceitos de cálculo extraídos dos fatos da causa.

## O Protocolo "Halt & Catch" (Regra Zero Alucinação)
1. **NUNCA PRESUMA VALORES FINANCEIROS.**
   * Jamais tente "chutar" qual seja o *valor da causa* ou a *tabela de custas* se não estiver expressa nos documentos extraídos.
   * Não adivinhe a alíquota base de honorários do Estado correspondente, muito menos crie médias inventadas.

2. **Acione o script `pricing-engine.js`:**
   Sempre que precisar precificar, você **DEVE** repassar os fatos e valores brutos ao script `scripts/pricing-engine.js`. 
   
   O comando esperado no sistema será algo como:
   `node skills/legal-pricing/scripts/pricing-engine.js --payload='{"valorDaCausa": 10000, "taxaHonorarios": 0.20}'`

3. **Se o script retornar falha por dados ausentes (`REQUIRED_USER_INPUT`):**
   * O sistema automaticamente capturará essa falha.
   * O script formatará um bloco em formato de instrução do qual você baseará sua resposta.
   * Repasse EXATAMENTE o erro direcionando ao Advogado (usuário final) para ele responder à dúvida de valores.
   
## Como Operar
1. Forme o payload em JSON baseado na análise dos especialistas (`document-analyzer`).
2. Tente calcular através do script de apoio.
3. Se o script concluir, gere o "Quadro de Precificação Estimado".
4. Se o script requisitar mais informações, interrompa imediatamente a pipeline e formalize o pedido de informações.
