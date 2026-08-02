import React, { useState, useEffect } from "react";
import { 
  Building2, User, Mail, Phone, DollarSign, Search, Plus, 
  X, FileText, Upload, Trash2, Edit, Award
} from "lucide-react";
import type { LeadCRM, CRMProjetoDetalhado, ClienteDocumento, ClienteDocumentoVersao } from "../types";

interface CRMProps {
  leads: LeadCRM[];
  clientes: { name: string; email: string; cnpj: string; anexos?: { id: string; name: string; date: string }[]; projetoDetalhado?: CRMProjetoDetalhado }[];
  fornecedores: { name: string; email: string; servico: string }[];
  onAddLead: (lead: Omit<LeadCRM, "id" | "dataCriacao">) => void;
  onUpdateLeadEstagio: (id: string, novoEstagio: LeadCRM["estagio"]) => void;
  onUpdateLead: (updated: LeadCRM) => void;
  
  // JC Eventos 2.1 clients/suppliers callbacks
  onUpdateClient: (index: number, updatedClient: any) => void;
  onUpdateSupplier: (index: number, updatedSupplier: any) => void;
  onAddClient: (client: { name: string; email: string; cnpj: string }) => void;
  onAddSupplier: (supplier: { name: string; email: string; servico: string }) => void;
  initialSubTab?: "pipeline" | "clientes" | "fornecedores";
}

export default function CRM({ 
  leads, clientes, fornecedores, onAddLead, onUpdateLeadEstagio, onUpdateLead,
  onUpdateClient, onUpdateSupplier, onAddClient, onAddSupplier, initialSubTab
}: CRMProps) {
  const [activeSubTab, setActiveSubTab] = useState<"pipeline" | "clientes" | "fornecedores">(initialSubTab || "pipeline");

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);
  const [activeMobileStage, setActiveMobileStage] = useState<"briefing" | "orcamento" | "aprovado" | "perdido">("briefing");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientIndex, setSelectedClientIndex] = useState<number | null>(null);
  const [selectedSupplierIndex, setSelectedSupplierIndex] = useState<number | null>(null);
  const [expandedLeadIds, setExpandedLeadIds] = useState<{ [leadId: string]: boolean }>({});

  const toggleLeadExpand = (leadId: string) => {
    setExpandedLeadIds(prev => ({
      ...prev,
      [leadId]: !prev[leadId]
    }));
  };

  // Lead modal state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const selectedLead = leads.find(l => l.id === selectedLeadId);

  // 3.1 Client Documents Tabs & Fields
  const [activeLeadTab, setActiveLeadTab] = useState<"historico" | "documentos" | "fornecedores" | "parceiros">("historico");
  const [docCategory, setDocCategory] = useState<"contrato" | "proposta" | "planta" | "documento_cliente" | "outro">("contrato");
  const [docName, setDocName] = useState("");
  const [docFileSelected, setDocFileSelected] = useState<string>("");
  const [docNotes, setDocNotes] = useState("");
  const [selectedDocIdForVersion, setSelectedDocIdForVersion] = useState<string | null>(null);

  // New interaction form state
  const [newLogTipo, setNewLogTipo] = useState<"ligacao" | "reuniao" | "visita">("ligacao");
  const [newLogDesc, setNewLogDesc] = useState("");
  const [newLogDate, setNewLogDate] = useState("");

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  // Lead follow-up local fields
  const [leadFollowUp, setLeadFollowUp] = useState("");
  const [leadNextInt, setLeadNextInt] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  const handleOpenLead = (lead: LeadCRM) => {
    setSelectedLeadId(lead.id);
    setLeadFollowUp(lead.followUpDate || "");
    setLeadNextInt(lead.proximaInteracao || "");
    setLeadNotes(lead.observacoes || "");
    setNewLogDate(new Date().toISOString().split("T")[0]);
    setNewTaskDue(new Date().toISOString().split("T")[0]);
    setActiveLeadTab("historico"); // Reset tab
    setSelectedDocIdForVersion(null);
  };

  const handleSaveLeadFields = () => {
    if (!selectedLead) return;
    const updated: LeadCRM = {
      ...selectedLead,
      followUpDate: leadFollowUp,
      proximaInteracao: leadNextInt,
      observacoes: leadNotes
    };
    onUpdateLead(updated);
    alert("Informações do Lead salvas com sucesso!");
  };

  // Mock default documents for seed
  const getDefaultDocs = (leadId: string): ClienteDocumento[] => {
    return [
      {
        id: `doc-${leadId}-1`,
        categoria: "contrato",
        nome: "Contrato de Prestação de Serviços - Estande Cenográfico Natura",
        versoes: [
          { versao: 1, dataEnvio: "2026-07-10", responsavelEnvio: "JCEventos (ADMIN)", nomeArquivo: "contrato_natura_v1.pdf", observacoes: "Primeira versão para avaliação do cliente.", urlSimulada: "#" }
        ]
      },
      {
        id: `doc-${leadId}-2`,
        categoria: "planta",
        nome: "Planta de Arquitetura 3D - Pavilhão Anhembi Stand Natura 12x10",
        versoes: [
          { versao: 1, dataEnvio: "2026-07-11", responsavelEnvio: "Jéssica Cenografia", nomeArquivo: "planta_natura_v1.dwg", observacoes: "Esboço inicial aprovado.", urlSimulada: "#" },
          { versao: 2, dataEnvio: "2026-07-12", responsavelEnvio: "JCEventos (ADMIN)", nomeArquivo: "planta_natura_final.pdf", observacoes: "Ajuste na parede traseira conforme organizador.", urlSimulada: "#" }
        ]
      }
    ];
  };

  const handleAddClientDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !docName) return;

    const newDoc: ClienteDocumento = {
      id: `doc-${Date.now()}`,
      categoria: docCategory,
      nome: docName,
      versoes: [
        {
          versao: 1,
          dataEnvio: new Date().toISOString().split("T")[0],
          responsavelEnvio: "JCEventos (ADMIN)",
          nomeArquivo: docFileSelected || "documento_anexo.pdf",
          observacoes: docNotes || "Carregado via CRM",
          urlSimulada: "#"
        }
      ]
    };

    const currentDocs = selectedLead.documentosCliente || getDefaultDocs(selectedLead.id);
    const updatedDocs = [...currentDocs, newDoc];

    onUpdateLead({
      ...selectedLead,
      documentosCliente: updatedDocs
    });

    setDocName("");
    setDocFileSelected("");
    setDocNotes("");
    alert("Documento anexado com sucesso!");
  };

  const handleAddDocumentVersion = (docId: string) => {
    if (!selectedLead) return;
    const currentDocs = selectedLead.documentosCliente || getDefaultDocs(selectedLead.id);
    const docIndex = currentDocs.findIndex(d => d.id === docId);
    if (docIndex === -1) return;

    const doc = currentDocs[docIndex];
    const newVersaoNum = doc.versoes.length + 1;
    const newVersao: ClienteDocumentoVersao = {
      versao: newVersaoNum,
      dataEnvio: new Date().toISOString().split("T")[0],
      responsavelEnvio: "JCEventos (ADMIN)",
      nomeArquivo: docFileSelected || `documento_v${newVersaoNum}.pdf`,
      observacoes: docNotes || `Nova versão/revisão ${newVersaoNum}`,
      urlSimulada: "#"
    };

    const updatedDoc = {
      ...doc,
      versoes: [...doc.versoes, newVersao]
    };

    const updatedDocs = [...currentDocs];
    updatedDocs[docIndex] = updatedDoc;

    onUpdateLead({
      ...selectedLead,
      documentosCliente: updatedDocs
    });

    setDocFileSelected("");
    setDocNotes("");
    setSelectedDocIdForVersion(null);
    alert(`Nova versão ${newVersaoNum} adicionada ao documento!`);
  };

  const handleAddContactLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newLogDesc) return;
    
    const newLog = {
      id: `log-${Date.now()}`,
      tipo: newLogTipo,
      date: newLogDate || new Date().toISOString().split("T")[0],
      descricao: newLogDesc
    };

    const updated: LeadCRM = {
      ...selectedLead,
      historicoContatos: [...(selectedLead.historicoContatos || []), newLog]
    };
    onUpdateLead(updated);
    setNewLogDesc("");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newTaskTitle) return;

    const newTask = {
      id: `tsk-${Date.now()}`,
      titulo: newTaskTitle,
      vencimento: newTaskDue || new Date().toISOString().split("T")[0],
      concluida: false
    };

    const updated: LeadCRM = {
      ...selectedLead,
      tarefas: [...(selectedLead.tarefas || []), newTask]
    };
    onUpdateLead(updated);
    setNewTaskTitle("");
  };

  const handleToggleTask = (taskId: string) => {
    if (!selectedLead) return;
    const updatedTasks = (selectedLead.tarefas || []).map(t => 
      t.id === taskId ? { ...t, concluida: !t.concluida } : t
    );
    onUpdateLead({
      ...selectedLead,
      tarefas: updatedTasks
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedLead) return;
    onUpdateLead({
      ...selectedLead,
      tarefas: (selectedLead.tarefas || []).filter(t => t.id !== taskId)
    });
  };

  // New Client / Supplier quick form triggers
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  
  // Quick Client form state
  const [newCliName, setNewCliName] = useState("");
  const [newCliEmail, setNewCliEmail] = useState("");
  const [newCliCnpj, setNewCliCnpj] = useState("");

  // Quick Supplier form state
  const [newSupName, setNewSupName] = useState("");
  const [newSupEmail, setNewSupEmail] = useState("");
  const [newSupServ, setNewSupServ] = useState("");

  // Form states (Lead creation)
  const [empresa, setEmpresa] = useState("");
  const [contato, setContato] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [valorEstimado, setValorEstimado] = useState(0);
  const [origem, setOrigem] = useState("Instagram");
  const [estagio, setEstagio] = useState<LeadCRM["estagio"]>("briefing");
  const [observacoes, setObservacoes] = useState("");

  // Selected client detailed editing states
  const [cliEmail, setCliEmail] = useState("");
  const [cliCnpj, setCliCnpj] = useState("");
  const [projCusto, setProjCusto] = useState(0);
  const [projLocacao, setProjLocacao] = useState(0);
  const [projEndereco, setProjEndereco] = useState("");
  const [projMateriais, setProjMateriais] = useState("");
  const [projEquipe, setProjEquipe] = useState("");

  // Selected supplier editing states
  const [supEmail, setSupEmail] = useState("");
  const [supServ, setSupServ] = useState("");

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !contato) return;
    onAddLead({
      empresa,
      contato,
      cargo,
      email,
      telefone,
      valorEstimado,
      origem,
      estagio,
      observacoes
    });
    setEmpresa("");
    setContato("");
    setCargo("");
    setEmail("");
    setTelefone("");
    setValorEstimado(0);
    setObservacoes("");
    setIsModalOpen(false);
  };

  const handleOpenClient = (index: number) => {
    const cli = clientes[index];
    setSelectedClientIndex(index);
    setCliEmail(cli.email);
    setCliCnpj(cli.cnpj);
    
    // Project details setup
    setProjCusto(cli.projetoDetalhado?.custoEstimado || 0);
    setProjLocacao(cli.projetoDetalhado?.locacaoEstimada || 0);
    setProjEndereco(cli.projetoDetalhado?.endereco || "");
    setProjMateriais(cli.projetoDetalhado?.materiais || "");
    setProjEquipe(cli.projetoDetalhado?.equipe || "");
  };

  const handleSaveClient = () => {
    if (selectedClientIndex === null) return;
    const cli = clientes[selectedClientIndex];
    const updated = {
      ...cli,
      email: cliEmail,
      cnpj: cliCnpj,
      projetoDetalhado: {
        custoEstimado: projCusto,
        locacaoEstimada: projLocacao,
        endereco: projEndereco,
        materiais: projMateriais,
        equipe: projEquipe
      }
    };
    onUpdateClient(selectedClientIndex, updated);
    alert("Dados do cliente atualizados com sucesso!");
  };

  const handleClientUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedClientIndex === null || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const cli = clientes[selectedClientIndex];
    
    const newAnexo = {
      id: `anx-${Date.now()}`,
      name: file.name,
      date: new Date().toISOString().split("T")[0]
    };
    
    const updated = {
      ...cli,
      anexos: [...(cli.anexos || []), newAnexo]
    };
    onUpdateClient(selectedClientIndex, updated);
  };

  const handleDeleteClientAnexo = (anxId: string) => {
    if (selectedClientIndex === null) return;
    const cli = clientes[selectedClientIndex];
    const updated = {
      ...cli,
      anexos: (cli.anexos || []).filter(a => a.id !== anxId)
    };
    onUpdateClient(selectedClientIndex, updated);
  };

  const handleOpenSupplier = (index: number) => {
    const sup = fornecedores[index];
    setSelectedSupplierIndex(index);
    setSupEmail(sup.email);
    setSupServ(sup.servico);
  };

  const handleSaveSupplier = () => {
    if (selectedSupplierIndex === null) return;
    const sup = fornecedores[selectedSupplierIndex];
    const updated = {
      ...sup,
      email: supEmail,
      servico: supServ
    };
    onUpdateSupplier(selectedSupplierIndex, updated);
    setSelectedSupplierIndex(null);
    alert("Fornecedor atualizado com sucesso!");
  };

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCliName) return;
    onAddClient({ name: newCliName, email: newCliEmail, cnpj: newCliCnpj });
    setNewCliName("");
    setNewCliEmail("");
    setNewCliCnpj("");
    setIsClientModalOpen(false);
  };

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName) return;
    onAddSupplier({ name: newSupName, email: newSupEmail, servico: newSupServ });
    setNewSupName("");
    setNewSupEmail("");
    setNewSupServ("");
    setIsSupplierModalOpen(false);
  };

  const filteredLeads = leads.filter(l => 
    l.empresa.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.contato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLeadsByEstagio = (stage: LeadCRM["estagio"]) => {
    return filteredLeads.filter(l => l.estagio === stage);
  };

  return (
    <div className="crm-container" style={{ padding: "10px" }}>
      {/* Sub tabs header */}
      <div className="sub-header-tabs" style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", marginBottom: "24px" }}>
        <button 
          className={`tab-btn-link ${activeSubTab === "pipeline" ? "active" : ""}`}
          onClick={() => setActiveSubTab("pipeline")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "pipeline" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "pipeline" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "pipeline" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Pipeline de Vendas (CRM)
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "clientes" ? "active" : ""}`}
          onClick={() => setActiveSubTab("clientes")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "clientes" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "clientes" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "clientes" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Clientes Homologados
        </button>
        <button 
          className={`tab-btn-link ${activeSubTab === "fornecedores" ? "active" : ""}`}
          onClick={() => setActiveSubTab("fornecedores")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "fornecedores" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
            color: activeSubTab === "fornecedores" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeSubTab === "fornecedores" ? "600" : "500",
            fontFamily: "var(--font)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Fornecedores &amp; Parceiros
        </button>
      </div>

      {/* Top bar search and add */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px" }}>
        <div className="search-input-wrapper" style={{ position: "relative", flexGrow: 1, maxWidth: "400px" }}>
          <Search size={16} className="text-muted" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder={
              activeSubTab === "pipeline" ? "Buscar oportunidades..." :
              activeSubTab === "clientes" ? "Buscar clientes..." : "Buscar fornecedores..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              border: "1px solid var(--border)",
              borderRadius: "100px",
              fontFamily: "var(--font)",
              fontSize: "13px",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        {activeSubTab === "pipeline" && (
          <button 
            className="btn-primary" 
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: "100px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} /> Novo Lead
          </button>
        )}

        {activeSubTab === "clientes" && (
          <button 
            className="btn-primary" 
            onClick={() => setIsClientModalOpen(true)}
            style={{ borderRadius: "100px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} /> Novo Cliente
          </button>
        )}

        {activeSubTab === "fornecedores" && (
          <button 
            className="btn-primary" 
            onClick={() => setIsSupplierModalOpen(true)}
            style={{ borderRadius: "100px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} /> Novo Fornecedor
          </button>
        )}
      </div>

      {/* Pipeline sub tab */}
      {activeSubTab === "pipeline" && (
        <div>
          {/* Seletor Mobile de Estágios do Pipeline */}
          <div className="mobile-kanban-tabs" style={{ display: "none", marginBottom: "16px", gap: "4px" }}>
            <button 
              className={`btn-secondary text-xs ${activeMobileStage === "briefing" ? "active" : ""}`} 
              style={{ flex: 1, padding: "8px 2px", borderBottom: activeMobileStage === "briefing" ? "3px solid var(--accent)" : "none", borderRadius: "8px", fontWeight: "600", fontSize: "11px" }}
              onClick={() => setActiveMobileStage("briefing")}
            >
              Prospecção ({getLeadsByEstagio("briefing").length})
            </button>
            <button 
              className={`btn-secondary text-xs ${activeMobileStage === "orcamento" ? "active" : ""}`} 
              style={{ flex: 1, padding: "8px 2px", borderBottom: activeMobileStage === "orcamento" ? "3px solid var(--accent)" : "none", borderRadius: "8px", fontWeight: "600", fontSize: "11px" }}
              onClick={() => setActiveMobileStage("orcamento")}
            >
              Negociação ({getLeadsByEstagio("orcamento").length})
            </button>
            <button 
              className={`btn-secondary text-xs ${activeMobileStage === "aprovado" ? "active" : ""}`} 
              style={{ flex: 1, padding: "8px 2px", borderBottom: activeMobileStage === "aprovado" ? "3px solid var(--accent)" : "none", borderRadius: "8px", fontWeight: "600", fontSize: "11px" }}
              onClick={() => setActiveMobileStage("aprovado")}
            >
              Fechado ({getLeadsByEstagio("aprovado").length})
            </button>
            <button 
              className={`btn-secondary text-xs ${activeMobileStage === "perdido" ? "active" : ""}`} 
              style={{ flex: 1, padding: "8px 2px", borderBottom: activeMobileStage === "perdido" ? "3px solid var(--accent)" : "none", borderRadius: "8px", fontWeight: "600", fontSize: "11px" }}
              onClick={() => setActiveMobileStage("perdido")}
            >
              Perdido ({getLeadsByEstagio("perdido").length})
            </button>
          </div>

          <div className="crm-pipeline-grid">
            {/* Colunas */}
            {(["briefing", "orcamento", "aprovado", "perdido"] as const).map((stage) => (
              <div 
                key={stage} 
                className={`mobile-crm-col ${activeMobileStage === stage ? "mobile-show" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) onUpdateLeadEstagio(id, stage);
                }}
                style={{
                  backgroundColor: "var(--bg-kanban-col)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "16px",
                  padding: "16px",
                  minHeight: "450px",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span 
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "var(--text-primary)"
                    }}
                  >
                    {stage === "briefing" && "Fase 1: Prospecção"}
                    {stage === "orcamento" && "Fase 2: Negociação"}
                    {stage === "aprovado" && "Fase 3: Fechado"}
                    {stage === "perdido" && "Arquivado: Perdido"}
                  </span>
                  <span 
                    style={{
                      backgroundColor: "var(--accent-glow)",
                      color: "var(--accent)",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "10px"
                    }}
                  >
                    {getLeadsByEstagio(stage).length}
                  </span>
                </div>

                {/* Cards de Lead */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1, overflowY: "auto" }}>
                  {getLeadsByEstagio(stage).length === 0 ? (
                    <div style={{ border: "1px dashed var(--border)", borderRadius: "12px", padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px", marginTop: "10px" }}>
                      Nenhum lead nesta fase (Arraste aqui)
                    </div>
                  ) : (
                    getLeadsByEstagio(stage).map(lead => (
                      <div 
                        key={lead.id} 
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}
                        style={{
                          backgroundColor: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          borderLeft: "4px solid var(--accent)",
                          borderRadius: "12px",
                          padding: "16px",
                          boxShadow: "var(--shadow-sm)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          cursor: "grab"
                        }}
                      >
                        <div onClick={() => handleOpenLead(lead)} style={{ cursor: "pointer" }} title="Ver detalhes do Lead">
                          <strong style={{ display: "block", fontSize: "14px", color: "var(--accent)", textDecoration: "underline" }}>{lead.empresa}</strong>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{lead.contato} ({lead.cargo})</span>
                        </div>

                        {/* Ações de movimentação */}
                        <div style={{ display: "flex", gap: "6px", marginTop: "4px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                          {stage !== "briefing" && (
                            <button 
                              onClick={() => onUpdateLeadEstagio(lead.id, stage === "orcamento" ? "briefing" : stage === "aprovado" ? "orcamento" : "orcamento")}
                              style={{ flexGrow: 1, padding: "4px", fontSize: "10px", borderRadius: "4px", border: "1px solid var(--text-muted)", background: "var(--bg-card)", cursor: "pointer", color: "var(--text-primary)" }}
                            >
                              ◄ Recuar
                            </button>
                          )}
                          {stage !== "aprovado" && stage !== "perdido" && (
                            <button 
                              onClick={() => onUpdateLeadEstagio(lead.id, stage === "briefing" ? "orcamento" : "aprovado")}
                              style={{ flexGrow: 1, padding: "4px", fontSize: "10px", borderRadius: "4px", border: "1px solid var(--accent-text)", background: "var(--accent-glow)", color: "var(--accent-text)", cursor: "pointer", fontWeight: 600 }}
                            >
                              Avançar ►
                            </button>
                          )}
                          {stage !== "perdido" && stage !== "aprovado" && (
                            <button 
                              onClick={() => onUpdateLeadEstagio(lead.id, "perdido")}
                              style={{ padding: "4px 8px", fontSize: "10px", borderRadius: "4px", border: "1px solid var(--danger-text)", background: "var(--danger-glow)", color: "var(--danger-text)", cursor: "pointer" }}
                              title="Perdido"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clientes tab */}
      {activeSubTab === "clientes" && (
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          <table className="table-responsive-cards" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                <th style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Cliente</th>
                <th style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>E-mail</th>
                <th style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>CNPJ</th>
                <th style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Projetos / Anexos</th>
              </tr>
            </thead>
            <tbody>
              {clientes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((c, index) => (
                <tr 
                  key={index} 
                  onClick={() => handleOpenClient(index)}
                  style={{ borderBottom: "1px solid var(--border)", transition: "var(--transition)", cursor: "pointer" }}
                >
                  <td style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--accent-glow)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                      {c.name.substring(0, 1)}
                    </div>
                    <strong>{c.name}</strong>
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{c.email}</td>
                  <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{c.cnpj}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      📂 {c.anexos?.length || 0} docs
                    </span>
                    {c.projetoDetalhado && (
                      <span style={{ marginLeft: "10px", fontSize: "11px", color: "var(--success-text)", fontWeight: "600" }}>
                        🛠️ Orcamento OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fornecedores tab */}
      {activeSubTab === "fornecedores" && (
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          <table className="table-responsive-cards" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--bg-card-hover)" }}>
                <th style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Fornecedor</th>
                <th style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>E-mail de Contato</th>
                <th style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Serviço / Produto</th>
                <th style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: "600", fontSize: "13px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((f, index) => (
                <tr 
                  key={index} 
                  onClick={() => handleOpenSupplier(index)}
                  style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                >
                  <td style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="supplier-avatar">
                      {f.name.substring(0, 1)}
                    </div>
                    <strong>{f.name}</strong>
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{f.email}</td>
                  <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "500" }}>{f.servico}</td>
                  <td style={{ padding: "16px 24px" }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleOpenSupplier(index)}
                      style={{ border: "none", background: "none", color: "var(--accent)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600" }}
                    >
                      <Edit size={12} /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Novo Lead */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "500px", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", fontFamily: "var(--font-title)", color: "var(--accent)" }}>Novo Lead Comercial</h3>
            
            <form onSubmit={handleSubmitLead} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Empresa / Cliente</label>
                <input type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)} required style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Nome do Contato</label>
                  <input type="text" value={contato} onChange={(e) => setContato(e.target.value)} required style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Cargo</label>
                  <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>E-mail</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Telefone</label>
                  <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Valor Estimado (R$)</label>
                  <input type="number" value={valorEstimado} onChange={(e) => setValorEstimado(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Origem do Lead</label>
                  <select value={origem} onChange={(e) => setOrigem(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", height: "38px", color: "var(--text-primary)" }}>
                    <option value="Instagram">Instagram</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Site / Google">Site / Google</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Observações</label>
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font)", color: "var(--text-primary)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {isClientModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Cadastrar Novo Cliente</h3>
            <form onSubmit={handleAddClientSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Razão Social / Nome</label>
                <input type="text" value={newCliName} onChange={(e) => setNewCliName(e.target.value)} required style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>E-mail Administrativo</label>
                <input type="email" value={newCliEmail} onChange={(e) => setNewCliEmail(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>CNPJ</label>
                <input type="text" value={newCliCnpj} onChange={(e) => setNewCliCnpj(e.target.value)} placeholder="00.000.000/0001-00" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsClientModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Homologar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Fornecedor */}
      {isSupplierModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Cadastrar Novo Fornecedor</h3>
            <form onSubmit={handleAddSupplierSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Razão Social / Nome</label>
                <input type="text" value={newSupName} onChange={(e) => setNewSupName(e.target.value)} required style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>E-mail Comercial</label>
                <input type="email" value={newSupEmail} onChange={(e) => setNewSupEmail(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>Serviço Prestado / Produto</label>
                <input type="text" value={newSupServ} onChange={(e) => setNewSupServ(e.target.value)} placeholder="Ex: Madeira, Vidros, Diárias" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsSupplierModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Homologar Fornecedor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Cliente (CRM drilldown com projeto, custos, locacao, equipe e uploads) */}
      {selectedClientIndex !== null && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedClientIndex(null)}>
          <div 
            style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "90%", maxWidth: "750px", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Column: Form & Project details */}
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--accent)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
                Dossiê do Cliente: {clientes[selectedClientIndex].name}
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>CNPJ</label>
                    <input type="text" value={cliCnpj} onChange={(e) => setCliCnpj(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>E-mail</label>
                    <input type="text" value={cliEmail} onChange={(e) => setCliEmail(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", marginTop: "10px", paddingTop: "10px" }}>
                  <strong style={{ fontSize: "11px", color: "var(--accent-secondary)", display: "block", marginBottom: "6px" }}>PROJETO A SER DESENVOLVIDO</strong>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Orçamento Custo (R$)</label>
                      <input type="number" value={projCusto} onChange={(e) => setProjCusto(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Locação Estimada (R$)</label>
                      <input type="number" value={projLocacao} onChange={(e) => setProjLocacao(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Endereço do Estande / Feira</label>
                    <input type="text" value={projEndereco} onChange={(e) => setProjEndereco(e.target.value)} placeholder="Ex: Anhembi Pavilhão 02, SP" style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Materiais Requisitados</label>
                      <textarea value={projMateriais} onChange={(e) => setProjMateriais(e.target.value)} placeholder="Madeira MDF, Vidros, 10 Refletores..." rows={2} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--font)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Equipe / Perfis Escalados</label>
                      <textarea value={projEquipe} onChange={(e) => setProjEquipe(e.target.value)} placeholder="1 Carpinteiro, 1 Eletricista, 2 Montadores" rows={2} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--font)" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button type="button" className="btn-primary" onClick={handleSaveClient} style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", flexGrow: 1, justifyContent: "center" }}>Salvar Detalhes</button>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedClientIndex(null)} style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }}>Fechar</button>
                </div>
              </div>
            </div>

            {/* Right Column: PDF uploads list */}
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <strong style={{ fontSize: "12px", color: "var(--text-primary)" }}>Documentações &amp; Contratos Comerciais</strong>
              
              {/* Simulate upload boxes */}
              <div style={{ border: "2px dashed var(--border)", padding: "16px", borderRadius: "10px", textAlign: "center", position: "relative", cursor: "pointer", backgroundColor: "var(--bg-card-hover)" }}>
                <Upload size={16} className="text-muted" style={{ margin: "0 auto 6px auto" }} />
                <span style={{ fontSize: "11px", fontWeight: "600", display: "block" }}>Anexar PDF Técnico / Contrato</span>
                <input type="file" accept="application/pdf" onChange={handleClientUpload} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: "pointer" }} />
              </div>

              {/* Attachments List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1, overflowY: "auto", maxHeight: "250px" }}>
                {clientes[selectedClientIndex].anexos && clientes[selectedClientIndex].anexos!.length > 0 ? (
                  clientes[selectedClientIndex].anexos!.map(anx => (
                    <div key={anx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-card)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                        <FileText size={14} style={{ color: "var(--accent-secondary)", flexShrink: 0 }} />
                        <span 
                          style={{ fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", color: "var(--accent)" }}
                          onClick={() => alert(`Simulando visualização de: ${anx.name}`)}
                        >
                          {anx.name}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteClientAnexo(anx.id)}
                        style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>Nenhuma documentação anexada.</span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Detalhes do Fornecedor */}
      {selectedSupplierIndex !== null && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedSupplierIndex(null)}>
          <div 
            style={{ backgroundColor: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "var(--shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--accent)" }}>Editar Fornecedor Homologado</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Nome do Fornecedor / Razão Social</label>
                <input type="text" value={fornecedores[selectedSupplierIndex].name} readOnly style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-card-hover)", color: "var(--text-muted)" }} />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>E-mail Comercial</label>
                <input type="email" value={supEmail} onChange={(e) => setSupEmail(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>Serviço Prestado / Categoria</label>
                <input type="text" value={supServ} onChange={(e) => setSupServ(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedSupplierIndex(null)}>Cancelar</button>
                <button type="button" className="btn-primary" onClick={handleSaveSupplier}>Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Lead (CRM Completo: interações, tarefas, follow-up) */}
      {selectedLead && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedLeadId(null)}>
          <div 
            style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", width: "90%", maxWidth: "750px", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Pane: Lead Fields */}
            <div style={{ borderRight: "1px solid var(--border)", paddingRight: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--accent)", marginBottom: "12px" }}>Lead: {selectedLead.empresa}</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                <div>
                  <span className="text-xs text-muted" style={{ display: "block" }}>Contato Principal:</span>
                  <p><strong>{selectedLead.contato}</strong> ({selectedLead.cargo})</p>
                </div>
                <div>
                  <span className="text-xs text-muted" style={{ display: "block" }}>Contatos:</span>
                  <p>Email: {selectedLead.email} <br /> Fone: {selectedLead.telefone}</p>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Data do Próximo Follow-up</label>
                    <input type="date" value={leadFollowUp} onChange={(e) => setLeadFollowUp(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Próxima Interação Planejada</label>
                    <input type="text" value={leadNextInt} onChange={(e) => setLeadNextInt(e.target.value)} placeholder="Ex: Enviar orçamento revisado" style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "2px" }}>Observações do Lead</label>
                    <textarea value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "6px", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--font)" }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button type="button" className="btn-primary" onClick={handleSaveLeadFields} style={{ flexGrow: 1, padding: "8px", fontSize: "12px", borderRadius: "6px" }}>Salvar Dados</button>
                  <button type="button" className="btn-success" onClick={() => { onUpdateLeadEstagio(selectedLead.id, "aprovado"); setSelectedLeadId(null); }} style={{ padding: "8px", fontSize: "12px", borderRadius: "6px" }}>Converter Cliente</button>
                </div>
              </div>
            </div>

            {/* Right Pane: Interactions & Tasks tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto", maxHeight: "80vh" }}>
              {/* Tab Navigation header */}
              <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", flexWrap: "wrap" }}>
                <button 
                  type="button" 
                  onClick={() => setActiveLeadTab("historico")}
                  style={{ 
                    border: "none", 
                    background: "none", 
                    fontWeight: activeLeadTab === "historico" ? "bold" : "normal", 
                    color: activeLeadTab === "historico" ? "var(--accent)" : "var(--text-secondary)", 
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Histórico &amp; Tarefas
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveLeadTab("documentos")}
                  style={{ 
                    border: "none", 
                    background: "none", 
                    fontWeight: activeLeadTab === "documentos" ? "bold" : "normal", 
                    color: activeLeadTab === "documentos" ? "var(--accent)" : "var(--text-secondary)", 
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Documentos
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveLeadTab("fornecedores")}
                  style={{ 
                    border: "none", 
                    background: "none", 
                    fontWeight: activeLeadTab === "fornecedores" ? "bold" : "normal", 
                    color: activeLeadTab === "fornecedores" ? "var(--accent)" : "var(--text-secondary)", 
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Fornecedores
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveLeadTab("parceiros")}
                  style={{ 
                    border: "none", 
                    background: "none", 
                    fontWeight: activeLeadTab === "parceiros" ? "bold" : "normal", 
                    color: activeLeadTab === "parceiros" ? "var(--accent)" : "var(--text-secondary)", 
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Parceiros
                </button>
              </div>

              {activeLeadTab === "historico" && (
                <>
                  <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Histórico de Interações</strong>
                  
                  {/* Interaction add form */}
                  <form onSubmit={handleAddContactLog} style={{ display: "flex", gap: "6px", alignItems: "flex-end", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                    <div style={{ flexGrow: 1 }}>
                      <select value={newLogTipo} onChange={(e) => setNewLogTipo(e.target.value as any)} style={{ padding: "4px", width: "100%", marginBottom: "4px", borderRadius: "4px" }}>
                        <option value="ligacao">📞 Ligação</option>
                        <option value="reuniao">🤝 Reunião</option>
                        <option value="visita">🚗 Visita</option>
                      </select>
                      <input type="text" placeholder="Resumo do contato..." value={newLogDesc} onChange={(e) => setNewLogDesc(e.target.value)} style={{ width: "100%", padding: "4px", fontSize: "11px", border: "1px solid var(--border)", borderRadius: "4px" }} required />
                    </div>
                    <button type="submit" className="btn-secondary" style={{ padding: "6px 12px" }}>Registrar</button>
                  </form>

                  {/* Interaction List */}
                  <div style={{ maxHeight: "120px", overflowY: "auto", fontSize: "11px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {(!selectedLead.historicoContatos || selectedLead.historicoContatos.length === 0) ? (
                      <p className="text-muted" style={{ fontStyle: "italic" }}>Sem registros de contato.</p>
                    ) : (
                      selectedLead.historicoContatos.map((log) => (
                        <div key={log.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>
                          <span className="semibold text-muted" style={{ fontSize: "9px" }}>{log.date} | {log.tipo.toUpperCase()}</span>
                          <p style={{ margin: 0 }}>{log.descricao}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Tasks Section */}
                  <strong style={{ fontSize: "13px", color: "var(--text-primary)", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>Tarefas do Lead</strong>
                  
                  {/* Task add form */}
                  <form onSubmit={handleAddTask} style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
                    <div style={{ flexGrow: 1 }}>
                      <input type="text" placeholder="Nova tarefa..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} style={{ width: "100%", padding: "4px", fontSize: "11px", border: "1px solid var(--border)", borderRadius: "4px", marginBottom: "4px" }} required />
                      <input type="date" value={newTaskDue} onChange={(e) => setNewTaskDue(e.target.value)} style={{ width: "100%", padding: "4px", fontSize: "11px", border: "1px solid var(--border)", borderRadius: "4px" }} />
                    </div>
                    <button type="submit" className="btn-secondary" style={{ padding: "6px 12px" }}>Criar</button>
                  </form>

                  {/* Tasks List */}
                  <div style={{ maxHeight: "120px", overflowY: "auto", fontSize: "11px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {(!selectedLead.tarefas || selectedLead.tarefas.length === 0) ? (
                      <p className="text-muted" style={{ fontStyle: "italic" }}>Sem tarefas pendentes.</p>
                    ) : (
                      selectedLead.tarefas.map((task) => (
                        <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", padding: "4px 0" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: task.concluida ? "line-through" : "none" }}>
                            <input type="checkbox" checked={task.concluida} onChange={() => handleToggleTask(task.id)} />
                            <span>{task.titulo} (Até: {task.vencimento})</span>
                          </label>
                          <button type="button" onClick={() => handleDeleteTask(task.id)} style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}>
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {activeLeadTab === "documentos" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "11px" }}>
                  <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Área de Documentos do Cliente</strong>
                  
                  {/* Add Document Form */}
                  <form onSubmit={handleAddClientDocument} style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", padding: "10px", borderRadius: "8px", backgroundColor: "var(--bg-main)" }}>
                    <div style={{ fontWeight: "600", fontSize: "11px", color: "var(--accent)" }}>Anexar Novo Documento</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "2px" }}>Nome do Doc</label>
                        <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Ex: Planta Final Stand 3D" style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid var(--border)" }} required />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "2px" }}>Categoria</label>
                        <select value={docCategory} onChange={(e) => setDocCategory(e.target.value as any)} style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                          <option value="contrato">Contrato Comercial</option>
                          <option value="proposta">Proposta Comercial</option>
                          <option value="planta">Planta Cenográfica</option>
                          <option value="documento_cliente">Docs Enviados Cliente</option>
                          <option value="outro">Outro Documento</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "2px" }}>Arquivo Simulado</label>
                        <input type="text" value={docFileSelected} onChange={(e) => setDocFileSelected(e.target.value)} placeholder="Ex: planta_natura.pdf" style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid var(--border)" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "2px" }}>Observações</label>
                        <input type="text" value={docNotes} onChange={(e) => setDocNotes(e.target.value)} placeholder="Ex: Aprovada com o cliente" style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid var(--border)" }} />
                      </div>
                    </div>
                    <button type="submit" className="btn-secondary" style={{ padding: "6px", alignSelf: "flex-end" }}>Salvar Documento</button>
                  </form>

                  {/* Documents List Organized by Category */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                    {(["contrato", "proposta", "planta", "documento_cliente", "outro"] as const).map(cat => {
                      const docsOfCat = (selectedLead.documentosCliente || getDefaultDocs(selectedLead.id)).filter(d => d.categoria === cat);
                      const catNameMap = {
                        contrato: "📄 Contratos em PDF",
                        proposta: "💰 Propostas Comerciais",
                        planta: "📐 Plantas do Estande",
                        documento_cliente: "📥 Documentos Enviados pelo Cliente",
                        outro: "📁 Outros Documentos"
                      };
                      return (
                        <div key={cat} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                          <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "11px", marginBottom: "4px" }}>{catNameMap[cat]}</div>
                          {docsOfCat.length === 0 ? (
                            <span className="text-muted" style={{ fontStyle: "italic", marginLeft: "8px", fontSize: "10px" }}>Sem arquivos nesta categoria.</span>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginLeft: "8px" }}>
                              {docsOfCat.map(doc => {
                                const latestVersion = doc.versoes[doc.versoes.length - 1];
                                return (
                                  <div key={doc.id} style={{ display: "flex", flexDirection: "column", gap: "2px", backgroundColor: "#fafafa", padding: "6px", borderRadius: "6px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontWeight: "600", color: "var(--accent)" }}>{doc.nome}</span>
                                      <span style={{ fontSize: "9px", padding: "2px 4px", backgroundColor: "var(--accent-glow)", color: "var(--accent)", borderRadius: "4px" }}>
                                        v{latestVersion.versao} (Atual)
                                      </span>
                                    </div>
                                    <div style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
                                      Arquivo: <span style={{ fontFamily: "monospace" }}>{latestVersion.nomeArquivo}</span> | Data: {latestVersion.dataEnvio}
                                    </div>
                                    <div style={{ fontSize: "10px" }}>
                                      Responsável: <strong>{latestVersion.responsavelEnvio}</strong>
                                    </div>
                                    {latestVersion.observacoes && (
                                      <div style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "9px" }}>
                                        Obs: {latestVersion.observacoes}
                                      </div>
                                    )}
                                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          alert(`Simulando download/visualização direta de: ${latestVersion.nomeArquivo}`);
                                        }}
                                        style={{ border: "none", background: "none", color: "var(--accent)", cursor: "pointer", textDecoration: "underline", fontSize: "9px", padding: 0 }}
                                      >
                                        Visualizar/Baixar
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setSelectedDocIdForVersion(selectedDocIdForVersion === doc.id ? null : doc.id);
                                        }}
                                        style={{ border: "none", background: "none", color: "var(--text-secondary)", cursor: "pointer", textDecoration: "underline", fontSize: "9px", padding: 0 }}
                                      >
                                        Subir Nova Versão
                                      </button>
                                    </div>

                                    {/* Upload new version inputs inline */}
                                    {selectedDocIdForVersion === doc.id && (
                                      <div style={{ marginTop: "6px", borderTop: "1px dashed var(--border)", paddingTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div style={{ fontWeight: "600", fontSize: "9px" }}>Nova Versão (v{doc.versoes.length + 1})</div>
                                        <input type="text" value={docFileSelected} onChange={(e) => setDocFileSelected(e.target.value)} placeholder="Ex: arquivo_v2.pdf" style={{ width: "100%", padding: "3px" }} />
                                        <input type="text" value={docNotes} onChange={(e) => setDocNotes(e.target.value)} placeholder="Notas da revisão/observações..." style={{ width: "100%", padding: "3px" }} />
                                        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                          <button type="button" onClick={() => setSelectedDocIdForVersion(null)} style={{ fontSize: "9px", padding: "2px 6px" }}>Cancelar</button>
                                          <button type="button" onClick={() => handleAddDocumentVersion(doc.id)} style={{ fontSize: "9px", padding: "2px 6px", backgroundColor: "var(--accent)", color: "white", border: "none", borderRadius: "3px" }}>Salvar Versão</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeLeadTab === "fornecedores" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Fornecedores Envolvidos na Proposta</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Vincule os fornecedores homologados que fornecerão insumos, marceneiros ou terceirizados.</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                    {fornecedores.map((sup, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-main)" }}>
                        <div>
                          <strong style={{ fontSize: "12px", display: "block" }}>{sup.name}</strong>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{sup.servico} | {sup.email}</span>
                        </div>
                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#059669", background: "#ecfdf5", padding: "2px 6px", borderRadius: "4px" }}>
                          Homologado
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeLeadTab === "parceiros" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Parceiros &amp; Co-Participantes</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Agências de cenografia, arquitetos parceiros ou organizadores da feira.</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                    <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", background: "var(--bg-main)" }}>
                      <strong style={{ fontSize: "12px", display: "block", color: "var(--accent)" }}>Agência Concept Design Ltda</strong>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Parceiro Comercial (Comissão 5%) | Contato: Roberto Arquiteto</span>
                    </div>
                    <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", background: "var(--bg-main)" }}>
                      <strong style={{ fontSize: "12px", display: "block", color: "var(--accent)" }}>Promotora Feicon RN</strong>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Organização de Pavilhão | Contato: Credenciamento Oficial</span>
                    </div>
                  </div>
                </div>
              )}

              <button type="button" className="btn-secondary btn-sm" onClick={() => setSelectedLeadId(null)} style={{ marginTop: "auto" }}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
