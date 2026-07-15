import { useState } from "react";
import { 
  LayoutDashboard, Briefcase, Archive, Users, LogOut, 
  Building2, DollarSign, Truck, Bot, Shield 
} from "lucide-react";
import "./Dashboard.css";

// Import our custom subcomponents
import Overview from "./components/Overview";
import KanbanBoards from "./components/KanbanBoards";
import WmsModule from "./components/WmsModule";
import Employees from "./components/Employees";
import EventDetailsModal from "./components/EventDetailsModal";
import CRM from "./components/CRM";
import Financial from "./components/Financial";
import Logistics from "./components/Logistics";
import IAAssistant from "./components/IAAssistant";
import Auditoria from "./components/Auditoria";

// Import shared types
import type { 
  Project, Employee, WarehouseItem, InvoiceLog, 
  LeadCRM, VeiculoLogistica, AuditoriaLog 
} from "./types";

// ── Initial Mock Data 2.0 (Seed Completo) ──

const INITIAL_CLIENTS = [
  { name: "Volkswagen do Brasil Ltda", email: "compras@volkswagen.com.br", cnpj: "59.104.273/0001-29" },
  { name: "Ambev S/A", email: "marketing@ambev.com.br", cnpj: "07.526.557/0001-00" },
  { name: "Petróleo Brasileiro S.A.", email: "stands@petrobras.com.br", cnpj: "33.000.167/0001-01" },
  { name: "Natura & Co", email: "eventos@natura.net", cnpj: "12.890.312/0002-45" },
  { name: "Samsung Eletrônica da Amazônia", email: "b2b.stands@samsung.com", cnpj: "00.234.908/0003-89" }
];

const INITIAL_SUPPLIERS = [
  { name: "Comercial de Madeiras RN", email: "vendas@madeirasrn.com.br", servico: "Madeira e MDF" },
  { name: "Eletro Ferragens Natal", email: "comercial@eletroferragens.com", servico: "Iluminação e Materiais Elétricos" },
  { name: "Móveis Eventos Express", email: "aluguel@moveisexpress.com.br", servico: "Locação de Mobiliário" },
  { name: "Fretes & Carretos Rápidos", email: "fretes@carretosrapidos.com", servico: "Logística e Fretes" }
];

const INITIAL_LEADS: LeadCRM[] = [
  { id: "lead-1", empresa: "Natura & Co", contato: "Mariana Souza", cargo: "Gerente de Marketing", email: "mariana.souza@natura.net", telefone: "(11) 98765-4321", valorEstimado: 120000.00, origem: "Site / Google", estagio: "negociacao", dataCriacao: "2026-07-10", observacoes: "Interessada em stand ecológico feito de madeira reflorestada para a Hospitalar Expo." },
  { id: "lead-2", empresa: "Samsung Eletrônica", contato: "Joon-woo Park", cargo: "Diretor Comercial", email: "j.park@samsung.com", telefone: "(11) 91234-5678", valorEstimado: 250000.00, origem: "Indicação", estagio: "prospect", dataCriacao: "2026-07-12", observacoes: "Necessita de fachada com painel de LED integrado." },
  { id: "lead-3", empresa: "Volkswagen do Brasil", contato: "Roberto Silveira", cargo: "Coordenador de Feiras", email: "roberto.silveira@volkswagen.com.br", telefone: "(11) 99876-0012", valorEstimado: 180000.00, origem: "Instagram", estagio: "fechado", dataCriacao: "2026-07-08", observacoes: "Contrato assinado para a Feicon 2026." }
];

const INITIAL_VEHICLES: VeiculoLogistica[] = [
  { id: "v-1", modelo: "Mercedes-Benz Sprinter Cargo", placa: "QYI-8D29", kmAtual: 82450, motoristaAtivo: "José Alves de Oliveira", status: "em_viagem", combustivelCard: true },
  { id: "v-2", modelo: "Ford Cargo 816 (Caminhão)", placa: "OXK-4910", kmAtual: 145200, motoristaAtivo: "Carlos Henrique Lima", status: "em_viagem", combustivelCard: true },
  { id: "v-3", modelo: "Fiat Fiorino 1.4 Hard Working", placa: "PNG-3312", kmAtual: 34100, motoristaAtivo: "", status: "disponivel", combustivelCard: false }
];

const INITIAL_EVENTS: Project[] = [
  {
    id: "evt-1",
    codigo: "EST-2026-001",
    name: "Estande Nestlé - Bienal do Livro 2026",
    client: "Nestlé S/A",
    responsavel: "Ricardo Mendes Alves",
    phase: "during",
    startDate: "2026-07-20",
    endDate: "2026-07-28",
    dataMontagem: "2026-07-18",
    dataDesmontagem: "2026-07-29",
    completionRate: 60,
    checklist: [
      { id: "c1", text: "Avaliar plantas e projeto técnico do estande", done: true },
      { id: "c2", text: "Subir contrato comercial assinado", done: true },
      { id: "c3", text: "Alinhar e conferir logomarcas da marca", done: true },
      { id: "c4", text: "Comprar materiais para construção (mdf, caibros, tintas)", done: false },
      { id: "c5", text: "Pagar taxas e emitir ART/RRT de montagem", done: true },
      { id: "c6", text: "Escalar funcionários e enviar RG/CPF de todos", done: false },
      { id: "c7", text: "Organizar passagens aéreas e hotel da equipe", done: false },
      { id: "c8", text: "Conseguir termo de liberação assinado da organização", done: false }
    ],
    assignedEmployees: [
      { id: "emp-1", name: "José Alves de Oliveira", role: "Montador de Estande", documentStatus: "complete" },
      { id: "emp-2", name: "Carlos Henrique Lima", role: "Carpinteiro Montador", documentStatus: "complete" }
    ],
    assignedTools: [
      { id: "item-1", name: "Furadeira de Impacto Bosch", type: "tool", allocatedQty: 2 },
      { id: "item-2", name: "Serra Circular Dewalt", type: "tool", allocatedQty: 1 }
    ],
    hotelName: "Ibis Budget Center Paulista",
    hotelCheckin: "2026-07-19",
    flightDetails: "Latam LA3140 - NAT -> GRU (Conf: XPT991) - João e Carlos",
    docs: [
      { id: "d1", name: "Contrato de Prestação de Serviços", status: "approved" },
      { id: "d2", name: "ART/RRT de Responsabilidade Técnica", status: "uploaded" },
      { id: "d3", name: "Termo de Liberação Oficial do Pavilhão", status: "pending" }
    ],
    
    // JC Eventos 2.0 financial metrics
    valorContratado: 120000.00,
    valorRecebido: 80000.00,
    valorPendente: 40000.00,
    custoPrevisto: 45000.00,
    custoRealizado: 34500.00,
    centroCusto: {
      madeiraMdf: 15500.00,
      vidrosVidraçaria: 3200.00,
      iluminacaoEletrica: 4500.00,
      mobiliarioAlugado: 2400.00,
      fretes: 3100.00,
      combustivelPedagios: 1200.00,
      hospedagemPassagens: 2400.00,
      equipePropria: 1200.00,
      terceirizados: 1000.00,
      taxasOrganizador: 0
    },
    mapsRoute: {
      endereco: "Distrito Anhembi, Av. Olavo Fontoura, 1209 - Santana, São Paulo - SP",
      latitude: -23.514781,
      longitude: -46.643212,
      linkMaps: "https://maps.app.goo.gl/Anhembi",
      distanciaKm: 42.5,
      tempoEstimado: "45 min"
    }
  },
  {
    id: "evt-2",
    codigo: "EST-2026-002",
    name: "Estande Heineken - Feira APAS 2026",
    client: "Cervejaria Heineken",
    responsavel: "Ricardo Mendes Alves",
    phase: "no_event",
    startDate: "2026-08-05",
    endDate: "2026-08-10",
    dataMontagem: "2026-08-02",
    dataDesmontagem: "2026-08-11",
    completionRate: 25,
    checklist: [
      { id: "c1", text: "Avaliar plantas e projeto técnico do estande", done: true },
      { id: "c2", text: "Subir contrato comercial assinado", done: true },
      { id: "c3", text: "Alinhar e conferir logomarcas da marca", done: false },
      { id: "c4", text: "Comprar materiais para construção (mdf, caibros, tintas)", done: false },
      { id: "c5", text: "Pagar taxas e emitir ART/RRT de montagem", done: false },
      { id: "c6", text: "Escalar funcionários e enviar RG/CPF de todos", done: false },
      { id: "c7", text: "Organizar passagens aéreas e hotel da equipe", done: false },
      { id: "c8", text: "Conseguir termo de liberação assinado da organização", done: false }
    ],
    assignedEmployees: [],
    assignedTools: [],
    hotelName: "",
    hotelCheckin: "",
    flightDetails: "",
    docs: [
      { id: "d1", name: "Contrato de Prestação de Serviços", status: "approved" },
      { id: "d2", name: "ART/RRT de Responsabilidade Técnica", status: "pending" },
      { id: "d3", name: "Termo de Liberação Oficial do Pavilhão", status: "pending" }
    ],
    
    valorContratado: 180000.00,
    valorRecebido: 90000.00,
    valorPendente: 90000.00,
    custoPrevisto: 72000.00,
    custoRealizado: 25000.00,
    centroCusto: {
      madeiraMdf: 18000.00,
      vidrosVidraçaria: 0,
      iluminacaoEletrica: 2500.00,
      mobiliarioAlugado: 0,
      fretes: 1500.00,
      combustivelPedagios: 800.00,
      hospedagemPassagens: 2200.00,
      equipePropria: 0,
      terceirizados: 0,
      taxasOrganizador: 0
    },
    mapsRoute: {
      endereco: "Expo Center Norte, Rua José Bernardo Pinto, 333 - Vila Guilherme, São Paulo - SP",
      latitude: -23.516801,
      longitude: -46.613459,
      linkMaps: "https://maps.app.goo.gl/CenterNorte",
      distanciaKm: 38.2,
      tempoEstimado: "35 min"
    }
  },
  {
    id: "evt-3",
    codigo: "EST-2026-003",
    name: "Estande Petrobras - Rio Oil & Gas 2026",
    client: "Petróleo Brasileiro S.A.",
    responsavel: "Ricardo Mendes Alves",
    phase: "post",
    startDate: "2026-06-15",
    endDate: "2026-06-20",
    dataMontagem: "2026-06-12",
    dataDesmontagem: "2026-06-21",
    completionRate: 100,
    checklist: [
      { id: "c1", text: "Avaliar plantas e projeto técnico do estande", done: true },
      { id: "c2", text: "Subir contrato comercial assinado", done: true },
      { id: "c3", text: "Alinhar e conferir logomarcas da marca", done: true },
      { id: "c4", text: "Comprar materiais para construção (mdf, caibros, tintas)", done: true },
      { id: "c5", text: "Pagar taxas e emitir ART/RRT de montagem", done: true },
      { id: "c6", text: "Escalar funcionários e enviar RG/CPF de todos", done: true },
      { id: "c7", text: "Organizar passagens aéreas e hotel da equipe", done: true },
      { id: "c8", text: "Conseguir termo de liberação assinado da organização", done: true }
    ],
    assignedEmployees: [
      { id: "emp-3", name: "Claudio Barbosa Silva", role: "Eletricista Operacional", documentStatus: "complete" }
    ],
    assignedTools: [],
    hotelName: "Hotel Windsor Barra",
    hotelCheckin: "2026-06-14",
    flightDetails: "Gol G3-1209 - NAT -> GIG - Localizador: GHJ441",
    docs: [
      { id: "d1", name: "Contrato de Prestação de Serviços", status: "approved" },
      { id: "d2", name: "ART/RRT de Responsabilidade Técnica", status: "approved" },
      { id: "d3", name: "Termo de Liberação Oficial do Pavilhão", status: "approved" }
    ],
    
    valorContratado: 320000.00,
    valorRecebido: 320000.00,
    valorPendente: 0,
    custoPrevisto: 140000.00,
    custoRealizado: 135800.00,
    centroCusto: {
      madeiraMdf: 55000.00,
      vidrosVidraçaria: 12000.00,
      iluminacaoEletrica: 18000.00,
      mobiliarioAlugado: 9500.00,
      fretes: 12800.00,
      combustivelPedagios: 4200.00,
      hospedagemPassagens: 11400.00,
      equipePropria: 6800.00,
      terceirizados: 3600.00,
      taxasOrganizador: 2500.00
    },
    mapsRoute: {
      endereco: "Riocentro, Av. Salvador Allende, 6555 - Barra da Tijuca, Rio de Janeiro - RJ",
      latitude: -22.979032,
      longitude: -43.411209,
      linkMaps: "https://maps.app.goo.gl/Riocentro",
      distanciaKm: 422.0,
      tempoEstimado: "5h 30 min"
    }
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  { 
    id: "emp-1", 
    name: "José Alves de Oliveira", 
    role: "Montador de Estande", 
    documentStatus: "complete", 
    hasSafetyCert: true,
    foto: "A",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    cnh: "AB-992812",
    pixKey: "jose.alves@gmail.com",
    salario: 3500.00,
    nr10Vencimento: "",
    nr35Vencimento: "2027-10-15",
    historicoAtivos: [
      { id: "h-1", tipo: "recebimento_ativo", descricao: "Recebeu Uniforme JC Eventos, Escala Feicon", date: "2026-07-02", responsavel: "Ricardo Mendes" },
      { id: "h-2", tipo: "retirada_ferramenta", descricao: "Retirou Furadeira Bosch do Depósito", date: "2026-07-10", responsavel: "Almoxarife" }
    ]
  },
  { 
    id: "emp-2", 
    name: "Carlos Henrique Lima", 
    role: "Carpinteiro Montador", 
    documentStatus: "complete", 
    hasSafetyCert: true,
    foto: "C",
    cpf: "987.654.321-11",
    rg: "98.765.432-1",
    cnh: "D-192837",
    pixKey: "carloshl@outlook.com",
    salario: 3800.00,
    nr10Vencimento: "",
    nr35Vencimento: "2027-02-28",
    historicoAtivos: [
      { id: "h-3", tipo: "retirada_ferramenta", descricao: "Retirou Serra Dewalt e Lixadeira Makita", date: "2026-07-12", responsavel: "Almoxarife" }
    ]
  },
  { 
    id: "emp-3", 
    name: "Claudio Barbosa Silva", 
    role: "Eletricista Operacional", 
    documentStatus: "complete", 
    hasSafetyCert: true,
    foto: "B",
    cpf: "456.789.123-22",
    rg: "45.678.912-3",
    cnh: "B-229102",
    pixKey: "45678912322",
    salario: 4200.00,
    nr10Vencimento: "2026-12-31",
    nr35Vencimento: "2026-11-20",
    historicoAtivos: [
      { id: "h-4", tipo: "recebimento_dinheiro", descricao: "Adiantamento em dinheiro caixinha: R$ 150,00", date: "2026-07-14", responsavel: "Financeiro" }
    ]
  },
  { 
    id: "emp-4", 
    name: "Ricardo Mendes Alves", 
    role: "Coordenador de Estande", 
    documentStatus: "pending", 
    hasSafetyCert: true,
    foto: "R",
    cpf: "321.654.987-44",
    rg: "32.165.498-7",
    cnh: "AB-881928",
    pixKey: "ricardo.mendes@jceventos.com",
    salario: 6500.00,
    nr10Vencimento: "",
    nr35Vencimento: "",
    historicoAtivos: []
  },
  { 
    id: "emp-5", 
    name: "Marcelo dos Santos", 
    role: "Auxiliar Técnico", 
    documentStatus: "pending", 
    hasSafetyCert: false,
    foto: "M",
    cpf: "888.999.000-11",
    rg: "88.899.900-0",
    cnh: "",
    pixKey: "marcelo.santos@gmail.com",
    salario: 2200.00,
    nr10Vencimento: "",
    nr35Vencimento: "",
    historicoAtivos: []
  }
];

const INITIAL_WAREHOUSE: WarehouseItem[] = [
  { 
    id: "item-1", 
    name: "Furadeira de Impacto Bosch", 
    type: "tool", 
    stock: 12,
    codigo: "FER-001",
    qrCode: "QR-FER-001",
    marca: "Bosch",
    modelo: "GSB 16 RE",
    patrimonio: "JC-PAT-1082",
    estadoConservacao: "excelente",
    valorCompra: 480.00,
    valorVenda: 580.00,
    valorLocacao: 15.00,
    stockMinimo: 5,
    origem: "proprio",
    localizacaoFisica: { galpao: "A", corredor: "01", rua: "A", prateleira: "03", andar: "B", posicao: "02" }
  },
  { 
    id: "item-2", 
    name: "Serra Circular Dewalt", 
    type: "tool", 
    stock: 4,
    codigo: "FER-002",
    qrCode: "QR-FER-002",
    marca: "Dewalt",
    modelo: "DWE575",
    patrimonio: "JC-PAT-1099",
    estadoConservacao: "bom",
    valorCompra: 850.00,
    valorVenda: 1050.00,
    valorLocacao: 40.00,
    stockMinimo: 5,
    origem: "proprio",
    localizacaoFisica: { galpao: "A", corredor: "01", rua: "A", prateleira: "04", andar: "C", posicao: "01" }
  },
  { 
    id: "item-3", 
    name: "Parafusadeira Makita 12V", 
    type: "tool", 
    stock: 15,
    codigo: "FER-003",
    qrCode: "QR-FER-003",
    marca: "Makita",
    modelo: "DF333DWYE",
    patrimonio: "JC-PAT-1104",
    estadoConservacao: "excelente",
    valorCompra: 650.00,
    valorVenda: 790.00,
    valorLocacao: 20.00,
    stockMinimo: 5,
    origem: "proprio",
    localizacaoFisica: { galpao: "A", corredor: "02", rua: "B", prateleira: "01", andar: "A", posicao: "04" }
  },
  { 
    id: "item-4", 
    name: "Andaime Tubular Aço (Módulo 1m)", 
    type: "tool", 
    stock: 30,
    codigo: "AND-001",
    qrCode: "QR-AND-001",
    marca: "Metalúrgica RN",
    modelo: "Tubular 1m",
    patrimonio: "JC-PAT-5012",
    estadoConservacao: "bom",
    valorCompra: 120.00,
    valorVenda: 160.00,
    valorLocacao: 5.00,
    stockMinimo: 10,
    origem: "proprio",
    localizacaoFisica: { galpao: "B", corredor: "05", rua: "C", prateleira: "01", andar: "A", posicao: "01" }
  },
  { 
    id: "item-5", 
    name: "Cadeira Estofada Office Preta", 
    type: "furniture", 
    stock: 50,
    codigo: "MOB-001",
    qrCode: "QR-MOB-001",
    marca: "Flexform",
    modelo: "Office Executiva",
    patrimonio: "JC-PAT-3011",
    estadoConservacao: "excelente",
    valorCompra: 350.00,
    valorVenda: 420.00,
    valorLocacao: 15.00,
    stockMinimo: 8,
    origem: "alugado",
    localizacaoFisica: { galpao: "C", corredor: "10", rua: "F", prateleira: "02", andar: "D", posicao: "05" }
  },
  { 
    id: "item-6", 
    name: "Mesa Lateral Redonda de Vidro", 
    type: "furniture", 
    stock: 8,
    codigo: "MOB-002",
    qrCode: "QR-MOB-002",
    marca: "Tok&Stok",
    modelo: "Vidro Redonda 60cm",
    patrimonio: "JC-PAT-3024",
    estadoConservacao: "bom",
    valorCompra: 280.00,
    valorVenda: 350.00,
    valorLocacao: 25.00,
    stockMinimo: 3,
    origem: "proprio",
    localizacaoFisica: { galpao: "C", corredor: "10", rua: "F", prateleira: "03", andar: "D", posicao: "02" }
  },
  { 
    id: "item-7", 
    name: "Banqueta Regulável Bistrô Cromada", 
    type: "furniture", 
    stock: 25,
    codigo: "MOB-003",
    qrCode: "QR-MOB-003",
    marca: "Design Chairs",
    modelo: "Bistrô ABS",
    patrimonio: "JC-PAT-3040",
    estadoConservacao: "excelente",
    valorCompra: 190.00,
    valorVenda: 240.00,
    valorLocacao: 12.00,
    stockMinimo: 5,
    origem: "proprio",
    localizacaoFisica: { galpao: "C", corredor: "11", rua: "G", prateleira: "01", andar: "B", posicao: "01" }
  }
];

const INITIAL_INVOICES: InvoiceLog[] = [
  { id: "inv-1", vendor: "Comercial de Madeiras RN", invoiceNumber: "NF-8924", value: 3450.00, description: "30 Chapas MDF Cru 15mm, 15 Ripas Pinus 3m", date: "2026-07-08", tipo: "despesa", categoria: "Madeira", formaPagamento: "Boleto", status: "pago", eventoId: "evt-1" },
  { id: "inv-2", vendor: "Eletro Ferragens Natal", invoiceNumber: "NF-1209", value: 450.00, description: "10 Refletores LED 50W, 2 Rolos Fio Cobre 2.5mm", date: "2026-07-10", tipo: "despesa", categoria: "Iluminação", formaPagamento: "Pix", status: "pago", eventoId: "evt-1" },
  { id: "inv-3", vendor: "Móveis Eventos Express", invoiceNumber: "NF-2281", value: 2400.00, description: "Locação de poltronas e mesas para stand Bienal", date: "2026-07-14", tipo: "despesa", categoria: "Mobiliário", formaPagamento: "TED", status: "pendente", eventoId: "evt-1" },
  { id: "inv-4", vendor: "Volkswagen do Brasil", invoiceNumber: "REC-VW01", value: 180000.00, description: "Depósito de 50% de entrada - Estande Feicon", date: "2026-07-08", tipo: "receita", categoria: "Estande", formaPagamento: "TED", status: "pago", eventoId: "evt-2" }
];

const INITIAL_AUDIT_LOGS: AuditoriaLog[] = [
  { id: "log-1", usuario: "Adrian (Coordenador)", acao: "Criação de Evento", detalhes: "Adicionado estande Heineken - Feira APAS 2026", date: "2026-07-15", hora: "10:15:30", ip: "192.168.1.45" },
  { id: "log-2", usuario: "Adrian (Coordenador)", acao: "Escala de Equipe", detalhes: "José Alves e Carlos Henrique escalados no Estande Nestlé", date: "2026-07-15", hora: "11:22:10", ip: "192.168.1.45" },
  { id: "log-3", usuario: "Almoxarife", acao: "Lançamento de Compra", detalhes: "Registrada NF-8924 de MDF com atualização de inventário", date: "2026-07-15", hora: "13:05:44", ip: "192.168.1.12" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "crm" | "kanban" | "warehouse" | "employees" | "financial" | "logistics" | "ia" | "auditoria"
  >("overview");
  
  // App Global State
  const [events, setEvents] = useState<Project[]>(INITIAL_EVENTS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>(INITIAL_WAREHOUSE);
  const [invoiceLogs, setInvoiceLogs] = useState<InvoiceLog[]>(INITIAL_INVOICES);
  const [leads, setLeads] = useState<LeadCRM[]>(INITIAL_LEADS);
  const [vehicles] = useState<VeiculoLogistica[]>(INITIAL_VEHICLES);
  const [auditLogs, setAuditLogs] = useState<AuditoriaLog[]>(INITIAL_AUDIT_LOGS);

  const [clientes, setClientes] = useState(INITIAL_CLIENTS);
  const [fornecedores] = useState(INITIAL_SUPPLIERS);
  
  // Selected event details modal controller
  const [selectedEvent, setSelectedEvent] = useState<Project | null>(null);

  // Helper: registrar log na Auditoria
  const registerAudit = (acao: string, detalhes: string) => {
    const newLog: AuditoriaLog = {
      id: `log-${Date.now()}`,
      usuario: "Adrian (Coordenador)",
      acao,
      detalhes,
      date: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ip: "192.168.1.45" // Simulado
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Add Event
  const addEvent = (name: string, client: string, startDate: string) => {
    const newEvent: Project = {
      id: `evt-${Date.now()}`,
      codigo: `EST-2026-${Date.now().toString().substring(10)}`,
      name,
      client,
      responsavel: "Ricardo Mendes Alves",
      phase: "no_event",
      startDate,
      endDate: new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dataMontagem: new Date(new Date(startDate).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dataDesmontagem: new Date(new Date(startDate).getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      completionRate: 0,
      checklist: [
        { id: "c1", text: "Avaliar plantas e projeto técnico do estande", done: false },
        { id: "c2", text: "Subir contrato comercial assinado", done: false },
        { id: "c3", text: "Alinhar e conferir logomarcas da marca", done: false },
        { id: "c4", text: "Comprar materiais para construção (mdf, caibros, tintas)", done: false },
        { id: "c5", text: "Pagar taxas e emitir ART/RRT de montagem", done: false },
        { id: "c6", text: "Escalar funcionários e enviar RG/CPF de todos", done: false },
        { id: "c7", text: "Organizar passagens aéreas e hotel da equipe", done: false },
        { id: "c8", text: "Conseguir termo de liberação assinado da organização", done: false }
      ],
      assignedEmployees: [],
      assignedTools: [],
      hotelName: "",
      hotelCheckin: "",
      flightDetails: "",
      docs: [
        { id: "d1", name: "Contrato de Prestação de Serviços", status: "pending" },
        { id: "d2", name: "ART/RRT de Responsabilidade Técnica", status: "pending" },
        { id: "d3", name: "Termo de Liberação Oficial do Pavilhão", status: "pending" }
      ],
      valorContratado: 150000.00,
      valorRecebido: 0,
      valorPendente: 150000.00,
      custoPrevisto: 60000.00,
      custoRealizado: 0,
      centroCusto: {
        madeiraMdf: 0,
        vidrosVidraçaria: 0,
        iluminacaoEletrica: 0,
        mobiliarioAlugado: 0,
        fretes: 0,
        combustivelPedagios: 0,
        hospedagemPassagens: 0,
        equipePropria: 0,
        terceirizados: 0,
        taxasOrganizador: 0
      },
      mapsRoute: {
        endereco: "Pavilhão de Exposições Anhembi, São Paulo - SP",
        latitude: -23.514,
        longitude: -46.643,
        linkMaps: "https://maps.google.com",
        distanciaKm: 12.0,
        tempoEstimado: "20 min"
      }
    };
    setEvents((prev) => [newEvent, ...prev]);
    registerAudit("Criação de Evento", `Adicionado estande "${name}" para o cliente "${client}"`);
  };

  // Update Event Phase directly in Kanban
  const updateEventPhase = (id: string, phase: "no_event" | "during" | "post") => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, phase } : e))
    );
    const evt = events.find(e => e.id === id);
    registerAudit("Alteração de Fase", `Mapeado estande "${evt?.name}" para fase: ${phase}`);
  };

  // Update Event Details in Modal
  const updateEventDetails = (updated: Project) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
    // Keep local modal state synchronized
    setSelectedEvent(updated);
    registerAudit("Edição de Estande", `Atualizados checklists, escalas e dados de "${updated.name}"`);
  };

  // Add Employee
  const addEmployee = (name: string, role: string, hasSafetyCert: boolean) => {
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name,
      role,
      documentStatus: "pending",
      hasSafetyCert,
      foto: name.substring(0, 1).toUpperCase(),
      cpf: "000.000.000-00",
      rg: "00.000.000-0",
      cnh: "B-998822",
      pixKey: name.toLowerCase().replace(" ", "") + "@pix.com",
      salario: 2500.00,
      nr10Vencimento: "",
      nr35Vencimento: "",
      historicoAtivos: []
    };
    setEmployees((prev) => [...prev, newEmp]);
    registerAudit("Adição de RH", `Cadastrado profissional "${name}" no cargo "${role}"`);
  };

  // Toggle Employee Doc status
  const toggleDocStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, documentStatus: e.documentStatus === "complete" ? "pending" : "complete" }
          : e
      )
    );
    const emp = employees.find(e => e.id === id);
    registerAudit("Homologação Doc", `Alterado status do documento pessoal do montador "${emp?.name}"`);
  };

  // Toggle Employee Safety Certification
  const toggleSafetyCert = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, hasSafetyCert: !e.hasSafetyCert } : e
      )
    );
  };

  // Add Invoice Log
  const addInvoice = (invoice: Omit<InvoiceLog, "id" | "date">) => {
    const newLog: InvoiceLog = {
      ...invoice,
      id: `inv-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };
    setInvoiceLogs((prev) => [newLog, ...prev]);
    registerAudit("Lançamento Financeiro", `Registrada nota fiscal "${invoice.invoiceNumber}" de R$ ${invoice.value} por "${invoice.vendor}"`);
    
    // Simulate WMS stock replenishment if text description keywords are hit
    const desc = invoice.description.toLowerCase();
    if (desc.includes("serra") || desc.includes("circular")) {
      updateStock("item-2", warehouseItems.find(i => i.id === "item-2")!.stock + 2);
    } else if (desc.includes("furadeira") || desc.includes("impacto")) {
      updateStock("item-1", warehouseItems.find(i => i.id === "item-1")!.stock + 2);
    } else if (desc.includes("makita") || desc.includes("parafusadeira")) {
      updateStock("item-3", warehouseItems.find(i => i.id === "item-3")!.stock + 2);
    }
  };

  // Update Stock levels WMS
  const updateStock = (id: string, newStock: number) => {
    setWarehouseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: newStock } : item))
    );
    const item = warehouseItems.find(i => i.id === id);
    registerAudit("Ajuste de Estoque", `Estoque do item "${item?.name}" alterado para ${newStock} no galpão`);
  };

  // CRM: add lead
  const addLead = (lead: Omit<LeadCRM, "id" | "dataCriacao">) => {
    const newLead: LeadCRM = {
      ...lead,
      id: `lead-${Date.now()}`,
      dataCriacao: new Date().toISOString().split("T")[0]
    };
    setLeads((prev) => [newLead, ...prev]);
    registerAudit("Novo Lead CRM", `Oportunidade cadastrada: "${lead.empresa}" (R$ ${lead.valorEstimado})`);
    
    // Se o lead já é adicionado como fechado, cria-se o cliente na tabela
    if (lead.estagio === "fechado") {
      setClientes(prev => [...prev, { name: lead.empresa, email: lead.email || "contato@cliente.com", cnpj: "00.000.000/0001-00" }]);
    }
  };

  // CRM: update lead pipeline stage
  const updateLeadEstagio = (id: string, novoEstagio: LeadCRM["estagio"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, estagio: novoEstagio } : l))
    );
    const lead = leads.find(l => l.id === id);
    registerAudit("Pipeline CRM", `Estágio do lead "${lead?.empresa}" movido para "${novoEstagio}"`);

    // Adiciona na lista de clientes caso feche negócio
    if (novoEstagio === "fechado" && lead) {
      const alreadyExists = clientes.some(c => c.name === lead.empresa);
      if (!alreadyExists) {
        setClientes(prev => [...prev, { name: lead.empresa, email: lead.email || "contato@cliente.com", cnpj: "00.000.000/0001-00" }]);
        // Cria também um estande mock correspondente no Kanban para não deixar vazio
        addEvent(`Estande ${lead.empresa} - Feira Corporativa 2026`, lead.empresa, "2026-09-10");
      }
    }
  };

  // Update Employee RH
  const updateEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e))
    );
    registerAudit("Atualização RH", `Alterados dados cadastrais de "${updatedEmp.name}"`);
  };

  // Update Invoice Financeiro
  const updateInvoice = (updatedInv: InvoiceLog) => {
    setInvoiceLogs((prev) =>
      prev.map((i) => (i.id === updatedInv.id ? updatedInv : i))
    );
    registerAudit("Atualização Financeiro", `Movimentação "${updatedInv.invoiceNumber}" editada. Valor: R$ ${updatedInv.value}`);
  };

  // Update CRM client
  const updateClient = (index: number, updatedClient: any) => {
    setClientes((prev) =>
      prev.map((c, i) => (i === index ? updatedClient : c))
    );
    registerAudit("Atualização CRM Clientes", `Dossiê do cliente "${updatedClient.name}" atualizado`);
  };

  // Update CRM supplier
  const updateSupplier = (index: number, updatedSupplier: any) => {
    setFornecedores((prev) =>
      prev.map((s, i) => (i === index ? updatedSupplier : s))
    );
    registerAudit("Atualização CRM Fornecedores", `Fornecedor "${updatedSupplier.name}" atualizado`);
  };

  // Add CRM Client manually
  const addClient = (client: { name: string; email: string; cnpj: string }) => {
    setClientes((prev) => [...prev, { ...client, anexos: [], projetoDetalhado: undefined }]);
    registerAudit("Novo CRM Cliente", `Cliente homologado: "${client.name}"`);
  };

  // Add CRM Supplier manually
  const addSupplier = (supplier: { name: string; email: string; servico: string }) => {
    setFornecedores((prev) => [...prev, supplier]);
    registerAudit("Novo CRM Fornecedor", `Fornecedor homologado: "${supplier.name}"`);
  };

  // Update WMS Warehouse Item
  const updateWarehouseItem = (updatedItem: WarehouseItem) => {
    setWarehouseItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    registerAudit("Atualização WMS", `Item de Almoxarifado "${updatedItem.name}" atualizado`);
  };

  // Update Vehicle Logística
  const updateVehicle = (updatedVehicle: VeiculoLogistica) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
    );
    registerAudit("Atualização Logística", `Frota: Veículo com placa "${updatedVehicle.placa}" atualizado`);
  };

  // Add Vehicle Logística
  const addVehicle = (newVeh: Omit<VeiculoLogistica, "id">) => {
    const veh: VeiculoLogistica = {
      ...newVeh,
      id: `veh-${Date.now()}`
    };
    setVehicles((prev) => [...prev, veh]);
    registerAudit("Adição Frota", `Novo veículo cadastrado na frota: "${newVeh.modelo}"`);
  };

  // Update Event details Logística / Geral
  const updateEvent = (updatedEvent: Project) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    registerAudit("Atualização Evento", `Dossiê operacional de "${updatedEvent.name}" alterado`);
  };

  // ── Calculations for Overview KPIs ──
  const activeEventsCount = events.filter(e => e.phase === "during").length;
  const scheduledCount = events.reduce((acc, curr) => acc + curr.assignedEmployees.length, 0);
  const lowStockCount = warehouseItems.filter(item => item.stock <= item.stockMinimo).length;
  const pendingDocsCount = events
    .filter(e => e.phase !== "post")
    .reduce((acc, curr) => acc + curr.docs.filter(d => d.status === "pending").length, 0);

  return (
    <div className="layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <span className="logo-text">Controll-All</span>
          <span className="logo-dot">.</span>
        </div>

        <nav>
          <ul className="nav-list">
            <li>
              <button 
                className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard size={18} /> Visão Geral
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === "crm" ? "active" : ""}`}
                onClick={() => setActiveTab("crm")}
              >
                <Building2 size={18} /> CRM &amp; Clientes
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === "kanban" ? "active" : ""}`}
                onClick={() => setActiveTab("kanban")}
              >
                <Briefcase size={18} /> Projetos &amp; Kanban
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === "warehouse" ? "active" : ""}`}
                onClick={() => setActiveTab("warehouse")}
              >
                <Archive size={18} /> Depósito &amp; WMS
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === "employees" ? "active" : ""}`}
                onClick={() => setActiveTab("employees")}
              >
                <Users size={18} /> RH &amp; Colaboradores
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === "financial" ? "active" : ""}`}
                onClick={() => setActiveTab("financial")}
              >
                <DollarSign size={18} /> Financeiro &amp; Custos
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === "logistics" ? "active" : ""}`}
                onClick={() => setActiveTab("logistics")}
              >
                <Truck size={18} /> Logística &amp; Viagem
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === "ia" ? "active" : ""}`}
                onClick={() => setActiveTab("ia")}
              >
                <Bot size={18} /> IA Copilot
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === "auditoria" ? "active" : ""}`}
                onClick={() => setActiveTab("auditoria")}
              >
                <Shield size={18} /> Auditoria
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer User Details */}
        <div className="user-footer">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <span className="user-name">Adrian</span>
            <span className="user-role">Coordenador</span>
          </div>
          <button 
            style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
            onClick={() => alert("Logout realizado (Simulado)")}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <main className="main-area">
        {/* Header */}
        <header className="header">
          <h2 className="page-title">
            {activeTab === "overview" && "Painel Executivo da JC Eventos"}
            {activeTab === "crm" && "Gestão de Oportunidades & Leads"}
            {activeTab === "kanban" && "Quadro Operacional de Montagem"}
            {activeTab === "warehouse" && "Depósito, Organização Física & WMS"}
            {activeTab === "employees" && "Ficha de Equipe & Certificações NRs"}
            {activeTab === "financial" && "Contabilidade, Caixa & Centro de Custos"}
            {activeTab === "logistics" && "Coordenação de Frota, Voo & Hospedagem"}
            {activeTab === "ia" && "AI Copilot Operacional"}
            {activeTab === "auditoria" && "Trilha de Segurança e Auditoria Geral"}
          </h2>
          <div className="header-actions">
            <span className="text-xs text-muted" style={{ fontWeight: 600 }}>
              Status Operacional: <span style={{ color: "var(--accent-secondary)" }}>Evoluído 2.0 (Online)</span>
            </span>
          </div>
        </header>

        {/* Content Wrapper */}
        <section className="content-wrapper">
          {activeTab === "overview" && (
            <Overview 
              events={events}
              employeesCount={scheduledCount}
              lowStockItemsCount={lowStockCount}
              pendingDocsCount={pendingDocsCount}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          )}

          {activeTab === "crm" && (
            <CRM 
              leads={leads}
              clientes={clientes}
              fornecedores={fornecedores}
              onAddLead={addLead}
              onUpdateLeadEstagio={updateLeadEstagio}
              onUpdateLead={(updated) => setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))}
              onUpdateClient={updateClient}
              onUpdateSupplier={updateSupplier}
              onAddClient={addClient}
              onAddSupplier={addSupplier}
            />
          )}

          {activeTab === "kanban" && (
            <KanbanBoards 
              events={events}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onAddEvent={addEvent}
              onUpdateEventPhase={updateEventPhase}
            />
          )}

          {activeTab === "warehouse" && (
            <WmsModule 
              items={warehouseItems}
              onUpdateStock={updateStock}
              onUpdateWarehouseItem={updateWarehouseItem}
            />
          )}

          {activeTab === "employees" && (
            <Employees 
              employees={employees}
              onAddEmployee={addEmployee}
              onToggleDocStatus={toggleDocStatus}
              onToggleSafetyCert={toggleSafetyCert}
              onUpdateEmployee={updateEmployee}
            />
          )}

          {activeTab === "financial" && (
            <Financial 
              invoices={invoiceLogs}
              events={events}
              onAddInvoice={addInvoice}
              onUpdateInvoice={updateInvoice}
            />
          )}

          {activeTab === "logistics" && (
            <Logistics 
              vehicles={vehicles}
              events={events}
              onUpdateVehicle={updateVehicle}
              onUpdateEvent={updateEvent}
              onAddVehicle={addVehicle}
            />
          )}

          {activeTab === "ia" && (
            <IAAssistant 
              events={events}
              employees={employees}
              warehouseItems={warehouseItems}
              invoices={invoiceLogs}
            />
          )}

          {activeTab === "auditoria" && (
            <Auditoria 
              logs={auditLogs}
            />
          )}
        </section>
      </main>

      {/* Event Details Overlay Modal (Universal modal) */}
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent}
          allEmployees={employees}
          allWarehouseItems={warehouseItems}
          onClose={() => setSelectedEvent(null)}
          onUpdateEvent={updateEventDetails}
        />
      )}
    </div>
  );
}
