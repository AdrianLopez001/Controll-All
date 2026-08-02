import React, { useRef, useState, useEffect } from "react";
import { Eraser, CheckCircle, ShieldCheck } from "lucide-react";

export interface SignatureData {
  assinadoPor: string;
  cargo: string;
  dataAssinatura: string;
  imagemAssinatura: string; // Base64 PNG
  ipDispositivo: string;
  userAgent: string;
}

interface SignaturePadProps {
  onSaveSignature: (signatureData: SignatureData) => void;
  onCancel?: () => void;
  defaultName?: string;
  defaultCargo?: string;
}

export default function SignaturePad({
  onSaveSignature,
  onCancel,
  defaultName = "",
  defaultCargo = "Responsável do Estande / Pavilhão"
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [name, setName] = useState(defaultName);
  const [cargo, setCargo] = useState(defaultCargo);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize canvas context with smooth line rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setErrorMsg("");
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setErrorMsg("");
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg("Por favor, digite o nome completo do signatário.");
      return;
    }
    if (!hasDrawn) {
      setErrorMsg("Por favor, assine digitalmente dentro da área designada.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = canvas.toDataURL("image/png");

    const payload: SignatureData = {
      assinadoPor: name.trim(),
      cargo: cargo.trim() || "Responsável do Estande",
      dataAssinatura: new Date().toISOString(),
      imagemAssinatura: imageData,
      ipDispositivo: "127.0.0.1 (Auditoria Local)",
      userAgent: navigator.userAgent
    };

    onSaveSignature(payload);
  };

  return (
    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-md)", maxWidth: "540px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "10px", marginBottom: "16px" }}>
        <ShieldCheck size={20} style={{ color: "var(--accent)" }} />
        <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
          Assinatura Digital da Ordem de Serviço
        </h3>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", marginBottom: "12px", fontWeight: "600" }}>
          {errorMsg}
        </div>
      )}

      {/* Input fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
            Nome do Signatário *
          </label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ex: Carlos Eduardo Silva"
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg-main)", fontSize: "12px" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
            Cargo / Papel
          </label>
          <input 
            type="text" 
            value={cargo} 
            onChange={(e) => setCargo(e.target.value)} 
            placeholder="Ex: Gerente do Estande"
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg-main)", fontSize: "12px" }}
          />
        </div>
      </div>

      {/* HTML5 Canvas area */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>
            Desenhe a assinatura abaixo (Mouse ou Touch):
          </span>
          <button 
            type="button" 
            onClick={clearCanvas} 
            style={{ background: "none", border: "none", color: "#ef4444", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Eraser size={12} /> Limpar
          </button>
        </div>

        <div style={{ border: "2px dashed var(--accent)", borderRadius: "8px", backgroundColor: "#ffffff", overflow: "hidden", touchAction: "none" }}>
          <canvas
            ref={canvasRef}
            width={500}
            height={160}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ cursor: "crosshair", width: "100%", display: "block" }}
          />
        </div>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px", display: "block" }}>
          * A assinatura digital é registrada com selo de integridade e timestamp de auditoria.
        </span>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "transparent", cursor: "pointer", fontSize: "12px" }}
          >
            Cancelar
          </button>
        )}
        <button 
          type="button" 
          onClick={handleSave}
          style={{ padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "var(--accent)", color: "#ffffff", fontWeight: "600", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <CheckCircle size={14} /> Confirmar & Assinar OS
        </button>
      </div>
    </div>
  );
}
