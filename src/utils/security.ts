/**
 * Controll-All - Security & Data Protection Utilities
 * Provides input sanitization, safe URL handling, secure storage, RBAC validation,
 * and audit logging for Hostinger production deployment.
 */

// 1. XSS & HTML Input Sanitization
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// 2. Safe URL Sanitizer (Prevents javascript: or data: URI injection)
export function sanitizeUrl(url: string, defaultFallback = "#"): string {
  if (!url || typeof url !== "string") return defaultFallback;
  const trimmed = url.trim();
  
  // Allow http, https, mailto, tel, and relative anchor links
  const safeProtocolRegex = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
  if (safeProtocolRegex.test(trimmed)) {
    return trimmed;
  }
  
  return defaultFallback;
}

// 3. Safe Storage Wrapper with Exception Handling & Integrity
export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(`controll_all_${key}`);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`[SecurityStorage] Erro ao carregar a chave "${key}". Usando valor padrão.`, error);
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`controll_all_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`[SecurityStorage] Falha ao armazenar a chave "${key}".`, error);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(`controll_all_${key}`);
    } catch (error) {
      console.error(`[SecurityStorage] Erro ao remover a chave "${key}".`, error);
    }
  }
};

// 4. Role-Based Access Control (RBAC) Enforcer - PLANO DE PRODUÇÃO SEÇÃO 2.2
export type UserRole = "dono" | "gerente" | "supervisor" | "estoquista" | "financeiro" | "admin" | "comercial" | "operador";

export const ROLE_LABELS: Record<UserRole, { title: string; color: string; desc: string }> = {
  dono: { title: "DONO (Admin Master)", color: "#ef4444", desc: "Acesso Total a Todos os Módulos" },
  gerente: { title: "GERENTE", color: "#f97316", desc: "Acesso Geral (exceto Config. do Sistema)" },
  supervisor: { title: "SUPERVISOR", color: "#eab308", desc: "Eventos, OS, Equipes, Logística & WMS" },
  estoquista: { title: "ESTOQUISTA", color: "#3b82f6", desc: "Depósito/WMS, OS & Agenda" },
  financeiro: { title: "FINANCEIRO", color: "#10b981", desc: "Financeiro, Orçamentos, Config. & CRM" },
  admin: { title: "DONO (Admin Master)", color: "#ef4444", desc: "Acesso Total" },
  comercial: { title: "COMERCIAL", color: "#8b5cf6", desc: "CRM & Orçamentos" },
  operador: { title: "OPERADOR", color: "#6b7280", desc: "OS & Kanban" }
};

const ALL_MODULES = [
  "overview", "crm", "orcamentos", "os", "kanban", "agenda", 
  "warehouse", "logistics", "financial", "employees", "auditoria", "config"
];

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  dono: ALL_MODULES,
  admin: ALL_MODULES,
  gerente: [
    "overview", "crm", "orcamentos", "os", "kanban", "agenda", 
    "warehouse", "logistics", "financial", "employees", "auditoria"
  ],
  supervisor: [
    "overview", "crm", "orcamentos", "os", "kanban", "agenda", 
    "warehouse", "logistics", "employees", "auditoria"
  ],
  estoquista: [
    "overview", "os", "kanban", "agenda", "warehouse", "logistics"
  ],
  financeiro: [
    "overview", "crm", "orcamentos", "os", "kanban", "agenda", 
    "logistics", "financial", "config", "auditoria"
  ],
  comercial: ["overview", "crm", "orcamentos", "agenda"],
  operador: ["overview", "os", "kanban", "agenda"]
};

// Returns whether a user role has read/write permission to a module tab
export function canUserAccessTab(role: UserRole, tab: string, activeModules: Record<string, boolean>): boolean {
  if (!activeModules[tab]) return false;
  const allowedTabs = ROLE_PERMISSIONS[role] || ALL_MODULES;
  return allowedTabs.includes(tab);
}

// Returns whether a user role can perform write/edit actions in a module
export function canUserEditModule(role: UserRole, tab: string): boolean {
  if (role === "dono" || role === "admin" || role === "gerente") return true;
  
  if (role === "supervisor") {
    return ["os", "kanban", "employees", "logistics", "warehouse"].includes(tab);
  }
  if (role === "estoquista") {
    return ["warehouse", "os"].includes(tab);
  }
  if (role === "financeiro") {
    return ["financial", "orcamentos", "config"].includes(tab);
  }
  if (role === "comercial") {
    return ["crm", "orcamentos"].includes(tab);
  }
  if (role === "operador") {
    return ["os"].includes(tab);
  }
  
  return false;
}

// 5. Hostinger Production Audit Logger
export interface SecurityAuditLog {
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export function logSecurityEvent(user: string, action: string, details: string): void {
  const existingLogs = safeStorage.getItem<SecurityAuditLog[]>("security_audit_logs", []);
  const newLog: SecurityAuditLog = {
    timestamp: new Date().toISOString(),
    user: sanitizeInput(user),
    action: sanitizeInput(action),
    details: sanitizeInput(details)
  };
  
  // Keep latest 100 security logs
  const updated = [newLog, ...existingLogs].slice(0, 100);
  safeStorage.setItem("security_audit_logs", updated);
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
