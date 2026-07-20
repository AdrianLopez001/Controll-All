import { useState, type FormEvent } from "react";
import { Archive, FileText, CheckCircle2, ArrowDownCircle } from "lucide-react";
import type { WarehouseItem, InvoiceLog } from "../types";

interface WarehouseProps {
  warehouseItems: WarehouseItem[];
  invoiceLogs: InvoiceLog[];
  onAddInvoice: (vendor: string, number: string, value: number, description: string) => void;
  onUpdateStock: (id: string, newStock: number) => void;
}

export default function Warehouse({
  warehouseItems,
  invoiceLogs,
  onAddInvoice,
  onUpdateStock
}: WarehouseProps) {
  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!vendor || !invoiceNumber || !value || !description) return;
    
    onAddInvoice(vendor, invoiceNumber, parseFloat(value) || 0, description);
    
    // Reset form
    setVendor("");
    setInvoiceNumber("");
    setValue("");
    setDescription("");
    
    setSuccessMessage("Nota batida e conferida com sucesso! Estoque atualizado.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="responsive-layout-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
      {/* Left Column: Inventory List */}
      <div className="section-box" style={{ height: "auto" }}>
        <div className="section-box-header">
          <h3 className="section-box-title">
            <Archive size={16} style={{ color: "var(--accent)" }} />
            Inventário do Depósito (Ferramentas &amp; Móveis)
          </h3>
        </div>

        <table className="sheet-table table-responsive-cards">
          <thead>
            <tr>
              <th>Item</th>
              <th>Tipo</th>
              <th>Estoque Disponível</th>
              <th style={{ width: "120px", textAlign: "center" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {warehouseItems.map((item) => (
              <tr key={item.id} className="sheet-row">
                <td data-label="Item" className="semibold">{item.name}</td>
                <td data-label="Tipo">
                  <span className={`badge ${item.type === "tool" ? "badge-pt" : "badge-en"}`}>
                    {item.type === "tool" ? "Ferramenta" : "Mobiliário"}
                  </span>
                </td>
                <td data-label="Estoque Disponível" className={item.stock < 5 ? "semibold text-danger" : ""}>
                  {item.stock} unidades
                  {item.stock < 5 && (
                    <span className="text-xs text-danger" style={{ display: "block", fontWeight: "normal" }}>
                      ⚠️ Estoque Crítico!
                    </span>
                  )}
                </td>
                <td data-label="Ações" style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                    <button 
                      className="btn-secondary text-xs" 
                      style={{ padding: "2px 6px" }}
                      onClick={() => onUpdateStock(item.id, item.stock + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="btn-secondary text-xs" 
                      style={{ padding: "2px 6px" }}
                      onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                    >
                      -
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Column: Invoice Checker Form & History */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Form: Bater Nota Fiscal */}
        <div className="section-box" style={{ minHeight: "auto" }}>
          <div className="section-box-header">
            <h3 className="section-box-title">
              <FileText size={16} style={{ color: "var(--warning)" }} />
              Conferir / Bater Nota Fiscal
            </h3>
          </div>

          {successMessage && (
            <div style={{ padding: "10px", borderRadius: "8px", background: "var(--success-glow)", border: "1px solid var(--success)", color: "var(--success)", fontSize: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={14} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Fornecedor</label>
              <input 
                type="text" 
                value={vendor} 
                onChange={(e) => setVendor(e.target.value)} 
                placeholder="Ex: Madeireira Central S/A" 
                required
              />
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Número da Nota</label>
                <input 
                  type="text" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                  placeholder="Ex: NF-4429" 
                  required
                />
              </div>
              <div className="field">
                <label>Valor Total (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={value} 
                  onChange={(e) => setValue(e.target.value)} 
                  placeholder="Ex: 1540.00" 
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Materiais Recebidos (Descrição)</label>
              <textarea 
                rows={3}
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Ex: 20 Chapas de MDF Cru, 50 caibros de pinus 3m, 2kg parafusos 4.5x45..." 
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-20" style={{ justifyContent: "center" }}>
              <ArrowDownCircle size={16} /> Confirmar Entrada no Depósito
            </button>
          </form>
        </div>

        {/* Invoice Logs List */}
        <div className="section-box" style={{ minHeight: "200px" }}>
          <div className="section-box-header">
            <h3 className="section-box-title">
              <FileText size={16} className="text-muted" />
              Histórico de Notas Conferidas
            </h3>
          </div>

          <div className="invoice-log-list">
            {invoiceLogs.length === 0 ? (
              <p className="text-muted text-sm" style={{ textAlign: "center", padding: "20px 0" }}>Nenhuma nota fiscal registrada.</p>
            ) : (
              invoiceLogs.map((log) => (
                <div key={log.id} className="invoice-log-item">
                  <div>
                    <strong className="text-sm" style={{ display: "block" }}>{log.vendor}</strong>
                    <span className="text-xs text-muted" style={{ display: "block", marginTop: "2px" }}>
                      Nota: #{log.invoiceNumber} | Valor: R$ {log.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-muted" style={{ display: "block", fontStyle: "italic", marginTop: "4px" }}>
                      {log.description}
                    </span>
                  </div>
                  <span className="text-xs text-muted" style={{ flexShrink: 0, marginLeft: "12px" }}>{log.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
