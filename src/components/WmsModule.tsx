import React, { useState } from "react";
import { 
  Archive, Search, QrCode, ClipboardList, MapPin, Plus, 
  Upload, FileText, Trash2, CheckCircle, TrendingUp, HelpCircle
} from "lucide-react";
import type { WarehouseItem, WmsLocacaoItem } from "../types";

interface WmsModuleProps {
  items: WarehouseItem[];
  onUpdateStock: (id: string, newStock: number) => void;
  onUpdateWarehouseItem: (updated: WarehouseItem) => void;
}

export default function WmsModule({ 
  items, onUpdateStock, onUpdateWarehouseItem 
}: WmsModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "ferramenta" | "mobiliario">("all");
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || "");
  const [activeSubTab, setActiveSubTab] = useState<"inventario" | "locacoes">("inventario");
  const [isLocacaoModalOpen, setIsLocacaoModalOpen] = useState(false);

  // New rental form states
  const [rentItemId, setRentItemId] = useState(items[0]?.id || "");
  const [rentResponsavel, setRentResponsavel] = useState("");
  const [rentSaida, setRentSaida] = useState("");
  const [rentRetorno, setRentRetorno] = useState("");
  const [rentQty, setRentQty] = useState(1);
  const [rentValor, setRentValor] = useState(0);
  const [rentContratoName, setRentContratoName] = useState("");

  const selectedItem = items.find(i => i.id === selectedItemId);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all"
      ? true
      : (categoryFilter === "ferramenta" ? item.type === "tool" : item.type === "furniture");
    return matchesSearch && matchesCategory;
  });

  // Calculate stats for overview
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.stock, 0);
  const toolItemsCount = items.filter(i => i.type === "tool").reduce((acc, curr) => acc + curr.stock, 0);
  const furnitureItemsCount = items.filter(i => i.type === "furniture").reduce((acc, curr) => acc + curr.stock, 0);

  // List all locacoes across all items
  const allLocacoes: { itemObj: WarehouseItem; loc: WmsLocacaoItem }[] = [];
  items.forEach(item => {
    if (item.locacoesDetalhadas) {
      item.locacoesDetalhadas.forEach(l => {
        allLocacoes.push({ itemObj: item, loc: l });
      });
    }
  });

  const handleRegisterLocacao = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(i => i.id === rentItemId);
    if (!item || rentQty <= 0 || !rentResponsavel) return;

    if (item.stock < rentQty) {
      alert("Estoque insuficiente no galpão para realizar esta locação!");
      return;
    }

    const dateSaida = new Date(rentSaida || new Date());
    const dateRetorno = new Date(rentRetorno || new Date());
    const diffTime = Math.abs(dateRetorno.getTime() - dateSaida.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const newLoc: WmsLocacaoItem = {
      id: `loc-${Date.now()}`,
      responsavel: rentResponsavel,
      dataSaida: rentSaida || new Date().toISOString().split("T")[0],
      dataRetorno: rentRetorno || new Date(Date.now() + 7*24*60*60*1000).toISOString().split("T")[0],
      dias: diffDays,
      valor: rentValor || (item.valorLocacao * diffDays * rentQty),
      status: "alocado",
      contratoAnexo: rentContratoName || undefined
    };

    // Update WMS item (deplete physical stock, add to active rentals log)
    const updated: WarehouseItem = {
      ...item,
      stock: item.stock - rentQty, // deplete physical available stock
      locacoesDetalhadas: [...(item.locacoesDetalhadas || []), newLoc]
    };

    onUpdateWarehouseItem(updated);
    
    // Reset form
    setRentResponsavel("");
    setRentQty(1);
    setRentValor(0);
    setRentContratoName("");
    setIsLocacaoModalOpen(false);
    alert("Saída de locação registrada e estoque atualizado!");
  };

  const handleContractUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setRentContratoName(file.name);
  };

  const handleDevolucao = (itemObj: WarehouseItem, locId: string) => {
    const loc = itemObj.locacoesDetalhadas?.find(l => l.id === locId);
    if (!loc) return;

    // Restore stock and mark/remove rental log
    const updated: WarehouseItem = {
      ...itemObj,
      stock: itemObj.stock + 1, // restore tool stock (assuming 1 for simple devolution)
      locacoesDetalhadas: (itemObj.locacoesDetalhadas || []).filter(l => l.id !== locId)
    };

    onUpdateWarehouseItem(updated);
    alert(`Equipamento devolvido ao galpão! Estoque físico do item "${itemObj.name}" incrementado.`);
  };

  return (
    <div className="wms-container" style={{ padding: "10px" }}>
      {/* Sub tabs */}
      <div className="sub-header-tabs" style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", marginBottom: "24px" }}>
        <button 
          className={`tab-btn-link ${activeSubTab === "inventario" ? "active" : ""}`}
          onClick={() => setActiveSubTab("inventario")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "inventario" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "inventario" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "inventario" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Organização Física &amp; Inventário (WMS)
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "locacoes" ? "active" : ""}`}
          onClick={() => setActiveSubTab("locacoes")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "locacoes" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "locacoes" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "locacoes" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Controle de Aluguel &amp; Saídas
        </button>
      </div>

      {activeSubTab === "inventario" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Stock Metrics summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total de Itens Físicos</span>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--accent)", marginTop: "4px" }}>{totalItemsCount} un</h3>
              </div>
            </div>
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Ferramentas Disponíveis</span>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginTop: "4px" }}>{toolItemsCount} un</h3>
              </div>
            </div>
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobiliários no Galpão</span>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginTop: "4px" }}>{furnitureItemsCount} un</h3>
              </div>
            </div>
          </div>

          {/* List and WMS hierarchy details layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
            
            {/* Inventory list block */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Filters */}
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ position: "relative", flexGrow: 1 }}>
                  <Search size={16} className="text-muted" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input 
                    type="text" 
                    placeholder="Buscar pelo nome ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 36px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontFamily: "var(--font)",
                      fontSize: "13px",
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-primary)"
                    }}
                  />
                </div>

                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-primary)" }}
                >
                  <option value="all">Todas Categorias</option>
                  <option value="ferramenta">Ferramentas</option>
                  <option value="mobiliario">Mobiliário</option>
                </select>
              </div>

              {/* List Table */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                      <th style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Cód</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Item</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Categoria</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px", textAlign: "center" }}>Disponível</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Origem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedItemId(item.id)}
                        style={{ 
                          borderBottom: "1px solid var(--border)", 
                          cursor: "pointer",
                          backgroundColor: selectedItemId === item.id ? "var(--bg-main)" : "transparent"
                        }}
                      >
                        <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "12px" }}>{item.codigo}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <strong style={{ display: "block", fontSize: "13px" }}>{item.name}</strong>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {item.type === "tool" ? "🛠️ Ferramenta" : "🛋️ Mobiliário"}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span style={{ fontWeight: "700", color: item.stock <= item.stockMinimo ? "var(--danger)" : "var(--text-primary)" }}>{item.stock}</span>
                          {item.stock <= item.stockMinimo && <span title="Estoque Crítico!" style={{ marginLeft: "4px", color: "var(--warning)" }}>⚠️</span>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", padding: "2px 6px", borderRadius: "4px", backgroundColor: item.origem === "proprio" ? "var(--success-glow)" : "var(--accent-glow)", color: item.origem === "proprio" ? "var(--success-text)" : "var(--accent)" }}>{item.origem}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Detailed placement & physical hierarchy drawer */}
            <div>
              {selectedItem ? (
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "var(--shadow-sm)" }}>
                  {/* Header card details */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", fontFamily: "monospace" }}>PATRIMÔNIO: {selectedItem.patrimonio}</span>
                      <h4 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)" }}>{selectedItem.name}</h4>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{selectedItem.marca} - {selectedItem.modelo}</span>
                    </div>
                    
                    {/* Simulate QR Code view */}
                    <div style={{ border: "1px solid var(--border)", padding: "6px", borderRadius: "8px", textAlign: "center", backgroundColor: "var(--bg-card)" }} title="Scan QR Code">
                      <QrCode size={40} style={{ color: "var(--text-primary)" }} />
                      <span style={{ display: "block", fontSize: "9px", fontFamily: "monospace", color: "var(--text-muted)", marginTop: "2px" }}>{selectedItem.qrCode}</span>
                    </div>
                  </div>

                  {/* Stock and Conservation */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>ESTADO DE CONSERVAÇÃO</label>
                      <strong style={{ display: "block", fontSize: "14px", color: "var(--accent-secondary)", marginTop: "4px" }}>
                        {selectedItem.estadoConservacao.toUpperCase()}
                      </strong>
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>AJUSTAR ESTOQUE FÍSICO</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                        <button 
                          onClick={() => onUpdateStock(selectedItem.id, Math.max(0, selectedItem.stock - 1))}
                          style={{ padding: "2px 10px", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          -
                        </button>
                        <strong style={{ fontSize: "14px" }}>{selectedItem.stock}</strong>
                        <button 
                          onClick={() => onUpdateStock(selectedItem.id, selectedItem.stock + 1)}
                          style={{ padding: "2px 10px", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Physical Hierarchy display WMS */}
                  <div style={{ backgroundColor: "var(--bg-main)", borderRadius: "12px", padding: "16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      <MapPin size={14} style={{ color: "var(--accent-secondary)" }} />
                      LOCALIZAÇÃO FÍSICA NO GALPÃO
                    </span>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Setor Geral:</span>
                        <strong>Setor {selectedItem.localizacaoFisica.galpao}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Corredor / Linha:</span>
                        <strong>Corredor {selectedItem.localizacaoFisica.corredor} • Rua {selectedItem.localizacaoFisica.rua}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Prateleira / Andar:</span>
                        <strong>Prateleira {selectedItem.localizacaoFisica.prateleira} • {selectedItem.localizacaoFisica.andar}° Andar</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Posição / Gaveta:</span>
                        <strong>Posição {selectedItem.localizacaoFisica.posicao}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Pricing info */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", fontSize: "12px" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Custo Compra:</span>
                      <strong>R$ {selectedItem.valorCompra.toLocaleString("pt-BR")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Locação Diária:</span>
                      <strong>R$ {selectedItem.valorLocacao.toLocaleString("pt-BR")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Valor Venda:</span>
                      <strong>R$ {selectedItem.valorVenda.toLocaleString("pt-BR")}</strong>
                    </div>
                  </div>

                </div>
              ) : (
                <p className="text-muted" style={{ textAlign: "center", padding: "40px" }}>Selecione um item no inventário para auditar.</p>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Tab: locacoes list & rental trigger */}
      {activeSubTab === "locacoes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Locações e Saídas de Equipamentos a Terceiros</h4>
            <button className="btn-primary" onClick={() => setIsLocacaoModalOpen(true)}>
              <Plus size={16} /> Nova Saída de Locação
            </button>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Locatário / Projeto</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Equipamento</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Saída</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Retorno Estimado</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px", textAlign: "center" }}>Período</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px", textAlign: "right" }}>Valor Receber</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Contrato Anexo</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px", textAlign: "center" }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {allLocacoes.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Nenhuma locação ativa no momento.</td>
                  </tr>
                ) : (
                  allLocacoes.map(({ itemObj, loc }) => (
                    <tr key={loc.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 20px", fontWeight: "600" }}>{loc.responsavel}</td>
                      <td style={{ padding: "14px 20px" }}>{itemObj.name}</td>
                      <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "12px" }}>{loc.dataSaida}</td>
                      <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "12px" }}>{loc.dataRetorno}</td>
                      <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "12px" }}>{loc.dias} dias</td>
                      <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: "700", color: "var(--success-text)" }}>R$ {loc.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "14px 20px" }}>
                        {loc.contratoAnexo ? (
                          <span 
                            title="Ver contrato locação" 
                            style={{ color: "var(--accent)", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            onClick={() => alert(`Visualizando anexo de contrato: ${loc.contratoAnexo}`)}
                          >
                            <FileText size={12} /> {loc.contratoAnexo}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Nenhum</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <button 
                          onClick={() => handleDevolucao(itemObj, loc.id)}
                          style={{ border: "none", background: "none", color: "var(--success-text)", cursor: "pointer", fontWeight: "600", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <CheckCircle size={14} /> Devolver
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

      {/* Modal Nova Locação */}
      {isLocacaoModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Registrar Saída para Locação</h3>
            
            <form onSubmit={handleRegisterLocacao} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Item a ser Locado</label>
                <select 
                  value={rentItemId} 
                  onChange={(e) => setRentItemId(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px" }}
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Disponível: {i.stock} un)</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Cliente / Responsável pela Locação</label>
                <input type="text" value={rentResponsavel} onChange={(e) => setRentResponsavel(e.target.value)} required placeholder="Ex: Montadora Feiras SP" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Qtd Retirada</label>
                  <input type="number" min="1" value={rentQty} onChange={(e) => setRentQty(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Valor Total Fechado (R$)</label>
                  <input type="number" value={rentValor} onChange={(e) => setRentValor(parseFloat(e.target.value) || 0)} placeholder="Deixe 0 para cálculo automático" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Data de Saída</label>
                  <input type="date" value={rentSaida} onChange={(e) => setRentSaida(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Retorno Estimado</label>
                  <input type="date" value={rentRetorno} onChange={(e) => setRentRetorno(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>

              {/* Upload contrato locacao PDF */}
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Contrato de Locação (PDF)</label>
                <div style={{ border: "1.5px dashed var(--border)", padding: "12px", borderRadius: "8px", textAlign: "center", position: "relative", cursor: "pointer", backgroundColor: "var(--bg-card-hover)" }}>
                  <Upload size={16} className="text-muted" style={{ margin: "0 auto 4px auto" }} />
                  <span style={{ fontSize: "10px", fontWeight: "600", display: "block" }}>
                    {rentContratoName ? rentContratoName : "Carregar Contrato PDF"}
                  </span>
                  <input type="file" accept="application/pdf" onChange={handleContractUpload} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: "pointer" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsLocacaoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Registrar e Sair</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
