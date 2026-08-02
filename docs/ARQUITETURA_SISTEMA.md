# 🏛️ ARQUITETURA E ESTRUTURA PROFISSIONAL DO PROJETO — CONTROLL-ALL ERP

**Cliente:** JC Eventos  
**Versão:** 2.0  
**Data:** Agosto 2026  
**Status:** Estrutura Padronizada e Organizada em Camadas Corporativas

---

## 1. ORGANIZAÇÃO GERAL DE DIRETÓRIOS

O projeto segue a arquitetura de separação de responsabilidades (Decoupled Monorepo Architecture) dividida em 5 grandes pilares: **Documentação (`docs/`)**, **Banco de Dados (`database/`)**, **Código Fonte Frontend (`src/`)**, **Arquivos Estáticos do Servidor (`public/`)** e **Arquivos de Configuração de Build**.

```
Controll-All/
│
├── 📂 docs/                           # 📄 DOCUMENTAÇÃO TÉCNICA E REQUISITOS DO SISTEMA
│   ├── ARQUITETURA_SISTEMA.md         # Estrutura de pastas, camadas e guia de desenvolvimento (Este documento)
│   ├── PLANO_PRODUCAO.md              # Plano de custos, infraestrutura Hostinger VPS, 2FA, backups e precificação
│   ├── PRD.md                         # Product Requirements Document (Requisitos e regras de negócio JC Eventos)
│   └── requisitos_sistema_controll_all.pdf # Documento original de requisitos em PDF
│
├── 📂 database/                       # 🗄️ MODELAGEM E SCRIPTS DE BANCO DE DADOS RELACIONAL
│   ├── V1__init_production_schema.sql # Migration inicial PostgreSQL 16 com 18 tabelas (Flyway)
│   └── schema_hostinger.sql           # Schema relacional em MySQL/MariaDB (Hostinger phpMyAdmin)
│
├── 📂 public/                         # 🌐 ARQUIVOS ESTÁTICOS PÚBLICOS & WEBSERVER CONFIG
│   └── .htaccess                      # Configuração de redirecionamento Apache/Hostinger para SPA React
│
├── 📂 src/                            # 💻 CÓDIGO FONTE DA APLICAÇÃO FRONTEND (REACT + TYPESCRIPT)
│   ├── 📂 assets/                     # Recursos visuais estáticos (Logos, imagens, ícones institucionais)
│   │   └── logo.png
│   │
│   ├── 📂 config/                     # Configurações globais de ambiente e variáveis Hostinger
│   │   └── env.ts                     # Variáveis de ambiente (API URL, Storage Keys, SSL flags)
│   │
│   ├── 📂 services/                   # Cliente HTTP e Camada de Comunicação com a API REST
│   │   └── api.ts                     # Cliente Axios/Fetch com suporte a Bearer Token JWT e fallbacks
│   │
│   ├── 📂 types/                      # Definições de Tipos e Interfaces TypeScript
│   │   ├── index.ts                   # Interfaces globais (Project, Employee, Orcamento, OS, WMS, Leads...)
│   │   └── html2pdf.d.ts              # Definições de tipo para a biblioteca html2pdf.js
│   │
│   ├── 📂 utils/                      # Utilitários, Criptografia e Geradores
│   │   ├── pdfGenerator.ts            # Gerador de exportação PDF de propostas e relatórios
│   │   └── security.ts                # Utilitários de criptografia local AES, sanitização e tokens
│   │
│   ├── 📂 components/                 # Componentes Visuais Reutilizáveis e Módulos do ERP
│   │   ├── Agenda.tsx                 # Módulo de Calendário e Compromissos
│   │   ├── Auditoria.tsx              # Módulo de Logs de Auditoria do Sistema
│   │   ├── BankReconciliationModal.tsx# Modal de Conciliação Bancária
│   │   ├── ClientFormModal.tsx        # Modal de Cadastro/Edição de Clientes
│   │   ├── ClientProposalPortalModal.tsx # Portal do Cliente para visualização de propostas
│   │   ├── ContractAuditModal.tsx     # Modal de Auditoria de Contratos
│   │   ├── CRM.tsx                    # Módulo CRM e Pipeline de Leads
│   │   ├── Employees.tsx              # Módulo de RH, Equipes e NRs
│   │   ├── EventDetailsModal.tsx      # Modal de Detalhes do Evento/Estande e Propostas Vinculadas
│   │   ├── FileUploadManager.tsx      # Gerenciador Central de Uploads por Módulo
│   │   ├── Financial.tsx              # Módulo Financeiro & Centro de Custo por Evento
│   │   ├── IAAssistant.tsx            # Componente Assistente Copilot
│   │   ├── KanbanBoards.tsx           # Quadro Kanban de Projetos e Estandes por Fase
│   │   ├── Logistics.tsx              # Módulo de Logística, Frota e Viagens
│   │   ├── Notifications.tsx          # Central de Notificações em Tempo Real
│   │   ├── Orcamentos.tsx             # Módulo de Propostas Comerciais (Simplificado / Detalhado)
│   │   ├── OrdensServico.tsx          # Módulo de OS com Kanban por Prioridades
│   │   ├── Overview.tsx               # Painel Dashboard Executivo
│   │   ├── ProposalWordEditorModal.tsx# Editor Visual de Propostas
│   │   ├── Relatorios.tsx             # Módulo de Relatórios Consolidados
│   │   ├── SignaturePad.tsx           # Componente Canvas de Assinatura Digital
│   │   ├── TasksModule.tsx            # Gestão Interna de Tarefas da Equipe
│   │   ├── TwoFactorModal.tsx         # Modal de Autenticação em Duas Etapas (2FA)
│   │   ├── Warehouse.tsx              # Componente de Visualização do Galpão
│   │   └── WmsModule.tsx              # Módulo WMS / Almoxarifado Hierárquico em 6 Níveis
│   │
│   ├── App.tsx                        # Componente Raiz da Aplicação (Roteamento e Estado Global)
│   ├── main.tsx                       # Ponto de Entrada (Entrypoint) da aplicação React
│   ├── Dashboard.css                  # Estilos globais e componentes da interface (JC Eventos Design System)
│   ├── Mobile.css                     # Ajustes de responsividade para dispositivos móveis
│   └── index.css                      # Reset CSS básico
│
├── .env.local                         # Configurações locais de desenvolvimento
├── .gitignore                         # Arquivos ignorados pelo Git
├── .oxlintrc.json                     # Configurações do Linter Oxlint (Ultra-rápido)
├── package.json                       # Dependências e scripts do projeto Node
├── tsconfig.json                      # Configuração base do compilador TypeScript
├── tsconfig.app.json                  # Configuração TypeScript para a aplicação React
├── tsconfig.node.json                 # Configuração TypeScript para o ambiente Vite/Node
└── vite.config.ts                     # Configuração do Bundler Vite (Build de Alta Performance)
```

---

## 2. CAMADAS DA ARQUITETURA DO SISTEMA

### 2.1 Camada 1: Documentação & Governança (`docs/`)
Garante que todas as especificações comerciais, regras de negócio, tabelas de preço e acordos de segurança fiquem armazenados em um só lugar.
- **`PRD.md`**: Define todas as regras operacionais da JC Eventos.
- **`PLANO_PRODUCAO.md`**: Detalha infraestrutura Hostinger VPS, orçamento, 2FA, backups automatizados e checklist de implantação.

### 2.2 Camada 2: Dados & Banco Relacional (`database/`)
Armazena a inteligência relacional da empresa pronta para ser executada no PostgreSQL ou MySQL da Hostinger.
- Contém **18 tabelas relacionais** cobrindo Autenticação, Clientes, Eventos, Financeiro, WMS, RH, OS, Logística e Auditoria.

### 2.3 Camada 3: Apresentação & UI (`src/components/`)
Responsável pela interface do usuário desenvolvida em React 19 + TypeScript.
- **Módulos Principais**: Visões em tela cheia acessíveis via navegação lateral.
- **Modais Especiais**: Telas sobrepostas ativadas por eventos (detalhes de evento, conciliação bancária, 2FA, assinaturas).
- **Componentes Utilitários**: Ferramentas de assinatura em canvas (`SignaturePad.tsx`), upload (`FileUploadManager.tsx`) e notificações (`Notifications.tsx`).

### 2.4 Camada 4: Serviços, Segurança & Utilitários (`src/services/` & `src/utils/`)
Subcamada responsável pela conexão segura entre a aplicação React e o servidor web Hostinger.
- **`api.ts`**: Gerencia chamadas HTTP REST com inserção automática do token Bearer JWT e suporte a operação em contingenência local.
- **`security.ts`**: Criptografia de dados sensíveis locais e sanitização de campos.
- **`pdfGenerator.ts`**: Conversão vetorial de elementos HTML para PDF.

---

## 3. FLUXO DE FUNCIONAMENTO (WORKFLOW DA APLICAÇÃO)

```
┌────────────────────────────────────────────────────────┐
│   NAVEGADOR / BROWSER (React 19 SPA)                   │
│   ├── App.tsx (Gerenciador de Estado e Navegação)     │
│   ├── Dashboard.css (Design System JC Eventos)         │
│   └── Componentes de Módulo (Financial, OS, WMS, etc.)  │
└───────────────────────────┬────────────────────────────┘
                            │
               Chamadas HTTP (JSON / Bearer JWT)
                            │
┌───────────────────────────▼────────────────────────────┐
│   CAMADA DE SERVIÇOS & CLIENTE API (`src/services/api.ts`)│
│   ├── Injeta Header Authorization: Bearer <JWT>        │
│   └── Trata conexões e fallbacks com segurança         │
└───────────────────────────┬────────────────────────────┘
                            │
                       HTTPS / REST
                            │
┌───────────────────────────▼────────────────────────────┐
│   SERVIDOR DE PRODUÇÃO (Hostinger VPS Linux)           │
│   ├── Nginx Proxy Reverso (:443 SSL Let's Encrypt)     │
│   ├── Backend Java 21 / Spring Boot (:8080)            │
│   └── Banco PostgreSQL 16 (`database/schema_hostinger`)│
└────────────────────────────────────────────────────────┘
```

---

## 4. BOAS PRÁTICAS E REGRAS DE MANUTENÇÃO DO CÓDIGO

1. **Adição de Novos Componentes**:
   - Componentes de módulo devem ser criados em `src/components/` mantendo a exportação `default`.
   - Modais devem aceitar a prop `onClose: () => void` como padrão.

2. **Novas Interfaces de Dados**:
   - Adicione novos tipos obrigatoriamente no arquivo [src/types/index.ts](file:///Users/Adrian/Desktop/projetos/Controll-All/src/types/index.ts).

3. **Chamadas de Rede**:
   - Utilize a instância centralizada de API presente em [src/services/api.ts](file:///Users/Adrian/Desktop/projetos/Controll-All/src/services/api.ts). Nunca faça chamadas `fetch` diretas sem passar pela camada de tratamento.

4. **Estilização Visual**:
   - Utilize as variáveis CSS declaradas no Design System de [src/Dashboard.css](file:///Users/Adrian/Desktop/projetos/Controll-All/src/Dashboard.css) (`var(--accent)`, `var(--bg-card)`, `var(--border)`, etc.).

---

*Documento mantido por: Antigravity (AI Architect)*  
*JC Eventos ERP — Todos os direitos reservados.*
