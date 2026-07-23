import React, { useState, useEffect } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, Plus, Tag, 
  X, FileText, Upload, Trash2, Link
} from "lucide-react";
import type { InvoiceLog, Project, NotaFiscal, BoletoAdministrativo } from "../types";

interface FinancialProps {
  invoices: InvoiceLog[];
  events: Project[];
  fornecedores: { name: string; email: string; servico: string }[];
  onAddInvoice: (invoice: Omit<InvoiceLog, "id" | "date">) => void;
  onUpdateInvoice: (updated: InvoiceLog) => void;
  onUpdateEvent: (updated: Project) => void;
  initialSubTab?: string;
}

export default function Financial({ 
  invoices, events, fornecedores, onAddInvoice, onUpdateInvoice, onUpdateEvent, initialSubTab 
}: FinancialProps) {
  const [activeSubTab, setActiveSubTab] = useState<"fluxo" | "pagar" | "receber" | "boletos" | "nfe" | "centro_custo" | "caixinha">(
    (initialSubTab as any) || "fluxo"
  );

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab as any);
  }, [initialSubTab]);
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

  // 3.0 new form fields
  const [parcelas, setParcelas] = useState(1);
  const [recorrente, setRecorrente] = useState(false);
  const [recebimentoParcial, setRecebimentoParcial] = useState(0);
  const [inadimplente, setInadimplente] = useState(false);

  // Nota Fiscal States
  const [nfs, setNfs] = useState<NotaFiscal[]>([
    { id: "nf-1", tipo: "NF-e", numero: "000.108.924", serie: "1", cliente: "Volkswagen do Brasil Ltda", valor: 90000.00, dataEmissao: "2026-07-08", produtos: ["Cenografia Estande Feicon 2026", "Painel de Madeira MDF"], osVinculada: "evt-2", status: "emitida", pdfAnexoNome: "nfe_108924_volkswagen.pdf", xmlAnexoNome: "nfe_108924_volkswagen.xml" },
    { id: "nf-2", tipo: "NFS-e", numero: "2026.00941", serie: "1", cliente: "Nestlé S/A", valor: 80000.00, dataEmissao: "2026-07-15", produtos: ["Serviço de Montagem de Stand Bienal"], osVinculada: "evt-1", status: "emitida", pdfAnexoNome: "nfse_00941_nestle.pdf" }
  ]);
  const [isNfeModalOpen, setIsNfeModalOpen] = useState(false);
  const [nfTipo, setNfTipo] = useState<NotaFiscal["tipo"]>("NF-e");
  const [nfCliente, setNfCliente] = useState("");
  const [nfValor, setNfValor] = useState(0);
  const [nfOS, setNfOS] = useState("");
  const [nfProdutos, setNfProdutos] = useState("");
  const [nfNumeroInput, setNfNumeroInput] = useState("");
  const [nfSerieInput, setNfSerieInput] = useState("1");
  const [nfDataInput, setNfDataInput] = useState("");
  const [nfPdfInput, setNfPdfInput] = useState("");
  const [nfXmlInput, setNfXmlInput] = useState("");

  // 3.1 Boleto state
  const [boletos, setBoletos] = useState<BoletoAdministrativo[]>([
    {
      id: "bol-1",
      numero: "34191.79001 01043.513184 91020.150008 7 98020000015000",
      cliente: "Nestlé S/A",
      valor: 1500.00,
      vencimento: "2026-07-25",
      status: "pendente",
      pdfAnexoNome: "boleto_nestle_feicon.pdf",
      historicoLogs: ["Boleto gerado pelo sistema e enviado em 2026-07-15"]
    },
    {
      id: "bol-2",
      numero: "00190.00009 02332.415617 89000.120042 1 97940000050000",
      cliente: "Volkswagen do Brasil Ltda",
      valor: 5000.00,
      vencimento: "2026-07-18",
      status: "pago",
      pdfAnexoNome: "boleto_volkswagen_3d.pdf",
      comprovanteAnexoNome: "comprovante_volkswagen_pix.pdf",
      historicoLogs: [
        "Boleto gerado em 2026-07-10",
        "Pagamento confirmado via Pix e comprovante anexado em 2026-07-17"
      ]
    }
  ]);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);
  const [bolNumero, setBolNumero] = useState("");
  const [bolCliente, setBolCliente] = useState("");
  const [bolValor, setBolValor] = useState(0);
  const [bolVencimento, setBolVencimento] = useState("");
  const [bolPdf, setBolPdf] = useState("");
  const [bolComprovante, setBolComprovante] = useState("");

  // Boleto filter
  const [boletoStatusFilter, setBoletoStatusFilter] = useState<"all" | InvoiceLog["status"] | "vencido" | "cancelado">("all");

  const handleEmitNFe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nfCliente || nfValor <= 0) return;

    const newNf: NotaFiscal = {
      id: `nf-${Date.now()}`,
      tipo: nfTipo,
      numero: nfNumeroInput || `000.${Math.floor(100000 + Math.random() * 900000)}`,
      serie: nfSerieInput || "1",
      cliente: nfCliente,
      valor: nfValor,
      dataEmissao: nfDataInput || new Date().toISOString().split("T")[0],
      produtos: nfProdutos.split(",").map(p => p.trim()),
      osVinculada: nfOS || undefined,
      status: "emitida",
      pdfAnexoNome: nfPdfInput || undefined,
      xmlAnexoNome: nfXmlInput || undefined
    };

    setNfs([newNf, ...nfs]);
    setIsNfeModalOpen(false);
    setNfCliente("");
    setNfValor(0);
    setNfOS("");
    setNfProdutos("");
    setNfNumeroInput("");
    setNfSerieInput("1");
    setNfDataInput("");
    setNfPdfInput("");
    setNfXmlInput("");
    alert("Nota Fiscal registrada com sucesso e armazenada administrativamente!");
  };

  const handleAddBoleto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bolCliente || bolValor <= 0 || !bolVencimento) return;

    const newBoleto: BoletoAdministrativo = {
      id: `bol-${Date.now()}`,
      numero: bolNumero || `34191.79001 ${Math.floor(10000 + Math.random() * 90000)}.${Math.floor(100000 + Math.random() * 900000)} ${Math.floor(100000 + Math.random() * 900000)} 7 ${Math.floor(90000000000000 + Math.random() * 9000000000000)}`,
      cliente: bolCliente,
      valor: bolValor,
      vencimento: bolVencimento,
      status: "pendente",
      pdfAnexoNome: bolPdf || undefined,
      comprovanteAnexoNome: bolComprovante || undefined,
      historicoLogs: [`Boleto registrado administrativamente em ${new Date().toISOString().split("T")[0]}`]
    };

    setBoletos([newBoleto, ...boletos]);
    setIsBoletoModalOpen(false);
    setBolNumero("");
    setBolCliente("");
    setBolValor(0);
    setBolVencimento("");
    setBolPdf("");
    setBolComprovante("");
    alert("Boleto bancário registrado com sucesso!");
  };

  const handlePayBoleto = (id: string) => {
    const receipt = prompt("Nome do arquivo do comprovante de pagamento (simulado):", "comprovante_pix.pdf");
    if (!receipt) return;
    setBoletos(boletos.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: "pago",
          comprovanteAnexoNome: receipt,
          historicoLogs: [...b.historicoLogs, `Pagamento confirmado administrativamente em ${new Date().toISOString().split("T")[0]}. Comprovante: ${receipt}`]
        };
      }
      return b;
    }));
    alert("Boleto marcado como PAGO com comprovante de pagamento vinculado!");
  };

  const handleCancelBoleto = (id: string) => {
    if (!window.confirm("Deseja realmente cancelar este boleto administrativamente?")) return;
    setBoletos(boletos.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: "cancelado",
          historicoLogs: [...b.historicoLogs, `Boleto cancelado administrativamente em ${new Date().toISOString().split("T")[0]}`]
        };
      }
      return b;
    }));
  };

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
      eventoId: eventoId || undefined,
      parcelas: parcelas || 1,
      recorrente: recorrente || false,
      recebimentoParcial: recebimentoParcial || 0,
      inadimplente: inadimplente || false
    });
    setVendor("");
    setInvoiceNumber("");
    setValue(0);
    setDescription("");
    setEventoId("");
    setParcelas(1);
    setRecorrente(false);
    setRecebimentoParcial(0);
    setInadimplente(false);
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

  const categoriesList = [
    { key: "madeiraMdf", label: "Madeira & MDF" },
    { key: "vidrosVidraçaria", label: "Vidros & Vidraçaria" },
    { key: "iluminacaoEletrica", label: "Iluminação & Elétrica" },
    { key: "mobiliarioAlugado", label: "Mobiliário Alugado" },
    { key: "fretes", label: "Fretes & Transportes" },
    { key: "combustivelPedagios", label: "Combustível & Pedágios" },
    { key: "hospedagemPassagens", label: "Hospedagem & Passagens" },
    { key: "equipePropria", label: "Mão de Obra Própria" },
    { key: "terceirizados", label: "Diárias de Terceirizados" },
    { key: "taxasOrganizador", label: "Taxas do Organizador" }
  ] as const;

  const handleAssignSupplier = (category: string, supplierName: string) => {
    if (!selectedEvent) return;
    const currentFornecedores = selectedEvent.centroCusto.fornecedoresDespesas || {};
    const updatedFornecedores = {
      ...currentFornecedores,
      [category]: supplierName
    };
    onUpdateEvent({
      ...selectedEvent,
      centroCusto: {
        ...selectedEvent.centroCusto,
        fornecedoresDespesas: updatedFornecedores
      }
    });
  };

  const getAccountsPayableBySupplier = () => {
    const payables: { [supplierName: string]: number } = {};
    if (!selectedEvent) return [];
    
    categoriesList.forEach((cat) => {
      const supplierName = selectedEvent.centroCusto.fornecedoresDespesas?.[cat.key];
      if (supplierName) {
        const costVal = dynamicCosts[cat.key] || 0;
        payables[supplierName] = (payables[supplierName] || 0) + costVal;
      }
    });
    
    return Object.entries(payables).map(([name, total]) => ({ name, total }));
  };

  const supplierPayables = getAccountsPayableBySupplier();

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
      <div className="sub-header-tabs" style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", marginBottom: "24px", overflowX: "auto" }}>
        <button 
          className={`tab-btn-link ${activeSubTab === "fluxo" ? "active" : ""}`}
          onClick={() => setActiveSubTab("fluxo")}
          style={{
            padding: "10px 12px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "fluxo" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "fluxo" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "fluxo" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          }}
        >
          Fluxo de Caixa
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "pagar" ? "active" : ""}`}
          onClick={() => setActiveSubTab("pagar")}
          style={{
            padding: "10px 12px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "pagar" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "pagar" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "pagar" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          }}
        >
          Contas a Pagar
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "receber" ? "active" : ""}`}
          onClick={() => setActiveSubTab("receber")}
          style={{
            padding: "10px 12px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "receber" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "receber" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "receber" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          }}
        >
          Contas a Receber
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "boletos" ? "active" : ""}`}
          onClick={() => setActiveSubTab("boletos")}
          style={{
            padding: "10px 12px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "boletos" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "boletos" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "boletos" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          }}
        >
          Boletos
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "nfe" ? "active" : ""}`}
          onClick={() => setActiveSubTab("nfe")}
          style={{
            padding: "10px 12px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "nfe" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "nfe" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "nfe" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          }}
        >
          Notas Fiscais
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "centro_custo" ? "active" : ""}`}
          onClick={() => setActiveSubTab("centro_custo")}
          style={{
            padding: "10px 12px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "centro_custo" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "centro_custo" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "centro_custo" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          }}
        >
          Centro de Custos
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "caixinha" ? "active" : ""}`}
          onClick={() => setActiveSubTab("caixinha")}
          style={{
            padding: "10px 12px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "caixinha" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "caixinha" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "caixinha" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          }}
        >
          Caixinha
        </button>
      </div>

      {/* Fluxo de Caixa Tab */}
      {activeSubTab === "fluxo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Metrics grid */}
          <div className="responsive-layout-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Receitas Acumuladas</span>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--accent-text)", marginTop: "4px" }}>R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent-glow)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={20} />
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Despesas Acumuladas</span>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--accent-secondary)", marginTop: "4px" }}>R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--danger-glow)", color: "var(--danger-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                          color: inv.tipo === "receita" ? "var(--success-text)" : "var(--danger-text)"
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
                    <td style={{ padding: "14px 20px", fontWeight: "700", textAlign: "right", color: inv.tipo === "receita" ? "var(--accent-text)" : "var(--text-primary)" }}>
                      {inv.tipo === "receita" ? "+" : "-"} R$ {inv.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contas a Pagar Tab */}
      {activeSubTab === "pagar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Controle de Contas a Pagar (Despesas &amp; Custos)</h4>
            <button className="btn-primary" onClick={() => setIsInvoiceModalOpen(true)}>
              <Plus size={16} /> Nova Conta a Pagar
            </button>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                  <th style={{ padding: "14px 20px" }}>Fornecedor</th>
                  <th style={{ padding: "14px 20px" }}>Descrição / Centro Custo</th>
                  <th style={{ padding: "14px 20px" }}>Forma / Recorrência</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Valor</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.filter(i => i.tipo === "despesa").map((inv) => {
                  const linkedEvt = events.find(e => e.id === inv.eventoId);
                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <strong>{inv.vendor}</strong>
                        <span style={{ display: "block", fontSize: "10px", color: "var(--text-muted)" }}>NF: {inv.invoiceNumber}</span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span>{inv.description}</span>
                        {linkedEvt && (
                          <span style={{ display: "block", fontSize: "10px", color: "var(--accent)" }}>Centro de Custo: {linkedEvt.name}</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "12px" }}>
                        <span>{inv.formaPagamento}</span>
                        {inv.recorrente ? (
                          <span className="badge badge-warning" style={{ fontSize: "8px", marginLeft: "6px" }}>Mensal Recorrente</span>
                        ) : (
                          inv.parcelas && inv.parcelas > 1 && (
                            <span className="badge badge-muted" style={{ fontSize: "8px", marginLeft: "6px" }}>{inv.parcelas}x Parcelado</span>
                          )
                        )}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: "700", color: "var(--danger-text)" }}>
                        - R$ {inv.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className={`badge badge-${inv.status === "pago" ? "success" : "warning"}`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contas a Receber Tab */}
      {activeSubTab === "receber" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Faturamento Comercial &amp; Recebíveis</h4>
            <button className="btn-primary" onClick={() => setIsInvoiceModalOpen(true)}>
              <Plus size={16} /> Novo Contas a Receber
            </button>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                  <th style={{ padding: "14px 20px" }}>Cliente / Contratante</th>
                  <th style={{ padding: "14px 20px" }}>Descrição Faturamento</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Valor Recebido</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Valor Pendente</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.filter(i => i.tipo === "receita").map((inv) => {
                  const linkedEvt = events.find(e => e.id === inv.eventoId);
                  const isLate = inv.status === "atrasado" || inv.inadimplente;
                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <strong>{inv.vendor}</strong>
                        {isLate && (
                          <span className="badge badge-danger" style={{ fontSize: "8px", marginLeft: "6px" }}>Inadimplente</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span>{inv.description}</span>
                        {linkedEvt && (
                          <span style={{ display: "block", fontSize: "10px", color: "var(--accent)" }}>Projeto/OS: {linkedEvt.codigo}</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right", color: "var(--success-text)", fontWeight: "600" }}>
                        R$ {(inv.recebimentoParcial || (inv.status === "pago" ? inv.value : 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: "700" }}>
                        R$ {(inv.value - (inv.recebimentoParcial || (inv.status === "pago" ? inv.value : 0))).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className={`badge badge-${inv.status === "pago" ? "success" : isLate ? "danger" : "warning"}`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consulta de Boletos Tab */}
      {activeSubTab === "boletos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Consulta Integrada de Boletos</h4>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button className="btn-primary" onClick={() => setIsBoletoModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Plus size={14} /> Registrar Boleto Manual
              </button>
              <select 
                value={boletoStatusFilter}
                onChange={(e) => setBoletoStatusFilter(e.target.value as any)}
                style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-card)", color: "var(--text-primary)" }}
              >
                <option value="all">Filtrar por Status</option>
                <option value="pago">Confirmados (Pagos)</option>
                <option value="pendente">Abertos (Pendentes)</option>
                <option value="atrasado">Vencidos (Atrasados)</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                  <th style={{ padding: "14px 20px" }}>Código / Linha Digitável</th>
                  <th style={{ padding: "14px 20px" }}>Pagador (Cliente)</th>
                  <th style={{ padding: "14px 20px" }}>Vencimento</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Valor</th>
                  <th style={{ padding: "14px 20px" }}>Anexos</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {boletos.filter(b => {
                  if (boletoStatusFilter === "all") return true;
                  if (boletoStatusFilter === "atrasado") return b.status === "vencido";
                  return b.status === boletoStatusFilter;
                }).map((bol) => {
                  return (
                    <tr key={bol.id} style={{ borderBottom: "1px solid var(--border)", fontSize: "12px" }}>
                      <td style={{ padding: "14px 20px", fontFamily: "monospace", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis" }} title={bol.numero}>
                        {bol.numero}
                      </td>
                      <td style={{ padding: "14px 20px" }}><strong>{bol.cliente}</strong></td>
                      <td style={{ padding: "14px 20px" }}>{bol.vencimento}</td>
                      <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: "700" }}>
                        R$ {bol.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {bol.pdfAnexoNome ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); alert(`Download do boleto PDF: ${bol.pdfAnexoNome}`); }} style={{ fontSize: "10px", color: "var(--accent-text)", textDecoration: "underline" }}>
                              📄 Boleto PDF
                            </a>
                          ) : (
                            <span className="text-muted" style={{ fontStyle: "italic", fontSize: "10px" }}>Sem PDF</span>
                          )}
                          {bol.comprovanteAnexoNome ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); alert(`Download do comprovante de pagamento: ${bol.comprovanteAnexoNome}`); }} style={{ fontSize: "10px", color: "var(--success-text)", textDecoration: "underline" }}>
                              ✔ Comprovante
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className={`badge badge-${bol.status === "pago" ? "success" : bol.status === "vencido" ? "danger" : bol.status === "cancelado" ? "muted" : "warning"}`}>
                          {bol.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button 
                            className="btn-secondary btn-xs"
                            onClick={() => alert(`Histórico de logs do Boleto:\n\n${bol.historicoLogs.map((log: string, i: number) => `${i+1}. ${log}`).join("\n")}`)}
                            title="Ver Histórico/Logs"
                          >
                            Histórico
                          </button>
                          {bol.status === "pendente" && (
                            <button 
                              className="btn-success btn-xs"
                              onClick={() => handlePayBoleto(bol.id)}
                            >
                              Dar Baixa
                            </button>
                          )}
                          {bol.status !== "cancelado" && bol.status !== "pago" && (
                            <button 
                              className="btn-danger btn-xs"
                              onClick={() => handleCancelBoleto(bol.id)}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notas Fiscais Tab */}
      {activeSubTab === "nfe" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Histórico de Notas Fiscais Emitidas (SEFAZ)</h4>
            <button className="btn-primary" onClick={() => setIsNfeModalOpen(true)}>
              <Plus size={16} /> Emitir Nova Nota Fiscal
            </button>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                  <th style={{ padding: "14px 20px" }}>Número / Série</th>
                  <th style={{ padding: "14px 20px" }}>Cliente</th>
                  <th style={{ padding: "14px 20px" }}>Tipo NF</th>
                  <th style={{ padding: "14px 20px" }}>Itens Faturados</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Valor</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {nfs.map((nf) => {
                  return (
                    <tr key={nf.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: "12px" }}>
                        NF {nf.numero} {nf.serie && `(Série ${nf.serie})`}
                        <span style={{ display: "block", fontSize: "9px", color: "var(--text-muted)" }}>Emissão: {nf.dataEmissao}</span>
                        {/* 3.1 file links */}
                        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                          {nf.pdfAnexoNome ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulando download do PDF da Nota Fiscal: ${nf.pdfAnexoNome}`); }} style={{ fontSize: "9px", color: "var(--accent)", textDecoration: "underline" }}>
                              PDF
                            </a>
                          ) : (
                            <span style={{ fontSize: "9px", color: "var(--text-muted)", fontStyle: "italic" }}>Sem PDF</span>
                          )}
                          {nf.xmlAnexoNome ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulando download do XML da Nota Fiscal: ${nf.xmlAnexoNome}`); }} style={{ fontSize: "9px", color: "var(--accent-secondary)", textDecoration: "underline" }}>
                              XML
                            </a>
                          ) : (
                            <span style={{ fontSize: "9px", color: "var(--text-muted)", fontStyle: "italic" }}>Sem XML</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}><strong>{nf.cliente}</strong></td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className="badge badge-muted" style={{ fontSize: "10px" }}>{nf.tipo}</span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {nf.produtos.join(", ")}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: "700" }}>
                        R$ {nf.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className={`badge badge-${nf.status === "emitida" ? "success" : "danger"}`}>
                          {nf.status === "emitida" ? "HOMOLOGADA" : "CANCELADA"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
                style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", backgroundColor: "var(--bg-card)", minWidth: "300px" }}
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
            <div className="responsive-layout-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
              {/* Detailed Category Table */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <h5 style={{ fontSize: "14px", fontWeight: "600", borderBottom: "1px solid var(--border)", paddingBottom: "10px", color: "var(--text-primary)" }}>Detalhamento por Linha de Despesa</h5>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {categoriesList.map((cat) => {
                    const costVal = dynamicCosts[cat.key] || 0;
                    const assignedSupplier = selectedEvent.centroCusto.fornecedoresDespesas?.[cat.key] || "";
                    
                    return (
                      <div key={cat.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", padding: "8px 0", borderBottom: "1px dashed var(--border)", gap: "12px" }}>
                        <span style={{ fontWeight: "500" }}>{cat.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <select
                            value={assignedSupplier}
                            onChange={(e) => handleAssignSupplier(cat.key, e.target.value)}
                            style={{
                              padding: "4px 8px",
                              border: "1px solid var(--border)",
                              borderRadius: "6px",
                              fontSize: "11px",
                              background: "var(--bg-card)",
                              color: "var(--text-secondary)",
                              outline: "none",
                              maxWidth: "160px"
                            }}
                          >
                            <option value="">-- Sem Fornecedor --</option>
                            {fornecedores.map(s => (
                              <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                          <strong style={{ whiteSpace: "nowrap" }}>R$ {costVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "15px", paddingTop: "12px", borderTop: "2px solid var(--border)", color: "var(--text-primary)" }}>
                  <span>Custo Total Realizado:</span>
                  <span>R$ {totalCustoEvento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>

                {supplierPayables.length > 0 && (
                  <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "2px dashed var(--border)" }}>
                    <h6 style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Contas a Pagar do Estande (Consolidado por Fornecedor)
                    </h6>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {supplierPayables.map((sp) => (
                        <div key={sp.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-primary)", backgroundColor: "var(--bg-main)", padding: "6px 12px", borderRadius: "6px" }}>
                          <span>🤝 {sp.name}</span>
                          <strong style={{ color: "var(--accent-secondary)" }}>R$ {sp.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profitability gauges and ranking list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Margem de Lucro Bruto</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <h3 style={{ fontSize: "28px", fontWeight: "800", color: lucroRealizado >= 0 ? "var(--success-text)" : "var(--danger-text)" }}>
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
                        background: margemLucro >= 30 ? "var(--success-text)" : margemLucro >= 10 ? "var(--accent-secondary)" : "var(--danger-text)" 
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
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "700", color: item.profit >= 0 ? "var(--success-text)" : "var(--danger-text)" }}>
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
        <div className="responsive-layout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
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
                        color: log.status === "prestado" ? "var(--success-text)" : "var(--warning-text)"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Número de Parcelas</label>
                  <input type="number" min="1" max="24" value={parcelas} onChange={(e) => setParcelas(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                  <input type="checkbox" checked={recorrente} onChange={(e) => setRecorrente(e.target.checked)} id="cbRecorrente" />
                  <label htmlFor="cbRecorrente" style={{ fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Despesa Recorrente</label>
                </div>
              </div>

              {tipo === "receita" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Valor Recebido Parcial</label>
                    <input type="number" min="0" value={recebimentoParcial} onChange={(e) => setRecebimentoParcial(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                    <input type="checkbox" checked={inadimplente} onChange={(e) => setInadimplente(e.target.checked)} id="cbInadimplente" />
                    <label htmlFor="cbInadimplente" style={{ fontSize: "12px", fontWeight: "600", color: "var(--danger)", cursor: "pointer" }}>Inadimplência Ativa</label>
                  </div>
                </div>
              )}

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

      {/* Modal Emitir Nova Nota Fiscal (NF-e, NFS-e, NFC-e) */}
      {isNfeModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Registrar Nota Fiscal Comercial</h3>
            
            <form onSubmit={handleEmitNFe} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Tipo de Nota</label>
                  <select 
                    value={nfTipo} 
                    onChange={(e) => setNfTipo(e.target.value as any)}
                    style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}
                  >
                    <option value="NF-e">NF-e (Venda/Produtos)</option>
                    <option value="NFS-e">NFS-e (Serviços Cenografia)</option>
                    <option value="NFC-e">NFC-e (Consumidor Rápida)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Valor Total da Nota (R$)</label>
                  <input type="number" min="1" value={nfValor} onChange={(e) => setNfValor(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} required />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Número NF</label>
                  <input type="text" value={nfNumeroInput} onChange={(e) => setNfNumeroInput(e.target.value)} placeholder="Ex: 000.123.456" style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Série</label>
                  <input type="text" value={nfSerieInput} onChange={(e) => setNfSerieInput(e.target.value)} placeholder="Ex: 1" style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Data de Emissão</label>
                  <input type="date" value={nfDataInput} onChange={(e) => setNfDataInput(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Vincular a OS / Projeto</label>
                  <select 
                    value={nfOS} 
                    onChange={(e) => setNfOS(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}
                  >
                    <option value="">Não vincular a OS</option>
                    {events.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.client})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Razão Social / Cliente Tomador</label>
                <input type="text" value={nfCliente} onChange={(e) => setNfCliente(e.target.value)} required placeholder="Ex: Honda Automóveis Ltda" style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Descrever Produtos / Serviços (separados por vírgula)</label>
                <input type="text" value={nfProdutos} onChange={(e) => setNfProdutos(e.target.value)} required placeholder="Ex: Cenografia Stand Honda, Locação de mobiliário" style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Simular XML Anexo</label>
                  <input type="text" value={nfXmlInput} onChange={(e) => setNfXmlInput(e.target.value)} placeholder="Ex: nfe_honda.xml" style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Simular PDF Anexo</label>
                  <input type="text" value={nfPdfInput} onChange={(e) => setNfPdfInput(e.target.value)} placeholder="Ex: nfe_honda.pdf" style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsNfeModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Homologar Nota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Novo Boleto Manual */}
      {isBoletoModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Registrar Boleto Bancário Manual</h3>
            
            <form onSubmit={handleAddBoleto} style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Sacado / Sacador (Cliente Pagador)</label>
                <input type="text" value={bolCliente} onChange={(e) => setBolCliente(e.target.value)} required placeholder="Ex: Honda Automóveis Ltda" style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Valor do Boleto (R$)</label>
                  <input type="number" min="1" value={bolValor} onChange={(e) => setBolValor(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} required />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Data de Vencimento</label>
                  <input type="date" value={bolVencimento} onChange={(e) => setBolVencimento(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} required />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Linha Digitável / Código de Barras (Opcional)</label>
                <input type="text" value={bolNumero} onChange={(e) => setBolNumero(e.target.value)} placeholder="Ex: 34191.79001 01043..." style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Simular Boleto PDF</label>
                  <input type="text" value={bolPdf} onChange={(e) => setBolPdf(e.target.value)} placeholder="Ex: boleto_honda_feicon.pdf" style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Simular Comprovante PDF</label>
                  <input type="text" value={bolComprovante} onChange={(e) => setBolComprovante(e.target.value)} placeholder="Ex: comprovante_honda.pdf" style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsBoletoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Registrar Boleto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
