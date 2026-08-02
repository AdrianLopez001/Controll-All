import { useState, useRef, type FormEvent } from "react";
import { Plus, Calendar, CheckSquare, ArrowRight, ArrowLeft, Move, Filter } from "lucide-react";
import type { Project } from "../types";

interface KanbanBoardsProps {
  events: Project[];
  onSelectEvent: (event: Project) => void;
  onAddEvent: (name: string, client: string, startDate: string) => void;
  onUpdateEventPhase: (id: string, phase: any) => void;
  onDeleteEvent?: (id: string) => void;
  onReorderEvents?: (reorderedEvents: Project[]) => void;
}

export default function KanbanBoards({ 
  events, 
  onSelectEvent, 
  onAddEvent,
  onUpdateEventPhase,
  onReorderEvents,
}: KanbanBoardsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedFeiraFilter, setSelectedFeiraFilter] = useState<string>("all");
  const [selectedEventIdFilter, setSelectedEventIdFilter] = useState<string>("all");
  const [activeMobileColumn, setActiveMobileColumn] = useState<"no_event" | "during" | "post">("no_event");

  // Drag and Drop state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const cardDragTimestampRef = useRef<number>(0);

  const handleCardClick = (e: React.MouseEvent, event: Project) => {
    if (Date.now() - cardDragTimestampRef.current < 800) {
      return; // Ignore synthetic click after drag and drop
    }
    onSelectEvent(event);
  };

  // Extract unique Feiras / Eventos Principais
  const uniqueFeiras = Array.from(
    new Set(events.map(e => e.nomeFeira || e.name).filter(Boolean))
  );

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !client || !startDate) return;
    onAddEvent(name, client, startDate);
    setName("");
    setClient("");
    setStartDate("");
    setShowAddForm(false);
  };

  // Filter events by selected Feira/Evento AND selected individual stand
  let displayedEvents = events;
  if (selectedFeiraFilter !== "all") {
    displayedEvents = displayedEvents.filter(e => (e.nomeFeira || e.name) === selectedFeiraFilter);
  }
  if (selectedEventIdFilter !== "all") {
    displayedEvents = displayedEvents.filter(e => e.id === selectedEventIdFilter);
  }

  // Active selected Feira statistics
  const currentFeiraObj = events.find(e => (e.nomeFeira || e.name) === selectedFeiraFilter);

  // Filter events by phase accurately
  const noEventPhases = ["no_event", "Briefing", "Orçamento", "Pré-Evento"];
  const duringPhases = ["during", "Produção", "Montagem", "Evento", "Aprovado"];
  const postPhases = ["post", "Desmontagem", "Finalizado"];

  const noEventList = displayedEvents.filter((e) => noEventPhases.includes(e.phase));
  const duringList = displayedEvents.filter((e) => duringPhases.includes(e.phase));
  const postList = displayedEvents.filter((e) => postPhases.includes(e.phase) || (!noEventPhases.includes(e.phase) && !duringPhases.includes(e.phase)));

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

  const handleCardDrop = (e: React.DragEvent, targetCard: Project, targetPhase: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("text/plain") || draggedCardId;
    if (!draggedId || draggedId === targetCard.id) {
      setDraggedCardId(null);
      setDragOverColumn(null);
      return;
    }

    const draggedItem = events.find(x => x.id === draggedId);
    if (!draggedItem) return;

    if (draggedItem.phase !== targetPhase) {
      onUpdateEventPhase(draggedId, targetPhase);
    }

    if (onReorderEvents) {
      const listWithoutDragged = events.filter(x => x.id !== draggedId);
      const targetIndex = listWithoutDragged.findIndex(x => x.id === targetCard.id);
      if (targetIndex !== -1) {
        const updatedItem = { ...draggedItem, phase: targetPhase };
        listWithoutDragged.splice(targetIndex, 0, updatedItem);
        onReorderEvents(listWithoutDragged);
      }
    }

    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const moveCardUp = (list: Project[], index: number) => {
    if (index <= 0) return;
    const item = list[index];
    const prevItem = list[index - 1];

    const itemIdx = events.findIndex(e => e.id === item.id);
    const prevIdx = events.findIndex(e => e.id === prevItem.id);

    if (itemIdx !== -1 && prevIdx !== -1 && onReorderEvents) {
      const updated = [...events];
      const temp = updated[itemIdx];
      updated[itemIdx] = updated[prevIdx];
      updated[prevIdx] = temp;
      onReorderEvents(updated);
    }
  };

  const moveCardDown = (list: Project[], index: number) => {
    if (index >= list.length - 1) return;
    const item = list[index];
    const nextItem = list[index + 1];

    const itemIdx = events.findIndex(e => e.id === item.id);
    const nextIdx = events.findIndex(e => e.id === nextItem.id);

    if (itemIdx !== -1 && nextIdx !== -1 && onReorderEvents) {
      const updated = [...events];
      const temp = updated[itemIdx];
      updated[itemIdx] = updated[nextIdx];
      updated[nextIdx] = temp;
      onReorderEvents(updated);
    }
  };

  const renderCard = (event: Project, index: number, list: Project[], columnPhase: string) => {
    const totalTasks = event.checklist.length;
    const completedTasks = event.checklist.filter((c) => c.done).length;

    return (
      <div 
        key={event.id} 
        className="kanban-card"
        draggable
        onDragStart={(e) => handleDragStart(e, event.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => handleCardDrop(e, event, columnPhase)}
        style={{
          cursor: "grab",
          userSelect: "none",
          borderLeft: "4px solid var(--accent)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          opacity: draggedCardId === event.id ? 0.4 : 1
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Move size={12} style={{ color: "var(--text-muted)", cursor: "grab" }} />
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--accent)", background: "var(--bg-main)", padding: "2px 6px", borderRadius: "4px" }}>
              {event.codigo}
            </span>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            <button 
              type="button"
              disabled={index === 0}
              onClick={(e) => { e.stopPropagation(); moveCardUp(list, index); }}
              style={{ background: "none", border: "none", cursor: index === 0 ? "default" : "pointer", opacity: index === 0 ? 0.3 : 1, fontSize: "10px", padding: "2px 4px" }}
              title="Mover para cima"
            >
              ▲
            </button>
            <button 
              type="button"
              disabled={index === list.length - 1}
              onClick={(e) => { e.stopPropagation(); moveCardDown(list, index); }}
              style={{ background: "none", border: "none", cursor: index === list.length - 1 ? "default" : "pointer", opacity: index === list.length - 1 ? 0.3 : 1, fontSize: "10px", padding: "2px 4px" }}
              title="Mover para baixo"
            >
              ▼
            </button>
          </div>
        </div>

        <div onClick={(e) => handleCardClick(e, event)} style={{ flexGrow: 1, cursor: "pointer" }}>
          <h4 className="kanban-card-title" style={{ fontSize: "13px", fontWeight: "700" }}>{event.name}</h4>
          <span className="text-xs text-muted" style={{ display: "block", marginTop: "4px" }}>
            Cliente: <strong>{event.client}</strong>
          </span>
          
          <div className="flex-row gap-10 mt-20" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={11} />
              <span>{event.startDate}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}>
              <CheckSquare size={11} />
              <span>{completedTasks}/{totalTasks}</span>
            </div>
          </div>
        </div>

        {/* Phase Navigation Shortcuts */}
        <div style={{ display: "flex", gap: "6px", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "8px" }}>
          {event.phase !== "no_event" && (
            <button 
              className="btn-secondary text-xs" 
              style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "2px" }}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateEventPhase(event.id, event.phase === "during" ? "no_event" : "during");
              }}
              title="Mover para fase anterior"
            >
              <ArrowLeft size={10} /> Voltar
            </button>
          )}
          {event.phase !== "post" && (
            <button 
              className="btn-primary text-xs" 
              style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "2px", marginLeft: "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateEventPhase(event.id, event.phase === "no_event" ? "during" : "post");
              }}
              title="Avançar fase"
            >
              Avançar <ArrowRight size={10} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Event/Feira Filter Tabs & Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px", background: "var(--bg-card)", padding: "18px 20px", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={20} style={{ color: "var(--accent)" }} /> Quadro Kanban por Evento &amp; Feira
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Selecione o evento principal para gerenciar todos os estandes e etapas vinculadas àquela feira específica.
            </p>
          </div>

          <button className="btn-primary" onClick={() => setShowAddForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Novo Estande / Projeto
          </button>
        </div>

        {/* Feiras Selector Tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
          <button
            onClick={() => { setSelectedFeiraFilter("all"); setSelectedEventIdFilter("all"); }}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: selectedFeiraFilter === "all" ? "none" : "1px solid var(--border)",
              backgroundColor: selectedFeiraFilter === "all" ? "var(--accent)" : "var(--bg-main)",
              color: selectedFeiraFilter === "all" ? "#fff" : "var(--text-primary)",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            🎪 Todos os Eventos ({events.length})
          </button>

          {uniqueFeiras.map((feira, idx) => {
            const count = events.filter(e => (e.nomeFeira || e.name) === feira).length;
            const isSelected = selectedFeiraFilter === feira;
            return (
              <button
                key={idx}
                onClick={() => { setSelectedFeiraFilter(feira); setSelectedEventIdFilter("all"); }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: isSelected ? "none" : "1px solid var(--border)",
                  backgroundColor: isSelected ? "var(--accent)" : "var(--bg-main)",
                  color: isSelected ? "#fff" : "var(--text-primary)",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>📍 {feira}</span>
                <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "10px", backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "var(--accent-glow)", color: isSelected ? "#fff" : "var(--accent)" }}>
                  {count} estande(s)
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Feira Details Banner */}
        {selectedFeiraFilter !== "all" && currentFeiraObj && (
          <div style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--accent)", borderRadius: "12px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "12px" }}>
            <div>
              <strong style={{ fontSize: "14px", color: "var(--accent)", display: "block" }}>{selectedFeiraFilter}</strong>
              <span style={{ color: "var(--text-secondary)" }}>
                Local: <strong>{currentFeiraObj.cidadeEvento || currentFeiraObj.centroConvencoes || "Pavilhão Principal"}</strong> | Montagem: <strong>{currentFeiraObj.dataMontagem}</strong> | Evento: <strong>{currentFeiraObj.startDate} a {currentFeiraObj.endDate}</strong>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{displayedEvents.length} Estande(s) neste Evento</span>
              <button 
                className="btn-secondary text-xs" 
                onClick={() => setSelectedFeiraFilter("all")}
                style={{ padding: "4px 10px" }}
              >
                Ver Todos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Seletor Mobile de Colunas do Kanban */}
      <div className="mobile-kanban-tabs" style={{ display: "none", marginBottom: "16px", gap: "6px" }}>
        <button 
          className={`btn-secondary text-xs ${activeMobileColumn === "no_event" ? "active" : ""}`} 
          style={{ flex: 1, padding: "8px 4px", borderBottom: activeMobileColumn === "no_event" ? "3px solid var(--accent)" : "none", borderRadius: "8px", fontWeight: "600" }}
          onClick={() => setActiveMobileColumn("no_event")}
        >
          Depósito ({noEventList.length})
        </button>
        <button 
          className={`btn-secondary text-xs ${activeMobileColumn === "during" ? "active" : ""}`} 
          style={{ flex: 1, padding: "8px 4px", borderBottom: activeMobileColumn === "during" ? "3px solid var(--accent)" : "none", borderRadius: "8px", fontWeight: "600" }}
          onClick={() => setActiveMobileColumn("during")}
        >
          Montagem ({duringList.length})
        </button>
        <button 
          className={`btn-secondary text-xs ${activeMobileColumn === "post" ? "active" : ""}`} 
          style={{ flex: 1, padding: "8px 4px", borderBottom: activeMobileColumn === "post" ? "3px solid var(--accent)" : "none", borderRadius: "8px", fontWeight: "600" }}
          onClick={() => setActiveMobileColumn("post")}
        >
          Retorno ({postList.length})
        </button>
      </div>

      <div className="kanban-grid">
        {/* Column 1 - No Event */}
        <div 
          className={`kanban-column mobile-kanban-col ${activeMobileColumn === "no_event" ? "mobile-show" : ""}`}
          onDragOver={(e) => handleDragOver(e, "no_event")}
          onDrop={(e) => handleDrop(e, "no_event")}
          style={{
            border: dragOverColumn === "no_event" ? "2px dashed var(--accent)" : "1px solid var(--border)",
            borderRadius: "12px",
            transition: "all 0.2s ease"
          }}
        >
          <div className="kanban-column-header">
            <div className="kanban-column-title-box">
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--text-muted)", display: "inline-block" }}></span>
              <h3 className="kanban-column-title">Planejamento & Depósito</h3>
            </div>
            <span className="kanban-column-count">{noEventList.length}</span>
          </div>
          <div className="kanban-cards-container" style={{ minHeight: "200px" }}>
            {noEventList.map((evt, idx) => renderCard(evt, idx, noEventList, "no_event"))}
          </div>
        </div>

        {/* Column 2 - During Event */}
        <div 
          className={`kanban-column mobile-kanban-col ${activeMobileColumn === "during" ? "mobile-show" : ""}`}
          onDragOver={(e) => handleDragOver(e, "during")}
          onDrop={(e) => handleDrop(e, "during")}
          style={{
            border: dragOverColumn === "during" ? "2px dashed var(--accent)" : "1px solid var(--border)",
            borderRadius: "12px",
            transition: "all 0.2s ease"
          }}
        >
          <div className="kanban-column-header">
            <div className="kanban-column-title-box">
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}></span>
              <h3 className="kanban-column-title">Durante (Montagem & Execução)</h3>
            </div>
            <span className="kanban-column-count">{duringList.length}</span>
          </div>
          <div className="kanban-cards-container" style={{ minHeight: "200px" }}>
            {duringList.map((evt, idx) => renderCard(evt, idx, duringList, "during"))}
          </div>
        </div>

        {/* Column 3 - Post Event */}
        <div 
          className={`kanban-column mobile-kanban-col ${activeMobileColumn === "post" ? "mobile-show" : ""}`}
          onDragOver={(e) => handleDragOver(e, "post")}
          onDrop={(e) => handleDrop(e, "post")}
          style={{
            border: dragOverColumn === "post" ? "2px dashed var(--accent)" : "1px solid var(--border)",
            borderRadius: "12px",
            transition: "all 0.2s ease"
          }}
        >
          <div className="kanban-column-header">
            <div className="kanban-column-title-box">
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)", display: "inline-block" }}></span>
              <h3 className="kanban-column-title">Pós-Evento (Desmontagem / Retorno)</h3>
            </div>
            <span className="kanban-column-count">{postList.length}</span>
          </div>
          <div className="kanban-cards-container" style={{ minHeight: "200px" }}>
            {postList.map((evt, idx) => renderCard(evt, idx, postList, "post"))}
          </div>
        </div>
      </div>

      {/* Add Event Modal Overlay */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Novo Estande / Evento</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>X</button>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-body">
              <div className="field">
                <label>Nome do Evento / Estande</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ex: Estande Coca-Cola - Bienal 2026" 
                  required
                />
              </div>
              <div className="field">
                <label>Cliente</label>
                <input 
                  type="text" 
                  value={client} 
                  onChange={(e) => setClient(e.target.value)} 
                  placeholder="Ex: Coca-Cola Brasil" 
                  required
                />
              </div>
              <div className="field">
                <label>Data de Início da Montagem</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Criar Evento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
