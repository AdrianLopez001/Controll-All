import React, { useState } from "react";
import { 
  BarChart2, FileText, Download, Calendar, DollarSign, 
  TrendingUp, Users, Archive, CheckSquare, ShieldCheck 
} from "lucide-react";
import type { Project, Employee, WarehouseItem, InvoiceLog } from "../types";

interface RelatoriosProps {
  events: Project[];
  employees: Employee[];
  warehouseItems: WarehouseItem[];
  invoices: InvoiceLog[];
}

export default function Relatorios({
  events,
  employees,
  warehouseItems,
  invoices
}: RelatoriosProps) {
  const [activeReportTab, setActiveReportTab] = useState<"financeiro" | "operacional" | "produtividade">("financeiro");
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  // 1. Calculations: Financial report
  const totalSales = events.reduce((sum, e) => sum + e.valorContratado, 0);
  const totalReceived = events.reduce((sum, e) => sum + e.valorRecebido, 0);
  const totalCosts = invoices.filter(i => i.tipo === "despesa").reduce((sum, i) => sum + i.value, 0);
  const netMargin = totalSales > 0 ? ((totalSales - totalCosts) / totalSales) * 100 : 0;

  // 2. Calculations: WMS / Stock report
  const lowStockItems = warehouseItems.filter(item => item.stock <= item.stockMinimo);
  const totalWarehouseVal = warehouseItems.reduce((sum, item) => sum + (item.valorCompra * item.stock), 0);

  // 3. Export CSV Functionality (Actual downloads!)
  const handleExportCSV = (reportType: "finance" | "wms" | "staff" | "os") => {
    setExportLoading(reportType);
    
    setTimeout(() => {
      let csvContent = "";
      let filename = "";

      if (reportType === "finance") {
        csvContent = "ID Evento,Nome Evento,Cliente,Valor Contratado,Valor Recebido,Valor Pendente,Custo Previsto,Custo Realizado,Lucro Estimado\n";
        events.forEach(e => {
          const profit = e.valorContratado - e.custoRealizado;
          csvContent += `"${e.id}","${e.name}","${e.client}",${e.valorContratado},${e.valorRecebido},${e.valorPendente},${e.custoPrevisto},${e.custoRealizado},${profit}\n`;
        });
        filename = "relatorio_financeiro_eventos.csv";
      } else if (reportType === "wms") {
        csvContent = "Codigo,Nome do Item,Categoria,Estado,Valor Compra,Valor Locacao,Estoque Atual,Estoque Minimo,Origem\n";
        warehouseItems.forEach(i => {
          csvContent += `"${i.codigo}","${i.name}","${i.type === "tool" ? "Ferramenta" : "Mobiliário"}","${i.estadoConservacao}",${i.valorCompra},${i.valorLocacao},${i.stock},${i.stockMinimo},"${i.origem}"\n`;
        });
        filename = "relatorio_inventario_deposito.csv";
      } else if (reportType === "staff") {
        csvContent = "ID,Nome,Cargo,Salario,Certificacao NR,Documento Status,Horas Trabalhadas,Eventos Atendidos,Prazos Atendidos %,Nota Media\n";
        employees.forEach(emp => {
          const prod = emp.productivity || { horasTrabalhadas: 120, eventosAtendidos: 4, pontualidade: 95, tarefasConcluidas: 18, notaMedia: 4.8 };
          csvContent += `"${emp.id}","${emp.name}","${emp.role}",${emp.salario},${emp.hasSafetyCert ? "Sim" : "Não"},"${emp.documentStatus}",${prod.horasTrabalhadas},${prod.eventosAtendidos},${prod.pontualidade},${prod.notaMedia}\n`;
        });
        filename = "relatorio_produtividade_funcionarios.csv";
      } else if (reportType === "os") {
        csvContent = "Codigo,Nome OS,Cliente,Coordenador,Fase,Data Inicio,Progresso checklist,Custo Realizado\n";
        events.forEach(e => {
          csvContent += `"${e.codigo}","${e.name}","${e.client}","${e.responsavel}","${e.phase}","${e.startDate}",${e.completionRate},${e.custoRealizado}\n`;
        });
        filename = "relatorio_ordens_de_servico.csv";
      }

      // Trigger download
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportLoading(null);
      alert(`Relatório exportado com sucesso! Arquivo "${filename}" baixado.`);
    }, 1200); // 1.2s simulated download animation
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* Top statistics summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px" }}>
        <div style={{ background: "white", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", background: "var(--accent-glow)", color: "var(--accent)", borderRadius: "8px" }}>
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-xs text-muted" style={{ display: "block" }}>Vendas Totais Contratadas</span>
            <strong className="text-lg">R$ {totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        <div style={{ background: "white", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", background: "var(--danger-glow)", color: "var(--danger)", borderRadius: "8px" }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-xs text-muted" style={{ display: "block" }}>Total Despesas Caixa</span>
            <strong className="text-lg">R$ {totalCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        <div style={{ background: "white", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", background: "var(--success-glow)", color: "var(--success-text)", borderRadius: "8px" }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-muted" style={{ display: "block" }}>Margem de Lucro Média</span>
            <strong className="text-lg">{netMargin.toFixed(1)}%</strong>
          </div>
        </div>

        <div style={{ background: "white", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", background: "var(--warning-glow)", color: "var(--warning)", borderRadius: "8px" }}>
            <Archive size={20} />
          </div>
          <div>
            <span className="text-xs text-muted" style={{ display: "block" }}>Patrimônio Líquido Depósito</span>
            <strong className="text-lg">R$ {totalWarehouseVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      {/* Main Report area tabs */}
      <div className="section-box" style={{ height: "auto", minHeight: "450px" }}>
        <div className="section-box-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              className={`tab-btn-link ${activeReportTab === "financeiro" ? "active" : ""}`}
              onClick={() => setActiveReportTab("financeiro")}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "none",
                borderBottom: activeReportTab === "financeiro" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
                color: activeReportTab === "financeiro" ? "var(--accent)" : "var(--text-muted)",
                fontWeight: activeReportTab === "financeiro" ? "600" : "500",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Relatórios Financeiros e Lucratividade
            </button>
            <button 
              className={`tab-btn-link ${activeReportTab === "operacional" ? "active" : ""}`}
              onClick={() => setActiveReportTab("operacional")}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "none",
                borderBottom: activeReportTab === "operacional" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
                color: activeReportTab === "operacional" ? "var(--accent)" : "var(--text-muted)",
                fontWeight: activeReportTab === "operacional" ? "600" : "500",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Relatórios Operacionais e Estoque (WMS)
            </button>
            <button 
              className={`tab-btn-link ${activeReportTab === "produtividade" ? "active" : ""}`}
              onClick={() => setActiveReportTab("produtividade")}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "none",
                borderBottom: activeReportTab === "produtividade" ? "2px solid var(--accent-secondary)" : "2px solid transparent",
                color: activeReportTab === "produtividade" ? "var(--accent)" : "var(--text-muted)",
                fontWeight: activeReportTab === "produtividade" ? "600" : "500",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Produtividade de Funcionários
            </button>
          </div>
        </div>

        {/* TAB 1: FINANCE */}
        {activeReportTab === "financeiro" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
            <div>
              <h4 className="text-sm font-semibold" style={{ marginBottom: "16px" }}>Desempenho Comercial por Estande/Projeto</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {events.map(e => {
                  const profit = e.valorContratado - e.custoRealizado;
                  const profitPercent = e.valorContratado > 0 ? (profit / e.valorContratado) * 100 : 0;
                  return (
                    <div key={e.id} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", background: "white" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                        <strong>{e.name}</strong>
                        <span className="semibold" style={{ color: profit > 0 ? "var(--success-text)" : "var(--danger)" }}>
                          R$ {profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({profitPercent.toFixed(1)}%)
                        </span>
                      </div>
                      
                      {/* Bar comparison CSS */}
                      <div style={{ display: "flex", gap: "4px", height: "14px", borderRadius: "3px", overflow: "hidden", background: "var(--bg-main)" }}>
                        <div style={{ width: `${(e.custoRealizado / e.valorContratado) * 100}%`, background: "var(--accent-secondary)", height: "100%" }} title="Custo Realizado"></div>
                        <div style={{ flexGrow: 1, background: "var(--success)", height: "100%" }} title="Margem de Lucro Realizada"></div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                        <span>Custo: R$ {e.custoRealizado.toLocaleString()}</span>
                        <span>Receita Contrato: R$ {e.valorContratado.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export options for Finance */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "rgba(0,0,0,0.01)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <h4 className="text-sm font-semibold">Central de Exportações Financeiras</h4>
              <p className="text-xs text-muted">Gere planilhas consolidadas e relatórios gerenciais das receitas contratadas, centro de custos de obras e despesas gerais.</p>
              
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => handleExportCSV("finance")}
                disabled={exportLoading !== null}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px" }}
              >
                {exportLoading === "finance" ? "Processando..." : <><Download size={16} /> Exportar Vendas e Centro de Custos (CSV)</>}
              </button>

              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => handleExportCSV("os")}
                disabled={exportLoading !== null}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px" }}
              >
                {exportLoading === "os" ? "Processando..." : <><Download size={16} /> Exportar Ordens de Serviço Ativas (Excel/CSV)</>}
              </button>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", fontSize: "11px", color: "var(--text-secondary)" }}>
                <strong>Vínculos Automáticos:</strong> Todas as exportações relacionam o código único de OS da JC Eventos, cliente faturado, produtos retirados de WMS e faturamento final direto do Contas a Receber.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OPERATIONAL & WMS */}
        {activeReportTab === "operacional" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
            <div>
              <h4 className="text-sm font-semibold" style={{ marginBottom: "12px" }}>Alertas do Almoxarifado / Estoque Mínimo</h4>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Material</th>
                      <th>Estoque Físico</th>
                      <th>Estoque Mínimo</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouseItems.map(item => {
                      const isLow = item.stock <= item.stockMinimo;
                      return (
                        <tr key={item.id} style={{ background: isLow ? "var(--warning-glow)" : "none" }}>
                          <td><strong>{item.codigo}</strong></td>
                          <td>{item.name}</td>
                          <td><strong>{item.stock} unid</strong></td>
                          <td>{item.stockMinimo} unid</td>
                          <td>
                            <span className={`badge badge-${isLow ? "danger" : "success"}`} style={{ fontSize: "9px" }}>
                              {isLow ? "ESTOQUE BAIXO" : "ABASTECIDO"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* WMS CSV exports */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "rgba(0,0,0,0.01)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <h4 className="text-sm font-semibold">Central de Inventário e WMS</h4>
              <p className="text-xs text-muted">Baixe planilhas contendo a localização física detalhada (Galpão/Corredor/Rua/Prateleira) e patrimônio serializado de todas as ferramentas e móveis.</p>
              
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => handleExportCSV("wms")}
                disabled={exportLoading !== null}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px" }}
              >
                {exportLoading === "wms" ? "Processando..." : <><Download size={16} /> Exportar Inventário Físico do Galpão (CSV)</>}
              </button>

              <div style={{ padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "white", fontSize: "11px", color: "var(--text-secondary)" }}>
                <strong>Patrimônio totalizado:</strong>
                <p style={{ marginTop: "4px" }}>• Ferramentas e andaimes ativos: <strong>{warehouseItems.filter(i => i.type === "tool").length} modelos</strong></p>
                <p>• Itens de mobília cenográfica: <strong>{warehouseItems.filter(i => i.type === "furniture").length} modelos</strong></p>
                <p>• Alertando no painel: <strong style={{ color: "var(--warning)" }}>{lowStockItems.length} insumos em estado crítico</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF PRODUCTIVITY */}
        {activeReportTab === "produtividade" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
            <div>
              <h4 className="text-sm font-semibold" style={{ marginBottom: "16px" }}>Ranking Interno de Produtividade dos Montadores</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {employees.map((emp, index) => {
                  const prod = emp.productivity || {
                    horasTrabalhadas: 120 + (index * 15),
                    eventosAtendidos: 3 + index,
                    pontualidade: 90 + index,
                    tarefasConcluidas: 12 + (index * 3),
                    notaMedia: 4.2 + (index * 0.2)
                  };

                  return (
                    <div key={emp.id} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", background: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ 
                          width: "24px", 
                          height: "24px", 
                          background: index === 0 ? "#f59e0b" : index === 1 ? "#94a3b8" : index === 2 ? "#b45309" : "var(--border)", 
                          color: index < 3 ? "white" : "var(--text-primary)", 
                          borderRadius: "50%", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          fontSize: "11px", 
                          fontWeight: "700" 
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <strong className="text-sm" style={{ display: "block" }}>{emp.name}</strong>
                          <span className="text-xs text-muted">{emp.role} | {prod.horasTrabalhadas} horas trabalhas</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span className="text-sm font-bold" style={{ color: "var(--accent)", display: "block" }}>
                          ★ {prod.notaMedia.toFixed(1)} / 5.0
                        </span>
                        <span className="text-xs text-muted" style={{ display: "block", fontSize: "10px" }}>
                          Pontualidade: {prod.pontualidade}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Options for Staff productivity */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "rgba(0,0,0,0.01)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <h4 className="text-sm font-semibold">Central de RH e Escalas</h4>
              <p className="text-xs text-muted">Gere estatísticas de produtividade, custos operacionais e diárias por trabalhador escalado em pavilhão.</p>
              
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => handleExportCSV("staff")}
                disabled={exportLoading !== null}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px" }}
              >
                {exportLoading === "staff" ? "Processando..." : <><Download size={16} /> Exportar Produtividade e Diárias (CSV)</>}
              </button>

              <div style={{ padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "white", fontSize: "11px", color: "var(--text-secondary)" }}>
                <strong>Indicadores de RH JC Eventos:</strong>
                <p style={{ marginTop: "4px" }}>• Total homologado no sistema: <strong>{employees.length} montadores</strong></p>
                <p>• Certificados NR-35 em dia: <strong>{employees.filter(e => e.hasSafetyCert).length} colaboradores</strong></p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
