import { useTeamStore } from "@/store/useTeamStore";
import { TeamCard } from "./TeamCard";

export function TeamSelector() {
  const teams = useTeamStore((s) => s.teams);
  const activeStates = useTeamStore((s) => s.activeStates);
  const selectedTeam = useTeamStore((s) => s.selectedTeam);
  const selectTeam = useTeamStore((s) => s.selectTeam);

  // Sort: active teams first, then alphabetical
  const teamList = Array.from(teams.values()).sort((a, b) => {
    const aActive = activeStates.has(a.code) ? 0 : 1;
    const bActive = activeStates.has(b.code) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.name.localeCompare(b.name);
  });

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100%",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 12px 8px",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "var(--text-secondary)",
        }}
      >
        Squads
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {teamList.length === 0 && (
          <div style={{ padding: "16px 12px", color: "var(--text-secondary)", fontSize: 12 }}>
            No teams found
          </div>
        )}
        {teamList.map((team) => (
          <TeamCard
            key={team.code}
            team={team}
            state={activeStates.get(team.code)}
            isSelected={selectedTeam === team.code}
            onSelect={() => selectTeam(team.code)}
          />
        ))}
      </div>
    </aside>
  );
}
