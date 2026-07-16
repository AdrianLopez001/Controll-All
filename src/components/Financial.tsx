import React, { useState } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, Plus, Tag, 
  X, FileText, Upload, Trash2, Link
} from "lucide-react";
import type { InvoiceLog, Project } from "../types";

interface FinancialProps {
  invoices: InvoiceLog[];
  events: Project[];
  onAddInvoice: (invoice: Omit<InvoiceLog, "id" | "date">) => void;
  onUpdateInvoice: (updated: InvoiceLog) => void;
}

export default function Financial({ 
  invoices, events, onAddInvoice, onUpdateInvoice 
}: FinancialProps) {
  const [activeSubTab, setActiveSubTab] = useState<"fluxo" | "centro_custo" | "caixinha">("fluxo");
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceLog | null>(null);
  
  // Invoice form states (Creation)
  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [value, setValue] = useState(0);
  const [description, setDescription] = useState("");
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa");
  const [categoria, setCategoria] = useState("Madeira");
  const [formaPagamento, setFormaPagamento] = useState<InvoiceLog["formaPagamento"]>("Pix");
  const [status, setStatus] = useState<InvoiceLog["status"]>("pago");
  const [eventoId, setEventoId] = useState("");

  // Edit Invoice states
  const [editVendor, setEditVendor] = useState("");
  const [editInvoiceNumber, setEditInvoiceNumber] = useState("");
  const [editValue, setEditValue] = useState(0);
  const [editCategoria, setEditCategoria] = useState("");
  const [editFormaPagamento, setEditFormaPagamento] = useState<InvoiceLog["formaPagamento"]>("Pix");
  const [editStatus, setEditStatus] = useState<InvoiceLog["status"]>("pago");
  const [editEventoId, setEditEventoId] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Caixinha logs
  const [caixinhaLogs, setCaixinhaLogs] = useState([
    { id: "c-1", colaborador: "Claudio Barbosa Silva", tipo: "vale", valor: 150.00, desc: "Almoço equipe montagem Feicon", date: "2026-07-14", status: "prestado" },
    { id: "c-2", colaborador: "José Alves de Oliveira", tipo: "adiantamento", valor: 500.00, desc: "Combustível e pedágio viagem GRU", date: "2026-07-15", status: "pendente" }
  ]);
  const [colaboradorNome, setColaboradorNome] = useState("");
  const [caixinhaTipo, setCaixinhaTipo] = useState("vale");
  const [caixinhaValor, setCaixinhaValor] = useState(0);
  const [caixinhaDesc, setCaixinhaDesc] = useState("");

  const handleAddCaixinha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorNome || caixinhaValor <= 0) return;
    const newLog = {
      id: `c-${Date.now()}`,
      colaborador: colaboradorNome,
      tipo: caixinhaTipo,
      valor: caixinhaValor,
      desc: caixinhaDesc,
      date: new Date().toISOString().split("T")[0],
      status: "pendente"
    };
    setCaixinhaLogs([newLog, ...caixinhaLogs]);
    setColaboradorNome("");
    setCaixinhaValor(0);
    setCaixinhaDesc("");
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || value <= 0) return;
    onAddInvoice({
      vendor,
      invoiceNumber: invoiceNumber || `REC-${Date.now().toString().substring(8)}`,
      value,
      description,
      tipo,
      categoria,
      formaPagamento,
      status,
      eventoId: eventoId || undefined
    });
    setVendor("");
    setInvoiceNumber("");
    setValue(0);
    setDescription("");
    setEventoId("");
    setIsInvoiceModalOpen(false);
  };

  const handleOpenEditModal = (inv: InvoiceLog) => {
    setSelectedInvoice(inv);
    setEditVendor(inv.vendor);
    setEditInvoiceNumber(inv.invoiceNumber);
    setEditValue(inv.value);
    setEditCategoria(inv.categoria);
    setEditFormaPagamento(inv.formaPagamento);
    setEditStatus(inv.status);
    setEditEventoId(inv.eventoId || "");
    setEditDescription(inv.description);
  };

  const handleSaveChanges = () => {
    if (!selectedInvoice) return;
    const updated: InvoiceLog = {
      ...selectedInvoice,
      vendor: editVendor,
      invoiceNumber: editInvoiceNumber,
      value: editValue,
      categoria: editCategoria,
      formaPagamento: editFormaPagamento,
      status: editStatus,
      eventoId: editEventoId || undefined,
      description: editDescription
    };
    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
    alert("Transação financeira atualizada com sucesso!");
  };

  const handleUploadBoleto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedInvoice || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const updated: InvoiceLog = {
      ...selectedInvoice,
      pdfBoleto: file.name
    };
    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
  };

  const handleUploadNFe = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedInvoice || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const updated: InvoiceLog = {
      ...selectedInvoice,
      pdfNFe: file.name
    };
    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
  };

  const handleUploadAnexo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedInvoice || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const newAnexo = {
      id: `anx-${Date.now()}`,
      name: file.name,
      date: new Date().toISOString().split("T")[0]
    };
    const updated: InvoiceLog = {
      ...selectedInvoice,
      anexos: [...(selectedInvoice.anexos || []), newAnexo]
    };
    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
  };

  const handleDeleteAnexo = (anxId: string) => {
    if (!selectedInvoice) return;
    const updated: InvoiceLog = {
      ...selectedInvoice,
      anexos: (selectedInvoice.anexos || []).filter(a => a.id !== anxId)
    };
    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
  };

  const handleRemoveBoleto = () => {
    if (!selectedInvoice) return;
    const updated = { ...selectedInvoice };
    delete updated.pdfBoleto;
    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
  };

  const handleRemoveNFe = () => {
    if (!selectedInvoice) return;
    const updated = { ...selectedInvoice };
    delete updated.pdfNFe;
    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
  };

  // Calculations for Fluxo de Caixa
  const totalReceitas = invoices
    .filter(i => i.tipo === "receita")
    .reduce((acc, curr) => acc + curr.value, 0) + 180000.00; // adding client deposits seed
  
  const totalDespesas = invoices
    .filter(i => i.tipo === "despesa")
    .reduce((acc, curr) => acc + curr.value, 0);

  const saldoTotal = totalReceitas - totalDespesas;

  // Selected event cost center details
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventInvoices = invoices.filter(i => i.eventoId === selectedEventId);
  
  // Calculate dynamic costs for selected event from invoices
  const dynamicCosts = {
    madeiraMdf: selectedEvent?.centroCusto?.madeiraMdf || 0,
    vidrosVidraçaria: selectedEvent?.centroCusto?.vidrosVidraçaria || 0,
    iluminacaoEletrica: selectedEvent?.centroCusto?.iluminacaoEletrica || 0,
    mobiliarioAlugado: selectedEvent?.centroCusto?.mobiliarioAlugado || 0,
    fretes: selectedEvent?.centroCusto?.fretes || 0,
    combustivelPedagios: selectedEvent?.centroCusto?.combustivelPedagios || 0,
    hospedagemPassagens: selectedEvent?.centroCusto?.hospedagemPassagens || 0,
    equipePropria: selectedEvent?.centroCusto?.equipePropria || 0,
    terceirizados: selectedEvent?.centroCusto?.terceirizados || 0,
    taxasOrganizador: selectedEvent?.centroCusto?.taxasOrganizador || 0
  };

  // Supplement category costs from linked invoices
  eventInvoices.forEach(inv => {
    if (inv.tipo === "despesa") {
      const cat = inv.categoria.toLowerCase();
      if (cat.includes("madeira") || cat.includes("mdf")) dynamicCosts.madeiraMdf += inv.value;
      else if (cat.includes("vidro")) dynamicCosts.vidrosVidraçaria += inv.value;
      else if (cat.includes("ilumina") || cat.includes("eletri")) dynamicCosts.iluminacaoEletrica += inv.value;
      else if (cat.includes("mobil")) dynamicCosts.mobiliarioAlugado += inv.value;
      else if (cat.includes("frete")) dynamicCosts.fretes += inv.value;
      else if (cat.includes("combust") || cat.includes("pedag")) dynamicCosts.combustivelPedagios += inv.value;
      else if (cat.includes("hosped") || cat.includes("passag") || cat.includes("voo")) dynamicCosts.hospedagemPassagens += inv.value;
      else if (cat.includes("equipe") || cat.includes("claudio") || cat.includes("jose")) dynamicCosts.equipePropria += inv.value;
      else if (cat.includes("terceir")) dynamicCosts.terceirizados += inv.value;
      else if (cat.includes("taxa") || cat.includes("organiz")) dynamicCosts.taxasOrganizador += inv.value;
    }
  });

  const totalCustoEvento = Object.values(dynamicCosts).reduce((acc, curr) => acc + curr, 0);
  const receitaContratada = selectedEvent?.valorContratado || 0;
  const lucroRealizado = receitaContratada - totalCustoEvento;
  const margemLucro = receitaContratada > 0 ? (lucroRealizado / receitaContratada) * 100 : 0;

  // Most profitable events ranking
  const getEventProfitSummary = (evt: Project) => {
    const evtInvs = invoices.filter(i => i.eventoId === evt.id);
    let totalC = Object.values(evt.centroCusto || {}).reduce((a, b) => a + b, 0);
    evtInvs.forEach(inv => {
      if (inv.tipo === "despesa") totalC += inv.value;
    });
    const rev = evt.valorContratado || 0;
    const profit = rev - totalC;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;
    return { name: evt.name, client: evt.client, profit, margin, revenue: rev, totalCost: totalC };
  };

  const rankedEvents = [...events]
    .map(getEventProfitSummary)
    .sort((a, b) => b.profit - a.profit);

  return (
    <div className="financial-container" style={{ padding: "10px" }}>
      {/* Sub tabs header */}
      <div className="sub-header-tabs" style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", marginBottom: "24px" }}>
        <button 
          className={`tab-btn-link ${activeSubTab === "fluxo" ? "active" : ""}`}
          onClick={() => setActiveSubTab("fluxo")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "fluxo" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "fluxo" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "fluxo" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Fluxo de Caixa &amp; Lançamentos
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "centro_custo" ? "active" : ""}`}
          onClick={() => setActiveSubTab("centro_custo")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "centro_custo" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "centro_custo" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "centro_custo" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Centro de Custos por Evento
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "caixinha" ? "active" : ""}`}
          onClick={() => setActiveSubTab("caixinha")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "caixinha" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "caixinha" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "caixinha" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Caixinha &amp; Reembolsos Obra
        </button>
      </div>

      {/* Fluxo de Caixa Tab */}
      {activeSubTab === "fluxo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Receitas Acumuladas</span>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--accent)", marginTop: "4px" }}>R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent-glow)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={20} />
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Despesas Acumuladas</span>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--accent-secondary)", marginTop: "4px" }}>R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--warning-glow)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingDown size={20} />
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Saldo Líquido</span>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: saldoTotal >= 0 ? "var(--success-text)" : "var(--danger)", marginTop: "4px" }}>R$ {saldoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: saldoTotal >= 0 ? "var(--success-glow)" : "var(--danger-glow)", color: saldoTotal >= 0 ? "var(--success-text)" : "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wallet size={20} />
              </div>
            </div>
          </div>

          {/* Title and register trigger */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>Transações Fiscais e Contas</h4>
            <button className="btn-primary" onClick={() => setIsInvoiceModalOpen(true)}>
              <Plus size={16} /> Lançar Movimentação
            </button>
          </div>

          {/* Transactions listing table */}
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Tipo</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Origem/Fornecedor</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Categoria</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Data</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Forma Pgto</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Anexos</th>
                  <th style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px", textAlign: "right" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => handleOpenEditModal(inv)}
                    style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "var(--transition)" }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <span 
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: inv.tipo === "receita" ? "var(--success-glow)" : "var(--danger-glow)",
                          color: inv.tipo === "receita" ? "var(--success-text)" : "var(--danger)"
                        }}
                      >
                        {inv.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: "600" }}>{inv.vendor}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)" }}>
                        <Tag size={12} /> {inv.categoria || "Material"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "12px" }}>{inv.date}</td>
                    <td style={{ padding: "14px 20px", fontSize: "12px" }}>{inv.formaPagamento || "Pix"}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                        {inv.pdfBoleto && <span title={`Boleto: ${inv.pdfBoleto}`} style={{ cursor: "pointer", color: "var(--accent-secondary)", fontWeight: "600", fontSize: "11px" }}>📄 Bol</span>}
                        {inv.pdfNFe && <span title={`NFe: ${inv.pdfNFe}`} style={{ cursor: "pointer", color: "var(--success-text)", fontWeight: "600", fontSize: "11px" }}>🧾 NFe</span>}
                        {!inv.pdfBoleto && !inv.pdfNFe && <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Nenhum</span>}
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: "700", textAlign: "right", color: inv.tipo === "receita" ? "var(--accent)" : "var(--text-primary)" }}>
                      {inv.tipo === "receita" ? "+" : "-"} R$ {inv.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Centro de Custo Tab */}
      {activeSubTab === "centro_custo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top selection selector */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", padding: "16px 24px", borderRadius: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "4px" }}>Selecione o Estande/Evento:</label>
              <select 
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", minWidth: "300px" }}
              >
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name} ({evt.client})</option>
                ))}
              </select>
            </div>
            
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Receita Estimada de Contrato:</span>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--accent)" }}>R$ {receitaContratada.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          {/* Breakdown cards & indicators */}
          {selectedEvent ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
              {/* Detailed Category Table */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <h5 style={{ fontSize: "14px", fontWeight: "600", borderBottom: "1px solid var(--border)", paddingBottom: "10px", color: "var(--text-primary)" }}>Detalhamento por Linha de Despesa</h5>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Madeira &amp; MDF</span>
                    <strong>R$ {dynamicCosts.madeiraMdf.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Vidros &amp; Vidraçaria</span>
                    <strong>R$ {dynamicCosts.vidrosVidraçaria.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Iluminação &amp; Elétrica</span>
                    <strong>R$ {dynamicCosts.iluminacaoEletrica.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Mobiliário Alugado</span>
                    <strong>R$ {dynamicCosts.mobiliarioAlugado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Fretes &amp; Transportes</span>
                    <strong>R$ {dynamicCosts.fretes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Combustível &amp; Pedágios</span>
                    <strong>R$ {dynamicCosts.combustivelPedagios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Hospedagem &amp; Passagens</span>
                    <strong>R$ {dynamicCosts.hospedagemPassagens.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Mão de Obra Própria</span>
                    <strong>R$ {dynamicCosts.equipePropria.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Diárias de Terceirizados</span>
                    <strong>R$ {dynamicCosts.terceirizados.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>Taxas do Organizador</span>
                    <strong>R$ {dynamicCosts.taxasOrganizador.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "15px", paddingTop: "12px", borderTop: "2px solid var(--border)", color: "var(--text-primary)" }}>
                  <span>Custo Total Realizado:</span>
                  <span>R$ {totalCustoEvento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Profitability gauges and ranking list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Margem de Lucro Bruto</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <h3 style={{ fontSize: "28px", fontWeight: "800", color: lucroRealizado >= 0 ? "var(--success-text)" : "var(--danger)" }}>
                      {margemLucro.toFixed(1)}%
                    </h3>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-muted)" }}>
                      (R$ {lucroRealizado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                    </span>
                  </div>
                  
                  {/* Progress bar visual */}
                  <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden", marginTop: "8px" }}>
                    <div 
                      style={{ 
                        height: "100%", 
                        width: `${Math.max(0, Math.min(100, margemLucro))}%`, 
                        background: margemLucro >= 30 ? "var(--success-text)" : margemLucro >= 10 ? "var(--accent-secondary)" : "var(--danger)" 
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                    * Indicador ideal de margem de montagem de stands é acima de 25%.
                  </span>
                </div>

                {/* Profitability Ranking Table */}
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
                  <h5 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>Ranking de Lucratividade</h5>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {rankedEvents.map((item, index) => (
                      <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: index !== rankedEvents.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <span style={{ fontWeight: "700", color: "var(--text-muted)", fontSize: "13px" }}>#{index + 1}</span>
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Custo: R$ {item.totalCost.toLocaleString("pt-BR")}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "700", color: item.profit >= 0 ? "var(--success-text)" : "var(--danger)" }}>
                            R$ {item.profit.toLocaleString("pt-BR")}
                          </span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{item.margin.toFixed(0)}% margem</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted" style={{ textAlign: "center", padding: "30px" }}>Carregando dados dos projetos...</p>
          )}
        </div>
      )}

      {/* Caixinha & Reembolsos Tab */}
      {activeSubTab === "caixinha" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
          {/* Left Form launch */}
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "var(--shadow-sm)", height: "fit-content" }}>
            <h5 style={{ fontSize: "14px", fontWeight: "600", color: "var(--accent)", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>Adiantamento / Vale Obra</h5>
            
            <form onSubmit={handleAddCaixinha} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Colaborador</label>
                <input 
                  type="text" 
                  value={colaboradorNome} 
                  onChange={(e) => setColaboradorNome(e.target.value)} 
                  placeholder="Nome do profissional" 
                  required
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Tipo</label>
                  <select 
                    value={caixinhaTipo} 
                    onChange={(e) => setCaixinhaTipo(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px", color: "var(--text-primary)" }}
                  >
                    <option value="vale">Vale Alimentação</option>
                    <option value="adiantamento">Adiantamento</option>
                    <option value="reembolso">Reembolso</option>
                    <option value="combustivel">Combustível</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Valor (R$)</label>
                  <input 
                    type="number" 
                    value={caixinhaValor} 
                    onChange={(e) => setCaixinhaValor(parseFloat(e.target.value) || 0)} 
                    required
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Descrição / Finalidade</label>
                <textarea 
                  value={caixinhaDesc} 
                  onChange={(e) => setCaixinhaDesc(e.target.value)} 
                  placeholder="Ex: Almoço da equipe de montagem..."
                  rows={3} 
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)", color: "var(--text-primary)" }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "8px" }}>Entregar Dinheiro (Registrar)</button>
            </form>
          </div>

          {/* Right ledger lists */}
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
            <h5 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Livro Diário de Despesas de Campo</h5>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {caixinhaLogs.map(log => (
                <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg-card-hover)" }}>
                  <div>
                    <strong style={{ display: "block", fontSize: "13px", color: "var(--text-primary)" }}>{log.colaborador}</strong>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{log.desc} | {log.date}</span>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>R$ {log.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <span style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>{log.tipo}</span>
                    </div>
                    
                    <span 
                      style={{
                        fontSize: "9px",
                        fontWeight: "700",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: log.status === "prestado" ? "var(--success-glow)" : "var(--warning-glow)",
                        color: log.status === "prestado" ? "var(--success-text)" : "var(--warning)"
                      }}
                    >
                      {log.status === "prestado" ? "Prestado" : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Lançar Movimentação (Creation) */}
      {isInvoiceModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "500px", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", fontFamily: "var(--font-title)", color: "var(--accent)" }}>Lançar Transação Financeira</h3>
            
            <form onSubmit={handleInvoiceSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Tipo</label>
                  <select 
                    value={tipo} 
                    onChange={(e) => setTipo(e.target.value as "receita" | "despesa")}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px", color: "var(--text-primary)" }}
                  >
                    <option value="despesa">Despesa (Contas a Pagar)</option>
                    <option value="receita">Receita (Contas a Receber)</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Categoria</label>
                  <select 
                    value={categoria} 
                    onChange={(e) => setCategoria(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px", color: "var(--text-primary)" }}
                  >
                    <option value="Madeira">Madeira e MDF</option>
                    <option value="Vidros">Vidros e Fachada</option>
                    <option value="Iluminação">Iluminação &amp; Elétrica</option>
                    <option value="Mobiliário">Mobiliário Alugado</option>
                    <option value="Passagem">Hospedagem &amp; Passagens</option>
                    <option value="Fretes">Fretes &amp; Transportes</option>
                    <option value="Diária">Mão de Obra / Diária</option>
                    <option value="Taxas">Taxas do Organizador</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Origem / Favorecido / Fornecedor</label>
                <input 
                  type="text" 
                  value={vendor} 
                  onChange={(e) => setVendor(e.target.value)} 
                  required
                  placeholder="Ex: Madeireira Natal, Ambev, etc."
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Valor (R$)</label>
                  <input 
                    type="number" 
                    value={value} 
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)} 
                    required
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Nº da Nota Fiscal / Identificador</label>
                  <input 
                    type="text" 
                    value={invoiceNumber} 
                    onChange={(e) => setInvoiceNumber(e.target.value)} 
                    placeholder="NF-1234"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Forma de Pagamento</label>
                  <select 
                    value={formaPagamento} 
                    onChange={(e) => setFormaPagamento(e.target.value as InvoiceLog["formaPagamento"])}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px", color: "var(--text-primary)" }}
                  >
                    <option value="Pix">Pix</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="TED">Transferência TED</option>
                    <option value="Dinheiro">Dinheiro Espécie</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as InvoiceLog["status"])}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px", color: "var(--text-primary)" }}
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Vincular ao Estande / Evento (Opcional)</label>
                <select 
                  value={eventoId} 
                  onChange={(e) => setEventoId(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px", color: "var(--text-primary)" }}
                >
                  <option value="">Não vincular a evento</option>
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id}>{evt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Descrição do Material / Insumos</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={2} 
                  placeholder="Ex: Madeira MDF crua, refletor de led..."
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)", color: "var(--text-primary)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsInvoiceModalOpen(false)} style={{ padding: "8px 16px" }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ padding: "8px 16px" }}>Salvar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edição & Uploads de Transação Financeira */}
      {selectedInvoice && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedInvoice(null)}>
          <div 
            style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "90%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Column: Form Edits */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--accent)" }}>Editar Transação Financeira</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Origem / Favorecido</label>
                    <input type="text" value={editVendor} onChange={(e) => setEditVendor(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Identificador / N° Nota</label>
                    <input type="text" value={editInvoiceNumber} onChange={(e) => setEditInvoiceNumber(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Valor (R$)</label>
                    <input type="number" value={editValue} onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Categoria</label>
                    <input type="text" value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Forma de Pagamento</label>
                    <select 
                      value={editFormaPagamento} 
                      onChange={(e) => setEditFormaPagamento(e.target.value as any)}
                      style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", height: "30px" }}
                    >
                      <option value="Pix">Pix</option>
                      <option value="Boleto">Boleto</option>
                      <option value="TED">TED</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Status</label>
                    <select 
                      value={editStatus} 
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", height: "30px" }}
                    >
                      <option value="pago">Pago</option>
                      <option value="pendente">Pendente</option>
                      <option value="atrasado">Atrasado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Vínculo com Estande / Evento</label>
                  <select 
                    value={editEventoId} 
                    onChange={(e) => setEditEventoId(e.target.value)}
                    style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", height: "30px" }}
                  >
                    <option value="">Não vincular a evento</option>
                    {events.map(evt => (
                      <option key={evt.id} value={evt.id}>{evt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Descrição detalhada</label>
                  <textarea 
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3} 
                    style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--font)" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button type="button" className="btn-primary" onClick={handleSaveChanges} style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", flexGrow: 1, justifyContent: "center" }}>Salvar Lançamento</button>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedInvoice(null)} style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }}>Fechar</button>
                </div>
              </div>
            </div>

            {/* Right Column: PDF Uploads & Attachments */}
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <strong style={{ fontSize: "12px", color: "var(--text-primary)" }}>Boleto Bancário e Notas (PDF / XML)</strong>

              {/* Upload Boleto */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Boleto PDF</label>
                {selectedInvoice.pdfBoleto ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-main)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                      <FileText size={14} style={{ color: "var(--accent-secondary)" }} />
                      <span style={{ fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedInvoice.pdfBoleto}</span>
                    </div>
                    <button onClick={handleRemoveBoleto} style={{ marginLeft: "auto", border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={12} /></button>
                  </div>
                ) : (
                  <div style={{ border: "1.5px dashed var(--border)", padding: "10px", borderRadius: "8px", textAlign: "center", position: "relative", cursor: "pointer" }}>
                    <Upload size={14} className="text-muted" style={{ margin: "0 auto 4px auto" }} />
                    <span style={{ fontSize: "10px", fontWeight: "600" }}>Subir Boleto</span>
                    <input type="file" accept="application/pdf" onChange={handleUploadBoleto} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: "pointer" }} />
                  </div>
                )}
              </div>

              {/* Upload NFe XML */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Nota Fiscal NFe (PDF / XML)</label>
                {selectedInvoice.pdfNFe ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-main)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                      <FileText size={14} style={{ color: "var(--success-text)" }} />
                      <span style={{ fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedInvoice.pdfNFe}</span>
                    </div>
                    <button onClick={handleRemoveNFe} style={{ marginLeft: "auto", border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={12} /></button>
                  </div>
                ) : (
                  <div style={{ border: "1.5px dashed var(--border)", padding: "10px", borderRadius: "8px", textAlign: "center", position: "relative", cursor: "pointer" }}>
                    <Upload size={14} className="text-muted" style={{ margin: "0 auto 4px auto" }} />
                    <span style={{ fontSize: "10px", fontWeight: "600" }}>Subir NFe / XML</span>
                    <input type="file" accept="application/pdf,text/xml" onChange={handleUploadNFe} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: "pointer" }} />
                  </div>
                )}
              </div>

              {/* Custom attachments list */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <strong style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Outros comprovantes anexados:</strong>
                
                <div style={{ border: "1px dashed var(--border)", padding: "8px", borderRadius: "8px", textAlign: "center", position: "relative", cursor: "pointer" }}>
                  <span style={{ fontSize: "10px", fontWeight: "600" }}>+ Adicionar comprovante</span>
                  <input type="file" onChange={handleUploadAnexo} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: "pointer" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto", maxHeight: "100px" }}>
                  {selectedInvoice.anexos && selectedInvoice.anexos.length > 0 ? (
                    selectedInvoice.anexos.map(anx => (
                      <div key={anx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--bg-card)", fontSize: "10px" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexGrow: 1 }}>{anx.name}</span>
                        <button onClick={() => handleDeleteAnexo(anx.id)} style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer", marginLeft: "6px" }}><Trash2 size={10} /></button>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>Nenhum outro anexo</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
