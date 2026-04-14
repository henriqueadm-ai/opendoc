import { create } from "zustand";
import type { TeamInfo, TeamState } from "@/types/state";

interface TeamStore {
  // State
  teams: Map<string, TeamInfo>;
  activeStates: Map<string, TeamState>;
  selectedTeam: string | null;
  isConnected: boolean;

  // Actions
  selectTeam: (name: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSnapshot: (teams: TeamInfo[], activeStates: Record<string, TeamState>) => void;
  setTeamActive: (team: string, state: TeamState) => void;
  updateTeamState: (team: string, state: TeamState) => void;
  setTeamInactive: (team: string) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: new Map(),
  activeStates: new Map(),
  selectedTeam: null,
  isConnected: false,

  selectTeam: (name) => set({ selectedTeam: name }),

  setConnected: (connected) => set({ isConnected: connected }),

  setSnapshot: (teams, activeStates) =>
    set({
      teams: new Map(teams.map((s) => [s.code, s])),
      activeStates: new Map(Object.entries(activeStates)),
    }),

  setTeamActive: (team, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(team, state),
    })),

  updateTeamState: (team, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(team, state),
    })),

  setTeamInactive: (team) =>
    set((prev) => {
      const next = new Map(prev.activeStates);
      next.delete(team);
      return {
        activeStates: next,
        // Reset selection if the inactive team was selected
        selectedTeam: prev.selectedTeam === team ? null : prev.selectedTeam,
      };
    }),
}));
