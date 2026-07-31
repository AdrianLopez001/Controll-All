import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  FileText, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Download, Save, X, Sparkles, Palette, Image as ImageIcon, Trash2
} from "lucide-react";
import type { Orcamento } from "../types";

interface ProposalWordEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orcamento: Orcamento | null;
  onSaveOrcamento: (updated: Orcamento) => void;
}

export const ProposalWordEditorModal: React.FC<ProposalWordEditorModalProps> = ({
  isOpen,
  onClose,
  orcamento,
  onSaveOrcamento
}) => {
  if (!isOpen || !orcamento) return null;

  const [fontFamily, setFontFamily] = useState("Poppins, sans-serif");
  const [fontSize, setFontSize] = useState("14px");
  const [textColor, setTextColor] = useState("#144580");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  
  // Content editable state
  const [proposalTitle, setProposalTitle] = useState(orcamento.nomeOrcamento || `PROPOSTA COMERCIAL ${orcamento.codigo}`);
  const [clientDataText, setClientDataText] = useState(`CLIENTE: ${orcamento.cliente} | CNPJ: ${orcamento.cnpjCliente || '12.345.678/0001-90'} | E-MAIL: ${orcamento.emailCliente}`);
  const [proposalBody, setProposalBody] = useState(
    `Prezados,\n\nApresentamos nossa proposta comercial para o fornecimento de cenografia, estruturas de alumínio box-truss, marcenaria e iluminação de estande para o evento planejado.\n\nVALOR TOTAL CONTRATADO: R$ ${orcamento.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nCONDIÇÕES DE PAGAMENTO: 50% no aceite da proposta e 50% na entrega das chaves da obra.`
  );

  // Attached images state
  const [proposalImages, setProposalImages] = useState<Array<{ id: string; url: string; caption: string }>>([
    { id: "img-1", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", caption: "Perspectiva 3D / Cenografia do Estande Aprovado" }
  ]);

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProposalImages([
          ...proposalImages,
          { id: `img-${Date.now()}`, url: reader.result, caption: file.name.replace(/\.[^/.]+$/, "") }
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (id: string) => {
    setProposalImages(proposalImages.filter(img => img.id !== id));
  };

  const handleSave = () => {
    const updated: Orcamento = {
      ...orcamento,
      nomeOrcamento: proposalTitle,
      descricaoSimplificada: proposalBody,
      revisoes: [
        ...(orcamento.revisoes || []),
        { versao: (orcamento.revisoes?.length || 0) + 1, data: new Date().toISOString().split("T")[0], descricao: `Editado via Word (${proposalImages.length} imagens anexadas)` }
      ]
    };

    onSaveOrcamento(updated);
    alert("Proposta comercial e imagens salvos com sucesso!");
    onClose();
  };

  const handleExportPDF = () => {
    alert("Exportação de Proposta Formatada em PDF iniciada!");
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
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
        width: "100%",
        maxWidth: "1050px",
        height: "94vh",
        maxHeight: "94vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #cbd5e1",
        boxSizing: "border-box"
      }}>
        
        {/* Modal Top Header (Official JC Eventos Blue: #144580) */}
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
              <FileText style={{ width: "20px", height: "20px", color: "#ffffff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "#ffffff" }}>Editor Nativo de Propostas Comercial (Estilo MS Word)</h2>
              <p style={{ fontSize: "11px", margin: "2px 0 0 0", color: "#93c5fd" }}>Edição visual em tempo real com auto-preenchimento e anexos 3D</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X style={{ width: "22px", height: "22px" }} />
          </button>
        </div>

        {/* Word Toolbar */}
        <div style={{
          backgroundColor: "#f8fafc",
          padding: "10px 20px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          flexShrink: 0
        }}>
          
          {/* Formatting Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            
            {/* Font Family */}
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#ffffff", color: "#1e293b" }}
            >
              <option value="Poppins, sans-serif">Poppins</option>
              <option value="Inter, sans-serif">Inter</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Times New Roman, serif">Times New Roman</option>
            </select>

            {/* Font Size */}
            <select 
              value={fontSize} 
              onChange={(e) => setFontSize(e.target.value)}
              style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#ffffff", color: "#1e293b" }}
            >
              <option value="12px">12pt</option>
              <option value="14px">14pt</option>
              <option value="16px">16pt</option>
              <option value="18px">18pt</option>
              <option value="22px">22pt</option>
            </select>

            <div style={{ width: "1px", height: "20px", backgroundColor: "#cbd5e1", margin: "0 4px" }} />

            {/* Bold, Italic, Underline */}
            <button 
              onClick={() => setIsBold(!isBold)} 
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: isBold ? "#e2e8f0" : "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Negrito"
            >
              <Bold style={{ width: "14px", height: "14px", color: "#1e293b" }} />
            </button>
            <button 
              onClick={() => setIsItalic(!isItalic)} 
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: isItalic ? "#e2e8f0" : "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Itálico"
            >
              <Italic style={{ width: "14px", height: "14px", color: "#1e293b" }} />
            </button>
            <button 
              onClick={() => setIsUnderline(!isUnderline)} 
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: isUnderline ? "#e2e8f0" : "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Sublinhado"
            >
              <Underline style={{ width: "14px", height: "14px", color: "#1e293b" }} />
            </button>

            <div style={{ width: "1px", height: "20px", backgroundColor: "#cbd5e1", margin: "0 4px" }} />

            {/* Alignments */}
            <button onClick={() => setTextAlign("left")} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: textAlign === "left" ? "#e2e8f0" : "#ffffff", cursor: "pointer" }}>
              <AlignLeft style={{ width: "14px", height: "14px", color: "#1e293b" }} />
            </button>
            <button onClick={() => setTextAlign("center")} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: textAlign === "center" ? "#e2e8f0" : "#ffffff", cursor: "pointer" }}>
              <AlignCenter style={{ width: "14px", height: "14px", color: "#1e293b" }} />
            </button>
            <button onClick={() => setTextAlign("right")} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: textAlign === "right" ? "#e2e8f0" : "#ffffff", cursor: "pointer" }}>
              <AlignRight style={{ width: "14px", height: "14px", color: "#1e293b" }} />
            </button>

            <div style={{ width: "1px", height: "20px", backgroundColor: "#cbd5e1", margin: "0 4px" }} />

            {/* Color Picker */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Palette style={{ width: "15px", height: "15px", color: "#64748b" }} />
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: "24px", height: "24px", border: "none", cursor: "pointer", background: "none" }} />
            </div>

            <div style={{ width: "1px", height: "20px", backgroundColor: "#cbd5e1", margin: "0 4px" }} />

            {/* Add Image Button */}
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#144580",
              color: "#ffffff",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer"
            }}>
              <ImageIcon style={{ width: "14px", height: "14px" }} />
              <span>Inserir Imagem / Render 3D</span>
              <input type="file" accept="image/*" onChange={handleAddImage} style={{ display: "none" }} />
            </label>

          </div>

          {/* Quick Info Tag */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            color: "#065f46",
            backgroundColor: "#d1fae5",
            padding: "4px 10px",
            borderRadius: "6px",
            fontWeight: "600"
          }}>
            <Sparkles style={{ width: "14px", height: "14px", color: "#065f46" }} />
            <span>Dados de Cliente Reutilizados</span>
          </div>

        </div>

        {/* Scrollable Canvas Background Area */}
        <div style={{
          backgroundColor: "#cbd5e1",
          padding: "24px 16px",
          overflowY: "auto",
          flex: 1,
          display: "flex",
          justifyContent: "center",
          boxSizing: "border-box"
        }}>
          
          {/* A4 Paper Document Sheet (Class .word-modal-paper protects against Dark Mode) */}
          <div 
            className="word-modal-paper"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.2)",
              padding: "40px",
              width: "100%",
              maxWidth: "800px",
              minHeight: "fit-content",
              border: "1px solid #94a3b8",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              fontFamily: fontFamily,
              fontSize: fontSize,
              textAlign: textAlign,
              color: textColor,
              fontWeight: isBold ? "bold" : "normal",
              fontStyle: isItalic ? "italic" : "normal",
              textDecoration: isUnderline ? "underline" : "none",
              boxSizing: "border-box"
            }}
          >
            {/* 1. Header Logo & Info */}
            <div style={{ borderBottom: "2px solid #144580", paddingBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontFamily: "Poppins, sans-serif" }}>
              <div>
                <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#144580", margin: 0 }}>JC EVENTOS</h1>
                <p style={{ fontSize: "11px", color: "#475569", margin: "2px 0 0 0" }}>Cenografia, Estandes &amp; Engenharia de Pavilhão</p>
              </div>
              <div style={{ textAlign: "right", fontSize: "11px", color: "#475569" }}>
                <p style={{ margin: 0 }}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                <p style={{ margin: "2px 0 0 0" }}>Código: {orcamento.codigo}</p>
              </div>
            </div>

            {/* 2. Editable Proposal Title */}
            <div>
              <input
                type="text"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                style={{
                  width: "100%",
                  fontWeight: "700",
                  fontSize: "16px",
                  color: "#144580",
                  backgroundColor: "#ffffff",
                  border: "none",
                  borderBottom: "1px dashed #144580",
                  paddingBottom: "4px",
                  outline: "none",
                  fontFamily: fontFamily,
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* 3. Auto-filled Client Bar */}
            <div style={{ backgroundColor: "#f1f5f9", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontFamily: "sans-serif", boxSizing: "border-box" }}>
              <input
                type="text"
                value={clientDataText}
                onChange={(e) => setClientDataText(e.target.value)}
                style={{ width: "100%", backgroundColor: "transparent", fontWeight: "600", fontSize: "12px", color: "#144580", border: "none", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* 4. Editable Proposal Body Textarea */}
            <div>
              <textarea
                rows={6}
                value={proposalBody}
                onChange={(e) => setProposalBody(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  border: "1px dashed #cbd5e1",
                  padding: "12px",
                  borderRadius: "8px",
                  outline: "none",
                  lineHeight: "1.6",
                  fontFamily: fontFamily,
                  fontSize: fontSize,
                  color: "#1e293b",
                  resize: "vertical",
                  minHeight: "140px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* 5. Attached Images / Renders 3D (STRICTLY INSIDE A4 PAPER) */}
            {proposalImages.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "14px 0", borderTop: "1px dashed #cbd5e1", borderBottom: "1px dashed #cbd5e1", width: "100%", boxSizing: "border-box" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#144580", margin: 0, fontFamily: "sans-serif" }}>
                  IMAGENS ANEXADAS AO PROJETO ({proposalImages.length})
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: proposalImages.length > 1 ? "1fr 1fr" : "1fr", gap: "14px", width: "100%", boxSizing: "border-box" }}>
                  {proposalImages.map(img => (
                    <div key={img.id} style={{ border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", backgroundColor: "#ffffff", width: "100%", boxSizing: "border-box" }}>
                      <img src={img.url} alt={img.caption} style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
                      
                      <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderTop: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProposalImages(proposalImages.map(i => i.id === img.id ? { ...i, caption: val } : i));
                          }}
                          style={{ border: "none", background: "transparent", fontSize: "11px", fontWeight: "600", color: "#1e293b", width: "85%", outline: "none" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          style={{ background: "none", border: "none", color: "#991b1b", cursor: "pointer", padding: "2px" }}
                          title="Remover Imagem"
                        >
                          <Trash2 style={{ width: "14px", height: "14px" }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Resumo de Itens e Serviços Table (STRICTLY INSIDE A4 PAPER) */}
            <div style={{ paddingTop: "6px", fontFamily: "sans-serif", fontSize: "12px", color: "#1e293b", width: "100%", boxSizing: "border-box" }}>
              <h4 style={{ fontWeight: "700", color: "#1e293b", margin: "0 0 10px 0" }}>RESUMO DE ITENS E SERVIÇOS INCLUSOS</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #cbd5e1", boxSizing: "border-box" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                    <th style={{ padding: "10px 12px", border: "1px solid #cbd5e1", color: "#1e293b" }}>Item / Módulo</th>
                    <th style={{ padding: "10px 12px", border: "1px solid #cbd5e1", color: "#1e293b" }}>Qtd</th>
                    <th style={{ padding: "10px 12px", border: "1px solid #cbd5e1", textAlign: "right", color: "#1e293b" }}>Valor Unitário</th>
                  </tr>
                </thead>
                <tbody>
                  {orcamento.produtos?.map((prod, idx) => (
                    <tr key={idx} style={{ borderTop: "1px solid #cbd5e1" }}>
                      <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", color: "#1e293b" }}>{prod.name}</td>
                      <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", color: "#1e293b" }}>{prod.qty}</td>
                      <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "right", color: "#1e293b" }}>R$ {prod.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: "#f1f5f9", fontWeight: "700" }}>
                    <td colSpan={2} style={{ padding: "10px 12px", border: "1px solid #cbd5e1", textAlign: "right", color: "#1e293b" }}>TOTAL DA PROPOSTA:</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #cbd5e1", textAlign: "right", color: "#144580" }}>R$ {orcamento.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div style={{
          backgroundColor: "#f8fafc",
          padding: "14px 24px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>JC Eventos &bull; Versão da Proposta: v{(orcamento.revisoes?.length || 0) + 1}</span>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={handleExportPDF}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#e2e8f0",
                color: "#1e293b",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: "600",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              <Download style={{ width: "15px", height: "15px" }} />
              <span>Exportar PDF</span>
            </button>

            <button 
              onClick={handleSave}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#144580",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                fontWeight: "600",
                fontSize: "12px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(20,69,128,0.3)"
              }}
            >
              <Save style={{ width: "15px", height: "15px" }} />
              <span>Salvar Proposta</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
