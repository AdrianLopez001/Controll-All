/**
 * Controll-All - Security & Data Protection Utilities
 * Provides input sanitization, safe URL handling, secure storage, and RBAC validation.
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

// 4. Role-Based Access Control (RBAC) Enforcer
export type UserRole = "admin" | "comercial" | "estoque" | "operador";

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "overview", "crm", "orcamentos", "os", "kanban", "agenda", 
    "warehouse", "logistics", "financial", "employees", "auditoria"
  ],
  comercial: ["overview", "crm", "orcamentos", "agenda"],
  estoque: ["overview", "warehouse", "logistics", "agenda"],
  operador: ["overview", "os", "kanban", "agenda"]
};

export function canUserAccessTab(role: UserRole, tab: string, activeModules: Record<string, boolean>): boolean {
  if (!activeModules[tab]) return false;
  const allowedTabs = ROLE_PERMISSIONS[role] || [];
  return allowedTabs.includes(tab);
}
