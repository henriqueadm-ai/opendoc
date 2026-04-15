import { useEffect, useRef } from 'react';
import { usePipelineStore } from '@/store/usePipelineStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/__pipeline_ws';

/**
 * Hook que conecta ao WebSocket do Pipeline Hub e alimenta o Zustand store.
 * Auto-reconecta em caso de queda (NFR23).
 */
export function usePipelineSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const updateStage = usePipelineStore((s) => s.updateStage);
  const setPipelineStatus = usePipelineStore((s) => s.setPipelineStatus);
  const activeProcessId = usePipelineStore((s) => s.activeProcessId);

  useEffect(() => {
    if (!activeProcessId) return;

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[PipelineSocket] Conectado');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'PIPELINE_STAGE_UPDATE' && msg.data.processId === activeProcessId) {
            updateStage({
              stage: msg.data.stage,
              status: msg.data.status,
              agentName: msg.data.agentName || '',
              tokensUsed: msg.data.tokensUsed || 0,
              cost: msg.data.cost || 0,
              durationMs: msg.data.durationMs || 0,
              error: msg.data.error,
            });
          }

          if (msg.type === 'PIPELINE_COMPLETE' && msg.data.processId === activeProcessId) {
            setPipelineStatus('COMPLETED');
          }

          if (msg.type === 'PIPELINE_ERROR' && msg.data.processId === activeProcessId) {
            // O stage update já cuida do status de ERROR
          }
        } catch (e) {
          console.warn('[PipelineSocket] Parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('[PipelineSocket] Desconectado, reconectando em 3s...');
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('[PipelineSocket] Erro:', err);
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [activeProcessId, updateStage, setPipelineStatus]);
}
