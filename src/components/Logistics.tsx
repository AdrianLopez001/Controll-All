import React, { useState } from "react";
import { 
  Truck, Calendar, Plane, Hotel, Edit, Plus, X, Tag
} from "lucide-react";
import type { Project, VeiculoLogistica } from "../types";

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

  // Edit Travel states
  const [editHotelName, setEditHotelName] = useState("");
  const [editHotelCheckin, setEditHotelCheckin] = useState("");
  const [editFlightDetails, setEditFlightDetails] = useState("");

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
  };

  const handleSaveTravel = () => {
    if (!selectedEventTravel) return;
    const updated: Project = {
      ...selectedEventTravel,
      hotelName: editHotelName,
      hotelCheckin: editHotelCheckin,
      flightDetails: editFlightDetails
    };
    onUpdateEvent(updated);
    setSelectedEventTravel(null);
    alert("Informações logísticas de viagem atualizadas com sucesso!");
  };

  // Filter events with travel details
  const travelEvents = events.filter(e => e.hotelName || e.flightDetails || e.phase !== "post");

  return (
    <div className="logistics-container" style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifySpaceBetween: "space-between", boxShadow: "var(--shadow-sm)" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Veículos da Frota</span>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--accent)", marginTop: "4px" }}>{vehicles.length}</h3>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent-glow)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifySpaceBetween: "space-between", boxShadow: "var(--shadow-sm)" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Hospedagens Ativas</span>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--success-text)", marginTop: "4px" }}>{events.filter(e => e.hotelName).length}</h3>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--success-glow)", color: "var(--success-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hotel size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifySpaceBetween: "space-between", boxShadow: "var(--shadow-sm)" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vôos Cadastrados</span>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--warning)", marginTop: "4px" }}>{events.filter(e => e.flightDetails).length}</h3>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--warning-glow)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane size={20} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
        
        {/* Left Side: Vehicles Fleet */}
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
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
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--accent-glow)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                        v.status === "manutencao" ? "var(--danger)" : "var(--accent)"
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
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
          <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>Passagens &amp; Hospedagens da Equipe</h4>
          
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
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Hotel size={16} style={{ color: "var(--accent-secondary)", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong style={{ display: "block", color: "var(--text-primary)" }}>Hospedagem:</strong>
                      <span style={{ color: "var(--text-secondary)" }}>{evt.hotelName || "Não definida"}</span>
                      {evt.hotelCheckin && <span style={{ display: "block", color: "var(--text-muted)", fontSize: "11px" }}>Check-in: {evt.hotelCheckin}</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Plane size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong style={{ display: "block", color: "var(--text-primary)" }}>Voo &amp; Passagens:</strong>
                      <span style={{ color: "var(--text-secondary)", display: "block" }}>{evt.flightDetails || "Não definidas"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Add Vehicle */}
      {isAddVehicleOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "var(--shadow-lg)" }}>
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
            style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "var(--shadow-lg)" }}
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

      {/* Modal Edit Travel Card */}
      {selectedEventTravel && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedEventTravel(null)}>
          <div 
            style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "500px", boxShadow: "var(--shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Editar Viagem: {selectedEventTravel.name}</h3>
            
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
                <textarea rows={4} value={editFlightDetails} onChange={(e) => setEditFlightDetails(e.target.value)} placeholder="Ex: GOL G3-2281 - Conf: ABC123..." style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedEventTravel(null)}>Cancelar</button>
                <button type="button" className="btn-primary" onClick={handleSaveTravel}>Salvar Detalhes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
