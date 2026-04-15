import { WebSocketServer } from 'ws';

export let wss;

export const attachWebSocketHub = (server) => {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    // Apenas no path __pipeline_ws
    if (request.url === '/__pipeline_ws') {
      // WIP: Aqui validaríamos token JWT (tenant) do usuário para garantir isolamento
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Novo client conectado no pipeline hub');
    
    ws.on('message', (message) => {
      console.log('[WebSocket] Mensagem recebida:', message.toString());
    });
    
    ws.on('close', () => {
      console.log('[WebSocket] Client desconectado');
    });
  });
};

/**
 * Envia atualizações do pipeline em tempo real para os clientes.
 */
export const broadcastPipelineUpdate = (processId, updateData) => {
  if (!wss) return;

  const payload = JSON.stringify({
    type: 'PIPELINE_STAGE_UPDATE',
    data: {
      processId,
      ...updateData
    }
  });

  // Emite para todos os conectados (WIP: Na epic 1 isolaríamos por "rooms" / socket.userId)
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(payload);
    }
  });
};
