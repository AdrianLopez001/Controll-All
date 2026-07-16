export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface AssignedEmployee {
  id: string;
  name: string;
  role: string;
  documentStatus: "complete" | "pending";
}

export interface AssignedTool {
  id: string;
  name: string;
  type: "tool" | "furniture";
  allocatedQty: number;
}

export interface EventoMapsRoute {
  endereco: string;
  latitude: number;
  longitude: number;
  linkMaps: string;
  distanciaKm: number;
  tempoEstimado: string;
}

export interface CentroDeCusto {
  madeiraMdf: number;
  vidrosVidraçaria: number;
  iluminacaoEletrica: number;
  mobiliarioAlugado: number;
  fretes: number;
  combustivelPedagios: number;
  hospedagemPassagens: number;
  equipePropria: number;
  terceirizados: number;
  taxasOrganizador: number;
}

export interface ProjectDoc {
  id: string;
  name: string;
  status: "pending" | "approved" | "uploaded";
}

export interface ConventionCenterRules {
  nome: string;
  taxaEnergia: number;
  taxaLimpeza: number;
  limiteAltura: string;
  artObrigatoria: boolean;
  brigadistaObrigatorio: boolean;
  seguroObrigatorio: boolean;
  estacionamento: number;
  contatoGestor: string;
}

export interface ProductionSectors {
  marcenaria: "pendente" | "em_andamento" | "concluido";
  pintura: "pendente" | "em_andamento" | "concluido";
  eletrica: "pendente" | "em_andamento" | "concluido";
  comunicacaoVisual: "pendente" | "em_andamento" | "concluido";
  vidros: "pendente" | "em_andamento" | "concluido";
  limpeza: "pendente" | "em_andamento" | "concluido";
}

export interface Project {
  id: string;
  codigo: string;
  name: string;
  client: string;
  responsavel: string;
  phase: "no_event" | "during" | "post";
  startDate: string;
  endDate: string;
  dataMontagem: string;
  dataDesmontagem: string;
  completionRate: number;
  checklist: ChecklistItem[];
  assignedEmployees: AssignedEmployee[];
  assignedTools: AssignedTool[];
  hotelName: string;
  hotelCheckin: string;
  flightDetails: string;
  docs: ProjectDoc[];
  
  // JC Eventos 2.0 financial metrics
  valorContratado: number;
  valorRecebido: number;
  valorPendente: number;
  custoPrevisto: number;
  custoRealizado: number;
  centroCusto: CentroDeCusto;
  mapsRoute: EventoMapsRoute;
  
  // JC Eventos 3.0 expanded properties
  centroConvencoes?: string;
  regrasCentro?: ConventionCenterRules;
  producao?: ProductionSectors;
}

export interface AtivoHistorico {
  id: string;
  tipo: "retirada_ferramenta" | "devolucao_ferramenta" | "recebimento_dinheiro" | "recebimento_ativo" | "viagem";
  descricao: string;
  date: string;
  responsavel: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  documentStatus: "complete" | "pending";
  hasSafetyCert: boolean; // Keep for existing components compatibility
  
  // JC Eventos 2.0 fields
  foto: string;
  cpf: string;
  rg: string;
  cnh: string;
  pixKey: string;
  salario: number;
  nr10Vencimento: string; // "YYYY-MM-DD" or empty
  nr35Vencimento: string; // "YYYY-MM-DD" or empty
  historicoAtivos: AtivoHistorico[];
  
  // JC Eventos 2.1 attachments
  anexos?: { id: string; name: string; date: string }[];
}

export interface WmsLocalizacao {
  galpao: string;
  corredor: string;
  rua: string;
  prateleira: string;
  andar: string;
  posicao: string;
}

export interface WmsLocacaoItem {
  id: string;
  responsavel: string;
  dataSaida: string;
  dataRetorno: string;
  dias: number;
  valor: number;
  status: string;
  contratoAnexo?: string;
}

export interface WarehouseItem {
  id: string;
  name: string;
  type: "tool" | "furniture";
  stock: number;
  
  // JC Eventos 2.0 fields
  codigo: string;
  qrCode: string;
  marca: string;
  modelo: string;
  patrimonio: string;
  estadoConservacao: "excelente" | "bom" | "regular" | "manutencao";
  valorCompra: number;
  valorVenda: number;
  valorLocacao: number;
  stockMinimo: number;
  origem: "proprio" | "alugado" | "terceirizado" | "emprestado" | "consignado";
  localizacaoFisica: WmsLocalizacao;
  
  // JC Eventos 2.1 locacoes
  locacoesDetalhadas?: WmsLocacaoItem[];
}

export interface InvoiceLog {
  id: string;
  vendor: string;
  invoiceNumber: string;
  value: number;
  description: string;
  date: string;
  
  // JC Eventos 2.0 financial transactions extensions
  tipo: "receita" | "despesa";
  categoria: string; // ex: "Madeira", "Passagem", "Diária"
  formaPagamento: "Pix" | "Boleto" | "TED" | "Dinheiro";
  status: "pago" | "pendente" | "atrasado";
  eventoId?: string; // Vínculo com projeto
  comprovante?: string; // Simulação de anexo
  
  // JC Eventos 2.1 fields
  pdfBoleto?: string;
  pdfNFe?: string;
  anexos?: { id: string; name: string; date: string }[];
}

export interface AuditoriaLog {
  id: string;
  usuario: string;
  acao: string;
  detalhes: string;
  date: string;
  hora: string;
  ip: string;
}

export interface CRMProjetoDetalhado {
  custoEstimado: number;
  locacaoEstimada: number;
  endereco: string;
  materiais: string;
  equipe: string;
}

export interface LeadCRM {
  id: string;
  empresa: string;
  contato: string;
  cargo: string;
  email: string;
  telefone: string;
  valorEstimado: number;
  origem: string;
  estagio: "prospect" | "negociacao" | "fechado" | "perdido";
  dataCriacao: string;
  observacoes: string;
  
  // JC Eventos 2.1 fields
  anexos?: { id: string; name: string; date: string }[];
  projetoDetalhado?: CRMProjetoDetalhado;
}

export interface VeiculoLogistica {
  id: string;
  modelo: string;
  placa: string;
  kmAtual: number;
  motoristaAtivo: string;
  status: "disponivel" | "em_viagem" | "manutencao";
  combustivelCard: boolean;
}
