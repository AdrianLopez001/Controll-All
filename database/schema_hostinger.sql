-- ==============================================================================
-- CONTROLL-ALL - HOSTINGER MYSQL / MARIADB PRODUCTION DATABASE SCHEMA
-- Compatible with Hostinger phpMyAdmin & MySQL 8.0+ / MariaDB 10.4+
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `controll_all_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `controll_all_db`;

-- 1. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` VARCHAR(64) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `cnpj_cpf` VARCHAR(32) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `telefone` VARCHAR(32) DEFAULT NULL,
  `status` ENUM('ativo', 'inativo', 'prospect') DEFAULT 'ativo',
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_clientes_nome` (`nome`),
  INDEX `idx_clientes_cnpj` (`cnpj_cpf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA DE PROJETOS E EVENTOS
CREATE TABLE IF NOT EXISTS `projetos_eventos` (
  `id` VARCHAR(64) NOT NULL,
  `codigo` VARCHAR(32) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `cliente_nome` VARCHAR(255) NOT NULL,
  `data_inicio` DATE DEFAULT NULL,
  `data_fim` DATE DEFAULT NULL,
  `data_montagem` DATE DEFAULT NULL,
  `fase` ENUM('no_event', 'during', 'post', 'Briefing', 'Orçamento', 'Pré-Evento', 'Produção', 'Montagem', 'Evento', 'Aprovado', 'Desmontagem', 'Finalizado') DEFAULT 'no_event',
  `prioridade` ENUM('muito_alta', 'alta', 'media', 'baixa') DEFAULT 'media',
  `prioridade_modo` ENUM('auto', 'manual') DEFAULT 'auto',
  `orcamento_total` DECIMAL(15,2) DEFAULT '0.00',
  `nome_feira` VARCHAR(255) DEFAULT NULL,
  `local_pavilhao` VARCHAR(255) DEFAULT NULL,
  `detalhes_json` LONGTEXT DEFAULT NULL COMMENT 'Checklist, Centro de Custos, Integrantes e Rota em formato JSON',
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_projetos_codigo` (`codigo`),
  INDEX `idx_projetos_fase` (`fase`),
  INDEX `idx_projetos_prioridade` (`prioridade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA DE COLABORADORES & EQUIPE
CREATE TABLE IF NOT EXISTS `colaboradores` (
  `id` VARCHAR(64) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(32) DEFAULT NULL,
  `cargo` VARCHAR(128) DEFAULT NULL,
  `tipo_contrato` ENUM('CLT', 'PJ', 'Freelancer') DEFAULT 'CLT',
  `status_documentacao` ENUM('Pendente', 'Completo', 'Vencido') DEFAULT 'Completo',
  `telefone` VARCHAR(32) DEFAULT NULL,
  `funcoes_json` TEXT DEFAULT NULL,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_colaboradores_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABELA DE INVENTÁRIO DE DEPÓSITO / WMS
CREATE TABLE IF NOT EXISTS `inventario_deposito` (
  `id` VARCHAR(64) NOT NULL,
  `codigo` VARCHAR(32) DEFAULT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `categoria` VARCHAR(128) DEFAULT 'Geral',
  `quantidade_total` INT DEFAULT '0',
  `quantidade_disponivel` INT DEFAULT '0',
  `quantidade_manutencao` INT DEFAULT '0',
  `nivel_critico` INT DEFAULT '5',
  `localizacao` VARCHAR(128) DEFAULT 'Depósito Central',
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_inventario_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABELA FINANCEIRA (CONTAS A PAGAR E RECEBER)
CREATE TABLE IF NOT EXISTS `transacoes_financeiras` (
  `id` VARCHAR(64) NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `tipo` ENUM('receita', 'despesa') NOT NULL,
  `categoria` VARCHAR(128) DEFAULT 'Geral',
  `status` ENUM('Pendente', 'Pago', 'Recebido', 'Cancelado') DEFAULT 'Pendente',
  `data_vencimento` DATE NOT NULL,
  `data_pagamento` DATE DEFAULT NULL,
  `projeto_id` VARCHAR(64) DEFAULT NULL,
  `comprovante_url` VARCHAR(512) DEFAULT NULL,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_financas_tipo` (`tipo`),
  INDEX `idx_financas_status` (`status`),
  CONSTRAINT `fk_financas_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos_eventos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABELA DE PROPOSTAS E ORÇAMENTOS
CREATE TABLE IF NOT EXISTS `propostas_orcamentos` (
  `id` VARCHAR(64) NOT NULL,
  `codigo` VARCHAR(32) NOT NULL,
  `cliente_nome` VARCHAR(255) NOT NULL,
  `evento_vinculado_id` VARCHAR(64) DEFAULT NULL,
  `valor_total` DECIMAL(15,2) DEFAULT '0.00',
  `status` ENUM('Em Aberto', 'Enviado', 'Aprovado', 'Rejeitado') DEFAULT 'Em Aberto',
  `validade` DATE DEFAULT NULL,
  `itens_json` LONGTEXT DEFAULT NULL,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_propostas_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABELA DE LOGS DE AUDITORIA E SEGURANÇA
CREATE TABLE IF NOT EXISTS `logs_auditoria` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `usuario_id` VARCHAR(64) DEFAULT 'sistema',
  `usuario_nome` VARCHAR(128) DEFAULT 'Sistema',
  `acao` VARCHAR(128) NOT NULL,
  `detalhes` TEXT DEFAULT NULL,
  `ip_origem` VARCHAR(45) DEFAULT NULL,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_usuario` (`usuario_id`),
  INDEX `idx_audit_acao` (`acao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
