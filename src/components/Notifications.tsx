import React, { useState } from "react";
import { 
  Bell, AlertTriangle, FileText, Calendar, CheckSquare, 
  Search, Package, Users, Check, ArrowRight, CornerDownRight, 
  ShieldAlert, RefreshCw, AlertCircle, CheckCircle2
} from "lucide-react";
import type { Project, WarehouseItem, Employee } from "../types";

interface NotificationsProps {
  warehouseItems: WarehouseItem[];
  events: Project[];
  employees: Employee[];
  userRole: string;
  onUpdateStock: (id: string, newStock: number) => void;
  onUpdateEvent: (updated: Project) => void;
  onToggleDocStatus: (id: string) => void;
  onNavigateToTab: (tab: string, subTab?: string, selectedItemId?: string) => void;
}

export default function Notifications({
  warehouseItems,
  events,
  employees,
  userRole,
  onUpdateStock,
  onUpdateEvent,
  onToggleDocStatus,
  onNavigateToTab
}: NotificationsProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "stock" | "docs" | "agenda" | "employees">("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Custom stock adjustment state
  const [restockQtys, setRestockQtys] = useState<Record<string, number>>({});
  
  // Simulated list of dismissed/read alert IDs
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  // Success feedback state
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string } | null>(null);

  const triggerFeedback = (id: string, text: string) => {
    setFeedbackMsg({ id, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  // 1. Calculate critical stock items
  const lowStockItems = warehouseItems.filter(item => item.stock <= item.stockMinimo);
  
  // 2. Calculate pending project docs
  const pendingDocs = events
    .filter(e => e.phase !== "post" && e.phase !== "Finalizado")
    .flatMap(e => 
      e.docs
        .filter(d => d.status === "pending")
        .map(doc => ({
          projectId: e.id,
          projectCode: e.codigo,
          projectName: e.name,
          dataMontagem: e.dataMontagem,
          doc
        }))
    );

  // 3. Calculate pending employee documents
  const pendingEmployees = employees.filter(emp => emp.documentStatus === "pending");

  // 4. Calculate upcoming setups (dataMontagem within the next 10 days starting from local date 2026-07-20)
  const baseDate = new Date("2026-07-20");
  const upcomingSetups = events.filter(e => {
    if (!e.dataMontagem) return false;
    const montagemDate = new Date(e.dataMontagem);
    const diffTime = montagemDate.getTime() - baseDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // upcoming if starts setup in less than 10 days, and not in the past
    return diffDays >= -2 && diffDays <= 10;
  });

  // Assemble all notifications into structured items
  const allNotifications: any[] = [];

  // Add stock alerts
  lowStockItems.forEach(item => {
    const id = `stock-${item.id}`;
    if (dismissedAlerts.includes(id)) return;
    allNotifications.push({
      id,
      category: "stock",
      title: `Estoque Crítico: ${item.name}`,
      description: `${item.marca || ""} ${item.modelo || ""} está com nível crítico de armazenamento.`,
      details: `Quantidade Atual: ${item.stock} ${item.unidade || "unid."} (Mínimo recomendado: ${item.stockMinimo})`,
      location: item.localizacaoFisica 
        ? `Galpão ${item.localizacaoFisica.galpao}, Corredor ${item.localizacaoFisica.corredor}, Prateleira ${item.localizacaoFisica.prateleira}`
        : "Não informada",
      severity: item.stock === 0 ? "high" : "medium",
      itemId: item.id,
      currentStock: item.stock,
      minStock: item.stockMinimo,
      actionType: "restock"
    });
  });

  // Add document alerts
  pendingDocs.forEach(item => {
    const id = `doc-${item.projectId}-${item.doc.id}`;
    if (dismissedAlerts.includes(id)) return;
    allNotifications.push({
      id,
      category: "docs",
      title: `Documento Pendente: ${item.doc.name}`,
      description: `Documento obrigatório aguardando aprovação para o projeto cenográfico.`,
      details: `Estande: ${item.projectName} (${item.projectCode}) | Início da montagem: ${item.dataMontagem}`,
      severity: "high",
      projectId: item.projectId,
      docId: item.doc.id,
      actionType: "approve_doc"
    });
  });

  // Add employee alerts
  pendingEmployees.forEach(emp => {
    const id = `emp-${emp.id}`;
    if (dismissedAlerts.includes(id)) return;
    allNotifications.push({
      id,
      category: "employees",
      title: `Documentação de Equipe: ${emp.name}`,
      description: `O colaborador está escalado para montagens mas possui pendências nos documentos pessoais (RG/CPF).`,
      details: `Cargo: ${emp.role} | Credenciamento do Pavilhão bloqueado.`,
      severity: "medium",
      employeeId: emp.id,
      actionType: "approve_emp_doc"
    });
  });

  // Add upcoming setups
  upcomingSetups.forEach(evt => {
    const id = `setup-${evt.id}`;
    if (dismissedAlerts.includes(id)) return;
    allNotifications.push({
      id,
      category: "agenda",
      title: `Montagem Iniciando em Breve: ${evt.name}`,
      description: `A montagem da cenografia está programada para iniciar no pavilhão de eventos.`,
      details: `Data de Montagem: ${evt.dataMontagem} | Cidade: ${evt.cidadeEvento || "Natal/RN"} | Responsável: ${evt.responsavel}`,
      severity: "low",
      projectId: evt.id,
      actionType: "view_agenda"
    });
  });

  // Add the special mock notification: "Estande Feicon 2026 inicia montagem em breve."
  const feiconId = "system-feicon-2026";
  if (!dismissedAlerts.includes(feiconId)) {
    allNotifications.push({
      id: feiconId,
      category: "agenda",
      title: "Alerta de Agenda: Estande Feicon 2026",
      description: "O Estande Feicon 2026 inicia sua montagem em breve no pavilhão correspondente.",
      details: "Simulação de cronograma ativo para o Estande Feicon 2026.",
      severity: "low",
      actionType: "view_agenda"
    });
  }

  // Filter alerts by category
  const categoryFiltered = allNotifications.filter(alert => {
    if (activeFilter === "all") return true;
    return alert.category === activeFilter;
  });

  // Filter alerts by search term
  const searchFiltered = categoryFiltered.filter(alert => {
    const term = searchTerm.toLowerCase();
    return (
      alert.title.toLowerCase().includes(term) ||
      alert.description.toLowerCase().includes(term) ||
      alert.details.toLowerCase().includes(term)
    );
  });

  // Actions
  const handleRestock = (itemId: string, currentStock: number, alertId: string) => {
    const qtyToAdd = restockQtys[itemId] || 5;
    const newStock = currentStock + qtyToAdd;
    onUpdateStock(itemId, newStock);
    triggerFeedback(alertId, `Estoque abastecido com +${qtyToAdd} unidades com sucesso!`);
    
    // Automatically dismiss after a short delay since it is no longer critical
    setTimeout(() => {
      setDismissedAlerts(prev => [...prev, alertId]);
    }, 1200);
  };

  const handleApproveDoc = (projectId: string, docId: string, alertId: string) => {
    const project = events.find(e => e.id === projectId);
    if (!project) return;
    
    const updatedDocs = project.docs.map(d => 
      d.id === docId ? { ...d, status: "approved" as const } : d
    );

    onUpdateEvent({
      ...project,
      docs: updatedDocs
    });

    triggerFeedback(alertId, "Documento homologado e aprovado com sucesso!");
    
    setTimeout(() => {
      setDismissedAlerts(prev => [...prev, alertId]);
    }, 1200);
  };

  const handleApproveEmpDoc = (empId: string, alertId: string) => {
    onToggleDocStatus(empId);
    triggerFeedback(alertId, "Documentos do colaborador homologados com sucesso!");

    setTimeout(() => {
      setDismissedAlerts(prev => [...prev, alertId]);
    }, 1200);
  };

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
  };

  // Helper count badges
  const stockCount = lowStockItems.length;
  const docsCount = pendingDocs.length;
  const empCount = pendingEmployees.length;
  const agendaCount = upcomingSetups.length + (dismissedAlerts.includes(feiconId) ? 0 : 1);
  const totalCount = allNotifications.length;

  return (
    <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ── Top Dashboard Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        
        {/* Total Card */}
        <div 
          onClick={() => setActiveFilter("all")}
          style={{
            backgroundColor: "var(--bg-card)",
            border: `1px solid ${activeFilter === "all" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "16px",
            padding: "16px 20px",
            cursor: "pointer",
            boxShadow: activeFilter === "all" ? "var(--shadow-md)" : "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "var(--transition)"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Todos os Alertas</span>
            <h4 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", marginTop: "4px" }}>{totalCount}</h4>
          </div>
          <div style={{ backgroundColor: "var(--accent-glow)", color: "var(--accent-text)", padding: "10px", borderRadius: "12px" }}>
            <Bell size={20} />
          </div>
        </div>

        {/* Stock Card */}
        <div 
          onClick={() => setActiveFilter("stock")}
          style={{
            backgroundColor: "var(--bg-card)",
            border: `1px solid ${activeFilter === "stock" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "16px",
            padding: "16px 20px",
            cursor: "pointer",
            boxShadow: activeFilter === "stock" ? "var(--shadow-md)" : "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "var(--transition)"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Estoque Crítico</span>
            <h4 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", marginTop: "4px" }}>{stockCount}</h4>
          </div>
          <div style={{ backgroundColor: "var(--warning)", color: "var(--warning-text)", padding: "10px", borderRadius: "12px" }}>
            <Package size={20} />
          </div>
        </div>

        {/* Docs Card */}
        <div 
          onClick={() => setActiveFilter("docs")}
          style={{
            backgroundColor: "var(--bg-card)",
            border: `1px solid ${activeFilter === "docs" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "16px",
            padding: "16px 20px",
            cursor: "pointer",
            boxShadow: activeFilter === "docs" ? "var(--shadow-md)" : "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "var(--transition)"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Doc. Estandes</span>
            <h4 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", marginTop: "4px" }}>{docsCount}</h4>
          </div>
          <div style={{ backgroundColor: "rgba(20, 69, 128, 0.1)", color: "var(--accent-text)", padding: "10px", borderRadius: "12px" }}>
            <FileText size={20} />
          </div>
        </div>

        {/* Employees Card */}
        <div 
          onClick={() => setActiveFilter("employees")}
          style={{
            backgroundColor: "var(--bg-card)",
            border: `1px solid ${activeFilter === "employees" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "16px",
            padding: "16px 20px",
            cursor: "pointer",
            boxShadow: activeFilter === "employees" ? "var(--shadow-md)" : "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "var(--transition)"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Doc. Equipe</span>
            <h4 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", marginTop: "4px" }}>{empCount}</h4>
          </div>
          <div style={{ backgroundColor: "var(--danger)", color: "var(--danger-text)", padding: "10px", borderRadius: "12px" }}>
            <Users size={20} />
          </div>
        </div>

        {/* Agenda Card */}
        <div 
          onClick={() => setActiveFilter("agenda")}
          style={{
            backgroundColor: "var(--bg-card)",
            border: `1px solid ${activeFilter === "agenda" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "16px",
            padding: "16px 20px",
            cursor: "pointer",
            boxShadow: activeFilter === "agenda" ? "var(--shadow-md)" : "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "var(--transition)"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Agenda/Montagem</span>
            <h4 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", marginTop: "4px" }}>{agendaCount}</h4>
          </div>
          <div style={{ backgroundColor: "var(--success)", color: "var(--success-text)", padding: "10px", borderRadius: "12px" }}>
            <Calendar size={20} />
          </div>
        </div>

      </div>

      {/* ── Filters & Search Row ── */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        
        {/* Navigation Tab Style Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", backgroundColor: "var(--bg-card)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border)" }}>
          <button 
            type="button"
            onClick={() => setActiveFilter("all")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: activeFilter === "all" ? "var(--accent)" : "transparent",
              color: activeFilter === "all" ? "#ffffff" : "var(--text-secondary)",
              transition: "var(--transition)"
            }}
          >
            Todas ({totalCount})
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter("stock")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: activeFilter === "stock" ? "var(--accent)" : "transparent",
              color: activeFilter === "stock" ? "#ffffff" : "var(--text-secondary)",
              transition: "var(--transition)"
            }}
          >
            Estoque ({stockCount})
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter("docs")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: activeFilter === "docs" ? "var(--accent)" : "transparent",
              color: activeFilter === "docs" ? "#ffffff" : "var(--text-secondary)",
              transition: "var(--transition)"
            }}
          >
            Estandes ({docsCount})
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter("employees")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: activeFilter === "employees" ? "var(--accent)" : "transparent",
              color: activeFilter === "employees" ? "#ffffff" : "var(--text-secondary)",
              transition: "var(--transition)"
            }}
          >
            Equipe ({empCount})
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter("agenda")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: activeFilter === "agenda" ? "var(--accent)" : "transparent",
              color: activeFilter === "agenda" ? "#ffffff" : "var(--text-secondary)",
              transition: "var(--transition)"
            }}
          >
            Agenda ({agendaCount})
          </button>
        </div>

        {/* Text Filter Search */}
        <div style={{ position: "relative", minWidth: "280px" }}>
          <Search size={16} className="text-muted" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Buscar alertas..."
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

      </div>

      {/* ── Alert Notifications List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        
        {searchFiltered.length === 0 ? (
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--text-muted)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px"
          }}>
            <CheckCircle2 size={36} style={{ color: "var(--success-text)" }} />
            <div>
              <h4 style={{ color: "var(--text-primary)", fontWeight: "700", marginBottom: "4px" }}>Nenhum alerta pendente</h4>
              <p style={{ fontSize: "12.5px" }}>Tudo limpo por aqui! Nenhuma notificação encontrada para os filtros selecionados.</p>
            </div>
          </div>
        ) : (
          searchFiltered.map(alert => {
            const hasFeedback = feedbackMsg?.id === alert.id;
            const borderColors = {
              high: "rgba(239, 68, 68, 0.4)",
              medium: "rgba(245, 158, 11, 0.4)",
              low: "var(--border)"
            };
            const leftBorderColors = {
              high: "#ef4444",
              medium: "#f59e0b",
              low: "var(--accent)"
            };

            return (
              <div 
                key={alert.id}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: `1px solid ${borderColors[alert.severity as keyof typeof borderColors] || "var(--border)"}`,
                  borderLeft: `4px solid ${leftBorderColors[alert.severity as keyof typeof leftBorderColors] || "var(--accent)"}`,
                  borderRadius: "12px",
                  padding: "18px 20px",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  position: "relative",
                  transition: "var(--transition)",
                  opacity: hasFeedback ? 0.8 : 1
                }}
              >
                {/* Upper row: Icon, title, severity badge & dismiss */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {alert.category === "stock" && <AlertTriangle size={20} style={{ color: "#f59e0b" }} />}
                    {alert.category === "docs" && <FileText size={20} style={{ color: "var(--accent-text)" }} />}
                    {alert.category === "employees" && <Users size={20} style={{ color: "#ef4444" }} />}
                    {alert.category === "agenda" && <Calendar size={20} style={{ color: "var(--accent-secondary)" }} />}
                    
                    <div>
                      <h4 style={{ fontSize: "14.5px", fontWeight: "700", color: "var(--text-primary)" }}>
                        {alert.title}
                      </h4>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>
                        Filtro: {alert.category === "stock" ? "Estoque Crítico WMS" : alert.category === "docs" ? "Documentos de Estandes" : alert.category === "employees" ? "Equipe / RH" : "Agenda & Cronogramas"}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span 
                      style={{
                        fontSize: "9.5px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "20px",
                        backgroundColor: 
                          alert.severity === "high" ? "var(--danger)" : 
                          alert.severity === "medium" ? "var(--warning)" : "var(--accent-glow)",
                        color: 
                          alert.severity === "high" ? "var(--danger-text)" : 
                          alert.severity === "medium" ? "var(--warning-text)" : "var(--accent-text)"
                      }}
                    >
                      {alert.severity === "high" ? "Alta Prioridade" : alert.severity === "medium" ? "Média" : "Informativo"}
                    </span>

                    <button 
                      onClick={() => dismissAlert(alert.id)}
                      title="Dispensar Notificação"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "var(--transition)"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span style={{ fontSize: "14px", lineHeight: 1 }}>&times;</span>
                    </button>
                  </div>
                </div>

                {/* Middle row: Description & specific data fields */}
                <div style={{ paddingLeft: "32px" }}>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    {alert.description}
                  </p>
                  
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "4px", 
                    marginTop: "8px", 
                    padding: "8px 12px", 
                    backgroundColor: "var(--bg-main)", 
                    borderRadius: "8px", 
                    fontSize: "12px", 
                    color: "var(--text-secondary)" 
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <CornerDownRight size={10} style={{ color: "var(--text-muted)" }} />
                      <strong>Detalhes:</strong> {alert.details}
                    </span>
                    {alert.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CornerDownRight size={10} style={{ color: "var(--text-muted)" }} />
                        <strong>Localização:</strong> {alert.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom row: Interactive quick actions */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "flex-end", 
                  alignItems: "center", 
                  paddingLeft: "32px", 
                  marginTop: "4px",
                  borderTop: "1px dashed var(--border)",
                  paddingTop: "12px"
                }}>
                  {hasFeedback && feedbackMsg ? (
                    <div style={{ 
                      color: "var(--success-text)", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px", 
                      fontSize: "12.5px", 
                      fontWeight: "600"
                    }}>
                      <Check size={16} />
                      {feedbackMsg.text}
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      
                      {/* Action 1: Restocking items */}
                      {alert.actionType === "restock" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Qtd. para repor:</span>
                          <input 
                            type="number"
                            min="1"
                            max="200"
                            value={restockQtys[alert.itemId] ?? (alert.minStock - alert.currentStock + 10)}
                            onChange={(e) => setRestockQtys({ ...restockQtys, [alert.itemId]: parseInt(e.target.value) || 0 })}
                            style={{
                              width: "60px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              backgroundColor: "var(--bg-main)",
                              color: "var(--text-primary)",
                              fontSize: "12.5px",
                              fontWeight: "600",
                              textAlign: "center"
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRestock(alert.itemId, alert.currentStock, alert.id)}
                            className="btn-primary"
                            style={{ 
                              padding: "6px 12px", 
                              fontSize: "12px", 
                              borderRadius: "6px", 
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer"
                            }}
                          >
                            <RefreshCw size={12} />
                            Repor Estoque
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigateToTab("warehouse", "inventario", alert.itemId)}
                            className="btn-secondary"
                            style={{ 
                              padding: "6px 12px", 
                              fontSize: "12px", 
                              borderRadius: "6px", 
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer"
                            }}
                          >
                            Ver Item no Estoque <ArrowRight size={12} />
                          </button>
                        </div>
                      )}

                      {/* Action 2: Approving project document */}
                      {alert.actionType === "approve_doc" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onNavigateToTab("os")}
                            style={{ 
                              padding: "6px 12px", 
                              fontSize: "12px", 
                              borderRadius: "6px", 
                              backgroundColor: "var(--bg-main)", 
                              border: "1px solid var(--border)",
                              color: "var(--text-secondary)",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Ver Projeto (OS)
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleApproveDoc(alert.projectId, alert.docId, alert.id)}
                            className="btn-primary"
                            style={{ 
                              padding: "6px 12px", 
                              fontSize: "12px", 
                              borderRadius: "6px", 
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer"
                            }}
                          >
                            <Check size={12} />
                            Aprovar Documento
                          </button>
                        </>
                      )}

                      {/* Action 3: Homologating Employee Document */}
                      {alert.actionType === "approve_emp_doc" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onNavigateToTab("employees")}
                            style={{ 
                              padding: "6px 12px", 
                              fontSize: "12px", 
                              borderRadius: "6px", 
                              backgroundColor: "var(--bg-main)", 
                              border: "1px solid var(--border)",
                              color: "var(--text-secondary)",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Ficha do Funcionário
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveEmpDoc(alert.employeeId, alert.id)}
                            className="btn-primary"
                            style={{ 
                              padding: "6px 12px", 
                              fontSize: "12px", 
                              borderRadius: "6px", 
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer"
                            }}
                          >
                            <Check size={12} />
                            Homologar Documento
                          </button>
                        </>
                      )}

                      {/* Action 4: Redirect to schedule/calendar */}
                      {alert.actionType === "view_agenda" && (
                        <button
                          type="button"
                          onClick={() => onNavigateToTab("agenda")}
                          className="btn-primary"
                          style={{ 
                            padding: "6px 12px", 
                            fontSize: "12px", 
                            borderRadius: "6px", 
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Visualizar na Agenda
                          <ArrowRight size={12} />
                        </button>
                      )}

                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}
