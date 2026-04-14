import { useTeamSocket } from "@/hooks/useTeamSocket";
import { TeamSelector } from "@/components/TeamSelector";
import { PhaserGame } from "@/office/PhaserGame";
import { StatusBar } from "@/components/StatusBar";
import { IngestionModal } from "@/components/IngestionModal";
import { CheckpointModal } from "@/components/CheckpointModal";
import { useState } from "react";

export function App() {
  useTeamSocket();
  const [showIngestion, setShowIngestion] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: 40,
          minHeight: 40,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-sidebar)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.5,
          justifyContent: "space-between",
        }}
      >
        <div>conectese Dashboard</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 6, 
            background: "rgba(34, 197, 94, 0.15)", 
            color: "rgb(34, 197, 94)", 
            padding: "4px 8px", 
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase"
          }}>
            <span style={{ fontSize: 13 }}>🛡️</span>
            Anti-Hallucination: STRICT
          </div>
          <button 
            onClick={() => setShowIngestion(true)}
            style={{
              padding: "4px 12px",
              background: "var(--accent, #3b82f6)",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>📁</span> Novo Caso
          </button>
        </div>
      </header>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <TeamSelector />
        <PhaserGame />
      </div>

      {/* Footer */}
      <StatusBar />

      {/* Overlays */}
      {showIngestion && <IngestionModal onClose={() => setShowIngestion(false)} />}
      <CheckpointModal />
    </div>
  );
}
