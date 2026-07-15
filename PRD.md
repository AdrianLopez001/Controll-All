# PRODUCT REQUIREMENTS DOCUMENT (PRD) — CONTROLL-ALL (Versão 2.0)
**Cliente:** JC Eventos  
**Status:** Em Desenvolvimento / Auditoria  
**Autor/Mantenedor:** Antigravity (AI Architect)

---

## 01 - Introdução e Objetivos

O **Controll-All** é a plataforma de planejamento de recursos corporativos (ERP) definitiva para a **JC Eventos**. Ele evolui de um simples sistema de controle operacional para integrar os conceitos de:
- **CRM (Customer Relationship Management):** Rastreio de leads comerciais, contratos e pipeline de vendas.
- **WMS (Warehouse Management System):** Controle físico hierárquico do galpão, serialização, inventário próprio/locado e logística reversa de montagens.
- **Financeiro (Fintech ERP):** Fluxo de caixa consolidado, contas a pagar, contas a receber, reembolsos, prestação de contas de campo e o estratégico **Centro de Custo por Evento**.
- **Gestão de Projetos e Eventos (PMS):** Quadros Kanban interativos, checklists técnicos, geolocalização e rotas de pavilhão.
- **RH e Escalas de Campo:** Diretório unificado de trabalhadores com licenças obrigatórias (NR-10, NR-35), controle de recebimento de ativos e adiantamento de diárias.
- **IA integrada:** Assistente em linguagem natural para responder questões operacionais e de estoque.

---

## 02 - Diretrizes e Instruções Obrigatórias para a IA (Modo Desenvolvedor)

> [!IMPORTANT]
> **REGRAS DE CONSERVAÇÃO E EVOLUÇÃO DE CÓDIGO**
> Qualquer agente de IA ou desenvolvedor responsável por estender o sistema deve executar rigorosamente este protocolo em 4 etapas:

1. **Etapa 1: Auditoria do Sistema**  
   Mapeie automaticamente as páginas, menus, componentes, propriedades (Props), interfaces TypeScript e simulações de estado locais em `/src`.
2. **Etapa 2: Comparação de Contratos**  
   Compare cada funcionalidade e componente existente com este PRD. Se um item já existe e funciona 100% conforme o planejado, **não modifique**. Se existir parcialmente, complete de forma cirúrgica. Se não existir, crie do zero herdando os estilos do Design System.
3. **Etapa 3: Conservação Não-Destrutiva**  
   Jamais remova funcionalidades existentes ou altere estruturas de estado funcionais sem necessidade. Preserve a compatibilidade reversa.
4. **Etapa 4: Alimentação Automática (Seed)**  
   O sistema não pode iniciar vazio. Popule todas as tabelas e grids com dados mockados fictícios, porém realistas e inter-relacionados (por exemplo, faturas associadas a fornecedores cadastrados e a eventos existentes).

---

## 03 - Design System e Identidade Visual (JC Eventos)

### Paleta de Cores
```css
:root {
  --bg-main: #F3E4E8;           /* Rosa Claro */
  --bg-card: #FFFFFF;           /* Branco */
  --bg-sidebar: #293B8F;        /* Azul Institucional JC Eventos */
  --border: #E5E5E5;            /* Cinza suave para bordas e divisores */
  --text-primary: #404040;      /* Cinza Escuro para textos principais */
  --text-secondary: #606060;    /* Cinza Médio */
  
  --accent: #293B8F;            /* Azul Institucional */
  --accent-secondary: #C95D46;  /* Terracota para destaques e botões secundários */
  --success: #BFD7D3;           /* Verde Água para aprovações */
  --success-text: #1b3d38;
}
```

### Tipografia
- Fonte padrão: **Poppins** (importada do Google Fonts).
- Aplicação uniforme em títulos (`font-weight: 600`), textos de corpo e tabelas.

### Estilo Visual
Interface limpa, moderna, inspirada em Notion + ClickUp. Cards com cantos levemente arredondados (`border-radius: 12px` ou `16px`), sombras suaves, ícones outline minimalistas (`lucide-react`) e amplos espaços em branco para melhor legibilidade.

---

## 04 - Módulos do Sistema e Navegação

O menu lateral (Sidebar) deve suportar a alternância entre os seguintes módulos principais:
1. **Dashboard (Visão Geral):** Painel executivo.
2. **CRM & Clientes:** Pipeline de leads e cadastro de contratantes e fornecedores.
3. **Eventos & Kanban:** Projetos, cronogramas, mapas e quadro de status da montagem.
4. **Depósito & WMS:** Organização física do almoxarifado, controle de locações e cadastro de ferramentas/móveis.
5. **RH & Equipes:** Controle de pessoal de montagem, certificações NRs e recebimento de dinheiro/equipamentos.
6. **Financeiro & Despesas:** Contas a pagar/receber, fluxo de caixa, despesas de caixinha de obra e o Centro de Custos.
7. **Logística & Viagens:** Rastreio de frotas de veículos, motoristas, passagens aéreas e hotéis reservados.
8. **Relatórios & Auditoria:** Histórico de alterações do sistema e relatórios consolidados de rentabilidade.
9. **IA Assistant (Copilot):** Interface de conversação natural para suporte operacional.

---

## 05 - Especificação do Módulo: Eventos & Projetos

Cada evento deve possuir as seguintes informações no banco de dados / estado local:
- **Identificação:** Código único, Nome do Estande, Cliente, Coordenador Responsável.
- **Localização:** Endereço completo, Pavilhão, Stand, Latitude, Longitude, Link para Google Maps e Rota Estimada (tempo e distância).
- **Datas:** Início e Fim da Feira, Período de Montagem e Período de Desmontagem.
- **Status:** Fase (`no_event` / `during` / `post`).
- **Financeiro Consolidado:** Valor do Contrato, Valor Recebido, Valor Pendente, Custos Totais, Lucro Previsto, Lucro Realizado e Margem Percentual.

### Quadro Kanban
- Colunas dinâmicas representando as etapas operacionais.
- Permite mover cartões arrastando-os de coluna.
- Cartões exibem: nome do projeto, cliente, responsáveis (com avatares), badges de prioridade, prazo limite e barra de progresso do checklist de montagem.

---

## 06 - Especificação do Módulo: Financeiro & Centro de Custos

### Contas a Receber
- Dados: Cliente, valor do contrato, forma de pagamento (Boleto, Pix, TED), data de vencimento, status (Pago / Pendente / Atrasado) e vínculo com o Evento.

### Contas a Pagar
- Dados: Fornecedor, categoria (Material, Terceirizados, Logística), valor, vencimento, comprovante (anexo simulado) e status de quitação.

### Movimentação em Dinheiro (Caixinha de Obra)
- Registros de adiantamento em espécie concedido a montadores na obra, relatórios de reembolso e prestação de contas física (valor entregue, valor gasto e troco retornado).

### Centro de Custo por Evento
Consolidação automática por projeto:
- **Receita Contratada** contra despesas divididas em:
  - Madeira e Insumos (MDF, ferragens).
  - Mobiliário Alugado/Comprado.
  - Custos Logísticos (combustível, pedágios, fretes).
  - Viagem e Hospedagem (passagens aéreas, check-ins de hotel).
  - Mão de Obra (funcionários próprios, diárias de terceirizados).
- **Cálculo em Tempo Real:** Custos Totais, Lucro Bruto/Líquido e Margem de Lucro.
- **Visualização:** Ranking interativo dos projetos mais lucrativos no módulo financeiro.

---

## 07 - Especificação do Módulo: Depósito & WMS (Almoxarifado)

### Organização Física Hierárquica
- Cada item deve possuir sua localização precisa no galpão, seguindo o padrão:  
  `Galpão -> Corredor -> Rua -> Prateleira -> Andar -> Posição -> Caixa -> Item`.

### Ficha Cadastral do Item
- Código, QR Code simulado, Foto (gerada/mockada), Categoria (Ferramenta ou Mobiliário), Marca, Modelo, Patrimônio, Estado de conservação, Quantidade Atual e Quantidade Mínima para Alerta.
- **Origem:** Rótulo de origem do item: Próprio, Alugado, Terceirizado, Emprestado ou Consignado.
- **Controles Especiais:** Seções dedicadas a rastrear locações ativas (quem alugou, data de saída, data estimada de devolução, valor diário e status).

---

## 08 - Especificação do Módulo: RH & Colaboradores

### Cadastro do Profissional
- Foto, Nome completo, Cargo, CPF, RG, CNH, PIS, dados bancários e chave Pix.
- **Treinamento e NRs:** Status das certificações obrigatórias de segurança:
  - NR-10 (Segurança em Instalações e Serviços em Eletricidade).
  - NR-35 (Trabalho em Altura).
  - Data de vencimento das licenças e aviso de expiração.

### Histórico e Rastreabilidade do Trabalhador
Histórico detalhado listando todas as interações do profissional com os recursos da empresa:
- Ferramentas retiradas do depósito e devolvidas.
- Recebimento de ativos corporativos (uniformes, notebooks, cartões de combustível).
- Adiantamentos financeiros recebidos e passagens/hospedagens associadas.

---

## 09 - Especificação do Módulo: IA Assistant (Copilot)

A plataforma deve conter um componente interativo de IA rodando no frontend (simulado por heurística e IA de chat) capaz de:
- **Resumir Eventos:** Exibir uma visão executiva rápida do estande selecionado.
- **Auditar Documentos:** Identificar quais documentos obrigatórios do pavilhão (ART, Termo, Contrato) estão ausentes para a data de montagem.
- **Análise Conversacional:** Responder a perguntas do usuário como:
  - *"Quais eventos desta semana ainda não têm equipe definida?"*
  - *"Quais ferramentas estão abaixo do estoque mínimo no galpão?"*
  - *"Qual é o estande mais lucrativo cadastrado?"*
- **Cronogramas:** Sugerir sequências de montagem baseadas no histórico do cliente.

---

## 10 - Especificação do Módulo: Logística & Viagens

Controle unificado de despesas e rotas de viagem da equipe técnica:
- **Frota de Veículos:** Rastreio dos carros próprios/alugados da JC Eventos, placa, modelo, status (Em Viagem / No Galpão / Em Manutenção) e motorista responsável.
- **Passagens & Hotéis:** Registros de localizador de voos das companhias aéreas, horários de embarque, nome do hotel e data de check-in vinculados aos profissionais escalados.

---

## 11 - Modelagem de Banco de Dados (Interfaces TypeScript)

```typescript
// Interfaces para o ERP JC Eventos v2.0

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

export interface ProjectEvent {
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
  valorContratado: number;
  valorRecebido: number;
  valorPendente: number;
  custoPrevisto: number;
  custoRealizado: number;
  centroCusto: CentroDeCusto;
  checklist: { id: string; text: string; done: boolean }[];
  assignedEmployees: string[]; // IDs dos Employees
  assignedTools: { id: string; allocatedQty: number }[]; // IDs do estoque
  mapsRoute: EventoMapsRoute;
  documentosPavilhao: { id: string; name: string; status: "pending" | "uploaded" | "approved" }[];
}

export interface EmployeeV2 {
  id: string;
  name: string;
  role: string;
  foto: string;
  cpf: string;
  rg: string;
  cnh: string;
  pixKey: string;
  salario: number;
  nr10Vencimento: string; // "AAAA-MM-DD" ou ""
  nr35Vencimento: string; // "AAAA-MM-DD" ou ""
  documentStatus: "complete" | "pending";
  historicoAtivos: {
    id: string;
    tipo: "retirada_ferramenta" | "devolucao_ferramenta" | "recebimento_dinheiro" | "recebimento_ativo" | "viagem";
    descricao: string;
    date: string;
    responsavel: string;
  }[];
}

export interface WmsItem {
  id: string;
  codigo: string;
  qrCode: string;
  name: string;
  category: "ferramenta" | "mobiliario";
  marca: string;
  modelo: string;
  patrimonio: string;
  estadoConservacao: "excelente" | "bom" | "regular" | "manutencao";
  valorCompra: number;
  valorVenda: number;
  valorLocacao: number;
  stock: number;
  stockMinimo: number;
  origem: "proprio" | "alugado" | "terceirizado" | "emprestado" | "consignado";
  localizacaoFisica: {
    galpao: string;
    corredor: string;
    rua: string;
    prateleira: string;
    andar: string;
    posicao: string;
  };
}

export interface TransacaoFinanceira {
  id: string;
  tipo: "receita" | "despesa";
  origem: string; // Cliente ou Fornecedor
  valor: number;
  categoria: string; // "Madeira", "MDF", "Passagem", "Diária", etc.
  formaPagamento: "Pix" | "Boleto" | "TED" | "Dinheiro";
  date: string;
  status: "pago" | "pendente" | "atrasado";
  eventoId?: string; // Vínculo com projeto
  comprovante?: string; // Nome do arquivo anexo simulado
}

export interface AuditoriaLog {
  id: string;
  usuario: string;
  acao: string; // "Criação de Evento", "Alteração de Estoque", etc.
  detalhes: string;
  date: string;
  hora: string;
  ip: string;
}
```

---

## 12 - Critérios de Aceite da Entrega

Para aprovar o desenvolvimento do ERP Controll-All 2.0, o sistema deve validar:
1. **Consistência de dados:** O Centro de Custos do evento deve atualizar instantaneamente quando novas notas fiscais vinculadas ao evento forem inseridas.
2. **Sem Páginas Vazias:** Todos os módulos listados na Sidebar devem renderizar layouts de controle operacionais, tabelas de dados ou gráficos reais.
3. **Massa de Dados Seed Completa:** Presença de dados mockados realistas para todas as novas entidades (veículos, motoristas, transações de contas a pagar, registros de auditoria e históricos de colaboradores).
4. **Controle de Acessibilidade e Responsividade:** Navegação limpa em desktops de coordenação e smartphones em pavilhão de obras.
