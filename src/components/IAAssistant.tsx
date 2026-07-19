import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, Send, Sparkles, MessageSquare, CornerDownLeft
} from "lucide-react";
import type { Project, Employee, WarehouseItem, InvoiceLog } from "../types";

interface IAAssistantProps {
  events: Project[];
  employees: Employee[];
  warehouseItems: WarehouseItem[];
  invoices: InvoiceLog[];
  onAddEvent?: (name: string, client: string, startDate: string) => void;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export default function IAAssistant({ 
  events, employees, warehouseItems, invoices, onAddEvent
}: IAAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Olá! Sou o Assistente Inteligente da JC Eventos. Posso resumir eventos, listar pendências de documentos, sugerir equipes ou responder dúvidas sobre estoque e financeiro. Experimente me pedir para gerar um stand para odontologia! O que gostaria de analisar hoje?", timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText;
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: userMsgText, timestamp }]);
    setInputText("");

    // Process reply (simulated intelligence over live state)
    setTimeout(() => {
      const botReply = generateReply(userMsgText);
      setMessages(prev => [...prev, { sender: "bot", text: botReply, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }, 600);
  };

  const generateReply = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Check for low stock items
    if (q.includes("estoque") || q.includes("ferramenta") || q.includes("depósito") || q.includes("baixo")) {
      const lowStock = warehouseItems.filter(item => item.stock <= item.stockMinimo);
      if (lowStock.length === 0) {
        return "Conferi o inventário do depósito no WMS e todas as ferramentas básicas estão com estoque acima do nível mínimo de segurança.";
      }
      return `Identifiquei ${lowStock.length} itens com nível de estoque crítico ou de atenção no depósito:\n\n` +
        lowStock.map(i => `• **${i.name}** (${i.codigo}) - Estoque atual: ${i.stock} (Mínimo: ${i.stockMinimo}) - Localizado no Corredor ${i.localizacaoFisica.corredor}, Prateleira ${i.localizacaoFisica.prateleira}`).join("\n");
    }

    // 2. Check for events without defined teams
    if (q.includes("equipe") || q.includes("escala") || q.includes("trabalhador") || q.includes("funcionário")) {
      const emptyEvents = events.filter(e => e.assignedEmployees.length === 0 && e.phase !== "post");
      if (emptyEvents.length === 0) {
        return "Excelente notícia! Todos os próximos eventos planejados já contam com colaboradores escalados no sistema.";
      }
      return `Detectei ${emptyEvents.length} eventos planejados ou ativos que ainda não possuem equipe ou equipe definida:\n\n` +
        emptyEvents.map(e => `• **${e.name}** (Cliente: ${e.client}) - Data de início: ${e.startDate}`).join("\n") +
        "\n\nRecomendo acessar a escala de profissionais para estes estandes no painel de Eventos.";
    }

    // 3. Profitability / Cost Center ranking
    if (q.includes("lucro") || q.includes("financeiro") || q.includes("lucrativo") || q.includes("faturamento")) {
      const profitSummaries = events.map(evt => {
        let totalCost = Object.values(evt.centroCusto || {}).reduce((a, b) => a + b, 0);
        invoices.filter(i => i.eventoId === evt.id && i.tipo === "despesa").forEach(i => totalCost += i.value);
        const profit = evt.valorContratado - totalCost;
        return { name: evt.name, profit };
      }).sort((a, b) => b.profit - a.profit);

      if (profitSummaries.length === 0) return "Nenhum dado financeiro de projetos disponível no momento.";
      
      const highest = profitSummaries[0];
      return `Analisando os Centros de Custo Consolidados:\n\n• O estande mais lucrativo é o **${highest.name}** com lucro líquido estimado de **R$ ${highest.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}**.\n\nRanking Geral:\n` +
        profitSummaries.map((s, idx) => `${idx + 1}. ${s.name}: R$ ${s.profit.toLocaleString("pt-BR")}`).join("\n");
    }

    // 4. Summarize event details
    if (q.includes("resumir") || q.includes("projeto") || q.includes("evento") || q.includes("detalhe")) {
      // Look for a matching event name
      const matchingEvent = events.find(e => q.includes(e.name.toLowerCase()) || q.includes(evtKeyword(e.name)));
      if (matchingEvent) {
        const totalEmp = matchingEvent.assignedEmployees.length;
        const totalTools = matchingEvent.assignedTools.length;
        const pendingDocs = matchingEvent.docs.filter(d => d.status === "pending").length;
        
        return `### Resumo Operacional: ${matchingEvent.name}\n\n` +
          `• **Cliente:** ${matchingEvent.client}\n` +
          `• **Fase Atual:** ${matchingEvent.phase === "during" ? "Montagem Física" : matchingEvent.phase === "post" ? "Desmontagem / Pós-Evento" : "Depósito / Separação"}\n` +
          `• **Período:** Início em ${matchingEvent.startDate}\n` +
          `• **Equipe Escalada:** ${totalEmp} colaboradores designados\n` +
          `• **Ferramentas Alocadas:** ${totalTools} ferramentas em trânsito\n` +
          `• **Exigências de Pavilhão:** ${pendingDocs} documentos pendentes de aprovação\n` +
          `• **Progresso do Checklist:** ${matchingEvent.completionRate}% concluído.`;
      }
    }

    // 5. Check for missing documents
    if (q.includes("documento") || q.includes("doc") || q.includes("pendencia") || q.includes("art")) {
      const eventsWithPendingDocs = events.filter(e => e.docs.some(d => d.status === "pending"));
      if (eventsWithPendingDocs.length === 0) {
        return "Todos os documentos e licenças de pavilhão (ART, Termos, Contratos) estão 100% aprovados.";
      }
      return `Existem pendências de credenciamento/documentos técnicos para os seguintes estandes:\n\n` +
        eventsWithPendingDocs.map(e => {
          const docsText = e.docs.filter(d => d.status === "pending").map(d => d.name).join(", ");
          return `• **${e.name}** (Vencimento: ${e.startDate}) - Documentos pendentes: *${docsText}*`;
        }).join("\n");
    }

    // 6. Generate stand briefing / checklist (Módulo 20)
    if (q.includes("odontologia") || q.includes("odonto") || q.includes("odontologico") || q.includes("odontológico") || q.includes("gerar")) {
      return `### IA Copilot - Briefing & Planejamento de Stand Gerado (JC Eventos)

**Cliente:** Clinica OdontoModern S/A
**Estande:** Concept Stand Odonto (27m²)
**Feira:** Dental Expo 2026

**1. Briefing Inicial:**
Estande contemporâneo de 27m² com foco em linhas orgânicas, acabamento laqueado branco, vitrines integradas de acrílico iluminadas para aparelhos odontológicos de alta tecnologia e fachada proeminente com perfis de LED de alta intensidade.

**2. Estimativa de Materiais (Módulo 19 - Inteligência de Custos):**
• 14 Chapas MDF Brancas (15mm)
• 180 Parafusos Autotarrachantes
• 8 Perfis de Alumínio LED
• 6 Refletores Direcionais LED
• 6h de Pintura e Lixamento
• 12h de Montagem em Pavilhão

**3. Sugestão de Equipe Operacional:**
• Carlos Henrique Lima (Carpinteiro Montador)
• Claudio Barbosa Silva (Eletricista Operacional)

**4. Minuta de Cronograma:**
• Dia 1 (Montagem): Ajuste do piso elevado, passagem de fiação elétrica e elevação das paredes de MDF.
• Dia 2 (Montagem): Pintura de retoque, comunicação visual, fixação de LEDs e posicionamento da mobília.
• Dia 3 (Feira): Entrega técnica, termo de liberação assinado e início da feira.

**5. Custos Estimados:** R$ 38.000,00
**Proposta Comercial Recomendada:** R$ 95.000,00 (Margem: 60%)

[CRIAR_PROJETO]`;
    }

    // Default reply fallback
    return `Compreendo. Posso ajudar você a analisar a operação da JC Eventos. Tente me perguntar coisas como:
• *"Quais ferramentas estão abaixo do estoque mínimo?"*
• *"Qual é o estande mais lucrativo cadastrado?"*
• *"Quais eventos estão sem equipe escalada?"*
• *"Quais documentos estão pendentes de aprovação?"*
• *"Gerar briefing de stand moderno de 27m²"*
• *"Resumir Estande Heineken"* (ou outro projeto)`;
  };

  const evtKeyword = (name: string): string => {
    if (name.toLowerCase().includes("nestlé")) return "nestlé";
    if (name.toLowerCase().includes("heineken")) return "heineken";
    if (name.toLowerCase().includes("petrobras")) return "petrobras";
    return name.toLowerCase();
  };

  const setSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  const handleCreateProjectFromIA = () => {
    if (onAddEvent) {
      onAddEvent("Estande OdontoModern - Dental Expo 2026", "Clinica OdontoModern S/A", "2026-08-15");
      const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [
        ...prev, 
        { sender: "bot", text: "✅ Estande 'Estande OdontoModern - Dental Expo 2026' criado e adicionado com sucesso ao Quadro de Projetos e Kanban!", timestamp }
      ]);
    } else {
      alert("Ação de criação não disponível.");
    }
  };

  return (
    <div className="ia-assistant-wrapper" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", height: "calc(100vh - 180px)", padding: "10px" }}>
      
      {/* Left chat layout window */}
      <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        
        {/* Chat Header */}
        <div style={{ backgroundColor: "var(--bg-sidebar)", padding: "16px 20px", display: "flex", alignItems: "center", gap: "10px", color: "#fff" }}>
          <div style={{ padding: "8px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.15)" }}>
            <Bot size={20} />
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "14px" }}>Assistente Inteligente (Copilot)</strong>
            <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.7)" }}>Conectado à base operacional JC Eventos</span>
          </div>
          <Sparkles size={16} style={{ marginLeft: "auto", color: "var(--success)" }} />
        </div>

        {/* Chat Messages flow */}
        <div style={{ flexGrow: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start"
              }}
            >
              <div 
                style={{
                  backgroundColor: msg.sender === "user" ? "var(--accent-secondary)" : "var(--bg-main)",
                  color: msg.sender === "user" ? "#fff" : "var(--text-primary)",
                  padding: "12px 16px",
                  borderRadius: msg.sender === "user" ? "16px 16px 0 16px" : "16px 16px 16px 0",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-line"
                }}
              >
                {msg.text.replace("[CRIAR_PROJETO]", "")}
                {msg.text.includes("[CRIAR_PROJETO]") && (
                  <div style={{ marginTop: "12.5px" }}>
                    <button 
                      onClick={handleCreateProjectFromIA}
                      className="btn-primary"
                      style={{ fontSize: "11px", padding: "6px 14px", borderRadius: "100px", background: "var(--accent-secondary)" }}
                    >
                      🚀 Criar Projeto Automaticamente
                    </button>
                  </div>
                )}
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px", padding: "0 4px" }}>{msg.timestamp}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSend} style={{ borderTop: "1px solid var(--border)", padding: "16px", display: "flex", gap: "10px", backgroundColor: "var(--bg-card-hover)" }}>
          <input 
            type="text" 
            placeholder="Pergunte sobre estoque, pendências de documentos, equipes..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "10px 16px",
              border: "1px solid var(--border)",
              borderRadius: "100px",
              fontFamily: "var(--font)",
              fontSize: "13px",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)"
            }}
          />
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              borderRadius: "50%", 
              width: "40px", 
              height: "40px", 
              padding: 0, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              flexShrink: 0 
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Right Suggested Questions sidebar helper */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", textTransform: "uppercase" }}>
            <Sparkles size={14} style={{ color: "var(--accent-secondary)" }} />
            Perguntas Sugeridas
          </span>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Clique nas questões rápidas abaixo para fazer a consulta sobre a operação:</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
            <button 
              onClick={() => setSuggestedQuestion("Gerar briefing de stand moderno de 27m²")}
              style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-card)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}
            >
              <Sparkles size={12} className="text-muted" style={{ color: "var(--accent-secondary)" }} />
              <span>Gerar briefing de stand moderno de 27m²</span>
            </button>

            <button 
              onClick={() => setSuggestedQuestion("Quais ferramentas estão abaixo do estoque mínimo?")}
              style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-card)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}
            >
              <MessageSquare size={12} className="text-muted" />
              <span>Verificar ferramentas abaixo do estoque mínimo</span>
            </button>

            <button 
              onClick={() => setSuggestedQuestion("Quais eventos estão sem equipe escalada?")}
              style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-card)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}
            >
              <MessageSquare size={12} className="text-muted" />
              <span>Verificar eventos sem equipe escalada</span>
            </button>

            <button 
              onClick={() => setSuggestedQuestion("Qual é o estande mais lucrativo cadastrado?")}
              style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-card)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}
            >
              <MessageSquare size={12} className="text-muted" />
              <span>Verificar estande mais lucrativo</span>
            </button>

            <button 
              onClick={() => setSuggestedQuestion("Quais documentos estão pendentes de aprovação?")}
              style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-card)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}
            >
              <MessageSquare size={12} className="text-muted" />
              <span>Quais documentos estão pendentes?</span>
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "var(--shadow-sm)", fontSize: "11px", color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-primary)" }}>Como a IA responde?</strong>
          <span>O assistente lê em tempo real o estado de memória do seu React app. Qualquer modificação que você fizer na equipe, estoque ou faturas será refletida na resposta da IA imediatamente!</span>
        </div>

      </div>

    </div>
  );
}
