import React, { useState } from "react";
import { 
  Briefcase, Users, Archive,
  AlertTriangle, TrendingUp,
  DollarSign, CheckSquare, MapPin,
  Clock, Building2, ChevronRight, Calendar, X, Edit3, CheckCircle2, ArrowRight,
  Plus, ShieldAlert, Sparkles, Layers, Activity, FileText
} from "lucide-react";
import type { Project, InvoiceLog, Employee, WarehouseItem, Orcamento } from "../types";

interface OverviewProps {
  events: Project[];
  employees?: Employee[];
  warehouseItems?: WarehouseItem[];
  employeesCount: number;
  lowStockItemsCount: number;
  pendingDocsCount: number;
  invoices: InvoiceLog[];
  orcamentos?: Orcamento[];
  onNavigateToTab: (tab: string, subTab?: string) => void;
  onSelectEvent: (event: Project) => void;
  onUpdateStock?: (id: string, newStock: number) => void;
  onUpdateEvent?: (updated: Project) => void;
  onOpenBankReconciliation?: () => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const tipoLabel: Record<string, string> = {
  padrao: "Padrão (Octanorm)",
  misto: "Misto (Octa + Marcenaria)",
  construido: "Construído (Marcenaria)",
};
const tipoColor: Record<string, string> = {
  padrao: "#2563eb",
  misto: "#2563eb",
  construido: "#d97706",
};

const phaseLabel: Record<string, string> = {
  Briefing: "Briefing",
  "Orçamento": "Orçamento",
  Aprovado: "Aprovado",
  "Produção": "Em Produção",
  Montagem: "Em Montagem",
  Evento: "Em Evento",
  Desmontagem: "Desmontagem",
  Finalizado: "Finalizado",
  during: "Em Andamento",
  no_event: "Pré-Evento",
  post: "Finalizado",
};

const phaseColor: Record<string, string> = {
  Briefing: "#64748b",
  "Orçamento": "#2563eb",
  Aprovado: "#059669",
  "Produção": "#d97706",
  Montagem: "#dc2626",
  Evento: "#16a34a",
  Desmontagem: "#ea580c",
  Finalizado: "#475569",
  during: "#dc2626",
  no_event: "#2563eb",
  post: "#475569",
};

export default function Overview({ 
  events, 
  employees = [],
  warehouseItems = [],
  employeesCount, 
  lowStockItemsCount, 
  pendingDocsCount,
  invoices = [],
  orcamentos = [],
  onNavigateToTab,
  onSelectEvent,
  onUpdateStock,
  onUpdateEvent,
  onOpenBankReconciliation
}: OverviewProps) {
  // Modal states for Dashboard indicators
  const [activeModal, setActiveModal] = useState<"montadores" | "tarefas" | "estoque" | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);

  const isActive = (e: Project) => !["Finalizado", "post"].includes(e.phase);

  const activeStands = events.filter(isActive).length;

  // Calculo consistente de Faturamento Comercial (Eventos Contratados + Propostas Ganhas)
  const totalFaturamentoEvents = events.reduce((acc, curr) => acc + (curr.valorContratado || 0), 0);
  const totalApprovedOrcamentos = (orcamentos || [])
    .filter(o => (o.status === "ganho" || o.status === "aprovado") && !events.some(e => e.codigo?.includes(o.codigo) || e.client === o.cliente))
    .reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalContratado = totalFaturamentoEvents + totalApprovedOrcamentos;

  // Calculo de Contas a Receber (Soma de todos os saldos pendentes em eventos + faturas de receita a receber)
  const totalReceberEvents = events.reduce((acc, curr) => acc + (curr.valorPendente || 0), 0);
  const totalReceberInvoices = (invoices || [])
    .filter(i => i.tipo === "receita" && i.status !== "pago")
    .reduce((acc, curr) => acc + (curr.value || 0), 0);
  const totalReceber = totalReceberEvents + totalReceberInvoices;

  // Calculo de Custo Previsto de Obras (Custos previstos em todos os eventos + lançamentos de despesa a pagar)
  const totalCustoPrevistoEvents = events.reduce((acc, curr) => acc + (curr.custoPrevisto || 0), 0);
  const totalPagarInvoices = (invoices || [])
    .filter(i => i.tipo === "despesa" && i.status !== "pago")
    .reduce((acc, curr) => acc + (curr.value || 0), 0);
  const totalCustoPrevisto = totalCustoPrevistoEvents + totalPagarInvoices;
  const totalCustoRealizado = events.reduce((acc, curr) => acc + (curr.custoRealizado || 0), 0);
  const pendingChecklistItems = events.filter(isActive)
    .reduce((acc, curr) => acc + curr.checklist.filter(c => !c.done).length, 0);

  // KPIs Adicionais Requeridos
  const activeEventsList = events.filter(isActive);
  const avgCompletion = activeEventsList.length > 0 
    ? Math.round(activeEventsList.reduce((acc, curr) => acc + (curr.completionRate || 0), 0) / activeEventsList.length) 
    : 0;
  const totalReceitasPagas = invoices.filter(i => i.tipo === "receita" && i.status === "pago").reduce((acc, i) => acc + i.value, 0);
  const totalDespesasPagas = invoices.filter(i => i.tipo === "despesa" && i.status === "pago").reduce((acc, i) => acc + i.value, 0);
  const saldoEmCaixa = 148500 + totalReceitasPagas - totalDespesasPagas;
  const activeOsCount = activeEventsList.length;

  const upcoming = [...events]
    .filter(isActive)
    .sort((a, b) => new Date(a.dataMontagem).getTime() - new Date(b.dataMontagem).getTime())
    .slice(0, 5);

  const alerts: { type: "warn" | "info" | "danger"; msg: string; targetTab?: string; targetSubTab?: string; targetEvent?: Project }[] = [];
  if (lowStockItemsCount > 0)
    alerts.push({ type: "warn", msg: `${lowStockItemsCount} item(ns) no depósito abaixo do estoque mínimo.`, targetTab: "warehouse" });
  if (pendingDocsCount > 0)
    alerts.push({ type: "warn", msg: `${pendingDocsCount} documento(s) pendente(s) em projetos ativos.`, targetTab: "os" });

  // Alertas de Licenças NR-10 / NR-35 prestes a vencer ou vencidas
  const todayStr = new Date().toISOString().split("T")[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  (employees || []).forEach(emp => {
    if (emp.nr10Vencimento && emp.nr10Vencimento <= thirtyDaysLater) {
      alerts.push({
        type: emp.nr10Vencimento < todayStr ? "danger" : "warn",
        msg: `Licença NR-10 de ${emp.name} ${emp.nr10Vencimento < todayStr ? 'VENCIDA' : 'vence em breve'} (${emp.nr10Vencimento}).`,
        targetTab: "employees"
      });
    }
    if (emp.nr35Vencimento && emp.nr35Vencimento <= thirtyDaysLater) {
      alerts.push({
        type: emp.nr35Vencimento < todayStr ? "danger" : "warn",
        msg: `Licença NR-35 de ${emp.name} ${emp.nr35Vencimento < todayStr ? 'VENCIDA' : 'vence em breve'} (${emp.nr35Vencimento}).`,
        targetTab: "employees"
      });
    }
  });

  // Alertas de Contas a Pagar / Receber Vencidas
  (invoices || []).forEach(inv => {
    if (inv.status === "atrasado" || (inv.status === "pendente" && inv.date < todayStr)) {
      alerts.push({
        type: "danger",
        msg: `Fatura ${inv.tipo === "despesa" ? "a pagar" : "a receber"} VENCIDA: ${inv.description || inv.invoiceNumber} (R$ ${inv.value.toLocaleString("pt-BR")}).`,
        targetTab: "financial",
        targetSubTab: inv.tipo === "despesa" ? "pagar" : "receber"
      });
    }
  });
  
  events.filter(isActive).forEach(e => {
    const docs = e.docs?.filter(d => d.status === "pending") || [];
    if (docs.length > 0)
      alerts.push({ type: "danger", msg: `"${e.name}": ${docs.map(d => d.name).join(", ")}.`, targetEvent: e });
  });

  if (alerts.length === 0)
    alerts.push({ type: "info", msg: "Nenhum alerta crítico. Operação 100% estabilizada!" });

  const kpis = [
    {
      icon: <Briefcase size={22} />,
      label: "Total de Projetos / OS",
      value: String(activeOsCount),
      unit: "OS ativas no momento",
      bgGradient: "linear-gradient(135deg, #144580 0%, #1e3a8a 100%)",
      color: "#ffffff",
      action: () => onNavigateToTab("os"),
    },
    {
      icon: <DollarSign size={22} />,
      label: "Faturamento Comercial",
      value: fmt(totalContratado),
      unit: "projetos contratados em 2026",
      bgGradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      color: "#ffffff",
      action: () => onNavigateToTab("financial", "faturamento"),
    },
    {
      icon: <DollarSign size={22} />,
      label: "Saldo em Caixa",
      value: fmt(saldoEmCaixa),
      unit: "disponível em contas",
      bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "#ffffff",
      action: () => onNavigateToTab("financial", "fluxo"),
    },
    {
      icon: <CheckSquare size={22} />,
      label: "Taxa Conclusão Média",
      value: `${avgCompletion}%`,
      unit: "progresso médio das obras",
      bgGradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
      color: "#ffffff",
      action: () => onNavigateToTab("kanban"),
    },
    {
      icon: <TrendingUp size={22} />,
      label: "Contas a Receber",
      value: fmt(totalReceber),
      unit: "aguardando liquidação",
      bgGradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      color: "#ffffff",
      action: () => onNavigateToTab("financial", "receber"),
    },
    {
      icon: <Users size={22} />,
      label: "Montadores Escalados",
      value: String(employeesCount),
      unit: "equipe em campo",
      bgGradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
      color: "#ffffff",
      action: () => onNavigateToTab("employees", "cadastro"),
    },
    {
      icon: <Archive size={22} />,
      label: "Estoque & Alertas",
      value: String(lowStockItemsCount),
      unit: "itens em nível crítico",
      bgGradient: lowStockItemsCount > 0 ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" : "linear-gradient(135deg, #475569 0%, #334155 100%)",
      color: "#ffffff",
      action: () => onNavigateToTab("warehouse", "critico"),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "10px" }}>

      {/* Welcome & Quick Action Header */}
      <div style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
              Painel de Controle Executivo &amp; Indicadores
            </h2>
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#065f46",
              backgroundColor: "#d1fae5",
              padding: "3px 10px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} />
              Operação Ativa ({activeStands} Estandes)
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
            Resumo geral de projetos de cenografia, faturamento comercial, equipes de montagem e controle financeiro.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => onNavigateToTab("kanban")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#144580",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <Plus size={14} /> Novo Evento
          </button>

          <button
            onClick={() => onNavigateToTab("orcamentos")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <Plus size={14} /> Novo Orçamento
          </button>

          <button
            onClick={() => onOpenBankReconciliation ? onOpenBankReconciliation() : onNavigateToTab("financial", "conciliacao")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "var(--bg-main)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <DollarSign size={14} /> Conciliação Bancária
          </button>

          <button
            onClick={() => onNavigateToTab("os")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "var(--bg-main)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <FileText size={14} /> Nova Ordem de Serviço
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with Vibrant Gradient Badges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "16px" }}>
        {kpis.map((kpi, i) => (
          <div
            key={i}
            onClick={kpi.action}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "20px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxShadow: "var(--shadow-sm)",
              transition: "transform 0.15s, boxShadow 0.15s",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: kpi.bgGradient, color: kpi.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
              }}>
                {kpi.icon}
              </div>
              <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
            </div>

            <div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", lineHeight: 1.1 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", marginTop: "4px" }}>
                {kpi.unit}
              </div>
            </div>

            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-text)" }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Two-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>

        {/* Left Column: Projects List & Progress Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Projects List Card */}
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={18} style={{ color: "var(--accent)" }} />
                  Próximas Montagens e Obras de Cenografia
                </h3>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Estandes com montagem agendada e progresso de execução em tempo real.</p>
              </div>

              <button
                onClick={() => onNavigateToTab("kanban")}
                style={{ fontSize: "12px", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "700" }}
              >
                Ver todos <ChevronRight size={14} />
              </button>
            </div>

            {upcoming.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "32px 0", margin: 0 }}>
                Nenhum projeto ativo no momento.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {upcoming.map(evt => {
                  const tipo = evt.tipoEstande;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      style={{
                        backgroundColor: "var(--bg-main)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "16px 18px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                        <div>
                          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                            {evt.name}
                          </h4>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: "600" }}>{evt.client}</span>
                            {evt.nomeFeira && <><span>&bull;</span><MapPin size={11} /><span>{evt.nomeFeira}</span></>}
                            {evt.areaM2 && <><span>&bull;</span><span>{evt.areaM2}m²</span></>}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          {tipo && (
                            <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "12px", backgroundColor: tipoColor[tipo] + "20", color: tipoColor[tipo] }}>
                              {tipoLabel[tipo]}
                            </span>
                          )}
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "12px", backgroundColor: (phaseColor[evt.phase] || "#6d28d9") + "20", color: phaseColor[evt.phase] || "#6d28d9" }}>
                            {phaseLabel[evt.phase] || evt.phase}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <div style={{ flex: 1, height: "7px", borderRadius: "10px", backgroundColor: "var(--border)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: "10px",
                            background: "linear-gradient(90deg, var(--accent) 0%, #3b82f6 100%)",
                            width: `${evt.completionRate}%`
                          }} />
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-text)", minWidth: "32px" }}>
                          {evt.completionRate}%
                        </span>
                      </div>

                      {/* Date & Value */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> Montagem: <strong>{new Date(evt.dataMontagem).toLocaleDateString("pt-BR")}</strong>
                        </span>
                        <span style={{ fontWeight: "700", color: "#065f46", fontSize: "12px" }}>
                          {fmt(evt.valorContratado)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operational Workflow Summary Widget */}
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={16} style={{ color: "var(--accent)" }} /> Distribuição da Operação por Fase de Obra
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", textAlign: "center" }}>
              {[
                { phase: "Briefing", count: events.filter(e => e.phase === "Briefing").length, color: "#64748b" },
                { phase: "Orçamento", count: events.filter(e => e.phase === "Orçamento").length, color: "#2563eb" },
                { phase: "Aprovado", count: events.filter(e => e.phase === "Aprovado").length, color: "#059669" },
                { phase: "Produção", count: events.filter(e => e.phase === "Produção").length, color: "#d97706" },
                { phase: "Montagem", count: events.filter(e => e.phase === "Montagem" || e.phase === "during").length, color: "#dc2626" },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onNavigateToTab("kanban", item.phase)}
                  title={`Filtrar estandes em ${item.phase} no Kanban`}
                  style={{ 
                    backgroundColor: "var(--bg-main)", 
                    borderRadius: "10px", 
                    padding: "12px", 
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "transform 0.15s, borderColor 0.15s"
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = item.color;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ fontSize: "18px", fontWeight: "800", color: item.color }}>{item.count}</div>
                  <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-muted)", marginTop: "2px" }}>{item.phase}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Alerts & Financial Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Alerts Feed Widget */}
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={16} color="#d97706" /> Central de Alertas Críticos
              </h3>
              <span style={{ fontSize: "10px", fontWeight: "700", backgroundColor: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "10px" }}>
                {alerts.length} Notificações
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {alerts.slice(0, 5).map((a, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    if (a.targetEvent) onSelectEvent(a.targetEvent);
                    else if (a.targetTab) onNavigateToTab(a.targetTab, a.targetSubTab);
                  }}
                  style={{
                    display: "flex", gap: "10px", alignItems: "flex-start",
                    padding: "10px 12px", borderRadius: "10px",
                    backgroundColor: a.type === "danger" ? "#fef2f2" : a.type === "warn" ? "#fffbeb" : "#f0fdf4",
                    border: `1px solid ${a.type === "danger" ? "#fecaca" : a.type === "warn" ? "#fde68a" : "#bbf7d0"}`,
                    cursor: (a.targetEvent || a.targetTab) ? "pointer" : "default",
                    transition: "transform 0.1s"
                  }}
                >
                  <span style={{ fontSize: "14px", flexShrink: 0 }}>
                    {a.type === "danger" ? "🔴" : a.type === "warn" ? "⚠️" : "✅"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", color: "#1e293b", margin: 0, fontWeight: "600", lineHeight: "1.4" }}>{a.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Financial Health Card */}
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} style={{ color: "var(--accent)" }} /> Saúde Financeira &amp; Margem
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Total Faturado (2026)</span>
                <strong style={{ color: "var(--accent-text)" }}>{fmt(totalContratado)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Custo Realizado em Obras</span>
                <strong style={{ color: "#dc2626" }}>{fmt(totalCustoRealizado)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Margem Bruta Estimada</span>
                <strong style={{ color: "#065f46" }}>
                  {totalContratado > 0 ? (((totalContratado - totalCustoRealizado) / totalContratado) * 100).toFixed(1) : 60}%
                </strong>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab("financial")}
              style={{
                width: "100%", padding: "10px",
                backgroundColor: "var(--accent)", color: "#ffffff",
                border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
              }}
            >
              <DollarSign size={14} /> Abrir Módulo Financeiro
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
                  </tr>
                </thead>
                <tbody>
                  {events.filter(isActive).flatMap(evt => 
                    evt.assignedEmployees.map(emp => ({ ...emp, evt }))
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
