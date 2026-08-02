import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, Briefcase, Archive, Users, LogOut, 
  Building2, DollarSign, Truck, Shield, FileText, CheckSquare, Calendar,
  Sun, Moon, Bell, ClipboardCheck, Search
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
// IAAssistant is available but not rendered in main nav (import omitted to suppress lint)
import Auditoria from "./components/Auditoria";
import Orcamentos from "./components/Orcamentos";
import logoImg from "./assets/logo.png";
import OrdensServico from "./components/OrdensServico";
import Agenda from "./components/Agenda";
import { BankReconciliationModal } from "./components/BankReconciliationModal";
import { safeStorage, canUserAccessTab } from "./utils/security";

// Import shared types
import type { 
  Project, Employee, WarehouseItem, InvoiceLog, 
  LeadCRM, VeiculoLogistica, AuditoriaLog, Orcamento 
} from "./types";

// ── Initial Mock Data 2.0 (Seed Completo) ──

const INITIAL_CLIENTS = [
  { name: "Unimed Natal Cooperativa Médica", email: "marketing@unimednatalnatal.com.br", cnpj: "08.243.170/0001-34" },
  { name: "Chevrolet Concessionária Potiguar", email: "eventos@chevroletpotiguar.com.br", cnpj: "10.491.228/0001-12" },
  { name: "UFRN – Universidade Federal do RN", email: "extensao@ufrn.br", cnpj: "24.365.710/0001-83" },
  { name: "Hapvida Saúde", email: "feiras@hapvida.com.br", cnpj: "63.554.067/0001-98" },
  { name: "Banco do Nordeste do Brasil", email: "mktbne@bnb.gov.br", cnpj: "07.237.373/0001-20" }
];

const INITIAL_SUPPLIERS = [
  { name: "Comercial de Madeiras RN", email: "vendas@madeirasrn.com.br", servico: "Madeira e MDF" },
  { name: "Eletro Ferragens Natal", email: "comercial@eletroferragens.com", servico: "Iluminação e Materiais Elétricos" },
  { name: "Móveis Eventos Express RN", email: "aluguel@moveisexpress.com.br", servico: "Locação de Mobiliário" },
  { name: "Transportes Potiguar Cargas", email: "fretes@potiguar.com", servico: "Logística e Fretes" },
  { name: "Alumínio Construção Fortaleza", email: "vendas@aluminiofortal.com.br", servico: "Perfis Octanorm e Alumínio" }
];

const INITIAL_LEADS: LeadCRM[] = [
  {
    id: "lead-1",
    empresa: "Unimed Natal",
    contato: "Dra. Camila Freitas",
    cargo: "Gerente de Marketing",
    email: "camila.freitas@unimednatalnatal.com.br",
    telefone: "(84) 99201-3344",
    valorEstimado: 35000.00,
    origem: "Indicação de cliente",
    estagio: "orcamento",
    dataCriacao: "2026-07-10",
    observacoes: "Quer estande misto para o Congresso Médico de Natal em agosto. Precisa de recepção, display e 2 TVs.",
    tipoEstande: "misto",
    areaEstimadaM2: 18,
    nomeFeira: "Congresso Médico RN 2026",
    cidadeEvento: "Natal/RN",
    briefing: "Estande para exposição de planos e captação de associados. Identidade visual Unimed (verde). Mesa de atendimento para 2 pessoas, TV 55\" e painel de fundo."
  },
  {
    id: "lead-2",
    empresa: "Hapvida Saúde",
    contato: "Marcos Quirino",
    cargo: "Coordenador Comercial",
    email: "marcos.quirino@hapvida.com.br",
    telefone: "(84) 98877-5511",
    valorEstimado: 22000.00,
    origem: "Instagram",
    estagio: "briefing",
    dataCriacao: "2026-07-12",
    observacoes: "Feira de saúde em Fortaleza. Quer stand padrão Octanorm simples com backdrop e balcão.",
    tipoEstande: "padrao",
    areaEstimadaM2: 9,
    nomeFeira: "ExpeSaúde Fortaleza 2026",
    cidadeEvento: "Fortaleza/CE"
  },
  {
    id: "lead-3",
    empresa: "Chevrolet Concessionária Potiguar",
    contato: "Thiago Melo",
    cargo: "Gerente de Marketing",
    email: "thiago.melo@chevroletpotiguar.com.br",
    telefone: "(84) 99415-8800",
    valorEstimado: 68000.00,
    origem: "Prospecção ativa",
    estagio: "aprovado",
    dataCriacao: "2026-07-08",
    observacoes: "Contrato assinado. Stand construído para Salão do Automóvel de Recife. Projeto aprovado com área de exposição de 3 veículos.",
    tipoEstande: "construido",
    areaEstimadaM2: 72,
    nomeFeira: "Salão do Automóvel Recife 2026",
    cidadeEvento: "Recife/PE"
  }
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
    name: "Stand Unimed — Congresso Médico RN 2026",
    client: "Unimed Natal Cooperativa Médica",
    responsavel: "Jailson Correia",
    phase: "Montagem",
    startDate: "2026-07-24",
    endDate: "2026-07-27",
    dataMontagem: "2026-07-22",
    dataDesmontagem: "2026-07-28",
    completionRate: 55,
    tipoEstande: "misto",
    areaM2: 18,
    nomeFeira: "Congresso Médico RN 2026",
    cidadeEvento: "Natal/RN",
    briefing: "Estande de atendimento com balcão de recepção, 2 TVs 55\" e painel backdrop com logo Unimed. Cores verde e branco.",
    checklist: [
      { id: "c1", text: "Aprovar planta baixa e projeto gráfico com o cliente", done: true },
      { id: "c2", text: "Assinar contrato e emitir ART no CREA", done: true },
      { id: "c3", text: "Comprar MDF, perfis e tintas", done: true },
      { id: "c4", text: "Locar mobiliário (cadeiras, balcão, mesa)", done: false },
      { id: "c5", text: "Escalar equipe e entregar RG/CPF à organização", done: false },
      { id: "c6", text: "Credenciar montadores junto ao pavilhão", done: false },
      { id: "c7", text: "Confirmar datas de montagem com organização do evento", done: true },
      { id: "c8", text: "Retirar materiais do depósito e carregar caminhão", done: false }
    ],
    assignedEmployees: [
      { id: "emp-1", name: "José Alves de Oliveira", role: "Montador", documentStatus: "complete" },
      { id: "emp-2", name: "Carlos Henrique Lima", role: "Carpinteiro", documentStatus: "complete" }
    ],
    assignedTools: [
      { id: "item-1", name: "Furadeira de Impacto Bosch", type: "tool", allocatedQty: 2 },
      { id: "item-2", name: "Serra Circular Dewalt", type: "tool", allocatedQty: 1 }
    ],
    hotelName: "Hotel Reis Magos Natal",
    hotelCheckin: "2026-07-22",
    flightDetails: "Sem voos — equipe local de Natal/RN",
    docs: [
      { id: "d1", name: "Contrato Assinado", status: "approved" },
      { id: "d2", name: "ART de Responsabilidade Técnica", status: "approved" },
      { id: "d3", name: "Credencial Pavilhão", status: "pending" }
    ],
    valorContratado: 35000.00,
    valorRecebido: 20000.00,
    valorPendente: 15000.00,
    custoPrevisto: 18000.00,
    custoRealizado: 12400.00,
    centroCusto: {
      madeiraMdf: 4500.00,
      vidrosVidraçaria: 0,
      iluminacaoEletrica: 1200.00,
      mobiliarioAlugado: 2400.00,
      fretes: 800.00,
      combustivelPedagios: 300.00,
      hospedagemPassagens: 0,
      equipePropria: 2400.00,
      terceirizados: 800.00,
      taxasOrganizador: 0,
      fornecedoresDespesas: {
        madeiraMdf: "Madeiras Pinheiro",
        iluminacaoEletrica: "Elétrica Luz",
        mobiliarioAlugado: "Locadora Real"
      }
    },
    centroConvencoes: "Centro de Convenções de Natal",
    producao: {
      marcenaria: "concluido",
      pintura: "em_andamento",
      eletrica: "pendente",
      comunicacaoVisual: "pendente",
      vidros: "pendente",
      limpeza: "pendente"
    },
    romaneioChecked: {},
    cronogramaTurnos: {
      dia1Manha: true,
      dia1Tarde: true,
      dia2Manha: true,
      dia2Tarde: false
    },
    devolucoesAlugados: {},
    mapsRoute: {
      endereco: "Centro de Convenções de Natal – Via Costeira, Natal/RN",
      latitude: -5.865700,
      longitude: -35.188100,
      linkMaps: "https://maps.google.com/?q=Centro+de+Convenções+Natal",
      distanciaKm: 12.5,
      tempoEstimado: "25 min"
    }
  },
  {
    id: "evt-2",
    codigo: "EST-2026-002",
    name: "Stand Chevrolet — Salão do Automóvel Recife 2026",
    client: "Chevrolet Concessionária Potiguar",
    responsavel: "Jailson Correia",
    phase: "Produção",
    startDate: "2026-08-14",
    endDate: "2026-08-18",
    dataMontagem: "2026-08-11",
    dataDesmontagem: "2026-08-19",
    completionRate: 20,
    tipoEstande: "construido",
    areaM2: 72,
    nomeFeira: "Salão do Automóvel Recife 2026",
    cidadeEvento: "Recife/PE",
    briefing: "Stand construído com exposição de 3 veículos. Piso elevado, iluminação especial, recepção e area lounge. Identidade visual Chevrolet.",
    checklist: [
      { id: "c1", text: "Aprovar planta baixa e projeto 3D com cliente", done: true },
      { id: "c2", text: "Assinar contrato e emitir ART no CREA-PE", done: true },
      { id: "c3", text: "Comprar materiais de construção (MDF, caibros)", done: false },
      { id: "c4", text: "Contratar serviços de elétrica terceirizada", done: false },
      { id: "c5", text: "Escalar equipe de montagem (min 6 pessoas)", done: false },
      { id: "c6", text: "Reservar hotel para equipe em Recife", done: false },
      { id: "c7", text: "Comprar passagens ou alugar van de carga", done: false },
      { id: "c8", text: "Credenciar equipe junto ao Expo Recife", done: false }
    ],
    assignedEmployees: [],
    assignedTools: [],
    hotelName: "Ibis Recife Centro",
    hotelCheckin: "2026-08-10",
    flightDetails: "Van de carga NAT→REC - Saída 06h do dia 11/08",
    docs: [
      { id: "d1", name: "Contrato Assinado", status: "approved" },
      { id: "d2", name: "ART de Responsabilidade Técnica", status: "pending" },
      { id: "d3", name: "Projeto Técnico 3D", status: "uploaded" }
    ],
    valorContratado: 68000.00,
    valorRecebido: 34000.00,
    valorPendente: 34000.00,
    custoPrevisto: 32000.00,
    custoRealizado: 8500.00,
    centroCusto: {
      madeiraMdf: 12000.00,
      vidrosVidraçaria: 0,
      iluminacaoEletrica: 4500.00,
      mobiliarioAlugado: 3200.00,
      fretes: 2800.00,
      combustivelPedagios: 1100.00,
      hospedagemPassagens: 3800.00,
      equipePropria: 3600.00,
      terceirizados: 1000.00,
      taxasOrganizador: 0,
      fornecedoresDespesas: {
        madeiraMdf: "Madeiras Pinheiro"
      }
    },
    centroConvencoes: "Expo Recife",
    producao: {
      marcenaria: "pendente",
      pintura: "pendente",
      eletrica: "pendente",
      comunicacaoVisual: "pendente",
      vidros: "pendente",
      limpeza: "pendente"
    },
    romaneioChecked: {},
    cronogramaTurnos: {
      dia1Manha: false,
      dia1Tarde: false,
      dia2Manha: false,
      dia2Tarde: false
    },
    devolucoesAlugados: {},
    mapsRoute: {
      endereco: "Expo Recife – Av. Prof. Andrade Bezerra, Salgadinho, Olinda/PE",
      latitude: -7.979600,
      longitude: -34.840100,
      linkMaps: "https://maps.google.com/?q=Expo+Center+Recife",
      distanciaKm: 298.0,
      tempoEstimado: "4h 20 min de carro"
    }
  },
  {
    id: "evt-3",
    codigo: "EST-2026-003",
    name: "Stand Hapvida — ExpeSaúde Fortaleza 2026",
    client: "Hapvida Saúde",
    responsavel: "Jailson Correia",
    phase: "Finalizado",
    startDate: "2026-06-10",
    endDate: "2026-06-13",
    dataMontagem: "2026-06-08",
    dataDesmontagem: "2026-06-14",
    completionRate: 100,
    tipoEstande: "padrao",
    areaM2: 9,
    nomeFeira: "ExpeSaúde Fortaleza 2026",
    cidadeEvento: "Fortaleza/CE",
    briefing: "Stand padrão Octanorm 3x3m com backdrop impresso e balcão de atendimento.",
    checklist: [
      { id: "c1", text: "Aprovar planta e arte do backdrop", done: true },
      { id: "c2", text: "Assinar contrato", done: true },
      { id: "c3", text: "Montar e entregar stand", done: true },
      { id: "c4", text: "Desmontar e retornar materiais ao depósito", done: true }
    ],
    assignedEmployees: [
      { id: "emp-3", name: "Claudio Barbosa Silva", role: "Montador", documentStatus: "complete" }
    ],
    assignedTools: [
      { id: "item-1", name: "Furadeira de Impacto Bosch", type: "tool", allocatedQty: 1 }
    ],
    hotelName: "Hotel São Pedro Fortaleza",
    hotelCheckin: "2026-06-07",
    flightDetails: "Azul AD4101 – NAT→FOR – 07h00 – Loc: ABC123",
    docs: [
      { id: "d1", name: "Contrato de Prestação de Serviços", status: "approved" },
      { id: "d2", name: "ART de Responsabilidade Técnica", status: "approved" },
      { id: "d3", name: "Credencial Pavilhão", status: "approved" }
    ],
    valorContratado: 22000.00,
    valorRecebido: 22000.00,
    valorPendente: 0,
    custoPrevisto: 9000.00,
    custoRealizado: 8600.00,
    centroCusto: {
      madeiraMdf: 0,
      vidrosVidraçaria: 0,
      iluminacaoEletrica: 400.00,
      mobiliarioAlugado: 0,
      fretes: 1200.00,
      combustivelPedagios: 300.00,
      hospedagemPassagens: 2400.00,
      equipePropria: 800.00,
      terceirizados: 3500.00,
      taxasOrganizador: 0,
      fornecedoresDespesas: {
        iluminacaoEletrica: "Elétrica Luz",
        fretes: "Fretes & Carretos Rápidos"
      }
    },
    centroConvencoes: "Centro de Eventos do Ceará",
    producao: {
      marcenaria: "concluido",
      pintura: "concluido",
      eletrica: "concluido",
      comunicacaoVisual: "concluido",
      vidros: "concluido",
      limpeza: "concluido"
    },
    romaneioChecked: {},
    cronogramaTurnos: {
      dia1Manha: true,
      dia1Tarde: true,
      dia2Manha: true,
      dia2Tarde: true
    },
    devolucoesAlugados: {},
    mapsRoute: {
      endereco: "Centro de Eventos do Ceará – Av. Washington Soares, 999 – Fortaleza/CE",
      latitude: -3.796800,
      longitude: -38.479200,
      linkMaps: "https://maps.google.com/?q=Centro+Eventos+Ceara",
      distanciaKm: 538.0,
      tempoEstimado: "1h 30 min de voo"
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
    dataNascimento: "1988-04-12",
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
    dataNascimento: "1992-08-25",
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
    dataNascimento: "1985-11-03",
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
    dataNascimento: "1990-05-15",
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
    dataNascimento: "1996-01-20",
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
    localizacaoFisica: { galpao: "A", corredor: "01", rua: "A", prateleira: "03", andar: "B", posicao: "02" },
    locacoesDetalhadas: [
      { id: "loc-1", responsavel: "Construtora Alfa S.A.", dataSaida: "2026-07-10", dataRetorno: "2026-07-20", dias: 10, valor: 150.00, status: "ativa" }
    ]
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
    localizacaoFisica: { galpao: "C", corredor: "10", rua: "F", prateleira: "02", andar: "D", posicao: "05" },
    locacoesDetalhadas: [
      { id: "loc-2", responsavel: "Agência Click Eventos", dataSaida: "2026-07-12", dataRetorno: "2026-07-17", dias: 5, valor: 75.00, status: "ativa" }
    ]
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
    localizacaoFisica: { galpao: "C", corredor: "11", rua: "G", prateleira: "01", andar: "B", posicao: "01" },
    locacoesDetalhadas: [
      { id: "loc-3", responsavel: "Promoções Rio Ltda", dataSaida: "2026-07-14", dataRetorno: "2026-07-19", dias: 5, valor: 60.00, status: "ativa" }
    ]
  }
];

const INITIAL_INVOICES: InvoiceLog[] = [
  { id: "inv-1", vendor: "Comercial de Madeiras RN", invoiceNumber: "NF-8924", value: 3450.00, description: "30 Chapas MDF Cru 15mm, 15 Ripas Pinus 3m", date: "2026-07-08", tipo: "despesa", categoria: "Madeira", formaPagamento: "Boleto", status: "pago", eventoId: "evt-1" },
  { id: "inv-2", vendor: "Eletro Ferragens Natal", invoiceNumber: "NF-1209", value: 450.00, description: "10 Refletores LED 50W, 2 Rolos Fio Cobre 2.5mm", date: "2026-07-10", tipo: "despesa", categoria: "Iluminação", formaPagamento: "Pix", status: "pago", eventoId: "evt-1" },
  { id: "inv-3", vendor: "Móveis Eventos Express", invoiceNumber: "NF-2281", value: 2400.00, description: "Locação de poltronas e mesas para stand Bienal", date: "2026-07-14", tipo: "despesa", categoria: "Mobiliário", formaPagamento: "TED", status: "pendente", eventoId: "evt-1" },
  { id: "inv-4", vendor: "Volkswagen do Brasil", invoiceNumber: "REC-VW01", value: 180000.00, description: "Depósito de 50% de entrada - Estande Feicon", date: "2026-07-08", tipo: "receita", categoria: "Estande", formaPagamento: "TED", status: "pago", eventoId: "evt-2" }
];

const INITIAL_AUDIT_LOGS: AuditoriaLog[] = [
  { id: "log-1", usuario: "JCEventos (Coordenador)", acao: "Criação de Evento", detalhes: "Adicionado estande Heineken - Feira APAS 2026", date: "2026-07-15", hora: "10:15:30", ip: "192.168.1.45" },
  { id: "log-2", usuario: "JCEventos (Coordenador)", acao: "Escala de Equipe", detalhes: "José Alves e Carlos Henrique escalados no Estande Nestlé", date: "2026-07-15", hora: "11:22:10", ip: "192.168.1.45" },
  { id: "log-3", usuario: "Almoxarife", acao: "Lançamento de Compra", detalhes: "Registrada NF-8924 de MDF com atualização de inventário", date: "2026-07-15", hora: "13:05:44", ip: "192.168.1.12" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "crm" | "orcamentos" | "os" | "kanban" | "agenda" | "warehouse" | "employees" | "financial" | "logistics" | "auditoria"
  >("overview");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const _handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    const term = globalSearch.toLowerCase();
    
    // search events
    const foundEvents = events.filter(evt => evt.name.toLowerCase().includes(term) || evt.client.toLowerCase().includes(term));
    // search leads
    const foundLeads = leads.filter(l => l.empresa.toLowerCase().includes(term) || l.contato.toLowerCase().includes(term));
    // search wms
    const foundWms = warehouseItems.filter(item => item.name.toLowerCase().includes(term) || item.marca.toLowerCase().includes(term));

    let msg = `Resultados da busca por "${globalSearch}":\n\n`;
    if (foundEvents.length > 0) msg += `Projetos/Eventos: ${foundEvents.map(e => e.name).join(", ")}\n`;
    if (foundLeads.length > 0) msg += `Leads CRM: ${foundLeads.map(l => l.empresa).join(", ")}\n`;
    if (foundWms.length > 0) msg += `Estoque WMS: ${foundWms.map(i => i.name).join(", ")}\n`;
    
    if (foundEvents.length === 0 && foundLeads.length === 0 && foundWms.length === 0) {
      msg += "Nenhum registro correspondente foi localizado.";
    }
    
    alert(msg);
  };

  // Permissions & Modules Activation States
  const [userRole, setUserRole] = useState<"admin" | "comercial" | "estoque" | "operador">("admin");
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({
    overview: true,
    crm: true,
    orcamentos: true,
    os: true,
    kanban: true,
    agenda: true,
    warehouse: true,
    logistics: true,
    financial: true,
    employees: true,
    auditoria: true
  });
  
  // App Global State com Persistência Segura
  const [events, setEvents] = useState<Project[]>(() => safeStorage.getItem("events", INITIAL_EVENTS));
  const [employees, setEmployees] = useState<Employee[]>(() => safeStorage.getItem("employees", INITIAL_EMPLOYEES));
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>(() => safeStorage.getItem("warehouse", INITIAL_WAREHOUSE));
  const [invoiceLogs, setInvoiceLogs] = useState<InvoiceLog[]>(() => safeStorage.getItem("invoices", INITIAL_INVOICES));
  const [leads, setLeads] = useState<LeadCRM[]>(() => safeStorage.getItem("leads", INITIAL_LEADS));
  const [vehicles, setVehicles] = useState<VeiculoLogistica[]>(() => safeStorage.getItem("vehicles", INITIAL_VEHICLES));
  const [auditLogs, setAuditLogs] = useState<AuditoriaLog[]>(() => safeStorage.getItem("audit", INITIAL_AUDIT_LOGS));

  const [clientes, setClientes] = useState(() => safeStorage.getItem("clientes", INITIAL_CLIENTS));
  const [fornecedores, setFornecedores] = useState(() => safeStorage.getItem("fornecedores", INITIAL_SUPPLIERS));

  useEffect(() => { safeStorage.setItem("events", events); }, [events]);
  useEffect(() => { safeStorage.setItem("employees", employees); }, [employees]);
  useEffect(() => { safeStorage.setItem("warehouse", warehouseItems); }, [warehouseItems]);
  useEffect(() => { safeStorage.setItem("invoices", invoiceLogs); }, [invoiceLogs]);
  useEffect(() => { safeStorage.setItem("leads", leads); }, [leads]);
  useEffect(() => { safeStorage.setItem("vehicles", vehicles); }, [vehicles]);
  useEffect(() => { safeStorage.setItem("audit", auditLogs); }, [auditLogs]);
  useEffect(() => { safeStorage.setItem("clientes", clientes); }, [clientes]);
  useEffect(() => { safeStorage.setItem("fornecedores", fornecedores); }, [fornecedores]);
  // Budgets State & Handlers
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => safeStorage.getItem("orcamentos", [
    {
      id: "orc-1",
      codigo: "PROP-2026-001",
      cliente: "Natura & Co",
      cnpjCliente: "12.890.312/0002-45",
      emailCliente: "eventos@natura.net",
      status: "negociacao",
      dataCriacao: "2026-07-14",
      validoAte: "2026-08-14",
      produtos: [
        { id: "item-1", name: "MDF Caibros e Placas", qty: 10, precoVenda: 150 }
      ],
      servicos: [
        { name: "Cenografia Stand Natura Hospitalar", preco: 45000 }
      ],
      desconto: 500,
      impostos: 15,
      total: 51250,
      emailEnviado: true,
      revisoes: [
        { versao: 1, data: "2026-07-14", descricao: "Versão inicial criada e enviada ao cliente." }
      ]
    }
  ]));

  useEffect(() => { safeStorage.setItem("orcamentos", orcamentos); }, [orcamentos]);

  const handleAddOrcamento = (newOrc: Omit<Orcamento, "id" | "codigo" | "dataCriacao" | "revisoes" | "emailEnviado">) => {
    const orc: Orcamento = {
      ...newOrc,
      id: `orc-${Date.now()}`,
      codigo: `PROP-2026-${Math.floor(100 + Math.random() * 900)}`,
      dataCriacao: new Date().toISOString().split("T")[0],
      emailEnviado: false,
      revisoes: [
        { versao: 1, data: new Date().toISOString().split("T")[0], descricao: "Proposta inicial criada." }
      ]
    };
    setOrcamentos((prev) => [orc, ...prev]);
    registerAudit("Nova Proposta", `Orçamento ${orc.codigo} cadastrado para ${orc.cliente}.`);
  };

  const handleUpdateOrcamento = (updated: Orcamento) => {
    setOrcamentos((prev) => prev.map(o => o.id === updated.id ? updated : o));
    registerAudit("Editar Proposta", `Orçamento ${updated.codigo} atualizado (Versão: ${updated.revisoes.length}).`);
  };

  const handleConvertToOS = (orc: Orcamento) => {
    const newProj: Project = {
      id: `evt-${Date.now()}`,
      codigo: `EST-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: `Estande ${orc.cliente} - Cenografia Convertida`,
      client: orc.cliente,
      responsavel: "Ricardo Mendes Alves",
      phase: "no_event",
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dataMontagem: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dataDesmontagem: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      completionRate: 0,
      checklist: [
        { id: "c1", text: "Alinhar e conferir plantas do estande", done: false },
        { id: "c2", text: "Subir contrato comercial assinado", done: true },
        { id: "c3", text: "Comprar caibros e tintas homologadas", done: false },
        { id: "c4", text: "Registrar ART de montagem no CREA/CAU", done: false }
      ],
      assignedEmployees: [],
      assignedTools: [],
      hotelName: "",
      hotelCheckin: "",
      flightDetails: "",
      docs: [
        { id: "d1", name: "Contrato Comercial Integrado", status: "approved" },
        { id: "d2", name: "ART de Responsabilidade Técnica", status: "pending" }
      ],
      valorContratado: orc.total,
      valorRecebido: 0,
      valorPendente: orc.total,
      custoPrevisto: orc.total * 0.4,
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
        endereco: "Distrito Anhembi, São Paulo - SP",
        latitude: -23.514781,
        longitude: -46.643212,
        linkMaps: "https://maps.google.com",
        distanciaKm: 15,
        tempoEstimado: "20 min"
      }
    };

    setEvents((prev) => [newProj, ...prev]);
    setOrcamentos((prev) => prev.map((o) => o.id === orc.id ? { ...o, status: "arquivado" } : o));
    registerAudit("Conversão Proposta", `Orçamento ${orc.codigo} convertido com sucesso na OS ${newProj.codigo} e movido para Arquivados.`);
    alert(`Orçamento convertido com sucesso! Nova Ordem de Serviço criada: ${newProj.codigo}. O orçamento foi movido para Arquivados.`);
  };

  // Selected event details modal controller
  const [selectedEvent, setSelectedEvent] = useState<Project | null>(null);

  // Helper: registrar log na Auditoria
  const registerAudit = (acao: string, detalhes: string) => {
    const newLog: AuditoriaLog = {
      id: `log-${Date.now()}`,
      usuario: `Adrian (${userRole.toUpperCase()})`,
      acao,
      detalhes,
      date: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ip: "192.168.1.45" // Simulado
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const hasAccess = (tab: string) => {
    return canUserAccessTab(userRole, tab, activeModules);
  };

  // Add Event
  const addEvent = (name: string, client: string, startDate: string, extra?: Partial<Project>): Project => {
    const newEvent: Project = {
      id: `evt-${Date.now()}`,
      codigo: `EST-2026-${Date.now().toString().substring(10)}`,
      name,
      client,
      responsavel: extra?.responsavel || "Ricardo Mendes Alves",
      phase: extra?.phase || "no_event",
      startDate,
      endDate: extra?.endDate || new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dataMontagem: extra?.dataMontagem || new Date(new Date(startDate).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dataDesmontagem: extra?.dataDesmontagem || new Date(new Date(startDate).getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      completionRate: 0,
      checklist: extra?.checklist || [
        { id: "c1", text: "Avaliar plantas e projeto técnico do estande", done: false },
        { id: "c2", text: "Subir contrato comercial assinado", done: false },
        { id: "c3", text: "Alinhar e conferir logomarcas da marca", done: false },
        { id: "c4", text: "Comprar materiais para construção (mdf, caibros, tintas)", done: false },
        { id: "c5", text: "Pagar taxas e emitir ART/RRT de montagem", done: false },
        { id: "c6", text: "Escalar funcionários e enviar RG/CPF de todos", done: false },
        { id: "c7", text: "Organizar passagens aéreas e hotel da equipe", done: false },
        { id: "c8", text: "Conseguir termo de liberação assinado da organização", done: false }
      ],
      assignedEmployees: extra?.assignedEmployees || [],
      assignedTools: extra?.assignedTools || [],
      hotelName: extra?.hotelName || "",
      hotelCheckin: extra?.hotelCheckin || "",
      flightDetails: extra?.flightDetails || "",
      docs: extra?.docs || [
        { id: "d1", name: "Contrato de Prestação de Serviços", status: "pending" },
        { id: "d2", name: "ART/RRT de Responsabilidade Técnica", status: "pending" },
        { id: "d3", name: "Termo de Liberação Oficial do Pavilhão", status: "pending" }
      ],
      valorContratado: extra?.valorContratado || 150000.00,
      valorRecebido: 0,
      valorPendente: extra?.valorContratado || 150000.00,
      custoPrevisto: (extra?.valorContratado || 150000.00) * 0.4,
      custoRealizado: 0,
      nomeFeira: extra?.nomeFeira || name,
      cidadeEvento: extra?.cidadeEvento || "São Paulo - SP",
      centroCusto: extra?.centroCusto || {
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
      mapsRoute: extra?.mapsRoute || {
        endereco: extra?.cidadeEvento || "Pavilhão de Exposições Anhembi, São Paulo - SP",
        latitude: -23.514,
        longitude: -46.643,
        linkMaps: "https://maps.google.com",
        distanciaKm: 12.0,
        tempoEstimado: "20 min"
      },
      ...extra
    };
    setEvents((prev) => [newEvent, ...prev]);
    registerAudit("Criação de Evento", `Adicionado estande "${name}" para o cliente "${client}"`);
    return newEvent;
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
    
    // Se o lead já é adicionado como aprovado, cria-se o cliente na tabela
    if (lead.estagio === "aprovado") {
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

    // Adiciona na lista de clientes ao aprovar o negócio
    if (novoEstagio === "aprovado" && lead) {
      const alreadyExists = clientes.some(c => c.name === lead.empresa);
      if (!alreadyExists) {
        setClientes(prev => [...prev, { name: lead.empresa, email: lead.email || "contato@cliente.com", cnpj: "00.000.000/0001-00" }]);
        addEvent(`Stand ${lead.empresa}${ lead.nomeFeira ? " - " + lead.nomeFeira : " - Feira 2026"}`, lead.empresa, "2026-09-10");
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

  // Add WMS Warehouse Item
  const addWarehouseItem = (newItem: Omit<WarehouseItem, "id">) => {
    const item: WarehouseItem = {
      ...newItem,
      id: `item-${Date.now()}`
    };
    setWarehouseItems((prev) => [...prev, item]);
    registerAudit("Adição WMS", `Novo material "${item.name}" adicionado ao estoque`);
  };

  // Delete WMS Warehouse Item
  const deleteWarehouseItem = (id: string) => {
    const item = warehouseItems.find(i => i.id === id);
    setWarehouseItems((prev) => prev.filter(i => i.id !== id));
    registerAudit("Exclusão WMS", `Material "${item?.name}" excluído do estoque`);
  };

  // Delete Employee RH
  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees((prev) => prev.filter(e => e.id !== id));
    registerAudit("Exclusão RH", `Colaborador "${emp?.name}" excluído do sistema`);
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

  // Add Event / OS
  const handleAddEvent = (name: string, client: string, startDate: string): Project => {
    const newEvt: Project = {
      id: `evt-${Date.now()}`,
      codigo: `EST-2026-00${events.length + 1}`,
      name,
      client,
      responsavel: "Coordenador de Montagem",
      phase: "Montagem",
      startDate,
      endDate: startDate,
      dataMontagem: startDate,
      dataDesmontagem: startDate,
      completionRate: 0,
      checklist: [
        { id: "c1", text: "Aprovação de planta baixa e layout", done: false },
        { id: "c2", text: "Emissão de ART/RRT e taxas", done: false },
        { id: "c3", text: "Carregamento e romaneio de materiais", done: false },
        { id: "c4", text: "Credenciamento de equipe de montagem", done: false }
      ],
      assignedEmployees: [],
      assignedTools: [],
      hotelName: "Hotel Reis Magos Natal",
      hotelCheckin: startDate,
      flightDetails: "Equipe Local",
      docs: [
        { id: "d1", name: "Projeto Técnico PDF", status: "pending" },
        { id: "d2", name: "Credencial Pavilhão", status: "pending" }
      ],
      valorContratado: 25000,
      valorRecebido: 0,
      valorPendente: 25000,
      custoPrevisto: 12000,
      custoRealizado: 0,
      centroCusto: {
        madeiraMdf: 3000,
        vidrosVidraçaria: 0,
        iluminacaoEletrica: 1500,
        mobiliarioAlugado: 2000,
        fretes: 1000,
        combustivelPedagios: 500,
        hospedagemPassagens: 1500,
        equipePropria: 2500,
        terceirizados: 0,
        taxasOrganizador: 0
      },
      mapsRoute: {
        endereco: "Centro de Convenções de Natal - Via Costeira",
        latitude: -5.865700,
        longitude: -35.188100,
        linkMaps: "https://maps.google.com/?q=Centro+de+Convencoes+Natal",
        distanciaKm: 15,
        tempoEstimado: "30 min"
      }
    };
    setEvents(prev => [newEvt, ...prev]);
    registerAudit("Nova Ordem de Serviço", `OS "${name}" criada com código ${newEvt.codigo}`);
    return newEvt;
  };

  const deleteEvent = (id: string) => {
    const evt = events.find(e => e.id === id);
    setEvents((prev) => prev.filter(e => e.id !== id));
    registerAudit("Exclusão de Evento", `Evento "${evt?.name}" excluído definitivamente.`);
  };

  // ── Calculations for Overview KPIs ──
  const scheduledCount = events.reduce((acc, curr) => acc + curr.assignedEmployees.length, 0);
  const lowStockCount = warehouseItems.filter(item => item.stock <= item.stockMinimo).length;
  const pendingDocsCount = events
    .filter(e => e.phase !== "post")
    .reduce((acc, curr) => acc + curr.docs.filter(d => d.status === "pending").length, 0);

  // Panel visibility flags
  const [showTasksPanel, setShowTasksPanel] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [deepLinkOsId, setDeepLinkOsId] = useState<string>("");
  const [deepLinkItemId, setDeepLinkItemId] = useState<string>("");

  const tasksPanelRef = useRef<HTMLDivElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  // Close top nav popups/panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTasksPanel && tasksPanelRef.current && !tasksPanelRef.current.contains(event.target as Node)) {
        setShowTasksPanel(false);
      }
      if (showNotifPanel && notifPanelRef.current && !notifPanelRef.current.contains(event.target as Node)) {
        setShowNotifPanel(false);
      }
      if (isSearchOpen && searchPanelRef.current && !searchPanelRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTasksPanel, showNotifPanel, isSearchOpen]);

  // Password recovery & Modal states
  const [isBankReconciliationModalOpen, setIsBankReconciliationModalOpen] = useState(false);

  const handleAddInvoice = (newInv: Omit<InvoiceLog, "id">) => {
    const inv: InvoiceLog = { ...newInv, id: `inv-${Date.now()}` };
    setInvoiceLogs(prev => [inv, ...prev]);
    registerAudit("Nova Transação", `Lançamento financeiro de R$ ${inv.value} (${inv.description}) cadastrado.`);
  };

  const handleUpdateInvoice = (updated: InvoiceLog) => {
    setInvoiceLogs(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    registerAudit("Atualização Financeira", `Transação "${updated.description}" atualizada.`);
  };

  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryCpf, setRecoveryCpf] = useState("");
  const [recoveryDob, setRecoveryDob] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<"validate" | "reset">("validate");
  const [newPassword, setNewPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("adrian@jceventosrn.com.br");
  const [crmSubTab, setCrmSubTab] = useState<"pipeline" | "clientes" | "fornecedores">("pipeline");
  const [financialSubTab, setFinancialSubTab] = useState<string | undefined>(undefined);
  const [wmsSubTab, setWmsSubTab] = useState<"inventario" | "locacoes" | "entradas" | "ajustes">("inventario");
  const [employeesSubTab, setEmployeesSubTab] = useState<"cadastro" | "produtividade">("cadastro");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.includes("comercial")) setUserRole("comercial");
    else if (loginEmail.includes("estoque") || loginEmail.includes("almoxarifado")) setUserRole("estoque");
    else if (loginEmail.includes("operador")) setUserRole("operador");
    else setUserRole("admin");

    setIsLoggedIn(true);
    registerAudit("Login de Usuário", `Login efetuado no sistema via portal JC Eventos como ${userRole}`);
  };

  const handleValidateRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCpf || !recoveryDob) {
      alert("Por favor, informe seu CPF e a Data de Nascimento para prosseguir.");
      return;
    }
    const cleanInputCpf = recoveryCpf.replace(/\D/g, "");
    
    const matchedEmployee = employees.find(emp => {
      const cleanEmpCpf = emp.cpf ? emp.cpf.replace(/\D/g, "") : "";
      return cleanEmpCpf === cleanInputCpf && emp.dataNascimento === recoveryDob;
    });

    if (!matchedEmployee) {
      alert("CPF ou Data de Nascimento não encontrados no cadastro. Verifique os dados digitados e tente novamente.");
      return;
    }

    alert(`Acesso validado com sucesso para ${matchedEmployee.name}! Informe sua nova senha abaixo.`);
    setRecoveryStep("reset");
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    alert("Senha redefinida com sucesso! Você já pode realizar o login com sua nova senha.");
    setShowPasswordRecovery(false);
    setRecoveryStep("validate");
    setRecoveryCpf("");
    setRecoveryDob("");
    setNewPassword("");
  };

  const navigateToTab = (tab: string, subTab?: string) => {
    setActiveTab(tab as any);
    if (subTab) {
      if (tab === "crm") setCrmSubTab(subTab as any);
      else if (tab === "financial") setFinancialSubTab(subTab);
      else if (tab === "warehouse") setWmsSubTab(subTab as any);
      else if (tab === "employees") setEmployeesSubTab(subTab as any);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--bg-main)", fontFamily: "var(--font)", padding: "20px" }}>
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "420px", boxShadow: "var(--shadow-lg)", textAlign: "center", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Logo Oficial JC Eventos */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "linear-gradient(135deg, #144580 0%, #1a5296 100%)",
              borderRadius: "16px",
              padding: "16px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(20, 69, 128, 0.35)"
            }}>
              <img src={logoImg} alt="JC Eventos" style={{ height: "52px", objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Portal de Operações ERP</span>
          </div>

          {!showPasswordRecovery ? (
            /* Form de Login sem perfil operacional manual */
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>Usuário / E-mail</label>
                <input 
                  type="text" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required 
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>Senha de Acesso</label>
                <input 
                  type="password" 
                  defaultValue="••••••••" 
                  required 
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", outline: "none", backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }}
                />
              </div>

              <div style={{ textAlign: "right", marginTop: "-6px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordRecovery(true)} 
                  style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                >
                  Esqueci minha senha
                </button>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: "100%", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", display: "flex", justifyContent: "center", marginTop: "8px" }}
              >
                Entrar no Sistema
              </button>
            </form>
          ) : (
            /* Modal / Tela de Recuperação de Senha */
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent)", marginBottom: "8px" }}>Recuperação de Senha</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Informe seu CPF e Data de Nascimento cadastrados para validar o acesso e redefinir sua senha.
              </p>

              {recoveryStep === "validate" ? (
                <form onSubmit={handleValidateRecovery} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>CPF Registrado</label>
                    <input 
                      type="text" 
                      placeholder="000.000.000-00" 
                      value={recoveryCpf} 
                      onChange={(e) => setRecoveryCpf(e.target.value)} 
                      required 
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Data de Nascimento</label>
                    <input 
                      type="date" 
                      value={recoveryDob} 
                      onChange={(e) => setRecoveryDob(e.target.value)} 
                      required 
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "12px" }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowPasswordRecovery(false)} style={{ flex: 1 }}>Cancelar</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Validar Acesso</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Nova Senha</label>
                    <input 
                      type="password" 
                      placeholder="Digite a nova senha..." 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "12px" }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowPasswordRecovery(false)} style={{ flex: 1 }}>Cancelar</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Redefinir Senha</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer details */}
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "10px" }}>
            <p>JC Design de Stands Ltda. Todos os direitos reservados.</p>
            <p style={{ marginTop: "2px" }}>Natal/RN - jceventosrn.com.br</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-wrapper">
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <div className="top-nav-left">
          <a href="#" className="top-nav-logo" onClick={(e) => { e.preventDefault(); setActiveTab("overview"); }} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <div style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(4px)",
              borderRadius: "10px",
              padding: "5px 14px",
              display: "flex",
              alignItems: "center",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <img src={logoImg} alt="JC Eventos" style={{ height: "30px", objectFit: "contain" }} />
            </div>
          </a>

          {/* Flat Direct Navigation — 7 items, no nested dropdowns */}
          <nav className="top-nav-menu" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <button
              className={`menu-group-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
              title="Dashboard"
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>

            {hasAccess("kanban") && (
              <button
                className={`menu-group-btn ${activeTab === "kanban" ? "active" : ""}`}
                onClick={() => setActiveTab("kanban")}
                title="Projetos / Kanban de Stands"
              >
                <Briefcase size={14} /> Projetos
              </button>
            )}

            {hasAccess("crm") && (
              <button
                className={`menu-group-btn ${activeTab === "crm" ? "active" : ""}`}
                onClick={() => setActiveTab("crm")}
                title="CRM & Clientes"
              >
                <Building2 size={14} /> CRM
              </button>
            )}

            {hasAccess("orcamentos") && (
              <button
                className={`menu-group-btn ${activeTab === "orcamentos" ? "active" : ""}`}
                onClick={() => setActiveTab("orcamentos")}
                title="Propostas Comerciais"
              >
                <FileText size={14} /> Propostas
              </button>
            )}

            {hasAccess("os") && (
              <button
                className={`menu-group-btn ${activeTab === "os" ? "active" : ""}`}
                onClick={() => setActiveTab("os")}
                title="Ordens de Serviço"
              >
                <CheckSquare size={14} /> OS
              </button>
            )}

            {hasAccess("warehouse") && (
              <button
                className={`menu-group-btn ${activeTab === "warehouse" ? "active" : ""}`}
                onClick={() => setActiveTab("warehouse")}
                title="Depósito & WMS"
              >
                <Archive size={14} /> Depósito
              </button>
            )}

            {hasAccess("financial") && (
              <button
                className={`menu-group-btn ${activeTab === "financial" ? "active" : ""}`}
                onClick={() => setActiveTab("financial")}
                title="Financeiro"
              >
                <DollarSign size={14} /> Financeiro
              </button>
            )}

            {hasAccess("employees") && (
              <button
                className={`menu-group-btn ${activeTab === "employees" ? "active" : ""}`}
                onClick={() => setActiveTab("employees")}
                title="Equipe & RH"
              >
                <Users size={14} /> Equipe
              </button>
            )}

            {hasAccess("logistics") && (
              <button
                className={`menu-group-btn ${activeTab === "logistics" ? "active" : ""}`}
                onClick={() => setActiveTab("logistics")}
                title="Logística & Viagens"
              >
                <Truck size={14} /> Logística
              </button>
            )}
          </nav>
        </div>

        {/* Right Area */}
        <div className="top-nav-right">
          {/* Global search */}
          {/* Global search Icon button & Expandable Bar */}
          <div ref={searchPanelRef} style={{ position: "relative" }}>
            <button 
              className={`top-nav-icon-btn ${isSearchOpen ? "active" : ""}`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Pesquisa Global"
            >
              <Search size={18} />
            </button>

            {isSearchOpen && (
              <div style={{
                position: "absolute", top: "100%", right: 0, width: "340px",
                backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "14px", boxShadow: "var(--shadow-lg)", zIndex: 1100,
                marginTop: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                  <Search size={16} style={{ color: "var(--accent)" }} />
                  <input 
                    type="text" 
                    placeholder="Buscar no sistema (Projetos, Leads, WMS, RH)..." 
                    value={globalSearch} 
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    autoFocus
                    style={{ width: "100%", border: "none", outline: "none", background: "none", fontSize: "13px", color: "var(--text-primary)" }}
                  />
                  <button 
                    onClick={() => { setIsSearchOpen(false); setGlobalSearch(""); }} 
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
                  >
                    ×
                  </button>
                </div>

                {globalSearch.trim().length > 0 && (
                  <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {(() => {
                      const term = globalSearch.trim().toLowerCase();
                      type SearchMatch = { name: string; tab: string; subTab?: string; category: string; event?: Project };

                      const subTabModules: SearchMatch[] = [
                        { name: "Dashboard Executivo", tab: "overview", category: "Módulo Principal" },
                        { name: "Projetos (Quadro Kanban)", tab: "kanban", category: "Módulo Principal" },
                        { name: "CRM & Oportunidades (Pipeline / Funil)", tab: "crm", subTab: "pipeline", category: "Sub-aba CRM" },
                        { name: "Clientes Homologados (Dossiê Comercial)", tab: "crm", subTab: "clientes", category: "Sub-aba CRM" },
                        { name: "Fornecedores Homologados (CRM)", tab: "crm", subTab: "fornecedores", category: "Sub-aba CRM" },
                        { name: "Propostas Comerciais & Orçamentos", tab: "orcamentos", category: "Módulo Principal" },
                        { name: "Ordens de Serviço (OS & Checklists)", tab: "os", category: "Módulo Principal" },
                        { name: "Depósito & WMS (Inventário Físico)", tab: "warehouse", subTab: "inventario", category: "Sub-aba WMS" },
                        { name: "Locações de Materiais (WMS)", tab: "warehouse", subTab: "locacoes", category: "Sub-aba WMS" },
                        { name: "Entradas de Material & NF (WMS)", tab: "warehouse", subTab: "entradas", category: "Sub-aba WMS" },
                        { name: "Ajustes de Estoque & Perdas (WMS)", tab: "warehouse", subTab: "ajustes", category: "Sub-aba WMS" },
                        { name: "Financeiro: Fluxo de Caixa & DRE", tab: "financial", subTab: "fluxo", category: "Sub-aba Financeiro" },
                        { name: "Financeiro: Contas a Pagar", tab: "financial", subTab: "pagar", category: "Sub-aba Financeiro" },
                        { name: "Financeiro: Contas a Receber", tab: "financial", subTab: "receber", category: "Sub-aba Financeiro" },
                        { name: "Financeiro: Boletos Bancários", tab: "financial", subTab: "boletos", category: "Sub-aba Financeiro" },
                        { name: "Financeiro: Notas Fiscais (NF-e / NFS-e)", tab: "financial", subTab: "nfe", category: "Sub-aba Financeiro" },
                        { name: "Financeiro: Centro de Custos por Projeto", tab: "financial", subTab: "centro_custo", category: "Sub-aba Financeiro" },
                        { name: "Financeiro: Caixinha & Reembolsos", tab: "financial", subTab: "caixinha", category: "Sub-aba Financeiro" },
                        { name: "Equipe & RH (Ficha do Colaborador)", tab: "employees", subTab: "cadastro", category: "Sub-aba RH" },
                        { name: "Equipe & RH (Avaliação de Produtividade)", tab: "employees", subTab: "produtividade", category: "Sub-aba RH" },
                        { name: "Logística, Frota & Viagens", tab: "logistics", category: "Módulo Principal" },
                        { name: "Agenda & Calendário Operacional", tab: "agenda", category: "Módulo Principal" },
                        { name: "Auditoria & Logs de Segurança", tab: "auditoria", category: "Módulo Principal" }
                      ];

                      const cleanDigits = term.replace(/\D/g, "");
                      const matches: SearchMatch[] = [
                        ...subTabModules.filter(m => m.name.toLowerCase().includes(term)),
                        ...clientes.filter(c => c.name.toLowerCase().includes(term) || c.cnpj.includes(term) || c.email.toLowerCase().includes(term)).map(c => ({ name: `${c.name} (${c.cnpj})`, tab: "crm", subTab: "clientes", category: "Cliente Homologado" })),
                        ...fornecedores.filter(f => f.name.toLowerCase().includes(term) || f.servico.toLowerCase().includes(term)).map(f => ({ name: `${f.name} — ${f.servico}`, tab: "crm", subTab: "fornecedores", category: "Fornecedor Homologado" })),
                        ...leads.filter(l => l.empresa.toLowerCase().includes(term) || l.contato.toLowerCase().includes(term) || (cleanDigits.length > 2 && l.valorEstimado.toString().includes(cleanDigits))).map(l => ({ name: `Lead: ${l.empresa} (R$ ${l.valorEstimado})`, tab: "crm", subTab: "pipeline", category: "Lead CRM" })),
                        ...events.filter(e => e.name.toLowerCase().includes(term) || e.client.toLowerCase().includes(term) || e.codigo.toLowerCase().includes(term) || (cleanDigits.length > 2 && (e.valorContratado.toString().includes(cleanDigits) || e.valorPendente.toString().includes(cleanDigits)))).map(e => ({ name: `${e.codigo} · ${e.name} (R$ ${e.valorContratado})`, tab: "kanban", event: e, category: "Projeto/OS" })),
                        ...warehouseItems.filter(i => i.name.toLowerCase().includes(term) || i.codigo.toLowerCase().includes(term) || i.marca?.toLowerCase().includes(term)).map(i => ({ name: `${i.codigo} · ${i.name}`, tab: "warehouse", subTab: "inventario", category: "Item WMS" })),
                        ...employees.filter(emp => emp.name.toLowerCase().includes(term) || emp.role.toLowerCase().includes(term)).map(emp => ({ name: `${emp.name} (${emp.role})`, tab: "employees", subTab: "cadastro", category: "Colaborador" })),
                        ...orcamentos.filter(o => o.codigo.toLowerCase().includes(term) || o.cliente.toLowerCase().includes(term) || (cleanDigits.length > 2 && o.total.toString().includes(cleanDigits))).map(o => ({ name: `${o.codigo} — ${o.cliente} (R$ ${o.total})`, tab: "orcamentos", category: "Proposta Comercial" })),
                        ...invoiceLogs.filter(inv => inv.invoiceNumber.toLowerCase().includes(term) || inv.vendor.toLowerCase().includes(term) || inv.description.toLowerCase().includes(term) || (cleanDigits.length > 2 && inv.value.toString().includes(cleanDigits))).map(inv => ({ name: `${inv.invoiceNumber} — ${inv.vendor} (R$ ${inv.value})`, tab: "financial", subTab: inv.tipo === "receita" ? "receber" : "pagar", category: "Financeiro" }))
                      ];

                      if (matches.length === 0) {
                        return (
                          <div style={{ padding: "12px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                            Nenhum registro correspondente.
                          </div>
                        );
                      }

                      return matches.slice(0, 12).map((match, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            if (match.event) setSelectedEvent(match.event);
                            navigateToTab(match.tab, match.subTab);
                            setGlobalSearch("");
                            setIsSearchOpen(false);
                          }}
                          style={{
                            padding: "8px 10px", borderRadius: "6px", cursor: "pointer",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            fontSize: "12px"
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-main)")}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{match.name}</span>
                          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--accent-glow)", color: "var(--accent)", fontWeight: "600" }}>{match.category}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme switcher */}
          <button 
            className="top-nav-icon-btn" 
            onClick={toggleTheme} 
            title={theme === "light" ? "Mudar para Modo Escuro" : "Mudar para Modo Claro"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Agenda quick access */}
          <button 
            className={`top-nav-icon-btn ${activeTab === "agenda" ? "active" : ""}`}
            onClick={() => setActiveTab("agenda")}
            title="Agenda do Dia"
          >
            <Calendar size={18} />
          </button>

          {/* Quick task checklist access */}
          <div className="menu-group" ref={tasksPanelRef} style={{ position: "relative" }}>
            <button
              className="top-nav-icon-btn"
              onClick={() => { setShowTasksPanel(p => !p); setShowNotifPanel(false); }}
              title="Tarefas Operacionais Pendentes"
            >
              <ClipboardCheck size={18} />
              {events.flatMap(evt => evt.checklist.filter(c => !c.done)).length > 0 && (
                <span className="icon-badge">
                  {events.flatMap(evt => evt.checklist.filter(c => !c.done)).length}
                </span>
              )}
            </button>

            {showTasksPanel && (() => {
              const pendingTasks = events.flatMap(evt =>
                evt.checklist
                  .filter(c => !c.done)
                  .map(c => ({ evtName: evt.name, evtCodigo: evt.codigo, text: c.text, id: c.id, evtId: evt.id, phase: evt.phase }))
              );
              return (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  width: "380px", maxHeight: "520px",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "16px", boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
                  zIndex: 9999, overflow: "hidden", display: "flex", flexDirection: "column"
                }}>
                  {/* Panel header — section-box-header style */}
                  <div className="section-box-header" style={{ padding: "16px 18px", margin: 0, borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ClipboardCheck size={16} style={{ color: "var(--accent)" }} />
                      </div>
                      <div>
                        <span className="section-box-title" style={{ fontSize: "13px" }}>Tarefas Pendentes</span>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{pendingTasks.length} itens não concluídos</p>
                      </div>
                    </div>
                    <button onClick={() => setShowTasksPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px", lineHeight: 1, padding: "4px" }}>✕</button>
                  </div>

                  {/* Scrollable list */}
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {pendingTasks.length === 0 ? (
                      <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                        ✅ Nenhuma tarefa pendente!
                      </div>
                    ) : (
                      <div className="event-feed-list" style={{ padding: "10px 12px", gap: "6px" }}>
                        {pendingTasks.map((t) => (
                          <div
                            key={`${t.evtId}-${t.id}`}
                            className="event-feed-card"
                            onClick={() => {
                              setDeepLinkOsId(t.evtId);
                              setActiveTab("os");
                              setShowTasksPanel(false);
                            }}
                            style={{ padding: "10px 12px", gap: "10px" }}
                          >
                            <div className="event-feed-info">
                              <div className="event-feed-avatar color-0" style={{ width: "34px", height: "34px", fontSize: "12px", borderRadius: "8px", flexShrink: 0 }}>
                                ✓
                              </div>
                              <div className="event-feed-meta">
                                <span className="event-feed-title" style={{ fontSize: "12px" }}>{t.text}</span>
                                <span className="event-feed-date">{t.evtCodigo} · {t.evtName}</span>
                              </div>
                            </div>
                            <span className="badge badge-warning" style={{ fontSize: "9px", whiteSpace: "nowrap", flexShrink: 0 }}>{t.phase}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
                    <button
                      onClick={() => { setDeepLinkOsId(""); setActiveTab("os"); setShowTasksPanel(false); }}
                      className="btn-primary"
                      style={{ width: "100%", padding: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Ver todas as OSs →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Notifications */}
          <div className="menu-group" ref={notifPanelRef} style={{ position: "relative" }}>
            <button
              className="top-nav-icon-btn"
              onClick={() => { setShowNotifPanel(p => !p); setShowTasksPanel(false); }}
              title="Notificações"
            >
              <Bell size={18} />
              {(lowStockCount > 0 || pendingDocsCount > 0) && (
                <span className="icon-badge">
                  {(lowStockCount > 0 ? 1 : 0) + (pendingDocsCount > 0 ? 1 : 0)}
                </span>
              )}
            </button>

            {showNotifPanel && (() => {
              type NotifItem = {
                icon: string;
                title: string;
                desc: string;
                tab?: string;
                osId?: string;
                badgeClass: string;
                badgeTxt: string;
                avatarClass: string;
              };
              const notifs: NotifItem[] = [];

              if (lowStockCount > 0) notifs.push({
                icon: "📦", title: "Estoque Crítico",
                desc: `${lowStockCount} ${lowStockCount === 1 ? "item abaixo" : "itens abaixo"} do estoque mínimo`,
                tab: "warehouse", badgeClass: "badge-danger", badgeTxt: "URGENTE", avatarClass: "color-1"
              });
              if (pendingDocsCount > 0) notifs.push({
                icon: "📄", title: "Documentos Pendentes",
                desc: `${pendingDocsCount} documento(s) aguardando aprovação`,
                tab: "os", badgeClass: "badge-warning", badgeTxt: "ATENÇÃO", avatarClass: "color-3"
              });

              events
                .filter(e => e.phase !== "Finalizado")
                .forEach(e => {
                  const daysUntil = Math.ceil((new Date(e.dataMontagem || e.startDate).getTime() - Date.now()) / 86400000);
                  if (daysUntil >= 0 && daysUntil <= 7) {
                    notifs.push({
                      icon: "📅",
                      title: `Montagem em ${daysUntil === 0 ? "hoje!" : daysUntil + (daysUntil === 1 ? " dia" : " dias")}`,
                      desc: `${e.name} — ${e.cidadeEvento || ""}`,
                      tab: "os", osId: e.id,
                      badgeClass: daysUntil <= 1 ? "badge-danger" : "badge-warning",
                      badgeTxt: e.codigo, avatarClass: daysUntil <= 1 ? "color-1" : "color-3"
                    });
                  }
                });

              const empPending = employees.filter(e => e.documentStatus === "pending");
              if (empPending.length > 0) notifs.push({
                icon: "👤", title: "Documentação de Colaboradores",
                desc: `${empPending.length} colaborador(es) com ficha incompleta`,
                tab: "employees", badgeClass: "badge-muted", badgeTxt: "PENDENTE", avatarClass: "color-2"
              });

              return (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  width: "380px", maxHeight: "520px",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "16px", boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
                  zIndex: 9999, overflow: "hidden", display: "flex", flexDirection: "column"
                }}>
                  {/* Panel header */}
                  <div className="section-box-header" style={{ padding: "16px 18px", margin: 0, borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--danger-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Bell size={16} style={{ color: "var(--danger)" }} />
                      </div>
                      <div>
                        <span className="section-box-title" style={{ fontSize: "13px" }}>Notificações</span>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{notifs.length} alerta(s) ativo(s)</p>
                      </div>
                    </div>
                    <button onClick={() => setShowNotifPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px", lineHeight: 1, padding: "4px" }}>✕</button>
                  </div>

                  {/* Scrollable list */}
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                        ✅ Nenhuma notificação pendente!
                      </div>
                    ) : (
                      <div className="event-feed-list" style={{ padding: "10px 12px", gap: "6px" }}>
                        {notifs.map((n, idx) => (
                          <div
                            key={idx}
                            className="event-feed-card"
                            onClick={() => {
                              if (n.tab) {
                                setActiveTab(n.tab as any);
                                if (n.osId) setDeepLinkOsId(n.osId);
                              }
                              setShowNotifPanel(false);
                            }}
                            style={{ padding: "10px 12px", gap: "10px", cursor: n.tab ? "pointer" : "default" }}
                          >
                            <div className="event-feed-info">
                              <div className={`event-feed-avatar ${n.avatarClass}`} style={{ width: "34px", height: "34px", fontSize: "16px", borderRadius: "8px", flexShrink: 0 }}>
                                {n.icon}
                              </div>
                              <div className="event-feed-meta">
                                <span className="event-feed-title" style={{ fontSize: "12px" }}>{n.title}</span>
                                <span className="event-feed-date">{n.desc}</span>
                              </div>
                            </div>
                            <span className={`badge ${n.badgeClass}`} style={{ fontSize: "9px", whiteSpace: "nowrap", flexShrink: 0 }}>{n.badgeTxt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Audit log quick access */}
          <button 
            className={`top-nav-icon-btn ${activeTab === "auditoria" ? "active" : ""}`}
            onClick={() => setActiveTab("auditoria")}
            title="Auditoria & Configurações"
          >
            <Shield size={18} />
          </button>

          {/* Profile Dropdown: ONLY circular avatar icon */}
          <div className="menu-group">
            <div className="top-nav-avatar" title={`Usuário: JCEventos (${userRole.toUpperCase()}) - Clique para alterar perfil`} style={{ cursor: "pointer", width: "36px", height: "36px", fontSize: "14px", fontWeight: "700" }}>
              JC
            </div>
            
            <div className="menu-dropdown" style={{ right: 0, left: "auto" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Alterar Nível de Acesso</span>
              </div>
              <button className={`dropdown-item ${userRole === "admin" ? "active" : ""}`} onClick={() => { setUserRole("admin"); registerAudit("Alteração de Perfil", "Nível de acesso alterado para ADMIN"); }}>
                Administrador Geral
              </button>
              <button className={`dropdown-item ${userRole === "comercial" ? "active" : ""}`} onClick={() => { setUserRole("comercial"); registerAudit("Alteração de Perfil", "Nível de acesso alterado para COMERCIAL"); }}>
                Comercial / Vendas
              </button>
              <button className={`dropdown-item ${userRole === "estoque" ? "active" : ""}`} onClick={() => { setUserRole("estoque"); registerAudit("Alteração de Perfil", "Nível de acesso alterado para ESTOQUE"); }}>
                Almoxarifado / Estoque
              </button>
              <button className={`dropdown-item ${userRole === "operador" ? "active" : ""}`} onClick={() => { setUserRole("operador"); registerAudit("Alteração de Perfil", "Nível de acesso alterado para OPERADOR"); }}>
                Operacional (OS/Montagem)
              </button>
              
              <div style={{ borderTop: "1px solid var(--border)", marginTop: "6px", paddingTop: "4px" }}>
                <button className="dropdown-item" onClick={() => { setIsLoggedIn(false); registerAudit("Logout de Usuário", "Usuário desconectou do sistema"); }} style={{ color: "var(--danger)" }}>
                  <LogOut size={14} /> Sair do Sistema
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="main-area">
        {/* Header */}
        <header className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "none", padding: "20px 24px 0 24px", background: "none", height: "auto" }}>
          <h2 className="page-title" style={{ fontSize: "20px", fontWeight: "700" }}>
            {activeTab === "overview" && "Painel Executivo da JC Eventos"}
            {activeTab === "crm" && "Gestão de Oportunidades & Leads"}
            {activeTab === "orcamentos" && "Propostas Comerciais & Orçamentos"}
            {activeTab === "os" && "Ordens de Serviço & Checklist Técnico"}
            {activeTab === "kanban" && "Quadro Operacional de Montagem"}
            {activeTab === "agenda" && "Calendário Integrado da JC"}
            {activeTab === "warehouse" && "Depósito, Organização Física & WMS"}
            {activeTab === "employees" && "Ficha de Equipe & Certificações NRs"}
            {activeTab === "financial" && "Contabilidade, Caixa & Centro de Custos"}
            {activeTab === "logistics" && "Coordenação de Frota, Voo & Hospedagem"}
            {activeTab === "auditoria" && "Trilha de Segurança e Auditoria Geral"}
          </h2>
        </header>

        {/* Content Wrapper */}
        <section className="content-wrapper">
          {activeTab === "overview" && (
            <Overview 
              events={events}
              employees={employees}
              warehouseItems={warehouseItems}
              employeesCount={scheduledCount}
              lowStockItemsCount={lowStockCount}
              pendingDocsCount={pendingDocsCount}
              invoices={invoiceLogs}
              orcamentos={orcamentos}
              onNavigateToTab={navigateToTab}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onUpdateStock={updateStock}
              onUpdateEvent={updateEventDetails}
              onOpenBankReconciliation={() => setIsBankReconciliationModalOpen(true)}
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
              initialSubTab={crmSubTab}
            />
          )}

          {activeTab === "orcamentos" && (
            <Orcamentos 
              orcamentos={orcamentos}
              warehouseItems={warehouseItems}
              clientes={clientes}
              events={events}
              onAddEvent={addEvent}
              onAddOrcamento={handleAddOrcamento}
              onUpdateOrcamento={handleUpdateOrcamento}
              onConvertToOS={handleConvertToOS}
            />
          )}

          {activeTab === "os" && (
            <OrdensServico 
              events={events}
              allEmployees={employees}
              allWarehouseItems={warehouseItems}
              onUpdateEvent={updateEventDetails}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onAddOS={handleAddEvent}
              initialOsId={deepLinkOsId}
            />
          )}

          {activeTab === "kanban" && (
            <KanbanBoards 
              events={events}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onAddEvent={addEvent}
              onUpdateEventPhase={updateEventPhase}
              onDeleteEvent={deleteEvent}
              onReorderEvents={(newEvents) => setEvents(newEvents)}
            />
          )}

          {activeTab === "agenda" && (
            <Agenda 
              events={events}
              employees={employees}
              invoices={invoiceLogs}
              leads={leads}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          )}

          {activeTab === "warehouse" && (
            <WmsModule 
              items={warehouseItems}
              onUpdateStock={updateStock}
              onUpdateWarehouseItem={updateWarehouseItem}
              onAddWarehouseItem={addWarehouseItem}
              onDeleteWarehouseItem={deleteWarehouseItem}
              initialSubTab={wmsSubTab}
              initialSelectedItemId={deepLinkItemId}
            />
          )}

          {activeTab === "employees" && (
            <Employees 
              employees={employees}
              onAddEmployee={addEmployee}
              onToggleDocStatus={toggleDocStatus}
              onToggleSafetyCert={toggleSafetyCert}
              onUpdateEmployee={updateEmployee}
              onDeleteEmployee={deleteEmployee}
              initialSubTab={employeesSubTab}
            />
          )}

          {activeTab === "financial" && (
            <Financial 
              invoices={invoiceLogs}
              events={events}
              fornecedores={fornecedores}
              onAddInvoice={addInvoice}
              onUpdateInvoice={updateInvoice}
              onUpdateEvent={updateEvent}
              initialSubTab={financialSubTab}
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
          allEvents={events}
          allOrcamentos={orcamentos}
          onClose={() => setSelectedEvent(null)}
          onUpdateEvent={updateEventDetails}
          onDeleteEvent={deleteEvent}
        />
      )}

      {/* Modal Configurar Módulos ERP (Ativar/Desativar Módulos JC Eventos) */}
      <div 
        id="modules-config-modal"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "none", alignItems: "center", justifyContent: "center", zIndex: 100 }}
        onClick={() => {
          const target = document.getElementById("modules-config-modal");
          if (target) target.style.display = "none";
        }}
      >
        <div 
          style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "var(--shadow-lg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--accent)" }}>Configurar Módulos Ativos no ERP</h3>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>Marque ou desmarque os módulos abaixo para ativar/desativar funcionalidades em tempo real.</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
            {Object.keys(activeModules).map((moduleKey) => (
              <label key={moduleKey} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", textTransform: "capitalize" }}>
                <input 
                  type="checkbox" 
                  checked={activeModules[moduleKey]} 
                  onChange={(e) => {
                    setActiveModules(prev => {
                      const updated = { ...prev, [moduleKey]: e.target.checked };
                      registerAudit("Configuração Módulos", `Módulo ${moduleKey.toUpperCase()} alterado para ${e.target.checked ? "ATIVO" : "INATIVO"}`);
                      return updated;
                    });
                  }} 
                />
                <span>{moduleKey === "crm" ? "CRM & Clientes" : moduleKey === "orcamentos" ? "Orçamentos" : moduleKey === "os" ? "Ordens de Serviço" : moduleKey === "ia" ? "IA Copilot" : moduleKey === "auditoria" ? "Auditoria" : moduleKey}</span>
              </label>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button 
              type="button" 
              className="btn-primary text-xs" 
              onClick={() => {
                const target = document.getElementById("modules-config-modal");
                if (target) target.style.display = "none";
              }}
              style={{ padding: "6px 12px", borderRadius: "6px" }}
            >
              Fechar e Salvar
            </button>
          </div>
        </div>
      </div>

      {isBankReconciliationModalOpen && (
        <BankReconciliationModal
          isOpen={isBankReconciliationModalOpen}
          onClose={() => setIsBankReconciliationModalOpen(false)}
          invoices={invoiceLogs}
          onAddInvoice={handleAddInvoice}
          onUpdateInvoice={handleUpdateInvoice}
        />
      )}
    </div>
  );
}
