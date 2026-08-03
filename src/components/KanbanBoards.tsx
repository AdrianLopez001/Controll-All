import { useState, useRef, type FormEvent } from "react";
import { 
  Calendar, Plus, MapPin, ChevronDown, ChevronUp, FileText, 
  Trash2, CheckSquare, ArrowRight, ArrowLeft, Move, Filter, 
  Search, Building2, Layers, DollarSign
} from "lucide-react";
import type { Project } from "../types";

interface KanbanBoardsProps {
  events: Project[];
  onSelectEvent: (event: Project) => void;
  onAddEvent: (name: string, client: string, startDate: string, extra?: Partial<Project>) => void;
  onUpdateEventPhase: (id: string, phase: any) => void;
  onDeleteEvent?: (id: string) => void;
  onReorderEvents?: (reorderedEvents: Project[]) => void;
}

export default function KanbanBoards({ 
  events, 
  onSelectEvent, 
  onAddEvent,
  onUpdateEventPhase,
  onDeleteEvent,
  onReorderEvents
}: KanbanBoardsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);
  
  // Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [nomeFeira, setNomeFeira] = useState("");
  const [cidadeEvento, setCidadeEvento] = useState("Recife / PE");
  const [valorContratado, setValorContratado] = useState(35000);

  // Drag and Drop State
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const cardDragTimestampRef = useRef<number>(0);

  const toggleExpandCard = (id: string) => {
    setExpandedCardIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCardClick = (e: React.MouseEvent, event: Project) => {
    if (Date.now() - cardDragTimestampRef.current < 800) {
      return; // Ignore click right after drag-and-drop
    }
    onSelectEvent(event);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !client || !startDate) return;
    onAddEvent(name, client, startDate, {
      nomeFeira: nomeFeira || name,
      cidadeEvento,
      valorContratado
    });
    setName("");
    setClient("");
    setStartDate("");
    setNomeFeira("");
    setShowAddForm(false);
  };

  // Filter events strictly by Name search and Date search
  let displayedEvents = events.filter(e => {
    const matchesSearch = searchTerm === "" ? true : 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.nomeFeira && e.nomeFeira.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = searchDate === "" ? true :
      (e.startDate && e.startDate.includes(searchDate)) || (e.endDate && e.endDate.includes(searchDate));

    return matchesSearch && matchesDate;
  });

  // Define 6 Discrete Kanban Phases as per Requirement 3
  const SIX_PHASES = [
    { key: "Pré-Evento", name: "1. Pré-Evento", color: "#2563eb", match: ["no_event", "Briefing", "Orçamento", "Pré-Evento", "Planejamento"] },
    { key: "Produção", name: "2. Produção", color: "#d97706", match: ["Produção", "Em Produção"] },
    { key: "Montagem", name: "3. Montagem", color: "#dc2626", match: ["Montagem", "Em Montagem"] },
    { key: "Evento", name: "4. Evento", color: "#16a34a", match: ["Evento", "Em Evento", "during", "Aprovado", "Execução"] },
    { key: "Desmontagem", name: "5. Desmontagem", color: "#ea580c", match: ["Desmontagem"] },
    { key: "Finalizado", name: "6. Finalizado", color: "#475569", match: ["Finalizado", "post", "Pós-Evento", "Concluído"] }
  ] as const;

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    cardDragTimestampRef.current = Date.now();
    e.dataTransfer.setData("text/plain", id);
    setDraggedCardId(id);
  };

  const handleDragEnd = () => {
    cardDragTimestampRef.current = Date.now();
    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    cardDragTimestampRef.current = Date.now();
    if (dragOverColumn !== colName) setDragOverColumn(colName);
  };

  const handleDrop = (e: React.DragEvent, targetPhase: string) => {
    e.preventDefault();
    cardDragTimestampRef.current = Date.now();
    const id = e.dataTransfer.getData("text/plain") || draggedCardId;
    if (!id) return;

    const draggedItem = events.find(x => x.id === id);
    if (!draggedItem) return;

    if (draggedItem.phase !== targetPhase) {
      onUpdateEventPhase(id, targetPhase);
    }

    if (onReorderEvents) {
      const remaining = events.filter(x => x.id !== id);
      const updatedItem = { ...draggedItem, phase: targetPhase };
      remaining.push(updatedItem);
      onReorderEvents(remaining);
    }

    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const renderCard = (event: Project, index: number, list: Project[], columnPhase: string) => {
    const totalTasks = event.checklist.length;
    const completedTasks = event.checklist.filter((c) => c.done).length;
    const isExpanded = expandedCardIds.includes(event.id);
    const linkedSameFeira = events.filter(e => (e.nomeFeira || e.name) === (event.nomeFeira || event.name));

    return (
      <div 
        key={event.id} 
        className="kanban-card"
        draggable
        onDragStart={(e) => handleDragStart(e, event.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => handleDrop(e, columnPhase)}
        style={{
          cursor: "grab",
          userSelect: "none",
          backgroundColor: "var(--bg-card)",
          borderRadius: "14px",
          border: isExpanded ? "2px solid var(--accent)" : "1px solid var(--border)",
          padding: "14px",
          marginBottom: "12px",
          boxShadow: isExpanded ? "var(--shadow-md)" : "var(--shadow-sm)",
          borderLeft: "5px solid var(--accent)",
          transition: "all 0.15s ease",
          opacity: draggedCardId === event.id ? 0.4 : 1
        }}
      >
        {/* Card Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Move size={14} style={{ color: "var(--text-muted)", cursor: "grab" }} />
            <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--accent)", background: "var(--accent-glow)", padding: "2px 8px", borderRadius: "6px" }}>
              {event.codigo}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleExpandCard(event.id); }}
            style={{ background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: "6px", padding: "2px 6px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: "var(--accent)" }}
            title="Expandir mais detalhes"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Card Title & Info */}
        <div onClick={(e) => handleCardClick(e, event)} style={{ cursor: "pointer" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 4px 0", lineHeight: "1.3" }}>
            {event.name}
          </h4>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            Cliente: <strong style={{ color: "var(--text-primary)" }}>{event.client}</strong>
          </div>

          {event.nomeFeira && event.nomeFeira !== event.name && (
            <div style={{ fontSize: "11px", color: "var(--accent)", fontWeight: "600", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
              📍 <span>{event.nomeFeira}</span> {event.cidadeEvento ? `(${event.cidadeEvento})` : ""}
            </div>
          )}
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={12} />
              <span>{event.startDate}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "700", color: completedTasks === totalTasks && totalTasks > 0 ? "#059669" : "var(--text-primary)" }}>
              <CheckSquare size={12} />
              <span>{completedTasks}/{totalTasks} tarefas</span>
            </div>
          </div>
        </div>

        {/* Expanded Details Section */}
        {isExpanded && (
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--border)", display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
            <div style={{ backgroundColor: "var(--bg-main)", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-muted)", display: "block" }}>Valor do Contrato:</span>
              <strong style={{ color: "#059669", fontSize: "13px" }}>{formatCurrency(event.valorContratado)}</strong>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Área / Tipo:</span>
                <strong>{event.tipoEstande || "Misto"} {event.areaM2 ? `(${event.areaM2}m²)` : ""}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Estandes no Evento:</span>
                <strong>{linkedSameFeira.length} estande(s)</strong>
              </div>
            </div>

            <button 
              className="btn-primary text-xs" 
              onClick={(e) => { e.stopPropagation(); onSelectEvent(event); }}
              style={{ padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "4px" }}
            >
              <FileText size={12} /> Ficha Completa do Estande
            </button>
          </div>
        )}

        {/* Phase Navigation Shortcuts */}
        <div style={{ display: "flex", gap: "6px", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "10px" }}>
          {columnPhase !== "Briefing" && columnPhase !== "no_event" && (
            <button 
              className="btn-secondary text-xs" 
              style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "2px" }}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateEventPhase(event.id, columnPhase === "during" ? "no_event" : "during");
              }}
              title="Voltar fase"
            >
              <ArrowLeft size={11} /> Voltar
            </button>
          )}
          {columnPhase !== "post" && columnPhase !== "Finalizado" && (
            <button 
              className="btn-primary text-xs" 
              style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "2px", marginLeft: "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateEventPhase(event.id, columnPhase === "no_event" || columnPhase === "Briefing" ? "during" : "post");
              }}
              title="Avançar fase"
            >
              Avançar <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header & Search by Name/Date Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", background: "var(--bg-card)", padding: "18px 20px", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={20} style={{ color: "var(--accent)" }} /> Quadro Kanban de Eventos
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Acompanhamento visual de todas as etapas dos eventos (Planejamento, Execução e Desmontagem).
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search by Name */}
            <div style={{ position: "relative", width: "220px" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                type="text" 
                placeholder="Buscar por Nome do Evento ou Cliente..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px", backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Filter by Date */}
            <div style={{ position: "relative" }}>
              <input 
                type="date"
                title="Filtrar por Data do Evento"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", cursor: "pointer" }}
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate("")}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "var(--danger)", marginLeft: "4px" }}
                  title="Limpar filtro de data"
                >
                  ✕ Limpar
                </button>
              )}
            </div>

            <button className="btn-primary" onClick={() => setShowAddForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "8px 16px", fontWeight: "700" }}>
              <Plus size={16} /> Criar Novo Evento
            </button>
          </div>
        </div>
      </div>

      {/* 6-COLUMN KANBAN BOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", alignItems: "start", overflowX: "auto", paddingBottom: "16px" }}>
        {SIX_PHASES.map((col) => {
          const colList = displayedEvents.filter((e) => (col.match as readonly string[]).includes(e.phase));
          return (
            <div 
              key={col.key}
              className="kanban-col"
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDrop={(e) => handleDrop(e, col.key)}
              style={{
                backgroundColor: dragOverColumn === col.key ? "var(--accent-glow)" : "var(--bg-kanban-col)",
                borderRadius: "16px",
                padding: "16px",
                border: "1px solid var(--border)",
                minHeight: "500px",
                display: "flex",
                flexDirection: "column",
                transition: "background-color 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: col.color }}></span>
                  {col.name}
                </h3>
                <span style={{ fontSize: "12px", fontWeight: "800", color: col.color, backgroundColor: col.color + "20", padding: "2px 8px", borderRadius: "12px" }}>
                  {colList.length}
                </span>
              </div>

              {colList.length === 0 ? (
                <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", border: "1px dashed var(--border)", borderRadius: "12px" }}>
                  Nenhum estande nesta fase
                </div>
              ) : (
                colList.map((evt, idx) => renderCard(evt, idx, colList, col.key))
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: ADICIONAR NOVO ESTANDE / EVENTO */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Novo Estande / Evento</h3>
            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div className="field">
                <label>Nome do Evento / Feira Principal</label>
                <input
                  type="text"
                  placeholder="Ex: Congresso Médico RN 2026"
                  value={nomeFeira}
                  onChange={(e) => setNomeFeira(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Nome do Estande / Projeto *</label>
                <input
                  type="text"
                  placeholder="Ex: Stand Unimed 45m²"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Cliente / Empresa *</label>
                <input
                  type="text"
                  placeholder="Ex: Unimed Natal Cooperativa"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  required
                />
              </div>

              <div className="responsive-layout-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="field">
                  <label>Data Início *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Valor Contratado (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={valorContratado}
                    onChange={(e) => setValorContratado(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Estande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
