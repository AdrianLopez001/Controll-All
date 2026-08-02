import { describe, it, expect } from "vitest";

export function calculateEventFinancials(valorContratado: number, custoRealizado: number) {
  const lucroBruto = valorContratado - custoRealizado;
  const margemPercentual = valorContratado > 0 ? ((lucroBruto / valorContratado) * 100) : 0;
  return {
    lucroBruto,
    margemPercentual: parseFloat(margemPercentual.toFixed(1))
  };
}

describe("Financial Calculations Unit Tests", () => {
  it("should calculate correct gross profit and percentage margin", () => {
    const result = calculateEventFinancials(35000, 14000);
    expect(result.lucroBruto).toBe(21000);
    expect(result.margemPercentual).toBe(60.0);
  });

  it("should handle zero contratado gracefully without division by zero", () => {
    const result = calculateEventFinancials(0, 5000);
    expect(result.lucroBruto).toBe(-5000);
    expect(result.margemPercentual).toBe(0);
  });

  it("should calculate 100% margin when cost is zero", () => {
    const result = calculateEventFinancials(10000, 0);
    expect(result.lucroBruto).toBe(10000);
    expect(result.margemPercentual).toBe(100.0);
  });
});
