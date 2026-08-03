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
  equipe?: string;
  horario?: string;
  observacoes?: string;
  terceirizado?: boolean;
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
  fornecedoresDespesas?: { [categoria: string]: string };
}

export interface ProjectDoc {
  id: string;
  name: string;
  status: "pending" | "approved" | "uploaded";
}

export interface OSComentario {
  id: string;
  autor: string;
  texto: string;
  date: string;
}

export interface OSFoto {
  id: string;
  name: string;
  url: string;
  date: string;
  categoria?: "antes" | "depois";
}

export interface OSAssinaturas {
  clienteAssinatura?: string;
  responsavelAssinatura?: string;
  dataAssinatura?: string;
}

export interface OSHistoricoLog {
  id: string;
  campo: string;
  antes: string;
  depois: string;
  date: string;
  usuario: string;
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

export interface ComprovanteLogistica {
  id: string;
  nome: string;
  tipo: string; // "pdf" | "imagem" | "excel" | "outro"
  sizeBytes?: number;
  url: string;  // Data URL or Blob URL
  dataEnvio: string;
}

export interface Project {
  id: string;
  codigo: string;
  name: string;
  client: string;
  responsavel: string;
  phase: string; // Stages: "Briefing", "Orçamento", "Aprovado", "Produção", "Montagem", "Evento", "Desmontagem", "Finalizado"
  startDate: string; // data de início do evento
  endDate: string;   // data fim do evento
  dataMontagem: string;
  dataDesmontagem: string;
  completionRate: number;
  checklist: ChecklistItem[];
  assignedEmployees: AssignedEmployee[];
  assignedTools: AssignedTool[];
  hotelName: string;
  hotelCheckin: string;
  flightDetails: string;
  comprovantesLogistica?: ComprovanteLogistica[];
  docs: ProjectDoc[];

  // JC Eventos — Campos específicos de montagem de estandes
  tipoEstande?: "padrao" | "misto" | "construido"; // Stand Padrão (Octanorm), Misto, Construído (projeto exclusivo)
  areaM2?: number;         // Dimensão do estande em m²
  nomeFeira?: string;      // Ex: "Expominas 2026", "Hospitalar São Paulo"
  cidadeEvento?: string;   // Cidade onde ocorre o evento
  briefing?: string;       // Necessidades do cliente, elementos especiais, referências
  
  // Financeiro
  valorContratado: number;
  valorRecebido: number;
  valorPendente: number;
  custoPrevisto: number;
  custoRealizado: number;
  centroCusto: CentroDeCusto;
  mapsRoute: EventoMapsRoute;

  // OS & Detalhes técnicos
  prioridade?: "muito_alta" | "alta" | "media" | "baixa";
  prioridadeModo?: "auto" | "manual";
  etiquetas?: string[];
  comentarios?: OSComentario[];
  fotos?: OSFoto[];
  equipamentos?: string[];
  materiais?: string[];
  assinaturas?: OSAssinaturas;
  historicoAlteracoes?: OSHistoricoLog[];
  
  // JC Eventos 3.0 expanded properties
  centroConvencoes?: string;
  regrasCentro?: ConventionCenterRules;
  producao?: ProductionSectors;
  romaneioChecked?: { [itemId: string]: boolean };
  cronogramaTurnos?: {
    dia1Manha: boolean;
    dia1Tarde: boolean;
    dia2Manha: boolean;
    dia2Tarde: boolean;
  };
  devolucoesAlugados?: { [itemId: string]: "pendente" | "devolvido" | "avariado" };
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
  hasSafetyCert: boolean; // Keep for compatibility
  
  // JC Eventos 2.0 fields
  tipoContrato?: "CLT" | "PJ" | "Freelancer" | "Terceirizado";
  foto: string;
  cpf: string;
  dataNascimento?: string;
  rg: string;
  cnh: string;
  pixKey: string;
  salario: number;
  nr10Vencimento: string; // "YYYY-MM-DD" or empty
  nr35Vencimento: string; // "YYYY-MM-DD" or empty
  historicoAtivos: AtivoHistorico[];
  
  // JC Eventos 2.1 attachments
  anexos?: { id: string; name: string; date: string }[];

  // 3.0 Productivity Metrics
  productivity?: {
    horasTrabalhadas: number;
    eventosAtendidos: number;
    pontualidade: number; // 0 - 100
    tarefasConcluidas: number;
    notaMedia: number; // 1 - 5
  };
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
  descricao?: string;
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

  // 3.0 WMS additions
  barcode?: string;
  fotos?: string[];
  fornecedor?: string;
  unidade?: string;

  // Categoria operacional do item no almoxarifado JC Eventos
  // - locacao: mobiliário alugado para o stand (cadeiras, mesas, balcões)
  // - ferramenta: equipamentos e ferramentas próprias da empresa
  categoriaOperacional?: "locacao" | "ferramenta";
  // Category 1: Locacao
  qtdDisponivel?: number;
  qtdReservada?: number;
  qtdAlugada?: number;
  qtyReservado?: number;
  qtyAlugado?: number;
  retornoPrevisto?: string;
  // Category 2: Ferramentas Internas
  colaboradorResponsavel?: string;
  respFuncionario?: string;
  localizacaoAtual?: string;
  dataSaidaFerramenta?: string;
  retiradaData?: string;
  dataRetornoFerramenta?: string;
  devolucaoData?: string;
  statusManutencao?: "operacional" | "manutencao" | "descartado";
  emManutencao?: boolean;
  historicoUtilizacao?: { id: string; funcionario: string; retirada: string; devolucao?: string; observacoes?: string }[];
  // Category 3: Produtos de Venda
  custoAquisicao?: number;
  custoCompra?: number;
  margemLucro?: number; // em %
  estoqueMinimo?: number;
  fornecedores?: string;

  // Categorização Estruturada WMS v2.5
  categoriaWMS?: "moveis" | "insumos" | "ferramentas" | "aluminio" | "eletrica";
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
  formaPagamento: "Pix" | "Boleto" | "TED" | "Dinheiro" | "Transferência Bancária" | "Boleto Bancário" | "Cartão de Crédito" | string;
  status: "pago" | "pendente" | "atrasado";
  eventoId?: string; // Vínculo com projeto
  comprovante?: string; // Simulação de anexo
  
  // JC Eventos 2.1 fields
  pdfBoleto?: string;
  pdfNFe?: string;
  anexos?: { id: string; name: string; date: string }[];

  // 3.0 Finance additions
  parcelas?: number;
  recorrente?: boolean;
  recebimentoParcial?: number;
  inadimplente?: boolean;

  // Modulo Financeiro Avancado
  cartaoCreditoId?: string;
  contaBancariaId?: string;
  transferenciaOrigemId?: string;
  transferenciaDestinoId?: string;
  isTransferencia?: boolean;
  diasEmAtraso?: number;
  etiquetas?: string[];
  centroCustoId?: string;
  pagoA?: string;
  recebidoDe?: string;
  vencimento?: string;
  responsavel?: string;
}

export interface BankAccount {
  id: string;
  nome: string;
  tipo: string;
  saldoInicial: number;
  saldoAtual: number;
  bancoLogo?: string;
  ativa: boolean;
}

export interface CreditCard {
  id: string;
  nome: string;
  bandeira: string;
  limite: number;
  faturaAtual: number;
  diaFechamento: number;
  diaVencimento: number;
  ativo: boolean;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  natureza: "receita" | "despesa";
  grupoDRE?: string;
  classificacao?: string;
}

export interface CentroCustoConfig {
  id: string;
  nome: string;
  classificacao?: string;
}

export interface FormaPagamentoConfig {
  id: string;
  nome: string;
}

export interface ContatoEntidade {
  id: string;
  nome: string;
  tipo?: "cliente" | "fornecedor" | "ambos";
}

export interface TagFinanceira {
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  cor?: string;
}

export interface DREConfig {
  id: string;
  sped?: string;
  nome: string;
  natureza: "(+) Receitas" | "(-) Despesas" | "(=) Totalizador";
}

export interface OFXImportHistory {
  id: string;
  dataImportacao: string;
  banco: string;
  conta: string;
  qtdLancamentos: number;
  status: "conciliado" | "pendente" | "processado";
  transacoes?: {
    id: string;
    data: string;
    descricao: string;
    valor: number;
    tipo: "receita" | "despesa";
    conciliado: boolean;
  }[];
}

export interface AuditoriaLog {
  id: string;
  usuario: string;
  acao: string;
  detalhes: string;
  modulo?: string;
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

export interface CRMContatoLog {
  id: string;
  tipo: "ligacao" | "reuniao" | "visita";
  date: string;
  descricao: string;
}

export interface CRMTarefa {
  id: string;
  titulo: string;
  vencimento: string;
  concluida: boolean;
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
  // Estágios do pipeline JC Eventos: Novo Lead → Briefing → Orçamento → Aprovado → Perdido
  estagio: "novo_lead" | "briefing" | "orcamento" | "aprovado" | "perdido";
  dataCriacao: string;
  observacoes: string;

  // Campos específicos de negociação de estande
  tipoEstande?: "padrao" | "misto" | "construido";
  areaEstimadaM2?: number;
  nomeFeira?: string;
  cidadeEvento?: string;
  briefing?: string; // Descrição detalhada das necessidades do cliente

  // Relacionamentos e histórico
  anexos?: { id: string; name: string; date: string }[];
  projetoDetalhado?: CRMProjetoDetalhado;
  historicoContatos?: CRMContatoLog[];
  tarefas?: CRMTarefa[];
  followUpDate?: string;
  proximaInteracao?: string;
  documentosCliente?: ClienteDocumento[];
  fornecedoresVinculados?: string[];
  parceirosComerciais?: string[];
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

// 3.0 New Module Structures
export interface Orcamento {
  id: string;
  codigo: string;
  cliente: string;
  emailCliente: string;
  cnpjCliente: string;
  dataCriacao: string;
  validoAte: string;
  status: "rascunho" | "elaboracao" | "enviado" | "negociacao" | "aguardando_retorno" | "revisao" | "aguardando_aprovacao" | "aprovado" | "recusado" | "cancelado" | "perdido" | "ganho" | "arquivado" | string;
  produtos: { id: string; name: string; qty: number; precoVenda: number }[];
  servicos: { name: string; preco: number }[];
  desconto: number;
  impostos: number;
  total: number;
  revisoes: { versao: number; data: string; descricao: string }[];
  emailEnviado: boolean;

  // 3.1 Budget Templates Additions
  tipo?: "simplificado" | "detalhado";
  nomeOrcamento?: string;
  descricaoSimplificada?: string;
  itensDetalhados?: OrcamentoItemDetalhado[];
  // Event Linkage Additions
  eventId?: string;
  eventoNome?: string;
  eventName?: string;
  localEvento?: string;
  dataEvento?: string;
}

export interface NotaFiscal {
  id: string;
  tipo: "NF-e" | "NFS-e" | "NFC-e";
  numero: string;
  serie?: string;
  cliente: string;
  empresa?: string;
  nossoNumero?: string;
  pedido?: string;
  tomador?: string;
  valor: number;
  dataEmissao: string;
  produtos: string[];
  osVinculada?: string; // ID da OS/Projeto
  faturaVinculada?: string; // ID da transação financeira (InvoiceLog)
  status: "emitida" | "cancelada" | "processando";
  pdfAnexoNome?: string;
  xmlAnexoNome?: string;
}

// 3.1 Support structures for Refinements
export interface ClienteDocumentoVersao {
  versao: number;
  dataEnvio: string;
  responsavelEnvio: string;
  nomeArquivo: string;
  observacoes?: string;
  urlSimulada: string;
}

export interface ClienteDocumento {
  id: string;
  categoria: "contrato" | "proposta" | "planta" | "documento_cliente" | "outro";
  nome: string;
  versoes: ClienteDocumentoVersao[];
}

export interface OrcamentoItemDetalhado {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
  total: number;
  observacoes?: string;
}

export interface AgendaEventoIndependente {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  local: string;
  responsavel: string;
  participantes: string;
  prioridade: "baixa" | "media" | "alta";
  categoria: "reuniao" | "visita_tecnica" | "lembrete" | "entrega" | "pagamento" | "compra" | "viagem" | "evento_interno";
  observacoes?: string;
  anexoNome?: string;
}

export interface BoletoAdministrativo {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  vencimento: string;
  status: "pendente" | "pago" | "vencido" | "cancelado";
  pdfAnexoNome?: string;
  comprovanteAnexoNome?: string;
  historicoLogs: string[];
}

export interface MasterCatalogItem {
  id: string;
  name: string;
  categoria: string;
  tipo: "material" | "servico";
  precoPadrao: number;
  unidade: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  cpf: string;
  dataNascimento: string;
  role: "admin" | "comercial" | "estoque" | "operador";
}

// NOVAS INTERFACES CONTROLL-ALL V2.5
// ==========================================

export interface ContaBancaria {
  id: string;
  nomeBanco: string;
  agenciaConta: string;
  tipo: "corrente" | "caixa_fisico" | "investimento";
  saldoBanco: number;
  saldoErp: number;
  saldoConciliado: number;
  corIdentificadora?: string;
}

export interface ExtratoBancarioItem {
  id: string;
  contaId: string;
  date: string;
  descricao: string;
  valor: number; // positivo para receita, negativo para despesa
  fitid: string;
  status: "pendente" | "conciliado" | "ignorado";
  transacaoErpIdVinculada?: string;
  sugestaoMatchErpId?: string;
}

export interface RegistroReconciliacao {
  id: string;
  extratoId: string;
  transacaoErpId: string;
  date: string;
  usuario: string;
  metodo: "automatico" | "manual";
}
