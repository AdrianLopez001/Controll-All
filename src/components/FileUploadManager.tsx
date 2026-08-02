import React, { useState } from "react";
import { UploadCloud, FileText, Trash2, CheckCircle, AlertCircle, File } from "lucide-react";
import { sanitizeInput } from "../utils/security";

export interface UploadedDocument {
  id: string;
  name: string;
  category: "planta_baixa" | "contratos" | "art" | "credenciais" | "comprovante" | "geral";
  sizeBytes: number;
  uploadedAt: string;
  fileUrl: string;
}

interface FileUploadManagerProps {
  moduleFolder: "eventos" | "os" | "financeiro" | "rh" | "wms" | "orcamentos" | "crm";
  entityId: string;
  documents: UploadedDocument[];
  onUploadSuccess: (newDoc: UploadedDocument) => void;
  onDeleteDocument?: (docId: string) => void;
  readOnly?: boolean;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".docx"];

export default function FileUploadManager({
  moduleFolder,
  entityId,
  documents,
  onUploadSuccess,
  onDeleteDocument,
  readOnly = false
}: FileUploadManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<UploadedDocument["category"]>("planta_baixa");
  const [errorMsg, setErrorMsg] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`O arquivo excede o tamanho máximo de 15 MB (tamanho atual: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
      return;
    }

    // Validate extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMsg(`Formato de arquivo não suportado. Formatos aceitos: ${ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }

    setIsUploading(true);

    // Simulate upload process & generate UUID record
    setTimeout(() => {
      setIsUploading(false);
      const newDoc: UploadedDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: sanitizeInput(file.name),
        category: selectedCategory,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        fileUrl: URL.createObjectURL(file)
      };

      onUploadSuccess(newDoc);
    }, 500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", marginTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
          <FileText size={16} style={{ color: "var(--accent)" }} /> Documentos & Anexos Operacionais
        </h4>
        <span style={{ fontSize: "10px", background: "var(--bg-main)", padding: "2px 8px", borderRadius: "4px", fontWeight: "600", color: "var(--text-muted)" }}>
          Pasta: /uploads/{moduleFolder}/{entityId || "geral"}
        </span>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      {/* Upload Drop/Button Area */}
      {!readOnly && (
        <div style={{ border: "2px dashed var(--border)", borderRadius: "8px", padding: "16px", textAlign: "center", backgroundColor: "var(--bg-main)", marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>Categoria do Documento:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}
            >
              <option value="planta_baixa">📐 Planta Baixa / Projeto</option>
              <option value="art">👷 ART CREA / Laudo Técnico</option>
              <option value="contratos">📄 Contrato Comercial</option>
              <option value="credenciais">🪪 Credencial de Pavilhão</option>
              <option value="comprovante">🧾 Comprovante Financeiro</option>
              <option value="geral">📁 Anexo Geral</option>
            </select>
          </div>

          <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "var(--accent)", color: "#ffffff", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
            <UploadCloud size={16} /> {isUploading ? "Enviando arquivo..." : "Selecionar Arquivo (Máx. 15MB)"}
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png,.docx" 
              onChange={handleFileSelect} 
              disabled={isUploading}
              style={{ display: "none" }} 
            />
          </label>
          <span style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginTop: "6px" }}>
            Formatos suportados: PDF, PNG, JPG, DOCX
          </span>
        </div>
      )}

      {/* Uploaded files list */}
      {documents.length === 0 ? (
        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "10px" }}>
          Nenhum documento anexado ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {documents.map((doc) => (
            <div 
              key={doc.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-main)", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "12px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <File size={16} style={{ color: "var(--accent)" }} />
                <div>
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ fontWeight: "600", color: "var(--accent)", textDecoration: "none" }}
                  >
                    {doc.name}
                  </a>
                  <div style={{ display: "flex", gap: "10px", fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                    <span>Categoria: <strong>{doc.category}</strong></span>
                    <span>Tamanho: {formatFileSize(doc.sizeBytes)}</span>
                    <span>Enviado em: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {!readOnly && onDeleteDocument && (
                <button 
                  onClick={() => onDeleteDocument(doc.id)}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                  title="Excluir documento"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
