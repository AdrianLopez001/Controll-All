-- ==============================================================================
-- CONTROLL-ALL ERP v2.0 - POSTGRESQL 16 PRODUCTION MIGRATION (Flyway V1)
-- Contains all 18 relational tables, constraints, indices & FKs (PLANO_PRODUCAO Section 6)
-- ==============================================================================

-- 1. AUTENTICAÇÃO & SEGURANÇA
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'operador',
  two_factor_secret VARCHAR(255) DEFAULT NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS revoked_tokens (
  id BIGSERIAL PRIMARY KEY,
  token_hash VARCHAR(255) NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. CRM & CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj_cpf VARCHAR(32),
  email VARCHAR(255),
  telefone VARCHAR(32),
  status VARCHAR(32) DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fornecedores (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(32),
  servico VARCHAR(128),
  email VARCHAR(255),
  telefone VARCHAR(32),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads_crm (
  id VARCHAR(64) PRIMARY KEY,
  empresa VARCHAR(255) NOT NULL,
  contato VARCHAR(255),
  estagio VARCHAR(64) DEFAULT 'novo',
  valor NUMERIC(15, 2) DEFAULT 0.00,
  origem VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROJETOS & EVENTOS OPERACIONAIS
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  codigo VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  client_id VARCHAR(64) REFERENCES clientes(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  phase VARCHAR(64) DEFAULT 'no_event',
  prioridade VARCHAR(32) DEFAULT 'media',
  prioridade_modo VARCHAR(32) DEFAULT 'auto',
  start_date DATE,
  end_date DATE,
  data_montagem DATE,
  orcamento_total NUMERIC(15, 2) DEFAULT 0.00,
  nome_feira VARCHAR(255),
  local_pavilhao VARCHAR(255),
  completion_rate INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  item_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_docs (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) DEFAULT 'geral',
  file_path VARCHAR(512) NOT NULL,
  size_bytes BIGINT DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. RH & COLABORADORES
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(128),
  cpf_encrypted VARCHAR(255),
  rg_encrypted VARCHAR(255),
  pix_key_encrypted VARCHAR(255),
  contract_type VARCHAR(32) DEFAULT 'CLT',
  doc_status VARCHAR(32) DEFAULT 'Completo',
  phone VARCHAR(32),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_assets (
  id VARCHAR(64) PRIMARY KEY,
  employee_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  tipo VARCHAR(64) NOT NULL,
  descricao TEXT,
  assigned_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS project_employees (
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
  employee_id VARCHAR(64) REFERENCES employees(id) ON DELETE CASCADE,
  role VARCHAR(128),
  turno VARCHAR(64),
  PRIMARY KEY (project_id, employee_id)
);

-- 5. WMS / ALMOXARIFADO
CREATE TABLE IF NOT EXISTS warehouse_items (
  id VARCHAR(64) PRIMARY KEY,
  codigo VARCHAR(32),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(128) DEFAULT 'Geral',
  stock INT DEFAULT 0,
  available_stock INT DEFAULT 0,
  min_stock INT DEFAULT 5,
  location VARCHAR(128) DEFAULT 'Depósito Central',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_movements (
  id VARCHAR(64) PRIMARY KEY,
  item_id VARCHAR(64) REFERENCES warehouse_items(id) ON DELETE CASCADE,
  employee_id VARCHAR(64) REFERENCES employees(id) ON DELETE SET NULL,
  tipo VARCHAR(32) NOT NULL, -- 'entrada' | 'saida'
  qty INT NOT NULL,
  movement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_tools (
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
  warehouse_item_id VARCHAR(64) REFERENCES warehouse_items(id) ON DELETE CASCADE,
  qty INT DEFAULT 1,
  PRIMARY KEY (project_id, warehouse_item_id)
);

-- 6. FINANCEIRO
CREATE TABLE IF NOT EXISTS invoice_logs (
  id VARCHAR(64) PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  valor NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  tipo VARCHAR(32) NOT NULL, -- 'receita' | 'despesa'
  categoria VARCHAR(128) DEFAULT 'Geral',
  status VARCHAR(32) DEFAULT 'Pendente',
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
  comprovante_url VARCHAR(512),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS centro_custo (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  madeira_mdf NUMERIC(15, 2) DEFAULT 0.00,
  fretes NUMERIC(15, 2) DEFAULT 0.00,
  hospedagem NUMERIC(15, 2) DEFAULT 0.00,
  equipes NUMERIC(15, 2) DEFAULT 0.00,
  outros NUMERIC(15, 2) DEFAULT 0.00
);

-- 7. ORDENS DE SERVIÇO (OS)
CREATE TABLE IF NOT EXISTS ordens_servico (
  id VARCHAR(64) PRIMARY KEY,
  codigo VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  status VARCHAR(32) DEFAULT 'aberta',
  prioridade VARCHAR(32) DEFAULT 'media',
  prioridade_modo VARCHAR(32) DEFAULT 'auto',
  data_montagem DATE,
  completion_rate INT DEFAULT 0,
  assinado_por VARCHAR(255),
  cargo_signatario VARCHAR(255),
  data_assinatura TIMESTAMP WITH TIME ZONE,
  imagem_assinatura TEXT, -- PNG Base64
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS os_fotos (
  id VARCHAR(64) PRIMARY KEY,
  os_id VARCHAR(64) REFERENCES ordens_servico(id) ON DELETE CASCADE,
  file_path VARCHAR(512) NOT NULL,
  name VARCHAR(255),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS os_comentarios (
  id VARCHAR(64) PRIMARY KEY,
  os_id VARCHAR(64) REFERENCES ordens_servico(id) ON DELETE CASCADE,
  autor VARCHAR(255) NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. LOGÍSTICA & FROTA
CREATE TABLE IF NOT EXISTS veiculos (
  id VARCHAR(64) PRIMARY KEY,
  modelo VARCHAR(128) NOT NULL,
  placa VARCHAR(32) UNIQUE NOT NULL,
  motorista VARCHAR(255),
  status VARCHAR(32) DEFAULT 'disponivel'
);

CREATE TABLE IF NOT EXISTS viagens (
  id VARCHAR(64) PRIMARY KEY,
  veiculo_id VARCHAR(64) REFERENCES veiculos(id) ON DELETE SET NULL,
  employee_id VARCHAR(64) REFERENCES employees(id) ON DELETE SET NULL,
  destino VARCHAR(255) NOT NULL,
  hotel VARCHAR(255),
  data_saida TIMESTAMP WITH TIME ZONE,
  data_retorno TIMESTAMP WITH TIME ZONE
);

-- 9. ORÇAMENTOS & PROPOSTAS
CREATE TABLE IF NOT EXISTS orcamentos (
  id VARCHAR(64) PRIMARY KEY,
  codigo VARCHAR(32) UNIQUE NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  tipo VARCHAR(64) DEFAULT 'detalhado',
  total NUMERIC(15, 2) DEFAULT 0.00,
  status VARCHAR(32) DEFAULT 'Em Aberto',
  validade DATE,
  event_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orcamento_itens (
  id VARCHAR(64) PRIMARY KEY,
  orcamento_id VARCHAR(64) REFERENCES orcamentos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(128) DEFAULT 'Geral',
  qty INT DEFAULT 1,
  valor_unit NUMERIC(15, 2) DEFAULT 0.00
);

-- 10. AUDITORIA
CREATE TABLE IF NOT EXISTS auditoria_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(64),
  acao VARCHAR(128) NOT NULL,
  modulo VARCHAR(64) NOT NULL,
  detalhes TEXT,
  ip_origem VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase);
CREATE INDEX IF NOT EXISTS idx_projects_prioridade ON projects(prioridade);
CREATE INDEX IF NOT EXISTS idx_os_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_os_prioridade ON ordens_servico(prioridade);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON invoice_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_user ON auditoria_logs(user_id);
