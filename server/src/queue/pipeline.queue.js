import { Queue, Worker } from 'bullmq';
import { processPipelineStage } from '../services/pipeline.service.js';

// Usaremos a conexão Redis default se IOREDIS estiver configurado
const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379
};

// Fila de Orquestração do Pipeline
export const pipelineQueue = new Queue('PipelineProcessingQueue', { connection });

// Em file-based dev env, podemos ter fallback (NFR28) se o Redis cair. Mas BullMQ resolve.
console.log(`[Queue] Conectando BullMQ no Redis: ${connection.host}:${connection.port}`);

// Worker que processará a fila
export const pipelineWorker = new Worker(
  'PipelineProcessingQueue',
  async (job) => {
    const { processId, stageNumber, tenantSchema } = job.data;
    console.log(`[Queue Worker] Iniciando ProcessID: ${processId} | Stage: ${stageNumber}`);
    
    await processPipelineStage(processId, stageNumber, tenantSchema);
  },
  { 
    connection,
    // Permite multi-processamento em background
    concurrency: 5 
  }
);

pipelineWorker.on('completed', (job) => {
  console.log(`[Queue] Job completed! ID: ${job.id}`);
});

pipelineWorker.on('failed', (job, err) => {
  console.log(`[Queue] Job failed! ID: ${job.id} com erro: ${err.message}`);
});

/**
 * Função utilitária para chamar nas rotas
 */
export const enqueuePipelineJob = async (processId, stageNumber = 1, tenantSchema = 'tenant_test') => {
  await pipelineQueue.add(`Process_${processId}_Stage_${stageNumber}`, {
    processId,
    stageNumber,
    tenantSchema
  }, {
    attempts: 3,             // NFR28
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
};
