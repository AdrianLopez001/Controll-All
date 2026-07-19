import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, CheckSquare, Plus, Trash2, Camera, ShieldAlert, 
  User, MapPin, PenTool, CheckCircle, ChevronRight, X, Clock, HelpCircle, Printer
} from "lucide-react";
import type { Project, Employee, WarehouseItem, OSComentario, OSFoto, OSAssinaturas } from "../types";

interface OrdensServicoProps {
  events: Project[];
  allEmployees: Employee[];
  allWarehouseItems: WarehouseItem[];
  onUpdateEvent: (updated: Project) => void;
}

export default function OrdensServico({
  events,
  allEmployees,
  allWarehouseItems,
  onUpdateEvent
}: OrdensServicoProps) {
  const [selectedOsId, setSelectedOsId] = useState<string>(events[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "baixa" | "media" | "alta">("all");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"checklist" | "items" | "team" | "photos" | "signatures" | "logs">("checklist");
  const selectedOS = events.find(o => o.id === selectedOsId);

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
      autor: "Adrian (Coordenador)",
      texto: commentText,
      date: new Date().toLocaleString("pt-BR")
    };
    const log = {
      id: `log-${Date.now()}`,
      campo: "Comentários",
      antes: "-",
      depois: `Novo comentário: "${commentText.substring(0, 20)}..."`,
      date: new Date().toISOString().split("T")[0],
      usuario: "Adrian (Coordenador)"
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
      usuario: "Adrian (Coordenador)"
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
      usuario: "Adrian (Coordenador)"
    };

    onUpdateEvent({
      ...selectedOS,
      assignedTools: selectedOS.assignedTools.filter(t => t.id !== itemId),
      historicoAlteracoes: [...(selectedOS.historicoAlteracoes || []), log]
    });
  };

  // Photo Upload Simulation
  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedOS || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const newPhoto: OSFoto = {
      id: `photo-${Date.now()}`,
      name: file.name,
      url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=200", // placeholder image for cenography
      date: new Date().toLocaleString("pt-BR")
    };

    const log = {
      id: `log-${Date.now()}`,
      campo: "Fotos/Evidências",
      antes: "-",
      depois: `Anexada foto: "${file.name}"`,
      date: new Date().toISOString().split("T")[0],
      usuario: "Adrian (Coordenador)"
    };

    onUpdateEvent({
      ...selectedOS,
      fotos: [...(selectedOS.fotos || []), newPhoto],
      historicoAlteracoes: [...(selectedOS.historicoAlteracoes || []), log]
    });
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
      usuario: "Adrian (Coordenador)"
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
    ctx.strokeStyle = "#293B8F";
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
      usuario: "Adrian (Coordenador)"
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
      usuario: "Adrian (Coordenador)"
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

  const filteredOSs = events.filter(os => {
    const matchesSearch = os.name.toLowerCase().includes(searchTerm.toLowerCase()) || os.client.toLowerCase().includes(searchTerm.toLowerCase()) || os.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" ? true : os.prioridade === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "24px", padding: "10px" }}>
      {/* Left Column: OS List */}
      <div className="section-box" style={{ height: "auto" }}>
        <div className="section-box-header">
          <h3 className="section-box-title">
            <FileText size={16} style={{ color: "var(--accent)" }} />
            Ordens de Serviço (OS) Operacionais
          </h3>
          <span className="kanban-column-count">{events.length} Ativas</span>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input 
            type="text" 
            placeholder="Buscar por código, evento ou cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flexGrow: 1, padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}
          />
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            style={{ padding: "8px", border: "1px solid var(--border)", borderRadius: "8px", background: "white" }}
          >
            <option value="all">Todas Prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredOSs.map((os) => (
            <div 
              key={os.id} 
              className={`staff-row ${selectedOsId === os.id ? "active-row" : ""}`}
              onClick={() => setSelectedOsId(os.id)}
              style={{
                cursor: "pointer", 
                padding: "12px", 
                borderRadius: "8px", 
                border: selectedOsId === os.id ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                background: selectedOsId === os.id ? "rgba(41, 59, 143, 0.05)" : "white"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <strong>{os.codigo}</strong>
                <span className={`badge ${
                  os.prioridade === "alta" ? "badge-danger" : 
                  os.prioridade === "media" ? "badge-warning" : "badge-muted"
                }`} style={{ fontSize: "9px" }}>
                  {os.prioridade ? os.prioridade.toUpperCase() : "MÉDIA"}
                </span>
              </div>
              <h4 className="text-sm font-semibold" style={{ margin: "2px 0" }}>{os.name}</h4>
              <p className="text-xs text-muted">Cliente: {os.client} | Início: {os.startDate}</p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <div style={{ flexGrow: 1, height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${os.completionRate}%`, height: "100%", background: "var(--accent)" }}></div>
                </div>
                <span className="text-xs text-muted">{os.completionRate}% checklist</span>
                <ChevronRight size={14} className="text-muted" style={{ marginLeft: "auto" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: OS detailed View & Edit form */}
      <div className="section-box" style={{ height: "auto" }}>
        {selectedOS ? (
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
                  <div>
                    <label className="text-xs text-muted" style={{ marginRight: "6px" }}>Status/Etapa:</label>
                    <select 
                      value={selectedOS.phase}
                      onChange={(e) => handleOSFieldUpdate("phase", e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border)" }}
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
                  <div>
                    <label className="text-xs text-muted" style={{ marginRight: "6px" }}>Prioridade:</label>
                    <select 
                      value={selectedOS.prioridade || "media"}
                      onChange={(e) => handleOSFieldUpdate("prioridade", e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border)" }}
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
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
                <h4 className="text-sm font-semibold" style={{ marginBottom: "12px" }}>Checklist de Homologação da OS</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedOS.checklist.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleChecklistItem(item.id)}
                      style={{
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px", 
                        padding: "8px 12px", 
                        borderRadius: "6px", 
                        background: item.done ? "var(--success-glow)" : "rgba(0,0,0,0.01)", 
                        border: "1px solid var(--border)",
                        cursor: "pointer"
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={item.done} 
                        onChange={() => {}} 
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "13px", textDecoration: item.done ? "line-through" : "none", color: item.done ? "var(--success-text)" : "var(--text-primary)" }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
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
                  <table className="data-table">
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
                            <td>{tool.name}</td>
                            <td>{tool.type === "tool" ? "Ferramenta" : "Mobiliário"}</td>
                            <td><strong>{tool.allocatedQty} unidades</strong></td>
                            <td>
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
                <h4 className="text-sm font-semibold" style={{ marginBottom: "12px" }}>Membros da Equipe de Campo</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedOS.assignedEmployees.length === 0 ? (
                    <p className="text-sm text-muted" style={{ padding: "20px 0", textAlign: "center" }}>Nenhum montador escalado nesta OS. Utilize a escala no Kanban ou o botão de Escala Geral.</p>
                  ) : (
                    selectedOS.assignedEmployees.map((emp) => (
                      <div key={emp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px", background: "white" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "30px", height: "30px", background: "var(--accent)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "12px" }}>
                            {emp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-sm" style={{ display: "block" }}>{emp.name}</strong>
                            <span className="text-xs text-muted">{emp.role}</span>
                          </div>
                        </div>
                        <span className={`badge badge-${emp.documentStatus === "complete" ? "success" : "warning"}`} style={{ fontSize: "9px" }}>
                          {emp.documentStatus === "complete" ? "Homologado" : "Docs Pendentes"}
                        </span>
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
                      onChange={handleSimulatePhotoUpload} 
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
                      <div key={photo.id} style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", position: "relative", background: "white" }}>
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
                  <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", textAlign: "center", background: "white" }}>
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
                  <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", textAlign: "center", background: "white" }}>
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
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "var(--text-muted)", minHeight: "350px" }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
            <p>Selecione uma Ordem de Serviço na barra lateral para ver o dossiê técnico de montagem.</p>
          </div>
        )}
      </div>

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
      {isPrintModalOpen && selectedOS && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "100%", maxWidth: "800px", height: "90%", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", fontFamily: "var(--font)", color: "#1e293b" }}>
            
            {/* Action Bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "20px" }}>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => { window.print(); }} 
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px" }}
              >
                <Printer size={14} /> Imprimir Dossiê OS
              </button>
              <button type="button" className="btn-secondary" onClick={() => setIsPrintModalOpen(false)} style={{ fontSize: "12px", padding: "6px 12px" }}>Fechar</button>
            </div>

            {/* Document Print Container */}
            <div id="print-os-dossier" style={{ padding: "10px" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #293B8F", paddingBottom: "16px", marginBottom: "20px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" rx="22" fill="#293B8F" />
                      <path d="M35 30H52V60C52 66 47 70 40 70" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M72 35H58C52 35 48 40 48 48C48 56 52 61 58 61H72" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="80" cy="72" r="8" fill="#C95D46" />
                    </svg>
                    <h2 style={{ margin: 0, fontSize: "18px", color: "#293B8F", fontWeight: "800", letterSpacing: "0.5px" }}>JC EVENTOS</h2>
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#666", fontWeight: "600" }}>JC Design de Stands Ltda | CNPJ: 23.471.817/0001-43</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>Rua Caetano Sanches, 1807 – Candelária, Natal/RN | CEP: 59065-710</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>Tel: +55 (84) 99419-2212 | comercial@jceventosrn.com.br</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h3 style={{ margin: 0, fontSize: "13px", color: "#333", letterSpacing: "1px", fontWeight: "700" }}>DOSSIÊ OPERACIONAL</h3>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#293B8F" }}>OS: {selectedOS.codigo}</span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#666" }}>Fase: <strong>{selectedOS.phase.toUpperCase()}</strong></p>
                </div>
              </div>

              {/* OS Meta Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", fontSize: "12px" }}>
                <div style={{ border: "1px solid var(--border)", padding: "12px", borderRadius: "8px" }}>
                  <strong style={{ display: "block", color: "#293B8F", fontSize: "10px", textTransform: "uppercase", marginBottom: "6px" }}>Especificações da Obra</strong>
                  <p style={{ margin: "3px 0" }}><strong>Estande/Projeto:</strong> {selectedOS.name}</p>
                  <p style={{ margin: "3px 0" }}><strong>Cliente:</strong> {selectedOS.client}</p>
                  <p style={{ margin: "3px 0" }}><strong>Local de Montagem:</strong> {selectedOS.mapsRoute.endereco}</p>
                </div>
                <div style={{ border: "1px solid var(--border)", padding: "12px", borderRadius: "8px" }}>
                  <strong style={{ display: "block", color: "#293B8F", fontSize: "10px", textTransform: "uppercase", marginBottom: "6px" }}>Cronograma &amp; Equipe</strong>
                  <p style={{ margin: "3px 0" }}><strong>Coordenador Geral:</strong> {selectedOS.responsavel}</p>
                  <p style={{ margin: "3px 0" }}><strong>Montagem:</strong> {selectedOS.dataMontagem} a {selectedOS.startDate}</p>
                  <p style={{ margin: "3px 0" }}><strong>Desmontagem:</strong> {selectedOS.dataDesmontagem}</p>
                </div>
              </div>

              {/* Materials allocated */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "700", borderBottom: "1px solid #293B8F", paddingBottom: "6px", color: "#293B8F", textTransform: "uppercase", marginBottom: "8px" }}>Insumos &amp; Mobiliário Separados no WMS</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
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
                          <td style={{ padding: "6px" }}>{item.name}</td>
                          <td style={{ padding: "6px", textTransform: "capitalize" }}>{item.type === "tool" ? "Ferramenta / Equipamento" : "Mobiliário / Cenografia"}</td>
                          <td style={{ padding: "6px", textAlign: "right", fontWeight: "700" }}>{item.allocatedQty} un</td>
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
                <h4 style={{ fontSize: "12px", fontWeight: "700", borderBottom: "1px solid #293B8F", paddingBottom: "6px", color: "#293B8F", textTransform: "uppercase", marginBottom: "8px" }}>Equipe Técnica Escalada em Campo</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", borderBottom: "1.5px solid #293B8F" }}>
                      <th style={{ padding: "6px" }}>Colaborador</th>
                      <th style={{ padding: "6px" }}>Função / Cargo</th>
                      <th style={{ padding: "6px", textAlign: "right" }}>Documentação Operacional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOS.assignedEmployees && selectedOS.assignedEmployees.length > 0 ? (
                      selectedOS.assignedEmployees.map(emp => (
                        <tr key={emp.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "6px" }}><strong>{emp.name}</strong></td>
                          <td style={{ padding: "6px" }}>{emp.role}</td>
                          <td style={{ padding: "6px", textAlign: "right", color: emp.documentStatus === "complete" ? "green" : "red", fontWeight: "600" }}>
                            {emp.documentStatus === "complete" ? "LIBERADO (ASO/NRs em dia)" : "PENDENTE DE ASO/NR"}
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

              {/* OS Checklist Status */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "700", borderBottom: "1px solid #293B8F", paddingBottom: "6px", color: "#293B8F", textTransform: "uppercase", marginBottom: "8px" }}>Cronograma de Atividades &amp; Checklist (Completo: {selectedOS.completionRate}%)</h4>
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
              <div style={{ borderTop: "2px solid #293B8F", paddingTop: "20px", marginTop: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", fontSize: "11px", textAlign: "center" }}>
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
        </div>
      )}
    </div>
  );
}
