# 📋 PLANO DE PRODUÇÃO — CONTROLL-ALL ERP v2.0
**Cliente:** JC Eventos  
**Data:** Agosto 2026  
**Status:** 🔵 Planejamento Aprovado — Aguardando Execução  
**Documento:** Plano Técnico Completo para Migração para Produção Web

---

## 1. VISÃO GERAL DO SISTEMA

O **Controll-All** é um ERP (Enterprise Resource Planning) desenvolvido exclusivamente para a **JC Eventos**, cobrindo as seguintes áreas operacionais:

| Módulo | Descrição |
|---|---|
| 📊 **Dashboard** | Painel executivo com KPIs consolidados |
| 👥 **CRM** | Pipeline de leads, clientes e fornecedores |
| 🏗️ **Eventos & Projetos** | Kanban de estandes, cronogramas, checklists |
| 📦 **WMS / Depósito** | Almoxarifado, ferramentas, locações |
| 👷 **RH & Equipes** | Colaboradores, NRs, escalas, ativos |
| 💰 **Financeiro** | Contas a pagar/receber, centro de custos |
| 🚛 **Logística** | Frota, viagens, passagens, hotéis |
| 🧾 **Orçamentos** | Propostas simplificadas e detalhadas |
| 🔧 **Ordens de Serviço** | OS com Kanban, assinatura digital, fotos |
| 📅 **Agenda** | Calendário de eventos e compromissos |
| 📈 **Relatórios** | Auditoria, histórico de alterações |

> **Importante:** O sistema é de uso exclusivo da JC Eventos. Não é um produto SaaS.

---

## 2. USUÁRIOS E PERFIS DE ACESSO (RBAC)

O sistema terá **9 usuários fixos** organizados em **5 perfis de permissão**:

### 2.1 Tabela de Usuários

| Perfil | Qtd | Acesso |
|---|---|---|
| **DONO** (Admin Master) | 2 | Acesso total — sem restrições |
| **GERENTE** | 2 | Acesso a todos os módulos exceto configurações de sistema |
| **SUPERVISOR** | 1 | Eventos, OS, Equipes, Logística, WMS |
| **ESTOQUISTA** | 3 | WMS/Depósito, OS (somente leitura), Agenda |
| **FINANCEIRO** | 1 | Financeiro, OS (somente leitura), Agenda |


### 2.2 Matriz de Permissões Detalhada

| Módulo | DONO | GERENTE | SUPERVISOR | ESTOQUISTA | FINANCEIRO |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ Full | ✅ Full | ✅ Read | ✅ Read | ✅ Read |
| CRM & Clientes | ✅ Full | ✅ Full | 👁️ Read | ❌ | ✅ Read |
| Eventos & Projetos | ✅ Full | ✅ Full | ✅ Full | 👁️ Read | ✅ Read |
| WMS / Depósito | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Read |
| RH & Equipes | ✅ Full | ✅ Full | ✅ Full | ❌ | Full |
| Financeiro | ✅ Full | ✅ Full | ❌ | ❌ | ✅ Full |
| Logística | ✅ Full | ✅ Full | ✅ Full | 👁️ Read | ✅ Read |
| Orçamentos | ✅ Full | ✅ Full | 👁️ Read | ❌ | ✅ Full |
| Ordens de Serviço | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Read |
| Agenda | ✅ Full | ✅ Full | ✅ Full | 👁️ Read | ✅ Read |
| Relatórios & Audit | ✅ Full | ✅ Full | 👁️ Read | ❌ | ✅ Read |
| Config. do Sistema | ✅ Full | ❌ | ❌ | ❌ | ✅ Full |

---

## 3. STACK TECNOLÓGICA DEFINIDA

### 3.1 Frontend (Já Desenvolvido)
```
React 19 + TypeScript 6 + Vite 8
Lucide React (ícones)
html2pdf.js (exportação PDF)
```

### 3.2 Backend (A Desenvolver)
```
Java 21 LTS
Spring Boot 3.x
Spring Security 6 (autenticação e autorização)
Spring Data JPA + Hibernate (ORM)
Spring Validation (validação de dados)
Flyway (migrations de banco de dados)
JWT (access token + refresh token)
TOTP (Google Authenticator — 2FA)
JavaMail (e-mail via Hostinger SMTP)
```

### 3.3 Banco de Dados
```
PostgreSQL 16 (já disponível na Hostinger)
Modelagem relacional — ~18 tabelas principais
Flyway para controle de versão do schema
```

### 3.4 Infraestrutura (Hostinger)
```
VPS KVM 4 (mínimo: 8GB RAM, 4 vCPU)
Nginx (reverse proxy → Spring Boot na porta 8080)
SSL/TLS via Let's Encrypt (HTTPS obrigatório)
SMTP Hostinger (e-mail transacional)
```

---

## 4. ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────┐
│            USUÁRIO (Browser Desktop)         │
└─────────────────┬───────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────┐
│              NGINX (Hostinger VPS)           │
│  ┌──────────────────┐ ┌───────────────────┐ │
│  │  React SPA       │ │  /api/**           │ │
│  │  (arquivos       │ │  Proxy → :8080     │ │
│  │   estáticos)     │ │                   │ │
│  └──────────────────┘ └────────┬──────────┘ │
└───────────────────────────────┼─────────────┘
                                │
┌───────────────────────────────▼─────────────┐
│          Spring Boot Application (:8080)     │
│  ┌────────────────────────────────────────┐  │
│  │  Spring Security (JWT Filter + RBAC)  │  │
│  ├────────────────────────────────────────┤  │
│  │  REST Controllers (15+ endpoints)     │  │
│  ├────────────────────────────────────────┤  │
│  │  Service Layer (regras de negócio)    │  │
│  ├────────────────────────────────────────┤  │
│  │  Spring Data JPA / Hibernate          │  │
│  └─────────────────┬──────────────────────┘  │
└─────────────────────┼───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│          PostgreSQL 16 (Hostinger)           │
│  ~18 tabelas + relacionamentos               │
└─────────────────────────────────────────────┘
```

---

## 5. SEGURANÇA E AUTENTICAÇÃO

### 5.1 Fluxo de Login com JWT + 2FA

```
1. Usuário envia e-mail + senha → POST /api/auth/login
2. Spring verifica BCrypt hash da senha
3. Se válido → gera código TOTP (6 dígitos) → envia por app ou e-mail
4. Usuário envia código → POST /api/auth/verify-2fa
5. Backend valida TOTP → retorna:
   - Access Token (JWT) — expira em 15 minutos
   - Refresh Token — expira em 7 dias (salvo em httpOnly cookie)
6. Frontend armazena Access Token em memória (nunca em localStorage)
7. A cada requisição, envia no header: Authorization: Bearer <token>
8. Ao expirar → POST /api/auth/refresh → novo Access Token
9. Logout → POST /api/auth/logout → token entra em blacklist
```

### 5.2 Proteções Implementadas

| Proteção | Implementação |
|---|---|
| **Senha** | BCrypt strength 12 — hash nunca reversível |
| **JWT** | Algoritmo RS256 (chave pública/privada) |
| **2FA** | TOTP (RFC 6238) — compatível com Google Authenticator |
| **Refresh Token** | httpOnly cookie — imune a XSS |
| **Blacklist de tokens** | Tabela `revoked_tokens` no PostgreSQL |
| **Rate Limiting** | Máx. 5 tentativas de login por minuto por IP |
| **CORS** | Apenas domínio da JC Eventos autorizado |
| **HTTPS** | Let's Encrypt + redirecionamento HTTP → HTTPS |
| **Campos sensíveis** | CPF, RG, Pix dos colaboradores — criptografados (AES-256) no banco |
| **Auditoria** | Toda ação gravada: usuário, hora, IP, módulo, antes/depois |

### 5.3 Configuração 2FA — Opções

> Recomenda-se oferecer **ambas** as opções ao usuário no primeiro login.

| Método | Como funciona | Custo |
|---|---|---|
| **Google Authenticator** (TOTP) | App gera código a cada 30s — zero dependência de internet | Gratuito |
| **E-mail com código** | Spring envia código via SMTP Hostinger | Gratuito |

---

## 6. BANCO DE DADOS — MODELAGEM

### 6.1 Tabelas Principais (~18 tabelas)

```sql
-- AUTENTICAÇÃO
users                  (id, email, password_hash, role, 2fa_secret, active)
revoked_tokens         (id, token_hash, revoked_at, user_id)

-- OPERACIONAL
projects               (id, codigo, name, client_id, phase, dates, financeiro...)
checklist_items        (id, project_id, text, done, order)
project_employees      (project_id, employee_id, role, turno)   -- N:N
project_tools          (project_id, warehouse_item_id, qty)     -- N:N
project_docs           (id, project_id, name, status, file_path)

-- CRM
leads_crm              (id, empresa, contato, estagio, valor, origem...)
clientes               (id, name, cnpj, email, telefone)
fornecedores           (id, name, cnpj, servico, email)

-- FINANCEIRO
invoice_logs           (id, tipo, valor, categoria, status, project_id...)
centro_custo           (id, project_id, madeira_mdf, fretes, hospedagem...)

-- WMS
warehouse_items        (id, codigo, name, category, stock, localizacao...)
item_movements         (id, item_id, employee_id, tipo, qty, date)

-- RH
employees              (id, name, role, cpf_encrypted, rg_encrypted, pix_key...)
employee_assets        (id, employee_id, tipo, descricao, date)

-- OS
ordens_servico         (id, codigo, cliente, status, prioridade, assinatura...)
os_comentarios         (id, os_id, autor, texto, date)
os_fotos               (id, os_id, file_path, name, date)

-- LOGÍSTICA
veiculos               (id, modelo, placa, motorista, status)
viagens                (id, veiculo_id, employee_id, destino, hotel...)

-- ORÇAMENTOS
orcamentos             (id, codigo, cliente, tipo, total, status, event_id...)
orcamento_itens        (id, orcamento_id, nome, categoria, qty, valor_unit...)

-- AUDITORIA
auditoria_logs         (id, user_id, acao, modulo, detalhes, ip, date)
```

### 6.2 Migrations com Flyway

```
src/main/resources/db/migration/
  V1__create_auth_tables.sql
  V2__create_projects_tables.sql
  V3__create_crm_tables.sql
  V4__create_financial_tables.sql
  V5__create_wms_tables.sql
  V6__create_employees_tables.sql
  V7__create_os_tables.sql
  V8__create_logistics_tables.sql
  V9__create_orcamentos_tables.sql
  V10__seed_initial_data.sql
```

---

## 7. UPLOAD DE ARQUIVOS — ESTRATÉGIA POR MÓDULO

### 7.1 Estrutura de Diretórios no VPS

```
/var/jceventos/uploads/
  ├── eventos/
  │   ├── {event_id}/
  │   │   ├── planta_baixa/        ← PDFs/imagens da planta do estande
  │   │   ├── contratos/           ← Contrato assinado (PDF)
  │   │   ├── art/                 ← ART do CREA (PDF)
  │   │   ├── credenciais/         ← Credenciais do pavilhão
  │   │   └── fotos_montagem/      ← Fotos do stand em montagem
  │
  ├── os/
  │   ├── {os_id}/
  │   │   ├── fotos/               ← Fotos tiradas no campo (JPEG)
  │   │   └── assinaturas/         ← Assinatura digital (PNG base64 → arquivo)
  │
  ├── financeiro/
  │   ├── comprovantes/            ← Comprovantes de pagamento por ano/mês
  │   │   └── 2026/07/
  │   └── notas_fiscais/           ← NFe, recibos, boletos
  │
  ├── rh/
  │   ├── {employee_id}/
  │   │   ├── documentos/          ← RG, CPF, CNH escaneados
  │   │   └── certificados_nr/     ← Certificados NR-10, NR-35 (PDF)
  │
  ├── wms/
  │   └── fotos_itens/             ← Foto do item do almoxarifado
  │
  ├── orcamentos/
  │   └── {orcamento_id}/          ← PDF gerado da proposta exportada
  │
  └── crm/
      └── {lead_id}/               ← Briefing, referências visuais enviadas pelo cliente
```

### 7.2 Regras de Upload

| Regra | Detalhe |
|---|---|
| **Tamanho máximo** | 15 MB por arquivo |
| **Tipos permitidos** | PDF, JPG, PNG, DOCX — validação no backend |
| **Nome do arquivo** | UUID gerado pelo servidor (nunca nome original) |
| **Acesso** | Endpoint protegido por JWT — não há URL pública direta |
| **Antivírus** | Validação de MIME type + magic bytes no Spring |

---

## 8. ASSINATURA DIGITAL NAS ORDENS DE SERVIÇO

### 8.1 Como Funciona

A assinatura digital nas OS será capturada via **canvas no browser** (pad de assinatura) e salva como imagem no servidor.

```
Fluxo:
1. Técnico finaliza OS e exibe tela de assinatura
2. Cliente (ou responsável) assina com mouse/touch no campo canvas
3. Frontend converte para PNG base64
4. POST /api/os/{id}/assinatura → Spring salva em /uploads/os/{id}/assinaturas/
5. OS recebe status "assinada" + timestamp + nome do signatário
6. PDF da OS gerado inclui a imagem da assinatura + dados do responsável
```

### 8.2 Dados Capturados na Assinatura

```typescript
{
  assinadoPor: string,          // Nome digitado pelo signatário
  cargo: string,                // Cargo/papel (ex: "Responsável do Estande")
  dataAssinatura: string,       // Timestamp ISO 8601
  imagemAssinatura: string,     // Caminho do arquivo PNG no servidor
  ipDispositivo: string,        // IP registrado (auditoria)
  userAgent: string             // Navegador/dispositivo (auditoria)
}
```

### 8.3 Biblioteca Frontend Sugerida

```
signature_pad (npm) — leve, sem dependências, funciona em canvas HTML5
```

> ⚠️ **Pendência no Frontend:** O módulo de OS tem o campo `OSAssinaturas` nos tipos TypeScript mas a interface de captura via canvas ainda não foi implementada. Precisa ser desenvolvida.

---

## 9. E-MAIL TRANSACIONAL (HOSTINGER SMTP)

### 9.1 Casos de Uso

| Evento | E-mail enviado |
|---|---|
| Primeiro login | Boas-vindas + link para configurar 2FA |
| Código 2FA | Código de 6 dígitos com validade de 10 min |
| Redefinição de senha | Link seguro com token único + 30 min de validade |
| Nova OS criada | Notificação para o supervisor responsável |
| OS assinada | Confirmação para o cliente e cópia para gerência |
| Proposta enviada | Cópia do PDF da proposta para o cliente |
| Alerta de estoque mínimo | Notificação automática diária para DONO/GERENTE |
| Conta vencendo | Alerta 3 dias antes de vencimento de contas a pagar |

### 9.2 Configuração Spring (application.properties)

```properties
spring.mail.host=smtp.hostinger.com
spring.mail.port=587
spring.mail.username=noreply@jceventos.com.br
spring.mail.password=${SMTP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

## 10. BACKUP AUTOMÁTICO DO POSTGRESQL

### 10.1 Estratégia de Backup

| Tipo | Frequência | Retenção |
|---|---|---|
| **Backup Diário** | Todo dia às 02:00 | Mantém últimos 30 dias |
| **Backup Semanal** | Todo domingo às 03:00 | Mantém últimas 12 semanas |
| **Backup Mensal** | Todo dia 1 às 04:00 | Mantém últimos 12 meses |

### 10.2 Script de Backup Automatizado (Cron no VPS)

```bash
# /opt/scripts/backup_postgres.sh

#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/jcventos_db"
DB_NAME="controll_all"
DB_USER="jc_admin"

mkdir -p "$BACKUP_DIR/diario"
mkdir -p "$BACKUP_DIR/semanal"
mkdir -p "$BACKUP_DIR/mensal"

# Gera dump comprimido
PGPASSWORD="$DB_PASS" pg_dump -U "$DB_USER" "$DB_NAME" \
  | gzip > "$BACKUP_DIR/diario/backup_${TIMESTAMP}.sql.gz"

# Remove backups diários com mais de 30 dias
find "$BACKUP_DIR/diario" -name "*.gz" -mtime +30 -delete

echo "Backup concluído: backup_${TIMESTAMP}.sql.gz"
```

### 10.3 Agendamento via Crontab

```cron
# Abre o crontab: crontab -e

# Backup diário — todo dia às 02:00
0 2 * * * /opt/scripts/backup_postgres.sh diario

# Backup semanal — domingo às 03:00
0 3 * * 0 /opt/scripts/backup_postgres.sh semanal

# Backup mensal — dia 1 às 04:00
0 4 1 * * /opt/scripts/backup_postgres.sh mensal
```

### 10.4 Monitoramento do Backup

- O script envia e-mail de confirmação após cada backup (via SMTP Hostinger)
- Se o backup falhar, alerta enviado para `donos@jceventos.com.br`
- Recomenda-se também configurar a função de **backup automático do painel Hostinger** como camada extra de segurança

> ⚠️ **Importante:** Testar **restore** mensalmente com: `gunzip -c backup.sql.gz | psql -U jc_admin controll_all`

---

## 11. MIGRAÇÃO DO FRONTEND (localStorage → API REST)

### 11.1 O Que Muda no Frontend

Hoje todos os dados vivem no `localStorage` do browser. Após a migração:

```typescript
// ANTES (localStorage)
const events = JSON.parse(localStorage.getItem("controll_all_events") || "[]");
localStorage.setItem("controll_all_events", JSON.stringify(updatedEvents));

// DEPOIS (API REST)
const events = await fetch("/api/events", {
  headers: { "Authorization": `Bearer ${accessToken}` }
}).then(r => r.json());

await fetch("/api/events", {
  method: "POST",
  headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
  body: JSON.stringify(newEvent)
});
```

### 11.2 Arquivos Frontend a Modificar

| Arquivo | Trabalho |
|---|---|
| `App.tsx` (~2089 linhas) | Substituir toda a lógica de estado local por chamadas API |
| `components/Financial.tsx` | Maior componente — integrar endpoints financeiros |
| `components/Orcamentos.tsx` | Integrar endpoints de orçamentos |
| `components/OrdensServico.tsx` | Integrar endpoints de OS + upload de fotos + assinatura |
| `components/CRM.tsx` | Integrar endpoints de CRM |
| `components/WmsModule.tsx` | Integrar endpoints de WMS + upload de fotos |
| Todos os demais | Menor impacto — principalmente leitura de dados |
| **NOVO** | Módulo de autenticação (`/login`, interceptor JWT, refresh automático) |

---

## 12. MÓDULO DE ASSINATURA DIGITAL — IMPLEMENTAÇÃO PENDENTE

> Este módulo existe parcialmente nos tipos TypeScript mas precisa ser construído no frontend.

### 12.1 O Que Falta no Frontend

- [ ] Componente `<SignaturePad />` usando biblioteca `signature_pad`
- [ ] Modal de finalização de OS com campo de nome do signatário
- [ ] Preview da assinatura antes de confirmar
- [ ] Botão "Limpar" e "Confirmar Assinatura"
- [ ] Envio da imagem base64 para o backend via multipart/form-data
- [ ] Exibição da assinatura capturada no PDF exportado da OS

---

## 13. ENDPOINTS REST — ESTRUTURA COMPLETA

```
POST   /api/auth/login
POST   /api/auth/verify-2fa
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/events
POST   /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
POST   /api/events/{id}/upload

GET    /api/leads
POST   /api/leads
PUT    /api/leads/{id}
DELETE /api/leads/{id}

GET    /api/clientes
POST   /api/clientes
PUT    /api/clientes/{id}

GET    /api/fornecedores
POST   /api/fornecedores

GET    /api/orcamentos
POST   /api/orcamentos
GET    /api/orcamentos/{id}
PUT    /api/orcamentos/{id}
DELETE /api/orcamentos/{id}

GET    /api/os
POST   /api/os
GET    /api/os/{id}
PUT    /api/os/{id}
POST   /api/os/{id}/assinatura       ← Upload assinatura digital
POST   /api/os/{id}/fotos            ← Upload fotos de campo
POST   /api/os/{id}/comentarios

GET    /api/employees
POST   /api/employees
PUT    /api/employees/{id}
POST   /api/employees/{id}/upload    ← Upload documentos RH

GET    /api/warehouse
POST   /api/warehouse
PUT    /api/warehouse/{id}
POST   /api/warehouse/{id}/movement  ← Entrada/saída de estoque

GET    /api/financial/invoices
POST   /api/financial/invoices
PUT    /api/financial/invoices/{id}
POST   /api/financial/invoices/{id}/upload  ← Comprovantes

GET    /api/logistics/vehicles
POST   /api/logistics/vehicles
GET    /api/logistics/trips

GET    /api/audit/logs
GET    /api/reports/overview
GET    /api/reports/financial-summary

GET    /api/admin/users             ← Somente DONO
POST   /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
```

---

## 14. FASES DE DESENVOLVIMENTO

### Fase 1 — Infraestrutura e Backend Base (Semanas 1–3)
- [ ] Configurar VPS Hostinger (Ubuntu 22.04 LTS)
- [ ] Instalar Java 21, PostgreSQL 16, Nginx
- [ ] Criar projeto Spring Boot com estrutura de pacotes
- [ ] Configurar Flyway + criar migrations iniciais (V1–V3)
- [ ] Implementar auth: login, JWT, refresh token
- [ ] Implementar 2FA (TOTP + e-mail)
- [ ] Configurar CORS e Spring Security com RBAC
- [ ] Configurar SMTP Hostinger para JavaMail

### Fase 2 — API REST dos Módulos Principais (Semanas 4–7)
- [ ] CRUD completo: Eventos / Projetos
- [ ] CRUD completo: CRM (Leads, Clientes, Fornecedores)
- [ ] CRUD completo: Orçamentos + Itens Detalhados
- [ ] CRUD completo: Ordens de Serviço
- [ ] CRUD completo: Funcionários (RH)
- [ ] CRUD completo: WMS / Almoxarifado
- [ ] CRUD completo: Financeiro (Invoices, Centro de Custo)
- [ ] CRUD completo: Logística (Veículos, Viagens)
- [ ] Upload de arquivos (todos os módulos)
- [ ] Módulo de Auditoria automático (log de cada operação)

### Fase 3 — Frontend: Autenticação e Migração de Dados (Semanas 8–10)
- [ ] Criar tela de login (e-mail + senha + código 2FA)
- [ ] Criar contexto de autenticação no React (AuthContext)
- [ ] Implementar interceptor JWT automático (refresh token)
- [ ] Implementar página de reset de senha
- [ ] Substituir `localStorage` por chamadas API — módulo por módulo:
  - [ ] App.tsx (estado global)
  - [ ] Eventos / Projetos
  - [ ] CRM
  - [ ] Orçamentos
  - [ ] OS
  - [ ] Financeiro
  - [ ] WMS
  - [ ] RH
  - [ ] Logística

### Fase 4 — Funcionalidades Pendentes (Semanas 11–13)
- [ ] Implementar `<SignaturePad />` nas Ordens de Serviço
- [ ] Implementar upload de fotos nas OS (câmera/arquivo)
- [ ] Implementar visualização de arquivos por módulo
- [ ] Painel Admin de Usuários (cadastro, troca de senha, roles)
- [ ] Alertas de estoque mínimo automáticos (scheduled job Spring)
- [ ] Alertas de contas vencendo (scheduled job Spring)
- [ ] Alertas de NR vencendo (NR-10, NR-35 dos colaboradores)

### Fase 5 — Deploy, Testes e Entrega (Semanas 14–16)
- [ ] Build do frontend React (`npm run build`) e deploy estático no Nginx
- [ ] Build do Spring Boot (`mvn package`) e deploy como JAR no VPS
- [ ] Configurar systemd para manter Spring Boot rodando como serviço
- [ ] Configurar Let's Encrypt (SSL automático)
- [ ] Configurar cron de backup automático PostgreSQL
- [ ] Testes de integração (todos os fluxos principais)
- [ ] Testes de segurança (tentativa de acesso entre roles)
- [ ] Teste de restore do backup
- [ ] Treinamento com os 9 usuários
- [ ] Documentação de usuário (manual básico)

---

## 15. INFRAESTRUTURA DE DEPLOY

### 15.1 Configuração Nginx

```nginx
server {
    listen 80;
    server_name controll-all.jceventos.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name controll-all.jceventos.com.br;

    ssl_certificate /etc/letsencrypt/live/controll-all.jceventos.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/controll-all.jceventos.com.br/privkey.pem;

    # Frontend (React SPA)
    root /var/www/controll-all;
    index index.html;
    try_files $uri /index.html;

    # API Spring Boot
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Uploads — nunca servir diretamente
    location /uploads/ { deny all; }

    # Aumentar limite para upload de arquivos
    client_max_body_size 20M;
}
```

### 15.2 Spring Boot como Serviço (systemd)

```ini
# /etc/systemd/system/controll-all.service
[Unit]
Description=Controll-All JC Eventos ERP
After=network.target postgresql.service

[Service]
User=jcapp
WorkingDirectory=/opt/controll-all
ExecStart=/usr/bin/java -jar controll-all.jar
EnvironmentFile=/opt/controll-all/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## 16. CUSTOS CONSOLIDADOS

### 16.1 Infraestrutura Mensal

| Item | Custo/mês |
|---|---|
| Hostinger VPS KVM 2 (4GB RAM) | R$ 70–80 |
| Domínio (ex: jceventos.com.br) | ~R$ 5 |
| SSL Let's Encrypt | ✅ Gratuito |
| PostgreSQL | ✅ Incluso no VPS |
| SMTP Hostinger | ✅ Incluso no plano |
| **Total mensal estimado** | **R$ 75–85/mês** |

### 16.2 Desenvolvimento

| Fase | Horas Estimadas | Custo (R$150/h pleno) |
|---|---|---|
| Fase 1 — Infra + Auth + Backend base | 25–35h | R$ 3.750–5.250 |
| Fase 2 — API REST completa | 45–60h | R$ 6.750–9.000 |
| Fase 3 — Migração Frontend | 30–40h | R$ 4.500–6.000 |
| Fase 4 — Funcionalidades pendentes | 20–28h | R$ 3.000–4.200 |
| Fase 5 — Deploy, testes, treinamento | 12–18h | R$ 1.800–2.700 |
| **Total geral** | **~132–181h** | **R$ 19.800–27.150** |

### 16.3 Custo Total Primeiro Ano

| Item | Valor |
|---|---|
| Desenvolvimento | R$ 19.800–27.150 |
| Infraestrutura (12 meses × R$80) | R$ 960 |
| **Total 1º Ano** | **R$ 20.760–28.110** |
| **A partir do 2º Ano** | **~R$ 960/ano** (só infraestrutura) |

---

## 17. CHECKLIST — O QUE ESTÁ PRONTO VS. O QUE FALTA

### ✅ Já Desenvolvido (Frontend)

- [x] Interface completa de todos os módulos
- [x] Kanban de Eventos por fase
- [x] Kanban de OS por prioridade
- [x] Orçamentos simplificados e detalhados com vínculo a eventos
- [x] CRM com pipeline de leads
- [x] WMS com estrutura hierárquica de almoxarifado
- [x] RH com certificações NR e histórico de ativos
- [x] Financeiro com centro de custo por evento
- [x] Logística de veículos e viagens
- [x] Módulo de Auditoria
- [x] Geração de PDF de propostas
- [x] Sistema de exportação PDF (html2pdf.js)
- [x] Build otimizado sem erros TypeScript

### 🔨 A Desenvolver

**Backend (Spring Boot):**
- [ ] Projeto Spring Boot inicial
- [ ] Banco de dados PostgreSQL modelado
- [ ] Sistema de autenticação JWT + 2FA
- [ ] Todos os endpoints REST (vide Seção 13)
- [ ] Sistema de upload de arquivos por módulo
- [ ] Jobs agendados (alertas, backups)
- [ ] E-mails transacionais

**Frontend:**
- [ ] Tela de login e redefinição de senha
- [ ] Contexto de autenticação / interceptor JWT
- [ ] Substituição de `localStorage` por chamadas API (todo `App.tsx`)
- [ ] Componente `<SignaturePad />` para OS
- [ ] Tela de upload e visualização de arquivos por módulo
- [ ] Painel de administração de usuários
- [ ] Notificações em tempo real (alertas de estoque, vencimentos)

**DevOps:**
- [ ] VPS configurado (Nginx, Java, PostgreSQL)
- [ ] CI/CD básico (script de deploy automático via GitHub Actions)
- [ ] Backup automatizado com cron
- [ ] Monitoramento do servidor (uptime + alertas de queda)

---

## 18. RISCOS E PONTOS DE ATENÇÃO

| Risco | Impacto | Mitigação |
|---|---|---|
| `App.tsx` tem 2089 linhas — migração complexa | Alto | Migrar módulo por módulo com testes a cada etapa |
| Bundle JS de 1.6 MB — carregamento | Médio | Implementar code splitting (lazy loading por módulo) |
| Backup não testado = backup inútil | Alto | Agendar teste de restore mensal |
| JWT expirado sem refresh automático | Médio | Implementar interceptor Axios/fetch com refresh |
| Upload de arquivos sem validação | Alto | Validar MIME type + tamanho no Spring antes de salvar |
| 2FA perdido (perda do celular) | Alto | Código de recuperação one-time na ativação do 2FA |
| LGPD — CPF, RG, Pix dos colaboradores | Alto | Criptografar campos sensíveis no banco (AES-256) |

---

## 19. PRÓXIMOS PASSOS IMEDIATOS

1. **Definir desenvolvedor backend** responsável pelo Spring Boot
2. **Criar o repositório do backend** (Spring Boot) separado do frontend
3. **Contratar / ativar plano VPS** na Hostinger (mínimo KVM 2)
4. **Definir domínio** que será usado (ex: app.jceventos.com.br)
5. **Criar as contas de e-mail** no painel Hostinger (noreply@, admin@)
6. **Aprovação deste plano** por ambos os sócios

---

*Documento gerado em: Agosto 2026 — Revisão 1.0*  
*Responsável técnico: Antigravity (AI Architect)*  
*Próxima revisão prevista: Após Fase 1 concluída*
