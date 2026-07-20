import React, { useState } from "react";
import { 
  ClipboardCheck, CheckSquare, Square, Plus, Search, 
  Filter, CheckCircle2, AlertCircle, Briefcase, CheckCircle
} from "lucide-react";
import type { Project, ChecklistItem } from "../types";

interface TasksModuleProps {
  events: Project[];
  onUpdateEvent: (updated: Project) => void;
}

export default function TasksModule({ events, onUpdateEvent }: TasksModuleProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "done">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for adding a new task
  const [newTaskText, setNewTaskText] = useState("");
  const [targetProjectId, setTargetProjectId] = useState(events[0]?.id || "");

  // Toggle checklist item
  const handleToggleTask = (projectId: string, itemId: string) => {
    const project = events.find(e => e.id === projectId);
    if (!project) return;

    const updatedChecklist = project.checklist.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );

    // Calculate new completion rate
    const doneCount = updatedChecklist.filter(c => c.done).length;
    const completionRate = updatedChecklist.length > 0 ? Math.round((doneCount / updatedChecklist.length) * 100) : 0;

    onUpdateEvent({
      ...project,
      checklist: updatedChecklist,
      completionRate
    });
  };

  // Add a task to a specific project
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !targetProjectId) return;

    const project = events.find(e => e.id === targetProjectId);
    if (!project) return;

    const newItem: ChecklistItem = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      done: false
    };

    const updatedChecklist = [...project.checklist, newItem];
    const doneCount = updatedChecklist.filter(c => c.done).length;
    const completionRate = Math.round((doneCount / updatedChecklist.length) * 100);

    onUpdateEvent({
      ...project,
      checklist: updatedChecklist,
      completionRate
    });

    setNewTaskText("");
    alert("Nova tarefa operacional adicionada com sucesso!");
  };

  // Process all tasks
  const allTasks = events.flatMap(evt => 
    evt.checklist.map(item => ({
      ...item,
      projectId: evt.id,
      projectName: evt.name,
      projectCodigo: evt.codigo
    }))
  );

  // Filter tasks
  const filteredTasks = allTasks.filter(task => {
    const matchesProject = selectedProjectId === "all" ? true : task.projectId === selectedProjectId;
    const matchesStatus = statusFilter === "all" ? true : statusFilter === "done" ? task.done : !task.done;
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.projectCodigo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  return (
    <div className="responsive-layout-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", padding: "10px", minHeight: "80vh" }}>
      
      {/* ── Left Column: Project Selector & Add Form ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Project Selector Box */}
        <div className="section-box" style={{ height: "auto" }}>
          <h3 className="section-box-title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Briefcase size={16} style={{ color: "var(--accent)" }} />
            Filtrar por Estande
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={() => setSelectedProjectId("all")}
              style={{
                width: "100%",
                padding: "10px 12px",
                textAlign: "left",
                background: selectedProjectId === "all" ? "var(--accent-glow)" : "transparent",
                border: `1px solid ${selectedProjectId === "all" ? "var(--accent)" : "transparent"}`,
                borderRadius: "8px",
                color: selectedProjectId === "all" ? "var(--accent-text)" : "var(--text-primary)",
                fontWeight: selectedProjectId === "all" ? "600" : "500",
                fontSize: "12.5px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>Todos os Estandes</span>
              <span className="badge badge-muted" style={{ fontSize: "9px" }}>
                {allTasks.filter(t => !t.done).length} pend.
              </span>
            </button>

            {events.map(evt => {
              const pendingCount = evt.checklist.filter(c => !c.done).length;
              const isSelected = selectedProjectId === evt.id;
              return (
                <button
                  key={evt.id}
                  onClick={() => setSelectedProjectId(evt.id)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    textAlign: "left",
                    background: isSelected ? "var(--accent-glow)" : "transparent",
                    border: `1px solid ${isSelected ? "var(--accent)" : "transparent"}`,
                    borderRadius: "8px",
                    color: isSelected ? "var(--accent-text)" : "var(--text-primary)",
                    fontWeight: isSelected ? "600" : "500",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <span style={{ fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{evt.name}</span>
                    {pendingCount > 0 ? (
                      <span className="badge badge-warning" style={{ fontSize: "9px" }}>{pendingCount}</span>
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: "9px" }}><CheckCircle size={10} /></span>
                    )}
                  </div>
                  {/* Mini Progress Bar */}
                  <div style={{ width: "100%", height: "4px", backgroundColor: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${evt.completionRate}%`, height: "100%", backgroundColor: evt.completionRate === 100 ? "var(--success-text)" : "var(--accent)" }}></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Task Box */}
        <div className="section-box" style={{ height: "auto" }}>
          <h3 className="section-box-title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Plus size={16} style={{ color: "var(--accent-secondary)" }} />
            Nova Tarefa Operacional
          </h3>
          
          <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>Estande / Projeto</label>
              <select
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "8px", outline: "none", fontSize: "12px", background: "var(--bg-card)", color: "var(--text-primary)" }}
              >
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name} ({evt.codigo})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>Descrição da Tarefa</label>
              <textarea
                placeholder="Ex: Contratar munck para descarga..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                required
                rows={3}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "8px", outline: "none", fontSize: "12px", background: "var(--bg-card)", color: "var(--text-primary)", resize: "none", fontFamily: "inherit" }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              <Plus size={14} /> Adicionar Tarefa
            </button>
          </form>
        </div>

      </div>

      {/* ── Right Column: Centralized Tasks Checklist ── */}
      <div className="section-box" style={{ display: "flex", flexDirection: "column", gap: "16px", height: "auto" }}>
        
        {/* Top Control Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <ClipboardCheck size={20} style={{ color: "var(--accent)" }} />
              Tarefas Operacionais Pendentes
            </h3>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
              Exibindo {filteredTasks.length} de {allTasks.length} tarefas mapeadas
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Status Select Toggle */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer", outline: "none" }}
            >
              <option value="pending">Apenas Pendentes</option>
              <option value="done">Apenas Concluídas</option>
              <option value="all">Ver Todas</option>
            </select>

            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Buscar tarefa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px 12px 8px 30px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-card)", color: "var(--text-primary)", width: "200px", outline: "none" }}
              />
              <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
            </div>
          </div>
        </div>

        {/* List of Tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexGrow: 1, maxHeight: "68vh", overflowY: "auto", paddingRight: "4px" }}>
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "64px 0" }}>
              <CheckCircle2 size={48} style={{ opacity: 0.2, display: "block", margin: "0 auto 12px" }} />
              <p style={{ fontWeight: "600", fontSize: "14px", margin: 0 }}>Nenhuma tarefa encontrada!</p>
              <p style={{ fontSize: "12px", margin: "4px 0 0 0" }}>Todas as tarefas selecionadas foram concluídas ou não correspondem aos filtros.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.projectId, task.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "var(--transition)"
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                onMouseOut={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: task.done ? "var(--success-text)" : "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "var(--transition)"
                    }}
                  >
                    {task.done ? (
                      <CheckSquare size={20} style={{ color: "var(--success-text)" }} />
                    ) : (
                      <Square size={20} style={{ color: "var(--text-muted)" }} />
                    )}
                  </button>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: task.done ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: task.done ? "line-through" : "none",
                        wordBreak: "break-word"
                      }}
                    >
                      {task.text}
                    </span>
                    
                    {/* Badge linking back to the Project */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px", alignItems: "center" }}>
                      <span className="badge badge-muted" style={{ fontSize: "9px" }}>
                        {task.projectName} &bull; {task.projectCodigo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div>
                  {task.done ? (
                    <span className="badge badge-success" style={{ fontSize: "9px" }}>
                      Concluída
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: "9px" }}>
                      Pendente
                    </span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
