import React, { useState, useEffect } from "react";
import { 
  Archive, Search, QrCode, ClipboardList, MapPin, Plus, 
  Upload, FileText, Trash2, CheckCircle, TrendingUp, HelpCircle, Shield
} from "lucide-react";
import type { WarehouseItem, WmsLocacaoItem } from "../types";

interface WmsModuleProps {
  items: WarehouseItem[];
  onUpdateStock: (id: string, newStock: number) => void;
  onUpdateWarehouseItem: (updated: WarehouseItem) => void;
  onAddWarehouseItem?: (newItem: Omit<WarehouseItem, "id">) => void;
  onDeleteWarehouseItem?: (id: string) => void;
  initialSubTab?: "inventario" | "locacoes" | "entradas" | "ajustes";
  initialSelectedItemId?: string;
}

export interface EstoquistaEspaco {
  id: string;
  nome: string;
  galpaoEspaco: string;
  categoriasAutorizadas: string[];
  responsavel: string;
  corBadge: string;
}

export const ESTOQUISTAS_ESPACOS: EstoquistaEspaco[] = [
  {
    id: "est-1",
    nome: "Estoquista 1 — Marcos Andrade",
    galpaoEspaco: "Galpão A — Móveis & Alumínio",
    categoriasAutorizadas: ["moveis", "aluminio"],
    responsavel: "Marcos Andrade (Estoquista Lead)",
    corBadge: "#144580"
  },
  {
    id: "est-2",
    nome: "Estoquista 2 — Carlos Eduardo",
    galpaoEspaco: "Galpão B — Ferramentas & Elétrica",
    categoriasAutorizadas: ["ferramentas", "eletrica"],
    responsavel: "Carlos Eduardo (Técnico WMS)",
    corBadge: "#0284c7"
  },
  {
    id: "est-3",
    nome: "Estoquista 3 — Rafael Souza",
    galpaoEspaco: "Galpão C — Insumos & Consumíveis",
    categoriasAutorizadas: ["insumos"],
    responsavel: "Rafael Souza (Auxiliar de Depósito)",
    corBadge: "#d97706"
  }
];

export default function WmsModule({ 
  items, onUpdateStock, onUpdateWarehouseItem, onAddWarehouseItem, onDeleteWarehouseItem, initialSubTab, initialSelectedItemId
}: WmsModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [wmsCategoryFilter, setWmsCategoryFilter] = useState<"all" | "moveis" | "insumos" | "ferramentas" | "aluminio" | "eletrica">("all");
  const [selectedEstoquistaId, setSelectedEstoquistaId] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "alerta" | "critico">(
    initialSubTab === ("critico" as any) ? "critico" : "all"
  );
  const [selectedItemId, setSelectedItemId] = useState<string>(initialSelectedItemId || items[0]?.id || "");
  const [activeSubTab, setActiveSubTab] = useState<"inventario" | "locacoes" | "entradas" | "ajustes">(
    initialSubTab === ("critico" as any) ? "inventario" : (initialSubTab || "inventario")
  );

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
    if (initialSelectedItemId) {
      setSelectedItemId(initialSelectedItemId);
      const item = items.find(i => i.id === initialSelectedItemId);
      if (item) setSearchTerm(item.name);
    }
  }, [initialSubTab, initialSelectedItemId, items]);
  const [isLocacaoModalOpen, setIsLocacaoModalOpen] = useState(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Material Form States
  const [formName, setFormName] = useState("");
  const [formCodigo, setFormCodigo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formType, setFormType] = useState<"tool" | "furniture">("furniture");
  const [formUnidade, setFormUnidade] = useState("un");
  const [formStock, setFormStock] = useState(10);
  const [formStockMinimo, setFormStockMinimo] = useState(2);
  const [formMarca, setFormMarca] = useState("JC Eventos");
  const [formModelo, setFormModelo] = useState("Padrão");
  const [formValorCompra, setFormValorCompra] = useState(150);
  const [formValorLocacao, setFormValorLocacao] = useState(45);

  const handleOpenCreateModal = () => {
    setFormName("");
    setFormCodigo(`MAT-2026-${Math.floor(100 + Math.random() * 900)}`);
    setFormDescricao("");
    setFormType("furniture");
    setFormUnidade("un");
    setFormStock(10);
    setFormStockMinimo(2);
    setFormMarca("JC Eventos");
    setFormModelo("Padrão");
    setFormValorCompra(150);
    setFormValorLocacao(45);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (item: WarehouseItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCodigo(item.codigo);
    setFormDescricao(item.descricao || "");
    setFormType(item.type);
    setFormUnidade(item.unidade || "un");
    setFormStock(item.stock);
    setFormStockMinimo(item.stockMinimo);
    setFormMarca(item.marca);
    setFormModelo(item.modelo);
    setFormValorCompra(item.valorCompra);
    setFormValorLocacao(item.valorLocacao);
  };

  const handleSaveMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      const updated: WarehouseItem = {
        ...editingItem,
        name: formName,
        codigo: formCodigo,
        descricao: formDescricao,
        type: formType,
        unidade: formUnidade,
        stock: formStock,
        stockMinimo: formStockMinimo,
        marca: formMarca,
        modelo: formModelo,
        valorCompra: formValorCompra,
        valorLocacao: formValorLocacao
      };
      onUpdateWarehouseItem(updated);
      setEditingItem(null);
      alert(`Material "${formName}" atualizado com sucesso!`);
    } else if (onAddWarehouseItem) {
      const newItem: Omit<WarehouseItem, "id"> = {
        codigo: formCodigo || `MAT-${Date.now()}`,
        qrCode: `QR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formName,
        descricao: formDescricao,
        type: formType,
        unidade: formUnidade,
        stock: formStock,
        stockMinimo: formStockMinimo,
        marca: formMarca,
        modelo: formModelo,
        patrimonio: `PAT-${Math.floor(100 + Math.random() * 900)}`,
        estadoConservacao: "excelente",
        valorCompra: formValorCompra,
        valorVenda: formValorLocacao * 2,
        valorLocacao: formValorLocacao,
        origem: "proprio",
        localizacaoFisica: { galpao: "Galpão Principal JC", corredor: "A1", rua: "R1", prateleira: "P2", andar: "1", posicao: "10" }
      };
      onAddWarehouseItem(newItem);
      setIsCreateModalOpen(false);
      alert(`Novo material "${formName}" cadastrado no estoque WMS!`);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingItemId) return;
    if (onDeleteWarehouseItem) {
      onDeleteWarehouseItem(deletingItemId);
      setDeletingItemId(null);
      alert("Material excluído do estoque com sucesso.");
    }
  };

  // WMS logs state
  const [entradasLog, setEntradasLog] = useState([
    { id: "ent-1", tipo: "Compra", itemNome: "Furadeira de Impacto Bosch", qty: 2, responsavel: "Almoxarife", date: "2026-07-10" },
    { id: "ent-2", tipo: "Devolução", itemNome: "Serra Circular Dewalt", qty: 1, responsavel: "José Alves de Oliveira", date: "2026-07-12" }
  ]);

  const [ajustesLog, setAjustesLog] = useState([
    { id: "adj-1", itemNome: "Parafusadeira Makita 12V", qtyAnterior: 16, qtyNova: 15, justificativa: "Ajuste inventário rotativo - 1 unidade extraviada em obra", responsavel: "Almoxarife", date: "2026-07-14" }
  ]);

  // Entrada Form states
  const [inItemId, setInItemId] = useState(items[0]?.id || "");
  const [inTipo, setInTipo] = useState<"compra" | "devolucao" | "emprestimo" | "aluguel" | "transferencia">("compra");
  const [inQty, setInQty] = useState(1);
  const [inResp, setInResp] = useState("Almoxarife");

  // Ajuste Form states
  const [adjItemId, setAdjItemId] = useState(items[0]?.id || "");
  const [adjNewQty, setAdjNewQty] = useState(0);
  const [adjJustify, setAdjJustify] = useState("");
  const [adjResp, setAdjResp] = useState("Almoxarife");

  const handleRegisterEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(i => i.id === inItemId);
    if (!item || inQty <= 0) return;

    onUpdateStock(inItemId, item.stock + inQty);

    const labelMap = {
      compra: "Compra",
      devolucao: "Devolução",
      emprestimo: "Empréstimo",
      aluguel: "Aluguel",
      transferencia: "Transferência"
    };

    setEntradasLog([
      {
        id: `ent-${Date.now()}`,
        tipo: labelMap[inTipo],
        itemNome: item.name,
        qty: inQty,
        responsavel: inResp,
        date: new Date().toISOString().split("T")[0]
      },
      ...entradasLog
    ]);

    setInQty(1);
    alert("Entrada de material registrada e estoque físico atualizado!");
  };

  const handleRegisterAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(i => i.id === adjItemId);
    if (!item || adjNewQty < 0 || !adjJustify) return;

    onUpdateStock(adjItemId, adjNewQty);

    setAjustesLog([
      {
        id: `adj-${Date.now()}`,
        itemNome: item.name,
        qtyAnterior: item.stock,
        qtyNova: adjNewQty,
        justificativa: adjJustify,
        responsavel: adjResp,
        date: new Date().toISOString().split("T")[0]
      },
      ...ajustesLog
    ]);

    setAdjJustify("");
    alert("Correção de estoque registrada e saldo atualizado!");
  };

  // New rental form states
  const [rentItemId, setRentItemId] = useState(items[0]?.id || "");
  const [rentResponsavel, setRentResponsavel] = useState("");
  const [rentSaida, setRentSaida] = useState("");
  const [rentRetorno, setRentRetorno] = useState("");
  const [rentQty, setRentQty] = useState(1);
  const [rentValor, setRentValor] = useState(0);
  const [rentContratoName, setRentContratoName] = useState("");



  const selectedItem = items.find(i => i.id === selectedItemId);

  const getOperationalCategory = (item: WarehouseItem): "locacao" | "ferramenta" | "venda" => {
    if (item.categoriaOperacional) return item.categoriaOperacional;
    if (item.type === "tool") return "ferramenta";
    return "locacao";
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const itemCat = item.categoriaWMS || (item.type === "tool" ? "ferramentas" : "moveis");
    
    // Category filter
    const matchesCategory = wmsCategoryFilter === "all" ? true : itemCat === wmsCategoryFilter;

    // Estoquista Space Delegation filter
    let matchesEstoquista = true;
    if (selectedEstoquistaId !== "all") {
      const estoquista = ESTOQUISTAS_ESPACOS.find(e => e.id === selectedEstoquistaId);
      if (estoquista) {
        matchesEstoquista = estoquista.categoriasAutorizadas.includes(itemCat);
      }
    }

    // Stock Level Status filter (Alerta vs Crítico)
    let matchesStockStatus = true;
    const isCritico = item.stock <= item.stockMinimo;
    const isAlerta = item.stock > item.stockMinimo && item.stock <= Math.ceil(item.stockMinimo * 1.5);

    if (stockStatusFilter === "critico") {
      matchesStockStatus = isCritico;
    } else if (stockStatusFilter === "alerta") {
      matchesStockStatus = isAlerta;
    }

    return matchesSearch && matchesCategory && matchesEstoquista && matchesStockStatus;
  });

  // Calculate stats for 3 WMS categories
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.stock, 0);
  const locacaoItemsCount = items.filter(i => getOperationalCategory(i) === "locacao").reduce((acc, curr) => acc + curr.stock, 0);
  const ferramentaItemsCount = items.filter(i => getOperationalCategory(i) === "ferramenta").reduce((acc, curr) => acc + curr.stock, 0);
  const vendaItemsCount = items.filter(i => getOperationalCategory(i) === "venda").reduce((acc, curr) => acc + curr.stock, 0);

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
        <button 
          className={`tab-btn-link ${activeSubTab === "entradas" ? "active" : ""}`}
          onClick={() => setActiveSubTab("entradas")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "entradas" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "entradas" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "entradas" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Entrada de Insumos
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "ajustes" ? "active" : ""}`}
          onClick={() => setActiveSubTab("ajustes")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "ajustes" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "ajustes" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "ajustes" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Correção de Estoque
        </button>
      </div>

      {activeSubTab === "inventario" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Stock Metrics summary */}
          <div className="responsive-layout-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Materiais p/ Locação</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--accent)", marginTop: "4px" }}>{locacaoItemsCount} un</h3>
              </div>
            </div>
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Ferramentas &amp; Equip.</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginTop: "4px" }}>{ferramentaItemsCount} un</h3>
              </div>
            </div>
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Geral Estocado</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--accent-secondary)", marginTop: "4px" }}>{totalItemsCount} un</h3>
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
                  value={wmsCategoryFilter}
                  onChange={(e) => setWmsCategoryFilter(e.target.value as any)}
                  style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-primary)" }}
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="moveis">🪑 Móveis para Estande</option>
                  <option value="insumos">📦 Insumos &amp; Consumíveis</option>
                  <option value="ferramentas">🛠️ Ferramentas &amp; Equipamentos</option>
                  <option value="aluminio">🏗️ Alumínio &amp; Box-Truss</option>
                  <option value="eletrica">⚡ Elétrica &amp; Iluminação</option>
                </select>

                {/* Filtro por Nível de Estoque (Alerta / Crítico) */}
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value as any)}
                  style={{ 
                    padding: "8px 12px", 
                    border: stockStatusFilter === "critico" ? "1px solid var(--danger)" : stockStatusFilter === "alerta" ? "1px solid var(--warning)" : "1px solid var(--border)", 
                    borderRadius: "8px", 
                    fontFamily: "var(--font)", 
                    fontSize: "13px", 
                    fontWeight: "600",
                    backgroundColor: stockStatusFilter === "critico" ? "var(--danger-glow)" : stockStatusFilter === "alerta" ? "var(--warning-glow)" : "var(--bg-card)",
                    color: stockStatusFilter === "critico" ? "var(--danger-text)" : stockStatusFilter === "alerta" ? "var(--warning-text)" : "var(--text-primary)" 
                  }}
                >
                  <option value="all">🟢 Todos os Níveis</option>
                  <option value="alerta">⚠️ Em Estado de Alerta (Próximo do Mínimo)</option>
                  <option value="critico">🔴 Nível Crítico (No Limite / Esgotado)</option>
                </select>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleOpenCreateModal}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px", whiteSpace: "nowrap" }}
                >
                  <Plus size={14} /> Novo Material
                </button>
              </div>

              {/* Área de Delegação de Acesso aos Espaços de Depósito (3 Estoquistas) */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px 16px", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Shield size={16} style={{ color: "var(--accent)" }} />
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>
                      Delegação de Acesso aos Espaços de Depósito (3 Estoquistas)
                    </span>
                  </div>
                  {selectedEstoquistaId !== "all" && (
                    <span className="badge badge-info" style={{ fontSize: "10px" }}>
                      Filtro de Espaço Ativo
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setSelectedEstoquistaId("all")}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: selectedEstoquistaId === "all" ? "2px solid var(--accent)" : "1px solid var(--border)",
                      backgroundColor: selectedEstoquistaId === "all" ? "var(--accent-glow)" : "var(--bg-main)",
                      color: selectedEstoquistaId === "all" ? "var(--accent)" : "var(--text-primary)",
                      fontWeight: selectedEstoquistaId === "all" ? "700" : "500",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s"
                    }}
                  >
                    Visão Geral (Todos os Espaços)
                  </button>

                  {ESTOQUISTAS_ESPACOS.map(est => {
                    const isSelected = selectedEstoquistaId === est.id;
                    return (
                      <button
                        key={est.id}
                        type="button"
                        onClick={() => setSelectedEstoquistaId(est.id)}
                        style={{
                          padding: "10px",
                          borderRadius: "10px",
                          border: isSelected ? `2px solid ${est.corBadge}` : "1px solid var(--border)",
                          backgroundColor: isSelected ? "var(--accent-glow)" : "var(--bg-main)",
                          color: "var(--text-primary)",
                          fontWeight: isSelected ? "700" : "500",
                          fontSize: "11px",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          transition: "all 0.15s"
                        }}
                      >
                        <strong style={{ color: est.corBadge, fontSize: "12px" }}>{est.nome.split("—")[0].trim()}</strong>
                        <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{est.galpaoEspaco}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informative Banner when Estoquista space filter is selected */}
              {selectedEstoquistaId !== "all" && (() => {
                const est = ESTOQUISTAS_ESPACOS.find(e => e.id === selectedEstoquistaId);
                if (!est) return null;
                return (
                  <div style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--accent)", borderRadius: "10px", padding: "10px 14px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Shield style={{ width: "18px", height: "18px", color: "var(--accent)", flexShrink: 0 }} />
                    <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                      <strong>Gestão Restrita por Espaço:</strong> Exibindo exclusivamente os materiais do <strong>{est.galpaoEspaco}</strong> gerenciados por <strong>{est.nome}</strong>.
                    </div>
                  </div>
                );
              })()}

              {/* List Table */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <table className="table-responsive-cards" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
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
                        <td data-label="Cód" style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "12px" }}>{item.codigo}</td>
                        <td data-label="Item" style={{ padding: "12px 16px" }}>
                          <strong style={{ display: "block", fontSize: "13px" }}>{item.name}</strong>
                        </td>
                        <td data-label="Categoria" style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {item.type === "tool" ? "🛠️ Ferramenta" : "🛋️ Mobiliário"}
                        </td>
                        <td data-label="Disponível" style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span style={{ fontWeight: "700", color: item.stock <= item.stockMinimo ? "var(--danger)" : "var(--text-primary)" }}>{item.stock}</span>
                          {item.stock <= item.stockMinimo && <span title="Estoque Crítico!" style={{ marginLeft: "4px", color: "var(--warning)" }}>⚠️</span>}
                        </td>
                        <td data-label="Origem" style={{ padding: "12px 16px" }}>
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
                        {(selectedItem.estadoConservacao || "Excelente").toUpperCase()}
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

                  {/* Refined operational category specifications */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", textTransform: "uppercase" }}>
                      ESPECIFICAÇÕES OPERACIONAIS: {getOperationalCategory(selectedItem).toUpperCase()}
                    </div>

                    {getOperationalCategory(selectedItem) === "locacao" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Qtd Disponível:</span>
                          <strong style={{ display: "block" }}>{selectedItem.qtdDisponivel ?? selectedItem.stock} un</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Qtd Reservada:</span>
                          <strong style={{ display: "block" }}>{selectedItem.qtdReservada ?? 0} un</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Qtd Alugada:</span>
                          <strong style={{ display: "block" }}>{selectedItem.qtdAlugada ?? 0} un</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Retorno Previsto:</span>
                          <strong style={{ display: "block" }}>{selectedItem.retornoPrevisto || "Sem alugueis ativos"}</strong>
                        </div>
                      </div>
                    )}

                    {getOperationalCategory(selectedItem) === "ferramenta" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Responsável Atual:</span>
                          <strong style={{ display: "block" }}>{selectedItem.colaboradorResponsavel || "Galpão Almoxarifado"}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Localização Atual:</span>
                          <strong style={{ display: "block" }}>{selectedItem.localizacaoAtual || "Galpão Central"}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Data de Saída:</span>
                          <strong style={{ display: "block" }}>{selectedItem.dataSaidaFerramenta || "-"}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Previsão Retorno:</span>
                          <strong style={{ display: "block" }}>{selectedItem.dataRetornoFerramenta || "-"}</strong>
                        </div>
                      </div>
                    )}

                    {getOperationalCategory(selectedItem) === "venda" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Custo de Aquisição:</span>
                          <strong style={{ display: "block" }}>R$ {(selectedItem.custoAquisicao ?? selectedItem.valorCompra).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Margem de Lucro (%):</span>
                          <strong style={{ display: "block" }}>{selectedItem.margemLucro ?? 40}%</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Estoque Mínimo Alerta:</span>
                          <strong style={{ display: "block", color: "var(--danger)" }}>{selectedItem.estoqueMinimo ?? selectedItem.stockMinimo} un</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>Fornecedor Homologado:</span>
                          <strong style={{ display: "block" }}>{selectedItem.fornecedores || "Fornecedor Geral"}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Physical Hierarchy display WMS */}
                  <div style={{ backgroundColor: "var(--bg-main)", borderRadius: "12px", padding: "16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      <MapPin size={14} style={{ color: "var(--accent-secondary)" }} />
                      LOCALIZAÇÃO FÍSICA NO GALPÃO
                    </span>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Código de Barras:</span>
                        <strong>{selectedItem.barcode || `789012${selectedItem.codigo.replace(/[^0-9]/g, "") || "9982"}`}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Fornecedor Padrão:</span>
                        <strong>{selectedItem.fornecedor || "Fornecedor Homologado JC"}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Unidade de Medida:</span>
                        <strong>{selectedItem.unidade || "unid"}</strong>
                      </div>
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

                  {/* Action buttons: Edit & Delete Material */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleOpenEditModal(selectedItem)}
                      style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                    >
                      ✏️ Editar Material
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setDeletingItemId(selectedItem.id)}
                      style={{ flex: 1, padding: "8px", fontSize: "12px", color: "var(--danger)", border: "1px solid var(--danger)" }}
                    >
                      <Trash2 size={13} style={{ marginRight: "4px" }} /> Excluir Item
                    </button>
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
            <table className="table-responsive-cards" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
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
                      <td data-label="Locatário" style={{ padding: "14px 20px", fontWeight: "600" }}>{loc.responsavel}</td>
                      <td data-label="Equipamento" style={{ padding: "14px 20px" }}>{itemObj.name}</td>
                      <td data-label="Saída" style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "12px" }}>{loc.dataSaida}</td>
                      <td data-label="Retorno" style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "12px" }}>{loc.dataRetorno}</td>
                      <td data-label="Período" style={{ padding: "14px 20px", textAlign: "center", fontSize: "12px" }}>{loc.dias} dias</td>
                      <td data-label="Valor Receber" style={{ padding: "14px 20px", textAlign: "right", fontWeight: "700", color: "var(--success-text)" }}>R$ {loc.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td data-label="Contrato" style={{ padding: "14px 20px" }}>
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
                      <td data-label="Ação" style={{ padding: "14px 20px", textAlign: "center" }}>
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
      {/* Tab: Entrada de Insumos */}
      {activeSubTab === "entradas" && (
        <div className="responsive-layout-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          {/* List of entries */}
          <div className="section-box" style={{ height: "auto" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>Histórico de Entrada de Insumos</h4>
            <div className="table-responsive">
              <table className="sheet-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Material / Recurso</th>
                    <th>Quantidade</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {entradasLog.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Nenhuma entrada registrada.</td>
                    </tr>
                  ) : (
                    entradasLog.map((log) => (
                      <tr key={log.id}>
                        <td data-label="Data">{log.date}</td>
                        <td data-label="Tipo">
                          <span className={`badge badge-${log.tipo === "Compra" ? "success" : "muted"}`} style={{ fontSize: "9px" }}>
                            {log.tipo.toUpperCase()}
                          </span>
                        </td>
                        <td data-label="Material / Recurso"><strong>{log.itemNome}</strong></td>
                        <td data-label="Quantidade">{log.qty} unidades</td>
                        <td data-label="Responsável">{log.responsavel}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Entry Form */}
          <div className="section-box" style={{ height: "auto" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>Registrar Nova Entrada</h4>
            <form onSubmit={handleRegisterEntry} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Material / Insumo</label>
                <select 
                  value={inItemId} 
                  onChange={(e) => setInItemId(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Saldo: {i.stock} un)</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Tipo de Entrada</label>
                  <select 
                    value={inTipo} 
                    onChange={(e) => setInTipo(e.target.value as any)}
                    style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}
                  >
                    <option value="compra">Compra</option>
                    <option value="devolucao">Devolução</option>
                    <option value="emprestimo">Empréstimo</option>
                    <option value="aluguel">Aluguel</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Quantidade</label>
                  <input type="number" min="1" value={inQty} onChange={(e) => setInQty(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Operador Responsável</label>
                <input type="text" value={inResp} onChange={(e) => setInResp(e.target.value)} required style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: "12px", padding: "10px" }}>Registrar Entrada Física</button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Correção de Estoque */}
      {activeSubTab === "ajustes" && (
        <div className="responsive-layout-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          {/* List of adjustments */}
          <div className="section-box" style={{ height: "auto" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>Histórico de Ajustes e Correções</h4>
            <div className="table-responsive">
              <table className="sheet-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Material</th>
                    <th>Saldo Ant.</th>
                    <th>Saldo Novo</th>
                    <th>Justificativa</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {ajustesLog.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Nenhuma correção registrada.</td>
                    </tr>
                  ) : (
                    ajustesLog.map((log) => (
                      <tr key={log.id}>
                        <td data-label="Data">{log.date}</td>
                        <td data-label="Material"><strong>{log.itemNome}</strong></td>
                        <td data-label="Saldo Ant.">{log.qtyAnterior} un</td>
                        <td data-label="Saldo Novo"><strong style={{ color: log.qtyNova > log.qtyAnterior ? "var(--success-text)" : "var(--danger-text)" }}>{log.qtyNova} un</strong></td>
                        <td data-label="Justificativa" style={{ fontSize: "11px", color: "var(--text-secondary)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.justificativa}>
                          {log.justificativa}
                        </td>
                        <td data-label="Responsável">{log.responsavel}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Adjustment Form */}
          <div className="section-box" style={{ height: "auto" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>Lançar Correção Física (Inventário)</h4>
            <form onSubmit={handleRegisterAdjustment} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Material / Ferramenta</label>
                <select 
                  value={adjItemId} 
                  onChange={(e) => setAdjItemId(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Estoque atual: {i.stock} un)</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Novo Saldo Físico</label>
                  <input type="number" min="0" value={adjNewQty} onChange={(e) => setAdjNewQty(parseInt(e.target.value) || 0)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Auditor Responsável</label>
                  <input type="text" value={adjResp} onChange={(e) => setAdjResp(e.target.value)} required style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Justificativa do Ajuste</label>
                <textarea 
                  value={adjJustify} 
                  onChange={(e) => setAdjJustify(e.target.value)} 
                  placeholder="Ex: Quebra de ferramenta em obra, erro de digitação de NF..."
                  rows={3} 
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)" }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: "12px", padding: "10px", backgroundColor: "var(--accent-secondary)" }}>
                Confirmar Correção Física
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE & EDIT MATERIAL MODAL */}
      {(isCreateModalOpen || editingItem) && (
        <div className="modal-overlay" onClick={() => { setIsCreateModalOpen(false); setEditingItem(null); }}>
          <div className="modal-content" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? `Editar Material: ${editingItem.name}` : "Cadastrar Novo Material no Estoque"}</h3>
              <button className="modal-close" onClick={() => { setIsCreateModalOpen(false); setEditingItem(null); }}>X</button>
            </div>
            <form onSubmit={handleSaveMaterialSubmit} className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Nome do Material / Item</label>
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="Ex: Cadeira Paris Wood Bordo" />
                </div>
                <div className="field">
                  <label>Código Interno</label>
                  <input type="text" value={formCodigo} onChange={(e) => setFormCodigo(e.target.value)} required />
                </div>
              </div>

              <div className="field">
                <label>Descrição Detalhada / Especificações</label>
                <textarea rows={2} value={formDescricao} onChange={(e) => setFormDescricao(e.target.value)} placeholder="Cor, acabamento, dimensões, observações de uso..." />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Categoria</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value as any)}>
                    <option value="furniture">🛋️ Mobiliário / Cenografia</option>
                    <option value="tool">🛠️ Ferramenta / Equipamento</option>
                  </select>
                </div>

                <div className="field">
                  <label>Unidade de Medida</label>
                  <select value={formUnidade} onChange={(e) => setFormUnidade(e.target.value)}>
                    <option value="un">Unidade (un)</option>
                    <option value="m²">Metro Quadrado (m²)</option>
                    <option value="m">Metro Linear (m)</option>
                    <option value="kg">Quilograma (kg)</option>
                    <option value="jogo">Jogo / Kit</option>
                    <option value="cx">Caixa (cx)</option>
                  </select>
                </div>

                <div className="field">
                  <label>Marca / Fabricante</label>
                  <input type="text" value={formMarca} onChange={(e) => setFormMarca(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Qtd em Estoque</label>
                  <input type="number" min="0" value={formStock} onChange={(e) => setFormStock(parseInt(e.target.value) || 0)} required />
                </div>

                <div className="field">
                  <label>Estoque Mínimo</label>
                  <input type="number" min="0" value={formStockMinimo} onChange={(e) => setFormStockMinimo(parseInt(e.target.value) || 0)} required />
                </div>

                <div className="field">
                  <label>Valor Compra (R$)</label>
                  <input type="number" min="0" step="0.01" value={formValorCompra} onChange={(e) => setFormValorCompra(parseFloat(e.target.value) || 0)} />
                </div>

                <div className="field">
                  <label>Locação Diária (R$)</label>
                  <input type="number" min="0" step="0.01" value={formValorLocacao} onChange={(e) => setFormValorLocacao(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" className="btn-secondary" onClick={() => { setIsCreateModalOpen(false); setEditingItem(null); }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Material</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItemId && (() => {
        const itemToDelete = items.find(i => i.id === deletingItemId);
        return (
          <div className="modal-overlay" onClick={() => setDeletingItemId(null)}>
            <div className="modal-content" style={{ maxWidth: "420px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title" style={{ color: "var(--danger)", marginBottom: "10px" }}>Excluir Material do Estoque?</h3>
              <p className="text-sm text-muted" style={{ marginBottom: "20px" }}>
                Tem certeza que deseja excluir o item <strong>"{itemToDelete?.name}"</strong> ({itemToDelete?.codigo})? Esta ação não poderá ser desfeita.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <button className="btn-secondary" onClick={() => setDeletingItemId(null)}>Cancelar</button>
                <button className="btn-danger" onClick={handleConfirmDelete}>Confirmar Exclusão</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
