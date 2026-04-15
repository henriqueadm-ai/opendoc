import { Routes, Route } from "react-router-dom";
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
import { ProtectedRoute } from "@/components/protected-route";

// Pages
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { Setup2FAPage } from "@/pages/setup-2fa";
import { NewPetitionPage } from "@/pages/new-petition";
import { PipelineProgressPage } from "@/pages/pipeline-progress";
import { AdminSettingsPage } from "@/pages/admin-settings";
import { DiscussionPage } from "@/pages/discussion";
import { ConversationsPage } from "@/pages/conversations";
import { DeadlinesPage } from "@/pages/deadlines";
import { FinancialsPage } from "@/pages/financials";
import { AnalyticsPage } from "@/pages/analytics";

function DashboardPage() {
  useTeamSocket();
  const [showIngestion, setShowIngestion] = useState(false);

  return (
    <LayoutShell>
      <div className="flex flex-col w-full h-full">
        <div className="flex flex-1 overflow-hidden">
          <TeamSelector />
          <PhaserGame />
        </div>
        <StatusBar />
      </div>

      {showIngestion && <IngestionModal onClose={() => setShowIngestion(false)} />}
      <CheckpointModal />
    </LayoutShell>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/setup-2fa" element={<Setup2FAPage />} />
        
        {/* Protected routes */}
        <Route path="/nova-peticao" element={
          <ProtectedRoute><LayoutShell><NewPetitionPage /></LayoutShell></ProtectedRoute>
        } />
        <Route path="/pipeline" element={
          <ProtectedRoute><LayoutShell><PipelineProgressPage /></LayoutShell></ProtectedRoute>
        } />
        <Route path="/discussion/:processId" element={
          <ProtectedRoute><LayoutShell><DiscussionPage /></LayoutShell></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><LayoutShell><AdminSettingsPage /></LayoutShell></ProtectedRoute>
        } />
        <Route path="/conversations" element={
          <ProtectedRoute><LayoutShell><ConversationsPage /></LayoutShell></ProtectedRoute>
        } />
        <Route path="/deadlines" element={
          <ProtectedRoute><LayoutShell><DeadlinesPage /></LayoutShell></ProtectedRoute>
        } />
        <Route path="/financials" element={
          <ProtectedRoute><LayoutShell><FinancialsPage /></LayoutShell></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><LayoutShell><AnalyticsPage /></LayoutShell></ProtectedRoute>
        } />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
}
