import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  FileText, Plus, Trash2, Mail, Eye, Check, X, 
  Send, Printer, FileDown, History, RefreshCw, Loader 
} from "lucide-react";
import type { Orcamento, WarehouseItem, OrcamentoItemDetalhado } from "../types";
import logoImg from "../assets/logo.png";
import { exportElementToPDF } from "../utils/pdfGenerator";
import { ProposalWordEditorModal } from "./ProposalWordEditorModal";
import { ClientProposalPortalModal } from "./ClientProposalPortalModal";

interface OrcamentosProps {
  orcamentos: Orcamento[];
  warehouseItems: WarehouseItem[];
  clientes: { name: string; email: string; cnpj: string }[];
  onAddOrcamento: (orc: Omit<Orcamento, "id" | "codigo" | "dataCriacao" | "revisoes" | "emailEnviado">) => void;
  onUpdateOrcamento: (updated: Orcamento) => void;
  onConvertToOS: (orc: Orcamento) => void;
}

export default function Orcamentos({
  orcamentos,
  warehouseItems,
  clientes,
  onAddOrcamento,
  onUpdateOrcamento,
  onConvertToOS
}: OrcamentosProps) {
  const fmtBrl = (v: number) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Orcamento["status"]>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrc, setSelectedOrc] = useState<Orcamento | null>(orcamentos[0] || null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  // Word Editor Modal States
  const [isWordEditorOpen, setIsWordEditorOpen] = useState(false);
  const [editingWordOrc, setEditingWordOrc] = useState<Orcamento | null>(null);

  // Online Approval Modal States
  const [isOnlineApprovalOpen, setIsOnlineApprovalOpen] = useState(false);
  const [onlineApprovalOrc, setOnlineApprovalOrc] = useState<Orcamento | null>(null);


  // Form states
  const [clienteIndex, setClienteIndex] = useState(0);
  const [validoAte, setValidoAte] = useState("");
  const [status, setStatus] = useState<Orcamento["status"]>("rascunho");
  const [desconto, setDesconto] = useState(0);
  const [impostos, setImpostos] = useState(5); // 5% ISS default
  
  // 3.1 Budget Model Switcher States
  const [tipo, setTipo] = useState<"simplificado" | "detalhado">("detalhado");
  const [nomeOrcamento, setNomeOrcamento] = useState("");

  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!selectedOrc) return;
    setIsPdfLoading(true);
    try {
      const fileName = `Proposta_${selectedOrc.codigo}_${selectedOrc.cliente.replace(/[^a-zA-Z0-9]/g, "_")}`;
      await exportElementToPDF("print-proposal-dossier", fileName);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      window.print();
    } finally {
      setIsPdfLoading(false);
    }
  };

  const [descricaoSimplificada, setDescricaoSimplificada] = useState("");
  const [valorTotalSimplificado, setValorTotalSimplificado] = useState(0);

  // Custom detailed items list
  const [formItensDetalhados, setFormItensDetalhados] = useState<OrcamentoItemDetalhado[]>([]);

  // Temp detailed item form fields
  const [detailNome, setDetailNome] = useState("");
  const [detailCategoria, setDetailCategoria] = useState("Cenografia");
  const [detailQtd, setDetailQtd] = useState(1);
  const [detailUnidade, setDetailUnidade] = useState("un");
  const [detailValorUnit, setDetailValorUnit] = useState(0);
  const [detailDesc, setDetailDesc] = useState(0);
  const [detailObs, setDetailObs] = useState("");

  // Selected items in form
  const [formProducts, setFormProducts] = useState<{ id: string; qty: number }[]>([]);
  const [formServices, setFormServices] = useState<{ name: string; preco: number }[]>([]);
  
  // Quick item fields
  const [selectedProdId, setSelectedProdId] = useState(warehouseItems[0]?.id || "");
  const [prodQty, setProdQty] = useState(1);
  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState(0);

  // Email form state
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const handleAddProduct = () => {
    const prod = warehouseItems.find(p => p.id === selectedProdId);
    if (!prod) return;
    const existing = formProducts.find(p => p.id === selectedProdId);
    if (existing) {
      setFormProducts(formProducts.map(p => p.id === selectedProdId ? { ...p, qty: p.qty + prodQty } : p));
    } else {
      setFormProducts([...formProducts, { id: selectedProdId, qty: prodQty }]);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setFormProducts(formProducts.filter(p => p.id !== id));
  };

  const handleAddService = () => {
    if (!serviceDesc || servicePrice <= 0) return;
    setFormServices([...formServices, { name: serviceDesc, preco: servicePrice }]);
    setServiceDesc("");
    setServicePrice(0);
  };

  const handleRemoveService = (index: number) => {
    setFormServices(formServices.filter((_, i) => i !== index));
  };

  const handleAddDetailItem = () => {
    if (!detailNome || detailQtd <= 0 || detailValorUnit <= 0) return;
    const itemTotal = (detailQtd * detailValorUnit) - detailDesc;
    const newItem: OrcamentoItemDetalhado = {
      id: `det-${Date.now()}`,
      nome: detailNome,
      categoria: detailCategoria,
      quantidade: detailQtd,
      unidade: detailUnidade,
      valorUnitario: detailValorUnit,
      desconto: detailDesc,
      total: itemTotal,
      observacoes: detailObs
    };
    setFormItensDetalhados([...formItensDetalhados, newItem]);
    setDetailNome("");
    setDetailQtd(1);
    setDetailUnidade("un");
    setDetailValorUnit(0);
    setDetailDesc(0);
    setDetailObs("");
  };

  const handleRemoveDetailItem = (id: string) => {
    setFormItensDetalhados(formItensDetalhados.filter(item => item.id !== id));
  };

  // Totals calculations helper
  const calculateTotal = (
    prods: { id: string; qty: number }[], 
    servs: { name: string; preco: number }[], 
    customItens: OrcamentoItemDetalhado[], 
    desc: number, 
    taxPercent: number
  ) => {
    if (tipo === "simplificado") {
      return valorTotalSimplificado;
    }
    const prodSum = prods.reduce((sum, item) => {
      const dbItem = warehouseItems.find(w => w.id === item.id);
      return sum + (dbItem ? dbItem.valorVenda * item.qty : 0);
    }, 0);
    const servSum = servs.reduce((sum, s) => sum + s.preco, 0);
    const customSum = customItens.reduce((sum, item) => sum + item.total, 0);
    const subtotal = prodSum + servSum + customSum;
    const descValue = desc;
    const taxValue = subtotal * (taxPercent / 100);
    return Math.max(0, subtotal - descValue + taxValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = clientes[clienteIndex];
    if (!cli) return;

    const prodsMapped = formProducts.map(p => {
      const dbItem = warehouseItems.find(w => w.id === p.id)!;
      return { id: p.id, name: dbItem.name, qty: p.qty, precoVenda: dbItem.valorVenda };
    });

    const calculatedTotal = calculateTotal(formProducts, formServices, formItensDetalhados, desconto, impostos);

    onAddOrcamento({
      cliente: cli.name,
      emailCliente: cli.email,
      cnpjCliente: cli.cnpj,
      validoAte: validoAte || new Date(Date.now() + 15*24*60*60*1000).toISOString().split("T")[0],
      status,
      produtos: prodsMapped,
      servicos: formServices,
      desconto,
      impostos,
      total: calculatedTotal,
      tipo,
      nomeOrcamento,
      descricaoSimplificada,
      itensDetalhados: formItensDetalhados
    });

    // Reset Form
    setFormProducts([]);
    setFormServices([]);
    setFormItensDetalhados([]);
    setDesconto(0);
    setImpostos(5);
    setTipo("detalhado");
    setNomeOrcamento("");
    setDescricaoSimplificada("");
    setValorTotalSimplificado(0);
    setIsCreateModalOpen(false);
  };

  // Convert to OS Action
  const handleConversion = (orc: Orcamento) => {
    if (orc.status !== "aprovado") {
      const confirm = window.confirm("Este orçamento não está marcado como 'Aprovado'. Deseja aprovar e convertê-lo em Ordem de Serviço mesmo assim?");
      if (!confirm) return;
      const updated = { ...orc, status: "aprovado" as const };
      onUpdateOrcamento(updated);
      onConvertToOS(updated);
    } else {
      onConvertToOS(orc);
    }
  };

  // Status Change inside Detail View
  const handleStatusChange = (orc: Orcamento, newStatus: Orcamento["status"]) => {
    const revision = {
      versao: orc.revisoes.length + 1,
      data: new Date().toISOString().split("T")[0],
      descricao: `Status alterado de "${orc.status}" para "${newStatus}"`
    };
    const updated: Orcamento = {
      ...orc,
      status: newStatus,
      revisoes: [...orc.revisoes, revision]
    };
    onUpdateOrcamento(updated);
    setSelectedOrc(updated);
  };

  // Simulate Email Send
  const triggerSendEmail = () => {
    if (!selectedOrc) return;
    const updated: Orcamento = {
      ...selectedOrc,
      emailEnviado: true,
      revisoes: [...selectedOrc.revisoes, {
        versao: selectedOrc.revisoes.length + 1,
        data: new Date().toISOString().split("T")[0],
        descricao: `E-mail enviado para ${emailTo}`
      }]
    };
    onUpdateOrcamento(updated);
    setSelectedOrc(updated);
    setIsEmailModalOpen(false);
    alert(`E-mail com proposta comercial enviado com sucesso para ${emailTo}!`);
  };

  // Workflow dinâmico e editável de status de propostas
  const [proposalStatuses, setProposalStatuses] = useState<{ id: string; label: string; bg: string; color: string }[]>([
    { id: "rascunho", label: "Rascunho", bg: "#f1f5f9", color: "#64748b" },
    { id: "elaboracao", label: "Em Elaboração", bg: "#e0f2fe", color: "#0369a1" },
    { id: "enviado", label: "Enviado ao Cliente", bg: "#e0e7ff", color: "#3730a3" },
    { id: "negociacao", label: "Em Negociação", bg: "#fef3c7", color: "#92400e" },
    { id: "aguardando_retorno", label: "Aguardando Retorno", bg: "#fef9c3", color: "#854d0e" },
    { id: "revisao", label: "Em Revisão", bg: "#f3e8ff", color: "#6b21a8" },
    { id: "aguardando_aprovacao", label: "Aguardando Aprovação", bg: "#fae8ff", color: "#86198f" },
    { id: "aprovado", label: "Aprovado", bg: "#d1fae5", color: "#065f46" },
    { id: "recusado", label: "Recusado", bg: "#fee2e2", color: "#991b1b" },
    { id: "cancelado", label: "Cancelado", bg: "#e2e8f0", color: "#334155" },
    { id: "perdido", label: "Perdido", bg: "#fecdd3", color: "#9f1239" },
    { id: "ganho", label: "Ganho", bg: "#bbf7d0", color: "#14532d" },
    { id: "arquivado", label: "Arquivado", bg: "#e2e8f0", color: "#475569" }
  ]);

  const [isStatusMgrOpen, setIsStatusMgrOpen] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState("");

  const getStatusCfg = (st: string) => {
    const found = proposalStatuses.find(s => s.id === st || s.label.toLowerCase() === st.toLowerCase());
    if (found) return found;
    return { id: st, label: st.charAt(0).toUpperCase() + st.slice(1), bg: "#e2e8f0", color: "#475569" };
  };

  const handleAddCustomStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusLabel.trim()) return;
    const id = newStatusLabel.trim().toLowerCase().replace(/\s+/g, "_");
    if (proposalStatuses.some(s => s.id === id)) {
      alert("Este status já existe!");
      return;
    }
    setProposalStatuses([...proposalStatuses, { id, label: newStatusLabel.trim(), bg: "#e0f2fe", color: "#0369a1" }]);
    setNewStatusLabel("");
  };

  const handleRemoveCustomStatus = (id: string) => {
    if (proposalStatuses.length <= 1) return;
    setProposalStatuses(proposalStatuses.filter(s => s.id !== id));
  };

  const filteredOrcamentos = orcamentos.filter(orc => {
    const matchesSearch = orc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || orc.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ? orc.status !== "arquivado" : orc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="responsive-layout-grid" style={{ display: "grid", gridTemplateColumns: selectedOrc ? "340px 1fr" : "1fr", gap: "20px", padding: "10px", minHeight: "80vh" }}>

      {/* ── Left: Minimal List ── */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "0" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Propostas</h3>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>{filteredOrcamentos.length} proposta(s)</p>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="btn-secondary btn-sm"
              onClick={() => setIsStatusMgrOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}
              title="Configurar Workflow de Status das Propostas"
            >
              ⚙️ Status
            </button>
            <button
              className="btn-primary btn-sm"
              onClick={() => setIsCreateModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={13} /> Nova Proposta
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: "7px 11px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ padding: "7px 10px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer" }}
          >
            <option value="all">Ativos (Todos)</option>
            {proposalStatuses.map(st => (
              <option key={st.id} value={st.id}>{st.label}</option>
            ))}
          </select>
        </div>

        {/* Card list */}
        {filteredOrcamentos.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 0", fontSize: "13px" }}>
            <FileText size={36} style={{ opacity: 0.25, display: "block", margin: "0 auto 10px" }} />
            Nenhuma proposta encontrada.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {filteredOrcamentos.map((orc) => {
              const cfg = getStatusCfg(orc.status);
              const isSelected = selectedOrc?.id === orc.id;
              return (
                <button
                  key={orc.id}
                  onClick={() => setSelectedOrc(isSelected ? null : orc)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: isSelected ? "var(--accent-glow)" : "var(--bg-card)",
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                    borderLeft: isSelected ? "3px solid var(--accent)" : "3px solid transparent",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                  onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)"; }}
                  onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {orc.nomeOrcamento || orc.codigo}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {orc.cliente} &bull; {orc.codigo}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-text)" }}>
                      {fmtBrl(orc.total)}
                    </span>
                    <span style={{ fontSize: "9px", fontWeight: "600", padding: "2px 8px", borderRadius: "10px", backgroundColor: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: Detail Panel (only when selected) ── */}
      {selectedOrc && (() => {
        const cfg = getStatusCfg(selectedOrc.status);
        return (
          <div className="no-print" style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-md)",
            overflowY: "auto", maxHeight: "calc(100vh - 130px)"
          }}>

            {/* Detail Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>{selectedOrc.codigo}</div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  {selectedOrc.nomeOrcamento || selectedOrc.cliente}
                </h3>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {selectedOrc.cliente} &bull; CNPJ: {selectedOrc.cnpjCliente}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px", backgroundColor: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
                <button
                  onClick={() => setSelectedOrc(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", borderRadius: "6px", display: "flex" }}
                  title="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick info row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "Válido até", value: selectedOrc.validoAte },
                { label: "E-mail enviado", value: selectedOrc.emailEnviado ? "Sim ✓" : "Não" },
                { label: "Tipo", value: selectedOrc.tipo === "simplificado" ? "Fechado" : "Detalhado" },
              ].map((row, i) => (
                <div key={i} style={{ background: "var(--bg-main)", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{row.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{row.value}</div>
                </div>
              ))}
            </div>

            {/* Content */}
            {selectedOrc.tipo === "simplificado" ? (
              <div style={{ background: "var(--accent-glow)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>Proposta de valor fechado</div>
                {selectedOrc.descricaoSimplificada && (
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                    {selectedOrc.descricaoSimplificada}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                  <span style={{ fontSize: "13px" }}>Total Proposto</span>
                  <span style={{ fontSize: "18px", color: "var(--accent)" }}>{fmtBrl(selectedOrc.total)}</span>
                </div>
              </div>
            ) : (
              <>
                {/* Items tables */}
                {selectedOrc.itensDetalhados && selectedOrc.itensDetalhados.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                      Itens da Proposta
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {selectedOrc.itensDetalhados.map((item) => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                          <div>
                            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}>{item.nome}</span>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "8px" }}>[{item.categoria}]</span>
                            {item.observacoes && <div style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>{item.observacoes}</div>}
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>{fmtBrl(item.total)}</div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{item.quantidade} {item.unidade}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOrc.servicos.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                      Serviços
                    </div>
                    {selectedOrc.servicos.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: "12px" }}>
                        <span style={{ color: "var(--text-secondary)" }}>{s.name}</span>
                        <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{fmtBrl(s.preco)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total box */}
                <div style={{ background: "var(--bg-main)", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    <span>Desconto</span><span style={{ color: "#dc2626" }}>- {fmtBrl(selectedOrc.desconto)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                    <span>Impostos ({selectedOrc.impostos}%)</span>
                    <span style={{ color: "#ED6A52" }}>+ {fmtBrl(selectedOrc.total * (selectedOrc.impostos / 100))}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                    <span style={{ fontSize: "13px" }}>Valor Final</span>
                    <span style={{ fontSize: "20px", color: "var(--accent)" }}>{fmtBrl(selectedOrc.total)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Action buttons com Seletor Flexível de Status */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center", background: "var(--bg-main)", padding: "10px", borderRadius: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="text-xs text-muted" style={{ fontWeight: "600" }}>Alterar Status:</span>
                <select
                  value={selectedOrc.status}
                  onChange={(e) => handleStatusChange(selectedOrc, e.target.value as any)}
                  style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "12px", fontWeight: "600" }}
                >
                  {proposalStatuses.map(st => (
                    <option key={st.id} value={st.id}>{st.label}</option>
                  ))}
                </select>
              </div>

              <button
                className="btn-secondary btn-sm"
                onClick={() => { setEmailTo(selectedOrc.emailCliente); setEmailSubject(`Proposta JC Eventos — ${selectedOrc.codigo}`); setEmailBody(`Olá,\n\nSegue a proposta comercial ${selectedOrc.codigo}.\n\nValor: ${fmtBrl(selectedOrc.total)}\n\nAtenciosamente,\nJC Eventos`); setIsEmailModalOpen(true); }}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <Mail size={13} /> Enviar E-mail
              </button>

              <button className="btn-secondary btn-sm" onClick={() => setIsPdfModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Eye size={13} /> Ver PDF
              </button>

              <button 
                className="btn-secondary btn-sm" 
                onClick={() => { setEditingWordOrc(selectedOrc); setIsWordEditorOpen(true); }} 
                style={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#144580", color: "#ffffff" }}
              >
                <FileText size={13} /> Editar no Word (Nativo)
              </button>

              <button 
                className="btn-secondary btn-sm" 
                onClick={() => { setOnlineApprovalOrc(selectedOrc); setIsOnlineApprovalOpen(true); }} 
                style={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#16a34a", color: "#ffffff" }}
              >
                <Send size={13} /> Link de Aprovação Online
              </button>

              {(selectedOrc.status === "aprovado" || selectedOrc.status === "ganho") && (
                <button className="btn-primary btn-sm" onClick={() => handleConversion(selectedOrc)} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <RefreshCw size={13} /> Converter em OS
                </button>
              )}
            </div>

            {/* Revision history */}
            {selectedOrc.revisoes.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <History size={13} /> Histórico
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedOrc.revisoes.map((rev, i) => (
                    <div key={i} style={{ fontSize: "11px", borderLeft: "2px solid var(--accent)", paddingLeft: "10px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                      <span style={{ fontWeight: "600", color: "var(--text-muted)" }}>v{rev.versao} · {rev.data}</span>
                      <div>{rev.descricao}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}


      {/* CREATE BUDGET MODAL */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "650px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Cadastrar Novo Orçamento</h3>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>X</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {/* Type Switcher */}
              <div className="field" style={{ marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Modelo de Orçamento</label>
                <div style={{ display: "flex", gap: "20px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" }}>
                    <input type="radio" name="orc-model-type" checked={tipo === "simplificado"} onChange={() => setTipo("simplificado")} style={{ cursor: "pointer" }} />
                    <span>Simplificado (Lump Sum / Valor Fechado)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" }}>
                    <input type="radio" name="orc-model-type" checked={tipo === "detalhado"} onChange={() => setTipo("detalhado")} style={{ cursor: "pointer" }} />
                    <span>Detalhado (Itens Descriminados)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label>Cliente da JC Eventos</label>
                  <select 
                    value={clienteIndex}
                    onChange={(e) => setClienteIndex(Number(e.target.value))}
                    required
                  >
                    {clientes.map((c, i) => (
                      <option key={i} value={i}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Validade da Proposta</label>
                  <input 
                    type="date" 
                    value={validoAte} 
                    onChange={(e) => setValidoAte(e.target.value)} 
                    required
                  />
                </div>
              </div>

              {/* SIMPLIFICADO FIELDS */}
              {tipo === "simplificado" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px" }}>
                  <h4 style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "var(--accent)" }}>Orçamento Simplificado</h4>
                  <div className="field">
                    <label>Nome do Orçamento / Escopo</label>
                    <input type="text" value={nomeOrcamento} onChange={(e) => setNomeOrcamento(e.target.value)} placeholder="Ex: Stand Premium Cenografia 10x15m" style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "6px" }} required={tipo === "simplificado"} />
                  </div>
                  <div className="field">
                    <label>Descrição / Especificações</label>
                    <textarea value={descricaoSimplificada} onChange={(e) => setDescricaoSimplificada(e.target.value)} placeholder="Descreva os serviços inclusos em lote..." rows={3} style={{ width: "100%", fontFamily: "var(--font)", padding: "6px", border: "1px solid var(--border)", borderRadius: "6px" }} />
                  </div>
                  <div className="field">
                    <label>Valor Total Fechado (R$)</label>
                    <input type="number" value={valorTotalSimplificado} onChange={(e) => setValorTotalSimplificado(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "6px" }} required={tipo === "simplificado"} min={0} />
                  </div>
                </div>
              )}

              {/* DETALHADO FIELDS */}
              {tipo === "detalhado" && (
                <>
                  {/* Products Section */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", marginTop: "12px" }}>
                    <h4 className="text-xs font-semibold" style={{ marginBottom: "8px" }}>Adicionar Produtos do Almoxarifado (Opcional)</h4>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "10px" }}>
                      <div style={{ flexGrow: 1 }}>
                        <label className="text-xs text-muted">Produto no Estoque</label>
                        <select 
                          value={selectedProdId} 
                          onChange={(e) => setSelectedProdId(e.target.value)}
                          style={{ width: "100%", padding: "6px" }}
                        >
                          {warehouseItems.map(item => (
                            <option key={item.id} value={item.id}>{item.name} - R$ {item.valorVenda} (Dispo: {item.stock})</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: "80px" }}>
                        <label className="text-xs text-muted">Qtd</label>
                        <input 
                          type="number" 
                          min={1} 
                          value={prodQty} 
                          onChange={(e) => setProdQty(Number(e.target.value))} 
                          style={{ width: "100%", padding: "6px" }}
                        />
                      </div>
                      <button type="button" className="btn-secondary" onClick={handleAddProduct} style={{ padding: "8px" }}>
                        Adicionar
                      </button>
                    </div>

                    {/* Selected Products List */}
                    <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                      {formProducts.map((p) => {
                        const item = warehouseItems.find(w => w.id === p.id);
                        return (
                          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", borderBottom: "1px solid var(--border)", padding: "4px 0" }}>
                            <span>{item?.name} x {p.qty}</span>
                            <div>
                              <span style={{ marginRight: "10px" }}>R$ {((item?.valorVenda || 0) * p.qty).toFixed(2)}</span>
                              <button type="button" onClick={() => handleRemoveProduct(p.id)} style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Services Section */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", marginTop: "12px" }}>
                    <h4 className="text-xs font-semibold" style={{ marginBottom: "8px" }}>Adicionar Serviços/Mão de Obra</h4>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "10px" }}>
                      <div style={{ flexGrow: 1 }}>
                        <label className="text-xs text-muted">Descrição do Serviço</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Montagem, Pintura, Vidraçaria..." 
                          value={serviceDesc}
                          onChange={(e) => setServiceDesc(e.target.value)}
                          style={{ width: "100%", padding: "6px" }}
                        />
                      </div>
                      <div style={{ width: "110px" }}>
                        <label className="text-xs text-muted">Preço (R$)</label>
                        <input 
                          type="number" 
                          min={0}
                          value={servicePrice} 
                          onChange={(e) => setServicePrice(Number(e.target.value))} 
                          style={{ width: "100%", padding: "6px" }}
                        />
                      </div>
                      <button type="button" className="btn-secondary" onClick={handleAddService} style={{ padding: "8px" }}>
                        Adicionar
                      </button>
                    </div>

                    {/* Selected Services List */}
                    <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                      {formServices.map((s, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", borderBottom: "1px solid var(--border)", padding: "4px 0" }}>
                          <span>{s.name}</span>
                          <div>
                            <span style={{ marginRight: "10px" }}>R$ {s.preco.toFixed(2)}</span>
                            <button type="button" onClick={() => handleRemoveService(idx)} style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Detailed Items List (No limits) */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", marginTop: "12px" }}>
                    <h4 className="text-xs font-semibold" style={{ marginBottom: "8px" }}>Composição Livre de Itens Detalhados</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                      <div>
                        <label className="text-xs text-muted">Nome do Item</label>
                        <input type="text" placeholder="Ex: Painel MDF Revestido" value={detailNome} onChange={(e) => setDetailNome(e.target.value)} style={{ width: "100%", padding: "4px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Categoria Comercial</label>
                        <select value={detailCategoria} onChange={(e) => setDetailCategoria(e.target.value)} style={{ width: "100%", padding: "4px", border: "1px solid var(--border)", borderRadius: "4px" }}>
                          <option value="Cenografia">Cenografia</option>
                          <option value="Estrutura">Estrutura</option>
                          <option value="Mobiliário">Mobiliário</option>
                          <option value="Iluminação">Iluminação</option>
                          <option value="Comunicação Visual">Comunicação Visual</option>
                          <option value="Elétrica">Elétrica</option>
                          <option value="Transporte">Transporte</option>
                          <option value="Hospedagem">Hospedagem</option>
                          <option value="Mão de obra">Mão de obra</option>
                          <option value="Serviços terceirizados">Serviços terceirizados</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                      <div>
                        <label className="text-xs text-muted">Qtd</label>
                        <input type="number" min={1} value={detailQtd} onChange={(e) => setDetailQtd(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "4px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Unidade</label>
                        <input type="text" placeholder="un, m², kg" value={detailUnidade} onChange={(e) => setDetailUnidade(e.target.value)} style={{ width: "100%", padding: "4px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Val Unit (R$)</label>
                        <input type="number" min={0} value={detailValorUnit} onChange={(e) => setDetailValorUnit(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "4px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Desconto (R$)</label>
                        <input type="number" min={0} value={detailDesc} onChange={(e) => setDetailDesc(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "4px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
                      <div style={{ flexGrow: 1 }}>
                        <label className="text-xs text-muted">Observações</label>
                        <input type="text" placeholder="Ex: Acabamento em lona preta" value={detailObs} onChange={(e) => setDetailObs(e.target.value)} style={{ width: "100%", padding: "4px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                      </div>
                      <button type="button" className="btn-secondary" onClick={handleAddDetailItem} style={{ padding: "6px 12px" }}>Adicionar</button>
                    </div>

                    {/* Selected Custom Items list */}
                    <div style={{ maxHeight: "100px", overflowY: "auto", marginTop: "10px" }}>
                      {formItensDetalhados.map((item) => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", borderBottom: "1px solid var(--border)", padding: "4px 0" }}>
                          <span><strong>[{item.categoria}]</strong> {item.nome} ({item.quantidade} {item.unidade})</span>
                          <div>
                            <span style={{ marginRight: "10px" }}>R$ {item.total.toFixed(2)}</span>
                            <button type="button" onClick={() => handleRemoveDetailItem(item.id)} style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Discounts / Taxes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                <div className="field">
                  <label>Desconto à Vista (R$)</label>
                  <input 
                    type="number" 
                    min={0} 
                    value={desconto} 
                    onChange={(e) => setDesconto(Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Acréscimo de Impostos (%)</label>
                  <input 
                    type="number" 
                    min={0} 
                    value={impostos} 
                    onChange={(e) => setImpostos(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Total Calculation Display */}
              <div style={{ borderTop: "1px solid var(--border)", marginTop: "16px", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "16px" }}>Valor Total Estimado:</strong>
                <strong style={{ fontSize: "18px", color: "var(--accent)" }}>
                  R$ {calculateTotal(formProducts, formServices, formItensDetalhados, desconto, impostos).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Registrar Orçamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {isPdfModalOpen && selectedOrc && createPortal(
        <div className="modal-overlay" onClick={() => setIsPdfModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "800px", padding: "40px", background: "white", color: "#333", border: "1px solid #aaa", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            {/* Action Bar for Printing / Simulating PDF */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "10px" }} className="no-print">
              <button type="button" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => window.print()}>
                <Printer size={14} /> Imprimir Proposta
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "140px", justifyContent: "center" }}
                onClick={handleDownloadPDF}
                disabled={isPdfLoading}
              >
                {isPdfLoading
                  ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> Gerando PDF...</>
                  : <><FileDown size={14} /> Download PDF</>
                }
              </button>
              <button type="button" className="btn-secondary" onClick={() => setIsPdfModalOpen(false)}>Fechar</button>
            </div>

            <div id="print-proposal-dossier" className="printable-document">
              {/* Document Header */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #144580", paddingBottom: "20px", marginBottom: "20px" }}>
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
                <h3 style={{ margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>PROPOSTA COMERCIAL</h3>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#666" }}>CÓDIGO: {selectedOrc.codigo}</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>Emissão: {selectedOrc.dataCriacao || "18/07/2026"}</p>
              </div>
            </div>

            {/* Client & Company details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px", fontSize: "13px" }}>
              <div style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "4px" }}>
                <strong style={{ display: "block", marginBottom: "6px", textTransform: "uppercase", fontSize: "11px", color: "#777" }}>CONTRATANTE / CLIENTE</strong>
                <strong>{selectedOrc.cliente}</strong>
                <p style={{ margin: "4px 0 0 0" }}>CNPJ: {selectedOrc.cnpjCliente}</p>
                <p style={{ margin: "2px 0 0 0" }}>E-mail: {selectedOrc.emailCliente}</p>
              </div>
              <div style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "4px" }}>
                <strong style={{ display: "block", marginBottom: "6px", textTransform: "uppercase", fontSize: "11px", color: "#777" }}>CONDIÇÕES DE PAGAMENTO</strong>
                <p style={{ margin: 0 }}><strong>Validade:</strong> {selectedOrc.validoAte}</p>
                <p style={{ margin: "2px 0 0 0" }}><strong>Forma de Faturamento:</strong> Sinal de 50% + 50% na aprovação da montagem.</p>
                <p style={{ margin: "2px 0 0 0" }}><strong>Status Comercial:</strong> {selectedOrc.status.toUpperCase()}</p>
              </div>
            </div>

            {/* Table of Items */}
            {selectedOrc.tipo === "simplificado" ? (
              <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", backgroundColor: "#fafafa", marginBottom: "25px", fontSize: "14px" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "var(--accent)", fontSize: "15px", fontWeight: "bold" }}>{selectedOrc.nomeOrcamento || "Stand Cenográfico Premium"}</h4>
                {selectedOrc.descricaoSimplificada && (
                  <p style={{ margin: "0 0 15px 0", fontStyle: "italic", color: "#555", fontSize: "13px", whiteSpace: "pre-line" }}>
                    {selectedOrc.descricaoSimplificada}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "10px", fontWeight: "bold" }}>
                  <span>Valor Fechado Proposto:</span>
                  <span>R$ {selectedOrc.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                    <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>Descrição do Item / Produto / Insumo</th>
                    <th style={{ textAlign: "center", padding: "8px", border: "1px solid #ddd", width: "80px" }}>Qtd</th>
                    <th style={{ textAlign: "right", padding: "8px", border: "1px solid #ddd", width: "120px" }}>Valor Unitário</th>
                    <th style={{ textAlign: "right", padding: "8px", border: "1px solid #ddd", width: "120px" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrc.produtos.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{p.name} (Material Almoxarifado)</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{p.qty}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>R$ {p.precoVenda.toFixed(2)}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>R$ {(p.qty * p.precoVenda).toFixed(2)}</td>
                    </tr>
                  ))}
                  {selectedOrc.servicos.map((s, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{s.name} (Serviço de Montagem/Cenografia)</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>1</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>R$ {s.preco.toFixed(2)}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>R$ {s.preco.toFixed(2)}</td>
                    </tr>
                  ))}
                  {selectedOrc.itensDetalhados && selectedOrc.itensDetalhados.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <strong>[{item.categoria.toUpperCase()}]</strong> {item.nome}
                        {item.observacoes && <span style={{ display: "block", fontSize: "11px", color: "#666", fontStyle: "italic" }}>Obs: {item.observacoes}</span>}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.quantidade} {item.unidade}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>R$ {item.valorUnitario.toFixed(2)}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>R$ {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Calculations Summary in PDF */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
              <div style={{ width: "300px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Subtotal:</span>
                  <span>R$ {(selectedOrc.total - (selectedOrc.total * (selectedOrc.impostos / 100)) + selectedOrc.desconto).toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--danger)" }}>
                  <span>Desconto:</span>
                  <span>- R$ {selectedOrc.desconto.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Impostos ({selectedOrc.impostos}%):</span>
                  <span>+ R$ {(selectedOrc.total * (selectedOrc.impostos / 100)).toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "2px solid #333", fontWeight: "bold", fontSize: "15px" }}>
                  <span>Total Proposto:</span>
                  <span>R$ {selectedOrc.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", marginTop: "60px", textAlign: "center", fontSize: "12px" }}>
              <div>
                <div style={{ borderBottom: "1px solid #999", height: "40px" }}></div>
                <p style={{ margin: "8px 0 0 0" }}><strong>JC Eventos &amp; Montagens</strong></p>
                <p style={{ margin: 0, color: "#777" }}>Representante Comercial</p>
              </div>
              <div>
                <div style={{ borderBottom: "1px solid #999", height: "40px" }}></div>
                <p style={{ margin: "8px 0 0 0" }}><strong>{selectedOrc.cliente}</strong></p>
                <p style={{ margin: 0, color: "#777" }}>Assinatura de Aceite e Contratação</p>
              </div>
            </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EMAIL SEND DIALOG */}
      {isEmailModalOpen && selectedOrc && (
        <div className="modal-overlay" onClick={() => setIsEmailModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "550px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Send size={18} style={{ color: "var(--accent)" }} /> Enviar Proposta por E-mail
              </h3>
              <button className="modal-close" onClick={() => setIsEmailModalOpen(false)}>X</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>E-mail do Destinatário</label>
                <input 
                  type="email" 
                  value={emailTo} 
                  onChange={(e) => setEmailTo(e.target.value)} 
                  required
                />
              </div>
              <div className="field">
                <label>Assunto do E-mail</label>
                <input 
                  type="text" 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)} 
                  required
                />
              </div>
              <div className="field">
                <label>Mensagem</label>
                <textarea 
                  rows={6}
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)} 
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", fontFamily: "var(--font)" }}
                  required
                />
              </div>

              {/* Simulated attachment bar */}
              <div style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-main)", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", marginBottom: "20px" }}>
                <FileText size={16} />
                <span>Anexo Automático: <strong>proposta_{selectedOrc.codigo}.pdf</strong></span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsEmailModalOpen(false)}>Cancelar</button>
                <button type="button" className="btn-primary" onClick={triggerSendEmail}>Enviar Proposta</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATUS MANAGER MODAL */}
      {isStatusMgrOpen && (
        <div className="modal-overlay" onClick={() => setIsStatusMgrOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Configurar Workflow de Status</h3>
              <button className="modal-close" onClick={() => setIsStatusMgrOpen(false)}>X</button>
            </div>
            <div className="modal-body">
              <p className="text-xs text-muted" style={{ marginBottom: "16px" }}>
                Crie, edite ou renomeie as etapas de negociação comercial de propostas da JC Eventos.
              </p>

              <form onSubmit={handleAddCustomStatus} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <input 
                  type="text" 
                  placeholder="Nome da nova etapa (ex: Aguardando Sinal)..." 
                  value={newStatusLabel} 
                  onChange={(e) => setNewStatusLabel(e.target.value)} 
                  style={{ flexGrow: 1, padding: "8px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                  required
                />
                <button type="submit" className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                  + Criar
                </button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
                {proposalStatuses.map((st) => (
                  <div key={st.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--bg-card)" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>
                      {st.label}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCustomStatus(st.id)}
                      style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                      title="Excluir status"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button type="button" className="btn-primary" onClick={() => setIsStatusMgrOpen(false)}>Salvar e Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Nativo de Propostas Estilo Word */}
      <ProposalWordEditorModal
        isOpen={isWordEditorOpen}
        onClose={() => {
          setIsWordEditorOpen(false);
          setEditingWordOrc(null);
        }}
        orcamento={editingWordOrc}
        onSaveOrcamento={(updated) => {
          onUpdateOrcamento(updated);
        }}
      />

      {/* Portal de Aprovação Online de Propostas via Link Público */}
      <ClientProposalPortalModal
        isOpen={isOnlineApprovalOpen}
        onClose={() => {
          setIsOnlineApprovalOpen(false);
          setOnlineApprovalOrc(null);
        }}
        orcamento={onlineApprovalOrc}
        onApproveProposal={(orcId, auditLog) => {
          if (!onlineApprovalOrc) return;
          const updated: Orcamento = {
            ...onlineApprovalOrc,
            status: "ganho",
            revisoes: [
              ...(onlineApprovalOrc.revisoes || []),
              { 
                versao: (onlineApprovalOrc.revisoes?.length || 0) + 1, 
                data: new Date().toISOString().split("T")[0], 
                descricao: `Aprovado online pelo cliente (${auditLog.signatario} - IP: ${auditLog.ip})` 
              }
            ]
          };
          onUpdateOrcamento(updated);
          setSelectedOrc(updated);
        }}
      />
    </div>
  );
}
