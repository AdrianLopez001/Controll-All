import React, { useState } from "react";
import { 
  ClipboardList, Shield, Search, Users, Settings, 
  Check, Lock, ToggleLeft, ShieldAlert, UserPlus, Trash2,
  Phone, Mail, CreditCard, Key, AlertCircle, X
} from "lucide-react";
import type { AuditoriaLog } from "../types";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  telefone?: string;
  role: string;
  status: "ativo" | "inativo";
  isCurrentUser?: boolean;
}

interface AuditoriaProps {
  logs: AuditoriaLog[];
  rolePermissions?: Record<string, string[]>;
  setRolePermissions?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  userRole?: string;
  setUserRole?: React.Dispatch<React.SetStateAction<"admin" | "comercial" | "estoque" | "operador">>;
}

export default function Auditoria({ 
  logs, 
  rolePermissions = {}, 
  setRolePermissions = () => {}, 
  userRole = "admin", 
  setUserRole = () => {}
}: AuditoriaProps) {
  const [activeSubTab, setActiveSubTab] = useState<"logs" | "permissions">("logs");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // System Users state list
  const [usersList, setUsersList] = useState<SystemUser[]>([
    { id: "u-1", name: "Adrian (Você)", email: "adrian@jceventosrn.com.br", cpf: "123.456.789-00", telefone: "(84) 99888-1122", role: userRole, status: "ativo", isCurrentUser: true },
    { id: "u-2", name: "Jailson Correia", email: "jailson@jceventosrn.com.br", cpf: "234.567.890-11", telefone: "(84) 99777-2233", role: "operador", status: "ativo", isCurrentUser: false },
    { id: "u-3", name: "Ricardo Mendes Alves", email: "ricardo@jceventosrn.com.br", cpf: "345.678.901-22", telefone: "(84) 99666-3344", role: "comercial", status: "ativo", isCurrentUser: false },
    { id: "u-4", name: "José Alves de Oliveira", email: "jose@jceventosrn.com.br", cpf: "456.789.012-33", telefone: "(84) 99555-4455", role: "operador", status: "ativo", isCurrentUser: false },
    { id: "u-5", name: "Almoxarife Principal", email: "estoque@jceventosrn.com.br", cpf: "567.890.123-44", telefone: "(84) 99444-5566", role: "estoque", status: "ativo", isCurrentUser: false }
  ]);

  // Modal State for Adding New User
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserCpf, setNewUserCpf] = useState("");
  const [newUserTelefone, setNewUserTelefone] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "comercial" | "estoque" | "operador">("operador");
  const [newUserPassword, setNewUserPassword] = useState("");

  // Auto-format CPF input helper (000.000.000-00)
  const handleCpfChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    setNewUserCpf(formatted);
  };

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3000);
  };

  // Re-synchronize current user role if changed externally (e.g. from top nav dropdown)
  React.useEffect(() => {
    setUsersList(prev => prev.map(u => u.isCurrentUser ? { ...u, role: userRole } : u));
  }, [userRole]);

  // Cadastrar novo usuário do sistema
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserCpf.trim()) {
      alert("Por favor, preencha o Nome Completo, E-mail e CPF do usuário.");
      return;
    }

    const newUser: SystemUser = {
      id: `u-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      cpf: newUserCpf.trim(),
      telefone: newUserTelefone.trim() || "(84) 99000-0000",
      role: newUserRole,
      status: "ativo",
      isCurrentUser: false
    };

    setUsersList(prev => [...prev, newUser]);
    setIsAddUserModalOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserCpf("");
    setNewUserTelefone("");
    setNewUserPassword("");
    triggerFeedback(`Novo usuário "${newUser.name}" cadastrado com sucesso!`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "ativo" ? "inativo" : "ativo";
        triggerFeedback(`Status do usuário "${u.name}" alterado para ${nextStatus.toUpperCase()}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDeleteUser = (userId: string) => {
    const user = usersList.find(u => u.id === userId);
    if (!user) return;
    if (user.isCurrentUser) {
      alert("Não é possível excluir o usuário administrador atualmente ativo.");
      return;
    }
    if (confirm(`Tem certeza que deseja remover o acesso do usuário "${user.name}"?`)) {
      setUsersList(prev => prev.filter(u => u.id !== userId));
      triggerFeedback(`Usuário "${user.name}" removido do sistema.`);
    }
  };

  // Delegar cargo de usuário
  const handleUserRoleChange = (userId: string, newRole: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        // Se for o usuário ativo (Adrian), propaga para o estado global do App
        if (u.isCurrentUser) {
          setUserRole(newRole as any);
        }
        return { ...u, role: newRole };
      }
      return u;
    }));
    
    const user = usersList.find(u => u.id === userId);
    triggerFeedback(`Nível de acesso de "${user?.name}" alterado para ${newRole.toUpperCase()}`);
  };

  // Matriz de permissões: Alternar acesso do módulo para o cargo
  const handleTogglePermission = (roleKey: string, moduleKey: string) => {
    if (roleKey === "admin") return; // Admin sempre possui acesso irrestrito

    setRolePermissions(prev => {
      const allowed = prev[roleKey] || [];
      const updatedAllowed = allowed.includes(moduleKey)
        ? allowed.filter(m => m !== moduleKey)
        : [...allowed, moduleKey];

      return {
        ...prev,
        [roleKey]: updatedAllowed
      };
    });

    triggerFeedback(`Permissão do módulo "${moduleKey.toUpperCase()}" alterada para o grupo ${roleKey.toUpperCase()}`);
  };

  // Filtrar logs de auditoria
  const filteredLogs = logs.filter(log => 
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.modulo && log.modulo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Módulos disponíveis no sistema para configuração de permissões
  const availableModules = [
    { key: "crm", name: "CRM", desc: "Pipeline e leads comerciais" },
    { key: "orcamentos", name: "Orçamentos", desc: "Propostas e custos de estandes" },
    { key: "os", name: "Ordens (OS)", desc: "Ordens de serviço e checklists técnicos" },
    { key: "kanban", name: "Montagem", desc: "Projetos e quadro Kanban" },
    { key: "warehouse", name: "Estoque", desc: "Almoxarifado e controle WMS" },
    { key: "financial", name: "Financeiro", desc: "Custos, notas e receitas" },
    { key: "employees", name: "Equipe", desc: "Recursos Humanos e fichas de escala" },
    { key: "logistics", name: "Logística", desc: "Frotas e viagens" },
    { key: "tarefas", name: "Tarefas", desc: "Checklist de tarefas operacionais" },
    { key: "notifications", name: "Notificações", desc: "Central de alertas" }
  ];

  return (
    <div className="auditoria-container" style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* ── Sub-Tabs Menu and Feedback ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px", flexWrap: "wrap", gap: "16px" }}>
        
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveSubTab("logs")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              fontSize: "12.5px",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeSubTab === "logs" ? "var(--accent)" : "var(--bg-card)",
              color: activeSubTab === "logs" ? "#ffffff" : "var(--text-secondary)",
              transition: "var(--transition)"
            }}
          >
            Logs de Auditoria
          </button>
          
          <button
            onClick={() => setActiveSubTab("permissions")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              fontSize: "12.5px",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeSubTab === "permissions" ? "var(--accent)" : "var(--bg-card)",
              color: activeSubTab === "permissions" ? "#ffffff" : "var(--text-secondary)",
              transition: "var(--transition)"
            }}
          >
            Delegação de Acesso
          </button>
        </div>

        {/* Feedback message banner */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {feedbackMsg && (
            <span style={{ 
              fontSize: "12px", 
              fontWeight: "600", 
              color: "var(--success-text)", 
              backgroundColor: "var(--success)", 
              padding: "6px 12px", 
              borderRadius: "8px", 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px" 
            }}>
              <Check size={14} />
              {feedbackMsg}
            </span>
          )}

          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Shield size={14} style={{ color: "var(--accent-secondary)" }} />
            Segurança RBAC Ativa (Logado como: {userRole.toUpperCase()})
          </span>
        </div>

      </div>

      {/* ── Sub-Tab 1: ORIGINAL Audit Logs (Kept Unchanged) ── */}
      {activeSubTab === "logs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
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
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </div>
            
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Shield size={14} style={{ color: "var(--accent-secondary)" }} />
              Trilha de Auditoria RBAC Ativa
            </span>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <table className="table-responsive-cards" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Data / Hora</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Usuário</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Módulo</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Ação</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Detalhes</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px", fontFamily: "monospace" }}>Endereço IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Nenhum log de auditoria encontrado.</td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td data-label="Data / Hora" style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "12px" }}>{log.date} {log.hora}</td>
                      <td data-label="Usuário" style={{ padding: "14px 20px", fontWeight: "600", color: "var(--text-primary)" }}>{log.usuario}</td>
                      <td data-label="Módulo" style={{ padding: "14px 20px", fontWeight: "700", color: "var(--accent)", fontSize: "12px" }}>{log.modulo || "Sistema"}</td>
                      <td data-label="Ação" style={{ padding: "14px 20px" }}>
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
                      <td data-label="Detalhes" style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>{log.detalhes}</td>
                      <td data-label="Endereço IP" style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: "12px", color: "var(--text-muted)" }}>{log.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ── Sub-Tab 2: Access Levels & Module Permissions (RBAC Config) ── */}
      {activeSubTab === "permissions" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          
          {/* Left Column: User Access Delegation (Cargos) & Add User */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="section-box" style={{ height: "auto", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                <div>
                  <h3 className="section-box-title" style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <Users size={16} style={{ color: "var(--accent)" }} />
                    Gestão e Delegação de Acesso dos Usuários
                  </h3>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                    Cadastre novos usuários com CPF e atribua cargos com níveis de acesso RBAC.
                  </p>
                </div>

                <button 
                  className="btn-primary text-xs" 
                  onClick={() => setIsAddUserModalOpen(true)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontWeight: "700" }}
                >
                  <UserPlus size={14} /> + Novo Usuário
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {usersList.map(user => (
                  <div 
                    key={user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      backgroundColor: "var(--bg-main)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      gap: "12px",
                      flexWrap: "wrap"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "200px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px" }}>
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{user.name}</strong>
                          <span 
                            onClick={() => handleToggleUserStatus(user.id)}
                            style={{ 
                              fontSize: "9px", 
                              fontWeight: "800", 
                              padding: "2px 6px", 
                              borderRadius: "8px", 
                              cursor: "pointer",
                              backgroundColor: user.status === "ativo" ? "#d1fae5" : "#fee2e2",
                              color: user.status === "ativo" ? "#065f46" : "#991b1b"
                            }}
                            title="Clique para alternar status"
                          >
                            {user.status === "ativo" ? "● ATIVO" : "○ INATIVO"}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          <span>✉️ {user.email}</span>
                          <span>🪪 CPF: <strong style={{ color: "var(--text-primary)" }}>{user.cpf}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "1px solid var(--border)",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: "var(--bg-card)",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          outline: "none"
                        }}
                      >
                        <option value="admin">Administrador Geral</option>
                        <option value="comercial">Comercial / Vendas</option>
                        <option value="estoque">Almoxarifado / Estoque</option>
                        <option value="operador">Operacional (OS/Montagem)</option>
                      </select>

                      {!user.isCurrentUser && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            backgroundColor: "rgba(220, 38, 38, 0.1)",
                            border: "1px solid rgba(220, 38, 38, 0.3)",
                            color: "#dc2626",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: "700"
                          }}
                          title="Remover Acesso do Usuário"
                        >
                          <Trash2 size={13} /> Excluir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Right Column: Group Module Access Permissions Matrix */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="section-box" style={{ height: "auto", padding: "20px" }}>
              
              <h3 className="section-box-title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Lock size={16} style={{ color: "var(--accent)" }} />
                Matriz de Permissões de Grupos
              </h3>
              
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Gerencie quais módulos do ERP cada grupo de acesso tem permissão de visualizar na barra superior.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* 1. Comercial Role Permissions */}
                <div style={{ backgroundColor: "var(--bg-main)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--accent-text)", textTransform: "uppercase" }}>Grupo Comercial</span>
                  <strong style={{ display: "block", fontSize: "13px", color: "var(--text-primary)", marginTop: "2px", marginBottom: "10px" }}>Comercial / Vendas</strong>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {availableModules.map(module => {
                      const isAllowed = (rolePermissions.comercial || []).includes(module.key);
                      return (
                        <label 
                          key={module.key}
                          title={module.desc}
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px",
                            backgroundColor: "var(--bg-card)",
                            border: `1px solid ${isAllowed ? "var(--accent)" : "var(--border)"}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: isAllowed ? "var(--text-primary)" : "var(--text-muted)"
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={isAllowed}
                            onChange={() => handleTogglePermission("comercial", module.key)}
                            style={{ cursor: "pointer", width: "12px", height: "12px" }}
                          />
                          {module.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Almoxarifado/Estoque Role Permissions */}
                <div style={{ backgroundColor: "var(--bg-main)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--warning-text)", textTransform: "uppercase" }}>Grupo Almoxarifado</span>
                  <strong style={{ display: "block", fontSize: "13px", color: "var(--text-primary)", marginTop: "2px", marginBottom: "10px" }}>Almoxarifado / Estoque</strong>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {availableModules.map(module => {
                      const isAllowed = (rolePermissions.estoque || []).includes(module.key);
                      return (
                        <label 
                          key={module.key}
                          title={module.desc}
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px",
                            backgroundColor: "var(--bg-card)",
                            border: `1px solid ${isAllowed ? "var(--accent)" : "var(--border)"}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: isAllowed ? "var(--text-primary)" : "var(--text-muted)"
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={isAllowed}
                            onChange={() => handleTogglePermission("estoque", module.key)}
                            style={{ cursor: "pointer", width: "12px", height: "12px" }}
                          />
                          {module.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Operador Role Permissions */}
                <div style={{ backgroundColor: "var(--bg-main)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--success-text)", textTransform: "uppercase" }}>Grupo Operações</span>
                  <strong style={{ display: "block", fontSize: "13px", color: "var(--text-primary)", marginTop: "2px", marginBottom: "10px" }}>Operador (OS / Montagem)</strong>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {availableModules.map(module => {
                      const isAllowed = (rolePermissions.operador || []).includes(module.key);
                      return (
                        <label 
                          key={module.key}
                          title={module.desc}
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px",
                            backgroundColor: "var(--bg-card)",
                            border: `1px solid ${isAllowed ? "var(--accent)" : "var(--border)"}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: isAllowed ? "var(--text-primary)" : "var(--text-muted)"
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={isAllowed}
                            onChange={() => handleTogglePermission("operador", module.key)}
                            style={{ cursor: "pointer", width: "12px", height: "12px" }}
                          />
                          {module.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Info Note about Admin */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "6px 8px", backgroundColor: "var(--warning)", color: "var(--warning-text)", borderRadius: "8px", fontSize: "10.5px" }}>
                  <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>
                    <strong>Administrador Geral (ADMIN)</strong> sempre possui acesso total aos módulos ativos por questões de segurança do sistema.
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

      {/* MODAL: CADASTRAR NOVO USUÁRIO DO SISTEMA */}
      {isAddUserModalOpen && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: "rgba(0, 0, 0, 0.6)", 
            zIndex: 1000, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            backdropFilter: "blur(4px)" 
          }} 
          onClick={() => setIsAddUserModalOpen(false)}
        >
          <div 
            style={{ 
              backgroundColor: "var(--bg-card)", 
              border: "1px solid var(--border)", 
              borderRadius: "16px", 
              padding: "24px", 
              width: "90%", 
              maxWidth: "520px", 
              maxHeight: "90vh", 
              overflowY: "auto", 
              color: "var(--text-primary)", 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)" 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--accent)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <UserPlus size={18} /> Cadastrar Novo Usuário do Sistema
              </h3>
              <button onClick={() => setIsAddUserModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Nome Completo *</label>
                <input 
                  type="text" 
                  value={newUserName} 
                  onChange={(e) => setNewUserName(e.target.value)} 
                  placeholder="Ex: Roberto Carlos da Silva" 
                  required 
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>CPF *</label>
                  <input 
                    type="text" 
                    value={newUserCpf} 
                    onChange={(e) => handleCpfChange(e.target.value)} 
                    placeholder="000.000.000-00" 
                    required 
                    maxLength={14}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} 
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    value={newUserTelefone} 
                    onChange={(e) => setNewUserTelefone(e.target.value)} 
                    placeholder="(84) 99999-8888" 
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>E-mail Institucional *</label>
                <input 
                  type="email" 
                  value={newUserEmail} 
                  onChange={(e) => setNewUserEmail(e.target.value)} 
                  placeholder="roberto@jceventosrn.com.br" 
                  required 
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Nível de Acesso (Cargo) *</label>
                  <select 
                    value={newUserRole} 
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
                  >
                    <option value="admin">Administrador Geral</option>
                    <option value="comercial">Comercial / Vendas</option>
                    <option value="estoque">Almoxarifado / Estoque</option>
                    <option value="operador">Operacional (OS/Montagem)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Senha Inicial *</label>
                  <input 
                    type="password" 
                    value={newUserPassword} 
                    onChange={(e) => setNewUserPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} 
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddUserModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ padding: "8px 20px" }}>
                  Salvar e Conceder Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
