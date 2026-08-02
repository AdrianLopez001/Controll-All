import React, { useState } from "react";
import { 
  Truck, Plane, Hotel, Plus, Upload, FileText, Trash2, 
  Eye, Paperclip, CheckCircle, Download
} from "lucide-react";
import type { Project, VeiculoLogistica, ComprovanteLogistica } from "../types";

interface LogisticsProps {
  vehicles: VeiculoLogistica[];
  events: Project[];
  onUpdateVehicle: (updated: VeiculoLogistica) => void;
  onUpdateEvent: (updated: Project) => void;
  onAddVehicle: (newVeh: Omit<VeiculoLogistica, "id">) => void;
}

export default function Logistics({ 
  vehicles, events, onUpdateVehicle, onUpdateEvent, onAddVehicle 
}: LogisticsProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VeiculoLogistica | null>(null);
  const [selectedEventTravel, setSelectedEventTravel] = useState<Project | null>(null);
  
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddHospedagemOpen, setIsAddHospedagemOpen] = useState(false);
  const [isAddViagemOpen, setIsAddViagemOpen] = useState(false);
  const [targetEventId, setTargetEventId] = useState("");

  // New Vehicle form states
  const [newModel, setNewModel] = useState("");
  const [newPlaca, setNewPlaca] = useState("");
  const [newKm, setNewKm] = useState(0);
  const [newDriver, setNewDriver] = useState("");
  const [newStatus, setNewStatus] = useState<VeiculoLogistica["status"]>("disponivel");

  // Edit Vehicle states
  const [editModel, setEditModel] = useState("");
  const [editPlaca, setEditPlaca] = useState("");
  const [editKm, setEditKm] = useState(0);
  const [editDriver, setEditDriver] = useState("");
  const [editStatus, setEditStatus] = useState<VeiculoLogistica["status"]>("disponivel");

  // Travel / Hospedagem Form States
  const [editHotelName, setEditHotelName] = useState("");
  const [editHotelCheckin, setEditHotelCheckin] = useState("");
  const [editFlightDetails, setEditFlightDetails] = useState("");
  const [editComprovantes, setEditComprovantes] = useState<ComprovanteLogistica[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Helper to convert file to ComprovanteLogistica object (Base64)
  const processFileToComprovante = (file: File): Promise<ComprovanteLogistica> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let tipo = 'outro';
        if (['pdf'].includes(ext)) tipo = 'pdf';
        else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) tipo = 'imagem';
        else if (['xls', 'xlsx', 'csv'].includes(ext)) tipo = 'excel';
        else if (['doc', 'docx'].includes(ext)) tipo = 'word';

        resolve({
          id: `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nome: file.name,
          tipo,
          sizeBytes: file.size,
          url: reader.result as string,
          dataEnvio: new Date().toISOString().split('T')[0]
        });
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUploadInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const newComps: ComprovanteLogistica[] = [];
      for (let i = 0; i < files.length; i++) {
        const comp = await processFileToComprovante(files[i]);
        newComps.push(comp);
      }
      setEditComprovantes(prev => [...prev, ...newComps]);
    } catch (err) {
      alert("Erro ao processar o arquivo anexado.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveComprovante = (id: string) => {
    setEditComprovantes(prev => prev.filter(c => c.id !== id));
  };

  const handleOpenVehicleEdit = (v: VeiculoLogistica) => {
    setSelectedVehicle(v);
    setEditModel(v.modelo);
    setEditPlaca(v.placa);
    setEditKm(v.kmAtual);
    setEditDriver(v.motoristaAtivo || "");
    setEditStatus(v.status);
  };

  const handleSaveVehicle = () => {
    if (!selectedVehicle) return;
    const updated: VeiculoLogistica = {
      ...selectedVehicle,
      modelo: editModel,
      placa: editPlaca,
      kmAtual: editKm,
      motoristaAtivo: editDriver,
      status: editStatus
    };
    onUpdateVehicle(updated);
    setSelectedVehicle(null);
    alert("Veículo atualizado com sucesso!");
  };

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel || !newPlaca) return;
    onAddVehicle({
      modelo: newModel,
      placa: newPlaca,
      kmAtual: newKm,
      motoristaAtivo: newDriver,
      status: newStatus,
      combustivelCard: false
    });
    setNewModel("");
    setNewPlaca("");
    setNewKm(0);
    setNewDriver("");
    setIsAddVehicleOpen(false);
  };

  const handleOpenTravelEdit = (evt: Project) => {
    setSelectedEventTravel(evt);
    setEditHotelName(evt.hotelName || "");
    setEditHotelCheckin(evt.hotelCheckin || "");
    setEditFlightDetails(evt.flightDetails || "");
    setEditComprovantes(evt.comprovantesLogistica || []);
  };

  const handleSaveTravel = () => {
    if (!selectedEventTravel) return;
    const updated: Project = {
      ...selectedEventTravel,
      hotelName: editHotelName,
      hotelCheckin: editHotelCheckin,
      flightDetails: editFlightDetails,
      comprovantesLogistica: editComprovantes
    };
    onUpdateEvent(updated);
    setSelectedEventTravel(null);
    alert("Informações logísticas e comprovantes salvos com sucesso!");
  };

  const openDocumentView = (comp: ComprovanteLogistica) => {
    const win = window.open();
    if (win) {
      if (comp.tipo === 'imagem') {
        win.document.write(`<img src="${comp.url}" style="max-width:100%;" alt="${comp.nome}" />`);
      } else {
        win.document.write(`<iframe src="${comp.url}" style="width:100%; height:100vh; border:none;"></iframe>`);
      }
    }
  };

  // Filter events with travel details or files
  const travelEvents = events.filter(e => e.hotelName || e.flightDetails || (e.comprovantesLogistica && e.comprovantesLogistica.length > 0) || e.phase !== "post");

  return (
    <div className="logistics-container" style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Veículos da Frota</span>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--accent)", marginTop: "4px" }}>{vehicles.length}</h3>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent-glow)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Hospedagens Ativas</span>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--success-text)", marginTop: "4px" }}>{events.filter(e => e.hotelName).length}</h3>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--success-glow)", color: "var(--success-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hotel size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vôos &amp; Comprovantes</span>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--warning)", marginTop: "4px" }}>{events.filter(e => e.flightDetails || (e.comprovantesLogistica && e.comprovantesLogistica.length > 0)).length}</h3>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--warning-glow)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane size={20} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
        
        {/* Left Side: Vehicles Fleet */}
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Controle de Frota / Veículos</h4>
            <button className="btn-primary text-xs" style={{ padding: "4px 10px" }} onClick={() => setIsAddVehicleOpen(true)}>
              <Plus size={12} /> Add Carro
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {vehicles.map(v => (
              <div 
                key={v.id} 
                className="staff-row" 
                onClick={() => handleOpenVehicleEdit(v)}
                style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card-hover)", cursor: "pointer" }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--accent-glow)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Truck size={18} />
                </div>
                
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: "13px" }}>{v.modelo}</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>Placa: {v.placa} | Km: {v.kmAtual}</span>
                </div>
                
                <div style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                  <span 
                    style={{
                      fontSize: "9px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: 
                        v.status === "disponivel" ? "var(--success-glow)" : 
                        v.status === "manutencao" ? "var(--danger-glow)" : "var(--accent-glow)",
                      color: 
                        v.status === "disponivel" ? "var(--success-text)" : 
                        v.status === "manutencao" ? "var(--danger-text)" : "var(--accent-text)"
                    }}
                  >
                    {v.status.toUpperCase()}
                  </span>
                  {v.motoristaAtivo && (
                    <span style={{ display: "block", fontSize: "9px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      👤 {v.motoristaAtivo.split(" ")[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Travel arrangements cards */}
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Passagens &amp; Hospedagens da Equipe</h4>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="btn-primary text-xs" style={{ padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }} onClick={() => { setEditHotelName(""); setEditHotelCheckin(""); setEditComprovantes([]); setIsAddHospedagemOpen(true); }}>
                <Hotel size={12} /> + Nova Hospedagem
              </button>
              <button className="btn-secondary text-xs" style={{ padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }} onClick={() => { setEditFlightDetails(""); setEditComprovantes([]); setIsAddViagemOpen(true); }}>
                <Plane size={12} /> + Nova Viagem
              </button>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {travelEvents.map(evt => (
              <div 
                key={evt.id} 
                onClick={() => handleOpenTravelEdit(evt)}
                style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", cursor: "pointer", transition: "var(--transition)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                  <div>
                    <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{evt.name}</strong>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Cliente: {evt.client}</span>
                  </div>
                  <span className="badge badge-during" style={{ fontSize: "9px", height: "fit-content" }}>{evt.phase === "during" ? "Montando" : "No Depósito"}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "12px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(237, 106, 82, 0.12)", color: "var(--accent-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Hotel size={14} />
                    </div>
                    <div>
                      <strong style={{ display: "block", color: "var(--text-primary)" }}>Hospedagem:</strong>
                      <span style={{ color: "var(--text-secondary)" }}>{evt.hotelName || "Não definida"}</span>
                      {evt.hotelCheckin && <span style={{ display: "block", color: "var(--text-muted)", fontSize: "11px" }}>Check-in: {evt.hotelCheckin}</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-glow)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Plane size={14} />
                    </div>
                    <div>
                      <strong style={{ display: "block", color: "var(--text-primary)" }}>Voo &amp; Passagens:</strong>
                      <span style={{ color: "var(--text-secondary)", display: "block" }}>{evt.flightDetails || "Não definidas"}</span>
                    </div>
                  </div>
                </div>

                {/* Render Uploaded Documents/Comprovantes Badge Section */}
                {evt.comprovantesLogistica && evt.comprovantesLogistica.length > 0 && (
                  <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "10px", marginTop: "2px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                      <Paperclip size={12} /> Comprovantes &amp; Arquivos Anexados ({evt.comprovantesLogistica.length})
                    </span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {evt.comprovantesLogistica.map(comp => (
                        <div 
                          key={comp.id}
                          onClick={(e) => { e.stopPropagation(); openDocumentView(comp); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--bg-main)",
                            fontSize: "11px",
                            color: "var(--text-primary)",
                            cursor: "pointer"
                          }}
                        >
                          <FileText size={12} style={{ color: "var(--accent)" }} />
                          <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "600" }}>{comp.nome}</span>
                          <Eye size={12} style={{ color: "var(--text-muted)" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Add Vehicle */}
      {isAddVehicleOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Adicionar Novo Veículo</h3>
            <form onSubmit={handleAddVehicleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Modelo / Nome</label>
                <input type="text" value={newModel} onChange={(e) => setNewModel(e.target.value)} required placeholder="Ex: Mercedes Sprinter Cargo" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Placa</label>
                  <input type="text" value={newPlaca} onChange={(e) => setNewPlaca(e.target.value)} required placeholder="XXX-0000" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>KM Inicial</label>
                  <input type="number" value={newKm} onChange={(e) => setNewKm(parseInt(e.target.value) || 0)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Motorista Designado</label>
                <input type="text" value={newDriver} onChange={(e) => setNewDriver(e.target.value)} placeholder="Ex: João Alves" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px" }}>
                  <option value="disponivel">Disponível</option>
                  <option value="em_viagem">Em Viagem</option>
                  <option value="manutencao">Em Manutenção</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddVehicleOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Homologar Veículo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Vehicle */}
      {selectedVehicle && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedVehicle(null)}>
          <div 
            style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "var(--shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Editar Veículo Operacional</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Modelo</label>
                <input type="text" value={editModel} onChange={(e) => setEditModel(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Placa</label>
                  <input type="text" value={editPlaca} onChange={(e) => setEditPlaca(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Quilometragem</label>
                  <input type="number" value={editKm} onChange={(e) => setEditKm(parseInt(e.target.value) || 0)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Motorista</label>
                <input type="text" value={editDriver} onChange={(e) => setEditDriver(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as any)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px" }}>
                  <option value="disponivel">Disponível</option>
                  <option value="em_viagem">Em Viagem</option>
                  <option value="manutencao">Em Manutenção</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedVehicle(null)}>Cancelar</button>
                <button type="button" className="btn-primary" onClick={handleSaveVehicle}>Salvar Veículo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Travel Card with Upload Support */}
      {selectedEventTravel && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedEventTravel(null)}>
          <div 
            style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "520px", boxShadow: "var(--shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Editar Viagem &amp; Comprovantes: {selectedEventTravel.name}</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Nome do Hotel</label>
                <input type="text" value={editHotelName} onChange={(e) => setEditHotelName(e.target.value)} placeholder="Ex: Windsor Barra, RJ" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Data Check-in</label>
                <input type="date" value={editHotelCheckin} onChange={(e) => setEditHotelCheckin(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Passagens &amp; Localizadores (Voo / Cia)</label>
                <textarea rows={3} value={editFlightDetails} onChange={(e) => setEditFlightDetails(e.target.value)} placeholder="Ex: GOL G3-2281 - Conf: ABC123..." style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)" }} />
              </div>

              {/* Upload Comprovantes Section */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "4px" }}>
                <label style={{ display: "block", fontWeight: "700", marginBottom: "6px", color: "var(--accent)" }}>
                  📎 Anexar Comprovante ou Documento (PDF, Imagem, Excel, Word)
                </label>

                <div style={{ border: "2px dashed var(--border)", borderRadius: "10px", padding: "14px", textAlign: "center", backgroundColor: "var(--bg-main)", marginBottom: "10px" }}>
                  <Upload size={20} style={{ color: "var(--accent)", marginBottom: "6px" }} />
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 8px 0" }}>
                    Arraste ou selecione comprovantes de hospedagem, vauchers de passagem, notas ou planilhas.
                  </p>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,.pdf,.xls,.xlsx,.doc,.docx"
                    onChange={handleFileUploadInput} 
                    style={{ fontSize: "11px" }}
                  />
                  {isUploading && <span style={{ display: "block", fontSize: "11px", color: "var(--accent)", marginTop: "4px" }}>Processando arquivo...</span>}
                </div>

                {/* List of uploaded files */}
                {editComprovantes.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)" }}>Comprovantes Anexados:</span>
                    {editComprovantes.map(comp => (
                      <div key={comp.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--bg-main)", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "11px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                          <FileText size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                          <span style={{ fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "240px" }}>{comp.nome}</span>
                          <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>({comp.tipo.toUpperCase()})</span>
                        </div>

                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button type="button" onClick={() => openDocumentView(comp)} className="btn-secondary text-xs" style={{ padding: "2px 6px" }} title="Visualizar documento">
                            <Eye size={12} /> Ver
                          </button>
                          <button type="button" onClick={() => handleRemoveComprovante(comp.id)} className="btn-danger text-xs" style={{ padding: "2px 6px" }} title="Remover comprovante">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedEventTravel(null)}>Cancelar</button>
                <button type="button" className="btn-primary" onClick={handleSaveTravel}>Salvar Detalhes &amp; Anexos</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Hospedagem */}
      {isAddHospedagemOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setIsAddHospedagemOpen(false)}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "var(--shadow-lg)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>+ Cadastrar Nova Hospedagem</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!targetEventId || !editHotelName) return;
              const evt = events.find(x => x.id === targetEventId);
              if (evt) {
                const existing = evt.comprovantesLogistica || [];
                onUpdateEvent({ 
                  ...evt, 
                  hotelName: editHotelName, 
                  hotelCheckin: editHotelCheckin,
                  comprovantesLogistica: [...existing, ...editComprovantes]
                });
                alert("Hospedagem e comprovantes salvos com sucesso!");
              }
              setIsAddHospedagemOpen(false);
              setEditHotelName("");
              setEditHotelCheckin("");
              setEditComprovantes([]);
            }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Evento / Estande Relacionado *</label>
                <select value={targetEventId} onChange={(e) => setTargetEventId(e.target.value)} required style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <option value="">Selecione o Projeto...</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.name} — {e.client}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Nome do Hotel / Acomodação *</label>
                <input type="text" value={editHotelName} onChange={(e) => setEditHotelName(e.target.value)} placeholder="Ex: Hotel Windsor Copacabana" required style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Data Check-in</label>
                <input type="date" value={editHotelCheckin} onChange={(e) => setEditHotelCheckin(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>

              {/* Upload Comprovantes Input */}
              <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "10px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px", color: "var(--accent)" }}>
                  Anexar Comprovante / Voucher de Hospedagem (PDF, Imagem, Excel, Word)
                </label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,.pdf,.xls,.xlsx,.doc,.docx"
                  onChange={handleFileUploadInput}
                  style={{ fontSize: "11px", width: "100%" }} 
                />

                {editComprovantes.length > 0 && (
                  <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {editComprovantes.map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", backgroundColor: "var(--bg-main)", padding: "4px 8px", borderRadius: "6px" }}>
                        <span>📎 {c.nome}</span>
                        <button type="button" onClick={() => handleRemoveComprovante(c.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddHospedagemOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Hospedagem</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Viagem / Voo */}
      {isAddViagemOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setIsAddViagemOpen(false)}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "var(--shadow-lg)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>+ Cadastrar Nova Viagem / Voo</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!targetEventId || !editFlightDetails) return;
              const evt = events.find(x => x.id === targetEventId);
              if (evt) {
                const existing = evt.comprovantesLogistica || [];
                onUpdateEvent({ 
                  ...evt, 
                  flightDetails: editFlightDetails,
                  comprovantesLogistica: [...existing, ...editComprovantes]
                });
                alert("Detalhes da viagem e comprovantes anexados salvos com sucesso!");
              }
              setIsAddViagemOpen(false);
              setEditFlightDetails("");
              setEditComprovantes([]);
            }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Evento / Estande Relacionado *</label>
                <select value={targetEventId} onChange={(e) => setTargetEventId(e.target.value)} required style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <option value="">Selecione o Projeto...</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.name} — {e.client}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Detalhes de Voos &amp; Passagens *</label>
                <textarea rows={3} value={editFlightDetails} onChange={(e) => setEditFlightDetails(e.target.value)} placeholder="Ex: LATAM LA-3810 NAT-GRU | Localizador: XYZ123..." required style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)" }} />
              </div>

              {/* Upload Comprovantes Input */}
              <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "10px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px", color: "var(--accent)" }}>
                  Anexar Comprovantes ou Bilhetes (PDF, Imagem, Excel, Word)
                </label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,.pdf,.xls,.xlsx,.doc,.docx"
                  onChange={handleFileUploadInput}
                  style={{ fontSize: "11px", width: "100%" }} 
                />

                {editComprovantes.length > 0 && (
                  <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {editComprovantes.map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", backgroundColor: "var(--bg-main)", padding: "4px 8px", borderRadius: "6px" }}>
                        <span>📎 {c.nome}</span>
                        <button type="button" onClick={() => handleRemoveComprovante(c.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddViagemOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Viagem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
