import { broadcastPipelineUpdate } from '../ws/hub.js';
import { enqueuePipelineJob } from '../queue/pipeline.queue.js';

import { DocConverterService } from './doc-converter.service.js';
import { AnonymizerService } from './anonymizer.service.js';
import { LLMGatewayService } from './llm-gateway.service.js';
import { JurisprudenceScraperService } from './juris-scraper.service.js';
import { AuditService } from './audit.service.js';

/**
 * Orquestrador Central do Pipeline 1 a 13.
 */
export const processPipelineStage = async (processId, currentStage, tenantSchema) => {
  try {
    const stageNames = [
      'WAIT', 'INGESTAO', 'CONVERSAO', 'VALIDACAO', 'ANONIMIZACAO_LGPD',
      'PSEUDONIMIZACAO', 'ROTEAMENTO', 'AGENTE_ESPECIALISTA', 'JURISPRUDENCIA',
      'REDACAO', 'CHECKPOINT_HUMANO', 'VISUAL_LAW', 'RESTAURACAO', 'EXPORTACAO'
    ];
    
    const stageName = stageNames[currentStage] || 'DESCONHECIDO';
    console.log(`[Pipeline Service] Stage ${currentStage} - ${stageName}`);
    
    let tokensUsed = 0;
    let cost = 0;
    let agentName = 'system-orcs';

    broadcastPipelineUpdate(processId, {
      stage: currentStage, status: 'RUNNING', agentName, tokensUsed, cost, durationMs: 0
    });

    // WIP: A instância do prismaTenant viria de um cache ou manager local
    const tenantPrisma = {}; 
    const startTime = Date.now();

    // ---------------------------------------------------------
    // MACRO SWITCH DO PIPELINE
    // ---------------------------------------------------------
    switch(currentStage) {
      
      case 2: // CONVERSÃO
        agentName = 'doc-converter';
        // Mock de arquivos na RAM. Na prod real, pegariamos de um Node shared Hash ou tmpfs.
        const mockDocs = [{ filename: 'peticao.pdf', mime_type: 'application/pdf', size_bytes: 5000 }];
        const mockBuffers = [Buffer.from('Mock pdf data')];
        // O serviço OCR extrai texto bruto
        const rawText = await DocConverterService.convertProcessDocuments(mockDocs, mockBuffers);
        
        // Log Audit
        await AuditService.logEvent(tenantPrisma, processId, {
          type: 'DOCUMENTS_CONVERTED', description: 'Documentos extraídos em texto bruto via OCR', agentName
        });
        break;

      case 4: // ANONIMIZACAO_LGPD
        agentName = 'lgpd-anonymizer';
        // WIP: Leríamos o texto bruto gerado no passo 2
        const sampleRaw = 'O id civil do autor é 123.456.789-00, e seu e-mail: test@example.com';
        const safeText = await AnonymizerService.anonymizeText(tenantPrisma, processId, sampleRaw);
        
        await AuditService.logEvent(tenantPrisma, processId, {
           type: 'DATA_ANONYMIZED', description: 'Identificadores LGPD encriptados', agentName
        });
        break;

      case 8: // JURISPRUDENCIA
        agentName = 'juris-validator';
        // Pesquisador web 
        const precedents = await JurisprudenceScraperService.searchCases('Direito F.', 'Guarda compartilhada e bem estar');
        
        await AuditService.logEvent(tenantPrisma, processId, {
          type: 'JURISPRUDENCE_SEARCHED', description: `Coletados ${precedents.length} resultados via Web`, agentName
        });
        break;

      case 9: // REDAÇÃO LLM Agent
        agentName = 'draft-writer';
        // Integramos com Gemini/Claude
        const prompt = 'Baseado na jurisprudencia passada e no caso anonimizado, redija a petição inicial...';
        const llmResult = await LLMGatewayService.generate(1, prompt, { provider: 'OPENROUTER' });
        
        tokensUsed = llmResult.tokensUsed;
        cost = llmResult.cost;

        await AuditService.logEvent(tenantPrisma, processId, {
          type: 'PETITION_DRAFTED', description: 'Rascunho legal finalizado sem dados sensíveis PII', agentName
       });
       break;

      case 10: // CHECKPOINT_HUMANO
        console.log(`[Pipeline Service] Stage 10 atingido. PAUSED (Intervenção humana requerida).`);
        // Aqui não enfileiramos o Stage 11 até a aprovação da chamada `/api/processes/:id/approve`
        return;

      case 12: // RESTAURAÇÃO DE DADOS
        agentName = 'data-restorer';
        const mockDraft = 'O autor [CPF_1] solicita os pedidos contra a empresa...';
        const restoredText = await AnonymizerService.restoreText(tenantPrisma, processId, mockDraft);
        // Pipeline agora tem texto pronto pra PDF final
        break;

      default:
        // Pass-through temporizador 
        await new Promise(r => setTimeout(r, 1000));
        break;
    }

    const durationMs = Date.now() - startTime;

    // Conclusão e Broadcast
    broadcastPipelineUpdate(processId, {
      stage: currentStage, status: 'DONE', agentName, tokensUsed, cost, durationMs
    });

    // Encaminha sucessor se aplicável
    if (currentStage < 13) {
      await enqueuePipelineJob(processId, currentStage + 1, tenantSchema);
    } else {
      console.log(`[Pipeline Service] Pipeline COMPLETO ${processId}`);
    }

  } catch (error) {
    console.error(`[Pipeline Service] Falha grave no Stage ${currentStage}`, error);
    broadcastPipelineUpdate(processId, { stage: currentStage, status: 'ERROR', error: error.message });
  }
};
