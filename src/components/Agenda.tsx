import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, Clock, Users, Truck, 
  Building2, Briefcase, DollarSign, ChevronLeft, ChevronRight, CheckSquare,
  Plus, Paperclip
} from "lucide-react";
import type { Project, Employee, InvoiceLog, LeadCRM, AgendaEventoIndependente } from "../types";

interface AgendaProps {
  events: Project[];
  employees: Employee[];
  invoices: InvoiceLog[];
  leads: LeadCRM[];
  onSelectEvent?: (event: Project) => void;
}

interface AgendaItem {
  id: string;
  tipo: "evento" | "equipe" | "logistica" | "crm" | "prazo" | "compra";
  titulo: string;
  data: string;
  horario?: string;
  cor: string;
  detalhe: string;
  project?: Project;
}

export default function Agenda({
  events,
  employees,
  invoices,
  leads,
  onSelectEvent
}: AgendaProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 18)); // July 18, 2026 (matching system seed dates)
  const [viewMode, setViewMode] = useState<"mes" | "semana" | "dia">("mes");

  // State for 3.1 independent agenda events
  const [eventosIndependentes, setEventosIndependentes] = useState<AgendaEventoIndependente[]>([
    {
      id: "ind-1",
      titulo: "Reunião de Alinhamento Feicon Natura",
      descricao: "Alinhamento das plantas 3D com o time de marketing da Natura.",
      data: "2026-07-21",
      horarioInicio: "14:00",
      horarioFim: "15:30",
      local: "Sala Reuniões Principal JC",
      responsavel: "JCEventos",
      participantes: "Mariana Souza, Jéssica Cenógrafa",
      prioridade: "alta",
      categoria: "reuniao",
      observacoes: "Levar projeto impresso A3.",
      anexoNome: "planta_final_natura.pdf"
    },
    {
      id: "ind-2",
      titulo: "Visita Técnica Pavilhão Anhembi",
      descricao: "Conferir pontos de energia e ancoragem no teto do pavilhão.",
      data: "2026-07-17",
      horarioInicio: "09:00",
      horarioFim: "12:00",
      local: "Pavilhão de Exposições Anhembi",
      responsavel: "Carlos Montador",
      participantes: "Ricardo Mendes",
      prioridade: "media",
      categoria: "visita_tecnica",
      observacoes: "Necessário retirar crachá de credenciamento na administração."
    }
  ]);

  const [isIndModalOpen, setIsIndModalOpen] = useState(false);
  
  // Independent event form states
  const [indTitulo, setIndTitulo] = useState("");
  const [indDesc, setIndDesc] = useState("");
  const [indData, setIndData] = useState("");
  const [indHorarioInicio, setIndHorarioInicio] = useState("");
  const [indHorarioFim, setIndHorarioFim] = useState("");
  const [indLocal, setIndLocal] = useState("");
  const [indResponsavel, setIndResponsavel] = useState("");
  const [indParticipantes, setIndParticipantes] = useState("");
  const [indPrioridade, setIndPrioridade] = useState<"baixa" | "media" | "alta">("media");
  const [indCategoria, setIndCategoria] = useState<"reuniao" | "visita_tecnica" | "lembrete" | "entrega" | "pagamento" | "compra" | "viagem" | "evento_interno">("reuniao");
  const [indObs, setIndObs] = useState("");
  const [indAnexo, setIndAnexo] = useState("");

  const handleAddIndEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indTitulo || !indData || !indHorarioInicio) return;
    const newInd: AgendaEventoIndependente = {
      id: `ind-${Date.now()}`,
      titulo: indTitulo,
      descricao: indDesc,
      data: indData,
      horarioInicio: indHorarioInicio,
      horarioFim: indHorarioFim || indHorarioInicio,
      local: indLocal || "Remoto / Escritório",
      responsavel: indResponsavel || "JCEventos",
      participantes: indParticipantes || "Nenhum",
      prioridade: indPrioridade,
      categoria: indCategoria,
      observacoes: indObs,
      anexoNome: indAnexo
    };

    setEventosIndependentes([...eventosIndependentes, newInd]);

    // Reset Form
    setIndTitulo("");
    setIndDesc("");
    setIndData("");
    setIndHorarioInicio("");
    setIndHorarioFim("");
    setIndLocal("");
    setIndResponsavel("");
    setIndParticipantes("");
    setIndPrioridade("media");
    setIndCategoria("reuniao");
    setIndObs("");
    setIndAnexo("");
    setIsIndModalOpen(false);
    alert("Registro independente criado com sucesso!");
  };
  
  // Filter checkboxes
  const [filters, setFilters] = useState({
    evento: true,
    equipe: true,
    logistica: true,
    crm: true,
    prazo: true,
    compra: true
  });

  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);

  // Generate All Calendar Items based on actual data
  const calendarItems: AgendaItem[] = [];

  // 1. Integrando Eventos / OS
  events.forEach(evt => {
    calendarItems.push({
      id: `evt-start-${evt.id}`,
      tipo: "evento",
      titulo: `Início: ${evt.name}`,
      data: evt.startDate,
      horario: "08:00",
      cor: "var(--accent)",
      detalhe: `Evento: ${evt.name} | Cliente: ${evt.client} | Local: ${evt.mapsRoute.endereco}`,
      project: evt
    });
    calendarItems.push({
      id: `evt-montagem-${evt.id}`,
      tipo: "prazo",
      titulo: `Montagem: ${evt.name}`,
      data: evt.dataMontagem,
      horario: "07:00",
      cor: "var(--accent-secondary)",
      detalhe: `Período operacional de montagem estrutural cenográfica.`,
      project: evt
    });
    calendarItems.push({
      id: `evt-desmont-${evt.id}`,
      tipo: "prazo",
      titulo: `Desmontagem: ${evt.name}`,
      data: evt.dataDesmontagem,
      horario: "19:00",
      cor: "#6e6e6e",
      detalhe: `Retirada de cenografia e transporte de retorno ao depósito.`,
      project: evt
    });
  });

  // 2. Integrando Escalas de Equipes
  events.forEach(evt => {
    evt.assignedEmployees.forEach(emp => {
      calendarItems.push({
        id: `emp-scale-${evt.id}-${emp.id}`,
        tipo: "equipe",
        titulo: `Escala: ${emp.name}`,
        data: evt.dataMontagem, // escalado para a montagem
        horario: "07:30",
        cor: "var(--success-text)",
        detalhe: `Colaborador ${emp.name} escalado para montagem do estande em ${evt.name}. Cargo: ${emp.role}.`
      });
    });
  });

  // 3. Integrando CRM (Reuniões de leads)
  leads.forEach(lead => {
    if (lead.followUpDate) {
      calendarItems.push({
        id: `crm-follow-${lead.id}`,
        tipo: "crm",
        titulo: `Follow-up: ${lead.empresa}`,
        data: lead.followUpDate,
        horario: "14:00",
        cor: "#c084fc", // purple
        detalhe: `Entrar em contato com ${lead.contato} (${lead.cargo}) para follow-up de negociação de stand. Fone: ${lead.telefone}`
      });
    }
    // Simulate a few lead meeting/call schedules
    if (lead.estagio === "orcamento") {
      calendarItems.push({
        id: `crm-meet-${lead.id}`,
        tipo: "crm",
        titulo: `Reunião Stand: ${lead.empresa}`,
        data: "2026-07-22", // specific date
        horario: "10:30",
        cor: "#c084fc",
        detalhe: `Reunião para fechamento do escopo técnico do stand de ${lead.empresa}.`
      });
    }
  });

  // 4. Integrando Entregas (Logística / Viagem)
  events.forEach(evt => {
    if (evt.hotelCheckin) {
      calendarItems.push({
        id: `log-hotel-${evt.id}`,
        tipo: "logistica",
        titulo: `Check-in Hotel: ${evt.name}`,
        data: evt.hotelCheckin,
        horario: "12:00",
        cor: "#f59e0b", // yellow-gold
        detalhe: `Hospedagem da equipe técnica. Hotel: ${evt.hotelName}.`
      });
    }
  });

  // 5. Integrando Compras (Financeiro)
  invoices.forEach(inv => {
    if (inv.tipo === "despesa") {
      calendarItems.push({
        id: `fin-pay-${inv.id}`,
        tipo: "compra",
        titulo: `Pagar: NF-${inv.invoiceNumber}`,
        data: inv.date,
        horario: "16:00",
        cor: "var(--danger)",
        detalhe: `Vencimento de fatura de fornecedor: ${inv.vendor}. Categoria: ${inv.categoria}. Valor: R$ ${inv.value.toFixed(2)}`
      });
    }
  });

  // 6. Integrando Eventos Independentes
  eventosIndependentes.forEach(ind => {
    const catColors = {
      reuniao: "#c084fc", // purple
      visita_tecnica: "#38bdf8", // light blue
      lembrete: "#fca5a5", // pink
      entrega: "#fbbf24", // orange
      pagamento: "#10b981", // emerald green
      compra: "#3b82f6", // blue
      viagem: "#ec4899", // magenta
      evento_interno: "#6b7280" // gray
    };
    const catTypes: Record<string, "evento" | "equipe" | "logistica" | "crm" | "prazo" | "compra"> = {
      reuniao: "crm",
      visita_tecnica: "crm",
      lembrete: "prazo",
      entrega: "logistica",
      pagamento: "compra",
      compra: "compra",
      viagem: "logistica",
      evento_interno: "evento"
    };

    calendarItems.push({
      id: `ind-event-${ind.id}`,
      tipo: catTypes[ind.categoria] || "evento",
      titulo: ind.titulo,
      data: ind.data,
      horario: ind.horarioInicio,
      cor: catColors[ind.categoria] || "#6e6e6e",
      detalhe: `${ind.descricao || "Sem descrição"} | Local: ${ind.local} | Resp: ${ind.responsavel} | Participantes: ${ind.participantes} | Prioridade: ${ind.prioridade.toUpperCase()}`
    });
  });

  // Filters apply
  const filteredItems = calendarItems.filter(item => filters[item.tipo]);

  // Date manipulation helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const addWeeks = (date: Date, weeks: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
  };

  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const isSameDay = (d1: Date, dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return false;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return d1.getFullYear() === year && d1.getMonth() === month && d1.getDate() === day;
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Month navigation labels
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Month Grid rendering helper
  const renderMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const cells = [];
    
    // Fill empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }
    
    // Fill days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(year, month, day);
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const dayItems = filteredItems.filter(item => isSameDay(thisDate, item.data));

      cells.push(
        <div key={`day-${day}`} className={`calendar-cell ${isSameDay(new Date(2026, 6, 18), dayStr) ? "today" : ""}`}>
          <span className="cell-day-num">{day}</span>
          <div className="cell-items-container">
            {dayItems.slice(0, 3).map(item => (
              <div 
                key={item.id} 
                className={`event-badge event-type-${item.tipo}`}
                onClick={() => setSelectedItem(item)}
                title={item.titulo}
              >
                <span className="dot-item-title">{item.titulo}</span>
              </div>
            ))}
            {dayItems.length > 3 && (
              <span className="text-xs font-semibold text-muted" style={{ fontSize: "9px", display: "block", marginTop: "2px" }}>
                + {dayItems.length - 3} mais
              </span>
            )}
          </div>
        </div>
      );
    }
    
    return cells;
  };

  // Week Grid rendering helper
  const renderWeekGrid = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const thisDate = addDays(startOfWeek, i);
      const dayStr = `${thisDate.getFullYear()}-${String(thisDate.getMonth() + 1).padStart(2, '0')}-${String(thisDate.getDate()).padStart(2, '0')}`;
      const dayItems = filteredItems.filter(item => isSameDay(thisDate, item.data));
      
      days.push(
        <div key={`week-day-${i}`} className="calendar-week-col">
          <div className="week-col-header" style={{
            background: isSameDay(new Date(2026, 6, 18), dayStr) ? "var(--accent-glow)" : "none",
            borderBottom: isSameDay(new Date(2026, 6, 18), dayStr) ? "2px solid var(--accent)" : "1px solid var(--border)"
          }}>
            <strong className="text-sm block">{thisDate.toLocaleDateString("pt-BR", { weekday: "short" })}</strong>
            <span className="text-xs text-muted block">{thisDate.getDate()}</span>
          </div>
          <div className="week-col-body" style={{ flexGrow: 1, padding: "8px" }}>
             {dayItems.map(item => (
              <div 
                key={item.id} 
                className={`event-badge event-type-${item.tipo}`}
                style={{ marginBottom: "8px" }}
                onClick={() => setSelectedItem(item)}
              >
                <div style={{ display: "flex", gap: "4px", color: "inherit", opacity: 0.85, fontWeight: "600", marginBottom: "2px" }}>
                  <Clock size={10} style={{ marginTop: "1px" }} />
                  <span>{item.horario || "Dia todo"}</span>
                </div>
                <strong>{item.titulo}</strong>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  // Day list rendering
  const renderDayView = () => {
    const dayItems = filteredItems.filter(item => isSameDay(currentDate, item.data));

    return (
      <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", color: "var(--text-primary)" }}>
        <h4 className="text-sm font-semibold" style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "10px", marginBottom: "16px" }}>
          <CalendarIcon size={16} /> compromissos de {currentDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {dayItems.length === 0 ? (
            <p className="text-muted text-center" style={{ padding: "40px 0" }}>Nenhum compromisso cadastrado para esta data.</p>
          ) : (
            dayItems.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{ 
                  display: "flex", 
                  gap: "16px", 
                  padding: "16px", 
                  borderRadius: "8px", 
                  border: "1px solid var(--border)", 
                  borderLeft: `5px solid ${item.cor}`,
                  background: "rgba(0,0,0,0.01)",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "600", width: "100px", borderRight: "1px solid var(--border)" }}>
                  <Clock size={14} />
                  <span>{item.horario || "Dia todo"}</span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <strong className="text-sm">{item.titulo}</strong>
                  <p className="text-xs text-muted" style={{ marginTop: "4px" }}>{item.detalhe}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "24px", padding: "10px" }}>
      {/* Left Sidebar: Filter panel and Integrations info */}
      <div className="section-box" style={{ height: "auto" }}>
        <h3 className="section-box-title" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <CalendarIcon size={16} style={{ color: "var(--accent)" }} />
          Filtros da Agenda
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "16px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={filters.evento} 
              onChange={() => setFilters({ ...filters, evento: !filters.evento })}
            />
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent)" }}></span>
            Eventos JC (Show/Feira)
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={filters.equipe} 
              onChange={() => setFilters({ ...filters, equipe: !filters.equipe })}
            />
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "var(--success-text)" }}></span>
            Escala de Equipes
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={filters.logistica} 
              onChange={() => setFilters({ ...filters, logistica: !filters.logistica })}
            />
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }}></span>
            Viagens e Logística
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={filters.crm} 
              onChange={() => setFilters({ ...filters, crm: !filters.crm })}
            />
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#c084fc" }}></span>
            CRM: Reuniões / Visitas
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={filters.prazo} 
              onChange={() => setFilters({ ...filters, prazo: !filters.prazo })}
            />
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-secondary)" }}></span>
            Prazos de OS (Desmontagem)
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={filters.compra} 
              onChange={() => setFilters({ ...filters, compra: !filters.compra })}
            />
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "var(--danger)" }}></span>
            Compras e Financeiro
          </label>
        </div>

        <div style={{ padding: "10px", borderRadius: "8px", background: "var(--bg-main)", fontSize: "11px", color: "var(--text-secondary)" }}>
          <strong className="block" style={{ marginBottom: "4px" }}>Nota de Integração</strong>
          A agenda consolida cronogramas da montagem de stands, rotas de frotas e viagens da equipe técnica, faturas financeiras e contatos de leads em um único ponto estratégico de visualização.
        </div>
      </div>

      {/* Right Column: Calendar Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Calendar Nav Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", padding: "12px 20px", borderRadius: "12px", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="btn-secondary btn-sm" onClick={() => {
              if (viewMode === "mes") setCurrentDate(addMonths(currentDate, -1));
              else if (viewMode === "semana") setCurrentDate(addWeeks(currentDate, -1));
              else setCurrentDate(addDays(currentDate, -1));
            }}>
              <ChevronLeft size={16} />
            </button>
            <h3 style={{ fontSize: "16px", fontWeight: "700", minWidth: "160px", textAlign: "center" }}>
              {viewMode === "mes" && `${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`}
              {viewMode === "semana" && `Semana de ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`}
              {viewMode === "dia" && `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h3>
            <button className="btn-secondary btn-sm" onClick={() => {
              if (viewMode === "mes") setCurrentDate(addMonths(currentDate, 1));
              else if (viewMode === "semana") setCurrentDate(addWeeks(currentDate, 1));
              else setCurrentDate(addDays(currentDate, 1));
            }}>
              <ChevronRight size={16} />
            </button>
            <button className="btn-secondary btn-sm" onClick={() => setCurrentDate(new Date(2026, 6, 18))}>Hoje</button>
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button 
              className="btn-primary btn-sm" 
              onClick={() => setIsIndModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "var(--accent)" }}
            >
              <Plus size={14} /> Novo Compromisso
            </button>
            <button className={`btn-${viewMode === "mes" ? "primary" : "secondary"} btn-sm`} onClick={() => setViewMode("mes")}>Mensal</button>
            <button className={`btn-${viewMode === "semana" ? "primary" : "secondary"} btn-sm`} onClick={() => setViewMode("semana")}>Semanal</button>
            <button className={`btn-${viewMode === "dia" ? "primary" : "secondary"} btn-sm`} onClick={() => setViewMode("dia")}>Diário</button>
          </div>
        </div>

        {/* Calendar Body Rendering */}
        {viewMode === "mes" && (
          <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", color: "var(--text-primary)" }}>
            {/* Weekdays Labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "var(--bg-main)", borderBottom: "1px solid var(--border)", textAlign: "center", fontWeight: "600", fontSize: "12px", padding: "8px 0" }}>
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>
            {/* Days Grid */}
            <div className="calendar-month-grid-wrapper">
              {renderMonthGrid()}
            </div>
          </div>
        )}

        {viewMode === "semana" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", background: "var(--bg-card)", color: "var(--text-primary)" }}>
            {renderWeekGrid()}
          </div>
        )}

        {viewMode === "dia" && renderDayView()}

      </div>

      {/* DETAIL MODAL POPUP */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: `3px solid ${selectedItem.cor}` }}>
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {selectedItem.tipo === "evento" && <Briefcase size={18} />}
                {selectedItem.tipo === "equipe" && <Users size={18} />}
                {selectedItem.tipo === "logistica" && <Truck size={18} />}
                {selectedItem.tipo === "crm" && <Building2 size={18} />}
                {selectedItem.tipo === "prazo" && <CheckSquare size={18} />}
                {selectedItem.tipo === "compra" && <DollarSign size={18} />}
                {selectedItem.titulo}
              </h3>
              <button className="modal-close" onClick={() => setSelectedItem(null)}>X</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px", color: "var(--text-secondary)", fontSize: "13px" }}>
                <Clock size={16} />
                <span><strong>Data:</strong> {selectedItem.data} às {selectedItem.horario || "Dia todo"}</span>
              </div>
              
              <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", background: "var(--bg-main)", fontSize: "13px", marginBottom: "16px" }}>
                <strong>Descrição/Detalhamento:</strong>
                <p style={{ marginTop: "4px" }}>{selectedItem.detalhe}</p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                {selectedItem.project && onSelectEvent && (
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={() => {
                      const proj = selectedItem.project!;
                      setSelectedItem(null);
                      onSelectEvent(proj);
                    }}
                  >
                    Editar / Ver Projeto no ERP
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setSelectedItem(null)}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INDEPENDENT EVENT MODAL */}
      {isIndModalOpen && (
        <div className="modal-overlay" onClick={() => setIsIndModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "550px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Novo Registro na Agenda</h3>
              <button className="modal-close" onClick={() => setIsIndModalOpen(false)}>X</button>
            </div>
            <form onSubmit={handleAddIndEvent} className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Categoria</label>
                  <select value={indCategoria} onChange={(e) => setIndCategoria(e.target.value as any)}>
                    <option value="reuniao">🤝 Reunião</option>
                    <option value="visita_tecnica">🚗 Visita Técnica</option>
                    <option value="lembrete">💡 Lembrete / Alerta</option>
                    <option value="entrega">🚚 Entrega de Mobiliário</option>
                    <option value="pagamento">💰 Pagamento Administrativo</option>
                    <option value="compra">🛒 Compra de Insumos</option>
                    <option value="viagem">✈️ Viagem de Equipe</option>
                    <option value="evento_interno">🏢 Evento Interno / Treinamento</option>
                  </select>
                </div>
                <div className="field">
                  <label>Título do Registro</label>
                  <input type="text" value={indTitulo} onChange={(e) => setIndTitulo(e.target.value)} placeholder="Ex: Fechamento Contrato Natura" required />
                </div>
              </div>

              <div className="field" style={{ marginTop: "8px" }}>
                <label>Descrição do Escopo / Objetivos</label>
                <textarea value={indDesc} onChange={(e) => setIndDesc(e.target.value)} placeholder="Ex: Detalhes sobre o que precisa ser feito ou discutido..." rows={2} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "8px" }}>
                <div className="field">
                  <label>Data</label>
                  <input type="date" value={indData} onChange={(e) => setIndData(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Hora Início</label>
                  <input type="time" value={indHorarioInicio} onChange={(e) => setIndHorarioInicio(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Hora Término</label>
                  <input type="time" value={indHorarioFim} onChange={(e) => setIndHorarioFim(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
                <div className="field">
                  <label>Local / Link da Reunião</label>
                  <input type="text" value={indLocal} onChange={(e) => setIndLocal(e.target.value)} placeholder="Ex: Sala 2 / Link Meet" />
                </div>
                <div className="field">
                  <label>Responsável JC</label>
                  <input type="text" value={indResponsavel} onChange={(e) => setIndResponsavel(e.target.value)} placeholder="Ex: JCEventos" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
                <div className="field">
                  <label>Participantes / Convidados</label>
                  <input type="text" value={indParticipantes} onChange={(e) => setIndParticipantes(e.target.value)} placeholder="Nomes separados por vírgula" />
                </div>
                <div className="field">
                  <label>Prioridade</label>
                  <select value={indPrioridade} onChange={(e) => setIndPrioridade(e.target.value as any)}>
                    <option value="baixa">🟢 Baixa</option>
                    <option value="media">🟡 Média</option>
                    <option value="alta">🔴 Alta</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px", marginTop: "8px" }}>
                <div className="field">
                  <label>Observações Adicionais</label>
                  <input type="text" value={indObs} onChange={(e) => setIndObs(e.target.value)} placeholder="Qualquer ponto de atenção..." />
                </div>
                <div className="field">
                  <label>Simular Arquivo Anexo</label>
                  <input type="text" value={indAnexo} onChange={(e) => setIndAnexo(e.target.value)} placeholder="Ex: briefing.pdf" />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsIndModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Adicionar à Agenda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
