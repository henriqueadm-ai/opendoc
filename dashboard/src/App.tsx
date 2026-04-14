import { useTeamSocket } from "@/hooks/useTeamSocket";
import { TeamSelector } from "@/components/TeamSelector";
import { PhaserGame } from "@/office/PhaserGame";
import { StatusBar } from "@/components/StatusBar";
import { IngestionModal } from "@/components/IngestionModal";
import { CheckpointModal } from "@/components/CheckpointModal";
import { useState } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { LayoutShell } from "@/components/layout-shell";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  useTeamSocket();
  const [showIngestion, setShowIngestion] = useState(false);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <LayoutShell>
        <div className="flex flex-col w-full h-full">
          {/* Main Workspace content inherited from older scaffolding */}
          <div className="flex flex-1 overflow-hidden">
            <TeamSelector />
            <PhaserGame />
          </div>
          
          <StatusBar />
        </div>

        {/* Overlays */}
        {showIngestion && <IngestionModal onClose={() => setShowIngestion(false)} />}
        <CheckpointModal />
      </LayoutShell>
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
}
