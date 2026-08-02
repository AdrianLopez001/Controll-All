/**
 * Configuration manager for Controll-All environment settings.
 * Automatically adapts between Hostinger Production API and Local Dev Fallback.
 */

export interface AppEnvConfig {
  isProduction: boolean;
  apiUrl: string;
  enableApiFallback: boolean;
  tokenStorageKey: string;
  csrfHeaderName: string;
}

export const env: AppEnvConfig = {
  isProduction: import.meta.env.PROD || false,
  apiUrl: import.meta.env.VITE_API_URL || "https://api.controllall.com.br",
  enableApiFallback: true,
  tokenStorageKey: "controllall_auth_token",
  csrfHeaderName: "X-CSRF-Token",
};
