import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  FileCheck, ShieldCheck, CheckCircle2, Copy, Send, ExternalLink, X, 
  Sparkles, Download, Check
} from "lucide-react";
import type { Orcamento } from "../types";

interface ClientProposalPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  orcamento: Orcamento | null;
  onApproveProposal: (orcamentoId: string, auditLog: any) => void;
}

export const ClientProposalPortalModal: React.FC<ClientProposalPortalModalProps> = ({
  isOpen,
  onClose,
  orcamento,
  onApproveProposal
}) => {
  if (!isOpen || !orcamento) return null;

  const [activeMode, setActiveMode] = useState<"link_generator" | "client_preview">("link_generator");
  const [copiedLink, setCopiedLink] = useState(false);
  const [clientSignName, setClientSignName] = useState(orcamento.cliente);
  const [clientSignCpf, setClientSignCpf] = useState(orcamento.cnpjCliente || "12.890.312/0002-45");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signatureType, setSignatureType] = useState<"typed" | "drawn">("typed");
  const [isApprovedSuccess, setIsApprovedSuccess] = useState(false);
  const [selectedOptionalServices, setSelectedOptionalServices] = useState<{ [key: string]: boolean }>({});

  const publicUrl = `https://controllall.jceventos.com.br/proposta/${orcamento.codigo.toLowerCase()}?token=sec_${Math.random().toString(36).substring(7)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(`Olá! Segue o link para visualização e aprovação online da Proposta Comercial ${orcamento.codigo} da JC Eventos:\n\n${publicUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("Por favor, marque o aceite dos termos e condições para prosseguir.");
      return;
    }

    const auditLog = {
      signatario: clientSignName,
      cpfCnpj: clientSignCpf,
      dataHora: new Date().toLocaleString("pt-BR"),
      ip: "189.120.45.102",
      dispositivo: "Navegador Web / Mobile iOS (Token ICP Simulado)",
      status: "aprovado" as const
    };

    onApproveProposal(orcamento.id, auditLog);
    setIsApprovedSuccess(true);
  };

  return createPortal(
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      backdropFilter: "blur(4px)",
      boxSizing: "border-box"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
        width: "100%",
        maxWidth: "980px",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #cbd5e1",
        boxSizing: "border-box"
      }}>
        
        {/* Top Header Bar */}
        <div style={{
          backgroundColor: "#144580",
          color: "#ffffff",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ padding: "8px", backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileCheck style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "#ffffff" }}>Portal de Aprovação Online de Propostas (Link Público)</h2>
              <p style={{ fontSize: "11px", margin: "2px 0 0 0", color: "#93c5fd" }}>Visualização, validação de itens e assinatura digital em tempo real</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", backgroundColor: "rgba(255, 255, 255, 0.15)", padding: "3px", borderRadius: "8px" }}>
              <button
                onClick={() => setActiveMode("link_generator")}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: activeMode === "link_generator" ? "#ffffff" : "transparent",
                  color: activeMode === "link_generator" ? "#144580" : "#ffffff",
                  fontWeight: "700",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                Gerar Link
              </button>
              <button
                onClick={() => setActiveMode("client_preview")}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: activeMode === "client_preview" ? "#ffffff" : "transparent",
                  color: activeMode === "client_preview" ? "#144580" : "#ffffff",
                  fontWeight: "700",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                🌐 Visão do Cliente
              </button>
            </div>

            <button onClick={onClose} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}>
              <X style={{ width: "22px", height: "22px" }} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div style={{ overflowY: "auto", flex: 1, backgroundColor: "#f8fafc", boxSizing: "border-box" }}>
          
          {activeMode === "link_generator" ? (
            /* Mode 1: Link Generator & Sharing Dashboard */
            <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "750px", margin: "0 auto", boxSizing: "border-box" }}>
              
              {/* Proposal Banner */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>PROPOSTA SELECIONADA</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#144580", margin: "4px 0" }}>{orcamento.nomeOrcamento || orcamento.codigo}</h3>
                <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                  Cliente: <strong>{orcamento.cliente}</strong> &bull; Total: <strong style={{ color: "#065f46" }}>R$ {orcamento.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                </p>
              </div>

              {/* Public Link Generator Card */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", display: "block", marginBottom: "6px" }}>
                    🔗 Link Único de Validação &amp; Aceite Online
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      style={{ flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "#f1f5f9", color: "#144580", fontWeight: "600", fontSize: "12px", outline: "none" }}
                    />
                    <button
                      onClick={handleCopyLink}
                      style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#144580", color: "#ffffff", border: "none", borderRadius: "8px", padding: "10px 16px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}
                    >
                      {copiedLink ? <Check style={{ width: "16px", height: "16px" }} /> : <Copy style={{ width: "16px", height: "16px" }} />}
                      <span>{copiedLink ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Share Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
                  <button
                    onClick={handleSendWhatsApp}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#16a34a", color: "#ffffff", border: "none", borderRadius: "8px", padding: "12px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                  >
                    <Send style={{ width: "16px", height: "16px" }} />
                    <span>Enviar por WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setActiveMode("client_preview")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#e2e8f0", color: "#1e293b", border: "none", borderRadius: "8px", padding: "12px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                  >
                    <ExternalLink style={{ width: "16px", height: "16px" }} />
                    <span>Testar Tela do Cliente</span>
                  </button>
                </div>
              </div>

              {/* Status Info Box */}
              <div style={{ backgroundColor: "#d1fae5", border: "1px solid #99C2BB", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <ShieldCheck style={{ width: "24px", height: "24px", color: "#065f46", flexShrink: 0 }} />
                <div style={{ fontSize: "12px", color: "#065f46" }}>
                  <strong>Retorno Automático em Tempo Real:</strong> Assim que o cliente clicar em aprovar e digitar/desenhar a assinatura no link, a proposta mudará automaticamente para <span style={{ fontWeight: "700" }}>[Aprovado / Ganho]</span> no seu ERP!
                </div>
              </div>

            </div>
          ) : (
            /* Mode 2: Full Client Landing Page Simulation */
            <div style={{ padding: "32px 20px", display: "flex", justifyContent: "center", boxSizing: "border-box" }}>
              <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #cbd5e1", width: "100%", maxWidth: "800px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", padding: "36px", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>
                
                {/* Client Header */}
                <div style={{ borderBottom: "2px solid #144580", paddingBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#144580", margin: 0 }}>JC EVENTOS</h1>
                    <p style={{ fontSize: "12px", color: "#475569", margin: "2px 0 0 0" }}>Engenharia de Pavilhão, Cenografia &amp; Estruturas</p>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "12px", color: "#475569" }}>
                    <p style={{ margin: 0, fontWeight: "600" }}>PROPOSTA COMERCIAL</p>
                    <p style={{ margin: "2px 0 0 0", color: "#144580", fontWeight: "700" }}>{orcamento.codigo}</p>
                  </div>
                </div>

                {/* Client Info Bar */}
                <div style={{ backgroundColor: "#f1f5f9", padding: "14px 18px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <span style={{ fontSize: "10px", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>CONTRATANTE DESTINATÁRIO</span>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#144580", margin: "2px 0 0 0" }}>{orcamento.cliente}</h3>
                  <p style={{ fontSize: "12px", color: "#475569", margin: "2px 0 0 0" }}>CNPJ/CPF: {orcamento.cnpjCliente || "12.890.312/0002-45"} &bull; E-mail: {orcamento.emailCliente}</p>
                </div>

                {/* Scope Description */}
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>DESCRIÇÃO DO ESCOPO CONTRATADO</h4>
                  <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-line", margin: 0 }}>
                    {orcamento.descricaoSimplificada || "Fornecimento de cenografia completa para estande, incluindo marcenaria sob medida, painéis de MDF, iluminação em spots led e montagem/desmontagem técnica em pavilhão."}
                  </p>
                </div>

                {/* Simulação Interativa da Proposta (Opcionais e Personalizações) */}
                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "16px" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#144580", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles style={{ width: "16px", height: "16px", color: "#144580" }} /> Simulação Interativa de Itens Opcionais &amp; Adicionais
                  </h4>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 12px 0" }}>
                    Personalize sua proposta marcando os opcionais desejados antes do aceite final:
                  </p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { id: "iluminacao_extra", name: "💡 Kit Spots Led HQ Adicional (4 unidades)", price: 650 },
                      { id: "tv_led_55", name: "📺 Suporte + TV LED 55\" 4K para Vídeo Institucional", price: 1200 },
                      { id: "limpeza_diaria", name: "🧹 Serviço de Limpeza Fina Diária Pré-Feira", price: 800 }
                    ].map(opt => {
                      const isChecked = selectedOptionalServices[opt.id] ?? false;
                      return (
                        <label key={opt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: isChecked ? "#eff6ff" : "#ffffff", border: isChecked ? "1px solid #3b82f6" : "1px solid #e2e8f0", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={e => setSelectedOptionalServices(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                              style={{ cursor: "pointer" }}
                            />
                            <span style={{ fontWeight: isChecked ? "700" : "500", color: "#1e293b" }}>{opt.name}</span>
                          </div>
                          <span style={{ fontWeight: "700", color: "#059669" }}>+ R$ {opt.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Items & Values Table */}
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: "0 0 10px 0" }}>RESUMO FINANCEIRO</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                        <th style={{ padding: "10px 14px", border: "1px solid #cbd5e1" }}>Item / Serviço</th>
                        <th style={{ padding: "10px 14px", border: "1px solid #cbd5e1", textAlign: "right" }}>Valor R$</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orcamento.produtos?.map((p, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #cbd5e1" }}>
                          <td style={{ padding: "10px 14px", border: "1px solid #cbd5e1" }}>{p.name} ({p.qty}x)</td>
                          <td style={{ padding: "10px 14px", border: "1px solid #cbd5e1", textAlign: "right" }}>R$ {(p.precoVenda * p.qty).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      {Object.entries(selectedOptionalServices).map(([key, val]) => {
                        if (!val) return null;
                        const itemMap: Record<string, { name: string; price: number }> = {
                          iluminacao_extra: { name: "Kit Spots Led HQ Adicional", price: 650 },
                          tv_led_55: { name: "Suporte + TV LED 55\" 4K", price: 1200 },
                          limpeza_diaria: { name: "Serviço de Limpeza Fina Diária", price: 800 }
                        };
                        const optItem = itemMap[key];
                        if (!optItem) return null;
                        return (
                          <tr key={key} style={{ backgroundColor: "#eff6ff", borderTop: "1px solid #cbd5e1" }}>
                            <td style={{ padding: "10px 14px", border: "1px solid #cbd5e1", fontWeight: "600", color: "#1d4ed8" }}>[Opcional Selecionado] {optItem.name}</td>
                            <td style={{ padding: "10px 14px", border: "1px solid #cbd5e1", textAlign: "right", fontWeight: "700", color: "#1d4ed8" }}>R$ {optItem.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ backgroundColor: "#f1f5f9", fontWeight: "800" }}>
                        <td style={{ padding: "12px 14px", border: "1px solid #cbd5e1", textAlign: "right" }}>TOTAL DA PROPOSTA SIMULADA:</td>
                        <td style={{ padding: "12px 14px", border: "1px solid #cbd5e1", textAlign: "right", color: "#144580", fontSize: "16px" }}>
                          R$ {(orcamento.total + (selectedOptionalServices.iluminacao_extra ? 650 : 0) + (selectedOptionalServices.tv_led_55 ? 1200 : 0) + (selectedOptionalServices.limpeza_diaria ? 800 : 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Approval & Signature Section */}
                {!isApprovedSuccess ? (
                  <form onSubmit={handleConfirmApproval} style={{ borderTop: "2px solid #144580", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#144580", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <ShieldCheck style={{ width: "20px", height: "20px", color: "#144580" }} /> Formas de Validação &amp; Assinatura Digital
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: "700", display: "block", marginBottom: "4px", color: "#334155" }}>Nome Completo do Signatário *</label>
                        <input type="text" required value={clientSignName} onChange={(e) => setClientSignName(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "12px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: "700", display: "block", marginBottom: "4px", color: "#334155" }}>CPF / CNPJ do Signatário *</label>
                        <input type="text" required value={clientSignCpf} onChange={(e) => setClientSignCpf(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "12px" }} />
                      </div>
                    </div>

                    {/* Signature Box */}
                    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569" }}>ASSINATURA DIGITAL NA TELA</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button type="button" onClick={() => setSignatureType("typed")} style={{ padding: "2px 8px", fontSize: "10px", borderRadius: "4px", border: "none", backgroundColor: signatureType === "typed" ? "#144580" : "#e2e8f0", color: signatureType === "typed" ? "#ffffff" : "#475569", cursor: "pointer" }}>Digitei</button>
                          <button type="button" onClick={() => setSignatureType("drawn")} style={{ padding: "2px 8px", fontSize: "10px", borderRadius: "4px", border: "none", backgroundColor: signatureType === "drawn" ? "#144580" : "#e2e8f0", color: signatureType === "drawn" ? "#ffffff" : "#475569", cursor: "pointer" }}>Desenhar</button>
                        </div>
                      </div>

                      <div style={{ height: "70px", backgroundColor: "#ffffff", border: "1px dashed #94a3b8", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "cursive", fontSize: "20px", color: "#144580", fontStyle: "italic" }}>
                        {signatureType === "typed" ? clientSignName : "✒️ Assinatura Digital Validada"}
                      </div>
                    </div>

                    {/* Checkbox Acceptance */}
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "12px", color: "#334155" }}>
                      <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                      <span>Li e concordo com o valor total, itens e condições de pagamento da Proposta Comercial {orcamento.codigo}.</span>
                    </label>

                    {/* Approval Submit Button */}
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        padding: "16px",
                        fontSize: "14px",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
                      }}
                    >
                      <CheckCircle2 style={{ width: "20px", height: "20px" }} />
                      <span>APROVAR E ASSINAR PROPOSTA COMERCIAL</span>
                    </button>
                  </form>
                ) : (
                  /* Success Confirmation Screen */
                  <div style={{ backgroundColor: "#f0fdf4", border: "2px solid #16a34a", borderRadius: "12px", padding: "28px", textWrap: "pretty", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <CheckCircle2 style={{ width: "48px", height: "48px", color: "#16a34a" }} />
                    <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#16a34a", margin: 0 }}>Proposta Comercial Aprovada com Sucesso!</h2>
                    <p style={{ fontSize: "13px", color: "#15803d", margin: 0 }}>
                      Obrigado! A proposta <strong>{orcamento.codigo}</strong> foi assinada digitalmente por <strong>{clientSignName}</strong> e já foi atualizada para <strong>[Aprovado / Ganho]</strong> no sistema da JC Eventos.
                    </p>
                    <span style={{ fontSize: "11px", color: "#475569", backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                      Trilha de Auditoria Gravada: IP 189.120.45.102 &bull; Data/Hora: {new Date().toLocaleString("pt-BR")}
                    </span>

                    <button
                      onClick={onClose}
                      style={{ backgroundColor: "#144580", color: "#ffffff", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: "700", fontSize: "12px", cursor: "pointer", marginTop: "10px" }}
                    >
                      Concluir e Voltar ao ERP
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
};
