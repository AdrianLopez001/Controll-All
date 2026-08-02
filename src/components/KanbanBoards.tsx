import { useState, type FormEvent } from "react";
import { 
  Calendar, Plus, MapPin, ChevronDown, ChevronUp, FileText, 
  Trash2, CheckSquare, DollarSign, ArrowRight, Filter, Search,
  Building2, Layers
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
  onDeleteEvent
}: KanbanBoardsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [cidadeFilter, setCidadeFilter] = useState("all");
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  
  // Modal States
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddStandModal, setShowAddStandModal] = useState(false);
  const [targetFeiraName, setTargetFeiraName] = useState("");

  // Form States
  const [formNomeFeira, setFormNomeFeira] = useState("");
  const [formCidade, setFormCidade] = useState("Recife / PE");
  const [formEstandeName, setFormEstandeName] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState("");
  const [formValor, setFormValor] = useState(35000);
  const [formTipo, setFormTipo] = useState<"padrao" | "misto" | "construido">("misto");

  // Group projects into Eventos / Feiras Principais
  const groupedEventsMap = new Map<string, Project[]>();
  events.forEach(item => {
    const key = item.nomeFeira || item.name;
    if (!groupedEventsMap.has(key)) {
      groupedEventsMap.set(key, []);
    }
    groupedEventsMap.get(key)!.push(item);
  });

  const uniqueEventNames = Array.from(groupedEventsMap.keys());

  // Available unique cities for filtering
  const uniqueCidades = Array.from(
    new Set(events.map(e => e.cidadeEvento || "Recife / PE").filter(Boolean))
  );

  const toggleExpand = (feiraName: string) => {
    setExpandedEvents(prev => 
      prev.includes(feiraName) ? prev.filter(name => name !== feiraName) : [...prev, feiraName]
    );
  };

  const handleCreateNewEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!formNomeFeira.trim() || !formEstandeName.trim() || !formClient.trim()) return;

    onAddEvent(formEstandeName, formClient, formStartDate, {
      nomeFeira: formNomeFeira,
      cidadeEvento: formCidade,
      endDate: formEndDate || formStartDate,
      valorContratado: formValor,
      tipoEstande: formTipo
    });

    // Reset Form
    setFormNomeFeira("");
    setFormEstandeName("");
    setFormClient("");
    setFormValor(35000);
    setShowAddEventModal(false);
  };

  const handleAddStandToEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!targetFeiraName || !formEstandeName.trim() || !formClient.trim()) return;

    const existingInFeira = events.find(x => (x.nomeFeira || x.name) === targetFeiraName);

    onAddEvent(formEstandeName, formClient, formStartDate, {
      nomeFeira: targetFeiraName,
      cidadeEvento: existingInFeira?.cidadeEvento || "Recife / PE",
      endDate: formEndDate || formStartDate,
      valorContratado: formValor,
      tipoEstande: formTipo
    });

    setFormEstandeName("");
    setFormClient("");
    setFormValor(25000);
    setShowAddStandModal(false);
  };

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Filtered Event List
  const filteredEventNames = uniqueEventNames.filter(feiraName => {
    const list = groupedEventsMap.get(feiraName) || [];
    const matchesSearch = feiraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.client.toLowerCase().includes(searchTerm.toLowerCase()) || p.codigo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCidade = cidadeFilter === "all" || list.some(p => (p.cidadeEvento || "Recife / PE") === cidadeFilter);

    return matchesSearch && matchesCidade;
  });

  // Calculate Metrics
  const totalEventosCount = uniqueEventNames.length;
  const totalEstandesCount = events.length;
  const totalFaturamento = events.reduce((acc, curr) => acc + (curr.valorContratado || 0), 0);
  const estandesEmProducao = events.filter(e => ["Produção", "Montagem", "during"].includes(e.phase)).length;

  const ALL_PHASES = ["Briefing", "Orçamento", "Aprovado", "Produção", "Montagem", "Evento", "Desmontagem", "Finalizado"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Bar */}
      <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "16px", padding: "20px 24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <Calendar size={22} style={{ color: "var(--accent)" }} /> Central de Gestão de Eventos &amp; Feiras
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Visualização unificada dos eventos principais com expansão detalhada de informações e estandes vinculados.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button 
              className="btn-secondary"
              onClick={() => {
                setTargetFeiraName(uniqueEventNames[0] || "");
                setShowAddStandModal(true);
              }}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600" }}
            >
              <Plus size={16} /> Novo Estande Vinculado
            </button>
            <button 
              className="btn-primary"
              onClick={() => setShowAddEventModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700" }}
            >
              <Building2 size={16} /> Cadastrar Novo Evento
            </button>
          </div>
        </div>

        {/* Metrics Summary Widgets */}
        <div className="responsive-layout-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginTop: "20px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
          <div style={{ backgroundColor: "var(--bg-main)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Eventos Principais</span>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--accent)", marginTop: "2px" }}>{totalEventosCount} feiras</div>
          </div>
          <div style={{ backgroundColor: "var(--bg-main)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Estandes Contratados</span>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>{totalEstandesCount} projetos</div>
          </div>
          <div style={{ backgroundColor: "var(--bg-main)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Faturamento Acumulado</span>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#059669", marginTop: "2px" }}>{formatCurrency(totalFaturamento)}</div>
          </div>
          <div style={{ backgroundColor: "var(--bg-main)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Em Produção/Montagem</span>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#d97706", marginTop: "2px" }}>{estandesEmProducao} estande(s)</div>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flexGrow: 1, minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text"
            placeholder="Buscar evento, cidade, cliente ou estande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              fontSize: "13px"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-card)", padding: "4px 12px", borderRadius: "10px", border: "1px solid var(--border)" }}>
          <Filter size={14} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Cidade:</span>
          <select 
            value={cidadeFilter}
            onChange={(e) => setCidadeFilter(e.target.value)}
            style={{ background: "transparent", border: "none", fontSize: "12px", fontWeight: "700", color: "var(--accent)" }}
          >
            <option value="all">Todas as Cidades ({uniqueCidades.length})</option>
            {uniqueCidades.map((cid, i) => (
              <option key={i} value={cid}>{cid}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List of Events */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredEventNames.length === 0 ? (
          <div style={{ backgroundColor: "var(--bg-card)", padding: "40px", textAlign: "center", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <Calendar size={40} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
            <h3 style={{ fontSize: "16px", color: "var(--text-primary)", margin: 0 }}>Nenhum evento encontrado</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Tente ajustar a busca ou cadastrar um novo evento.</p>
          </div>
        ) : (
          filteredEventNames.map(feiraName => {
            const linkedProjetos = groupedEventsMap.get(feiraName) || [];
            const isExpanded = expandedEvents.includes(feiraName);
            const firstProj = linkedProjetos[0];
            const cidade = firstProj?.cidadeEvento || "Recife / PE";
            const valorTotalEvento = linkedProjetos.reduce((acc, curr) => acc + (curr.valorContratado || 0), 0);
            const totalTasksAll = linkedProjetos.reduce((acc, curr) => acc + curr.checklist.length, 0);
            const completedTasksAll = linkedProjetos.reduce((acc, curr) => acc + curr.checklist.filter(c => c.done).length, 0);
            const pctDone = totalTasksAll > 0 ? Math.round((completedTasksAll / totalTasksAll) * 100) : 0;

            return (
              <div 
                key={feiraName}
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "16px",
                  border: isExpanded ? "2px solid var(--accent)" : "1px solid var(--border)",
                  boxShadow: isExpanded ? "var(--shadow-md)" : "var(--shadow-sm)",
                  overflow: "hidden",
                  transition: "all 0.2s ease-in-out"
                }}
              >
                {/* Event Header Bar (Clickable to Expand) */}
                <div 
                  onClick={() => toggleExpand(feiraName)}
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    backgroundColor: isExpanded ? "var(--accent-glow)" : "var(--bg-card)",
                    borderBottom: isExpanded ? "1px solid var(--border)" : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                    <div style={{ backgroundColor: "var(--accent)", color: "#fff", width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px" }}>
                      🎪
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                          {feiraName}
                        </h3>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", backgroundColor: "var(--bg-main)", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={10} /> {cidade}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                        <span>📅 {firstProj?.startDate || "Período do Evento"}</span>
                        <span>🏢 <strong>{linkedProjetos.length}</strong> estande(s) vinculado(s)</span>
                        <span>💰 Faturamento: <strong style={{ color: "#059669" }}>{formatCurrency(valorTotalEvento)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Checklist Geral</span>
                      <strong style={{ fontSize: "13px", color: pctDone === 100 ? "#059669" : "var(--accent)" }}>{pctDone}% concluído</strong>
                    </div>

                    <button 
                      type="button" 
                      style={{ background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--accent)" }}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Event Details & Linked Projects */}
                {isExpanded && (
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", backgroundColor: "var(--bg-card)" }}>
                    
                    {/* Event Details Grid Panel */}
                    <div style={{ backgroundColor: "var(--bg-main)", borderRadius: "12px", padding: "16px", border: "1px solid var(--border)" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--accent)", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Layers size={14} /> Dados Completos do Evento
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", fontSize: "12px" }}>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Localização / Pavilhão:</span>
                          <strong style={{ color: "var(--text-primary)" }}>{cidade} — Pavilhão Principal</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Período de Montagem:</span>
                          <strong style={{ color: "var(--text-primary)" }}>{firstProj?.dataMontagem || firstProj?.startDate}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Período de Desmontagem:</span>
                          <strong style={{ color: "var(--text-primary)" }}>{firstProj?.dataDesmontagem || firstProj?.endDate}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Responsável Geral:</span>
                          <strong style={{ color: "var(--text-primary)" }}>{firstProj?.responsavel || "Supervisor JC Eventos"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Linked Projects Table */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                          Estandes e Projetos Vinculados ({linkedProjetos.length})
                        </h4>
                        <button 
                          className="btn-secondary text-xs"
                          onClick={() => {
                            setTargetFeiraName(feiraName);
                            setShowAddStandModal(true);
                          }}
                          style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Plus size={12} /> Vincular Outro Estande
                        </button>
                      </div>

                      <div style={{ borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                          <thead>
                            <tr style={{ backgroundColor: "var(--bg-main)", borderBottom: "1px solid var(--border)" }}>
                              <th style={{ padding: "10px 14px", fontWeight: "700" }}>CÓDIGO</th>
                              <th style={{ padding: "10px 14px", fontWeight: "700" }}>NOME DO ESTANDE</th>
                              <th style={{ padding: "10px 14px", fontWeight: "700" }}>CLIENTE</th>
                              <th style={{ padding: "10px 14px", fontWeight: "700" }}>TIPO / ÁREA</th>
                              <th style={{ padding: "10px 14px", fontWeight: "700" }}>VALOR</th>
                              <th style={{ padding: "10px 14px", fontWeight: "700" }}>FASE ATUAL</th>
                              <th style={{ padding: "10px 14px", fontWeight: "700", textAlign: "center" }}>AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody>
                            {linkedProjetos.map(proj => {
                              const totalChecklist = proj.checklist.length;
                              const doneChecklist = proj.checklist.filter(c => c.done).length;

                              return (
                                <tr key={proj.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                  <td style={{ padding: "10px 14px" }}>
                                    <span style={{ fontWeight: "800", color: "var(--accent)", backgroundColor: "var(--accent-glow)", padding: "3px 8px", borderRadius: "6px" }}>
                                      {proj.codigo}
                                    </span>
                                  </td>
                                  <td style={{ padding: "10px 14px", fontWeight: "700", color: "var(--text-primary)" }}>
                                    {proj.name}
                                  </td>
                                  <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                                    {proj.client}
                                  </td>
                                  <td style={{ padding: "10px 14px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                                    {proj.tipoEstande || "Misto"} {proj.areaM2 ? `(${proj.areaM2}m²)` : ""}
                                  </td>
                                  <td style={{ padding: "10px 14px", fontWeight: "700", color: "#059669" }}>
                                    {formatCurrency(proj.valorContratado)}
                                  </td>
                                  <td style={{ padding: "10px 14px" }}>
                                    <select 
                                      value={proj.phase}
                                      onChange={(e) => onUpdateEventPhase(proj.id, e.target.value)}
                                      style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "11px", fontWeight: "700", backgroundColor: "var(--bg-main)", color: "var(--accent)" }}
                                    >
                                      {ALL_PHASES.map(ph => (
                                        <option key={ph} value={ph}>{ph}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                                      <button 
                                        className="btn-primary"
                                        onClick={() => onSelectEvent(proj)}
                                        style={{ padding: "4px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                                        title="Abrir ficha completa do estande"
                                      >
                                        <FileText size={12} /> Detalhes
                                      </button>
                                      {onDeleteEvent && (
                                        <button 
                                          className="btn-danger"
                                          onClick={() => {
                                            if (confirm(`Deseja excluir o estande "${proj.name}"?`)) {
                                              onDeleteEvent(proj.id);
                                            }
                                          }}
                                          style={{ padding: "4px 8px", fontSize: "11px" }}
                                          title="Excluir estande"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: CADASTRO DE NOVO EVENTO PRINCIPAL */}
      {showAddEventModal && (
        <div className="modal-overlay" onClick={() => setShowAddEventModal(false)}>
          <div className="modal-content" style={{ maxWidth: "520px" }} onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Building2 size={20} style={{ color: "var(--accent)" }} /> Cadastrar Novo Evento / Feira
            </h3>

            <form onSubmit={handleCreateNewEvent} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div className="field">
                <label>Nome do Evento / Feira Principal *</label>
                <input 
                  type="text" 
                  placeholder="Ex: ExpoSaúde Nordeste 2026" 
                  value={formNomeFeira} 
                  onChange={e => setFormNomeFeira(e.target.value)} 
                  required 
                />
              </div>

              <div className="field">
                <label>Cidade / Pavilhão *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Recife / PE — Centro de Convenções" 
                  value={formCidade} 
                  onChange={e => setFormCidade(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", margin: "4px 0" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent)", display: "block", marginBottom: "10px" }}>
                  🏢 Dados do Primeiros Estande Vinculado
                </span>
                
                <div className="field" style={{ marginBottom: "10px" }}>
                  <label>Nome do Estande / Projeto *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Stand Unimed 45m²" 
                    value={formEstandeName} 
                    onChange={e => setFormEstandeName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="field" style={{ marginBottom: "10px" }}>
                  <label>Nome do Cliente / Empresa *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Unimed Recife Cooperativa" 
                    value={formClient} 
                    onChange={e => setFormClient(e.target.value)} 
                    required 
                  />
                </div>

                <div className="responsive-layout-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="field">
                    <label>Data Início Evento</label>
                    <input 
                      type="date" 
                      value={formStartDate} 
                      onChange={e => setFormStartDate(e.target.value)} 
                    />
                  </div>
                  <div className="field">
                    <label>Valor Contratado (R$)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="500" 
                      value={formValor} 
                      onChange={e => setFormValor(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddEventModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Criar Evento &amp; Estande</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR ESTANDE A UM EVENTO EXISTENTE */}
      {showAddStandModal && (
        <div className="modal-overlay" onClick={() => setShowAddStandModal(false)}>
          <div className="modal-content" style={{ maxWidth: "480px" }} onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={20} style={{ color: "var(--accent)" }} /> Vincular Novo Estande ao Evento
            </h3>

            <form onSubmit={handleAddStandToEvent} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div className="field">
                <label>Selecione o Evento / Feira *</label>
                <select 
                  value={targetFeiraName} 
                  onChange={e => setTargetFeiraName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}
                  required
                >
                  {uniqueEventNames.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Nome do Estande / Marca *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Stand Fiat - Salão Automóvel" 
                  value={formEstandeName} 
                  onChange={e => setFormEstandeName(e.target.value)} 
                  required 
                />
              </div>

              <div className="field">
                <label>Cliente / Empresa Responsável *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Fiat Automóveis Brasil" 
                  value={formClient} 
                  onChange={e => setFormClient(e.target.value)} 
                  required 
                />
              </div>

              <div className="field">
                <label>Valor do Contrato (R$)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="500" 
                  value={formValor} 
                  onChange={e => setFormValor(parseFloat(e.target.value) || 0)} 
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddStandModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Vincular Estande</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
