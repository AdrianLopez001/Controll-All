import { useState, useEffect, type FormEvent } from "react";
import { 
  Plus, Users, Shield, ShieldAlert, CheckCircle, AlertTriangle, UserCheck, 
  X, FileText, Upload, Calendar, DollarSign, Key, Trash2, Trophy, Crown, Medal, Award, Star, Zap, Target
} from "lucide-react";
import type { Employee } from "../types";

interface EmployeesProps {
  employees: Employee[];
  onAddEmployee: (name: string, role: string, hasSafetyCert: boolean) => void;
  onToggleDocStatus: (id: string) => void;
  onToggleSafetyCert: (id: string) => void;
  onUpdateEmployee: (updated: Employee) => void;
  onDeleteEmployee?: (id: string) => void;
  initialSubTab?: "cadastro" | "produtividade";
}

export default function Employees({
  employees,
  onAddEmployee,
  onToggleDocStatus,
  onToggleSafetyCert,
  onUpdateEmployee,
  onDeleteEmployee,
  initialSubTab
}: EmployeesProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [hasSafetyCert, setHasSafetyCert] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [deletingEmpId, setDeletingEmpId] = useState<string | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<"cadastro" | "produtividade">(initialSubTab || "cadastro");
  const [rhMetricModel, setRhMetricModel] = useState<"diaria" | "hora">("diaria");
  const [evalDiarias, setEvalDiarias] = useState(1);
  const [evalValorDiaria, setEvalValorDiaria] = useState(250);

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // Productivity rating form states
  const [selectedEvalEmpId, setSelectedEvalEmpId] = useState(employees[0]?.id || "");
  const [evalHoras, setEvalHoras] = useState(8);
  const [evalPontual, setEvalPontual] = useState(100);
  const [evalNota, setEvalNota] = useState(5);
  const [evalTasks, setEvalTasks] = useState(2);

  const handleAddProductivity = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(x => x.id === selectedEvalEmpId);
    if (!emp) return;

    const currentProd = emp.productivity || {
      horasTrabalhadas: 0,
      eventosAtendidos: 0,
      pontualidade: 100,
      tarefasConcluidas: 0,
      notaMedia: 5
    };

    const newEventos = currentProd.eventosAtendidos + 1;
    const newHoras = currentProd.horasTrabalhadas + evalHoras;
    const newPontual = Math.round(((currentProd.pontualidade * currentProd.eventosAtendidos) + evalPontual) / newEventos);
    const newNota = parseFloat((((currentProd.notaMedia * currentProd.eventosAtendidos) + evalNota) / newEventos).toFixed(1));
    const newTasks = currentProd.tarefasConcluidas + evalTasks;

    const updated: Employee = {
      ...emp,
      productivity: {
        horasTrabalhadas: newHoras,
        eventosAtendidos: newEventos,
        pontualidade: newPontual,
        tarefasConcluidas: newTasks,
        notaMedia: newNota
      }
    };

    onUpdateEmployee(updated);
    alert(`Métricas de produtividade atualizadas para ${emp.name}!`);
  };

  // Edit employee local states
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCpf, setEditCpf] = useState("");
  const [editRg, setEditRg] = useState("");
  const [editCnh, setEditCnh] = useState("");
  const [editPix, setEditPix] = useState("");
  const [editSalario, setEditSalario] = useState(0);
  const [editNr10, setEditNr10] = useState("");
  const [editNr35, setEditNr35] = useState("");
  const [editTipoContrato, setEditTipoContrato] = useState<Employee["tipoContrato"]>("CLT");

  const handleOpenDetails = (emp: Employee) => {
    setSelectedEmp(emp);
    setEditName(emp.name);
    setEditRole(emp.role);
    setEditCpf(emp.cpf || "");
    setEditRg(emp.rg || "");
    setEditCnh(emp.cnh || "");
    setEditPix(emp.pixKey || "");
    setEditSalario(emp.salario || 0);
    setEditNr10(emp.nr10Vencimento || "");
    setEditNr35(emp.nr35Vencimento || "");
    setEditTipoContrato(emp.tipoContrato || "CLT");
  };

  const handleSaveChanges = () => {
    if (!selectedEmp) return;
    const updated: Employee = {
      ...selectedEmp,
      name: editName || selectedEmp.name,
      role: editRole || selectedEmp.role,
      cpf: editCpf,
      rg: editRg,
      cnh: editCnh,
      pixKey: editPix,
      salario: editSalario,
      nr10Vencimento: editNr10,
      nr35Vencimento: editNr35,
      tipoContrato: editTipoContrato,
      hasSafetyCert: editNr35 !== "" // sync standard cert boolean
    };
    onUpdateEmployee(updated);
    setSelectedEmp(updated);
    alert("Dados do colaborador atualizados com sucesso!");
  };

  const handleConfirmDeleteEmp = () => {
    if (!deletingEmpId) return;
    if (onDeleteEmployee) {
      onDeleteEmployee(deletingEmpId);
      setDeletingEmpId(null);
      setSelectedEmp(null);
      alert("Colaborador excluído definitivamente do sistema.");
    }
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEmp || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const newAnexo = {
      id: `anx-${Date.now()}`,
      name: file.name,
      date: new Date().toISOString().split("T")[0]
    };

    const updated: Employee = {
      ...selectedEmp,
      anexos: [...(selectedEmp.anexos || []), newAnexo]
    };

    onUpdateEmployee(updated);
    setSelectedEmp(updated);
  };

  const handleDeleteAnexo = (anexoId: string) => {
    if (!selectedEmp) return;
    const updated: Employee = {
      ...selectedEmp,
      anexos: (selectedEmp.anexos || []).filter(a => a.id !== anexoId)
    };
    onUpdateEmployee(updated);
    setSelectedEmp(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    onAddEmployee(name, role, hasSafetyCert);
    
    setName("");
    setRole("");
    setHasSafetyCert(false);
    
    setSuccessMsg("Colaborador cadastrado com sucesso!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Sub tabs */}
      <div className="sub-header-tabs" style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
        <button 
          className={`tab-btn-link ${activeSubTab === "cadastro" ? "active" : ""}`}
          onClick={() => setActiveSubTab("cadastro")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "cadastro" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "cadastro" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "cadastro" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Fichas de Cadastro &amp; ASO
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "produtividade" ? "active" : ""}`}
          onClick={() => setActiveSubTab("produtividade")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "produtividade" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "produtividade" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "produtividade" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Produtividade &amp; Ranking Interno
        </button>
      </div>

      {activeSubTab === "cadastro" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", padding: "10px" }}>
      {/* Left Column: Staff Directory List */}
      <div className="section-box" style={{ height: "auto" }}>
        <div className="section-box-header">
          <h3 className="section-box-title">
            <Users size={16} style={{ color: "var(--accent)" }} />
            Diretório de Colaboradores e Montadores
          </h3>
          <span className="kanban-column-count">{employees.length} cadastrados</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {employees.map((emp) => (
            <div 
              key={emp.id} 
              className="staff-row" 
              onClick={() => handleOpenDetails(emp)}
              style={{ cursor: "pointer", transition: "var(--transition)" }}
            >
              <div className="staff-row-info">
                <div className="staff-row-avatar">
                  {emp.foto || emp.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <strong className="text-sm" style={{ display: "block" }}>{emp.name}</strong>
                    <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "10px", backgroundColor: "#e2e8f0", color: "#334155" }}>
                      {emp.tipoContrato || "CLT"}
                    </span>
                  </div>
                  <span className="text-xs text-muted">{emp.role}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "24px" }} onClick={(e) => e.stopPropagation()}>
                {/* Safety Certificate NR-35/NR-18 Toggle */}
                <div 
                  onClick={() => onToggleSafetyCert(emp.id)} 
                  className="pointer"
                  title="Clique para alterar certificação"
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
                >
                  {emp.hasSafetyCert ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--success-text)" }}>
                      <Shield size={14} />
                      <span className="semibold">NR-35 Ativa</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--danger-text)" }}>
                      <ShieldAlert size={14} />
                      <span className="semibold">Sem Certificação</span>
                    </div>
                  )}
                </div>

                {/* Personal Documents Status Toggle */}
                <div 
                  onClick={() => onToggleDocStatus(emp.id)}
                  className="pointer"
                  title="Clique para alterar status de documentos"
                  style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span className="status-dot" style={{ background: emp.documentStatus === "complete" ? "var(--success-text)" : "var(--warning-text)" }}></span>
                  <span className="text-muted">Docs: </span>
                  <strong style={{ color: emp.documentStatus === "complete" ? "var(--success-text)" : "var(--warning-text)" }}>
                    {emp.documentStatus === "complete" ? "Completos" : "Pendentes"}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Register New Worker Form */}
      <div className="section-box" style={{ height: "fit-content" }}>
        <div className="section-box-header">
          <h3 className="section-box-title">
            <UserCheck size={16} style={{ color: "var(--accent)" }} />
            Cadastrar Novo Colaborador
          </h3>
        </div>

        {successMsg && (
          <div style={{ padding: "10px", borderRadius: "8px", background: "var(--success-glow)", border: "1px solid var(--success)", color: "var(--success-text)", fontSize: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle size={14} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nome Completo</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ex: João Silva de Souza" 
              required
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <div className="field">
            <label>Função / Cargo</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              required
              style={{ color: "var(--text-primary)" }}
            >
              <option value="">Selecione a função...</option>
              <option value="Montador de Estande">Montador de Estande</option>
              <option value="Eletricista Operacional">Eletricista Operacional</option>
              <option value="Carpinteiro Montador">Carpinteiro Montador</option>
              <option value="Coordenador de Estande">Coordenador de Estande</option>
              <option value="Auxiliar Técnico">Auxiliar Técnico</option>
            </select>
          </div>
          
          <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginTop: "12px" }}>
            <div 
              onClick={() => setHasSafetyCert(!hasSafetyCert)}
              className="pointer" 
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <div className={`checkbox ${hasSafetyCert ? "checked" : ""}`}>
                {hasSafetyCert && "✓"}
              </div>
              <span className="semibold text-xs" style={{ color: "var(--text-secondary)" }}>
                Possui Treinamento Ativo de NR-35?
              </span>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-20" style={{ justifyContent: "center" }}>
            <Plus size={16} /> Cadastrar Colaborador
          </button>
        </form>

        <div style={{ padding: "12px", border: "1px solid var(--border)", borderRadius: "10px", background: "rgba(255, 255, 255, 0.01)", marginTop: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--warning-text)", marginBottom: "4px" }}>
            <AlertTriangle size={14} />
            <strong className="text-xs uppercase">Aviso de Segurança (NR-35)</strong>
          </div>
          <p className="text-xs text-muted" style={{ lineHeight: 1.4 }}>
            Todo colaborador escalado para trabalhos em altura ou construção civil pesada precisa estar com a certificação NR ativa antes de ter a entrada liberada no pavilhão de eventos.
          </p>
        </div>
      </div>

      {/* Modal Detalhes do Colaborador */}
      {selectedEmp && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedEmp(null)}>
          <div 
            style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "90%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side: details form */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--accent)" }}>Ficha Cadastral do RH</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px", marginBottom: "4px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Nome Completo</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Cargo / Função</label>
                    <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>CPF</label>
                    <input type="text" value={editCpf} onChange={(e) => setEditCpf(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>RG</label>
                    <input type="text" value={editRg} onChange={(e) => setEditRg(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>CNH</label>
                    <input type="text" value={editCnh} onChange={(e) => setEditCnh(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Chave Pix</label>
                    <input type="text" value={editPix} onChange={(e) => setEditPix(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Vencimento NR-10</label>
                    <input type="date" value={editNr10} onChange={(e) => setEditNr10(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Vencimento NR-35</label>
                    <input type="date" value={editNr35} onChange={(e) => setEditNr35(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Tipo de Contrato</label>
                    <select value={editTipoContrato} onChange={(e) => setEditTipoContrato(e.target.value as any)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px" }}>
                      <option value="CLT">CLT (Efetivo)</option>
                      <option value="PJ">PJ (Pessoa Jurídica)</option>
                      <option value="Freelancer">Freelancer (Diária)</option>
                      <option value="Terceirizado">Terceirizado Externe</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Salário Base / Diária (R$)</label>
                    <input type="number" value={editSalario} onChange={(e) => setEditSalario(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  <button type="button" className="btn-primary" onClick={handleSaveChanges} style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", flexGrow: 1, justifyContent: "center" }}>Salvar Alterações</button>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setDeletingEmpId(selectedEmp.id)} 
                    style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", color: "var(--danger)", border: "1px solid var(--danger)" }}
                  >
                    <Trash2 size={13} style={{ marginRight: "4px" }} /> Excluir
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedEmp(null)} style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }}>Fechar</button>
                </div>
              </div>

              {/* Active Asset Logs */}
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                <strong style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>LOGS DE ATIVOS &amp; DINHEIRO</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "110px", overflowY: "auto" }}>
                  {selectedEmp.historicoAtivos && selectedEmp.historicoAtivos.length > 0 ? (
                    selectedEmp.historicoAtivos.map(h => (
                      <div key={h.id} style={{ fontSize: "10px", background: "var(--bg-main)", padding: "6px 10px", borderRadius: "6px" }}>
                        <span style={{ display: "block", fontWeight: "600" }}>{h.descricao}</span>
                        <span style={{ color: "var(--text-muted)" }}>Data: {h.date} | Responsável: {h.responsavel}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>Sem registros de saídas.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Right side: uploads & attachments */}
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "12px", color: "var(--text-primary)" }}>Documentos &amp; Contratos (PDF)</strong>
              </div>

              {/* Simulate File upload */}
              <div style={{ border: "2px dashed var(--border)", padding: "16px", borderRadius: "10px", textAlign: "center", position: "relative", cursor: "pointer", backgroundColor: "var(--bg-card-hover)" }}>
                <Upload size={20} className="text-muted" style={{ margin: "0 auto 6px auto" }} />
                <span style={{ fontSize: "11px", fontWeight: "600", display: "block" }}>Anexar Contrato / ASO</span>
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Selecione um arquivo PDF</span>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleSimulateUpload}
                  style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: "pointer" }} 
                />
              </div>

              {/* Attached files list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1, overflowY: "auto", maxHeight: "250px" }}>
                {selectedEmp.anexos && selectedEmp.anexos.length > 0 ? (
                  selectedEmp.anexos.map(anx => (
                    <div key={anx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-card)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                        <FileText size={14} style={{ color: "var(--accent-secondary)", flexShrink: 0 }} />
                        <span 
                          style={{ fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", color: "var(--accent)" }}
                          title="Simular visualização/download"
                          onClick={() => alert(`Simulando download do arquivo: ${anx.name}`)}
                        >
                          {anx.name}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteAnexo(anx.id)}
                        style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ border: "1px dashed var(--border)", borderRadius: "8px", padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
                    Nenhum documento anexado
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
        </div>
      )}

      {/* Tab: Produtividade & Ranking */}
      {activeSubTab === "produtividade" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px", padding: "10px" }}>
          {/* Left Pane: Leaderboard Podium + List */}
          <div className="section-box" style={{ height: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="section-box-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <h3 className="section-box-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={20} style={{ color: "var(--accent)" }} />
                  Matriz de Desempenho &amp; Produtividade Técnica
                </h3>
                <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "12px", backgroundColor: "var(--accent-glow)", color: "var(--accent)" }}>
                  {employees.length} Avaliados
                </span>
              </div>
            </div>

            {/* ⭐️ TOP PERFORMANCE CARDS (Top 1, 2, 3) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={14} style={{ color: "#f59e0b" }} /> DESTAQUES DE MAIOR PRODUTIVIDADE &amp; EFICIÊNCIA
              </span>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                {[...employees]
                  .sort((a, b) => (b.productivity?.notaMedia || 4.2) - (a.productivity?.notaMedia || 4.2))
                  .slice(0, 3)
                  .map((emp, idx) => {
                    const rank = (idx + 1) as 1 | 2 | 3;
                    const prod = emp.productivity || {
                      horasTrabalhadas: rank === 1 ? 120 : rank === 2 ? 104 : 96,
                      eventosAtendidos: rank === 1 ? 6 : rank === 2 ? 5 : 4,
                      pontualidade: rank === 1 ? 98 : rank === 2 ? 95 : 92,
                      notaMedia: rank === 1 ? 5.0 : rank === 2 ? 4.7 : 4.5
                    };

                    const isFirst = rank === 1;
                    const isSecond = rank === 2;

                    const borderColor = isFirst ? "#f59e0b" : isSecond ? "#94a3b8" : "#d97706";
                    const bgColor = isFirst 
                      ? "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)"
                      : isSecond 
                      ? "linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, rgba(203, 213, 225, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)";

                    const badgeTitle = isFirst ? "🥇 1º LUGAR — LÍDER DE PRODUTIVIDADE & QUALIDADE" : isSecond ? "🥈 2º LUGAR — ALTA PERFORMANCE TÉCNICA" : "🥉 3º LUGAR — EXCELÊNCIA EM EXECUÇÃO DE CAMPO";
                    const badgeColor = isFirst ? "#f59e0b" : isSecond ? "#475569" : "#b45309";

                    return (
                      <div 
                        key={emp.id}
                        style={{ 
                          background: bgColor, 
                          border: `2px solid ${borderColor}`, 
                          borderRadius: "16px", 
                          padding: isFirst ? "20px" : "16px",
                          boxShadow: isFirst ? "0 10px 25px -5px rgba(245, 158, 11, 0.25)" : "var(--shadow-sm)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          position: "relative",
                          transition: "var(--transition)"
                        }}
                      >
                        {/* Badge Rank Top */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ 
                            fontSize: "10px", 
                            fontWeight: "800", 
                            color: badgeColor, 
                            backgroundColor: borderColor + "25", 
                            padding: "4px 10px", 
                            borderRadius: "12px",
                            letterSpacing: "0.5px"
                          }}>
                            {badgeTitle}
                          </span>

                          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b", fontWeight: "800", fontSize: "15px" }}>
                            <Star size={16} fill="#f59e0b" /> {prod.notaMedia.toFixed(1)}
                          </div>
                        </div>

                        {/* Avatar + Member Details */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ 
                            width: isFirst ? "52px" : "44px", 
                            height: isFirst ? "52px" : "44px", 
                            borderRadius: "50%", 
                            border: `3px solid ${borderColor}`, 
                            backgroundColor: "var(--accent)", 
                            color: "white", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontWeight: "800", 
                            fontSize: isFirst ? "18px" : "14px",
                            boxShadow: `0 0 12px ${borderColor}50`
                          }}>
                            {emp.foto || emp.name.substring(0, 2).toUpperCase()}
                          </div>

                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: isFirst ? "17px" : "15px", color: "var(--text-primary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {emp.name}
                            </strong>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                              {emp.role} &bull; <strong style={{ color: "var(--accent)" }}>{emp.tipoContrato || "CLT"}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Performance Stats Bar */}
                        <div style={{ backgroundColor: "var(--bg-card)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center", fontSize: "11px" }}>
                          <div>
                            <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Horas Operadas</span>
                            <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{prod.horasTrabalhadas}h</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>OSs Atendidas</span>
                            <strong style={{ fontSize: "13px", color: "var(--accent)" }}>{prod.eventosAtendidos} OSs</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Pontualidade</span>
                            <strong style={{ fontSize: "13px", color: "#059669" }}>{prod.pontualidade}%</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 📜 LEADERBOARD LIST (Lugares 4º em diante) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Award size={14} style={{ color: "var(--accent)" }} /> CLASSIFICAÇÃO GERAL DE DESEMPENHO
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[...employees]
                  .sort((a, b) => (b.productivity?.notaMedia || 4.2) - (a.productivity?.notaMedia || 4.2))
                  .slice(3)
                  .map((emp, index) => {
                    const rankPos = index + 4;
                    const prod = emp.productivity || {
                      horasTrabalhadas: 80 + (index * 6),
                      eventosAtendidos: 2 + index,
                      pontualidade: 90 - index,
                      tarefasConcluidas: 6,
                      notaMedia: 4.2 - (index * 0.1)
                    };

                    return (
                      <div 
                        key={emp.id} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          padding: "12px 14px", 
                          border: "1px solid var(--border)", 
                          borderRadius: "12px", 
                          background: "var(--bg-card)", 
                          color: "var(--text-primary)",
                          transition: "var(--transition)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ 
                            width: "30px", 
                            height: "30px", 
                            background: "var(--bg-main)", 
                            border: "1px solid var(--border)", 
                            color: "var(--text-secondary)", 
                            borderRadius: "50%", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontSize: "11px", 
                            fontWeight: "800" 
                          }}>
                            #{rankPos}
                          </div>
                          
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <strong className="text-sm">{emp.name}</strong>
                              <span style={{ fontSize: "9px", fontWeight: "700", padding: "1px 6px", borderRadius: "8px", backgroundColor: "var(--bg-main)", border: "1px solid var(--border)" }}>
                                {emp.tipoContrato || "CLT"}
                              </span>
                            </div>
                            <span className="text-xs text-muted" style={{ fontSize: "11px" }}>
                              {emp.role} &bull; <strong>{prod.horasTrabalhadas}h</strong> &bull; <strong>{prod.eventosAtendidos} OSs</strong>
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "14px" }}>
                          <div>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Pontualidade</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <div style={{ width: "40px", height: "6px", backgroundColor: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ width: `${prod.pontualidade}%`, height: "100%", backgroundColor: prod.pontualidade >= 90 ? "#059669" : "#d97706" }}></div>
                              </div>
                              <strong style={{ fontSize: "11px", color: "var(--text-primary)" }}>{prod.pontualidade}%</strong>
                            </div>
                          </div>

                          <div style={{ backgroundColor: "var(--accent-glow)", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--accent-border)", textAlign: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--accent)", display: "flex", alignItems: "center", gap: "2px" }}>
                              <Star size={12} fill="var(--accent)" /> {prod.notaMedia.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Pane: Launch Performance form */}
          <div className="section-box" style={{ height: "auto" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>Registrar Avaliação Técnica de Obra</h4>
            <form onSubmit={handleAddProductivity} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Colaborador Escalado</label>
                <select 
                  value={selectedEvalEmpId}
                  onChange={(e) => setSelectedEvalEmpId(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Horas Trabalhadas na OS</label>
                  <input type="number" min="1" value={evalHoras} onChange={(e) => setEvalHoras(parseInt(e.target.value) || 8)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Tarefas Entregues</label>
                  <input type="number" min="0" value={evalTasks} onChange={(e) => setEvalTasks(parseInt(e.target.value) || 2)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Pontualidade (%)</label>
                  <input type="number" min="0" max="100" value={evalPontual} onChange={(e) => setEvalPontual(parseInt(e.target.value) || 100)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Avaliação (1 a 5 estrelas)</label>
                  <select 
                    value={evalNota} 
                    onChange={(e) => setEvalNota(Number(e.target.value))}
                    style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}
                  >
                    <option value="5">★★★★★ Excelente (5)</option>
                    <option value="4">★★★★ Bom (4)</option>
                    <option value="3">★★★ Regular (3)</option>
                    <option value="2">★★ Insuficiente (2)</option>
                    <option value="1">★ Péssimo (1)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "16px", padding: "10px" }}>
                Salvar Avaliação de Desempenho
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE EMPLOYEE CONFIRMATION MODAL */}
      {deletingEmpId && (() => {
        const empToDelete = employees.find(e => e.id === deletingEmpId);
        return (
          <div className="modal-overlay" style={{ zIndex: 200 }} onClick={() => setDeletingEmpId(null)}>
            <div className="modal-content" style={{ maxWidth: "420px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title" style={{ color: "var(--danger)", marginBottom: "10px" }}>Excluir Colaborador Definitivamente?</h3>
              <p className="text-sm text-muted" style={{ marginBottom: "20px" }}>
                Tem certeza que deseja excluir o colaborador <strong>"{empToDelete?.name}"</strong> ({empToDelete?.role})? Esta ação removerá a ficha e o histórico do sistema.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <button className="btn-secondary" onClick={() => setDeletingEmpId(null)}>Cancelar</button>
                <button className="btn-danger" onClick={handleConfirmDeleteEmp}>Confirmar Exclusão</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// Helper reference hook trigger
function setOriginalEvalNota(val: number) {
  // simple helper to bridge state trigger without syntax mismatch
}
