import { useState, useEffect } from "react";
import { useTeamStore } from "@/store/useTeamStore";

export function CheckpointModal() {
  const selectedTeam = useTeamStore((s) => s.selectedTeam);
  const state = useTeamStore((s) =>
    s.selectedTeam ? s.activeStates.get(s.selectedTeam) : undefined
  );
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isActive = state?.status === "checkpoint" && state.handoff?.missingData && state.handoff.missingData.length > 0;
  const missingFields = state?.handoff?.missingData || [];

  // Reset form when checkpoint fields change
  useEffect(() => {
    if (isActive) {
      const initial: Record<string, string> = {};
      missingFields.forEach(f => initial[f] = "");
      setFormData(initial);
      setError("");
    }
  }, [isActive, missingFields.join(",")]);

  if (!isActive) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    // Build payload ensuring numbers where appropriate
    const payload: Record<string, string | number> = {};
    for (const [key, val] of Object.entries(formData)) {
      if (val.trim() === "") continue; // or might throw an error
      const num = Number(val);
      payload[key] = isNaN(num) ? val : num;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/team/${selectedTeam}/checkpoint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit checkpoint data");
      }
      
      // Successfully submitted.
      // The watcher plugin will reset the team status to "running"
      // avoiding the need to manually close the modal.
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao submeter dados financeiros.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      backdropFilter: "blur(2px)"
    }}>
      <div style={{
        backgroundColor: "var(--bg-main, #1e1e1e)",
        borderRadius: 8,
        width: 400,
        maxWidth: "90%",
        padding: 24,
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        border: "1px solid var(--border, #333)",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, color: "var(--accent, #3b82f6)" }}>Atenção Necessária</h2>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #ccc)" }}>
          O agente encontrou dados faltantes (Halt & Catch protocol). 
          Por favor, preencha os valores abaixo para que o cálculo possa continuar com segurança.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missingFields.map((field) => (
            <div key={field}>
              <label style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: "bold" }}>
                {field}
              </label>
              <input 
                type="text" 
                required
                value={formData[field] || ""}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 4,
                  border: "1px solid var(--border, #444)",
                  background: "var(--bg-sidebar, #121212)",
                  color: "inherit",
                  boxSizing: "border-box"
                }}
              />
            </div>
          ))}

          {error && (
            <div style={{ color: "#ef4444", fontSize: 13, background: "rgba(239,68,68,0.1)", padding: 8, borderRadius: 4, textAlign: "center" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button 
              type="submit"
              disabled={submitting}
              style={{
                padding: "8px 16px",
                background: "var(--accent, #3b82f6)",
                border: "none",
                color: "white",
                borderRadius: 4,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
                fontWeight: 500
              }}
            >
              {submitting ? "Enviando..." : "Enviar e Prosseguir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
