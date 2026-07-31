import React, { useState } from "react";
import { createPortal } from "react-dom";
import { UserCheck, Shield, Printer, CheckCircle, Copy, X } from "lucide-react";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (clientData: any) => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onClientAdded
}) => {
  const [empresa, setEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contato, setContato] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [origem, setOrigem] = useState("Formulário Seguro Web");
  const [linkCopiado, setLinkCopiado] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !email) return;

    const newLead = {
      id: `lead-form-${Date.now()}`,
      empresa,
      contato,
      cargo: "Responsável Financeiro/Comercial",
      email,
      telefone,
      valorEstimado: 85000.00,
      origem,
      estagio: "briefing" as const,
      dataCriacao: new Date().toISOString().split("T")[0],
      observacoes: `Dados sensíveis (CNPJ: ${cnpj}) cadastrados diretamente via Formulário Seguro pelo próprio cliente.`
    };

    onClientAdded(newLead);
    alert(`Cliente "${empresa}" cadastrado com sucesso e dados salvos no sistema!`);
    onClose();
  };

  const handleCopySecureLink = () => {
    const fakeLink = `https://controllall.jceventos.com.br/cadastro-cliente/sec_${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(fakeLink);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 3000);
  };

  const handlePrintForm = () => {
    window.print();
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
        maxWidth: "650px",
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
              <Shield style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "#ffffff" }}>Cadastro de Cliente &amp; Dados Sensíveis</h2>
              <p style={{ fontSize: "11px", margin: "2px 0 0 0", color: "#BFD7D3" }}>Preenchimento por Formulário Seguro ou Impresso PDF (Sem exposição no chat)</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}>
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px" }}>

          {/* Secure Link Banner */}
          <div style={{ backgroundColor: "#F0F3FA", border: "1px solid #D0D7DE", padding: "14px 16px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, color: "#144580", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <UserCheck style={{ width: "16px", height: "16px" }} /> Link Seguro de Preenchimento Externo
              </h4>
              <p style={{ margin: "4px 0 0 0", color: "#606060", fontSize: "11px" }}>Envie este link direto para o cliente preencher seus dados de forma confidencial.</p>
            </div>
            <button
              type="button"
              onClick={handleCopySecureLink}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#144580",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontWeight: "600",
                fontSize: "11px",
                cursor: "pointer"
              }}
            >
              {linkCopiado ? <CheckCircle style={{ width: "14px", height: "14px", color: "#BFD7D3" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
              <span>{linkCopiado ? "Link Copiado!" : "Copiar Link"}</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontWeight: "600", color: "#404040", display: "block", marginBottom: "4px" }}>Razão Social / Nome da Empresa *</label>
              <input
                type="text"
                required
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ex: Natura &amp; Co S/A"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #D0D7DE", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "600", color: "#404040", display: "block", marginBottom: "4px" }}>CNPJ / CPF *</label>
              <input
                type="text"
                required
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #D0D7DE", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "600", color: "#404040", display: "block", marginBottom: "4px" }}>Nome do Contato Principal</label>
              <input
                type="text"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silveira"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #D0D7DE", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "600", color: "#404040", display: "block", marginBottom: "4px" }}>E-mail Corporativo *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="financeiro@empresa.com.br"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #D0D7DE", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "600", color: "#404040", display: "block", marginBottom: "4px" }}>Telefone / WhatsApp</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 98888-7777"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #D0D7DE", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "600", color: "#404040", display: "block", marginBottom: "4px" }}>Origem do Cadastro</label>
              <select
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #D0D7DE", borderRadius: "8px", height: "36px", boxSizing: "border-box" }}
              >
                <option value="Formulário Seguro Web">Formulário Seguro Web</option>
                <option value="Ficha Impressa Presencial">Ficha Impressa Presencial</option>
                <option value="Indicação Comercial">Indicação Comercial</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ borderTop: "1px solid #E5E5E5", paddingTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              type="button"
              onClick={handlePrintForm}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#E2E8F0",
                color: "#404040",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontWeight: "600",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              <Printer style={{ width: "14px", height: "14px" }} />
              <span>Imprimir Ficha PDF</span>
            </button>

            <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: "8px 16px", backgroundColor: "#E2E8F0", color: "#404040", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ padding: "8px 18px", backgroundColor: "#144580", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
              >
                Salvar Cliente no ERP
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
};
