import React from "react";
import { ClipboardList, Shield, Search } from "lucide-react";
import type { AuditoriaLog } from "../types";

interface AuditoriaProps {
  logs: AuditoriaLog[];
}

export default function Auditoria({ logs }: AuditoriaProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredLogs = logs.filter(log => 
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detalhes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="auditoria-container" style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Filters & Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative", flexGrow: 1, maxWidth: "400px" }}>
          <Search size={16} className="text-muted" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Filtrar por usuário, ação ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontFamily: "var(--font)",
              fontSize: "13px",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)"
            }}
          />
        </div>
        
        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <Shield size={14} style={{ color: "var(--accent-secondary)" }} />
          Trilha de Auditoria RBAC Ativa
        </span>
      </div>

      {/* Listing Table */}
      <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
              <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Data / Hora</th>
              <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Usuário</th>
              <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Ação</th>
              <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Detalhes</th>
              <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px", fontFamily: "monospace" }}>Endereço IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Nenhum log de auditoria encontrado.</td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "12px" }}>{log.date} {log.hora}</td>
                  <td style={{ padding: "14px 20px", fontWeight: "600", color: "var(--text-primary)" }}>{log.usuario}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span 
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: 
                          log.acao.includes("exclusao") || log.acao.includes("Remoção") ? "var(--danger-glow)" : 
                          log.acao.includes("Criação") || log.acao.includes("Adição") ? "var(--success-glow)" : "var(--accent-glow)",
                        color: 
                          log.acao.includes("exclusao") || log.acao.includes("Remoção") ? "var(--danger)" : 
                          log.acao.includes("Criação") || log.acao.includes("Adição") ? "var(--success-text)" : "var(--accent)"
                      }}
                    >
                      {log.acao}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>{log.detalhes}</td>
                  <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: "12px", color: "var(--text-muted)" }}>{log.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
