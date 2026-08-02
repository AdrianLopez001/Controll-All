import { useState } from "react";
import { KeyRound, ShieldAlert, CheckCircle, Mail, Smartphone } from "lucide-react";

interface TwoFactorModalProps {
  isOpen: boolean;
  onVerifySuccess: () => void;
  onClose: () => void;
  userEmail?: string;
}

export default function TwoFactorModal({
  isOpen,
  onVerifySuccess,
  onClose,
  userEmail = "usuario@jceventos.com.br"
}: TwoFactorModalProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [method, setMethod] = useState<"totp" | "email">("totp");
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setErrorMsg("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`totp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`totp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setErrorMsg("Digite o código de 6 dígitos completo.");
      return;
    }

    setIsVerifying(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      // Demo acceptance: accept any 6-digit code or "123456"
      onVerifySuccess();
      setCode(["", "", "", "", "", ""]);
    }, 600);
  };

  const handleResendEmail = () => {
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 4000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30000, backdropFilter: "blur(4px)" }}>
      <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "420px", boxShadow: "var(--shadow-lg)", textAlign: "center" }}>
        
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(234, 179, 8, 0.15)", color: "#eab308", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <KeyRound size={24} />
        </div>

        <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 6px", color: "var(--text-primary)" }}>
          Autenticação de 2 Fatores (2FA)
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 16px" }}>
          {method === "totp" 
            ? "Abra o Google Authenticator e digite o código de 6 dígitos:" 
            : `Um código de confirmação foi enviado para ${userEmail}:`}
        </p>

        {errorMsg && (
          <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "8px", borderRadius: "6px", fontSize: "12px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <ShieldAlert size={14} /> {errorMsg}
          </div>
        )}

        {resendSuccess && (
          <div style={{ backgroundColor: "#ecfdf5", color: "#047857", padding: "8px", borderRadius: "6px", fontSize: "12px", marginBottom: "12px" }}>
            Novo código enviado via Hostinger SMTP!
          </div>
        )}

        {/* 6-Digit Code Inputs */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`totp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              style={{
                width: "42px",
                height: "48px",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "700",
                borderRadius: "8px",
                border: digit ? "2px solid var(--accent)" : "1px solid var(--border)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)"
              }}
            />
          ))}
        </div>

        {/* Toggle method */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "20px", fontSize: "11px" }}>
          <button 
            type="button" 
            onClick={() => setMethod("totp")}
            style={{ background: "none", border: "none", color: method === "totp" ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", fontWeight: method === "totp" ? "700" : "400", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Smartphone size={12} /> Google Authenticator
          </button>
          <span>|</span>
          <button 
            type="button" 
            onClick={() => { setMethod("email"); handleResendEmail(); }}
            style={{ background: "none", border: "none", color: method === "email" ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", fontWeight: method === "email" ? "700" : "400", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Mail size={12} /> Enviar via E-mail
          </button>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "transparent", cursor: "pointer", fontSize: "13px" }}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleVerify}
            disabled={isVerifying}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "var(--accent)", color: "#ffffff", fontWeight: "700", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <CheckCircle size={14} /> {isVerifying ? "Verificando..." : "Confirmar 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}
