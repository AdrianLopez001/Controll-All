import React, { useState, useMemo } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, Plus, Tag, 
  X, FileText, Upload, Trash2, Link as LinkIcon, ChevronRight, ChevronLeft, 
  Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, CreditCard as CreditCardIcon, 
  Building2, PieChart, BarChart3, CheckCircle2, AlertTriangle, Download, Edit, 
  Printer, Eye, Layers, Settings, Check, FileSpreadsheet, ArrowLeftRight, LayoutDashboard
} from "lucide-react";
import type { 
  InvoiceLog, Project, NotaFiscal, BoletoAdministrativo,
  BankAccount, CreditCard, CategoriaFinanceira, CentroCustoConfig,
  FormaPagamentoConfig, ContatoEntidade, TagFinanceira, DREConfig,
  OFXImportHistory
} from "../types";

interface FinancialProps {
  invoices: InvoiceLog[];
  events: Project[];
  fornecedores: { name: string; email: string; servico: string }[];
  onAddInvoice: (invoice: Omit<InvoiceLog, "id" | "date">) => void;
  onUpdateInvoice: (updated: InvoiceLog) => void;
  onUpdateEvent: (updated: Project) => void;
  initialSubTab?: string;
}

// Initial Mock Seed for Financial Configurations & Accounts
const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  { id: "b-1", nome: "077 - INTER - J C LOCAÇÕES", tipo: "Conta corrente", saldoInicial: 0, saldoAtual: 119417.64, bancoLogo: "inter", ativa: true },
  { id: "b-2", nome: "APLICAÇÃO - JC EVENTOS (SANTANDER)", tipo: "Outros", saldoInicial: 0, saldoAtual: -5046.57, bancoLogo: "santander", ativa: true },
  { id: "b-3", nome: "ITAÚ", tipo: "Conta corrente", saldoInicial: 0, saldoAtual: 66384.38, bancoLogo: "itau", ativa: true },
  { id: "b-4", nome: "SANTANDER", tipo: "Conta corrente", saldoInicial: -53302.76, saldoAtual: 147608.98, bancoLogo: "santander", ativa: true }
];

const INITIAL_CREDIT_CARDS: CreditCard[] = [
  { id: "card-1", nome: "CARTÃO DE CRÉDITO INTER", bandeira: "Mastercard", limite: 25000, faturaAtual: 0, diaFechamento: 15, diaVencimento: 25, ativo: true },
  { id: "card-2", nome: "CC Santander 9267 (1748) vence 25", bandeira: "Mastercard", limite: 50000, faturaAtual: 2760.00, diaFechamento: 15, diaVencimento: 25, ativo: true },
  { id: "card-3", nome: "CC Santander físico 0469 Jailson - vence 10", bandeira: "Mastercard", limite: 15000, faturaAtual: 0, diaFechamento: 1, diaVencimento: 10, ativo: true },
  { id: "card-4", nome: "CC Santander físico 0549 - vence 25", bandeira: "Mastercard", limite: 30000, faturaAtual: 2437.78, diaFechamento: 15, diaVencimento: 25, ativo: true },
  { id: "card-5", nome: "CC Santander físico 1836 Cristiane - vence 25", bandeira: "Mastercard", limite: 20000, faturaAtual: 0, diaFechamento: 15, diaVencimento: 25, ativo: true },
  { id: "card-6", nome: "CC Santander físico 2910 - vence 10", bandeira: "Mastercard", limite: 35000, faturaAtual: 2474.53, diaFechamento: 1, diaVencimento: 10, ativo: true },
  { id: "card-7", nome: "CC Santander físico 7805 Duda - vence 10", bandeira: "Mastercard", limite: 15000, faturaAtual: 0, diaFechamento: 1, diaVencimento: 10, ativo: true },
  { id: "card-8", nome: "CC Santander físico 9769 - vence 25", bandeira: "Mastercard", limite: 25000, faturaAtual: 908.82, diaFechamento: 15, diaVencimento: 25, ativo: true },
  { id: "card-9", nome: "CC Santander físico 0990 Thiago - vence 25", bandeira: "Mastercard", limite: 20000, faturaAtual: 0, diaFechamento: 15, diaVencimento: 25, ativo: true },
  { id: "card-10", nome: "CC Santander físico 2540 Duda - vence 25", bandeira: "Mastercard", limite: 15000, faturaAtual: 0, diaFechamento: 15, diaVencimento: 25, ativo: true }
];

const INITIAL_CATEGORIES: CategoriaFinanceira[] = [
  { id: "cat-1", nome: "Outras Receitas", natureza: "receita", grupoDRE: "-" },
  { id: "cat-2", nome: "Adiantamento", natureza: "receita", grupoDRE: "Outras Receitas" },
  { id: "cat-3", nome: "Alimentação", natureza: "despesa", grupoDRE: "Despesas Operacionais" },
  { id: "cat-4", nome: "Boleto", natureza: "receita", grupoDRE: "Outras Receitas" },
  { id: "cat-5", nome: "Cartão", natureza: "receita", grupoDRE: "Outras Receitas" },
  { id: "cat-6", nome: "Cobrança", natureza: "receita", grupoDRE: "Receita Bruta" },
  { id: "cat-7", nome: "Comissão", natureza: "receita", grupoDRE: "Outras Receitas" },
  { id: "cat-8", nome: "Depósito", natureza: "receita", grupoDRE: "Outras Receitas" },
  { id: "cat-9", nome: "Empréstimo", natureza: "receita", grupoDRE: "Outras Receitas" },
  { id: "cat-10", nome: "Mensalidade", natureza: "receita", grupoDRE: "Outras Receitas" },
  { id: "cat-11", nome: "Material | Madeira e afins", natureza: "despesa", grupoDRE: "Custos Operacionais" },
  { id: "cat-12", nome: "Folha de Pagamento", natureza: "despesa", grupoDRE: "Despesas Operacionais" },
  { id: "cat-13", nome: "Advocacia", natureza: "despesa", grupoDRE: "Despesas Operacionais" },
  { id: "cat-14", nome: "Combustível | Caminhão", natureza: "despesa", grupoDRE: "Custos Operacionais" },
  { id: "cat-15", nome: "HOSPEDAGEM", natureza: "despesa", grupoDRE: "Custos Operacionais" },
  { id: "cat-16", nome: "Frete", natureza: "despesa", grupoDRE: "Custos Operacionais" },
  { id: "cat-17", nome: "Rendimentos", natureza: "receita", grupoDRE: "Receitas Financeiras" }
];

const INITIAL_COST_CENTERS: CentroCustoConfig[] = [
  { id: "cc-1", nome: "Contas de eventos passados", classificacao: "Geral" },
  { id: "cc-2", nome: "Design de Stands", classificacao: "Projetos" },
  { id: "cc-3", nome: "Despesas Prediais", classificacao: "Fixo" },
  { id: "cc-4", nome: "Evento - Aquisição Material", classificacao: "Projetos" },
  { id: "cc-5", nome: "Evento - Combustível", classificacao: "Logística" },
  { id: "cc-6", nome: "Locações", classificacao: "Comercial" }
];

const INITIAL_PAYMENT_MODES: FormaPagamentoConfig[] = [
  { id: "pm-1", nome: "PIX" },
  { id: "pm-2", nome: "Cartão de Crédito" },
  { id: "pm-3", nome: "Boleto Bancário" },
  { id: "pm-4", nome: "Débito Automático" },
  { id: "pm-5", nome: "Não Informado" },
  { id: "pm-6", nome: "Transferência Bancária" },
  { id: "pm-7", nome: "Cartão de Débito" },
  { id: "pm-8", nome: "Depósito" },
  { id: "pm-9", nome: "Dinheiro" },
  { id: "pm-10", nome: "Débito Inter - J C locações" },
  { id: "pm-11", nome: "Pagamentos Digitais" },
  { id: "pm-12", nome: "Promissória" },
  { id: "pm-13", nome: "Cheque" }
];

const INITIAL_CONTACTS: ContatoEntidade[] = [
  { id: "cnt-1", nome: "NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA", tipo: "cliente" },
  { id: "cnt-2", nome: "AMANDA ROCHA EVENTOS", tipo: "cliente" },
  { id: "cnt-3", nome: "Alexandro T. Gomes", tipo: "cliente" },
  { id: "cnt-4", nome: "FIIBO SAUDE E BEM-ESTAR LTDA", tipo: "cliente" },
  { id: "cnt-5", nome: "LIGA CONTRA O CANCER", tipo: "cliente" },
  { id: "cnt-6", nome: "NEW ORLEANS EVENTOS FEIRAS E LAZER", tipo: "cliente" },
  { id: "cnt-7", nome: "ICT FARMACEUTICA LTDA", tipo: "cliente" },
  { id: "cnt-8", nome: "Associação Brasileira de Supermercados", tipo: "cliente" },
  { id: "cnt-9", nome: "FLASH APP", tipo: "fornecedor" },
  { id: "cnt-10", nome: "BANCO SANTANDER (BRASIL) S.A.", tipo: "fornecedor" },
  { id: "cnt-11", nome: "POSTO DE GASOLINA", tipo: "fornecedor" },
  { id: "cnt-12", nome: "ARMAZEM RIBEIRA DISTRIBUIDORA LTDA", tipo: "fornecedor" },
  { id: "cnt-13", nome: "Comercial de Madeiras RN", tipo: "fornecedor" },
  { id: "cnt-14", nome: "Eletro Ferragens Natal", tipo: "fornecedor" }
];

const INITIAL_TAGS: TagFinanceira[] = [
  { id: "tag-1", nome: "Frete", tipo: "despesa" },
  { id: "tag-2", nome: "Locação", tipo: "receita" },
  { id: "tag-3", nome: "Urgente", tipo: "despesa" },
  { id: "tag-4", nome: "Stand Octanorm", tipo: "receita" },
  { id: "tag-5", nome: "Equipe Externa", tipo: "despesa" }
];

const INITIAL_DRE_CONFIG: DREConfig[] = [
  { id: "dre-1", sped: "", nome: "Receita Bruta", natureza: "(+) Receitas" },
  { id: "dre-2", sped: "", nome: "Receita de Serviços", natureza: "(+) Receitas" },
  { id: "dre-3", sped: "", nome: "Receita de Produtos", natureza: "(+) Receitas" },
  { id: "dre-4", sped: "", nome: "Receita de Aluguel", natureza: "(+) Receitas" },
  { id: "dre-5", sped: "", nome: "Deduções", natureza: "(-) Despesas" },
  { id: "dre-6", sped: "", nome: "Impostos Sobre Vendas", natureza: "(-) Despesas" },
  { id: "dre-7", sped: "", nome: "Comissões Sobre Vendas", natureza: "(-) Despesas" },
  { id: "dre-8", sped: "", nome: "Devolução de Vendas", natureza: "(-) Despesas" },
  { id: "dre-9", sped: "", nome: "Descontos Comerciais", natureza: "(-) Despesas" },
  { id: "dre-10", sped: "", nome: "Receita Líquida", natureza: "(=) Totalizador" },
  { id: "dre-11", sped: "", nome: "Custos Operacionais", natureza: "(-) Despesas" },
  { id: "dre-12", sped: "", nome: "Despesas Operacionais", natureza: "(-) Despesas" },
  { id: "dre-13", sped: "", nome: "Lucro Operacional", natureza: "(=) Totalizador" }
];

// Initial Transactions (Mock Extrato Dashboard)
const SEED_TRANSACTIONS: InvoiceLog[] = [
  {
    id: "tx-1",
    vendor: "JC DESIGN DE STANDS LTDA",
    invoiceNumber: "PIX-60701190",
    value: 12072.80,
    description: "50% - Adiantamento Stand XIV CONGRESSO BRASILEIRO DE HISPANISTAS",
    date: "2026-07-01",
    tipo: "receita",
    categoria: "Adiantamento",
    formaPagamento: "Pix",
    status: "pago",
    contaBancariaId: "b-1",
    responsavel: "Eventos | (Alexandro T. Gomes)",
    pagoA: "",
    recebidoDe: "Alexandro T. Gomes"
  },
  {
    id: "tx-2",
    vendor: "ITAU UNIBANCO S.A.",
    invoiceNumber: "REND-001",
    value: 0.42,
    description: "REND PAGO APLIC AUT APR",
    date: "2026-07-01",
    tipo: "receita",
    categoria: "Rendimentos",
    formaPagamento: "TED",
    status: "pago",
    contaBancariaId: "b-3",
    responsavel: "Fornecedores/Parceiros",
    pagoA: "",
    recebidoDe: "Itaú"
  },
  {
    id: "tx-3",
    vendor: "ITAU UNIBANCO S.A.",
    invoiceNumber: "REND-002",
    value: 0.68,
    description: "REND PAGO APLIC AUT APR",
    date: "2026-07-02",
    tipo: "receita",
    categoria: "Rendimentos",
    formaPagamento: "TED",
    status: "pago",
    contaBancariaId: "b-3",
    responsavel: "Fornecedores/Parceiros"
  },
  {
    id: "tx-4",
    vendor: "Transferência Interna",
    invoiceNumber: "TRF-001",
    value: 2000.00,
    description: "Transferência: Itaú → 077 - INTER - J C LOCAÇÕES",
    date: "2026-07-03",
    tipo: "despesa",
    categoria: "Transferência",
    formaPagamento: "Transferência Bancária",
    status: "pago",
    contaBancariaId: "b-3",
    transferenciaOrigemId: "b-3",
    transferenciaDestinoId: "b-1",
    isTransferencia: true,
    responsavel: "Itaú > 077 - INTER - J C LOCAÇÕES"
  },
  {
    id: "tx-5",
    vendor: "Transferência Interna",
    invoiceNumber: "TRF-002",
    value: 5000.00,
    description: "Transferência: Itaú → 077 - INTER - J C LOCAÇÕES",
    date: "2026-07-03",
    tipo: "despesa",
    categoria: "Transferência",
    formaPagamento: "Transferência Bancária",
    status: "pago",
    contaBancariaId: "b-3",
    transferenciaOrigemId: "b-3",
    transferenciaDestinoId: "b-1",
    isTransferencia: true,
    responsavel: "Itaú > 077 - INTER - J C LOCAÇÕES"
  },
  {
    id: "tx-6",
    vendor: "ITAU UNIBANCO S.A.",
    invoiceNumber: "REND-003",
    value: 4.04,
    description: "REND PAGO APLIC AUT APR",
    date: "2026-07-03",
    tipo: "receita",
    categoria: "Rendimentos",
    formaPagamento: "TED",
    status: "pago",
    contaBancariaId: "b-3"
  },
  {
    id: "tx-7",
    vendor: "JC DESIGN DE STANDS LTDA",
    invoiceNumber: "PIX-60701191",
    value: 2000.00,
    description: "Pix recebido: Cp :60701190-JC DESIGN DE STANDS LTDA",
    date: "2026-07-03",
    tipo: "receita",
    categoria: "Cobrança",
    formaPagamento: "Pix",
    status: "pago",
    contaBancariaId: "b-1"
  },
  {
    id: "tx-8",
    vendor: "JC DESIGN DE STANDS LTDA",
    invoiceNumber: "PIX-60701192",
    value: 5000.00,
    description: "Pix recebido: Cp :60701190-JC DESIGN DE STANDS LTDA",
    date: "2026-07-03",
    tipo: "receita",
    categoria: "Cobrança",
    formaPagamento: "Pix",
    status: "pago",
    contaBancariaId: "b-1"
  },
  {
    id: "tx-9",
    vendor: "NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA",
    invoiceNumber: "LOC-2026-04",
    value: 800.00,
    description: "LOCAÇÃO DE VITRINE EM OCTANORM - nazaria torrente",
    date: "2026-07-04",
    tipo: "receita",
    categoria: "Cobrança",
    formaPagamento: "Boleto Bancário",
    status: "pago",
    contaBancariaId: "b-4",
    responsavel: "Eventos | (NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA) | (21/05/2026 | Mega Feira da Nazaria - Teresina/PI)",
    recebidoDe: "NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA"
  },
  {
    id: "tx-10",
    vendor: "NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA",
    invoiceNumber: "LOC-2026-05",
    value: 250.00,
    description: "LOCAÇÃO DE 02 CONJUNTOS DE MESA COM 04 CADEIRAS - nazaria momenta",
    date: "2026-07-04",
    tipo: "receita",
    categoria: "Cobrança",
    formaPagamento: "Boleto Bancário",
    status: "pago",
    contaBancariaId: "b-4",
    responsavel: "Eventos | (NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA) | (21/05/2026 | Mega Feira da Nazaria - Teresina/PI)",
    recebidoDe: "NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA"
  },
  {
    id: "tx-11",
    vendor: "NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA",
    invoiceNumber: "LOC-2026-06",
    value: 250.00,
    description: "LOCAÇÃO DE 01 CONJUNTO DE MESA COM 04 CADEIRAS PARA - nazaria isdin",
    date: "2026-07-04",
    tipo: "receita",
    categoria: "Cobrança",
    formaPagamento: "Boleto Bancário",
    status: "pago",
    contaBancariaId: "b-4",
    responsavel: "Eventos | (NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA) | (21/05/2026 | Mega Feira da Nazaria - Teresina/PI)",
    recebidoDe: "NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS LTDA"
  },
  {
    id: "tx-12",
    vendor: "Comercial de Madeiras RN",
    invoiceNumber: "NF-9921",
    value: 4500.00,
    description: "Aquisição de chapas MDF 18mm para Stand Unimed Feicon",
    date: "2026-07-05",
    tipo: "despesa",
    categoria: "Material | Madeira e afins",
    formaPagamento: "Pix",
    status: "pago",
    contaBancariaId: "b-4",
    pagoA: "Comercial de Madeiras RN"
  },
  {
    id: "tx-13",
    vendor: "Eletro Ferragens Natal",
    invoiceNumber: "NF-4412",
    value: 2437.78,
    description: "Compra de refletores LED e fiamento elétrico",
    date: "2026-07-06",
    tipo: "despesa",
    categoria: "Iluminação e Materiais Elétricos",
    formaPagamento: "Cartão de Crédito",
    status: "pago",
    cartaoCreditoId: "card-4",
    pagoA: "Eletro Ferragens Natal"
  }
];

// Seed for Late Collections & Payments
const LATE_RECEIVABLES = [
  { id: "lr-1", desc: "Saldo Final Stand Unimed Feicon 2026", valor: 15000.00, vencimento: "2026-07-15", diasAtraso: 15, cliente: "Unimed Natal" },
  { id: "lr-2", desc: "Locação Estande Misto Hospitalar Recife", valor: 45000.00, vencimento: "2026-07-10", diasAtraso: 20, cliente: "Hapvida Saúde" },
  { id: "lr-3", desc: "Parcela 2/3 Chevrolet Salão Automóvel", valor: 34000.00, vencimento: "2026-07-18", diasAtraso: 12, cliente: "Chevrolet Potiguar" },
  { id: "lr-4", desc: "Adiantamento Estande Feira de Noivas", valor: 18500.00, vencimento: "2026-07-20", diasAtraso: 10, cliente: "Noivas & Cia" },
  { id: "lr-5", desc: "Taxa de Montagem Adicional ExpoSaúde", valor: 8019.44, vencimento: "2026-07-05", diasAtraso: 25, cliente: "Potiguar Farma" },
  { id: "lr-6", desc: "Locação Mobiliário Especial Stand VIP", valor: 90000.00, vencimento: "2026-07-01", diasAtraso: 29, cliente: "Volkswagen Brasil" }
];

const LATE_PAYABLES = [
  { id: "lp-1", desc: "Frete Carreta Natal x Recife (Caminhão Ford)", valor: 8500.00, vencimento: "2026-07-12", diasAtraso: 18, fornecedor: "Transportes Potiguar Cargas" },
  { id: "lp-2", desc: "Móveis Alugados (Balcão recepção e bistrôs)", valor: 12400.00, vencimento: "2026-07-14", diasAtraso: 16, fornecedor: "Móveis Eventos Express" },
  { id: "lp-3", desc: "Fatura Cartão Santander final 0549", valor: 2437.78, vencimento: "2026-07-25", diasAtraso: 5, fornecedor: "Banco Santander" },
  { id: "lp-4", desc: "Diárias Equipe Marcenaria Terceirizada", valor: 6800.00, vencimento: "2026-07-22", diasAtraso: 8, fornecedor: "Marcenaria Silva" },
  { id: "lp-5", desc: "Hospedagem Hotel Ibis Recife (6 montadores)", valor: 15400.00, vencimento: "2026-07-19", diasAtraso: 11, fornecedor: "Accor Hotels" },
  { id: "lp-6", desc: "Consumo Elétrico e Taxas Pavilhão ExpoRecife", valor: 197753.00, vencimento: "2026-07-08", diasAtraso: 22, fornecedor: "Pavilhão Expo Recife" }
];

export default function Financial({ 
  invoices, events, fornecedores, onAddInvoice, onUpdateInvoice, onUpdateEvent, initialSubTab 
}: FinancialProps) {

  const [activeMainTab, setActiveMainTab] = useState<"dashboard" | "receber" | "pagar" | "servicos_avulsos" | "faturamento" | "conciliacao" | "relatorios" | "configuracoes" | "caixinha_obra">(
    initialSubTab === "centro_custo" ? "configuracoes" : ((initialSubTab as any) || "dashboard")
  );

  React.useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === "centro_custo") {
        setActiveMainTab("configuracoes");
        setConfigActiveTab("centro_custo");
      } else {
        setActiveMainTab(initialSubTab as any);
      }
    }
  }, [initialSubTab]);
  
  // Dashboard Sub-filters
  const [dashboardTipoFilter, setDashboardTipoFilter] = useState<"todos" | "receitas" | "despesas">("todos");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBank, setFilterBank] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCostCenter, setFilterCostCenter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Period Navigator State
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // 7 = Julho
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  // Financial Configuration State Lists (CRUD Managed)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [creditCards, setCreditCards] = useState<CreditCard[]>(INITIAL_CREDIT_CARDS);
  const [categories, setCategories] = useState<CategoriaFinanceira[]>(INITIAL_CATEGORIES);
  const [costCenters, setCostCenters] = useState<CentroCustoConfig[]>(INITIAL_COST_CENTERS);
  const [paymentModes, setPaymentModes] = useState<FormaPagamentoConfig[]>(INITIAL_PAYMENT_MODES);
  const [contacts, setContacts] = useState<ContatoEntidade[]>(INITIAL_CONTACTS);
  const [tags, setTags] = useState<TagFinanceira[]>(INITIAL_TAGS);
  const [dreConfigs, setDreConfigs] = useState<DREConfig[]>(INITIAL_DRE_CONFIG);

  // Active Transaction List combining props and seed
  const [allTransactions, setAllTransactions] = useState<InvoiceLog[]>([
    ...SEED_TRANSACTIONS,
    ...invoices.filter(inv => !SEED_TRANSACTIONS.some(s => s.id === inv.id))
  ]);

  // Late lists state
  const [lateReceivables, setLateReceivables] = useState(LATE_RECEIVABLES);
  const [latePayables, setLatePayables] = useState(LATE_PAYABLES);

  // Modals state
  const [isRecebimentoModalOpen, setIsRecebimentoModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<InvoiceLog | null>(null);

  // Transfer Form State
  const [trfData, setTrfData] = useState("2026-07-30");
  const [trfOrigem, setTrfOrigem] = useState(bankAccounts[3]?.id || "");
  const [trfDestino, setTrfDestino] = useState(bankAccounts[0]?.id || "");
  const [trfValor, setTrfValor] = useState<number>(0);

  // OFX Reconciliation & History State
  const [ofxSubTab, setOfxSubTab] = useState<"import" | "history" | "nfe">("import");
  const [ofxSelectedBank, setOfxSelectedBank] = useState("SANTANDER");
  const [ofxImportsHistory, setOfxImportsHistory] = useState<OFXImportHistory[]>([
    {
      id: "ofx-1",
      dataImportacao: "2026-07-28",
      banco: "SANTANDER",
      conta: "147.608,98",
      qtdLancamentos: 14,
      status: "conciliado",
      transacoes: [
        { id: "o-1", data: "2026-07-04", descricao: "LOCAÇÃO DE VITRINE OCTANORM", valor: 800.00, tipo: "receita", conciliado: true },
        { id: "o-2", data: "2026-07-05", descricao: "COMPRA MDF PINHEIRO", valor: 4500.00, tipo: "despesa", conciliado: true }
      ]
    }
  ]);
  const [ofxMatchedRows, setOfxMatchedRows] = useState<any[]>([]);
  const [ofxFileLoaded, setOfxFileLoaded] = useState(false);

  // Central NFe State
  const [centralNFeList, setCentralNFeList] = useState<NotaFiscal[]>([
    {
      id: "nf-cent-1",
      tipo: "NF-e",
      numero: "000.108.924",
      nossoNumero: "3419108924",
      empresa: "JC LOCAÇÕES E EVENTOS LTDA",
      pedido: "PED-2026-08",
      tomador: "Volkswagen do Brasil Ltda",
      cliente: "Volkswagen do Brasil Ltda",
      valor: 90000.00,
      dataEmissao: "2026-07-08",
      produtos: ["Cenografia Estande Feicon 2026", "Painel de Madeira MDF"],
      osVinculada: "evt-2",
      status: "emitida",
      pdfAnexoNome: "nfe_108924_volkswagen.pdf",
      xmlAnexoNome: "nfe_108924_volkswagen.xml"
    },
    {
      id: "nf-cent-2",
      tipo: "NFS-e",
      numero: "2026.00941",
      nossoNumero: "202600941",
      empresa: "JC LOCAÇÕES E EVENTOS LTDA",
      pedido: "PED-2026-14",
      tomador: "Nestlé S/A",
      cliente: "Nestlé S/A",
      valor: 80000.00,
      dataEmissao: "2026-07-15",
      produtos: ["Serviço de Montagem de Stand Bienal"],
      osVinculada: "evt-1",
      status: "emitida",
      pdfAnexoNome: "nfse_00941_nestle.pdf"
    }
  ]);
  const [nfFilterType, setNfFilterType] = useState("all");
  const [nfSearchQuery, setNfSearchQuery] = useState("");

  // Relatórios Avançados State
  const [relatorioSelectedTab, setRelatorioSelectedTab] = useState<string>("performance");
  const [reportStartDate, setReportStartDate] = useState<string>("2026-06-01");
  const [reportEndDate, setReportEndDate] = useState<string>("2026-07-30");
  const [reportStatusFilter, setReportStatusFilter] = useState<string>("Pagos");
  const [reportBankFilter, setReportBankFilter] = useState<string>("Todas");

  // Configurações Financeiras Sub-Tab State
  const [configActiveTab, setConfigActiveTab] = useState<"contas" | "cartoes" | "categorias" | "centro_custo" | "modo_pagamento" | "recebido_pago" | "tags" | "dre">("contas");
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configInputName, setConfigInputName] = useState("");
  const [configInputExtra1, setConfigInputExtra1] = useState("");
  const [configInputExtra2, setConfigInputExtra2] = useState("");

  // Month names for period selector
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const shortMonthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Aug", "Set", "Out", "Nov", "Dez"];

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      if (dashboardTipoFilter === "receitas" && tx.tipo !== "receita") return false;
      if (dashboardTipoFilter === "despesas" && tx.tipo !== "despesa") return false;
      if (filterStatus !== "all" && tx.status !== filterStatus) return false;
      if (filterBank !== "all" && tx.contaBancariaId !== filterBank) return false;
      if (filterCategory !== "all" && tx.categoria !== filterCategory) return false;
      if (filterCostCenter !== "all" && tx.centroCustoId !== filterCostCenter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesVendor = tx.vendor.toLowerCase().includes(query);
        const matchesCat = tx.categoria.toLowerCase().includes(query);
        if (!matchesDesc && !matchesVendor && !matchesCat) return false;
      }
      return true;
    });
  }, [allTransactions, dashboardTipoFilter, filterStatus, filterBank, filterCategory, filterCostCenter, searchQuery]);

  // Dashboard Totals Calculations
  const receitasJulho = useMemo(() => {
    return allTransactions
      .filter(tx => tx.tipo === "receita" && !tx.isTransferencia)
      .reduce((acc, curr) => acc + curr.value, 0) + 245422.47;
  }, [allTransactions]);

  const despesasJulho = useMemo(() => {
    return allTransactions
      .filter(tx => tx.tipo === "despesa" && !tx.isTransferencia)
      .reduce((acc, curr) => acc + curr.value, 0) + 300000.00;
  }, [allTransactions]);

  const saldoGeral = useMemo(() => {
    return bankAccounts.reduce((acc, curr) => acc + curr.saldoAtual, 0);
  }, [bankAccounts]);

  const totalLateReceivables = useMemo(() => {
    return lateReceivables.reduce((acc, curr) => acc + curr.valor, 0);
  }, [lateReceivables]);

  const totalLatePayables = useMemo(() => {
    return latePayables.reduce((acc, curr) => acc + curr.valor, 0);
  }, [latePayables]);

  // Quick Action handlers
  const handleQuickSettleReceivable = (id: string) => {
    const item = lateReceivables.find(r => r.id === id);
    if (!item) return;
    const newTx: InvoiceLog = {
      id: `tx-rec-${Date.now()}`,
      vendor: item.cliente,
      invoiceNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      value: item.valor,
      description: item.desc,
      date: new Date().toISOString().split("T")[0],
      tipo: "receita",
      categoria: "Cobrança",
      formaPagamento: "Pix",
      status: "pago",
      contaBancariaId: bankAccounts[0].id,
      recebidoDe: item.cliente
    };
    setAllTransactions([newTx, ...allTransactions]);
    setLateReceivables(lateReceivables.filter(r => r.id !== id));
    // update bank balance
    setBankAccounts(bankAccounts.map(b => b.id === bankAccounts[0].id ? { ...b, saldoAtual: b.saldoAtual + item.valor } : b));
    
    if (onAddInvoice) onAddInvoice(newTx);

    // Sync project in events
    const matchingEvent = events.find(e => 
      e.client.toLowerCase().includes(item.cliente.toLowerCase()) || 
      item.desc.toLowerCase().includes(e.name.toLowerCase()) ||
      e.name.toLowerCase().includes(item.desc.toLowerCase())
    );
    if (matchingEvent && onUpdateEvent) {
      const updatedRecebido = (matchingEvent.valorRecebido || 0) + item.valor;
      const updatedPendente = Math.max(0, (matchingEvent.valorPendente || 0) - item.valor);
      onUpdateEvent({
        ...matchingEvent,
        valorRecebido: updatedRecebido,
        valorPendente: updatedPendente
      });
    }

    alert(`Recebimento de R$ ${item.valor.toLocaleString("pt-BR")} baixado com sucesso e integrado ao projeto!`);
  };

  const handleQuickSettlePayable = (id: string) => {
    const item = latePayables.find(p => p.id === id);
    if (!item) return;
    const newTx: InvoiceLog = {
      id: `tx-pag-${Date.now()}`,
      vendor: item.fornecedor,
      invoiceNumber: `PAG-${Math.floor(1000 + Math.random() * 9000)}`,
      value: item.valor,
      description: item.desc,
      date: new Date().toISOString().split("T")[0],
      tipo: "despesa",
      categoria: "Outras Despesas",
      formaPagamento: "Pix",
      status: "pago",
      contaBancariaId: bankAccounts[3].id,
      pagoA: item.fornecedor
    };
    setAllTransactions([newTx, ...allTransactions]);
    setLatePayables(latePayables.filter(p => p.id !== id));
    // update bank balance
    setBankAccounts(bankAccounts.map(b => b.id === bankAccounts[3].id ? { ...b, saldoAtual: b.saldoAtual - item.valor } : b));

    if (onAddInvoice) onAddInvoice(newTx);

    // Sync project in events
    const matchingEvent = events.find(e => 
      item.desc.toLowerCase().includes(e.name.toLowerCase()) ||
      e.name.toLowerCase().includes(item.desc.toLowerCase())
    );
    if (matchingEvent && onUpdateEvent) {
      onUpdateEvent({
        ...matchingEvent,
        custoRealizado: (matchingEvent.custoRealizado || 0) + item.valor
      });
    }

    alert(`Pagamento de R$ ${item.valor.toLocaleString("pt-BR")} baixado com sucesso e integrado ao projeto!`);
  };

  const handleToggleTransactionStatus = (tx: InvoiceLog) => {
    const nextStatus: "pendente" | "pago" = tx.status === "pago" ? "pendente" : "pago";
    const updatedTx: InvoiceLog = { ...tx, status: nextStatus };
    
    setAllTransactions(prev => prev.map(t => t.id === tx.id ? updatedTx : t));
    if (onUpdateInvoice) onUpdateInvoice(updatedTx);

    // Sync matching event in projects
    const matchingEvent = events.find(e => 
      e.client.toLowerCase().includes(tx.vendor.toLowerCase()) ||
      tx.vendor.toLowerCase().includes(e.client.toLowerCase()) ||
      tx.description.toLowerCase().includes(e.name.toLowerCase()) ||
      e.name.toLowerCase().includes(tx.description.toLowerCase())
    );

    if (matchingEvent && onUpdateEvent) {
      if (tx.tipo === "receita") {
        const delta = nextStatus === "pago" ? tx.value : -tx.value;
        const newRecebido = Math.max(0, (matchingEvent.valorRecebido || 0) + delta);
        const newPendente = Math.max(0, (matchingEvent.valorContratado || 0) - newRecebido);
        onUpdateEvent({
          ...matchingEvent,
          valorRecebido: newRecebido,
          valorPendente: newPendente
        });
      } else {
        const delta = nextStatus === "pago" ? tx.value : -tx.value;
        const newCusto = Math.max(0, (matchingEvent.custoRealizado || 0) + delta);
        onUpdateEvent({
          ...matchingEvent,
          custoRealizado: newCusto
        });
      }
    }

    alert(`Lançamento "${tx.description}" alterado para ${nextStatus.toUpperCase()} e integrado ao projeto!`);
  };

  // Transfer execution
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (trfOrigem === trfDestino) {
      alert("A conta de Origem não pode ser a mesma de Destino!");
      return;
    }
    if (trfValor <= 0) {
      alert("Informe um valor válido para a transferência!");
      return;
    }
    const origenAcc = bankAccounts.find(b => b.id === trfOrigem);
    const destinoAcc = bankAccounts.find(b => b.id === trfDestino);

    const newTransferTx: InvoiceLog = {
      id: `trf-${Date.now()}`,
      vendor: `Transferência: ${origenAcc?.nome || "Origem"} → ${destinoAcc?.nome || "Destino"}`,
      invoiceNumber: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      value: trfValor,
      description: `Transferência entre contas (${origenAcc?.nome} → ${destinoAcc?.nome})`,
      date: trfData,
      tipo: "despesa",
      categoria: "Transferência",
      formaPagamento: "Transferência Bancária",
      status: "pago",
      contaBancariaId: trfOrigem,
      transferenciaOrigemId: trfOrigem,
      transferenciaDestinoId: trfDestino,
      isTransferencia: true,
      responsavel: `${origenAcc?.nome} > ${destinoAcc?.nome}`
    };

    setAllTransactions([newTransferTx, ...allTransactions]);
    // update accounts balance
    setBankAccounts(bankAccounts.map(b => {
      if (b.id === trfOrigem) return { ...b, saldoAtual: b.saldoAtual - trfValor };
      if (b.id === trfDestino) return { ...b, saldoAtual: b.saldoAtual + trfValor };
      return b;
    }));

    setIsTransferModalOpen(false);
    setTrfValor(0);
    alert("Transferência realizada com sucesso!");
  };

  // OFX Upload Processing Simulation
  const handleSimulateOFXUpload = () => {
    setOfxFileLoaded(true);
    setOfxMatchedRows([
      { id: "ofx-row-1", data: "01/07/2026", memo: "PIX RECEBIDO JC DESIGN 60701190", valor: 12072.80, status: "matched", matchSystemId: "tx-1" },
      { id: "ofx-row-2", data: "03/07/2026", memo: "TAR COBRANCA BANCO SANTANDER", valor: -45.00, status: "pending", matchSystemId: "" },
      { id: "ofx-row-3", data: "04/07/2026", memo: "BOLETO RECEBIDO NAZARIA 800", valor: 800.00, status: "matched", matchSystemId: "tx-9" }
    ]);
  };

  // Configuration CRUD Add
  const handleAddConfigurationItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configInputName.trim()) return;

    if (configActiveTab === "contas") {
      setBankAccounts([...bankAccounts, { id: `b-${Date.now()}`, nome: configInputName, tipo: configInputExtra1 || "Conta corrente", saldoInicial: parseFloat(configInputExtra2) || 0, saldoAtual: parseFloat(configInputExtra2) || 0, ativa: true }]);
    } else if (configActiveTab === "cartoes") {
      setCreditCards([...creditCards, { id: `card-${Date.now()}`, nome: configInputName, bandeira: "Mastercard", limite: parseFloat(configInputExtra1) || 10000, faturaAtual: 0, diaFechamento: 15, diaVencimento: 25, ativo: true }]);
    } else if (configActiveTab === "categorias") {
      setCategories([...categories, { id: `cat-${Date.now()}`, nome: configInputName, natureza: (configInputExtra1 as any) || "despesa", grupoDRE: configInputExtra2 || "Outras Despesas" }]);
    } else if (configActiveTab === "centro_custo") {
      setCostCenters([...costCenters, { id: `cc-${Date.now()}`, nome: configInputName, classificacao: configInputExtra1 || "Geral" }]);
    } else if (configActiveTab === "modo_pagamento") {
      setPaymentModes([...paymentModes, { id: `pm-${Date.now()}`, nome: configInputName }]);
    } else if (configActiveTab === "recebido_pago") {
      setContacts([...contacts, { id: `cnt-${Date.now()}`, nome: configInputName, tipo: (configInputExtra1 as any) || "ambos" }]);
    } else if (configActiveTab === "tags") {
      setTags([...tags, { id: `tag-${Date.now()}`, nome: configInputName, tipo: (configInputExtra1 as any) || "despesa" }]);
    } else if (configActiveTab === "dre") {
      setDreConfigs([...dreConfigs, { id: `dre-${Date.now()}`, nome: configInputName, natureza: (configInputExtra1 as any) || "(-) Despesas" }]);
    }

    setConfigModalOpen(false);
    setConfigInputName("");
    setConfigInputExtra1("");
    setConfigInputExtra2("");
  };

  return (
    <div className="financial-module" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Level Section Navigation Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--border)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className={`btn-tab ${activeMainTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveMainTab("dashboard")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeMainTab === "dashboard" ? "var(--accent)" : "var(--bg-card)",
              color: activeMainTab === "dashboard" ? "#fff" : "var(--text-primary)",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <LayoutDashboard size={18} /> Visão Geral
          </button>
          <button 
            className={`btn-tab ${activeMainTab === "receber" ? "active" : ""}`}
            onClick={() => setActiveMainTab("receber")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeMainTab === "receber" ? "var(--accent)" : "var(--bg-card)",
              color: activeMainTab === "receber" ? "#fff" : "var(--text-primary)",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <TrendingUp size={18} /> Contas a Receber
          </button>
          <button 
            className={`btn-tab ${activeMainTab === "pagar" ? "active" : ""}`}
            onClick={() => setActiveMainTab("pagar")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeMainTab === "pagar" ? "var(--accent)" : "var(--bg-card)",
              color: activeMainTab === "pagar" ? "#fff" : "var(--text-primary)",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <TrendingDown size={18} /> Contas a Pagar
          </button>
          <button 
            className={`btn-tab ${activeMainTab === "caixinha_obra" ? "active" : ""}`}
            onClick={() => setActiveMainTab("caixinha_obra" as any)}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeMainTab === ("caixinha_obra" as any) ? "var(--accent)" : "var(--bg-card)",
              color: activeMainTab === ("caixinha_obra" as any) ? "#fff" : "var(--text-primary)",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <Wallet size={18} /> Caixinha de Obra
          </button>
          <button 
            className={`btn-tab ${activeMainTab === "servicos_avulsos" ? "active" : ""}`}
            onClick={() => setActiveMainTab("servicos_avulsos")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeMainTab === "servicos_avulsos" ? "var(--accent)" : "var(--bg-card)",
              color: activeMainTab === "servicos_avulsos" ? "#fff" : "var(--text-primary)",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <Tag size={18} /> Serviços &amp; Despesas Avulsas
          </button>
          <button 
            className={`btn-tab ${activeMainTab === "conciliacao" ? "active" : ""}`}
            onClick={() => setActiveMainTab("conciliacao")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeMainTab === "conciliacao" ? "var(--accent)" : "var(--bg-card)",
              color: activeMainTab === "conciliacao" ? "#fff" : "var(--text-primary)",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <RefreshCw size={18} /> Conciliação Bancária &amp; NFs
          </button>
          <button 
            className={`btn-tab ${activeMainTab === "relatorios" ? "active" : ""}`}
            onClick={() => setActiveMainTab("relatorios")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeMainTab === "relatorios" ? "var(--accent)" : "var(--bg-card)",
              color: activeMainTab === "relatorios" ? "#fff" : "var(--text-primary)",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <BarChart3 size={18} /> Relatórios Avançados
          </button>
          <button 
            className={`btn-tab ${activeMainTab === "configuracoes" ? "active" : ""}`}
            onClick={() => setActiveMainTab("configuracoes")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeMainTab === "configuracoes" ? "var(--accent)" : "var(--bg-card)",
              color: activeMainTab === "configuracoes" ? "#fff" : "var(--text-primary)",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <Settings size={18} /> Configurações Financeiras
          </button>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. DASHBOARD FINANCEIRO                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Summary Cards Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>

            {/* Receitas Card */}
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", borderTop: "4px solid #00c853", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "11px", color: "#00c853", fontWeight: "700", textTransform: "uppercase" }}>RECEITAS JULHO</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>SALDO ATUAL</div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: "4px 0" }}>
                R$ {receitasJulho.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h2>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>PREVISÃO DO MÊS R$ 358.315,99</div>
            </div>

            {/* Despesas Card */}
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", borderTop: "4px solid #ff3d00", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "11px", color: "#ff3d00", fontWeight: "700", textTransform: "uppercase" }}>DESPESAS JULHO</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>SALDO ATUAL</div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: "4px 0" }}>
                R$ {despesasJulho.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h2>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>PREVISÃO DO MÊS R$ 327.368,11</div>
            </div>

            {/* Saldo Card */}
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", borderTop: "4px solid #00b0ff", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "11px", color: "#00b0ff", fontWeight: "700", textTransform: "uppercase" }}>SALDO</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>TODAS AS CONTAS</div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: "4px 0" }}>
                R$ {saldoGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          {/* Main Dashboard Layout Grid (Left Sidebar 1fr, Main Extrato 3fr) */}
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px" }}>
            
            {/* Left Sidebar Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Minhas Contas Card */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px", boxShadow: "var(--shadow-sm)" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#0099ff", textTransform: "uppercase", marginBottom: "14px" }}>MINHAS CONTAS</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {bankAccounts.map(b => (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "4px", backgroundColor: b.nome.includes("INTER") ? "#ff6600" : b.nome.includes("ITAÚ") ? "#003399" : "#cc0000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "10px" }}>
                          {b.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "700", display: "block" }}>{b.nome}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: b.saldoAtual >= 0 ? "var(--text-primary)" : "#ff3d00" }}>
                        R$ {b.saldoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Receitas / Despesas Donut Chart Widget */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Receitas/Despesas (Julho)</span>
                
                {/* SVG Donut Chart */}
                <div style={{ position: "relative", width: "140px", height: "140px", margin: "16px auto" }}>
                  <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ff3d00" strokeWidth="4.5" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#29b6f6" strokeWidth="4.5" strokeDasharray="47.7, 100" />
                  </svg>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "10px", fontWeight: "700" }}>
                    <span style={{ color: "#29b6f6" }}>47.7%</span> / <span style={{ color: "#ff3d00" }}>52.3%</span>
                  </div>
                </div>

                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Previsão Julho: <strong style={{ color: "var(--text-primary)" }}>R$ 30.947,88</strong>
                </div>
              </div>

              {/* Meus Cartões Panel */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px", boxShadow: "var(--shadow-sm)" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#0099ff", textTransform: "uppercase", marginBottom: "14px" }}>MEUS CARTÕES</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "220px", overflowY: "auto" }}>
                  {creditCards.map(card => (
                    <div key={card.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border)", paddingBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "20px", height: "14px", borderRadius: "2px", backgroundColor: "#ff3d00", color: "#fff", fontSize: "8px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" }}>MC</div>
                        <span style={{ fontSize: "10px", fontWeight: "600" }}>{card.nome}</span>
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: card.faturaAtual > 0 ? "#ff3d00" : "var(--text-muted)" }}>
                        R$ {card.faturaAtual > 0 ? `-${card.faturaAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "0,00"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Central Area: Period Navigator & Extrato Table */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Period Selector & Action Buttons Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "14px 20px" }}>
                
                {/* Month Navigator with Popover */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                  <button className="btn-secondary" onClick={() => setSelectedMonth(prev => prev > 1 ? prev - 1 : 12)} style={{ padding: "6px 10px" }}>
                    <ChevronLeft size={16} />
                  </button>

                  <h3 style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {monthNames[selectedMonth - 1]} - {selectedYear}
                  </h3>

                  <button className="btn-secondary" onClick={() => setSelectedMonth(prev => prev < 12 ? prev + 1 : 1)} style={{ padding: "6px 10px" }}>
                    <ChevronRight size={16} />
                  </button>

                  <button className="btn-secondary" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} style={{ padding: "6px 10px" }} title="Abrir Calendário">
                    <Calendar size={16} />
                  </button>

                  {/* Calendar Popover */}
                  {isDatePickerOpen && (
                    <div style={{ position: "absolute", top: "45px", left: "0", backgroundColor: "#263238", border: "1px solid #37474f", borderRadius: "12px", padding: "16px", color: "#fff", zIndex: 100, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", width: "240px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }} onClick={() => setSelectedYear(prev => prev - 1)}>&lt;</button>
                        <strong>{selectedYear}</strong>
                        <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }} onClick={() => setSelectedYear(prev => prev + 1)}>&gt;</button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                        {shortMonthNames.map((m, idx) => (
                          <button
                            key={m}
                            onClick={() => {
                              setSelectedMonth(idx + 1);
                              setIsDatePickerOpen(false);
                            }}
                            style={{
                              padding: "8px 4px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: selectedMonth === idx + 1 ? "#37474f" : "transparent",
                              color: selectedMonth === idx + 1 ? "#00e676" : "#fff",
                              fontWeight: selectedMonth === idx + 1 ? "800" : "500",
                              cursor: "pointer",
                              fontSize: "11px"
                            }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button className="btn-success" onClick={() => setIsRecebimentoModalOpen(true)} style={{ backgroundColor: "#4caf50", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", border: "none", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <Plus size={16} /> RECEBIMENTO
                  </button>

                  <button className="btn-danger" onClick={() => setIsDespesaModalOpen(true)} style={{ backgroundColor: "#e53935", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", border: "none", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <Plus size={16} /> DESPESA
                  </button>

                  <button onClick={() => setIsTransferModalOpen(true)} style={{ backgroundColor: "#eceff1", color: "#37474f", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", border: "1px solid #cfd8dc", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <ArrowLeftRight size={16} /> TRANSFERÊNCIA
                  </button>

                  {/* Export Menu Popover */}
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)} style={{ backgroundColor: "#29b6f6", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", border: "none", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <Download size={14} /> Exportar ▾
                    </button>

                    {isExportDropdownOpen && (
                      <div style={{ position: "absolute", right: 0, top: "40px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow-md)", zIndex: 50, display: "flex", flexDirection: "column", width: "120px" }}>
                        <button className="dropdown-item" onClick={() => { alert("Exportando Extrato para PDF..."); setIsExportDropdownOpen(false); }} style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px" }}>PDF</button>
                        <button className="dropdown-item" onClick={() => { alert("Exportando Extrato para Excel..."); setIsExportDropdownOpen(false); }} style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px" }}>Excel</button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Sub-Tab Filter Bar (RECEITAS / DESPESAS / TODOS) */}
              <div style={{ display: "flex", gap: "0", borderRadius: "10px 10px 0 0", overflow: "hidden", border: "1px solid var(--border)" }}>
                <button 
                  onClick={() => setDashboardTipoFilter("receitas")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    backgroundColor: dashboardTipoFilter === "receitas" ? "#29b6f6" : "var(--bg-card)",
                    color: dashboardTipoFilter === "receitas" ? "#fff" : "var(--text-primary)",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <TrendingUp size={16} /> RECEITAS
                </button>
                <button 
                  onClick={() => setDashboardTipoFilter("despesas")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    backgroundColor: dashboardTipoFilter === "despesas" ? "#e53935" : "var(--bg-card)",
                    color: dashboardTipoFilter === "despesas" ? "#fff" : "var(--text-primary)",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <TrendingDown size={16} /> DESPESAS
                </button>
                <button 
                  onClick={() => setDashboardTipoFilter("todos")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor: dashboardTipoFilter === "todos" ? "var(--accent)" : "var(--bg-card)",
                    color: dashboardTipoFilter === "todos" ? "#fff" : "var(--text-primary)",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  TODOS
                </button>
              </div>

              {/* Combined Search & Select Filter Controls */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", backgroundColor: "var(--bg-card)", padding: "12px 16px", border: "1px solid var(--border)", borderRadius: "0 0 10px 10px", marginTop: "-1px", flexWrap: "wrap" }}>
                <div style={{ backgroundColor: "#29b6f6", color: "#fff", padding: "6px 10px", borderRadius: "6px" }}>
                  <Filter size={14} />
                </div>

                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-main)", color: "var(--text-primary)" }}>
                  <option value="all">Todos Status</option>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                  <option value="atrasado">Atrasado</option>
                </select>

                <select value={filterBank} onChange={e => setFilterBank(e.target.value)} style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-main)", color: "var(--text-primary)" }}>
                  <option value="all">Todas Contas</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.nome}</option>
                  ))}
                </select>

                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-main)", color: "var(--text-primary)" }}>
                  <option value="all">Todas Categorias</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>

                <select value={filterCostCenter} onChange={e => setFilterCostCenter(e.target.value)} style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-main)", color: "var(--text-primary)" }}>
                  <option value="all">Todos Centros de Custo</option>
                  {costCenters.map(cc => (
                    <option key={cc.id} value={cc.id}>{cc.nome}</option>
                  ))}
                </select>

                <div style={{ flexGrow: 1, minWidth: "180px", position: "relative" }}>
                  <input 
                    type="text" 
                    placeholder="Pesquisar..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "6px 12px 6px 30px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", background: "var(--bg-main)", color: "var(--text-primary)" }}
                  />
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                </div>
              </div>

              {/* Transactions Main Extrato Table */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-main)" }}>
                      <th style={{ padding: "12px 16px", width: "40px" }}>AÇÕES</th>
                      <th style={{ padding: "12px 16px" }}>DATA</th>
                      <th style={{ padding: "12px 16px" }}>DESCRIÇÃO</th>
                      <th style={{ padding: "12px 16px" }}>RESPONSÁVEL</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>VALOR</th>
                      <th style={{ padding: "12px 16px" }}>CATEGORIA / BANCO</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>FUNÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(tx => {
                      const isTransfer = tx.isTransferencia || tx.categoria === "Transferência";
                      return (
                        <tr key={tx.id} style={{ borderBottom: "1px solid var(--border)", transition: "var(--transition)" }}>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            {isTransfer ? (
                              <div style={{ backgroundColor: "#eceff1", color: "#37474f", width: "24px", height: "24px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ArrowLeftRight size={14} />
                              </div>
                            ) : (
                              <div style={{ backgroundColor: "#00c853", color: "#fff", width: "24px", height: "24px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Check size={14} />
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <strong>{tx.date}</strong>
                            <span 
                              style={{ 
                                display: "block", 
                                fontSize: "9px", 
                                fontWeight: "800", 
                                color: "#fff", 
                                backgroundColor: tx.status === "pago" ? "#4caf50" : "#ff9800", 
                                padding: "1px 6px", 
                                borderRadius: "4px", 
                                marginTop: "2px",
                                width: "fit-content"
                              }}
                            >
                              {tx.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <strong>{tx.vendor}</strong>
                            <span style={{ display: "block", color: "var(--text-muted)", fontSize: "11px" }}>{tx.description}</span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "11px" }}>
                            {tx.responsavel || "Não Informado"}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "800", fontSize: "13px", color: isTransfer ? "var(--text-primary)" : tx.tipo === "receita" ? "#00c853" : "var(--text-primary)" }}>
                            R$ {tx.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ display: "block", fontWeight: "600" }}>{tx.categoria}</span>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                              <Building2 size={12} /> {bankAccounts.find(b => b.id === tx.contaBancariaId)?.nome || "Santander"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                              <button className="btn-secondary btn-xs" onClick={() => setSelectedTxForEdit(tx)} style={{ backgroundColor: "#ffc107", border: "none", color: "#fff" }} title="Editar">
                                <Edit size={12} />
                              </button>
                              <button className="btn-danger btn-xs" onClick={() => setAllTransactions(allTransactions.filter(t => t.id !== tx.id))} style={{ backgroundColor: "#e53935", border: "none", color: "#fff" }} title="Excluir">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CONTAS A RECEBER TAB VIEW                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* CONTAS A RECEBER TAB VIEW                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === "receber" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Recebimentos em Atraso Panel */}
          {lateReceivables.length > 0 && (
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "4px solid #ff9800", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ backgroundColor: "#ff9800", color: "#fff", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>
                    {lateReceivables.length}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#ff9800", textTransform: "uppercase", letterSpacing: "0.5px" }}>RECEBIMENTOS EM ATRASO</span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", margin: 0, color: "#d97706" }}>
                  R$ {totalLateReceivables.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px", marginTop: "14px" }}>
                {lateReceivables.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", backgroundColor: "var(--bg-main)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <div style={{ minWidth: 0, flexGrow: 1, marginRight: "8px" }}>
                      <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>{item.desc}</strong>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Cliente: {item.cliente}</span>
                      <span style={{ color: "#ff3d00", fontWeight: "600", fontSize: "10px" }}>{item.diasAtraso} dias em atraso (Venc: {item.vencimento})</span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <strong style={{ display: "block", fontSize: "12px", color: "#059669", marginBottom: "4px" }}>R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                      <button className="btn-success btn-xs" onClick={() => handleQuickSettleReceivable(item.id)} style={{ fontSize: "10px", padding: "4px 10px" }}>
                        Baixa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section-box" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#059669", display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingUp size={20} /> Contas a Receber &amp; Liquidações de Clientes
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Lançamentos de receitas contratadas de estandes, medições e recebimentos pendentes.</p>
              </div>
              <button className="btn-primary" onClick={() => setIsRecebimentoModalOpen(true)}>
                <Plus size={14} /> Novo Recebimento
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ width: "100%", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "var(--bg-main)", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>VENCIMENTO</th>
                    <th style={{ padding: "10px" }}>CLIENTE / PROJETO</th>
                    <th style={{ padding: "10px" }}>DESCRIÇÃO</th>
                    <th style={{ padding: "10px" }}>VALOR</th>
                    <th style={{ padding: "10px" }}>STATUS</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.filter(t => t.tipo === "receita").map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px" }}>{t.date}</td>
                      <td style={{ padding: "10px" }}><strong>{t.vendor}</strong></td>
                      <td style={{ padding: "10px" }}>{t.description}</td>
                      <td style={{ padding: "10px", fontWeight: "700", color: "#059669" }}>R$ {t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", backgroundColor: t.status === "pago" ? "#ecfdf5" : "#fffbeb", color: t.status === "pago" ? "#047857" : "#b45309" }}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        {t.status !== "pago" ? (
                          <button className="btn-success btn-xs" onClick={() => handleToggleTransactionStatus(t)}>Liquidar</button>
                        ) : (
                          <span style={{ fontSize: "10px", color: "#047857", fontWeight: "700" }}>✓ Liquidado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CONTAS A PAGAR TAB VIEW                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === "pagar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Pagamentos em Atraso Panel */}
          {latePayables.length > 0 && (
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "4px solid #ff3d00", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ backgroundColor: "#ff3d00", color: "#fff", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>
                    {latePayables.length}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#ff3d00", textTransform: "uppercase", letterSpacing: "0.5px" }}>PAGAMENTOS EM ATRASO</span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", margin: 0, color: "#dc2626" }}>
                  R$ {totalLatePayables.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px", marginTop: "14px" }}>
                {latePayables.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", backgroundColor: "var(--bg-main)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <div style={{ minWidth: 0, flexGrow: 1, marginRight: "8px" }}>
                      <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>{item.desc}</strong>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Fornecedor: {item.fornecedor}</span>
                      <span style={{ color: "#ff3d00", fontWeight: "600", fontSize: "10px" }}>{item.diasAtraso} dias em atraso (Venc: {item.vencimento})</span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <strong style={{ display: "block", fontSize: "12px", color: "#dc2626", marginBottom: "4px" }}>R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                      <button className="btn-danger btn-xs" onClick={() => handleQuickSettlePayable(item.id)} style={{ fontSize: "10px", padding: "4px 10px" }}>
                        Pagar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section-box" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingDown size={20} /> Contas a Pagar &amp; Despesas com Fornecedores
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Compromissos financeiros, compras de MDF, diárias de equipe e locação de ferramentas.</p>
              </div>
              <button className="btn-secondary" onClick={() => setIsDespesaModalOpen(true)} style={{ backgroundColor: "#dc2626", color: "#fff" }}>
                <Plus size={14} /> Nova Despesa
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ width: "100%", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "var(--bg-main)", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>VENCIMENTO</th>
                    <th style={{ padding: "10px" }}>FORNECEDOR / BENEFICIÁRIO</th>
                    <th style={{ padding: "10px" }}>DESCRIÇÃO DA DESPESA</th>
                    <th style={{ padding: "10px" }}>VALOR</th>
                    <th style={{ padding: "10px" }}>STATUS</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.filter(t => t.tipo === "despesa").map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px" }}>{t.date}</td>
                      <td style={{ padding: "10px" }}><strong>{t.vendor}</strong></td>
                      <td style={{ padding: "10px" }}>{t.description}</td>
                      <td style={{ padding: "10px", fontWeight: "700", color: "#dc2626" }}>R$ {t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", backgroundColor: t.status === "pago" ? "#ecfdf5" : "#fef2f2", color: t.status === "pago" ? "#047857" : "#dc2626" }}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        {t.status !== "pago" ? (
                          <button className="btn-primary btn-xs" onClick={() => handleToggleTransactionStatus(t)}>Pagar</button>
                        ) : (
                          <span style={{ fontSize: "10px", color: "#dc2626", fontWeight: "700" }}>✓ Pago</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SERVIÇOS DIRETO & AVULSOS TAB VIEW                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {(activeMainTab === "servicos_avulsos" || activeMainTab === "faturamento") && (
        <div className="section-box" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Tag size={20} /> Serviços Avulsos &amp; Lançamentos Diretos sem Vínculo de Cliente
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Registro de serviços gerais, taxas cartorárias, fretes avulsos e receitas operacionais não atreladas a projetos.</p>
            </div>
            <button className="btn-primary" onClick={() => setIsDespesaModalOpen(true)}>
              <Plus size={14} /> Novo Serviço / Lançamento Avulso
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: "var(--bg-main)", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>DATA</th>
                  <th style={{ padding: "10px" }}>TIPO</th>
                  <th style={{ padding: "10px" }}>DESCRIÇÃO DO SERVIÇO</th>
                  <th style={{ padding: "10px" }}>CATEGORIA</th>
                  <th style={{ padding: "10px" }}>VALOR</th>
                  <th style={{ padding: "10px" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px" }}>{t.date}</td>
                    <td style={{ padding: "10px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: t.tipo === "receita" ? "#ecfdf5" : "#fef2f2", color: t.tipo === "receita" ? "#047857" : "#dc2626" }}>
                        {t.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}><strong>{t.description}</strong></td>
                    <td style={{ padding: "10px", color: "var(--text-muted)" }}>{t.categoria || "Geral"}</td>
                    <td style={{ padding: "10px", fontWeight: "700", color: t.tipo === "receita" ? "#047857" : "var(--text-primary)" }}>R$ {t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: "10px" }}>{t.status.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. CONCILIAÇÃO BANCÁRIA & CENTRAL DE NOTAS FISCAIS            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === "conciliacao" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Sub Navigation Bar */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              className={`btn-tab ${ofxSubTab === "import" ? "active" : ""}`}
              onClick={() => setOfxSubTab("import")}
              style={{ padding: "10px 18px", borderRadius: "10px", border: ofxSubTab === "import" ? "none" : "1px solid var(--border)", backgroundColor: ofxSubTab === "import" ? "var(--accent)" : "var(--bg-card)", color: ofxSubTab === "import" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)" }}
            >
              <RefreshCw size={16} /> Importar OFX
            </button>
            <button 
              className={`btn-tab ${ofxSubTab === "history" ? "active" : ""}`}
              onClick={() => setOfxSubTab("history")}
              style={{ padding: "10px 18px", borderRadius: "10px", border: ofxSubTab === "history" ? "none" : "1px solid var(--border)", backgroundColor: ofxSubTab === "history" ? "var(--accent)" : "var(--bg-card)", color: ofxSubTab === "history" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)" }}
            >
              <FileText size={16} /> Histórico OFX
            </button>
            <button 
              className={`btn-tab ${ofxSubTab === "nfe" ? "active" : ""}`}
              onClick={() => setOfxSubTab("nfe")}
              style={{ padding: "10px 18px", borderRadius: "10px", border: ofxSubTab === "nfe" ? "none" : "1px solid var(--border)", backgroundColor: ofxSubTab === "nfe" ? "var(--accent)" : "var(--bg-card)", color: ofxSubTab === "nfe" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)" }}
            >
              <FileSpreadsheet size={16} /> Central de Notas Fiscais
            </button>
          </div>

          {/* Importar OFX Tab */}
          {ofxSubTab === "import" && (
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Importar Extrato Bancário OFX</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
                {/* Upload Box */}
                <div style={{ backgroundColor: "#fff9c4", border: "1px dashed #fbc02d", borderRadius: "12px", padding: "20px", color: "#574200" }}>
                  <p style={{ fontSize: "12px", fontWeight: "600" }}>Insira seu arquivo OFX no botão abaixo.</p>
                  
                  <div style={{ marginTop: "16px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Conta Bancária:</label>
                    <select 
                      value={ofxSelectedBank} 
                      onChange={e => setOfxSelectedBank(e.target.value)}
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "8px", marginBottom: "16px" }}
                    >
                      {bankAccounts.map(b => (
                        <option key={b.id} value={b.nome}>{b.nome}</option>
                      ))}
                    </select>

                    <button 
                      onClick={handleSimulateOFXUpload}
                      style={{ width: "100%", backgroundColor: "#00c853", color: "#fff", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                      <Upload size={18} /> Selecionar arquivo (OFX)
                    </button>
                  </div>
                </div>

                {/* Explanation text */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
                  <h4 style={{ fontSize: "20px", fontWeight: "800" }}>Importar extrato bancário OFX</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    A conciliação bancária através dos arquivos OFX reduz o trabalho de digitação de suas movimentações financeiras.
                    Entre no site do seu banco e salve seu extrato no formato OFX. Depois, basta importar para o sistema todas as suas movimentações.
                  </p>
                </div>
              </div>

              {/* Matched OFX Transactions Preview */}
              {ofxFileLoaded && (
                <div style={{ marginTop: "24px", borderTop: "2px solid var(--border)", paddingTop: "20px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>Resultado da Análise do Extrato OFX:</h4>
                  
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--bg-main)", borderBottom: "1px solid var(--border)" }}>
                        <th style={{ padding: "10px" }}>DATA OFX</th>
                        <th style={{ padding: "10px" }}>DESCRIÇÃO NO BANCO</th>
                        <th style={{ padding: "10px", textAlign: "right" }}>VALOR</th>
                        <th style={{ padding: "10px" }}>STATUS CONCILIAÇÃO</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ofxMatchedRows.map(row => (
                        <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px" }}>{row.data}</td>
                          <td style={{ padding: "10px" }}><strong>{row.memo}</strong></td>
                          <td style={{ padding: "10px", textAlign: "right", fontWeight: "800" }}>R$ {row.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "4px", backgroundColor: row.status === "matched" ? "#4caf50" : "#ff9800", color: "#fff", fontWeight: "700", fontSize: "10px" }}>
                              {row.status === "matched" ? "MATCH ENCONTRADO" : "PENDENTE REVISÃO"}
                            </span>
                          </td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <button className="btn-success btn-xs" onClick={() => alert("Transação conciliada e confirmada!")}>Conciliar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Histórico OFX Tab */}
          {ofxSubTab === "history" && (
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Histórico de Importações OFX</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-main)" }}>
                    <th style={{ padding: "12px" }}>DATA IMPORTAÇÃO</th>
                    <th style={{ padding: "12px" }}>CONTA / BANCO</th>
                    <th style={{ padding: "12px" }}>LANÇAMENTOS</th>
                    <th style={{ padding: "12px" }}>STATUS</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {ofxImportsHistory.map(h => (
                    <tr key={h.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px" }}>{h.dataImportacao}</td>
                      <td style={{ padding: "12px" }}><strong>{h.banco} ({h.conta})</strong></td>
                      <td style={{ padding: "12px" }}>{h.qtdLancamentos} lançamentos</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ backgroundColor: "#4caf50", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>
                          CONCILIADO
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button className="btn-secondary btn-xs" onClick={() => alert("Exibindo detalhes do extrato OFX...")}>Detalhes</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Central de Notas Fiscais Tab */}
          {ofxSubTab === "nfe" && (
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Gerencie Notas Fiscais (Área Central Integrada)</h3>
                <button className="btn-success" onClick={() => alert("Abrindo emissor central de Notas Fiscais...")} style={{ backgroundColor: "#00c853", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", border: "none" }}>
                  + Emitir Nota Fiscal
                </button>
              </div>

              {/* Table Controls */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                <select value={nfFilterType} onChange={e => setNfFilterType(e.target.value)} style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}>
                  <option value="all">Todos os tipos</option>
                  <option value="NF-e">NF-e</option>
                  <option value="NFS-e">NFS-e</option>
                  <option value="NFC-e">NFC-e</option>
                </select>

                <div style={{ flexGrow: 1 }}>
                  <input 
                    type="text" 
                    placeholder="Pesquisar por número, tomador, pedido..." 
                    value={nfSearchQuery} 
                    onChange={e => setNfSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                  />
                </div>
              </div>

              {/* NF Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-main)", borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: "12px" }}>TIPO</th>
                    <th style={{ padding: "12px" }}>EMPRESA</th>
                    <th style={{ padding: "12px" }}>NÚMERO</th>
                    <th style={{ padding: "12px" }}>NOSSO NÚMERO</th>
                    <th style={{ padding: "12px" }}>PEDIDO / OS</th>
                    <th style={{ padding: "12px" }}>TOMADOR</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>VALOR</th>
                    <th style={{ padding: "12px" }}>EMISSÃO</th>
                    <th style={{ padding: "12px" }}>SITUAÇÃO</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {centralNFeList.map(nf => (
                    <tr key={nf.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px" }}><span style={{ backgroundColor: "#eceff1", color: "#37474f", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>{nf.tipo}</span></td>
                      <td style={{ padding: "12px" }}>{nf.empresa}</td>
                      <td style={{ padding: "12px" }}><strong>{nf.numero}</strong></td>
                      <td style={{ padding: "12px" }}>{nf.nossoNumero || "-"}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ color: "#0099ff", fontWeight: "600" }}>{nf.pedido || nf.osVinculada || "OS-2026-01"}</span>
                      </td>
                      <td style={{ padding: "12px" }}>{nf.tomador}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "800" }}>R$ {nf.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "12px" }}>{nf.dataEmissao}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ backgroundColor: "#4caf50", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontWeight: "700", fontSize: "10px" }}>
                          {nf.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                          <button className="btn-secondary btn-xs" onClick={() => alert(`Download PDF ${nf.pdfAnexoNome}`)}>PDF</button>
                          <button className="btn-secondary btn-xs" onClick={() => alert(`Download XML ${nf.xmlAnexoNome}`)}>XML</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. RELATÓRIOS FINANCEIROS AVANÇADOS (LAYOUT COM MENU LATERAL)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === "relatorios" && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px" }}>
          
          {/* Accordion Side Menu */}
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            
            {/* Fluxo de Caixa Group */}
            <div style={{ backgroundColor: "#29b6f6", color: "#fff", padding: "8px 12px", borderRadius: "8px", fontWeight: "800", fontSize: "12px" }}>
              Fluxo de Caixa
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "6px" }}>
              <button onClick={() => setRelatorioSelectedTab("performance")} style={{ textAlign: "left", padding: "8px 10px", borderRadius: "6px", border: "none", backgroundColor: relatorioSelectedTab === "performance" ? "var(--bg-main)" : "transparent", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", fontWeight: relatorioSelectedTab === "performance" ? "700" : "400", display: "flex", alignItems: "center", gap: "8px" }}>
                <LayoutDashboard size={14} style={{ color: "var(--accent)" }} /> Performance Mensal
              </button>
              <button onClick={() => setRelatorioSelectedTab("extrato")} style={{ textAlign: "left", padding: "8px 10px", borderRadius: "6px", border: "none", backgroundColor: relatorioSelectedTab === "extrato" ? "var(--bg-main)" : "transparent", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", fontWeight: relatorioSelectedTab === "extrato" ? "700" : "400", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={14} style={{ color: "var(--accent)" }} /> Extrato
              </button>
              <button onClick={() => setRelatorioSelectedTab("fluxo_caixa")} style={{ textAlign: "left", padding: "8px 10px", borderRadius: "6px", border: "none", backgroundColor: relatorioSelectedTab === "fluxo_caixa" ? "var(--bg-main)" : "transparent", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", fontWeight: relatorioSelectedTab === "fluxo_caixa" ? "700" : "400", display: "flex", alignItems: "center", gap: "8px" }}>
                <ArrowLeftRight size={14} style={{ color: "var(--accent)" }} /> Fluxo de Caixa
              </button>
              <button onClick={() => setRelatorioSelectedTab("historico")} style={{ textAlign: "left", padding: "8px 10px", borderRadius: "6px", border: "none", backgroundColor: relatorioSelectedTab === "historico" ? "var(--bg-main)" : "transparent", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", fontWeight: relatorioSelectedTab === "historico" ? "700" : "400", display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart3 size={14} style={{ color: "var(--accent)" }} /> Histórico
              </button>
              <button onClick={() => setRelatorioSelectedTab("dre")} style={{ textAlign: "left", padding: "8px 10px", borderRadius: "6px", border: "none", backgroundColor: relatorioSelectedTab === "dre" ? "var(--bg-main)" : "transparent", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", fontWeight: relatorioSelectedTab === "dre" ? "700" : "400", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileSpreadsheet size={14} style={{ color: "var(--accent)" }} /> Demonstrativo (DRE)
              </button>
            </div>

            {/* Despesas Group */}
            <div style={{ backgroundColor: "#e53935", color: "#fff", padding: "8px 12px", borderRadius: "8px", fontWeight: "800", fontSize: "12px", marginTop: "10px" }}>
              Despesas
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "6px" }}>
              {([
                ["desp_descricao", "Por Descrição"],
                ["desp_dia", "Por Dia"],
                ["desp_tipo", "Por Tipo"],
                ["desp_categoria", "Por Categoria"],
                ["desp_evento", "Por Evento"],
                ["desp_etiqueta", "Por Etiquetas (Eventos)"],
                ["desp_custo", "Por Centro de Custo"],
                ["desp_tags", "Por Marcações (Tags)"],
                ["desp_historico", "Histórico"],
                ["pago_a", "Pago a..."],
              ] as [string, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setRelatorioSelectedTab(key)} style={{ textAlign: "left", padding: "6px 10px", borderRadius: "6px", border: "none", backgroundColor: relatorioSelectedTab === key ? "var(--bg-main)" : "transparent", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", fontWeight: relatorioSelectedTab === key ? "700" : "400", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#e53935", display: "inline-block" }}></span>
                  {label}
                </button>
              ))}
            </div>

            {/* Receitas Group */}
            <div style={{ backgroundColor: "#4caf50", color: "#fff", padding: "8px 12px", borderRadius: "8px", fontWeight: "800", fontSize: "12px", marginTop: "10px" }}>
              Receitas
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "6px" }}>
              {([
                ["rec_descricao", "Por Descrição"],
                ["rec_dia", "Por Dia"],
                ["rec_tipo", "Por Tipo"],
                ["rec_categoria", "Por Categoria"],
                ["rec_evento", "Por Evento"],
                ["rec_etiqueta", "Por Etiquetas (Eventos)"],
                ["rec_custo", "Por Centro de Custo"],
                ["rec_tags", "Por Marcações (Tags)"],
                ["rec_historico", "Histórico"],
                ["recebido_de", "Recebido de..."],
              ] as [string, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setRelatorioSelectedTab(key)} style={{ textAlign: "left", padding: "6px 10px", borderRadius: "6px", border: "none", backgroundColor: relatorioSelectedTab === key ? "var(--bg-main)" : "transparent", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", fontWeight: relatorioSelectedTab === key ? "700" : "400", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4caf50", display: "inline-block" }}></span>
                  {label}
                </button>
              ))}
            </div>

          </div>

          {/* Main Report View Content */}
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Top Filter Bar Header (Shared across ALL report categories) */}
            <div style={{
              backgroundColor: "var(--bg-main)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Data Inicial:</label>
                  <input 
                    type="date" 
                    value={reportStartDate} 
                    onChange={(e) => setReportStartDate(e.target.value)}
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      outline: "none"
                    }} 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Data Final:</label>
                  <input 
                    type="date" 
                    value={reportEndDate} 
                    onChange={(e) => setReportEndDate(e.target.value)}
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      outline: "none"
                    }} 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Status:</label>
                  <select 
                    value={reportStatusFilter} 
                    onChange={(e) => setReportStatusFilter(e.target.value)}
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      outline: "none"
                    }}
                  >
                    <option value="Pagos">Pagos</option>
                    <option value="Pendentes">Pendentes</option>
                    <option value="Todos">Todos os Status</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Conta:</label>
                  <select 
                    value={reportBankFilter} 
                    onChange={(e) => setReportBankFilter(e.target.value)}
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      outline: "none"
                    }}
                  >
                    <option value="Todas">Todas as Contas</option>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.nome}>{b.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button 
                  onClick={() => alert("Exportando dados em formato Excel (.xlsx)...")} 
                  style={{
                    backgroundColor: "#00bfa5",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <FileSpreadsheet size={14} /> Excel
                </button>
                <button 
                  onClick={() => window.print()} 
                  style={{
                    backgroundColor: "#00b0ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Download size={14} /> PDF
                </button>
              </div>
            </div>

            {/* Helper SVG Donut Chart Renderer */}
            {(() => {
              const drawDonut = (items: { label: string; value: number; color: string }[], chartTitle?: string) => {
                const total = items.reduce((s, d) => s + Math.abs(d.value), 0);
                if (total === 0) return null;

                let cumulativePercent = 0;
                const slices = items.map((item) => {
                  const percent = Math.abs(item.value) / total;
                  const startAngle = cumulativePercent * 2 * Math.PI;
                  cumulativePercent += percent;
                  const endAngle = cumulativePercent * 2 * Math.PI;

                  const innerR = 45;
                  const outerR = 85;
                  const cx = 100;
                  const cy = 100;

                  const x1_out = cx + outerR * Math.cos(startAngle - Math.PI / 2);
                  const y1_out = cy + outerR * Math.sin(startAngle - Math.PI / 2);
                  const x2_out = cx + outerR * Math.cos(endAngle - Math.PI / 2);
                  const y2_out = cy + outerR * Math.sin(endAngle - Math.PI / 2);

                  const x1_in = cx + innerR * Math.cos(endAngle - Math.PI / 2);
                  const y1_in = cy + innerR * Math.sin(endAngle - Math.PI / 2);
                  const x2_in = cx + innerR * Math.cos(startAngle - Math.PI / 2);
                  const y2_in = cy + innerR * Math.sin(startAngle - Math.PI / 2);

                  const largeArc = percent > 0.5 ? 1 : 0;

                  const pathData = percent >= 0.999
                    ? `M ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 1 1 ${cx - 0.01} ${cy - outerR} Z`
                    : `M ${x1_out} ${y1_out} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2_out} ${y2_out} L ${x1_in} ${y1_in} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2_in} ${y2_in} Z`;

                  return {
                    ...item,
                    percent: (percent * 100).toFixed(1),
                    pathData
                  };
                });

                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    {chartTitle && <div style={{ fontWeight: "800", fontSize: "15px", marginBottom: "16px", color: "var(--text-primary)" }}>{chartTitle}</div>}
                    <div style={{ position: "relative", width: "230px", height: "230px" }}>
                      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
                        {slices.map((slice, i) => (
                          <path key={i} d={slice.pathData} fill={slice.color} stroke="var(--bg-card)" strokeWidth="2.5" />
                        ))}
                        <circle cx="100" cy="100" r="44" fill="var(--bg-card)" />
                      </svg>
                      <div style={{
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                        textAlign: "center", pointerEvents: "none"
                      }}>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>TOTAL</span>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-primary)", display: "block" }}>
                          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                    {/* Legend / Callout List */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "center", marginTop: "18px", maxWidth: "550px" }}>
                      {slices.map((slice, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: slice.color, display: "inline-block" }}></span>
                          <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{slice.label}:</span>
                          <span style={{ fontWeight: "800" }}>{slice.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              };

              // Determine active view data
              let reportTitle = "Performance de Julho / 2026";
              let chartData: { label: string; value: number; color: string }[] = [];
              let isPerformanceView = false;

              if (relatorioSelectedTab === "performance") {
                isPerformanceView = true;
                reportTitle = "Performance Mensal (Análise MeEventos)";
              } else if (relatorioSelectedTab === "desp_tipo") {
                reportTitle = "Despesas por Tipo";
                chartData = [
                  { label: "Outras Despesas", value: 291287.09, color: "#29b6f6" },
                  { label: "Pessoas e Equipe", value: 6858.98, color: "#424242" },
                  { label: "Impostos", value: 8950.12, color: "#66bb6a" },
                  { label: "Despesas Fixas", value: 8450.00, color: "#ffa726" }
                ];
              } else if (relatorioSelectedTab === "desp_descricao") {
                reportTitle = "Despesas — Por Descrição";
                chartData = [
                  { label: "Madeira e MDF para Cenografia", value: 45000, color: "#29b6f6" },
                  { label: "Folha de Pagamento Montadores", value: 61191.60, color: "#e53935" },
                  { label: "Frete e Logística Carretas", value: 32000, color: "#ffa726" },
                  { label: "Diárias e Alimentação Staff", value: 18500, color: "#ab47bc" },
                  { label: "Outras Despesas Operacionais", value: 158854.59, color: "#78909c" }
                ];
              } else if (relatorioSelectedTab === "desp_dia") {
                reportTitle = "Despesas — Por Dia (Distribuição Semanal)";
                chartData = [
                  { label: "Semana 1 (01-07/07)", value: 75400, color: "#29b6f6" },
                  { label: "Semana 2 (08-14/07)", value: 92100, color: "#ab47bc" },
                  { label: "Semana 3 (15-21/07)", value: 88500, color: "#ffa726" },
                  { label: "Semana 4 (22-30/07)", value: 59546.19, color: "#e53935" }
                ];
              } else if (relatorioSelectedTab === "desp_categoria") {
                reportTitle = "Despesas — Por Categoria";
                chartData = [
                  { label: "Não Informado", value: 71904.09, color: "#29b6f6" },
                  { label: "Folha de Pagamento", value: 61191.60, color: "#424242" },
                  { label: "Empréstimos", value: 27435.97, color: "#66bb6a" },
                  { label: "Aquisição de bens", value: 24500.00, color: "#ffa726" },
                  { label: "Material | Comunicação visual", value: 18142.39, color: "#ec407a" },
                  { label: "Outras Categorias", value: 112372.14, color: "#ab47bc" }
                ];
              } else if (relatorioSelectedTab === "desp_evento") {
                reportTitle = "Despesas — Por Evento / Projeto";
                chartData = [
                  { label: "Mega Feira da Nazaria", value: 95400, color: "#29b6f6" },
                  { label: "Bienal do Livro SP 2026", value: 82000, color: "#ab47bc" },
                  { label: "Feicon Expo 2026", value: 65400, color: "#ffa726" },
                  { label: "Expocrato 2026", value: 42000, color: "#4caf50" },
                  { label: "Despesas Gerais de Sede", value: 30746.19, color: "#78909c" }
                ];
              } else if (relatorioSelectedTab === "desp_etiqueta") {
                reportTitle = "Despesas — Por Etiquetas (Eventos)";
                chartData = [
                  { label: "Confirmado / Em Produção", value: 145000, color: "#29b6f6" },
                  { label: "Em Montagem no Local", value: 98000, color: "#4caf50" },
                  { label: "Finalizado / Desmontagem", value: 42000, color: "#ffa726" },
                  { label: "Orçamento Aprovado", value: 30546.19, color: "#ab47bc" }
                ];
              } else if (relatorioSelectedTab === "desp_custo") {
                reportTitle = "Despesas — Por Centro de Custo";
                chartData = [
                  { label: "Estruturas e Marcenaria", value: 110400, color: "#29b6f6" },
                  { label: "Iluminação e Elétrica", value: 75000, color: "#ab47bc" },
                  { label: "Mobiliário Alugado", value: 54000, color: "#ffa726" },
                  { label: "Fretes e Logística", value: 42000, color: "#4caf50" },
                  { label: "Outros Centros de Custo", value: 34146.19, color: "#78909c" }
                ];
              } else if (relatorioSelectedTab === "desp_tags") {
                reportTitle = "Despesas — Por Marcações (Tags)";
                chartData = [
                  { label: "Urgente / Compra Direta", value: 88000, color: "#e53935" },
                  { label: "Recorrente Mensal", value: 105000, color: "#29b6f6" },
                  { label: "Evento São Paulo", value: 72000, color: "#ab47bc" },
                  { label: "Terceirizados Equipe", value: 50546.19, color: "#ffa726" }
                ];
              } else if (relatorioSelectedTab === "desp_historico") {
                reportTitle = "Despesas — Histórico Mensal (Evolução 2026)";
                chartData = [
                  { label: "Julho/26", value: 315546.19, color: "#e53935" },
                  { label: "Junho/26", value: 313848.29, color: "#ffa726" },
                  { label: "Maio/26", value: 228000.00, color: "#29b6f6" },
                  { label: "Abril/26", value: 195000.00, color: "#ab47bc" }
                ];
              } else if (relatorioSelectedTab === "pago_a") {
                reportTitle = "Despesas por Fornecedor (Pago a...)";
                chartData = [
                  { label: "BANCO SANTANDER (BRASIL) S.A.", value: 112200.00, color: "#29b6f6" },
                  { label: "ARMAZEM RIBEIRA DISTRIBUIDORA LTDA", value: 78500.00, color: "#424242" },
                  { label: "Comercial de Madeiras RN", value: 45000.00, color: "#66bb6a" },
                  { label: "Express Fretes e Transportes", value: 32000.00, color: "#ffa726" },
                  { label: "Outros Fornecedores", value: 47846.19, color: "#ab47bc" }
                ];
              } else if (relatorioSelectedTab === "rec_tipo") {
                reportTitle = "Receitas — Por Tipo (Forma de Recebimento)";
                chartData = [
                  { label: "Cobrança Bancária / Boleto", value: 183545.35, color: "#29b6f6" },
                  { label: "Pix Instantâneo", value: 56119.89, color: "#4caf50" },
                  { label: "Transferência TED / DOC", value: 13072.80, color: "#ab47bc" },
                  { label: "Cartão de Crédito", value: 17684.43, color: "#ffa726" }
                ];
              } else if (relatorioSelectedTab === "rec_descricao" || relatorioSelectedTab === "rec_categoria") {
                reportTitle = relatorioSelectedTab === "rec_descricao" ? "Receitas — Por Descrição" : "Receitas — Por Categoria";
                chartData = [
                  { label: "Cobrança", value: 183545.35, color: "#29b6f6" },
                  { label: "Não Informado", value: 56119.89, color: "#424242" },
                  { label: "Adiantamento", value: 13072.80, color: "#66bb6a" },
                  { label: "Empréstimo", value: 6265.71, color: "#ffa726" },
                  { label: "Transferência", value: 5550.00, color: "#ab47bc" }
                ];
              } else if (relatorioSelectedTab === "rec_evento") {
                reportTitle = "Receitas — Por Evento / Projeto";
                chartData = [
                  { label: "Mega Feira da Nazaria", value: 120000, color: "#4caf50" },
                  { label: "Bienal do Livro SP 2026", value: 85000, color: "#29b6f6" },
                  { label: "Feicon Expo 2026", value: 45422.47, color: "#ffa726" },
                  { label: "Outros Contratos", value: 20000, color: "#ab47bc" }
                ];
              } else if (relatorioSelectedTab === "rec_etiqueta") {
                reportTitle = "Receitas — Por Etiquetas (Eventos)";
                chartData = [
                  { label: "Confirmado / Faturado", value: 180000, color: "#4caf50" },
                  { label: "Em Execução", value: 65422.47, color: "#29b6f6" },
                  { label: "Sinal Pago", value: 25000, color: "#ffa726" }
                ];
              } else if (relatorioSelectedTab === "rec_custo") {
                reportTitle = "Receitas — Por Centro de Custo";
                chartData = [
                  { label: "Locação de Stands e Estruturas", value: 165000, color: "#4caf50" },
                  { label: "Cenografia Personalizada", value: 75422.47, color: "#29b6f6" },
                  { label: "Mobiliário e Iluminação", value: 30000, color: "#ab47bc" }
                ];
              } else if (relatorioSelectedTab === "rec_tags") {
                reportTitle = "Receitas — Por Marcações (Tags)";
                chartData = [
                  { label: "Cliente VIP / Recorrente", value: 150000, color: "#4caf50" },
                  { label: "Contrato Anual", value: 80000, color: "#29b6f6" },
                  { label: "Projeto Especial", value: 40422.47, color: "#ffa726" }
                ];
              } else if (relatorioSelectedTab === "rec_historico") {
                reportTitle = "Receitas — Histórico Mensal (Evolução 2026)";
                chartData = [
                  { label: "Julho/26", value: 270422.47, color: "#4caf50" },
                  { label: "Junho/26", value: 302891.39, color: "#29b6f6" },
                  { label: "Maio/26", value: 241000.00, color: "#ab47bc" },
                  { label: "Abril/26", value: 192000.00, color: "#ffa726" }
                ];
              } else if (relatorioSelectedTab === "recebido_de") {
                reportTitle = "Receitas por Cliente (Recebido de...)";
                chartData = [
                  { label: "NAZARIA DISTRIBUIDORA DE PRODUTOS FARMACEUTICOS", value: 133600.00, color: "#4caf50" },
                  { label: "AMANDA ROCHA EVENTOS", value: 66850.00, color: "#29b6f6" },
                  { label: "Alexandro T. Gomes", value: 42072.80, color: "#ab47bc" },
                  { label: "Outros Clientes", value: 27899.67, color: "#ffa726" }
                ];
              } else if (relatorioSelectedTab === "extrato") {
                reportTitle = "Extrato de Movimentações Bancárias";
                chartData = [
                  { label: "077 - INTER", value: 119417.64, color: "#ff9800" },
                  { label: "ITAÚ", value: 66384.38, color: "#0288d1" },
                  { label: "SANTANDER", value: 147608.98, color: "#e53935" }
                ];
              } else if (relatorioSelectedTab === "fluxo_caixa") {
                reportTitle = "Fluxo de Caixa Consolidado";
                chartData = [
                  { label: "Total Receitas Entradas", value: 270422.47, color: "#4caf50" },
                  { label: "Total Despesas Saídas", value: 315546.19, color: "#e53935" }
                ];
              } else if (relatorioSelectedTab === "historico") {
                reportTitle = "Histórico Financeiro Geral";
                chartData = [
                  { label: "Receitas Semestre", value: 1316313.86, color: "#4caf50" },
                  { label: "Despesas Semestre", value: 1365394.48, color: "#e53935" }
                ];
              } else if (relatorioSelectedTab === "dre") {
                reportTitle = "Demonstrativo de Resultado do Exercício (DRE)";
                chartData = [
                  { label: "Receita Líquida", value: 269697.83, color: "#4caf50" },
                  { label: "Despesas Operacionais", value: 26435.45, color: "#e53935" },
                  { label: "Custos Operacionais", value: 7758.27, color: "#ffa726" },
                  { label: "Deduções / Impostos", value: 724.64, color: "#ab47bc" }
                ];
              } else {
                reportTitle = `Relatório — ${relatorioSelectedTab}`;
                chartData = [
                  { label: "Total Registrado", value: 150000, color: "#29b6f6" },
                  { label: "Outros Lançamentos", value: 50000, color: "#ffa726" }
                ];
              }

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "800" }}>{reportTitle}</h3>

                  {/* DONUT CHART SECTION */}
                  {isPerformanceView ? (
                    <div style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>Distribuição por Categoria</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        {drawDonut([
                          { label: "Cobrança", value: 183545.35, color: "#29b6f6" },
                          { label: "Não Informado", value: 56119.89, color: "#424242" },
                          { label: "Adiantamento", value: 13072.80, color: "#66bb6a" },
                          { label: "Empréstimo", value: 6265.71, color: "#ffa726" },
                          { label: "Transferencia", value: 5550.00, color: "#ab47bc" }
                        ], "Receitas")}

                        {drawDonut([
                          { label: "Não Informado", value: 71904.09, color: "#29b6f6" },
                          { label: "Folha de Pagamento", value: 61191.60, color: "#424242" },
                          { label: "Empréstimos", value: 27435.97, color: "#66bb6a" },
                          { label: "Aquisição de bens", value: 24500.00, color: "#ffa726" },
                          { label: "Material | Comunicação visual", value: 18142.39, color: "#ec407a" }
                        ], "Despesas")}
                      </div>
                    </div>
                  ) : (
                    <div style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", display: "flex", justifyContent: "center", backgroundColor: "var(--bg-main)" }}>
                      {drawDonut(chartData, `Distribuição — ${reportTitle}`)}
                    </div>
                  )}

                  {/* ANÁLISE DETALHADA / RELATÓRIO CORRIDO */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={16} /> Análise Detalhada por Tipo
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "var(--bg-main)", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                          <th style={{ padding: "10px", textAlign: "left" }}>NATUREZA</th>
                          <th style={{ padding: "10px", textAlign: "right" }}>JULHO</th>
                          <th style={{ padding: "10px", textAlign: "right" }}>JUNHO</th>
                          <th style={{ padding: "10px", textAlign: "right" }}>DIFERENÇA</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>VARIAÇÃO</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: "#e8f5e9", fontWeight: "800" }}>
                          <td style={{ padding: "10px", color: "#2e7d32" }}>+ RECEITAS</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#2e7d32" }}>R$ 270.422,47</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "var(--text-muted)" }}>R$ 302.891,39</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#e53935" }}>R$ -32.468,92</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <span style={{ backgroundColor: "#ffcdd2", color: "#b71c1c", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
                              ↓ -10,7%
                            </span>
                          </td>
                        </tr>

                        <tr style={{ fontWeight: "800", backgroundColor: "var(--bg-main)" }}>
                          <td colSpan={5} style={{ padding: "8px 10px", color: "var(--text-primary)" }}>— DESPESAS POR TIPO</td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px" }}>Outras Despesas</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#e53935", fontWeight: "700" }}>-R$ 291.287,09</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "var(--text-muted)" }}>-R$ 297.741,65</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#2e7d32", fontWeight: "700" }}>R$ -6.454,56</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <span style={{ backgroundColor: "#c8e6c9", color: "#1b5e20", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
                              ↓ -2,2%
                            </span>
                          </td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px" }}>Impostos</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#e53935", fontWeight: "700" }}>-R$ 8.950,12</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "var(--text-muted)" }}>-R$ 5.308,13</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#e53935", fontWeight: "700" }}>+R$ 3.641,99</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <span style={{ backgroundColor: "#ffcdd2", color: "#b71c1c", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
                              ↑ +68,6%
                            </span>
                          </td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px" }}>Despesas Fixas</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#e53935", fontWeight: "700" }}>-R$ 8.450,00</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "var(--text-muted)" }}>-R$ 2.450,00</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#e53935", fontWeight: "700" }}>+R$ 6.000,00</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <span style={{ backgroundColor: "#ffcdd2", color: "#b71c1c", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
                              ↑ +244,9%
                            </span>
                          </td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px" }}>Pessoas e Equipe</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#e53935", fontWeight: "700" }}>-R$ 6.858,98</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "var(--text-muted)" }}>-R$ 8.348,51</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#2e7d32", fontWeight: "700" }}>R$ -1.489,53</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <span style={{ backgroundColor: "#c8e6c9", color: "#1b5e20", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
                              ↓ -17,8%
                            </span>
                          </td>
                        </tr>

                        <tr style={{ backgroundColor: "#ffebee", fontWeight: "800" }}>
                          <td style={{ padding: "10px", color: "#c62828" }}>Total de Despesas</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#c62828" }}>-R$ 315.546,19</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "var(--text-muted)" }}>-R$ 313.848,29</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#e53935" }}>+R$ 1.697,90</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <span style={{ backgroundColor: "#ffcdd2", color: "#b71c1c", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
                              ↑ +0,5%
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* TABELA DE LANÇAMENTOS CORRIDOS DETALHADOS */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><FileText size={16} /> Relatório Corrido de Lançamentos ({reportTitle})</span>
                      <span style={{ fontSize: "11px", backgroundColor: "var(--bg-main)", padding: "4px 10px", borderRadius: "12px", color: "var(--text-muted)" }}>
                        Período: {reportStartDate} até {reportEndDate}
                      </span>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "var(--bg-main)", borderBottom: "2px solid var(--border)" }}>
                          <th style={{ padding: "8px", textAlign: "left" }}>TIPO / ITEM</th>
                          <th style={{ padding: "8px", textAlign: "center" }}>STATUS</th>
                          <th style={{ padding: "8px", textAlign: "center" }}>LANÇAMENTOS</th>
                          <th style={{ padding: "8px", textAlign: "right" }}>VALOR TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((item, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "10px", fontWeight: "700" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: item.color, display: "inline-block", marginRight: "8px" }}></span>
                              {item.label}
                            </td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              <span style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "700" }}>
                                {reportStatusFilter}
                              </span>
                            </td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              <span style={{ backgroundColor: "var(--bg-main)", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                                ({Math.floor(Math.abs(item.value) / 3500) + 1} lançamentos)
                              </span>
                            </td>
                            <td style={{ padding: "10px", textAlign: "right", fontWeight: "800", color: relatorioSelectedTab.startsWith("rec") || relatorioSelectedTab === "recebido_de" ? "#4caf50" : "#e53935" }}>
                              {relatorioSelectedTab.startsWith("rec") || relatorioSelectedTab === "recebido_de" ? "" : "-"}R$ {Math.abs(item.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. CONFIGURAÇÕES FINANCEIRAS (CADASTROS-BASE DINÂMICOS)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === "configuracoes" && (
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Configurações Financeiras</h3>
          
          {/* Sub-tabs header for Configs */}
          <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "14px", overflowX: "auto", marginBottom: "20px" }}>
            <button className={`btn-tab ${configActiveTab === "contas" ? "active" : ""}`} onClick={() => setConfigActiveTab("contas")} style={{ padding: "10px 18px", borderRadius: "10px", border: configActiveTab === "contas" ? "none" : "1px solid var(--border)", backgroundColor: configActiveTab === "contas" ? "var(--accent)" : "var(--bg-card)", color: configActiveTab === "contas" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)", whiteSpace: "nowrap" }}>
              <Wallet size={16} /> Contas Bancárias
            </button>
            <button className={`btn-tab ${configActiveTab === "cartoes" ? "active" : ""}`} onClick={() => setConfigActiveTab("cartoes")} style={{ padding: "10px 18px", borderRadius: "10px", border: configActiveTab === "cartoes" ? "none" : "1px solid var(--border)", backgroundColor: configActiveTab === "cartoes" ? "var(--accent)" : "var(--bg-card)", color: configActiveTab === "cartoes" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)", whiteSpace: "nowrap" }}>
              <CreditCardIcon size={16} /> Cartões de Créditos
            </button>
            <button className={`btn-tab ${configActiveTab === "categorias" ? "active" : ""}`} onClick={() => setConfigActiveTab("categorias")} style={{ padding: "10px 18px", borderRadius: "10px", border: configActiveTab === "categorias" ? "none" : "1px solid var(--border)", backgroundColor: configActiveTab === "categorias" ? "var(--accent)" : "var(--bg-card)", color: configActiveTab === "categorias" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)", whiteSpace: "nowrap" }}>
              <Tag size={16} /> Categorias
            </button>
            <button className={`btn-tab ${configActiveTab === "centro_custo" ? "active" : ""}`} onClick={() => setConfigActiveTab("centro_custo")} style={{ padding: "10px 18px", borderRadius: "10px", border: configActiveTab === "centro_custo" ? "none" : "1px solid var(--border)", backgroundColor: configActiveTab === "centro_custo" ? "var(--accent)" : "var(--bg-card)", color: configActiveTab === "centro_custo" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)", whiteSpace: "nowrap" }}>
              <Layers size={16} /> Centro de Custo
            </button>
            <button className={`btn-tab ${configActiveTab === "modo_pagamento" ? "active" : ""}`} onClick={() => setConfigActiveTab("modo_pagamento")} style={{ padding: "10px 18px", borderRadius: "10px", border: configActiveTab === "modo_pagamento" ? "none" : "1px solid var(--border)", backgroundColor: configActiveTab === "modo_pagamento" ? "var(--accent)" : "var(--bg-card)", color: configActiveTab === "modo_pagamento" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)", whiteSpace: "nowrap" }}>
              <DollarSign size={16} /> Modo de Pagamento
            </button>
            <button className={`btn-tab ${configActiveTab === "recebido_pago" ? "active" : ""}`} onClick={() => setConfigActiveTab("recebido_pago")} style={{ padding: "10px 18px", borderRadius: "10px", border: configActiveTab === "recebido_pago" ? "none" : "1px solid var(--border)", backgroundColor: configActiveTab === "recebido_pago" ? "var(--accent)" : "var(--bg-card)", color: configActiveTab === "recebido_pago" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)", whiteSpace: "nowrap" }}>
              <ArrowLeftRight size={16} /> Recebido De/Pago De
            </button>
            <button className={`btn-tab ${configActiveTab === "tags" ? "active" : ""}`} onClick={() => setConfigActiveTab("tags")} style={{ padding: "10px 18px", borderRadius: "10px", border: configActiveTab === "tags" ? "none" : "1px solid var(--border)", backgroundColor: configActiveTab === "tags" ? "var(--accent)" : "var(--bg-card)", color: configActiveTab === "tags" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)", whiteSpace: "nowrap" }}>
              <Tag size={16} /> Tags
            </button>
            <button className={`btn-tab ${configActiveTab === "dre" ? "active" : ""}`} onClick={() => setConfigActiveTab("dre")} style={{ padding: "10px 18px", borderRadius: "10px", border: configActiveTab === "dre" ? "none" : "1px solid var(--border)", backgroundColor: configActiveTab === "dre" ? "var(--accent)" : "var(--bg-card)", color: configActiveTab === "dre" ? "#fff" : "var(--text-primary)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-sm)", whiteSpace: "nowrap" }}>
              <BarChart3 size={16} /> DRE / SPED
            </button>
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button className="btn-success" onClick={() => setConfigModalOpen(true)} style={{ backgroundColor: "#00c853", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", border: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={14} /> Adicionar Item
            </button>
            <button className="btn-secondary" onClick={() => window.print()} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Printer size={14} /> Imprimir
            </button>
          </div>

          {/* Table List rendering based on selected config tab */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-main)", borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "12px" }}>NOME</th>
                {configActiveTab === "contas" && <th style={{ padding: "12px" }}>TIPO</th>}
                {configActiveTab === "contas" && <th style={{ padding: "12px", textAlign: "right" }}>SALDO INICIAL</th>}
                {configActiveTab === "contas" && <th style={{ padding: "12px", textAlign: "right" }}>SALDO ATUAL</th>}
                {configActiveTab === "cartoes" && <th style={{ padding: "12px", textAlign: "right" }}>LIMITE</th>}
                {configActiveTab === "categorias" && <th style={{ padding: "12px" }}>NATUREZA</th>}
                {configActiveTab === "categorias" && <th style={{ padding: "12px" }}>GRUPO DRE</th>}
                {configActiveTab === "centro_custo" && <th style={{ padding: "12px" }}>CLASSIFICAÇÃO</th>}
                {configActiveTab === "tags" && <th style={{ padding: "12px" }}>TIPO</th>}
                {configActiveTab === "dre" && <th style={{ padding: "12px" }}>NATUREZA DRE</th>}
                <th style={{ padding: "12px", textAlign: "center" }}>FUNÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {configActiveTab === "contas" && bankAccounts.map(b => (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}><strong>{b.nome}</strong></td>
                  <td style={{ padding: "12px" }}>{b.tipo}</td>
                  <td style={{ padding: "12px", textAlign: "right", color: b.saldoInicial < 0 ? "#ff3d00" : "inherit" }}>R$ {b.saldoInicial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "800", color: b.saldoAtual < 0 ? "#ff3d00" : "#00c853" }}>R$ {b.saldoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button className="btn-secondary btn-xs" style={{ backgroundColor: "#ffc107", color: "#fff", border: "none", marginRight: "4px" }}>Editar</button>
                    <button className="btn-danger btn-xs" onClick={() => setBankAccounts(bankAccounts.filter(x => x.id !== b.id))}>Excluir</button>
                  </td>
                </tr>
              ))}

              {configActiveTab === "cartoes" && creditCards.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}><strong>{c.nome}</strong></td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "700" }}>R$ {c.limite.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button className="btn-secondary btn-xs" style={{ backgroundColor: "#ffc107", color: "#fff", border: "none", marginRight: "4px" }}>Editar</button>
                    <button className="btn-danger btn-xs" onClick={() => setCreditCards(creditCards.filter(x => x.id !== c.id))}>Excluir</button>
                  </td>
                </tr>
              ))}

              {configActiveTab === "categorias" && categories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}><strong>{cat.nome}</strong></td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ color: cat.natureza === "receita" ? "#00c853" : "#ff3d00", fontWeight: "700" }}>{cat.natureza.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "12px" }}>{cat.grupoDRE || "-"}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button className="btn-secondary btn-xs" style={{ backgroundColor: "#ffc107", color: "#fff", border: "none", marginRight: "4px" }}>Editar</button>
                    <button className="btn-danger btn-xs" onClick={() => setCategories(categories.filter(x => x.id !== cat.id))}>Excluir</button>
                  </td>
                </tr>
              ))}

              {configActiveTab === "centro_custo" && costCenters.map(cc => (
                <tr key={cc.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}><strong>{cc.nome}</strong></td>
                  <td style={{ padding: "12px" }}>{cc.classificacao || "Geral"}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button className="btn-secondary btn-xs" style={{ backgroundColor: "#ffc107", color: "#fff", border: "none", marginRight: "4px" }}>Editar</button>
                    <button className="btn-danger btn-xs" onClick={() => setCostCenters(costCenters.filter(x => x.id !== cc.id))}>Excluir</button>
                  </td>
                </tr>
              ))}

              {configActiveTab === "modo_pagamento" && paymentModes.map(pm => (
                <tr key={pm.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}><strong>{pm.nome}</strong></td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button className="btn-secondary btn-xs" style={{ backgroundColor: "#ffc107", color: "#fff", border: "none", marginRight: "4px" }}>Editar</button>
                    <button className="btn-danger btn-xs" onClick={() => setPaymentModes(paymentModes.filter(x => x.id !== pm.id))}>Excluir</button>
                  </td>
                </tr>
              ))}

              {configActiveTab === "recebido_pago" && contacts.map(cnt => (
                <tr key={cnt.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}><strong>{cnt.nome}</strong></td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button className="btn-secondary btn-xs" style={{ backgroundColor: "#ffc107", color: "#fff", border: "none", marginRight: "4px" }}>Editar</button>
                    <button className="btn-danger btn-xs" onClick={() => setContacts(contacts.filter(x => x.id !== cnt.id))}>Excluir</button>
                  </td>
                </tr>
              ))}

              {configActiveTab === "tags" && tags.map(tg => (
                <tr key={tg.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}><strong>{tg.nome}</strong></td>
                  <td style={{ padding: "12px" }}>{tg.tipo}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button className="btn-secondary btn-xs" style={{ backgroundColor: "#ffc107", color: "#fff", border: "none", marginRight: "4px" }}>Editar</button>
                    <button className="btn-danger btn-xs" onClick={() => setTags(tags.filter(x => x.id !== tg.id))}>Excluir</button>
                  </td>
                </tr>
              ))}

              {configActiveTab === "dre" && dreConfigs.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}><strong>{d.nome}</strong></td>
                  <td style={{ padding: "12px" }}>{d.natureza}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button className="btn-secondary btn-xs" style={{ backgroundColor: "#ffc107", color: "#fff", border: "none", marginRight: "4px" }}>Editar</button>
                    <button className="btn-danger btn-xs" onClick={() => setDreConfigs(dreConfigs.filter(x => x.id !== d.id))}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: TRANSFERÊNCIA ENTRE CONTAS                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isTransferModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", width: "550px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            <div style={{ backgroundColor: "#29b6f6", color: "#fff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "800", fontSize: "16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><ArrowLeftRight size={18} /> Transferência</span>
              <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }} onClick={() => setIsTransferModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleExecuteTransfer} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "#e1f5fe", border: "1px solid #b3e5fc", padding: "12px", borderRadius: "8px", color: "#01579b", fontSize: "12px" }}>
                <strong>Atenção!</strong> A conta de Origem não pode ser a mesma de Destino.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Data da Transferência:</label>
                  <input type="date" value={trfData} onChange={e => setTrfData(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} required />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Valor (R$):</label>
                  <input type="number" step="0.01" value={trfValor} onChange={e => setTrfValor(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} required />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Conta Origem:</label>
                  <select value={trfOrigem} onChange={e => setTrfOrigem(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Conta Destino:</label>
                  <select value={trfDestino} onChange={e => setTrfDestino(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsTransferModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-success" style={{ backgroundColor: "#00c853", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "8px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ArrowLeftRight size={14} /> Transferir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB: CAIXINHA DE OBRA (PRESTAÇÃO DE CONTAS EM ESPÉCIE)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === ("caixinha_obra" as any) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card)", padding: "20px 24px", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Wallet size={20} style={{ color: "var(--accent)" }} /> Caixinha de Obra &amp; Adiantamentos de Montagem
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Gestão e prestação de contas de dinheiro em espécie entregue aos montadores no campo por evento.
              </p>
            </div>

            <button 
              className="btn-primary" 
              onClick={() => {
                const adv = prompt("Informe o nome do evento para adiantamento:");
                if (adv) {
                  alert(`Caixinha de obra aberta com sucesso para o evento "${adv}".`);
                }
              }}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "10px 18px", fontWeight: "700" }}
            >
              <Plus size={16} /> Novo Adiantamento de Obra
            </button>
          </div>

          {/* Cards & Summary Table */}
          <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border)", padding: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>Prestação de Contas Ativa por Evento</h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  id: "cx-1",
                  eventoNome: "Congresso de Odontologia 2026 (Expo Center Norte)",
                  responsavel: "Carlos Eduardo (Líder da Montagem)",
                  data: "15/07/2026",
                  adiantado: 2500,
                  gasto: 950,
                  saldo: 1550,
                  status: "Prestado / Em Análise",
                  comprovantes: [
                    { desc: "Abastecimento Diesel Caminhão Baú", cat: "Combustível", valor: 450, data: "15/07/2026" },
                    { desc: "Refeição da Equipe em Campo (6 montadores)", cat: "Alimentação", valor: 320, data: "16/07/2026" },
                    { desc: "Parafusos Extras & Fita Dupla Face 3M", cat: "Insumos", valor: 180, data: "16/07/2026" }
                  ]
                },
                {
                  id: "cx-2",
                  eventoNome: "Bienal do Livro SP 2026 (Anhembi)",
                  responsavel: "Marcos Andrade (Coordenador Cenográfico)",
                  data: "20/07/2026",
                  adiantado: 4000,
                  gasto: 2800,
                  saldo: 1200,
                  status: "Aberto em Campo",
                  comprovantes: [
                    { desc: "Pedágio Carreta Anhembi (Ida e Volta)", cat: "Pedágio", valor: 380, data: "20/07/2026" },
                    { desc: "Jantar Tático Montagem Noturna", cat: "Alimentação", valor: 620, data: "21/07/2026" },
                    { desc: "Locação Gerador Emergência 15kVA", cat: "Equipamento", valor: 1800, data: "21/07/2026" }
                  ]
                }
              ].map(item => (
                <div key={item.id} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", backgroundColor: "var(--bg-main)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--accent)", margin: 0 }}>{item.eventoNome}</h4>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Responsável em Campo: <strong>{item.responsavel}</strong> &bull; Data: {item.data}</span>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "12px", backgroundColor: item.status.includes("Aberto") ? "#fef3c7" : "#d1fae5", color: item.status.includes("Aberto") ? "#b45309" : "#065f46" }}>
                      {item.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px", fontSize: "12px" }}>
                    <div style={{ backgroundColor: "var(--bg-card)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>TOTAL ADIANTADO</span>
                      <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>R$ {item.adiantado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div style={{ backgroundColor: "var(--bg-card)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>GASTO COMPROVADO</span>
                      <strong style={{ fontSize: "14px", color: "#dc2626" }}>R$ {item.gasto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div style={{ backgroundColor: "var(--bg-card)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>SALDO A DEVOLVER/REEMBOLSAR</span>
                      <strong style={{ fontSize: "14px", color: "#059669" }}>R$ {item.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>

                  {/* Comprovantes detalhados */}
                  <strong style={{ fontSize: "11px", color: "var(--text-primary)", display: "block", marginBottom: "8px" }}>COMPROVANTES E NOTAS LANÇADAS DA OBRA:</strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {item.comprovantes.map((c, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card)", padding: "8px 12px", borderRadius: "6px", fontSize: "11px", border: "1px solid var(--border)" }}>
                        <div>
                          <strong style={{ color: "var(--text-primary)" }}>{c.desc}</strong>
                          <span style={{ color: "var(--text-muted)", marginLeft: "8px" }}>[{c.cat}] &bull; {c.data}</span>
                        </div>
                        <span style={{ fontWeight: "700", color: "#dc2626" }}>- R$ {c.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: NOVO ITEM CONFIGURAÇÃO                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {configModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", width: "450px", overflow: "hidden", padding: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>Adicionar em {configActiveTab.toUpperCase()}</h3>
            
            <form onSubmit={handleAddConfigurationItem} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Nome:</label>
                <input type="text" value={configInputName} onChange={e => setConfigInputName(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} required />
              </div>

              {configActiveTab === "contas" && (
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Saldo Inicial (R$):</label>
                  <input type="number" step="0.01" value={configInputExtra2} onChange={e => setConfigInputExtra2(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              )}

              {configActiveTab === "cartoes" && (
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>Limite de Crédito (R$):</label>
                  <input type="number" step="0.01" value={configInputExtra1} onChange={e => setConfigInputExtra1(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px" }} />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setConfigModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-success" style={{ backgroundColor: "#00c853", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "8px", fontWeight: "800" }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
