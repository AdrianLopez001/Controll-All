import { useState } from "react";
import { 
  X, FileText, Shield, AlertCircle, DollarSign, MapPin, Navigation, Tag, Calendar, Truck
} from "lucide-react";
import type { Project, Employee, WarehouseItem, ProductionSectors, ConventionCenterRules } from "../types";

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
  onClose: () => void;
  onUpdateEvent: (updatedEvent: Project) => void;
}

export default function EventDetailsModal({
  event,
  allEmployees,
  allWarehouseItems,
  onClose,
  onUpdateEvent
}: EventDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "checklist" | "tools" | "staff" | "travel" | "docs" | "costs" | "route" | "producao" | "regras"
  >("checklist");
  
  // Local modifications state
  const [localEvent, setLocalEvent] = useState<Project>({ ...event });

  const handleUpdate = (updated: Project) => {
    setLocalEvent(updated);
    onUpdateEvent(updated);
  };

  // 1. Checklist Handlers
  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = localEvent.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    
    // Recalculate completion rate
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

  // 3. Staff Handlers
  const toggleEmployee = (empId: string) => {
    const isAssigned = localEvent.assignedEmployees.some(e => e.id === empId);
    let updatedStaff = [...localEvent.assignedEmployees];

    if (isAssigned) {
      updatedStaff = updatedStaff.filter(e => e.id !== empId);
    } else {
      const emp = allEmployees.find(e => e.id === empId);
      if (emp) {
        // Validation check: Check if worker has doc pending or lacks cert
        if (emp.documentStatus === "pending") {
          alert(`Atenção: Os documentos gerais de ${emp.name} estão pendentes no RH. Homologue o profissional antes.`);
        }
        updatedStaff.push({
          id: emp.id,
          name: emp.name,
          role: emp.role,
          documentStatus: emp.documentStatus
        });
      }
    }

    handleUpdate({
      ...localEvent,
      assignedEmployees: updatedStaff
    });
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

  // 6. Costs Edit Handlers
  const handleCostChange = (category: keyof typeof localEvent.centroCusto, val: number) => {
    const newCC = {
      ...localEvent.centroCusto,
      [category]: val
    };
    const totalCost = Object.values(newCC).reduce((a, b) => a + b, 0);
    handleUpdate({
      ...localEvent,
      centroCusto: newCC,
      custoRealizado: totalCost
    });
  };

  // 7. Production Sectors handler (Módulo 8)
  const handleProductionChange = (sector: keyof ProductionSectors, status: "pendente" | "em_andamento" | "concluido") => {
    const defaultProducao = localEvent.producao || {
      marcenaria: "pendente",
      pintura: "pendente",
      eletrica: "pendente",
      comunicacaoVisual: "pendente",
      vidros: "pendente",
      limpeza: "pendente"
    };
    const updatedProducao = {
      ...defaultProducao,
      [sector]: status
    };
    handleUpdate({
      ...localEvent,
      producao: updatedProducao
    });
  };

  // 8. Convention center template rules auto-fill handler (Módulo 4)
  const handleCenterChange = (centerName: string) => {
    const rules = CONVENTION_CENTERS.find(c => c.nome === centerName) || {
      nome: centerName,
      taxaEnergia: 0,
      taxaLimpeza: 0,
      limiteAltura: "N/A",
      artObrigatoria: false,
      brigadistaObrigatorio: false,
      seguroObrigatorio: false,
      estacionamento: 0,
      contatoGestor: ""
    };
    
    const newCC = {
      ...localEvent.centroCusto,
      taxasOrganizador: rules.taxaEnergia + rules.taxaLimpeza
    };
    const totalCost = Object.values(newCC).reduce((a, b) => a + b, 0);

    handleUpdate({
      ...localEvent,
      centroConvencoes: centerName,
      regrasCentro: rules,
      centroCusto: newCC,
      custoRealizado: totalCost
    });
  };

  // Calculations for costs tab
  const totalCost = Object.values(localEvent.centroCusto || {}).reduce((a, b) => a + b, 0);
  const netProfit = localEvent.valorContratado - totalCost;
  const marginPercent = localEvent.valorContratado > 0 ? (netProfit / localEvent.valorContratado) * 100 : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px" }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--accent-secondary)", fontFamily: "monospace" }}>CÓDIGO: {localEvent.codigo}</span>
            <h3 className="modal-title">{localEvent.name}</h3>
            <span className="modal-subtitle">Cliente: {localEvent.client} | Responsável: {localEvent.responsavel}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          <button className={`modal-tab ${activeTab === "checklist" ? "active" : ""}`} onClick={() => setActiveTab("checklist")}>Checklist</button>
          <button className={`modal-tab ${activeTab === "producao" ? "active" : ""}`} onClick={() => setActiveTab("producao")}>Produção</button>
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
          
          {/* TAB 1: CHECKLIST */}
          {activeTab === "checklist" && (
            <div className="checklist-container">
              <span className="text-xs text-muted semibold uppercase mb-20" style={{ display: "block" }}>
                Tarefas para Montagem do Stand ({localEvent.completionRate}% Concluído)
              </span>
              {localEvent.checklist.map((item) => (
                <div key={item.id} className="checklist-item">
                  <div className="checklist-item-left" onClick={() => toggleChecklistItem(item.id)}>
                    <div className={`checkbox ${item.done ? "checked" : ""}`}>
                      {item.done && "✓"}
                    </div>
                    <span className={`checklist-text ${item.done ? "checked" : ""}`}>
                      {item.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: PRODUÇÃO */}
          {activeTab === "producao" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <span className="text-xs text-muted semibold uppercase mb-20" style={{ display: "block" }}>
                Gestão e Acompanhamento da Produção por Setor
              </span>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {(["marcenaria", "pintura", "eletrica", "comunicacaoVisual", "vidros", "limpeza"] as const).map((sector) => {
                  const defaultProducao = localEvent.producao || {
                    marcenaria: "pendente",
                    pintura: "pendente",
                    eletrica: "pendente",
                    comunicacaoVisual: "pendente",
                    vidros: "pendente",
                    limpeza: "pendente"
                  };
                  const currentStatus = defaultProducao[sector] || "pendente";
                  const label = 
                    sector === "marcenaria" ? "🪚 Marcenaria" :
                    sector === "pintura" ? "🎨 Pintura & Acabamento" :
                    sector === "eletrica" ? "⚡ Elétrica & Iluminação" :
                    sector === "comunicacaoVisual" ? "🖼️ Comunicação Visual" :
                    sector === "vidros" ? "🪟 Vidraçaria & Vidros" : "🧹 Limpeza Técnica";

                  return (
                    <div key={sector} style={{ border: "1px solid var(--border)", padding: "12px 16px", borderRadius: "12px", backgroundColor: "var(--bg-card)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{label}</span>
                      <select 
                        value={currentStatus} 
                        onChange={(e) => handleProductionChange(sector, e.target.value as any)}
                        style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", background: "var(--bg-card)", color: "var(--text-primary)", outline: "none" }}
                      >
                        <option value="pendente">🔴 Pendente</option>
                        <option value="em_andamento">🟡 Em Produção</option>
                        <option value="concluido">🟢 Concluído</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: REGRAS DO PAVILHÃO */}
          {activeTab === "regras" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <span className="text-xs text-muted semibold uppercase mb-20" style={{ display: "block" }}>
                Cadastro e Regras Específicas do Pavilhão / Centro de Convenções
              </span>

              <div className="field">
                <label>Centro de Convenções</label>
                <select 
                  value={localEvent.centroConvencoes || ""} 
                  onChange={(e) => handleCenterChange(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-card)", color: "var(--text-primary)" }}
                >
                  <option value="">-- Selecione o Pavilhão --</option>
                  {CONVENTION_CENTERS.map((c) => (
                    <option key={c.nome} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {localEvent.centroConvencoes ? (
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", marginTop: "10px" }}>
                  {/* Regras detalhadas */}
                  <div style={{ border: "1px solid var(--border)", padding: "16px", borderRadius: "12px", backgroundColor: "var(--bg-card)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h5 style={{ fontSize: "14px", fontWeight: "600", color: "var(--accent-secondary)", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>Regras e Exigências Técnicas</h5>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Taxa de Energia Organizador:</span>
                        <strong>R$ {localEvent.regrasCentro?.taxaEnergia.toLocaleString("pt-BR")}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Taxa de Limpeza Pavilhão:</span>
                        <strong>R$ {localEvent.regrasCentro?.taxaLimpeza.toLocaleString("pt-BR")}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Limite de Altura Máxima:</span>
                        <strong>{localEvent.regrasCentro?.limiteAltura}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Estacionamento (Diária Caminhão):</span>
                        <strong>R$ {localEvent.regrasCentro?.estacionamento.toLocaleString("pt-BR")}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>ART de Montagem Obrigatória:</span>
                        <strong style={{ color: localEvent.regrasCentro?.artObrigatoria ? "var(--warning)" : "var(--text-secondary)" }}>
                          {localEvent.regrasCentro?.artObrigatoria ? "Sim (Exigido)" : "Não"}
                        </strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Seguro Obra Obrigatório:</span>
                        <strong style={{ color: localEvent.regrasCentro?.seguroObrigatorio ? "var(--warning)" : "var(--text-secondary)" }}>
                          {localEvent.regrasCentro?.seguroObrigatorio ? "Sim (Exigido)" : "Não"}
                        </strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Brigadista de Stand Exigido:</span>
                        <strong style={{ color: localEvent.regrasCentro?.brigadistaObrigatorio ? "var(--warning)" : "var(--text-secondary)" }}>
                          {localEvent.regrasCentro?.brigadistaObrigatorio ? "Sim (Exigido)" : "Não"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Gestor e Contato */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ border: "1px solid var(--border)", padding: "16px", borderRadius: "12px", backgroundColor: "var(--bg-card)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Gestão do Pavilhão</span>
                      <strong style={{ display: "block", fontSize: "14px", marginTop: "4px", color: "var(--text-primary)" }}>{localEvent.regrasCentro?.contatoGestor || "Não informado"}</strong>
                    </div>

                    <div style={{ padding: "14px", borderRadius: "12px", backgroundColor: "var(--accent-glow)", border: "1px solid rgba(41, 59, 143, 0.15)", fontSize: "11px", color: "var(--text-secondary)" }}>
                      💡 <strong>Impacto Financeiro Automatizado:</strong> Ao selecionar este Centro de Convenções, as taxas de energia e limpeza (<strong>R$ {(localEvent.regrasCentro?.taxaEnergia || 0) + (localEvent.regrasCentro?.taxaLimpeza || 0)}</strong>) foram incluídas automaticamente na linha de "Taxas do Organizador" do seu Centro de Custos.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "40px", border: "1px dashed var(--border)", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                  Por favor, selecione um pavilhão no menu acima para carregar as regras automáticas da feira.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TOOLS & FURNITURE */}
          {activeTab === "tools" && (
            <div>
              <span className="text-xs text-muted semibold uppercase mb-20" style={{ display: "block" }}>
                Alocação de Materiais e Mobiliário do Depósito (Disponibilidade WMS)
              </span>
              <table className="sheet-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Item</th>
                    <th style={{ padding: "8px" }}>Tipo</th>
                    <th style={{ padding: "8px" }}>Posição Física</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>Disponível</th>
                    <th style={{ padding: "8px", textAlign: "center", width: "120px" }}>Alocado</th>
                  </tr>
                </thead>
                <tbody>
                  {allWarehouseItems.map((item) => {
                    const assigned = localEvent.assignedTools.find(t => t.id === item.id);
                    const currentQty = assigned ? assigned.allocatedQty : 0;
                    
                    return (
                      <tr key={item.id} className="sheet-row" style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="semibold" style={{ padding: "8px" }}>{item.name}</td>
                        <td style={{ padding: "8px" }}>
                          <span className={`badge ${item.type === "tool" ? "badge-pt" : "badge-en"}`}>
                            {item.type === "tool" ? "Ferramenta" : "Móvel"}
                          </span>
                        </td>
                        <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                          Galpão {item.localizacaoFisica.galpao} • Corredor {item.localizacaoFisica.corredor} • Prat. {item.localizacaoFisica.prateleira}
                        </td>
                        <td style={{ padding: "8px", textAlign: "center", color: "var(--text-secondary)" }}>{item.stock} un</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <input 
                            type="number" 
                            min="0" 
                            max={item.stock + currentQty} // Allow allocating up to physical stock
                            value={currentQty} 
                            onChange={(e) => handleToolQtyChange(item.id, parseInt(e.target.value) || 0)}
                            className="input-qty"
                            style={{
                              width: "60px",
                              padding: "4px 8px",
                              border: "1px solid var(--border)",
                              borderRadius: "4px",
                              textAlign: "center"
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: STAFF */}
          {activeTab === "staff" && (
            <div>
              <span className="text-xs text-muted semibold uppercase mb-20" style={{ display: "block" }}>
                Escalar Profissionais (Sinalização de NRs e Pendências)
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {allEmployees.map((emp) => {
                  const isChecked = localEvent.assignedEmployees.some(e => e.id === emp.id);
                  return (
                    <div key={emp.id} className="staff-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--bg-card)" }}>
                      <div className="staff-row-info" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="staff-row-avatar" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent-glow)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                          {emp.foto || emp.name.substring(0, 1)}
                        </div>
                        <div>
                          <strong className="text-sm" style={{ display: "block" }}>{emp.name}</strong>
                          <span className="text-xs text-muted">{emp.role}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        {/* NRs certifications status */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px" }}>
                          {emp.nr35Vencimento ? (
                            <span style={{ color: "var(--success-text)", fontWeight: "600" }}>✓ NR-35 OK ({emp.nr35Vencimento.substring(0,4)})</span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>NR-35 N/A</span>
                          )}
                          {emp.nr10Vencimento ? (
                            <span style={{ color: "var(--success-text)", fontWeight: "600" }}>✓ NR-10 OK ({emp.nr10Vencimento.substring(0,4)})</span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>NR-10 N/A</span>
                          )}
                        </div>

                        {/* Document completion status */}
                        <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span className="status-dot" style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: emp.documentStatus === "complete" ? "var(--success-text)" : "var(--warning)" }}></span>
                          <span className="text-muted">Docs {emp.documentStatus === "complete" ? "OK" : "Pendente"}</span>
                        </div>

                        {/* Assign switch button */}
                        <button 
                          className={isChecked ? "btn-danger text-xs" : "btn-primary text-xs"}
                          onClick={() => toggleEmployee(emp.id)}
                          style={{ padding: "4px 10px", borderRadius: "8px" }}
                        >
                          {isChecked ? "Remover" : "Escalar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TRAVEL */}
          {activeTab === "travel" && (
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Nome do Hotel / Acomodação da Equipe</label>
                <input 
                  type="text" 
                  value={localEvent.hotelName || ""} 
                  onChange={(e) => handleTravelChange("hotelName", e.target.value)}
                  placeholder="Ex: Ibis Budget Center Paulista" 
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Data de Check-In</label>
                <input 
                  type="date" 
                  value={localEvent.hotelCheckin || ""} 
                  onChange={(e) => handleTravelChange("hotelCheckin", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Detalhes das Passagens Aéreas (Localizadores, Voos, Horários)</label>
                <textarea 
                  rows={4}
                  value={localEvent.flightDetails || ""} 
                  onChange={(e) => handleTravelChange("flightDetails", e.target.value)}
                  placeholder="Ex: Latam LA3341 (NAT -> GRU) - 22/08 às 14:00 - Localizadores: ADFLK, GDLJK..."
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)" }}
                />
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTATION */}
          {activeTab === "docs" && (
            <div>
              <span className="text-xs text-muted semibold uppercase mb-20" style={{ display: "block" }}>
                Documentos Obrigatórios exigidos para Credenciamento e Montagem
              </span>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {localEvent.docs.map((doc) => (
                   <div key={doc.id} className="checklist-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--bg-card)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FileText size={16} className="text-muted" />
                      <strong className="text-sm" style={{ color: "var(--text-primary)" }}>{doc.name}</strong>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span className="text-xs text-muted">
                        Status:{" "}
                        {doc.status === "pending" && <span style={{ color: "var(--warning)", fontWeight: 600 }}>Pendente</span>}
                        {doc.status === "uploaded" && <span style={{ color: "var(--accent)", fontWeight: 600 }}>Aguardando Avaliação</span>}
                        {doc.status === "approved" && <span style={{ color: "var(--success-text)", fontWeight: 600 }}>✓ Aprovado e Liberado</span>}
                      </span>
                      
                      <button 
                        className="btn-secondary text-xs"
                        style={{ padding: "4px 8px", borderRadius: "6px" }}
                        onClick={() => simulateDocUpload(doc.id)}
                      >
                        {doc.status === "pending" && "Subir Arquivo"}
                        {doc.status === "uploaded" && "Aprovar Doc"}
                        {doc.status === "approved" && "Reiniciar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="dropzone" style={{ border: "2px dashed var(--border)", padding: "20px", borderRadius: "12px", textAlign: "center", marginTop: "20px", cursor: "pointer" }}>
                <span className="text-xs" style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>
                  Arraste arquivos complementares adicionais aqui (Termos, ARTs, RRTs)
                </span>
                <span className="text-xs text-muted">Limite de 10MB por arquivo • Apenas formato PDF</span>
              </div>
            </div>
          )}

          {/* TAB 6: COSTS CENTER */}
          {activeTab === "costs" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
              {/* Manual/Previsto entry values */}
              <div style={{ backgroundColor: "var(--bg-main)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>ESTIMAR ORÇAMENTO (CATEGORIAS)</span>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                  {Object.keys(localEvent.centroCusto || {}).map((catKey) => {
                    const typedKey = catKey as keyof typeof localEvent.centroCusto;
                    const label = 
                      typedKey === "madeiraMdf" ? "Madeira e MDF" :
                      typedKey === "vidrosVidraçaria" ? "Vidros / Vidraçaria" :
                      typedKey === "iluminacaoEletrica" ? "Iluminação / Elétrica" :
                      typedKey === "mobiliarioAlugado" ? "Mobiliário Alugado" :
                      typedKey === "fretes" ? "Fretes e Carga" :
                      typedKey === "combustivelPedagios" ? "Combustível / Pedágio" :
                      typedKey === "hospedagemPassagens" ? "Hospedagem / Voos" :
                      typedKey === "equipePropria" ? "Equipe Própria" :
                      typedKey === "terceirizados" ? "Terceirizados (Diária)" : "Taxas do Organizador";
                    
                    return (
                      <div key={catKey} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                        <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ color: "var(--text-muted)" }}>R$</span>
                          <input 
                            type="number" 
                            value={localEvent.centroCusto[typedKey] || 0}
                            onChange={(e) => handleCostChange(typedKey, parseFloat(e.target.value) || 0)}
                            style={{ width: "80px", padding: "4px 6px", border: "1px solid var(--border)", borderRadius: "4px", textAlign: "right" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consolidation values metrics */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>CONTRATO DO ESTANDE</span>
                  <strong style={{ fontSize: "20px", color: "var(--accent)" }}>R$ {localEvent.valorContratado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                </div>

                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>CUSTOS TOTAIS ESTIMADOS</span>
                  <strong style={{ fontSize: "18px", color: "var(--accent-secondary)" }}>R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                </div>

                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>LUCRO LÍQUIDO PREVISTO</span>
                  <strong style={{ fontSize: "18px", color: netProfit >= 0 ? "var(--success-text)" : "var(--danger)" }}>
                    R$ {netProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Margem: {marginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MAP & ROUTE */}
          {activeTab === "route" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", backgroundColor: "var(--bg-card)", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <MapPin size={24} style={{ color: "var(--accent-secondary)", flexShrink: 0, marginTop: "4px" }} />
                <div style={{ flexGrow: 1 }}>
                  <strong style={{ display: "block", fontSize: "14px", color: "var(--text-primary)" }}>Endereço de Entrega Técnica:</strong>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>{localEvent.mapsRoute.endereco}</span>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace", marginTop: "4px" }}>
                    Coordenadas: Lat {localEvent.mapsRoute.latitude} • Long {localEvent.mapsRoute.longitude}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ border: "1px solid var(--border)", padding: "16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card)" }}>
                  <Navigation size={22} style={{ color: "var(--accent)" }} />
                  <div>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>Distância do Depósito JC:</span>
                    <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>{localEvent.mapsRoute.distanciaKm} km</strong>
                  </div>
                </div>

                <div style={{ border: "1px solid var(--border)", padding: "16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card)" }}>
                  <Calendar size={22} style={{ color: "var(--success-text)" }} />
                  <div>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>Tempo de Rota Estimado:</span>
                    <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>{localEvent.mapsRoute.tempoEstimado}</strong>
                  </div>
                </div>
              </div>

              {/* Mock maps visualization */}
              <div 
                style={{ 
                  height: "220px", 
                  borderRadius: "16px", 
                  border: "1px solid var(--border)", 
                  backgroundColor: "#e3f2fd", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  backgroundImage: "radial-gradient(circle, #b3e5fc 10%, transparent 10.5%), radial-gradient(circle, #b3e5fc 10%, transparent 10.5%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                  position: "relative"
                }}
              >
                <div style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", border: "1px solid var(--accent)", padding: "12px 18px", borderRadius: "100px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-md)" }}>
                  <Navigation size={16} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>Rota de Pavilhão Ativa</span>
                </div>
                
                <a 
                  href={localEvent.mapsRoute.linkMaps} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                    backgroundColor: "var(--bg-sidebar)",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "600"
                  }}
                >
                  Abrir no Google Maps ↗
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
