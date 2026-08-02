/**
 * Unified API Client for Controll-All on Hostinger Environment.
 * Handles HTTPS REST requests, Bearer Token Auth, and offline fallback safely.
 */

import { env } from "../config/env";
import { safeStorage } from "../utils/security";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = safeStorage.getItem(env.tokenStorageKey, "");
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${env.apiUrl}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders()
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err: any) {
      console.warn(`[ApiService] Hostinger API unavailable on ${endpoint}. Operating with secure local storage fallback.`);
      return { success: false, error: err?.message || "Conexão indisponível", timestamp: new Date().toISOString() };
    }
  }

  async post<T>(endpoint: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${env.apiUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err: any) {
      console.warn(`[ApiService] Hostinger API POST request fallback for ${endpoint}.`);
      return { success: false, error: err?.message || "Falha na sincronização", timestamp: new Date().toISOString() };
    }
  }
}

export const api = new ApiService();
