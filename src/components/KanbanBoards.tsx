import { useState, type FormEvent } from "react";
import { Plus, Calendar, CheckSquare, ArrowRight, ArrowLeft } from "lucide-react";
import type { Project } from "../types";

interface KanbanBoardsProps {
  events: Project[];
  onSelectEvent: (event: Project) => void;
  onAddEvent: (name: string, client: string, startDate: string) => void;
  onUpdateEventPhase: (id: string, phase: any) => void;
  onDeleteEvent?: (id: string) => void;
}

export default function KanbanBoards({ 
  events, 
  onSelectEvent, 
  onAddEvent,
  onUpdateEventPhase,
  onDeleteEvent
}: KanbanBoardsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [activeMobileColumn, setActiveMobileColumn] = useState<"no_event" | "during" | "post">("no_event");

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !client || !startDate) return;
    onAddEvent(name, client, startDate);
    setName("");
    setClient("");
    setStartDate("");
    setShowAddForm(false);
  };

  // Filter events by phase accurately
  const noEventPhases = ["no_event", "Briefing", "Orçamento", "Pré-Evento"];
  const duringPhases = ["during", "Produção", "Montagem", "Evento", "Aprovado"];
  const postPhases = ["post", "Desmontagem", "Finalizado"];

  const noEventList = events.filter((e) => noEventPhases.includes(e.phase));
  const duringList = events.filter((e) => duringPhases.includes(e.phase));
  const postList = events.filter((e) => postPhases.includes(e.phase) || (!noEventPhases.includes(e.phase) && !duringPhases.includes(e.phase)));

  const renderCard = (event: Project) => {
    const totalTasks = event.checklist.length;
    const completedTasks = event.checklist.filter((c) => c.done).length;

    return (
      <div key={event.id} className="kanban-card">
        <div onClick={() => onSelectEvent(event)} style={{ flexGrow: 1 }}>
          <h4 className="kanban-card-title">{event.name}</h4>
          <span className="text-xs text-muted" style={{ display: "block", marginTop: "4px" }}>
            Cliente: {event.client}
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
        <div style={{ display: "flex", gap: "6px", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }}>
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
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
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
        <div className={`kanban-column mobile-kanban-col ${activeMobileColumn === "no_event" ? "mobile-show" : ""}`}>
          <div className="kanban-column-header">
            <div className="kanban-column-title-box">
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--text-muted)", display: "inline-block" }}></span>
              <h3 className="kanban-column-title">Sem Evento (Depósito)</h3>
            </div>
            <span className="kanban-column-count">{noEventList.length}</span>
          </div>
          <div className="kanban-cards-container">
            {noEventList.map(renderCard)}
          </div>
        </div>

        {/* Column 2 - During Event */}
        <div className={`kanban-column mobile-kanban-col ${activeMobileColumn === "during" ? "mobile-show" : ""}`}>
          <div className="kanban-column-header">
            <div className="kanban-column-title-box">
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}></span>
              <h3 className="kanban-column-title">Durante (Montagem)</h3>
            </div>
            <span className="kanban-column-count">{duringList.length}</span>
          </div>
          <div className="kanban-cards-container">
            {duringList.map(renderCard)}
          </div>
        </div>

        {/* Column 3 - Post Event */}
        <div className={`kanban-column mobile-kanban-col ${activeMobileColumn === "post" ? "mobile-show" : ""}`}>
          <div className="kanban-column-header">
            <div className="kanban-column-title-box">
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)", display: "inline-block" }}></span>
              <h3 className="kanban-column-title">Pós-Evento (Retorno)</h3>
            </div>
            <span className="kanban-column-count">{postList.length}</span>
          </div>
          <div className="kanban-cards-container">
            {postList.map(renderCard)}
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
