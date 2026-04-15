import { create } from 'zustand';

export interface PipelineStageState {
  stage: number;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR' | 'VETOED';
  agentName: string;
  tokensUsed: number;
  cost: number;
  durationMs: number;
  error?: string;
}

interface PipelineState {
  // Processo ativo na tela
  activeProcessId: number | null;
  pipelineStatus: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR';
  stages: PipelineStageState[];
  totalTokens: number;
  totalCost: number;

  setActiveProcess: (processId: number) => void;
  setPipelineStatus: (status: PipelineState['pipelineStatus']) => void;
  updateStage: (update: PipelineStageState) => void;
  resetPipeline: () => void;
}

const STAGE_NAMES = [
  '', 'Ingestão', 'Conversão', 'Validação', 'Anonimização LGPD',
  'Pseudonimização', 'Roteamento', 'Agente Especialista', 'Jurisprudência',
  'Redação', 'Checkpoint Humano', 'Visual Law', 'Restauração', 'Exportação'
];

const createInitialStages = (): PipelineStageState[] =>
  Array.from({ length: 13 }, (_, i) => ({
    stage: i + 1,
    status: 'PENDING',
    agentName: STAGE_NAMES[i + 1] || 'unknown',
    tokensUsed: 0,
    cost: 0,
    durationMs: 0,
  }));

export const usePipelineStore = create<PipelineState>()((set, get) => ({
  activeProcessId: null,
  pipelineStatus: 'IDLE',
  stages: createInitialStages(),
  totalTokens: 0,
  totalCost: 0,

  setActiveProcess: (processId) =>
    set({ activeProcessId: processId, stages: createInitialStages(), pipelineStatus: 'RUNNING', totalTokens: 0, totalCost: 0 }),

  setPipelineStatus: (status) => set({ pipelineStatus: status }),

  updateStage: (update) =>
    set((state) => {
      const stages = state.stages.map((s) =>
        s.stage === update.stage ? { ...s, ...update } : s
      );
      const totalTokens = stages.reduce((a, s) => a + s.tokensUsed, 0);
      const totalCost = stages.reduce((a, s) => a + s.cost, 0);

      // Determinar status global
      const hasError = stages.some((s) => s.status === 'ERROR');
      const allDone = stages.every((s) => s.status === 'DONE');
      let pipelineStatus = state.pipelineStatus;
      if (hasError) pipelineStatus = 'ERROR';
      else if (allDone) pipelineStatus = 'COMPLETED';
      else if (stages.some((s) => s.status === 'RUNNING')) pipelineStatus = 'RUNNING';

      return { stages, totalTokens, totalCost, pipelineStatus };
    }),

  resetPipeline: () =>
    set({ activeProcessId: null, pipelineStatus: 'IDLE', stages: createInitialStages(), totalTokens: 0, totalCost: 0 }),
}));

export { STAGE_NAMES };
