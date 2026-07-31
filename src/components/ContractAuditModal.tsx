import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FileCheck, Shield, CheckCircle, Clock, FileText, X } from "lucide-react";

interface ContractAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractData?: {
    id: string;
    nomeEvento: string;
    cliente: string;
    cnpj: string;
    valor: number;
    status: "em_analise" | "pendente_assinatura" | "aprovado";
    versao: number;
  };
  onApproveContract: (contractId: string, auditLog: any) => void;
}

export const ContractAuditModal: React.FC<ContractAuditModalProps> = ({
  isOpen,
  onClose,
  contractData,
  onApproveContract
}) => {
  const [signatario, setSignatario] = useState("Carlos Eduardo Silveira");
  const [cpfSignatario, setCpfSignatario] = useState("123.456.789-00");

  if (!isOpen || !contractData) return null;

  const handleSimulateSign = () => {
    const auditLog = {
      signatario,
      cpf: cpfSignatario,
      dataHora: new Date().toLocaleString("pt-BR"),
      ip: "189.120.45.102",
      navegador: "Chrome / Windows 11 (Token ICP-Brasil Simulado)",
      status: "aprovado" as const
    };

    onApproveContract(contractData.id, auditLog);
    alert(`Contrato aprovado e assinado digitalmente por ${signatario}! Trilha de auditoria gerada com IP: 189.120.45.102`);
    onClose();
  };

  const getTagStatusCfg = (st: string) => {
    switch (st) {
      case "aprovado":
        return { label: "Aprovado", bg: "#BFD7D3", color: "#1b3d38" };
      case "pendente_assinatura":
        return { label: "Pendente de Assinatura", bg: "#FEF3C7", color: "#92400E" };
      default:
        return { label: "Em Análise", bg: "#E0F2FE", color: "#0369A1" };
    }
  };

  const tagCfg = getTagStatusCfg(contractData.status);

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
        maxWidth: "700px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #E5E5E5"
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: "#144580",
          color: "#ffffff",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ padding: "8px", backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: "8px" }}>
              <FileCheck style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "#ffffff" }}>Aceite Digital &amp; Histórico de Auditoria de Contrato</h2>
              <p style={{ fontSize: "11px", margin: "2px 0 0 0", color: "#BFD7D3" }}>Rastreamento inviolável com Tags de Status e Logs IP/Data/Hora</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}>
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", fontSize: "12px" }}>
          
          {/* Contract Overview Box */}
          <div style={{ backgroundColor: "#F8F9FA", padding: "14px 16px", borderRadius: "10px", border: "1px solid #E5E5E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "10px", textTransform: "uppercase", color: "#606060", fontWeight: "600" }}>CONTRATO DA OBRA</span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "15px", color: "#144580", fontWeight: "700" }}>{contractData.nomeEvento}</h3>
              <p style={{ margin: "4px 0 0 0", color: "#404040" }}>{contractData.cliente} &bull; CNPJ: {contractData.cnpj}</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ padding: "4px 10px", borderRadius: "12px", backgroundColor: tagCfg.bg, color: tagCfg.color, fontWeight: "700", fontSize: "11px" }}>
                {tagCfg.label}
              </span>
              <span style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#144580", marginTop: "6px" }}>
                R$ {contractData.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Audit History Log */}
          <div style={{ border: "1px solid #E5E5E5", borderRadius: "10px", padding: "14px", backgroundColor: "#ffffff" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#404040", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock style={{ width: "15px", height: "15px", color: "#144580" }} /> Histórico de Auditoria Digital (Audit Trail)
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ borderLeft: "3px solid #144580", paddingLeft: "10px" }}>
                <span style={{ fontWeight: "700", color: "#144580" }}>1. Envio do Contrato ao Cliente</span>
                <p style={{ margin: "2px 0 0 0", color: "#606060", fontSize: "11px" }}>Enviado em {new Date().toLocaleDateString("pt-BR")} por vendas@jceventos.com.br</p>
              </div>

              {contractData.status === "aprovado" ? (
                <div style={{ borderLeft: "3px solid #1b3d38", paddingLeft: "10px", backgroundColor: "#F0FDF4", padding: "8px 10px", borderRadius: "0 6px 6px 0" }}>
                  <span style={{ fontWeight: "700", color: "#1b3d38", display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle style={{ width: "14px", height: "14px", color: "#1b3d38" }} /> Contrato Assinado &amp; Aprovado no Sistema
                  </span>
                  <p style={{ margin: "2px 0 0 0", color: "#1b3d38", fontSize: "11px" }}>
                    Assinado por: <strong>Carlos Eduardo Silveira</strong> (CPF: 123.456.789-00)<br />
                    Data/Hora: {new Date().toLocaleString("pt-BR")} | IP: <strong>189.120.45.102</strong>
                  </p>
                </div>
              ) : (
                <div style={{ borderLeft: "3px solid #D0D7DE", paddingLeft: "10px" }}>
                  <span style={{ fontWeight: "600", color: "#606060" }}>2. Aguardando Assinatura do Cliente</span>
                  <p style={{ margin: "2px 0 0 0", color: "#606060", fontSize: "11px" }}>Tag atual: {tagCfg.label}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sign Form Simulation (if not approved yet) */}
          {contractData.status !== "aprovado" && (
            <div style={{ backgroundColor: "#F0F3FA", padding: "14px", borderRadius: "10px", border: "1px solid #D0D7DE" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#144580", fontSize: "12px", fontWeight: "700" }}>Simular Assinatura Digital do Cliente</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}>Nome do Signatário</label>
                  <input type="text" value={signatario} onChange={(e) => setSignatario(e.target.value)} style={{ width: "100%", padding: "6px 10px", border: "1px solid #D0D7DE", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}>CPF do Signatário</label>
                  <input type="text" value={cpfSignatario} onChange={(e) => setCpfSignatario(e.target.value)} style={{ width: "100%", padding: "6px 10px", border: "1px solid #D0D7DE", borderRadius: "6px" }} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSimulateSign}
                style={{
                  width: "100%",
                  backgroundColor: "#144580",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <Shield style={{ width: "16px", height: "16px" }} />
                <span>Confirmar Aceite &amp; Registrar Assinatura (Auditoria IP)</span>
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ borderTop: "1px solid #E5E5E5", paddingTop: "12px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", backgroundColor: "#E2E8F0", color: "#404040", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
              Fechar
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};
