import { useState, type FormEvent } from "react";
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
  const [selectedEventIdFilter, setSelectedEventIdFilter] = useState<string>("all");
  const [activeMobileColumn, setActiveMobileColumn] = useState<"no_event" | "during" | "post">("no_event");

  // Drag and Drop state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !client || !startDate) return;
    onAddEvent(name, client, startDate);
    setName("");
    setClient("");
    setStartDate("");
    setShowAddForm(false);
  };

  const displayedEvents = selectedEventIdFilter === "all" 
    ? events 
    : events.filter(e => e.id === selectedEventIdFilter);

  // Filter events by phase accurately
  const noEventPhases = ["no_event", "Briefing", "Orçamento", "Pré-Evento"];
  const duringPhases = ["during", "Produção", "Montagem", "Evento", "Aprovado"];
  const postPhases = ["post", "Desmontagem", "Finalizado"];

  const noEventList = displayedEvents.filter((e) => noEventPhases.includes(e.phase));
  const duringList = displayedEvents.filter((e) => duringPhases.includes(e.phase));
  const postList = displayedEvents.filter((e) => postPhases.includes(e.phase) || (!noEventPhases.includes(e.phase) && !duringPhases.includes(e.phase)));

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedCardId(id);
  };

  const handleDragOver = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    if (dragOverColumn !== colName) setDragOverColumn(colName);
  };

  const handleDrop = (e: React.DragEvent, targetPhase: string) => {
    e.preventDefault();
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

        <div onClick={() => onSelectEvent(event)} style={{ flexGrow: 1, cursor: "pointer" }}>
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
      {/* Event Filter & Top Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px", background: "var(--bg-card)", padding: "14px 18px", borderRadius: "12px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Filter size={16} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>Kanban por Evento:</span>
          <select 
            value={selectedEventIdFilter} 
            onChange={(e) => setSelectedEventIdFilter(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "13px", fontWeight: "600" }}
          >
            <option value="all">Ver Todos os Eventos ({events.length})</option>
            {events.map(evt => (
              <option key={evt.id} value={evt.id}>{evt.name} — {evt.client}</option>
            ))}
          </select>
        </div>

        <button className="btn-primary" onClick={() => setShowAddForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Novo Evento / Estande
        </button>
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
