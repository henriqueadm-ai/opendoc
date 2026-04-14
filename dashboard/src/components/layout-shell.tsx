import React from "react";
import { ThemeToggle } from "./theme-toggle";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center px-4 font-bold border-b border-border">
          OpenDoc
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2 text-sm">
            <li className="p-2 bg-muted rounded-md cursor-pointer font-medium text-foreground">
              Dashboard
            </li>
            <li className="p-2 hover:bg-muted/50 rounded-md cursor-pointer text-muted-foreground transition-colors">
              Processos
            </li>
            <li className="p-2 hover:bg-muted/50 rounded-md cursor-pointer text-muted-foreground transition-colors">
              Base de Conhecimento
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-border mt-auto">
          <div className="text-sm text-muted-foreground">Configurações</div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu placeholder */}
            <div className="lg:hidden font-bold">OpenDoc</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-semibold px-2 py-1 bg-green-500/15 text-green-600 rounded uppercase tracking-wider hidden sm:flex items-center gap-1">
              <span>🛡️</span> Strict Anti-Hallucination
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-muted/20 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
