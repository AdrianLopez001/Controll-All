import { describe, it, expect } from "vitest";

export interface NavigationState {
  activeTab: string;
  subTab?: string;
  configSubTab?: string;
}

export function resolveNavigation(tab: string, subTab?: string): NavigationState {
  let state: NavigationState = { activeTab: tab, subTab };

  if (tab === "financial" && subTab === "centro_custo") {
    state.activeTab = "financial";
    state.subTab = "configuracoes";
    state.configSubTab = "centro_custo";
  }

  return state;
}

describe("Dashboard Routing & Navigation Unit Tests", () => {
  it("should resolve standard tab navigation correctly", () => {
    const nav = resolveNavigation("kanban");
    expect(nav.activeTab).toBe("kanban");
    expect(nav.subTab).toBeUndefined();
  });

  it("should resolve financial centro_custo deep navigation to configuracoes tab", () => {
    const nav = resolveNavigation("financial", "centro_custo");
    expect(nav.activeTab).toBe("financial");
    expect(nav.subTab).toBe("configuracoes");
    expect(nav.configSubTab).toBe("centro_custo");
  });

  it("should resolve warehouse critico navigation to warehouse tab", () => {
    const nav = resolveNavigation("warehouse", "critico");
    expect(nav.activeTab).toBe("warehouse");
    expect(nav.subTab).toBe("critico");
  });
});
