import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  FileText, CheckSquare, Plus, Trash2, Camera, ShieldAlert, 
  User, MapPin, PenTool, CheckCircle, ChevronRight, X, Clock, HelpCircle, Printer, FileDown
} from "lucide-react";
import type { Project, Employee, WarehouseItem, OSComentario, OSFoto, OSAssinaturas, AssignedEmployee } from "../types";
import logoImg from "../assets/logo.png";
import { exportElementToPDF } from "../utils/pdfGenerator";

interface OrdensServicoProps {
  events: Project[];
  allEmployees: Employee[];
  allWarehouseItems: WarehouseItem[];
  onUpdateEvent: (updated: Project) => void;
  initialOsId?: string;
}

export default function OrdensServico({
  events,
  allEmployees,
  allWarehouseItems,
  onUpdateEvent,
  initialOsId = ""
}: OrdensServicoProps) {
  const [selectedOsId, setSelectedOsId] = useState<string>(initialOsId);

  // Deep-link: when parent sets initialOsId (from notifications/tasks panel), open that OS
  useEffect(() => {
    if (initialOsId) setSelectedOsId(initialOsId);
  }, [initialOsId]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "muito_alta" | "alta" | "media" | "baixa">("all");
  const [sortByPriority, setSortByPriority] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"checklist" | "items" | "team" | "photos" | "signatures" | "logs">("checklist");
  const selectedOS = events.find(o => o.id === selectedOsId);

  // Priority calculation & sorting helpers
  const calcAutoPriority = (dataMontagemStr: string): "muito_alta" | "alta" | "media" | "baixa" => {
    if (!dataMontagemStr) return "media";
    const montagem = new Date(dataMontagemStr);
    const now = new Date();
    const diffDays = Math.ceil((montagem.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return "muito_alta";
    if (diffDays <= 7) return "alta";
    if (diffDays <= 15) return "media";
    return "baixa";
  };

  const getOSPriority = (os: Project): "muito_alta" | "alta" | "media" | "baixa" => {
    if (os.prioridadeModo === "manual" && os.prioridade) {
      return os.prioridade;
    }
    return calcAutoPriority(os.dataMontagem);
  };

  const priorityWeight: Record<string, number> = {
    muito_alta: 4,
    alta: 3,
    media: 2,
    baixa: 1
  };

  const priorityLabel: Record<string, string> = {
    muito_alta: "🔴 Muito Alta",
    alta: "🟧 Alta",
    media: "🟡 Média",
    baixa: "🔵 Baixa"
  };

  // Team addition form state
  const [addEmpId, setAddEmpId] = useState(allEmployees[0]?.id || "");
  const [addEmpRole, setAddEmpRole] = useState("Montador Cenográfico");
  const [addEmpEquipe, setAddEmpEquipe] = useState("Equipe Principal");
  const [addEmpHorario, setAddEmpHorario] = useState("08:00 - 18:00");

  const handleAddEmployeeToOS = () => {
    if (!selectedOS) return;
    const emp = allEmployees.find(e => e.id === addEmpId);
    if (!emp) return;
    if (selectedOS.assignedEmployees.some(e => e.id === emp.id)) {
      alert("Este colaborador já está escalado nesta Ordem de Serviço!");
      return;
    }
    const newAssigned: AssignedEmployee = {
      id: emp.id,
      name: emp.name,
      role: addEmpRole || emp.role,
      documentStatus: emp.documentStatus || "complete",
      equipe: addEmpEquipe,
      horario: addEmpHorario,
      observacoes: ""
    };
    onUpdateEvent({
      ...selectedOS,
      assignedEmployees: [...selectedOS.assignedEmployees, newAssigned]
    });
  };

  const handleRemoveEmployeeFromOS = (empId: string) => {
    if (!selectedOS) return;
    onUpdateEvent({
      ...selectedOS,
      assignedEmployees: selectedOS.assignedEmployees.filter(e => e.id !== empId)
    });
  };

  const handleUpdateOSAssignedEmp = (empId: string, updates: Partial<AssignedEmployee>) => {
    if (!selectedOS) return;
    onUpdateEvent({
      ...selectedOS,
      assignedEmployees: selectedOS.assignedEmployees.map(e => e.id === empId ? { ...e, ...updates } : e)
    });
  };

  // Signature canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState<"cliente" | "responsavel">("cliente");
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Local comments state
  const [commentText, setCommentText] = useState("");

  // Material allocation state
  const [selectedMaterialId, setSelectedMaterialId] = useState(allWarehouseItems[0]?.id || "");
  const [materialQty, setMaterialQty] = useState(1);

  // Add Comment to OS
  const handleAddComment = () => {
    if (!selectedOS || !commentText.trim()) return;
    const newComment: OSComentario = {
      id: `c-${Date.now()}`,
      autor: "JCEventos (Coordenador)",
      texto: commentText,
      date: new Date().toLocaleString("pt-BR")
    };
    const log = {
      id: `log-${Date.now()}`,
      campo: "Comentários",
      antes: "-",
      depois: `Novo comentário: "${commentText.substring(0, 20)}..."`,
      date: new Date().toISOString().split("T")[0],
      usuario: "JCEventos (Coordenador)"
    };
    onUpdateEvent({
      ...selectedOS,
      comentarios: [...(selectedOS.comentarios || []), newComment],
      historicoAlteracoes: [...(selectedOS.historicoAlteracoes || []), log]
    });
    setCommentText("");
  };

  // Add Equipment / Material allocation to OS
  const handleAddMaterial = () => {
    if (!selectedOS) return;
    const item = allWarehouseItems.find(i => i.id === selectedMaterialId);
    if (!item) return;

    let updatedTools = [...(selectedOS.assignedTools || [])];
    const existingIndex = updatedTools.findIndex(t => t.id === selectedMaterialId);

    if (existingIndex > -1) {
      updatedTools[existingIndex] = { 
        ...updatedTools[existingIndex], 
        allocatedQty: updatedTools[existingIndex].allocatedQty + materialQty 
      };
    } else {
      updatedTools.push({
        id: item.id,
        name: item.name,
        type: item.type,
        allocatedQty: materialQty
      });
    }

    const log = {
      id: `log-${Date.now()}`,
      campo: "Equipamentos/Materiais",
      antes: "-",
      depois: `Alocado ${materialQty}x de "${item.name}"`,
      date: new Date().toISOString().split("T")[0],
      usuario: "JCEventos (Coordenador)"
    };

    onUpdateEvent({
      ...selectedOS,
      assignedTools: updatedTools,
      historicoAlteracoes: [...(selectedOS.historicoAlteracoes || []), log]
    });
  };

  const handleRemoveMaterial = (itemId: string) => {
    if (!selectedOS) return;
    const item = selectedOS.assignedTools.find(i => i.id === itemId);
    if (!item) return;

    const log = {
      id: `log-${Date.now()}`,
      campo: "Equipamentos/Materiais",
      antes: `Alocado: ${item.allocatedQty}x`,
      depois: "Removido da OS",
      date: new Date().toISOString().split("T")[0],
      usuario: "JCEventos (Coordenador)"
    };

    onUpdateEvent({
      ...selectedOS,
      assignedTools: selectedOS.assignedTools.filter(t => t.id !== itemId),
      historicoAlteracoes: [...(selectedOS.historicoAlteracoes || []), log]
    });
  };

  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleDownloadOSPdf = async () => {
    if (!selectedOS) return;
    setIsPdfLoading(true);
    try {
      const fileName = `OrdemDeServico_${selectedOS.codigo}_${selectedOS.client.replace(/[^a-zA-Z0-9]/g, "_")}`;
      await exportElementToPDF("print-os-dossier", fileName);
    } catch (err) {
      console.error("Erro ao gerar PDF da OS:", err);
      window.print();
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Real Photo Upload Handler with FileReader (Base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, itemLabel?: string) => {
    if (!selectedOS || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const photoName = itemLabel ? `[Checklist: ${itemLabel}] ${file.name}` : file.name;

      const newPhoto: OSFoto = {
        id: `photo-${Date.now()}`,
        name: photoName,
        url: dataUrl,
        date: new Date().toLocaleString("pt-BR")
      };

      const log = {
        id: `log-${Date.now()}`,
        campo: "Fotos/Evidências",
        antes: "-",
        depois: `Anexada foto: "${photoName}"`,
        date: new Date().toISOString().split("T")[0],
        usuario: "JCEventos (Coordenador)"
      };

      onUpdateEvent({
        ...selectedOS,
        fotos: [...(selectedOS.fotos || []), newPhoto],
        historicoAlteracoes: [...(selectedOS.historicoAlteracoes || []), log]
      });
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (photoId: string) => {
    if (!selectedOS) return;
    const photo = selectedOS.fotos?.find(p => p.id === photoId);
    if (!photo) return;

    const log = {
      id: `log-${Date.now()}`,
      campo: "Fotos/Evidências",
      antes: `Foto: ${photo.name}`,
      depois: "Removida",
      date: new Date().toISOString().split("T")[0],
      usuario: "JCEventos (Coordenador)"
    };

    onUpdateEvent({
      ...selectedOS,
      fotos: (selectedOS.fotos || []).filter(p => p.id !== photoId),
      historicoAlteracoes: [...(selectedOS.historicoAlteracoes || []), log]
    });
  };

  // Signature Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#144580";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedOS) return;
    const dataUrl = canvas.toDataURL("image/png");

    const currentSigs: OSAssinaturas = selectedOS.assinaturas || {};
    const updatedSigs = signatureType === "cliente" 
      ? { ...currentSigs, clienteAssinatura: dataUrl, dataAssinatura: new Date().toLocaleDateString("pt-BR") }
      : { ...currentSigs, responsavelAssinatura: dataUrl, dataAssinatura: new Date().toLocaleDateString("pt-BR") };

    const log = {
      id: `log-${Date.now()}`,
      campo: "Assinaturas",
      antes: "-",
      depois: `Assinatura de aceite do ${signatureType} registrada`,
      date: new Date().toISOString().split("T")[0],
      usuario: "JCEventos (Coordenador)"
    };

    onUpdateEvent({
      ...selectedOS,
      assinaturas: updatedSigs,
      historicoAlteracoes: [...(selectedOS.historicoAlteracoes || []), log]
    });
    setIsSignatureModalOpen(false);
    alert(`Assinatura do ${signatureType} registrada com sucesso!`);
  };

  // Status and Priority updates
  const handleOSFieldUpdate = (field: "prioridade" | "phase", val: string) => {
    if (!selectedOS) return;
    const log = {
      id: `log-${Date.now()}`,
      campo: field === "prioridade" ? "Prioridade" : "Status/Fase OS",
      antes: selectedOS[field] || "Não definida",
      depois: val,
      date: new Date().toISOString().split("T")[0],
      usuario: "JCEventos (Coordenador)"
    };

    onUpdateEvent({
      ...selectedOS,
      [field]: val,
      historicoAlteracoes: [...(selectedOS.historicoAlteracoes || []), log]
    });
  };

  const toggleChecklistItem = (id: string) => {
    if (!selectedOS) return;
    const updatedCheck = selectedOS.checklist.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    );

    const total = updatedCheck.length;
    const completed = updatedCheck.filter(t => t.done).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    onUpdateEvent({
      ...selectedOS,
      checklist: updatedCheck,
      completionRate: rate
    });
  };

  let filteredOSs = events.filter(os => {
    const matchesSearch = os.name.toLowerCase().includes(searchTerm.toLowerCase()) || os.client.toLowerCase().includes(searchTerm.toLowerCase()) || os.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const osPrio = getOSPriority(os);
    const matchesPriority = priorityFilter === "all" ? true : osPrio === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  if (sortByPriority) {
    filteredOSs = [...filteredOSs].sort((a, b) => priorityWeight[getOSPriority(b)] - priorityWeight[getOSPriority(a)]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "10px" }}>

      {/* OS List — full width, cards in horizontal row */}
      <div className="section-box no-print" style={{ height: "auto" }}>
        <div className="section-box-header" style={{ marginBottom: "14px" }}>
          <div>
            <h3 className="section-box-title" style={{ fontSize: "15px", fontWeight: "700" }}>
              <FileText size={16} style={{ color: "var(--accent)", marginRight: "6px" }} />
              Ordens de Serviço (OS) Operacionais
            </h3>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>{filteredOSs.length} OS encontrada(s)</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <input 
              type="text" 
              placeholder="Buscar OS, evento ou cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-card)", color: "var(--text-primary)", width: "200px" }}
            />
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "12px" }}
            >
              <option value="all">Todas Prioridades</option>
              <option value="muito_alta">🔴 Muito Alta</option>
              <option value="alta">🟧 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🔵 Baixa</option>
            </select>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSortByPriority(!sortByPriority)}
              style={{ padding: "6px 12px", fontSize: "11px", backgroundColor: sortByPriority ? "var(--accent)" : "transparent", color: sortByPriority ? "#fff" : "var(--text-primary)" }}
              title="Ordenar pela prioridade"
            >
              {sortByPriority ? "Prioridade ⬆️" : "Ordenar Prio"}
            </button>
            <span className="kanban-column-count">{events.length} Ativas</span>
          </div>
        </div>

        {/* Horizontal scrollable row of OS cards */}
        <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "8px" }}>
          {filteredOSs.map((os) => {
            const prio = getOSPriority(os);
            const prioBadge = prio === "muito_alta" ? "badge-danger" : prio === "alta" ? "badge-warning" : prio === "media" ? "badge-info" : "badge-muted";
            const isSelected = selectedOsId === os.id;
            return (
              <div 
                key={os.id} 
                onClick={() => setSelectedOsId(isSelected ? "" : os.id)}
                style={{
                  cursor: "pointer",
                  minWidth: "280px",
                  maxWidth: "320px",
                  flexShrink: 0,
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  borderTop: `4px solid ${isSelected ? "var(--accent)" : prio === "muito_alta" ? "#ef4444" : prio === "alta" ? "#f97316" : prio === "media" ? "#eab308" : "#6b7280"}`,
                  background: isSelected ? "var(--accent-glow)" : "var(--bg-card)",
                  color: "var(--text-primary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  boxShadow: isSelected ? "0 0 0 2px var(--accent)" : "var(--shadow-sm)",
                  transition: "all 0.15s ease"
                }}
              >
                {/* Top row: código + badges */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.5px", color: "var(--accent)" }}>{os.codigo}</strong>
                  <span className={`badge ${prioBadge}`} style={{ fontSize: "9px", padding: "2px 8px" }}>
                    {priorityLabel[prio] || prio.toUpperCase()}
                  </span>
                </div>

                {/* Event name */}
                <h4 style={{ fontSize: "13px", fontWeight: "700", margin: 0, lineHeight: "1.35", color: "var(--text-primary)" }}>
                  {os.name}
                </h4>

                {/* Client + Dates — left to right inline */}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Cliente:</span>
                    <span>{os.client}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", gap: "14px" }}>
                    <span><span style={{ fontWeight: 600 }}>Início:</span> {os.startDate}</span>
                    {os.dataMontagem && <span><span style={{ fontWeight: 600 }}>Mont.:</span> {os.dataMontagem}</span>}
                  </div>
                </div>

                {/* Status badge */}
                <span className="badge badge-secondary" style={{ fontSize: "10px", alignSelf: "flex-start", padding: "3px 10px" }}>
                  {os.phase}
                </span>

                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flexGrow: 1, height: "5px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${os.completionRate}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s" }}></div>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{os.completionRate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: OS detailed View & Edit form (rendered only when OS is selected) */}
      {selectedOS && (
        <div className="section-box no-print" style={{ height: "auto" }}>
          <div>
            {/* Header section of selected OS */}
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="text-xs text-muted">Ordem de Serviço (Dossiê Técnico)</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--accent)", margin: 0 }}>{selectedOS.codigo}</h3>
                    <button 
                      onClick={() => setIsPrintModalOpen(true)}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                      title="Imprimir/PDF Dossiê OS"
                    >
                      <Printer size={12} /> Imprimir Dossiê
                    </button>
                  </div>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", marginTop: "6px" }}>{selectedOS.name}</h4>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div>
                      <label className="text-xs text-muted" style={{ marginRight: "6px" }}>Status/Etapa:</label>
                      <select 
                        value={selectedOS.phase}
                        onChange={(e) => handleOSFieldUpdate("phase", e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "11px" }}
                      >
                        <option value="Novo orçamento">Novo orçamento</option>
                        <option value="Em negociação">Em negociação</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Projeto">Projeto</option>
                        <option value="Produção">Produção</option>
                        <option value="Compras">Compras</option>
                        <option value="Logística">Logística</option>
                        <option value="Evento acontecendo">Evento acontecendo</option>
                        <option value="Desmontagem">Desmontagem</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedOsId("")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center" }}
                      title="Fechar Detalhes da OS"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <label className="text-xs text-muted">Prioridade:</label>
                    <select 
                      value={selectedOS.prioridadeModo === "manual" ? (selectedOS.prioridade || getOSPriority(selectedOS)) : "auto"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "auto") {
                          onUpdateEvent({ ...selectedOS, prioridadeModo: "auto", prioridade: calcAutoPriority(selectedOS.dataMontagem) });
                        } else {
                          onUpdateEvent({ ...selectedOS, prioridadeModo: "manual", prioridade: val as any });
                        }
                      }}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "11px" }}
                    >
                      <option value="auto">🤖 Automática ({priorityLabel[getOSPriority(selectedOS)]})</option>
                      <option value="muito_alta">🔴 Muito Alta</option>
                      <option value="alta">🟧 Alta</option>
                      <option value="media">🟡 Média</option>
                      <option value="baixa">🔵 Baixa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px", background: "var(--bg-main)", padding: "10px", borderRadius: "8px", fontSize: "12px" }}>
                <div>
                  <p><strong>Cliente:</strong> {selectedOS.client}</p>
                  <p><strong>Local:</strong> {selectedOS.mapsRoute.endereco}</p>
                  <p><strong>Coordenador OS:</strong> {selectedOS.responsavel}</p>
                </div>
                <div>
                  <p><strong>Período Montagem:</strong> {selectedOS.dataMontagem} até {selectedOS.startDate}</p>
                  <p><strong>Período Desmontagem:</strong> {selectedOS.dataDesmontagem}</p>
                  <p><strong>Custo OS Realizado:</strong> R$ {selectedOS.custoRealizado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Sub navigation tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
              <button 
                className={`tab-btn-link ${activeTab === "checklist" ? "active" : ""}`}
                onClick={() => setActiveTab("checklist")}
                style={{ padding: "8px 12px", border: "none", background: "none", borderBottom: activeTab === "checklist" ? "2px solid var(--accent)" : "none", fontWeight: activeTab === "checklist" ? "600" : "500", cursor: "pointer", fontSize: "13px" }}
              >
                Checklist
              </button>
              <button 
                className={`tab-btn-link ${activeTab === "items" ? "active" : ""}`}
                onClick={() => setActiveTab("items")}
                style={{ padding: "8px 12px", border: "none", background: "none", borderBottom: activeTab === "items" ? "2px solid var(--accent)" : "none", fontWeight: activeTab === "items" ? "600" : "500", cursor: "pointer", fontSize: "13px" }}
              >
                Insumos &amp; Insumos
              </button>
              <button 
                className={`tab-btn-link ${activeTab === "team" ? "active" : ""}`}
                onClick={() => setActiveTab("team")}
                style={{ padding: "8px 12px", border: "none", background: "none", borderBottom: activeTab === "team" ? "2px solid var(--accent)" : "none", fontWeight: activeTab === "team" ? "600" : "500", cursor: "pointer", fontSize: "13px" }}
              >
                Equipe Escalada
              </button>
              <button 
                className={`tab-btn-link ${activeTab === "photos" ? "active" : ""}`}
                onClick={() => setActiveTab("photos")}
                style={{ padding: "8px 12px", border: "none", background: "none", borderBottom: activeTab === "photos" ? "2px solid var(--accent)" : "none", fontWeight: activeTab === "photos" ? "600" : "500", cursor: "pointer", fontSize: "13px" }}
              >
                Fotos &amp; Provas ({selectedOS.fotos?.length || 0})
              </button>
              <button 
                className={`tab-btn-link ${activeTab === "signatures" ? "active" : ""}`}
                onClick={() => setActiveTab("signatures")}
                style={{ padding: "8px 12px", border: "none", background: "none", borderBottom: activeTab === "signatures" ? "2px solid var(--accent)" : "none", fontWeight: activeTab === "signatures" ? "600" : "500", cursor: "pointer", fontSize: "13px" }}
              >
                Assinaturas
              </button>
              <button 
                className={`tab-btn-link ${activeTab === "logs" ? "active" : ""}`}
                onClick={() => setActiveTab("logs")}
                style={{ padding: "8px 12px", border: "none", background: "none", borderBottom: activeTab === "logs" ? "2px solid var(--accent)" : "none", fontWeight: activeTab === "logs" ? "600" : "500", cursor: "pointer", fontSize: "13px" }}
              >
                Histórico ({selectedOS.historicoAlteracoes?.length || 0})
              </button>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === "checklist" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="text-sm font-semibold">Checklist de Homologação da OS</h4>
                  <span className="text-xs text-muted">Anexe fotos comprovatórias para cada etapa da montagem</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedOS.checklist.map((item) => {
                    const itemPhotos = (selectedOS.fotos || []).filter(f => f.name.includes(item.text));
                    return (
                      <div 
                        key={item.id} 
                        style={{
                          display: "flex", 
                          flexDirection: "column",
                          gap: "8px", 
                          padding: "10px 14px", 
                          borderRadius: "8px", 
                          background: item.done ? "var(--success-glow)" : "var(--bg-card)", 
                          border: "1px solid var(--border)",
                          boxShadow: "var(--shadow-sm)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                          <div 
                            onClick={() => toggleChecklistItem(item.id)}
                            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flex: 1 }}
                          >
                            <input 
                              type="checkbox" 
                              checked={item.done} 
                              onChange={() => {}} 
                              style={{ cursor: "pointer", width: "16px", height: "16px" }}
                            />
                            <span style={{ fontSize: "13px", fontWeight: "600", textDecoration: item.done ? "line-through" : "none", color: item.done ? "var(--success-text)" : "var(--text-primary)" }}>
                              {item.text}
                            </span>
                          </div>

                          <label 
                            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "6px", backgroundColor: "var(--bg-main)", color: "var(--accent)", border: "1px solid var(--border)", flexShrink: 0 }}
                            title="Anexar foto técnica para esta atividade"
                          >
                            <Camera size={13} /> Foto
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handlePhotoUpload(e, item.text)}
                              style={{ display: "none" }}
                            />
                          </label>
                        </div>

                        {itemPhotos.length > 0 && (
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "6px", borderTop: "1px dashed var(--border)" }}>
                            {itemPhotos.map(photo => (
                              <div key={photo.id} style={{ position: "relative", width: "64px", height: "64px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border)" }}>
                                <img src={photo.url} alt={photo.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemovePhoto(photo.id); }}
                                  style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(194, 47, 47, 0.9)", color: "white", border: "none", borderRadius: "50%", width: "16px", height: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  title="Excluir foto"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "items" && (
              <div>
                <h4 className="text-sm font-semibold" style={{ marginBottom: "12px" }}>Equipamentos e Materiais Utilizados</h4>
                
                {/* Allocate material inline form */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                  <div style={{ flexGrow: 1 }}>
                    <label className="text-xs text-muted">Item de Almoxarifado / Mobília / Ferramenta</label>
                    <select 
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "6px" }}
                    >
                      {allWarehouseItems.map(i => (
                        <option key={i.id} value={i.id}>{i.name} - ({i.type === "tool" ? "Ferramenta" : "Mobiliário"})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: "80px" }}>
                    <label className="text-xs text-muted">Qtd</label>
                    <input 
                      type="number" 
                      min={1} 
                      value={materialQty} 
                      onChange={(e) => setMaterialQty(Number(e.target.value))}
                      style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "6px" }}
                    />
                  </div>
                  <button type="button" className="btn-primary" onClick={handleAddMaterial} style={{ padding: "7px 12px" }}>
                    Alocar
                  </button>
                </div>

                {/* List of allocated tools */}
                <div className="table-responsive">
                  <table className="sheet-table">
                    <thead>
                      <tr>
                        <th>Nome do Recurso</th>
                        <th>Tipo</th>
                        <th>Qtd Alocada</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOS.assignedTools.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px" }}>
                            Nenhum equipamento ou material alocado nesta OS.
                          </td>
                        </tr>
                      ) : (
                        selectedOS.assignedTools.map(tool => (
                          <tr key={tool.id}>
                            <td data-label="Nome do Recurso">{tool.name}</td>
                            <td data-label="Tipo">{tool.type === "tool" ? "Ferramenta" : "Mobiliário"}</td>
                            <td data-label="Qtd Alocada"><strong>{tool.allocatedQty} unidades</strong></td>
                            <td data-label="Ações">
                              <button 
                                className="btn-secondary btn-xs" 
                                onClick={() => handleRemoveMaterial(tool.id)}
                                style={{ color: "var(--danger)" }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h4 className="text-sm font-semibold" style={{ margin: 0 }}>Membros da Equipe Escalada na OS</h4>
                  <span className="badge badge-info" style={{ fontSize: "10px" }}>
                    {selectedOS.assignedEmployees.length} Profissionais Escalados
                  </span>
                </div>

                {/* Form para Adicionar Colaborador */}
                <div style={{ background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
                  <h5 style={{ fontSize: "12px", fontWeight: "700", marginBottom: "10px", color: "var(--accent)" }}>+ Escalar Novo Colaborador nesta OS</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr auto", gap: "10px", alignItems: "flex-end" }}>
                    <div>
                      <label className="text-xs text-muted" style={{ display: "block", marginBottom: "4px" }}>Colaborador</label>
                      <select 
                        value={addEmpId} 
                        onChange={(e) => setAddEmpId(e.target.value)}
                        style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                      >
                        {allEmployees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted" style={{ display: "block", marginBottom: "4px" }}>Função no Evento</label>
                      <input 
                        type="text" 
                        value={addEmpRole} 
                        onChange={(e) => setAddEmpRole(e.target.value)}
                        placeholder="Ex: Encarregado Marcenaria"
                        style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted" style={{ display: "block", marginBottom: "4px" }}>Equipe / Setor</label>
                      <input 
                        type="text" 
                        value={addEmpEquipe} 
                        onChange={(e) => setAddEmpEquipe(e.target.value)}
                        placeholder="Ex: Turno Diurno"
                        style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted" style={{ display: "block", marginBottom: "4px" }}>Horário</label>
                      <input 
                        type="text" 
                        value={addEmpHorario} 
                        onChange={(e) => setAddEmpHorario(e.target.value)}
                        placeholder="Ex: 07:00 às 17:00"
                        style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                      />
                    </div>

                    <button 
                      type="button" 
                      className="btn-primary" 
                      onClick={handleAddEmployeeToOS}
                      style={{ padding: "7px 14px", fontSize: "12px" }}
                    >
                      Adicionar à OS
                    </button>
                  </div>
                </div>

                {/* Lista de Profissionais Escalados */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedOS.assignedEmployees.length === 0 ? (
                    <p className="text-sm text-muted" style={{ padding: "20px 0", textAlign: "center" }}>Nenhum montador escalado nesta OS. Utilize o formulário acima para adicionar colaboradores.</p>
                  ) : (
                    selectedOS.assignedEmployees.map((emp) => (
                      <div key={emp.id} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", border: "1px solid var(--border)", borderRadius: "10px", background: "var(--bg-card)", color: "var(--text-primary)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", background: "var(--accent)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px" }}>
                              {emp.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-sm" style={{ display: "block" }}>{emp.name}</strong>
                              <span className={`badge badge-${emp.documentStatus === "complete" ? "success" : "warning"}`} style={{ fontSize: "9px" }}>
                                {emp.documentStatus === "complete" ? "Homologado / NR OK" : "Docs Pendentes"}
                              </span>
                            </div>
                          </div>

                          <button 
                            type="button" 
                            className="btn-secondary btn-xs"
                            onClick={() => handleRemoveEmployeeFromOS(emp.id)}
                            style={{ color: "var(--danger)", border: "1px solid var(--danger)" }}
                            title="Remover da OS"
                          >
                            <Trash2 size={12} style={{ marginRight: "4px" }} /> Remover da Equipe
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "4px", backgroundColor: "var(--bg-main)", padding: "8px", borderRadius: "6px" }}>
                          <div>
                            <label className="text-xs text-muted" style={{ display: "block", fontSize: "10px" }}>Função na OS</label>
                            <input 
                              type="text" 
                              value={emp.role} 
                              onChange={(e) => handleUpdateOSAssignedEmp(emp.id, { role: e.target.value })}
                              style={{ width: "100%", padding: "4px 6px", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "11px" }}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-muted" style={{ display: "block", fontSize: "10px" }}>Equipe / Setor</label>
                            <input 
                              type="text" 
                              value={emp.equipe || ""} 
                              onChange={(e) => handleUpdateOSAssignedEmp(emp.id, { equipe: e.target.value })}
                              placeholder="Ex: Turno Noite"
                              style={{ width: "100%", padding: "4px 6px", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "11px" }}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-muted" style={{ display: "block", fontSize: "10px" }}>Horário de Trabalho</label>
                            <input 
                              type="text" 
                              value={emp.horario || ""} 
                              onChange={(e) => handleUpdateOSAssignedEmp(emp.id, { horario: e.target.value })}
                              placeholder="Ex: 08:00 - 18:00"
                              style={{ width: "100%", padding: "4px 6px", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "11px" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="text-sm font-semibold">Registro de Fotos e Provas de Entrega</h4>
                  <label className="btn-secondary btn-sm" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Camera size={14} /> Anexar Foto
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  {(!selectedOS.fotos || selectedOS.fotos.length === 0) ? (
                    <div style={{ gridColumn: "span 3", textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
                      Nenhuma foto de andamento de montagem anexada.
                    </div>
                  ) : (
                    selectedOS.fotos.map((photo) => (
                      <div key={photo.id} style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", position: "relative", background: "var(--bg-card)", color: "var(--text-primary)" }}>
                        <img 
                          src={photo.url} 
                          alt={photo.name} 
                          style={{ width: "100%", height: "110px", objectFit: "cover" }}
                        />
                        <div style={{ padding: "8px" }}>
                          <span className="text-xs font-semibold" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.name}</span>
                          <span className="text-xs text-muted" style={{ display: "block", fontSize: "10px" }}>{photo.date}</span>
                        </div>
                        <button 
                          onClick={() => handleRemovePhoto(photo.id)}
                          style={{ position: "absolute", top: "5px", right: "5px", border: "none", background: "rgba(194, 47, 47, 0.9)", color: "white", padding: "4px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "signatures" && (
              <div>
                <h4 className="text-sm font-semibold" style={{ marginBottom: "12px" }}>Assinaturas Digitais e Termos de Liberação</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* Client Signature Box */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", textAlign: "center", background: "var(--bg-card)", color: "var(--text-primary)" }}>
                    <strong className="text-sm" style={{ display: "block", marginBottom: "8px" }}>Assinatura do Cliente</strong>
                    {selectedOS.assinaturas?.clienteAssinatura ? (
                      <div>
                        <img 
                          src={selectedOS.assinaturas.clienteAssinatura} 
                          alt="Assinatura Cliente" 
                          style={{ width: "100%", height: "80px", objectFit: "contain", border: "1px dashed var(--border)", padding: "4px", borderRadius: "4px" }}
                        />
                        <p className="text-xs text-muted" style={{ marginTop: "4px" }}>Assinado em: {selectedOS.assinaturas.dataAssinatura}</p>
                      </div>
                    ) : (
                      <div style={{ height: "80px", border: "1px dashed var(--border)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px", marginBottom: "10px" }}>
                        Pendente
                      </div>
                    )}
                    <button 
                      className="btn-secondary btn-sm" 
                      onClick={() => {
                        setSignatureType("cliente");
                        setIsSignatureModalOpen(true);
                      }}
                      style={{ width: "100%" }}
                    >
                      Assinar (Cliente)
                    </button>
                  </div>

                  {/* Responsible Signature Box */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", textAlign: "center", background: "var(--bg-card)", color: "var(--text-primary)" }}>
                    <strong className="text-sm" style={{ display: "block", marginBottom: "8px" }}>Assinatura do Responsável</strong>
                    {selectedOS.assinaturas?.responsavelAssinatura ? (
                      <div>
                        <img 
                          src={selectedOS.assinaturas.responsavelAssinatura} 
                          alt="Assinatura Responsável" 
                          style={{ width: "100%", height: "80px", objectFit: "contain", border: "1px dashed var(--border)", padding: "4px", borderRadius: "4px" }}
                        />
                        <p className="text-xs text-muted" style={{ marginTop: "4px" }}>Assinado em: {selectedOS.assinaturas.dataAssinatura}</p>
                      </div>
                    ) : (
                      <div style={{ height: "80px", border: "1px dashed var(--border)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px", marginBottom: "10px" }}>
                        Pendente
                      </div>
                    )}
                    <button 
                      className="btn-secondary btn-sm" 
                      onClick={() => {
                        setSignatureType("responsavel");
                        setIsSignatureModalOpen(true);
                      }}
                      style={{ width: "100%" }}
                    >
                      Assinar (Coordenador)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div>
                <h4 className="text-sm font-semibold" style={{ marginBottom: "12px" }}>Trilha de Auditoria e Alterações da OS</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
                  {!selectedOS.historicoAlteracoes || selectedOS.historicoAlteracoes.length === 0 ? (
                    <p className="text-xs text-muted" style={{ padding: "12px 0" }}>Nenhuma alteração registrada nesta Ordem de Serviço.</p>
                  ) : (
                    selectedOS.historicoAlteracoes.map((log) => (
                      <div key={log.id} style={{ fontSize: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                          <span><strong>{log.usuario}</strong> alterou o campo <strong>{log.campo}</strong></span>
                          <span>{log.date}</span>
                        </div>
                        <p style={{ marginTop: "2px" }}>De: <span className="text-muted">{log.antes}</span> &rarr; Para: <strong>{log.depois}</strong></p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Comments Board section */}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "24px", paddingTop: "16px" }}>
              <h4 className="text-sm font-semibold" style={{ marginBottom: "12px" }}>Mural de Avisos da OS</h4>
              
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <input 
                  type="text" 
                  placeholder="Deixar comentário para a equipe de campo..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{ flexGrow: 1, padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}
                />
                <button type="button" className="btn-secondary" onClick={handleAddComment} style={{ padding: "8px 16px" }}>
                  Enviar
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "150px", overflowY: "auto" }}>
                {!selectedOS.comentarios || selectedOS.comentarios.length === 0 ? (
                  <p className="text-xs text-muted">Nenhum comentário registrado.</p>
                ) : (
                  selectedOS.comentarios.map((comment) => (
                    <div key={comment.id} style={{ background: "rgba(0,0,0,0.01)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                        <span className="font-semibold">{comment.autor}</span>
                        <span>{comment.date}</span>
                      </div>
                      <p className="text-xs" style={{ margin: 0 }}>{comment.texto}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL SIGNATURE CANVAS MODAL */}
      {isSignatureModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSignatureModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assinatura Digital - {signatureType === "cliente" ? "Cliente" : "Coordenador"}</h3>
              <button className="modal-close" onClick={() => setIsSignatureModalOpen(false)}>X</button>
            </div>
            <div className="modal-body" style={{ textAlign: "center" }}>
              <p className="text-xs text-muted" style={{ marginBottom: "12px" }}>
                Utilize o mouse ou tela sensível ao toque para desenhar a sua assinatura no quadro abaixo.
              </p>
              
              <canvas 
                ref={canvasRef}
                width={400}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  border: "1px dashed var(--accent)", 
                  borderRadius: "8px", 
                  background: "#fafafa", 
                  cursor: "crosshair",
                  width: "100%",
                  height: "200px"
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                <button type="button" className="btn-secondary btn-sm" onClick={clearCanvas}>Limpar Tela</button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => setIsSignatureModalOpen(false)}>Cancelar</button>
                  <button type="button" className="btn-primary btn-sm" onClick={saveSignature}>Confirmar Assinatura</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Dossiê OS (Impressão Oficial JC Eventos) */}
      {isPrintModalOpen && selectedOS && createPortal(
        <div className="modal-overlay" onClick={() => setIsPrintModalOpen(false)}>
          <div className="modal-content" style={{ backgroundColor: "#fff", padding: "30px", width: "100%", maxWidth: "800px", height: "90%", overflowY: "auto", fontFamily: "var(--font)", color: "#1e293b" }} onClick={(e) => e.stopPropagation()}>
            {/* Action Bar */}
            <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "20px" }}>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleDownloadOSPdf} 
                disabled={isPdfLoading}
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px" }}
              >
                <FileDown size={14} /> Download PDF da OS
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { window.print(); }} 
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px" }}
              >
                <Printer size={14} /> Imprimir Dossiê OS
              </button>
              <button type="button" className="btn-secondary" onClick={() => setIsPrintModalOpen(false)} style={{ fontSize: "12px", padding: "6px 12px" }}>Fechar</button>
            </div>

            {/* Document Print Container */}
            <div id="print-os-dossier" className="printable-document" style={{ padding: "10px" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #144580", paddingBottom: "16px", marginBottom: "20px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <div style={{ backgroundColor: "#144580", padding: "6px 16px", borderRadius: "8px", display: "inline-flex", alignItems: "center" }}>
                      <img src={logoImg} alt="JC Eventos" style={{ height: "24px", objectFit: "contain" }} />
                    </div>
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#666", fontWeight: "600" }}>JC Design de Stands Ltda | CNPJ: 23.471.817/0001-43</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>Rua Caetano Sanches, 1807 – Candelária, Natal/RN | CEP: 59065-710</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>Tel: +55 (84) 99419-2212 | comercial@jceventosrn.com.br</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h3 style={{ margin: 0, fontSize: "13px", color: "#333", letterSpacing: "1px", fontWeight: "700" }}>DOSSIÊ OPERACIONAL</h3>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#144580" }}>OS: {selectedOS.codigo}</span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#666" }}>Fase: <strong>{selectedOS.phase.toUpperCase()}</strong></p>
                </div>
              </div>

              {/* OS Meta Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", fontSize: "12px" }}>
                <div style={{ border: "1px solid var(--border)", padding: "12px", borderRadius: "8px" }}>
                  <strong style={{ display: "block", color: "#144580", fontSize: "10px", textTransform: "uppercase", marginBottom: "6px" }}>Especificações da Obra</strong>
                  <p style={{ margin: "3px 0" }}><strong>Estande/Projeto:</strong> {selectedOS.name}</p>
                  <p style={{ margin: "3px 0" }}><strong>Cliente:</strong> {selectedOS.client}</p>
                  <p style={{ margin: "3px 0" }}><strong>Local de Montagem:</strong> {selectedOS.mapsRoute.endereco}</p>
                </div>
                <div style={{ border: "1px solid var(--border)", padding: "12px", borderRadius: "8px" }}>
                  <strong style={{ display: "block", color: "#144580", fontSize: "10px", textTransform: "uppercase", marginBottom: "6px" }}>Cronograma &amp; Equipe</strong>
                  <p style={{ margin: "3px 0" }}><strong>Coordenador Geral:</strong> {selectedOS.responsavel}</p>
                  <p style={{ margin: "3px 0" }}><strong>Montagem:</strong> {selectedOS.dataMontagem} a {selectedOS.startDate}</p>
                  <p style={{ margin: "3px 0" }}><strong>Desmontagem:</strong> {selectedOS.dataDesmontagem}</p>
                </div>
              </div>

              {/* Materials allocated */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "700", borderBottom: "1px solid #144580", paddingBottom: "6px", color: "#144580", textTransform: "uppercase", marginBottom: "8px" }}>Insumos &amp; Mobiliário Separados no WMS</h4>
                <table className="table-responsive-cards" style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", borderBottom: "1.5px solid #293B8F" }}>
                      <th style={{ padding: "6px" }}>Descrição do Insumo / Item</th>
                      <th style={{ padding: "6px" }}>Tipo</th>
                      <th style={{ padding: "6px", textAlign: "right" }}>Quantidade Alocada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOS.assignedTools && selectedOS.assignedTools.length > 0 ? (
                      selectedOS.assignedTools.map(item => (
                        <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td data-label="Descrição" style={{ padding: "6px" }}>{item.name}</td>
                          <td data-label="Tipo" style={{ padding: "6px", textTransform: "capitalize" }}>{item.type === "tool" ? "Ferramenta / Equipamento" : "Mobiliário / Cenografia"}</td>
                          <td data-label="Quantidade" style={{ padding: "6px", textAlign: "right", fontWeight: "700" }}>{item.allocatedQty} un</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ padding: "10px", textAlign: "center", fontStyle: "italic", color: "#666" }}>Nenhum insumo ou material alocado nesta OS.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Escalated staff members */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "700", borderBottom: "1px solid #144580", paddingBottom: "6px", color: "#144580", textTransform: "uppercase", marginBottom: "8px" }}>Equipe Técnica Escalada em Campo</h4>
                <table className="table-responsive-cards" style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", borderBottom: "1.5px solid #144580" }}>
                      <th style={{ padding: "6px" }}>Colaborador</th>
                      <th style={{ padding: "6px" }}>Função / Cargo</th>
                      <th style={{ padding: "6px", textAlign: "right" }}>Documentação Operacional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOS.assignedEmployees && selectedOS.assignedEmployees.length > 0 ? (
                      selectedOS.assignedEmployees.map(emp => (
                        <tr key={emp.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td data-label="Colaborador" style={{ padding: "6px" }}><strong>{emp.name}</strong></td>
                          <td data-label="Função" style={{ padding: "6px" }}>{emp.role}</td>
                          <td data-label="Documentação" style={{ padding: "6px", textAlign: "right", color: emp.documentStatus === "complete" ? "green" : "red", fontWeight: "600" }}>
                            {emp.documentStatus === "complete" ? "LIBERADO" : "PENDENTE"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ padding: "10px", textAlign: "center", fontStyle: "italic", color: "#666" }}>Nenhum colaborador escalado nesta OS.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* OS Photo Evidences Gallery in Print / PDF */}
              {selectedOS.fotos && selectedOS.fotos.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "12px", fontWeight: "700", borderBottom: "1px solid #144580", paddingBottom: "6px", color: "#144580", textTransform: "uppercase", marginBottom: "8px" }}>
                    Evidências Fotográficas da Montagem ({selectedOS.fotos.length} fotos)
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    {selectedOS.fotos.map((photo) => (
                      <div key={photo.id} style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "6px", backgroundColor: "#fafafa" }}>
                        <img src={photo.url} alt={photo.name} style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "4px" }} />
                        <p style={{ margin: "4px 0 0 0", fontSize: "9px", fontWeight: "bold", color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.name}</p>
                        <p style={{ margin: "2px 0 0 0", fontSize: "8px", color: "#666" }}>{photo.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OS Checklist Status */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "700", borderBottom: "1px solid #144580", paddingBottom: "6px", color: "#144580", textTransform: "uppercase", marginBottom: "8px" }}>Cronograma de Atividades &amp; Checklist (Completo: {selectedOS.completionRate}%)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11px" }}>
                  {selectedOS.checklist.map(item => (
                    <div key={item.id} style={{ padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", backgroundColor: item.done ? "#f0fdf4" : "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: item.done ? "green" : "#999", fontWeight: "bold" }}>{item.done ? "✔" : "☐"}</span>
                      <span style={{ textDecoration: item.done ? "line-through" : "none" }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures Mirror */}
              <div style={{ borderTop: "2px solid #144580", paddingTop: "20px", marginTop: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", fontSize: "11px", textAlign: "center" }}>
                <div>
                  <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #ccc", marginBottom: "6px" }}>
                    {selectedOS.assinaturas?.clienteAssinatura ? (
                      <img src={selectedOS.assinaturas.clienteAssinatura} alt="Assinatura Cliente" style={{ maxHeight: "50px" }} />
                    ) : (
                      <span style={{ color: "#aaa", fontStyle: "italic" }}>Aguardando assinatura de recebimento</span>
                    )}
                  </div>
                  <strong>ACEITE DO CLIENTE (CONTRATANTE)</strong>
                  {selectedOS.assinaturas?.dataAssinatura && <p style={{ margin: "2px 0 0 0", color: "#666" }}>Data: {selectedOS.assinaturas.dataAssinatura}</p>}
                </div>
                <div>
                  <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #ccc", marginBottom: "6px" }}>
                    {selectedOS.assinaturas?.responsavelAssinatura ? (
                      <img src={selectedOS.assinaturas.responsavelAssinatura} alt="Assinatura Coordenador" style={{ maxHeight: "50px" }} />
                    ) : (
                      <span style={{ color: "#aaa", fontStyle: "italic" }}>Aguardando assinatura do coordenador</span>
                    )}
                  </div>
                  <strong>COORDENADOR DE MONTAGEM (JC EVENTOS)</strong>
                  {selectedOS.assinaturas?.dataAssinatura && <p style={{ margin: "2px 0 0 0", color: "#666" }}>Data: {selectedOS.assinaturas.dataAssinatura}</p>}
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
