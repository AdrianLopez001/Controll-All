import React, { useState } from "react";
import { 
  X, FileText, Shield, AlertCircle, DollarSign, MapPin, Navigation, Tag, Calendar, Truck,
  Plus, Trash2, Edit2, Save, UserPlus, CheckCircle2, Upload
} from "lucide-react";
import type { Project, Employee, WarehouseItem, ProductionSectors, ConventionCenterRules, ChecklistItem, AssignedEmployee, Orcamento } from "../types";
import { sanitizeUrl } from "../utils/security";
import FileUploadManager from "./FileUploadManager";

export const CONVENTION_CENTERS: ConventionCenterRules[] = [
  {
    nome: "Distrito Anhembi (SP)",
    taxaEnergia: 1500,
    taxaLimpeza: 800,
    limiteAltura: "6.0m",
    artObrigatoria: true,
    brigadistaObrigatorio: false,
    seguroObrigatorio: true,
    estacionamento: 80,
    contatoGestor: "Almir Silva (11) 98888-7711"
  },
  {
    nome: "Expo Center Norte (SP)",
    taxaEnergia: 2000,
    taxaLimpeza: 950,
    limiteAltura: "5.5m",
    artObrigatoria: true,
    brigadistaObrigatorio: true,
    seguroObrigatorio: true,
    estacionamento: 100,
    contatoGestor: "Regina Costa (11) 97777-6622"
  },
  {
    nome: "Riocentro (RJ)",
    taxaEnergia: 1800,
    taxaLimpeza: 1100,
    limiteAltura: "7.0m",
    artObrigatoria: true,
    brigadistaObrigatorio: true,
    seguroObrigatorio: true,
    estacionamento: 70,
    contatoGestor: "Luiz Pires (21) 96666-5533"
  },
  {
    nome: "Centro de Convenções de Natal (RN)",
    taxaEnergia: 1200,
    taxaLimpeza: 600,
    limiteAltura: "5.0m",
    artObrigatoria: true,
    brigadistaObrigatorio: true,
    seguroObrigatorio: false,
    estacionamento: 30,
    contatoGestor: "Jussara Melo (84) 95555-4444"
  }
];

interface EventDetailsModalProps {
  event: Project;
  allEmployees: Employee[];
  allWarehouseItems: WarehouseItem[];
  allEvents: Project[];
  allOrcamentos?: Orcamento[];
  onClose: () => void;
  onUpdateEvent: (updatedEvent: Project) => void;
  onDeleteEvent?: (id: string) => void;
}

export default function EventDetailsModal({
  event,
  allEmployees,
  allWarehouseItems,
  allEvents,
  allOrcamentos = [],
  onClose,
  onUpdateEvent,
  onDeleteEvent
}: EventDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "checklist" | "tools" | "staff" | "travel" | "docs" | "costs" | "route" | "producao" | "regras" | "propostas"
  >("checklist");

  // Linked Orcamentos for this event
  const linkedOrcamentos = allOrcamentos.filter(o => 
    o.eventId === event.id || 
    (o.eventoNome && o.eventoNome.toLowerCase() === event.name.toLowerCase()) ||
    (o.cliente && o.cliente.toLowerCase() === event.client.toLowerCase())
  );
  
  // Local modifications state
  const [localEvent, setLocalEvent] = useState<Project>({ ...event });
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [editName, setEditName] = useState(localEvent.name);
  const [editClient, setEditClient] = useState(localEvent.client);
  const [editPhase, setEditPhase] = useState(localEvent.phase);

  // New Checklist Item State
  const [newChecklistText, setNewChecklistText] = useState("");
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editingChecklistText, setEditingChecklistText] = useState("");

  // Production Sector custom categories state
  const [customProdCategories, setCustomProdCategories] = useState<{ id: string; name: string; status: "pendente" | "em_andamento" | "concluido" }[]>([
    { id: "marcenaria", name: "🪚 Marcenaria", status: localEvent.producao?.marcenaria || "pendente" },
    { id: "pintura", name: "🎨 Pintura & Acabamento", status: localEvent.producao?.pintura || "pendente" },
    { id: "eletrica", name: "⚡ Elétrica & Iluminação", status: localEvent.producao?.eletrica || "pendente" },
    { id: "comunicacaoVisual", name: "🖼️ Comunicação Visual", status: localEvent.producao?.comunicacaoVisual || "pendente" },
    { id: "vidros", name: "🪟 Vidraçaria & Vidros", status: localEvent.producao?.vidros || "pendente" },
    { id: "limpeza", name: "🧹 Limpeza Técnica", status: localEvent.producao?.limpeza || "pendente" }
  ]);
  const [newCatName, setNewCatName] = useState("");

  // Convention center search & custom registration state
  const [searchVenue, setSearchVenue] = useState("");
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [customVenueName, setCustomVenueName] = useState("");
  const [customVenueCidade, setCustomVenueCidade] = useState("");
  const [customVenueTaxaEnergia, setCustomVenueTaxaEnergia] = useState(1000);
  const [customVenueTaxaLimpeza, setCustomVenueTaxaLimpeza] = useState(500);
  const [customVenueAltura, setCustomVenueAltura] = useState("5.0m");

  // Contractor addition state
  const [showAddTerceirizado, setShowAddTerceirizado] = useState(false);
  const [terceirizadoName, setTerceirizadoName] = useState("");
  const [terceirizadoRole, setTerceirizadoRole] = useState("Montador Terceirizado");
  const [terceirizadoEquipe, setTerceirizadoEquipe] = useState("Equipe Externa");
  const [terceirizadoHorario, setTerceirizadoHorario] = useState("08:00 - 18:00");
  const [terceirizadoObs, setTerceirizadoObs] = useState("");

  // Custom document addition state
  const [newDocName, setNewDocName] = useState("");

  const handleUpdate = (updated: Project) => {
    setLocalEvent(updated);
    onUpdateEvent(updated);
  };

  const handleSaveBasicEdit = () => {
    const updated = {
      ...localEvent,
      name: editName,
      client: editClient,
      phase: editPhase
    };
    handleUpdate(updated);
    setIsEditingBasic(false);
  };

  const handleDeleteThisEvent = () => {
    if (confirm(`Tem certeza que deseja excluir definitivamente o evento "${localEvent.name}"? Esta ação não pode ser desfeita.`)) {
      if (onDeleteEvent) onDeleteEvent(localEvent.id);
      onClose();
    }
  };

  // Date overlap check: (startA <= endB) && (endA >= startB)
  const isDateOverlapping = (startA: string, endA: string, startB: string, endB: string) => {
    return (startA <= endB) && (endA >= startB);
  };

  // Get other overlapping projects
  const overlappingEvents = allEvents.filter(e => 
    e.id !== localEvent.id && 
    isDateOverlapping(e.startDate, e.endDate, localEvent.startDate, localEvent.endDate)
  );

  // Get total reserved quantity of an item in other overlapping events
  const getReservedInOtherEvents = (itemId: string) => {
    return overlappingEvents.reduce((sum, evt) => {
      const assigned = evt.assignedTools.find(t => t.id === itemId);
      return sum + (assigned ? assigned.allocatedQty : 0);
    }, 0);
  };

  // Calculate ART limit date and countdown
  const getArtDeadlineInfo = () => {
    if (!localEvent.dataMontagem) return null;
    const montagemDate = new Date(localEvent.dataMontagem);
    const deadlineDate = new Date(montagemDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    const currentDate = new Date();
    
    deadlineDate.setHours(0,0,0,0);
    currentDate.setHours(0,0,0,0);
    
    const diffTime = deadlineDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      diffDays,
      formattedDeadline: deadlineDate.toLocaleDateString("pt-BR")
    };
  };

  // 1. Checklist Handlers (Full CRUD)
  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = localEvent.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    
    const total = updatedChecklist.length;
    const completed = updatedChecklist.filter(t => t.done).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    handleUpdate({
      ...localEvent,
      checklist: updatedChecklist,
      completionRate: rate
    });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `c-${Date.now()}`,
      text: newChecklistText.trim(),
      done: false
    };
    const updatedChecklist = [...localEvent.checklist, newItem];
    const total = updatedChecklist.length;
    const completed = updatedChecklist.filter(t => t.done).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    handleUpdate({
      ...localEvent,
      checklist: updatedChecklist,
      completionRate: rate
    });
    setNewChecklistText("");
  };

  const handleSaveChecklistEdit = (itemId: string) => {
    if (!editingChecklistText.trim()) return;
    const updatedChecklist = localEvent.checklist.map(item => 
      item.id === itemId ? { ...item, text: editingChecklistText.trim() } : item
    );
    handleUpdate({
      ...localEvent,
      checklist: updatedChecklist
    });
    setEditingChecklistId(null);
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    const updatedChecklist = localEvent.checklist.filter(item => item.id !== itemId);
    const total = updatedChecklist.length;
    const completed = updatedChecklist.filter(t => t.done).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    handleUpdate({
      ...localEvent,
      checklist: updatedChecklist,
      completionRate: rate
    });
  };

  // 2. Tool Allocation Handlers
  const handleToolQtyChange = (itemId: string, qty: number) => {
    const item = allWarehouseItems.find(w => w.id === itemId);
    if (!item) return;

    let updatedTools = [...localEvent.assignedTools];
    const existingIndex = updatedTools.findIndex(t => t.id === itemId);
    const currentQty = existingIndex > -1 ? updatedTools[existingIndex].allocatedQty : 0;
    const otherReserved = getReservedInOtherEvents(itemId);
    const maxAvailable = item.stock + currentQty - otherReserved;

    if (qty > maxAvailable) {
      alert(`⚠️ Erro de Reserva WMS: Estoque insuficiente! Existem ${otherReserved} unidade(s) reservada(s) em outros stands neste mesmo período. Máximo disponível para este stand: ${maxAvailable}.`);
      return;
    }

    if (qty <= 0) {
      updatedTools = updatedTools.filter(t => t.id !== itemId);
    } else {
      if (existingIndex > -1) {
        updatedTools[existingIndex] = { ...updatedTools[existingIndex], allocatedQty: qty };
      } else {
        updatedTools.push({
          id: item.id,
          name: item.name,
          type: item.type,
          allocatedQty: qty
        });
      }
    }

    handleUpdate({
      ...localEvent,
      assignedTools: updatedTools
    });
  };

  // 3. Staff Handlers & Terceirizados
  const toggleEmployee = (empId: string) => {
    const isAssigned = localEvent.assignedEmployees.some(e => e.id === empId);
    let updatedStaff = [...localEvent.assignedEmployees];

    if (isAssigned) {
      updatedStaff = updatedStaff.filter(e => e.id !== empId);
    } else {
      const emp = allEmployees.find(e => e.id === empId);
      if (emp) {
        if (emp.documentStatus === "pending") {
          alert(`Atenção: Os documentos gerais de ${emp.name} estão pendentes no RH. Homologue o profissional antes.`);
        }
        updatedStaff.push({
          id: emp.id,
          name: emp.name,
          role: emp.role,
          documentStatus: emp.documentStatus,
          equipe: "Equipe Interna",
          horario: "08:00 - 18:00"
        });
      }
    }

    handleUpdate({
      ...localEvent,
      assignedEmployees: updatedStaff
    });
  };

  const handleAddTerceirizadoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terceirizadoName.trim()) return;
    const newTerceirizado: AssignedEmployee = {
      id: `terc-${Date.now()}`,
      name: terceirizadoName.trim(),
      role: terceirizadoRole,
      documentStatus: "complete",
      equipe: terceirizadoEquipe,
      horario: terceirizadoHorario,
      observacoes: terceirizadoObs,
      terceirizado: true
    };
    const updatedStaff = [...localEvent.assignedEmployees, newTerceirizado];
    handleUpdate({
      ...localEvent,
      assignedEmployees: updatedStaff
    });
    setTerceirizadoName("");
    setTerceirizadoObs("");
    setShowAddTerceirizado(false);
  };

  // 4. Travel Handlers
  const handleTravelChange = (field: "hotelName" | "hotelCheckin" | "flightDetails", value: string) => {
    handleUpdate({
      ...localEvent,
      [field]: value
    });
  };

  // 5. Document Handlers
  const simulateDocUpload = (docId: string) => {
    const updatedDocs = localEvent.docs.map((d) =>
      d.id === docId ? { ...d, status: d.status === "pending" ? "uploaded" as const : "approved" as const } : d
    );
    handleUpdate({
      ...localEvent,
      docs: updatedDocs
    });
  };

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      status: "uploaded" as const
    };
    handleUpdate({
      ...localEvent,
      docs: [...localEvent.docs, newDoc]
    });
    setNewDocName("");
  };

  const handleDeleteDoc = (docId: string) => {
    handleUpdate({
      ...localEvent,
      docs: localEvent.docs.filter(d => d.id !== docId)
    });
  };

  // 6. Costs Edit Handlers
  const handleCostChange = (category: keyof typeof localEvent.centroCusto, val: number) => {
    const newCC = {
      ...localEvent.centroCusto,
      [category]: val
    };
    const totalCost = Object.entries(newCC).reduce((acc, [key, v]) => {
      if (key === "fornecedoresDespesas") return acc;
      return acc + (typeof v === "number" ? v : 0);
    }, 0);
    handleUpdate({
      ...localEvent,
      centroCusto: newCC,
      custoRealizado: totalCost
    });
  };

  // 7. Configurable Production Sectors
  const handleAddProductionCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      status: "pendente" as const
    };
    setCustomProdCategories([...customProdCategories, newCat]);
    setNewCatName("");
  };

  const handleProductionCategoryStatusChange = (catId: string, newStatus: "pendente" | "em_andamento" | "concluido") => {
    setCustomProdCategories(prev => prev.map(c => c.id === catId ? { ...c, status: newStatus } : c));
  };

  const handleDeleteProductionCategory = (catId: string) => {
    setCustomProdCategories(prev => prev.filter(c => c.id !== catId));
  };

  // 8. Convention Center National Search & Registration
  const handleSelectVenue = (rules: ConventionCenterRules) => {
    const newCC = {
      ...localEvent.centroCusto,
      taxasOrganizador: rules.taxaEnergia + rules.taxaLimpeza
    };
    const totalCost = Object.entries(newCC).reduce((acc, [key, v]) => {
      if (key === "fornecedoresDespesas") return acc;
      return acc + (typeof v === "number" ? v : 0);
    }, 0);

    handleUpdate({
      ...localEvent,
      centroConvencoes: rules.nome,
      regrasCentro: rules,
      centroCusto: newCC,
      custoRealizado: totalCost
    });
  };

  const handleAddCustomVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVenueName.trim() || !customVenueCidade.trim()) return;
    const newRules: ConventionCenterRules = {
      nome: `${customVenueName.trim()} (${customVenueCidade.trim()})`,
      taxaEnergia: customVenueTaxaEnergia,
      taxaLimpeza: customVenueTaxaLimpeza,
      limiteAltura: customVenueAltura,
      artObrigatoria: true,
      brigadistaObrigatorio: false,
      seguroObrigatorio: true,
      estacionamento: 50,
      contatoGestor: "Gestão Local do Evento"
    };
    CONVENTION_CENTERS.push(newRules);
    handleSelectVenue(newRules);
    setShowAddVenue(false);
    setCustomVenueName("");
    setCustomVenueCidade("");
  };

  // Calculations for costs tab
  const totalCost = Object.entries(localEvent.centroCusto || {}).reduce((acc, [key, v]) => {
    if (key === "fornecedoresDespesas") return acc;
    return acc + (typeof v === "number" ? v : 0);
  }, 0);
  const netProfit = localEvent.valorContratado - totalCost;
  const marginPercent = localEvent.valorContratado > 0 ? (netProfit / localEvent.valorContratado) * 100 : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "850px" }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="modal-title-box" style={{ flexGrow: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--accent-secondary)", fontFamily: "monospace" }}>CÓDIGO: {localEvent.codigo}</span>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", backgroundColor: "var(--accent-glow)", color: "var(--accent)", fontWeight: "600" }}>{localEvent.phase}</span>
            </div>
            
            {isEditingBasic ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px", maxWidth: "450px" }}>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "14px", fontWeight: "700" }} 
                />
                <input 
                  type="text" 
                  value={editClient} 
                  onChange={(e) => setEditClient(e.target.value)} 
                  placeholder="Cliente" 
                  style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }} 
                />
                <select 
                  value={editPhase} 
                  onChange={(e) => setEditPhase(e.target.value)} 
                  style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                >
                  <option value="Briefing">Briefing</option>
                  <option value="Orçamento">Orçamento</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Produção">Produção</option>
                  <option value="Montagem">Montagem</option>
                  <option value="Evento">Evento</option>
                  <option value="Desmontagem">Desmontagem</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
                <button className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={handleSaveBasicEdit}>
                  <Save size={12} /> Salvar Dados Básicos
                </button>
              </div>
            ) : (
              <div>
                <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {localEvent.name}
                  <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setIsEditingBasic(true)} title="Editar dados do evento">
                    <Edit2 size={14} />
                  </button>
                </h3>
                <span className="modal-subtitle">Cliente: {localEvent.client} | Responsável: JCEventos</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn-danger" style={{ padding: "6px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }} onClick={handleDeleteThisEvent}>
              <Trash2 size={12} /> Excluir Evento
            </button>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          <button className={`modal-tab ${activeTab === "checklist" ? "active" : ""}`} onClick={() => setActiveTab("checklist")}>Checklist</button>
          <button className={`modal-tab ${activeTab === "propostas" ? "active" : ""}`} onClick={() => setActiveTab("propostas")}>Propostas ({linkedOrcamentos.length})</button>
          <button className={`modal-tab ${activeTab === "producao" ? "active" : ""}`} onClick={() => setActiveTab("producao")}>Grupos Produção</button>
          <button className={`modal-tab ${activeTab === "regras" ? "active" : ""}`} onClick={() => setActiveTab("regras")}>Centro Convenções</button>
          <button className={`modal-tab ${activeTab === "tools" ? "active" : ""}`} onClick={() => setActiveTab("tools")}>Ferramentas &amp; WMS</button>
          <button className={`modal-tab ${activeTab === "staff" ? "active" : ""}`} onClick={() => setActiveTab("staff")}>Escala de Equipe</button>
          <button className={`modal-tab ${activeTab === "travel" ? "active" : ""}`} onClick={() => setActiveTab("travel")}>Logística Viagem</button>
          <button className={`modal-tab ${activeTab === "docs" ? "active" : ""}`} onClick={() => setActiveTab("docs")}>Docs Pavilhão</button>
          <button className={`modal-tab ${activeTab === "costs" ? "active" : ""}`} onClick={() => setActiveTab("costs")}>Centro de Custos</button>
          <button className={`modal-tab ${activeTab === "route" ? "active" : ""}`} onClick={() => setActiveTab("route")}>Mapa &amp; Rota</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ minHeight: "400px" }}>
          
          {/* TAB PROPOSTAS COMERCIAIS */}
          {activeTab === "propostas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "var(--accent)" }}>
                  Propostas Comerciais & Orçamentos Vinculados
                </h4>
                <span className="badge badge-info" style={{ fontSize: "11px" }}>
                  {linkedOrcamentos.length} Proposta(s) Encontrada(s)
                </span>
              </div>

              {linkedOrcamentos.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "12px", color: "var(--text-muted)", fontSize: "12px" }}>
                  <FileText size={36} style={{ opacity: 0.3, marginBottom: "8px", display: "block", margin: "0 auto 8px" }} />
                  <div>Nenhuma proposta comercial vinculada a este evento até o momento.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {linkedOrcamentos.map((orc) => (
                    <div 
                      key={orc.id} 
                      style={{ 
                        background: "var(--bg-card)", 
                        border: "1px solid var(--border)", 
                        borderRadius: "10px", 
                        padding: "14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--accent)" }}>{orc.codigo}</strong>
                          <span className="badge badge-secondary" style={{ fontSize: "10px" }}>{orc.status.toUpperCase()}</span>
                        </div>
                        <h5 style={{ margin: "4px 0 2px 0", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                          {orc.nomeOrcamento || orc.codigo}
                        </h5>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          Cliente: {orc.cliente} · Válido até: {orc.validoAte}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent)" }}>
                          R$ {orc.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{orc.tipo === "simplificado" ? "Valor Fechado" : "Itens Detalhados"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* TAB 1: CHECKLIST (Full CRUD) */}
          {activeTab === "checklist" && (
            <div className="checklist-container">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="text-xs text-muted semibold uppercase" style={{ margin: 0 }}>
                  Tarefas do Stand ({localEvent.completionRate}% Concluído)
                </span>
              </div>

              {/* Form de adicionar item no checklist */}
              <form onSubmit={handleAddChecklistItem} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <input 
                  type="text" 
                  placeholder="Nova tarefa ou item de checklist..." 
                  value={newChecklistText} 
                  onChange={(e) => setNewChecklistText(e.target.value)} 
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }} 
                />
                <button type="submit" className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                  <Plus size={14} /> Adicionar
                </button>
              </form>

              {/* Lista com Edição e Exclusão */}
              {localEvent.checklist.map((item) => (
                <div key={item.id} className="checklist-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {editingChecklistId === item.id ? (
                    <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                      <input 
                        type="text" 
                        value={editingChecklistText} 
                        onChange={(e) => setEditingChecklistText(e.target.value)} 
                        style={{ flex: 1, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "13px" }}
                      />
                      <button className="btn-primary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleSaveChecklistEdit(item.id)}>Salvar</button>
                    </div>
                  ) : (
                    <div className="checklist-item-left" onClick={() => toggleChecklistItem(item.id)} style={{ cursor: "pointer", flex: 1 }}>
                      <div className={`checkbox ${item.done ? "checked" : ""}`}>
                        {item.done && "✓"}
                      </div>
                      <span className={`checklist-text ${item.done ? "checked" : ""}`}>
                        {item.text}
                      </span>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "6px", marginLeft: "12px" }}>
                    {editingChecklistId !== item.id && (
                      <button 
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                        onClick={() => { setEditingChecklistId(item.id); setEditingChecklistText(item.text); }}
                      >
                        <Edit2 size={13} />
                      </button>
                    )}
                    <button 
                      style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}
                      onClick={() => handleDeleteChecklistItem(item.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: GRUPOS DE PRODUÇÃO (Totalmente Configurável) */}
          {activeTab === "producao" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="text-xs text-muted semibold uppercase">
                  Gestão Total de Grupos e Etapas de Produção
                </span>
              </div>

              {/* Form adicionar novo grupo de produção */}
              <form onSubmit={handleAddProductionCategory} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input 
                  type="text" 
                  placeholder="Novo grupo de produção (ex: 🔩 Serralheria, 🪵 Marcenaria Fina)..." 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                />
                <button type="submit" className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                  <Plus size={14} /> Adicionar Categoria
                </button>
              </form>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {customProdCategories.map((cat) => (
                  <div key={cat.id} style={{ border: "1px solid var(--border)", padding: "12px 14px", borderRadius: "12px", backgroundColor: "var(--bg-card)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{cat.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select 
                        value={cat.status} 
                        onChange={(e) => handleProductionCategoryStatusChange(cat.id, e.target.value as any)}
                        style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "11px", background: "var(--bg-card)", color: "var(--text-primary)", outline: "none" }}
                      >
                        <option value="pendente">🔴 Pendente</option>
                        <option value="em_andamento">🟡 Em Produção</option>
                        <option value="concluido">🟢 Concluído</option>
                      </select>
                      <button 
                        style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}
                        onClick={() => handleDeleteProductionCategory(cat.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CENTRO DE CONVENÇÕES & PESQUISA NACIONAL */}
          {activeTab === "regras" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="text-xs text-muted semibold uppercase">
                  Pesquisa Nacional e Cadastro de Centros de Convenções do Brasil
                </span>
                <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => setShowAddVenue(!showAddVenue)}>
                  + Cadastrar Novo Pavilhão
                </button>
              </div>

              {/* Form de cadastrar pavilhão customizado */}
              {showAddVenue && (
                <form onSubmit={handleAddCustomVenue} style={{ padding: "14px", border: "1px solid var(--accent)", borderRadius: "12px", backgroundColor: "var(--accent-glow)", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h5 style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)", margin: 0 }}>Cadastrar Novo Local / Pavilhão no Brasil</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input type="text" placeholder="Nome do Pavilhão (Ex: Expominas)" value={customVenueName} onChange={(e) => setCustomVenueName(e.target.value)} required style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    <input type="text" placeholder="Cidade / UF (Ex: Belo Horizonte/MG)" value={customVenueCidade} onChange={(e) => setCustomVenueCidade(e.target.value)} required style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    <input type="number" placeholder="Taxa de Energia R$" value={customVenueTaxaEnergia} onChange={(e) => setCustomVenueTaxaEnergia(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    <input type="number" placeholder="Taxa de Limpeza R$" value={customVenueTaxaLimpeza} onChange={(e) => setCustomVenueTaxaLimpeza(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowAddVenue(false)} style={{ padding: "6px 10px", fontSize: "11px" }}>Cancelar</button>
                    <button type="submit" className="btn-primary" style={{ padding: "6px 12px", fontSize: "11px" }}>Salvar Pavilhão</button>
                  </div>
                </form>
              )}

              {/* Busca por cidade/nome */}
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou cidade do Brasil..." 
                value={searchVenue} 
                onChange={(e) => setSearchVenue(e.target.value)} 
                style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {CONVENTION_CENTERS
                  .filter(c => c.nome.toLowerCase().includes(searchVenue.toLowerCase()))
                  .map((c) => (
                    <div 
                      key={c.nome} 
                      onClick={() => handleSelectVenue(c)}
                      style={{ 
                        border: localEvent.centroConvencoes === c.nome ? "2px solid var(--accent)" : "1px solid var(--border)", 
                        padding: "12px", borderRadius: "10px", backgroundColor: "var(--bg-card)", cursor: "pointer" 
                      }}
                    >
                      <strong style={{ fontSize: "13px", color: "var(--text-primary)", display: "block" }}>{c.nome}</strong>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Energia: R$ {c.taxaEnergia} | Limpeza: R$ {c.taxaLimpeza} | Altura: {c.limiteAltura}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: TOOLS & WMS ALLOCATION */}
          {activeTab === "tools" && (
            <div>
              <span className="text-xs text-muted semibold uppercase mb-20" style={{ display: "block" }}>
                Alocação e Manutenção de Ferramentas / Equipamentos
              </span>
              <table className="sheet-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Item</th>
                    <th style={{ padding: "8px" }}>Tipo</th>
                    <th style={{ padding: "8px" }}>Posição Física</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>Estoque Total</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>Alocado no Stand</th>
                  </tr>
                </thead>
                <tbody>
                  {allWarehouseItems.map((item) => {
                    const assigned = localEvent.assignedTools.find(t => t.id === item.id);
                    const currentQty = assigned ? assigned.allocatedQty : 0;
                    const otherReserved = getReservedInOtherEvents(item.id);
                    const maxAvailable = item.stock + currentQty - otherReserved;
                    
                    return (
                      <tr key={item.id} className="sheet-row" style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="semibold" style={{ padding: "8px" }}>{item.name}</td>
                        <td style={{ padding: "8px" }}>
                          <span className={`badge ${item.type === "tool" ? "badge-pt" : "badge-en"}`}>
                            {item.type === "tool" ? "Ferramenta" : "Móvel"}
                          </span>
                        </td>
                        <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                          Galpão {item.localizacaoFisica?.galpao || "A"} • Prat. {item.localizacaoFisica?.prateleira || "01"}
                        </td>
                        <td style={{ padding: "8px", textAlign: "center", color: "var(--text-secondary)" }}>{item.stock} un</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <input 
                            type="number" 
                            min="0" 
                            max={maxAvailable} 
                            value={currentQty} 
                            onChange={(e) => handleToolQtyChange(item.id, parseInt(e.target.value) || 0)}
                            style={{ width: "60px", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "4px", textAlign: "center" }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: STAFF & TERCEIRIZADOS DE ÚLTIMA HORA */}
          {activeTab === "staff" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="text-xs text-muted semibold uppercase">
                  Escala da Equipe e Inclusão de Terceirizados
                </span>
                <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => setShowAddTerceirizado(!showAddTerceirizado)}>
                  <UserPlus size={13} /> Terceirizado Última Hora
                </button>
              </div>

              {/* Form Terceirizado de Última Hora */}
              {showAddTerceirizado && (
                <form onSubmit={handleAddTerceirizadoSubmit} style={{ padding: "14px", border: "1px solid var(--accent)", borderRadius: "12px", backgroundColor: "var(--accent-glow)", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <h5 style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)", margin: 0 }}>Escalar Terceirizado / Freelancer de Última Hora</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input type="text" placeholder="Nome Completo do Colaborador" value={terceirizadoName} onChange={(e) => setTerceirizadoName(e.target.value)} required style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    <input type="text" placeholder="Função no Evento (ex: Pintor Espetáculo)" value={terceirizadoRole} onChange={(e) => setTerceirizadoRole(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    <input type="text" placeholder="Horário (ex: 08:00 às 20:00)" value={terceirizadoHorario} onChange={(e) => setTerceirizadoHorario(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    <input type="text" placeholder="Observações / Diária" value={terceirizadoObs} onChange={(e) => setTerceirizadoObs(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowAddTerceirizado(false)} style={{ padding: "6px 10px", fontSize: "11px" }}>Cancelar</button>
                    <button type="submit" className="btn-primary" style={{ padding: "6px 12px", fontSize: "11px" }}>Adicionar Terceirizado</button>
                  </div>
                </form>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <h5 style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent)", margin: "4px 0" }}>Equipe Escala Interna</h5>
                {allEmployees.map((emp) => {
                  const isChecked = localEvent.assignedEmployees.some(e => e.id === emp.id);
                  return (
                    <div key={emp.id} className="staff-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--bg-card)" }}>
                      <div className="staff-row-info" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="staff-row-avatar" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent-glow)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                          {emp.name.substring(0, 1)}
                        </div>
                        <div>
                          <strong className="text-sm" style={{ display: "block" }}>{emp.name}</strong>
                          <span className="text-xs text-muted">{emp.role}</span>
                        </div>
                      </div>
                      
                      <button 
                        className={isChecked ? "btn-danger text-xs" : "btn-primary text-xs"}
                        onClick={() => toggleEmployee(emp.id)}
                        style={{ padding: "4px 10px", borderRadius: "8px" }}
                      >
                        {isChecked ? "Remover" : "Escalar"}
                      </button>
                    </div>
                  );
                })}

                <h5 style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-secondary)", marginTop: "12px", marginBottom: "4px" }}>Terceirizados &amp; Escala de Última Hora</h5>
                {localEvent.assignedEmployees.filter(e => e.terceirizado || !allEmployees.some(a => a.id === e.id)).length === 0 ? (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>Nenhum terceirizado de última hora escalado.</span>
                ) : (
                  localEvent.assignedEmployees.filter(e => e.terceirizado || !allEmployees.some(a => a.id === e.id)).map(terc => (
                    <div key={terc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--accent)", borderRadius: "12px", background: "var(--bg-main)" }}>
                      <div>
                        <strong className="text-sm" style={{ display: "block", color: "var(--accent)" }}>{terc.name} (Terceirizado)</strong>
                        <span className="text-xs text-muted">{terc.role} | {terc.horario}</span>
                      </div>
                      <button 
                        className="btn-danger text-xs" 
                        onClick={() => {
                          const updated = localEvent.assignedEmployees.filter(e => e.id !== terc.id);
                          handleUpdate({ ...localEvent, assignedEmployees: updated });
                        }}
                        style={{ padding: "4px 10px", borderRadius: "8px" }}
                      >
                        Remover
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: LOGÍSTICA E VIAGEM */}
          {activeTab === "travel" && (
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Hotel / Acomodação</label>
                <input 
                  type="text" 
                  value={localEvent.hotelName || ""} 
                  onChange={(e) => handleTravelChange("hotelName", e.target.value)}
                  placeholder="Nome do Hotel" 
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Data Check-In</label>
                <input 
                  type="date" 
                  value={localEvent.hotelCheckin || ""} 
                  onChange={(e) => handleTravelChange("hotelCheckin", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Detalhes de Voos / Logística Fretes</label>
                <textarea 
                  rows={4}
                  value={localEvent.flightDetails || ""} 
                  onChange={(e) => handleTravelChange("flightDetails", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                />
              </div>
            </div>
          )}

          {/* TAB 7: DOCUMENTOS DO PAVILHÃO (Sem limitação de tipos) */}
          {activeTab === "docs" && (
            <div>
              <span className="text-xs text-muted semibold uppercase mb-20" style={{ display: "block" }}>
                Documentos Anexados do Pavilhão (Sem Limite de Categoria)
              </span>

              <form onSubmit={handleAddCustomDoc} style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                <input 
                  type="text" 
                  placeholder="Nome do Novo Documento (Ex: Licença Sanitária, ART, Planta Baixa)..." 
                  value={newDocName} 
                  onChange={(e) => setNewDocName(e.target.value)} 
                  style={{ flex: 1, minWidth: "240px", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                />
                <label className="btn-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", padding: "8px 14px", fontSize: "12px" }}>
                  <Upload size={14} /> Selecionar Arquivo
                  <input 
                    type="file" 
                    style={{ display: "none" }} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        if (!newDocName) setNewDocName(file.name);
                      }
                    }} 
                  />
                </label>
                <button type="submit" className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                  <Plus size={14} /> Anexar Documento
                </button>
              </form>
              
              <FileUploadManager
                moduleFolder="eventos"
                entityId={localEvent.id}
                documents={(localEvent.docs || []).map(d => ({
                  id: d.id,
                  name: d.name,
                  category: "planta_baixa",
                  sizeBytes: 1024 * 500,
                  uploadedAt: new Date().toISOString(),
                  fileUrl: "#"
                }))}
                onUploadSuccess={(newDoc) => {
                  const updatedDocs = [...localEvent.docs, { id: newDoc.id, name: newDoc.name, status: "uploaded" as const }];
                  handleUpdate({ ...localEvent, docs: updatedDocs });
                }}
                onDeleteDocument={(docId) => handleDeleteDoc(docId)}
              />
            </div>
          )}

          {/* TAB 8: CENTRO DE CUSTOS & ESTIMATIVA DE ORÇAMENTO */}
          {activeTab === "costs" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
              <div style={{ backgroundColor: "var(--bg-main)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent)" }}>ESTIMAR ORÇAMENTO DO PROJETO</span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Valores Estimados vs Realizados</span>
                </div>

                <div style={{ margin: "6px 0" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Valor Total Fechado com Cliente (R$)</label>
                  <input 
                    type="number" 
                    value={localEvent.valorContratado || 0} 
                    onChange={(e) => handleUpdate({ ...localEvent, valorContratado: parseFloat(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontWeight: "700", color: "var(--accent)" }}
                  />
                </div>

                {Object.keys(localEvent.centroCusto || {})
                  .filter(k => k !== "fornecedoresDespesas")
                  .map((catKey) => {
                    const typedKey = catKey as keyof typeof localEvent.centroCusto;
                    return (
                      <div key={catKey} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                        <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{catKey}</span>
                        <input 
                          type="number" 
                          value={(localEvent.centroCusto[typedKey] as number) || 0}
                          onChange={(e) => handleCostChange(typedKey, parseFloat(e.target.value) || 0)}
                          style={{ width: "90px", padding: "4px 6px", border: "1px solid var(--border)", borderRadius: "4px", textAlign: "right" }}
                        />
                      </div>
                    );
                  })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>CUSTO TOTAL REALIZADO / ESTIMADO</span>
                  <strong style={{ fontSize: "18px", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>
                    R$ {(localEvent.custoRealizado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>LUCRO LÍQUIDO PREVISTO</span>
                  <strong style={{ fontSize: "20px", color: netProfit >= 0 ? "var(--success-text)" : "var(--danger)", display: "block", marginTop: "4px" }}>
                    R$ {netProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </strong>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "6px" }}>
                    Margem Operacional: {((netProfit / (localEvent.valorContratado || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: MAPA E ROTA COMPLETA */}
          {activeTab === "route" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", backgroundColor: "var(--bg-card)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Navigation size={22} style={{ color: "var(--accent)" }} />
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>Rota de Transporte &amp; Logística da Montagem</h4>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Endereço Oficial do Pavilhão de Eventos</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "4px", fontSize: "12px" }}>
                  <div style={{ background: "var(--bg-main)", padding: "10px", borderRadius: "8px" }}>
                    <strong>Ponto de Partida:</strong><br />
                    Depósito Central JC Eventos (Natal/RN)
                  </div>
                  <div style={{ background: "var(--bg-main)", padding: "10px", borderRadius: "8px" }}>
                    <strong>Ponto de Chegada:</strong><br />
                    {localEvent.mapsRoute.endereco}
                  </div>
                  <div style={{ background: "var(--bg-main)", padding: "10px", borderRadius: "8px" }}>
                    <strong>Distância Estimada:</strong><br />
                    {localEvent.mapsRoute.distanciaKm} km
                  </div>
                  <div style={{ background: "var(--bg-main)", padding: "10px", borderRadius: "8px" }}>
                    <strong>Tempo de Deslocamento:</strong><br />
                    {localEvent.mapsRoute.tempoEstimado}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <a 
                    href={sanitizeUrl(localEvent.mapsRoute.linkMaps)} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-primary" 
                    style={{ textDecoration: "none", fontSize: "12px", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <MapPin size={14} /> Abrir no Google Maps / Waze
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
