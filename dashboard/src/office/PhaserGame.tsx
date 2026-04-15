import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { OfficeScene } from './OfficeScene';
import { usePipelineStore, STAGE_NAMES } from '@/store/usePipelineStore';
import type { Agent, AgentStatus } from '@/types/state';

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  // Create Phaser game on mount
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const container = containerRef.current;
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      width: w,
      height: h,
      pixelArt: false,          // disabled globally so text renders smooth
      antialias: false,          // keep pixel art look for sprites
      roundPixels: true,         // snap sprites to whole pixels
      backgroundColor: '#1a1420',
      scene: [OfficeScene],
      scale: {
        mode: Phaser.Scale.NONE,
      },
    });

    gameRef.current = game;

    // Resize canvas when container resizes
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          game.scale.resize(width, height);
        }
      }
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Bridge React state → Phaser scene
  useEffect(() => {
    return usePipelineStore.subscribe((state) => {
      const game = gameRef.current;
      if (!game) return;
      const scene = game.scene.getScene('OfficeScene') as OfficeScene | null;
      if (!scene || !scene.scene.isActive()) return;

      // Adapt stages to Agent objects for the Phaser engine
      const agents: Agent[] = state.stages.map((stage, i) => {
        let status: AgentStatus = 'idle';
        if (stage.status === 'RUNNING') status = 'working';
        else if (stage.status === 'DONE') status = 'done';
        else if (stage.status === 'ERROR') status = 'idle';
        else if (stage.status === 'VETOED') status = 'checkpoint';
        
        return {
          id: String(stage.stage),
          name: STAGE_NAMES[stage.stage] || stage.agentName,
          icon: '',
          status,
          gender: i % 2 === 0 ? 'female' : 'male',
          desk: { col: (i % 4) + 1, row: Math.floor(i / 4) + 1 }, // layout de 4 colunas
        };
      });

      scene.events.emit('stateUpdate', { agents });
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'hidden',
        imageRendering: 'auto',
      }}
    />
  );
}
