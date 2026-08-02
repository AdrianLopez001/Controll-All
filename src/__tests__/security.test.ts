import { describe, it, expect, beforeEach, vi } from "vitest";
import { safeStorage, sanitizeInput, validateEmail } from "../utils/security";

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true
});

describe("Security Utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should safely store and retrieve items from localStorage", () => {
    safeStorage.setItem("test_key", "hello_world");
    const val = safeStorage.getItem("test_key", "");
    expect(val).toBe("hello_world");
  });

  it("should return fallback default value when item is missing", () => {
    const val = safeStorage.getItem("non_existent_key", "default_value");
    expect(val).toBe("default_value");
  });

  it("should sanitize user inputs to prevent XSS attacks", () => {
    const dirty = "<script>alert('xss')</script><b>Test</b>";
    const clean = sanitizeInput(dirty);
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("</script>");
  });

  it("should validate email format correctly", () => {
    expect(validateEmail("admin@jceventos.com.br")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("")).toBe(false);
  });
});
