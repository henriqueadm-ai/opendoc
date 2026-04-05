import { useState, useRef } from "react";

interface IngestionModalProps {
  onClose: () => void;
}

export function IngestionModal({ onClose }: IngestionModalProps) {
  const [caseId, setCaseId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setStatus("idle");

    const formData = new FormData();
    // Use the provided case ID, or generate one if empty
    const finalCaseId = caseId.trim() || `CASE_${Date.now()}`;
    formData.append("caseId", finalCaseId);
    
    files.forEach((file) => {
      formData.append("file", file);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("success");
        setFiles([]);
        setCaseId("");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Upload failed", err);
      setStatus("error");
    } finally {
      setUploading(false);
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
        width: 500,
        maxWidth: "90%",
        padding: 24,
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        border: "1px solid var(--border, #333)",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Novo Caso (Ingestão)</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "inherit", 
              cursor: "pointer",
              fontSize: 18
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #999)" }}>
          Faça o upload dos arquivos iniciais para abrir um novo caso e criar a pasta segura no PROCESSOS.
        </p>

        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: "bold" }}>
            ID do Caso (Opcional)
          </label>
          <input 
            type="text" 
            placeholder="Ex: 05_04_2026_0001 (Automático se vazio)"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
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

        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "var(--accent, #3b82f6)" : "var(--border, #444)"}`,
            borderRadius: 8,
            padding: 32,
            textAlign: "center",
            backgroundColor: isDragging ? "rgba(59, 130, 246, 0.1)" : "transparent",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            style={{ display: "none" }} 
          />
          <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {isDragging ? "Solte os arquivos aqui..." : "Arraste e solte arquivos aqui"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted, #888)", marginTop: 4 }}>
            Ou clique para selecionar (PDFs, Docs, Imagens)
          </div>
        </div>

        {files.length > 0 && (
          <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid var(--border, #333)", borderRadius: 4 }}>
            {files.map((f, i) => (
              <div key={i} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: "6px 10px",
                borderBottom: i < files.length - 1 ? "1px solid var(--border, #333)" : "none",
                fontSize: 12,
                alignItems: "center"
              }}>
                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                  {f.name}
                </span>
                <span style={{ color: "var(--text-muted, #888)", fontSize: 10, marginRight: 8, minWidth: 50, textAlign: "right" }}>
                  {(f.size / 1024).toFixed(1)} KB
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {status === "success" && (
          <div style={{ color: "#22c55e", fontSize: 13, background: "rgba(34,197,94,0.1)", padding: 8, borderRadius: 4, textAlign: "center" }}>
            Arquivos salvos com sucesso na área segura (PROCESSOS/)!
          </div>
        )}

        {status === "error" && (
          <div style={{ color: "#ef4444", fontSize: 13, background: "rgba(239,68,68,0.1)", padding: 8, borderRadius: 4, textAlign: "center" }}>
            Erro ao fazer o upload dos arquivos. Verifique o servidor.
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <button 
            onClick={onClose}
            disabled={uploading}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid var(--border, #444)",
              color: "inherit",
              borderRadius: 4,
              cursor: uploading ? "not-allowed" : "pointer"
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            style={{
              padding: "8px 16px",
              background: "var(--accent, #3b82f6)",
              border: "none",
              color: "white",
              borderRadius: 4,
              cursor: files.length === 0 || uploading ? "not-allowed" : "pointer",
              opacity: files.length === 0 || uploading ? 0.6 : 1,
              fontWeight: 500
            }}
          >
            {uploading ? "Salvando..." : "Ingerir Arquivos"}
          </button>
        </div>
      </div>
    </div>
  );
}
