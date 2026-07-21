import { useState } from "react";
import { 
  Briefcase, Users, Archive,
  AlertTriangle, TrendingUp,
  DollarSign, CheckSquare, MapPin,
  Clock, Building2, ChevronRight, Calendar, X, Edit3, CheckCircle2, ArrowRight
} from "lucide-react";
import type { Project, InvoiceLog, Employee, WarehouseItem } from "../types";

interface OverviewProps {
  events: Project[];
  employees?: Employee[];
  warehouseItems?: WarehouseItem[];
  employeesCount: number;
  lowStockItemsCount: number;
  pendingDocsCount: number;
  invoices: InvoiceLog[];
  onNavigateToTab: (tab: string, subTab?: string) => void;
  onSelectEvent: (event: Project) => void;
  onUpdateStock?: (id: string, newStock: number) => void;
  onUpdateEvent?: (updated: Project) => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const tipoLabel: Record<string, string> = {
  padrao: "Padrão (Octanorm)",
  misto: "Misto",
  construido: "Construído",
};
const tipoColor: Record<string, string> = {
  padrao: "#3b82f6",
  misto: "#8b5cf6",
  construido: "#f59e0b",
};

const phaseLabel: Record<string, string> = {
  Briefing: "Briefing",
  "Orçamento": "Orçamento",
  Aprovado: "Aprovado",
  "Produção": "Produção",
  Montagem: "Montagem",
  Evento: "Evento",
  Desmontagem: "Desmontagem",
  Finalizado: "Finalizado",
  during: "Em Andamento",
  no_event: "Pré-Evento",
  post: "Finalizado",
};

const phaseColor: Record<string, string> = {
  Briefing: "#94a3b8",
  "Orçamento": "#3b82f6",
  Aprovado: "#8b5cf6",
  "Produção": "#f59e0b",
  Montagem: "#ef4444",
  Evento: "#10b981",
  Desmontagem: "#f97316",
  Finalizado: "#64748b",
  during: "#ef4444",
  no_event: "#3b82f6",
  post: "#64748b",
};

export default function Overview({ 
  events, 
  employees = [],
  warehouseItems = [],
  employeesCount, 
  lowStockItemsCount, 
  pendingDocsCount,
  invoices,
  onNavigateToTab,
  onSelectEvent,
  onUpdateStock,
  onUpdateEvent
}: OverviewProps) {
  // Modal states for Dashboard indicators
  const [activeModal, setActiveModal] = useState<"montadores" | "tarefas" | "estoque" | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);

  const isActive = (e: Project) => !["Finalizado", "post"].includes(e.phase);

  const activeStands = events.filter(isActive).length;
  const totalReceber = events.filter(isActive).reduce((acc, curr) => acc + curr.valorPendente, 0);
  const totalContratado = events.reduce((acc, curr) => acc + curr.valorContratado, 0);
  const totalCustoRealizado = events.reduce((acc, curr) => acc + curr.custoRealizado, 0);
  const totalCustoPrevisto = events.filter(isActive).reduce((acc, curr) => acc + curr.custoPrevisto, 0);
  const pendingChecklistItems = events.filter(isActive)
    .reduce((acc, curr) => acc + curr.checklist.filter(c => !c.done).length, 0);
  const finishedCount = events.filter(e => !isActive(e)).length;

  const upcoming = [...events]
    .filter(isActive)
    .sort((a, b) => new Date(a.dataMontagem).getTime() - new Date(b.dataMontagem).getTime())
    .slice(0, 5);

  const alerts: { type: "warn" | "info" | "danger"; msg: string; targetTab?: string; targetSubTab?: string; targetEvent?: Project }[] = [];
  if (lowStockItemsCount > 0)
    alerts.push({ type: "warn", msg: `${lowStockItemsCount} item(ns) no depósito abaixo do estoque mínimo. Clique para ver.`, targetTab: "warehouse" });
  if (pendingDocsCount > 0)
    alerts.push({ type: "warn", msg: `${pendingDocsCount} documento(s) pendente(s) em projetos ativos.`, targetTab: "os" });
  events.filter(isActive).forEach(e => {
    const docs = e.docs?.filter(d => d.status === "pending") || [];
    if (docs.length > 0)
      alerts.push({ type: "danger", msg: `"${e.name}": ${docs.map(d => d.name).join(", ")}.`, targetEvent: e });
  });
  if (alerts.length === 0)
    alerts.push({ type: "info", msg: "Nenhum alerta crítico. Operação tranquila!" });

  const kpis = [
    {
      icon: <Briefcase size={20} />,
      label: "Stands em Andamento",
      value: String(activeStands),
      unit: "projetos ativos",
      color: "#6d28d9",
      action: () => onNavigateToTab("kanban"),
    },
    {
      icon: <DollarSign size={20} />,
      label: "Contas a Receber",
      value: fmt(totalReceber),
      unit: "aguardando pagamento",
      color: "#059669",
      action: () => onNavigateToTab("financial", "receber"),
    },
    {
      icon: <TrendingUp size={20} />,
      label: "Custo Previsto",
      value: fmt(totalCustoPrevisto),
      unit: "projetos ativos",
      color: "#d97706",
      action: () => onNavigateToTab("financial", "centro_custo"),
    },
    {
      icon: <Users size={20} />,
      label: "Montadores Escalados",
      value: String(employeesCount),
      unit: "em campo",
      color: "#0891b2",
      action: () => setActiveModal("montadores"),
    },
    {
      icon: <CheckSquare size={20} />,
      label: "Tarefas Pendentes",
      value: String(pendingChecklistItems),
      unit: "nos checklists",
      color: pendingChecklistItems > 0 ? "#dc2626" : "#64748b",
      action: () => setActiveModal("tarefas"),
    },
    {
      icon: <Archive size={20} />,
      label: "Estoque Crítico",
      value: String(lowStockItemsCount),
      unit: "abaixo do mínimo",
      color: lowStockItemsCount > 0 ? "#dc2626" : "#64748b",
      action: () => setActiveModal("estoque"),
    },
  ];

  // Check if any event has pending ART approaching deadline (deadline is 5 days before montagem)
  const pendingArts = events.filter(e => {
    if (!e.regrasCentro?.artObrigatoria || !e.dataMontagem) return false;
    const artDoc = e.docs.find(d => d.id === "d2");
    const isApproved = artDoc?.status === "approved";
    if (isApproved) return false;
    
    const montagemDate = new Date(e.dataMontagem);
    const deadlineDate = new Date(montagemDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    const currentDate = new Date();
    
    deadlineDate.setHours(0,0,0,0);
    currentDate.setHours(0,0,0,0);
    
    const diffTime = deadlineDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 3;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "10px" }}>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px" }}>
        {kpis.map((kpi, i) => (
          <button
            key={i}
            onClick={kpi.action}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: "var(--shadow-sm)",
              transition: "box-shadow 0.2s, transform 0.15s",
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              backgroundColor: kpi.color + "18", color: kpi.color,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1.2 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{kpi.unit}</div>
            </div>
            <div style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>{kpi.label}</div>
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>

        {/* Projects Timeline */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
              <Calendar size={16} style={{ color: "var(--accent)", marginRight: "8px" }} />
              Próximas Montagens e Eventos
            </h3>
            <button
              onClick={() => onNavigateToTab("kanban")}
              style={{ fontSize: "12px", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
            >
              Ver todos <ChevronRight size={14} />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "32px 0", margin: 0 }}>
              Nenhum projeto ativo no momento.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {upcoming.map(evt => {
                const tipo = evt.tipoEstande;
                return (
                  <button
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    style={{
                      background: "var(--bg-main)", border: "1px solid var(--border)",
                      borderRadius: "12px", padding: "14px 16px",
                      textAlign: "left", cursor: "pointer", transition: "border-color 0.2s", width: "100%"
                    }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {evt.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <Building2 size={11} />
                          <span>{evt.client}</span>
                          {evt.nomeFeira && <><span>·</span><MapPin size={11} /><span>{evt.nomeFeira}</span></>}
                          {evt.areaM2 && <><span>·</span><span>{evt.areaM2}m²</span></>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "5px", alignItems: "center", flexShrink: 0, marginLeft: "10px" }}>
                        {tipo && (
                          <span style={{
                            fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "20px",
                            backgroundColor: tipoColor[tipo] + "20", color: tipoColor[tipo], whiteSpace: "nowrap"
                          }}>
                            {tipoLabel[tipo]}
                          </span>
                        )}
                        <span style={{
                          fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "20px",
                          backgroundColor: (phaseColor[evt.phase] || "#6d28d9") + "20",
                          color: phaseColor[evt.phase] || "#6d28d9", whiteSpace: "nowrap"
                        }}>
                          {phaseLabel[evt.phase] || evt.phase}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <div style={{ flex: 1, height: "5px", borderRadius: "10px", backgroundColor: "var(--border)" }}>
                        <div style={{
                          height: "100%", borderRadius: "10px", backgroundColor: "var(--accent)",
                          width: `${evt.completionRate}%`
                        }} />
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", minWidth: "30px", textAlign: "right" }}>
                        {evt.completionRate}%
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={11} /> Montagem: {new Date(evt.dataMontagem).toLocaleDateString("pt-BR")}
                      </span>
                      <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>
                        {fmt(evt.valorContratado)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Alerts */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "18px", boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <AlertTriangle size={15} color="#f59e0b" />
              <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>Alertas</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {alerts.slice(0, 5).map((a, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    if (a.targetEvent) onSelectEvent(a.targetEvent);
                    else if (a.targetTab) onNavigateToTab(a.targetTab, a.targetSubTab);
                  }}
                  style={{
                    display: "flex", gap: "8px", alignItems: "flex-start",
                    padding: "9px 11px", borderRadius: "8px",
                    backgroundColor: a.type === "danger" ? "#fef2f2" : a.type === "warn" ? "#fffbeb" : "#f0fdf4",
                    border: `1px solid ${a.type === "danger" ? "#fecaca" : a.type === "warn" ? "#fde68a" : "#bbf7d0"}`,
                    cursor: (a.targetEvent || a.targetTab) ? "pointer" : "default"
                  }}
                >
                  <span style={{ fontSize: "13px", flexShrink: 0 }}>
                    {a.type === "danger" ? "🔴" : a.type === "warn" ? "⚠️" : "✅"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#374151", lineHeight: "1.5" }}>{a.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "18px", boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "12px", marginTop: 0 }}>
              Resumo Financeiro
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {[
                { label: "Total contratado", value: fmt(totalContratado), color: "#6d28d9" },
                { label: "Custo realizado", value: fmt(totalCustoRealizado), color: "#dc2626" },
                { label: "Stands encerrados", value: `${finishedCount} project(s)`, color: "#059669" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{row.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: row.color }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateToTab("financial")}
              style={{
                width: "100%", marginTop: "12px", padding: "9px",
                background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
              }}
            >
              <DollarSign size={14} /> Abrir Financeiro
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Montadores Escalados */}
      {activeModal === "montadores" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" style={{ maxWidth: "750px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} color="var(--accent)" /> Montadores Escalados em Eventos
              </h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>X</button>
            </div>
            <div className="modal-body" style={{ padding: "16px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "var(--bg-main)", borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Colaborador</th>
                    <th style={{ padding: "10px" }}>Função</th>
                    <th style={{ padding: "10px" }}>Projeto / Evento</th>
                    <th style={{ padding: "10px" }}>Data Montagem</th>
                    <th style={{ padding: "10px" }}>Horário</th>
                    <th style={{ padding: "10px" }}>Situação Doc</th>
                  </tr>
                </thead>
                <tbody>
                  {events.filter(isActive).flatMap(evt => 
                    evt.assignedEmployees.map(emp => ({ ...emp, evt }))
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                        Nenhum colaborador escalado nos projetos ativos no momento.
                      </td>
                    </tr>
                  ) : (
                    events.filter(isActive).flatMap(evt => 
                      evt.assignedEmployees.map(emp => ({ ...emp, evt }))
                    ).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px", fontWeight: "600" }}>{item.name}</td>
                        <td style={{ padding: "10px" }}>{item.role || "Montador"}</td>
                        <td style={{ padding: "10px", color: "var(--accent)", cursor: "pointer" }} onClick={() => { setActiveModal(null); onSelectEvent(item.evt); }}>
                          {item.evt.name}
                        </td>
                        <td style={{ padding: "10px" }}>{item.evt.dataMontagem || item.evt.startDate}</td>
                        <td style={{ padding: "10px" }}>{item.horario || "08:00 - 18:00"}</td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ 
                            padding: "3px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "600",
                            backgroundColor: item.documentStatus === "complete" ? "#d1fae5" : "#fef3c7",
                            color: item.documentStatus === "complete" ? "#065f46" : "#92400e"
                          }}>
                            {item.documentStatus === "complete" ? "Homologado" : "Pendente Doc"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button className="btn-primary" onClick={() => { setActiveModal(null); onNavigateToTab("employees"); }}>
                  Gerenciar Equipe Completa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tarefas Pendentes */}
      {activeModal === "tarefas" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckSquare size={18} color="var(--danger)" /> Checklists e Tarefas Pendentes
              </h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>X</button>
            </div>
            <div className="modal-body" style={{ padding: "16px", maxHeight: "60vh", overflowY: "auto" }}>
              {events.filter(isActive).map(evt => {
                const pendingTasks = evt.checklist.filter(c => !c.done);
                if (pendingTasks.length === 0) return null;
                return (
                  <div key={evt.id} style={{ marginBottom: "16px", padding: "12px", border: "1px solid var(--border)", borderRadius: "10px", backgroundColor: "var(--bg-main)" }}>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--accent)", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                      <span>{evt.name}</span>
                      <button 
                        style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                        onClick={() => { setActiveModal(null); onSelectEvent(evt); }}
                      >
                        Abrir Evento <ArrowRight size={12} />
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {pendingTasks.map(task => (
                        <label key={task.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                          <input 
                            type="checkbox" 
                            checked={task.done} 
                            onChange={() => {
                              if (!onUpdateEvent) return;
                              const updatedChecklist = evt.checklist.map(c => c.id === task.id ? { ...c, done: !c.done } : c);
                              onUpdateEvent({ ...evt, checklist: updatedChecklist });
                            }} 
                          />
                          <span>{task.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button className="btn-primary" onClick={() => { setActiveModal(null); onNavigateToTab("os"); }}>
                  Ir para Ordens de Serviço
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Estoque Crítico */}
      {activeModal === "estoque" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" style={{ maxWidth: "750px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Archive size={18} color="var(--danger)" /> Itens do Estoque Crítico
              </h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>X</button>
            </div>
            <div className="modal-body" style={{ padding: "16px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "var(--bg-main)", borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Item Crítico</th>
                    <th style={{ padding: "10px" }}>Qtd Atual</th>
                    <th style={{ padding: "10px" }}>Qtd Mínima</th>
                    <th style={{ padding: "10px" }}>Localização</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Ação de Correção</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseItems.filter(i => i.stock <= i.stockMinimo).length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                        Nenhum item em nível crítico no estoque.
                      </td>
                    </tr>
                  ) : (
                    warehouseItems.filter(i => i.stock <= i.stockMinimo).map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px", fontWeight: "600" }}>{item.name}</td>
                        <td style={{ padding: "10px", color: "#dc2626", fontWeight: "700" }}>{item.stock}</td>
                        <td style={{ padding: "10px" }}>{item.stockMinimo}</td>
                        <td style={{ padding: "10px", color: "var(--text-muted)" }}>
                          Galpão {item.localizacaoFisica?.galpao || "A"} - Corredor {item.localizacaoFisica?.corredor || "01"}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {editingStockId === item.id ? (
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              <input 
                                type="number" 
                                value={editingStockValue} 
                                onChange={(e) => setEditingStockValue(Number(e.target.value))} 
                                style={{ width: "60px", padding: "4px", borderRadius: "4px", border: "1px solid var(--border)" }}
                              />
                              <button 
                                className="btn-primary" 
                                style={{ padding: "4px 8px", fontSize: "11px" }}
                                onClick={() => {
                                  if (onUpdateStock) onUpdateStock(item.id, editingStockValue);
                                  setEditingStockId(null);
                                }}
                              >
                                Salvar
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="btn-secondary" 
                              style={{ padding: "4px 10px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              onClick={() => {
                                setEditingStockId(item.id);
                                setEditingStockValue(item.stockMinimo + 5);
                              }}
                            >
                              <Edit3 size={12} /> Corrigir Estoque
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button className="btn-primary" onClick={() => { setActiveModal(null); onNavigateToTab("warehouse"); }}>
                  Ir para Almoxarifado WMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
