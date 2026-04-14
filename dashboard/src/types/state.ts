// state.json structure — matches Pipeline Runner output
export interface AgentDesk {
  col: number;
  row: number;
}

export type AgentStatus =
  | "idle"
  | "working"
  | "delivering"
  | "done"
  | "checkpoint";

export interface Agent {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  gender?: "male" | "female";
  desk: AgentDesk;
}

export interface Handoff {
  from: string;
  to: string;
  message: string;
  completedAt: string;
  missingData?: string[];
}

export type TeamStatus =
  | "idle"
  | "running"
  | "completed"
  | "checkpoint";

export interface TeamState {
  team: string;
  status: TeamStatus;
  step: {
    current: number;
    total: number;
    label: string;
  };
  agents: Agent[];
  handoff: Handoff | null;
  startedAt: string | null;
  updatedAt: string;
}

// Team metadata from team.yaml
export interface TeamInfo {
  code: string;
  name: string;
  description: string;
  icon: string;
  agents: string[]; // agent file paths
}

// WebSocket messages
export type WsMessage =
  | { type: "SNAPSHOT"; teams: TeamInfo[]; activeStates: Record<string, TeamState> }
  | { type: "TEAM_UPDATE"; team: string; state: TeamState }
  | { type: "TEAM_INACTIVE"; team: string };
