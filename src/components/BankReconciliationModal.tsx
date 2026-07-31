import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  Building2, Upload, RefreshCw, X, ArrowUpRight, ArrowDownLeft
} from "lucide-react";
import type { ContaBancaria, ExtratoBancarioItem, InvoiceLog } from "../types";

interface BankReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceLog[];
  onAddInvoice: (invoice: Omit<InvoiceLog, "id">) => void;
  onUpdateInvoice: (invoice: InvoiceLog) => void;
}

export const BankReconciliationModal: React.FC<BankReconciliationModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onAddInvoice,
  onUpdateInvoice
}) => {
  const [selectedContaId, setSelectedContaId] = useState<string>("c1");
  const [extratoItems, setExtratoItems] = useState<ExtratoBancarioItem[]>([
    { id: "ext-1", contaId: "c1", date: "2026-07-28", descricao: "PIX RECEBIDO - NATURA & CO", valor: 51250.00, fitid: "PIX-981273", status: "pendente" },
    { id: "ext-2", contaId: "c1", date: "2026-07-29", descricao: "PGTO DEBITO - MADEIREIRA NATAL", valor: -14500.00, fitid: "DEB-4412", status: "pendente" },
    { id: "ext-3", contaId: "c1", date: "2026-07-30", descricao: "TFB TARFA BANCARIA MENSUAL", valor: -89.90, fitid: "TAR-001", status: "pendente" },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [quickCreateItem, setQuickCreateItem] = useState<ExtratoBancarioItem | null>(null);
  const [quickCategory, setQuickCategory] = useState("Taxas Bancárias");
  const [quickFavorecido, setQuickFavorecido] = useState("");

  if (!isOpen) return null;

  const contas: ContaBancaria[] = [
    { id: "c1", nomeBanco: "Itaú Unibanco (Ag 0392 / C/C 48291-0)", agenciaConta: "0392 / 48291-0", tipo: "corrente", saldoBanco: 145280.50, saldoErp: 145280.50, saldoConciliado: 145280.50, corIdentificadora: "#EC7000" },
    { id: "c2", nomeBanco: "Banco do Brasil (Ag 1840 / C/C 12908-4)", agenciaConta: "1840 / 12908-4", tipo: "corrente", saldoBanco: 89400.00, saldoErp: 89400.00, saldoConciliado: 89400.00, corIdentificadora: "#0038A8" },
    { id: "c3", nomeBanco: "Bradesco PJ (Ag 0112 / C/C 99102-1)", agenciaConta: "0112 / 99102-1", tipo: "corrente", saldoBanco: 32150.20, saldoErp: 32150.20, saldoConciliado: 32150.20, corIdentificadora: "#CC092F" },
  ];

  const currentConta = contas.find(c => c.id === selectedContaId) || contas[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const mockExtrato: ExtratoBancarioItem[] = [
        ...extratoItems,
        { id: `ext-${Date.now()}-1`, contaId: selectedContaId, date: new Date().toISOString().split("T")[0], descricao: "PIX RECEBIDO - EXPO REVESTIR", valor: 35000.00, fitid: `FIT-${Date.now()}-1`, status: "pendente" },
        { id: `ext-${Date.now()}-2`, contaId: selectedContaId, date: new Date().toISOString().split("T")[0], descricao: "POSTO COMBUSTIVEL SHELL", valor: -340.00, fitid: `FIT-${Date.now()}-2`, status: "pendente" }
      ];
      setExtratoItems(mockExtrato);
      setIsUploading(false);
      alert(`Arquivo OFX "${file.name}" importado com sucesso! 2 novos lançamentos encontrados.`);
    }, 800);
  };

  const handleSmartAutoMatch = () => {
    let matchedCount = 0;
    const updatedExtrato = extratoItems.map(ext => {
      if (ext.status === "pendente") {
        const absVal = Math.abs(ext.valor);
        const matchingInvoice = invoices.find(inv => Math.abs(inv.value - absVal) < 0.01);
        if (matchingInvoice) {
          matchedCount++;
          return { ...ext, status: "conciliado" as const, transacaoErpIdVinculada: matchingInvoice.id };
        }
      }
      return ext;
    });

    setExtratoItems(updatedExtrato);
    alert(`Smart Matching concluído! ${matchedCount} lançamentos foram conciliados com o ERP automaticamente.`);
  };

  const handleManualConciliar = (extId: string) => {
    setExtratoItems(extratoItems.map(item => item.id === extId ? { ...item, status: "conciliado" } : item));
  };

  const handleQuickCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCreateItem) return;

    onAddInvoice({
      tipo: quickCreateItem.valor > 0 ? "receita" : "despesa",
      categoria: quickCategory,
      vendor: quickFavorecido || quickCreateItem.descricao,
      value: Math.abs(quickCreateItem.valor),
      invoiceNumber: quickCreateItem.fitid || `AUTO-${Math.floor(Math.random() * 1000)}`,
      formaPagamento: "Pix",
      status: "pago",
      date: quickCreateItem.date,
      description: `Lançamento rápido criado via Conciliação Bancária OFX (${quickCreateItem.descricao})`
    });

    setExtratoItems(extratoItems.map(item => item.id === quickCreateItem.id ? { ...item, status: "conciliado" } : item));
    setQuickCreateItem(null);
    alert("Nova transação cadastrada no ERP e conciliada no extrato!");
  };

  return createPortal(
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "100%",
        maxWidth: "1100px",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #E5E5E5"
      }}>
        
        {/* Header Bar */}
        <div style={{ backgroundColor: "#144580", color: "#ffffff", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ padding: "8px", backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: "8px" }}>
              <Building2 style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "#ffffff" }}>Conciliação Bancária Automática (OFX / CSV)</h2>
              <p style={{ fontSize: "11px", margin: "2px 0 0 0", color: "#BFD7D3" }}>Verificação inteligente de saldos, extratos e lançamentos financeiros do ERP</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}>
            <X style={{ width: "22px", height: "22px" }} />
          </button>
        </div>

        {/* Bank Account Selector & Balances Summary Bar */}
        <div style={{ backgroundColor: "#F8F9FA", padding: "14px 24px", borderBottom: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#404040" }}>Conta Bancária:</span>
            <div style={{ display: "flex", gap: "8px" }}>
              {contas.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedContaId(c.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: selectedContaId === c.id ? `2px solid ${c.corIdentificadora || '#144580'}` : "1px solid #D0D7DE",
                    backgroundColor: selectedContaId === c.id ? "#ffffff" : "transparent",
                    fontWeight: selectedContaId === c.id ? "700" : "500",
                    color: "#404040",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: c.corIdentificadora || '#144580', marginRight: "6px" }} />
                  {c.nomeBanco}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Balances Row */}
          <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #E5E5E5" }}>
              <span style={{ fontSize: "10px", color: "#606060", display: "block" }}>Saldo Extrato</span>
              <strong style={{ color: "#144580" }}>R$ {currentConta.saldoBanco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #E5E5E5" }}>
              <span style={{ fontSize: "10px", color: "#606060", display: "block" }}>Saldo Sistema</span>
              <strong style={{ color: "#404040" }}>R$ {currentConta.saldoErp.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style={{ backgroundColor: "#BFD7D3", padding: "6px 12px", borderRadius: "8px", border: "1px solid #99C2BB" }}>
              <span style={{ fontSize: "10px", color: "#1b3d38", display: "block" }}>Saldo Conciliado</span>
              <strong style={{ color: "#1b3d38" }}>R$ {currentConta.saldoConciliado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

        </div>

        {/* Action Controls Bar */}
        <div style={{ padding: "12px 24px", backgroundColor: "#ffffff", borderBottom: "1px solid #E5E5E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#144580",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer"
          }}>
            <Upload style={{ width: "15px", height: "15px" }} />
            <span>{isUploading ? "Importando..." : "Importar Extrato OFX / CSV"}</span>
            <input type="file" accept=".ofx,.csv" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>

          <button
            onClick={handleSmartAutoMatch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#BFD7D3",
              color: "#1b3d38",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            <RefreshCw style={{ width: "15px", height: "15px" }} />
            <span>Smart Auto-Matching (1-Clique)</span>
          </button>

        </div>

        {/* Split View Content Grid (Left: OFX Bank Extract | Right: ERP Invoices) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "20px", overflowY: "auto", flex: 1, backgroundColor: "#F3E4E8" }}>
          
          {/* Left: Bank Extract Column */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #E5E5E5", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#144580", margin: "0 0 12px 0" }}>1. Extrato Bancário Importado (OFX)</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {extratoItems.map(item => (
                <div key={item.id} style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: item.status === "conciliado" ? "1px solid #BFD7D3" : "1px solid #E5E5E5",
                  backgroundColor: item.status === "conciliado" ? "#F0FDF4" : "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {item.valor > 0 ? <ArrowDownLeft style={{ width: "14px", height: "14px", color: "#065f46" }} /> : <ArrowUpRight style={{ width: "14px", height: "14px", color: "#991b1b" }} />}
                      <strong style={{ fontSize: "12px", color: "#404040" }}>{item.descricao}</strong>
                    </div>
                    <span style={{ fontSize: "10px", color: "#606060", display: "block", marginTop: "2px" }}>{item.date} &bull; {item.fitid || "S/Ref"}</span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: item.valor > 0 ? "#065f46" : "#991b1b" }}>
                      {item.valor > 0 ? "+" : ""} R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    
                    {item.status === "conciliado" ? (
                      <span style={{ display: "block", fontSize: "10px", color: "#065f46", fontWeight: "700", marginTop: "2px" }}>✓ Conciliado</span>
                    ) : (
                      <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                        <button onClick={() => handleManualConciliar(item.id)} style={{ padding: "3px 8px", backgroundColor: "#BFD7D3", color: "#1b3d38", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: "600", cursor: "pointer" }}>Aprovar</button>
                        <button onClick={() => setQuickCreateItem(item)} style={{ padding: "3px 8px", backgroundColor: "#144580", color: "#ffffff", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: "600", cursor: "pointer" }}>+ Lançar</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: ERP Invoices Column */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #E5E5E5", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#404040", margin: "0 0 12px 0" }}>2. Lançamentos Registrados no ERP</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {invoices.map(inv => (
                <div key={inv.id} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E5E5E5", backgroundColor: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "12px", color: "#404040" }}>{inv.vendor}</strong>
                    <span style={{ display: "block", fontSize: "10px", color: "#606060" }}>{inv.categoria} &bull; NF: {inv.invoiceNumber}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: inv.tipo === "receita" ? "#065f46" : "#404040" }}>
                      R$ {inv.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span style={{ display: "block", fontSize: "10px", color: "#606060" }}>{inv.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Create Invoice Modal overlay for unidentified extract items */}
        {quickCreateItem && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100000 }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "20px", width: "100%", maxWidth: "450px", border: "1px solid #E5E5E5" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#144580", fontSize: "14px", fontWeight: "700" }}>Lançar Transação no ERP</h4>
              <p style={{ fontSize: "12px", color: "#606060" }}>Criar lançamento para: <strong>{quickCreateItem.descricao}</strong> (R$ {quickCreateItem.valor.toFixed(2)})</p>

              <form onSubmit={handleQuickCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px", fontSize: "12px" }}>
                <div>
                  <label style={{ fontWeight: "600" }}>Favorecido / Cliente</label>
                  <input type="text" value={quickFavorecido} onChange={(e) => setQuickFavorecido(e.target.value)} placeholder="Ex: Itaú Tarifas / Posto Shell" style={{ width: "100%", padding: "6px 10px", border: "1px solid #D0D7DE", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ fontWeight: "600" }}>Categoria Financeira</label>
                  <input type="text" value={quickCategory} onChange={(e) => setQuickCategory(e.target.value)} style={{ width: "100%", padding: "6px 10px", border: "1px solid #D0D7DE", borderRadius: "6px" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                  <button type="button" onClick={() => setQuickCreateItem(null)} style={{ padding: "6px 12px", backgroundColor: "#E2E8F0", border: "none", borderRadius: "6px" }}>Cancelar</button>
                  <button type="submit" style={{ padding: "6px 14px", backgroundColor: "#144580", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600" }}>Criar &amp; Conciliar</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};
