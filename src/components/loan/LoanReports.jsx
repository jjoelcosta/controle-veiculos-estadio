import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, BarChart2, Package, Building2, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '../ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const formatDateBR = (dateStr) => {
  if (!dateStr) return '-';
  const datePart = String(dateStr).substring(0, 10);
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

const formatMonth = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${months[parseInt(month) - 1]}/${year}`;
};

export default function LoanReports({ loans, onBack }) {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('itens');
  const [filters, setFilters] = useState({
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
    year: new Date().getFullYear()
  });

  // ── FILTRA EMPRÉSTIMOS POR PERÍODO ──
  const getFilteredLoans = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59);
    return loans.filter(l => {
      const d = new Date(String(l.loanDate).substring(0, 10));
      return d >= start && d <= end;
    });
  };

  const filtered = getFilteredLoans();

  // ── STATS GERAIS ──
  const stats = {
    total: filtered.length,
    devolvidos: filtered.filter(l => l.status === 'devolvido').length,
    emprestados: filtered.filter(l => l.status === 'emprestado').length,
    perdidos: filtered.filter(l => l.status === 'perdido_danificado').length,
    atrasados: filtered.filter(l => l.status === 'atrasado').length,
  };

  // ── ITENS MAIS EMPRESTADOS ──
  const getTopItems = () => {
    const itemMap = {};
    filtered.forEach(loan => {
      loan.items.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = {
            name: item.name,
            category: item.category,
            totalEmprestimos: 0,
            totalQuantidade: 0
          };
        }
        itemMap[item.name].totalEmprestimos++;
        itemMap[item.name].totalQuantidade += item.quantityBorrowed || 0;
      });
    });
    return Object.values(itemMap).sort((a, b) => b.totalQuantidade - a.totalQuantidade);
  };

  // ── EMPRESAS QUE MAIS PEGAM ──
  const getTopCompanies = () => {
    const companyMap = {};
    filtered.forEach(loan => {
      const key = loan.company;
      if (!companyMap[key]) {
        companyMap[key] = {
          company: key,
          totalEmprestimos: 0,
          devolvidos: 0,
          perdidos: 0,
          itensTotal: 0
        };
      }
      companyMap[key].totalEmprestimos++;
      if (loan.status === 'devolvido') companyMap[key].devolvidos++;
      if (loan.status === 'perdido_danificado') companyMap[key].perdidos++;
      loan.items.forEach(i => { companyMap[key].itensTotal += i.quantityBorrowed || 0; });
    });
    return Object.values(companyMap).sort((a, b) => b.totalEmprestimos - a.totalEmprestimos);
  };

  // ── TEMPO MÉDIO DE EMPRÉSTIMO ──
  const getAvgDuration = () => {
    const concluded = filtered.filter(l =>
      l.actualReturnDate && l.loanDate
    );
    const byCompany = {};
    concluded.forEach(loan => {
      const start = new Date(String(loan.loanDate).substring(0, 10));
      const end = new Date(String(loan.actualReturnDate).substring(0, 10));
      const days = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      const key = loan.company;
      if (!byCompany[key]) byCompany[key] = { company: key, totalDays: 0, count: 0 };
      byCompany[key].totalDays += days;
      byCompany[key].count++;
    });
    return Object.values(byCompany)
      .map(c => ({ ...c, avgDays: Math.round(c.totalDays / c.count) }))
      .sort((a, b) => b.avgDays - a.avgDays);
  };

  // ── EMPRÉSTIMOS POR MÊS ──
  const getMonthly = () => {
    const monthly = {};
    filtered.forEach(loan => {
      const month = String(loan.loanDate).substring(0, 7);
      if (!month) return;
      if (!monthly[month]) monthly[month] = { month, total: 0, devolvidos: 0, perdidos: 0 };
      monthly[month].total++;
      if (loan.status === 'devolvido') monthly[month].devolvidos++;
      if (loan.status === 'perdido_danificado') monthly[month].perdidos++;
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  };

  const topItems = getTopItems();
  const topCompanies = getTopCompanies();
  const avgDuration = getAvgDuration();
  const monthly = getMonthly();

  // ── GERAR PDF ──
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPos = 20;

      const addHeader = (title) => {
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(202, 138, 4);
        doc.text('ARENA BRB', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        doc.setFontSize(13);
        doc.setTextColor(80, 80, 80);
        doc.text(title, pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;
        doc.setFontSize(9);
        doc.text(`Período: ${formatDateBR(filters.startDate)} a ${formatDateBR(filters.endDate)}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        doc.setDrawColor(202, 138, 4);
        doc.setLineWidth(1);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 12;
      };

      // PÁG 1: RESUMO
      addHeader('RELATÓRIO DE EMPRÉSTIMOS DE ACERVO');
      autoTable(doc, {
        startY: yPos,
        head: [['Indicador', 'Valor']],
        body: [
          ['Total de Empréstimos', stats.total.toString()],
          ['Devolvidos', stats.devolvidos.toString()],
          ['Em Aberto', stats.emprestados.toString()],
          ['Atrasados', stats.atrasados.toString()],
          ['Perdidos/Danificados', stats.perdidos.toString()],
          ['Taxa de Devolução', stats.total > 0 ? `${Math.round((stats.devolvidos / stats.total) * 100)}%` : '0%'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [202, 138, 4] },
        styles: { fontSize: 10 },
        margin: { left: margin, right: margin }
      });

      // PÁG 2: ITENS MAIS EMPRESTADOS
      doc.addPage(); yPos = 20;
      addHeader('ITENS MAIS EMPRESTADOS');
      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Categoria', 'Ocorrências', 'Qtd Total']],
        body: topItems.map(i => [i.name, i.category || '-', i.totalEmprestimos.toString(), i.totalQuantidade.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [202, 138, 4] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      // PÁG 3: EMPRESAS
      doc.addPage(); yPos = 20;
      addHeader('EMPRESAS QUE MAIS PEGAM EMPRESTADO');
      autoTable(doc, {
        startY: yPos,
        head: [['Empresa', 'Empréstimos', 'Devolvidos', 'Perdidos', 'Itens Total']],
        body: topCompanies.map(c => [c.company, c.totalEmprestimos.toString(), c.devolvidos.toString(), c.perdidos.toString(), c.itensTotal.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [202, 138, 4] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      // PÁG 4: TEMPO MÉDIO
      doc.addPage(); yPos = 20;
      addHeader('TEMPO MÉDIO DE EMPRÉSTIMO POR EMPRESA');
      autoTable(doc, {
        startY: yPos,
        head: [['Empresa', 'Empréstimos Concluídos', 'Média de Dias']],
        body: avgDuration.map(c => [c.company, c.count.toString(), `${c.avgDays} dia(s)`]),
        theme: 'striped',
        headStyles: { fillColor: [202, 138, 4] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      // PÁG 5: MENSAL
      doc.addPage(); yPos = 20;
      addHeader('EMPRÉSTIMOS POR MÊS');
      autoTable(doc, {
        startY: yPos,
        head: [['Mês', 'Total', 'Devolvidos', 'Perdidos/Danif.']],
        body: monthly.map(m => [formatMonth(m.month), m.total.toString(), m.devolvidos.toString(), m.perdidos.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [202, 138, 4] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      // RODAPÉ
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${totalPages} | Gerado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
          pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' }
        );
      }

      doc.save(`Relatorio_Emprestimos_Arena_BRB_${filters.year}.pdf`);
      success('✅ PDF gerado!');
    } catch (err) {
      console.error(err);
      showError('❌ Erro ao gerar PDF');
    }
  };

  // ── GERAR EXCEL ──
  const generateExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // ABA RESUMO
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['RELATÓRIO DE EMPRÉSTIMOS - ARENA BRB'],
        [`Período: ${formatDateBR(filters.startDate)} a ${formatDateBR(filters.endDate)}`],
        [],
        ['Indicador', 'Valor'],
        ['Total de Empréstimos', stats.total],
        ['Devolvidos', stats.devolvidos],
        ['Em Aberto', stats.emprestados],
        ['Atrasados', stats.atrasados],
        ['Perdidos/Danificados', stats.perdidos],
        ['Taxa de Devolução', stats.total > 0 ? `${Math.round((stats.devolvidos / stats.total) * 100)}%` : '0%'],
      ]), 'Resumo');

      // ABA ITENS
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Item', 'Categoria', 'Ocorrências', 'Qtd Total'],
        ...topItems.map(i => [i.name, i.category || '-', i.totalEmprestimos, i.totalQuantidade])
      ]), 'Itens Mais Emprestados');

      // ABA EMPRESAS
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Empresa', 'Total Empréstimos', 'Devolvidos', 'Perdidos', 'Itens Total'],
        ...topCompanies.map(c => [c.company, c.totalEmprestimos, c.devolvidos, c.perdidos, c.itensTotal])
      ]), 'Empresas');

      // ABA TEMPO MÉDIO
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Empresa', 'Empréstimos Concluídos', 'Média de Dias'],
        ...avgDuration.map(c => [c.company, c.count, c.avgDays])
      ]), 'Tempo Médio');

      // ABA MENSAL
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Mês', 'Total', 'Devolvidos', 'Perdidos/Danif.'],
        ...monthly.map(m => [formatMonth(m.month), m.total, m.devolvidos, m.perdidos])
      ]), 'Por Mês');

      // ABA DETALHADO
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Empresa', 'Responsável', 'Local', 'Data Retirada', 'Previsão Devolução', 'Devolução Real', 'Status', 'Itens'],
        ...filtered.map(l => [
          l.company,
          l.requesterName,
          l.location,
          formatDateBR(l.loanDate),
          formatDateBR(l.expectedReturnDate),
          formatDateBR(l.actualReturnDate),
          l.status,
          l.items.map(i => `${i.name}(${i.quantityBorrowed}x)`).join(', ')
        ])
      ]), 'Detalhado');

      XLSX.writeFile(wb, `Emprestimos_Arena_BRB_${filters.year}.xlsx`);
      success('✅ Excel gerado!');
    } catch (err) {
      console.error(err);
      showError('❌ Erro ao gerar Excel');
    }
  };

  const tabs = [
    { id: 'itens', label: 'Itens', short: 'Itens', icon: Package },
    { id: 'empresas', label: 'Empresas', short: 'Empresas', icon: Building2 },
    { id: 'tempo', label: 'Tempo Médio', short: 'Tempo', icon: Clock },
    { id: 'mensal', label: 'Por Mês', short: 'Mês', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6">
            <button onClick={onBack} className="flex items-center gap-2 text-yellow-100 hover:text-white mb-4">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart2 size={26} /> Relatórios de Empréstimos
                </h1>
                <p className="text-yellow-100 mt-1">Análise do acervo da Arena BRB</p>
              </div>
              <div className="flex gap-2">
                <button onClick={generatePDF}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-md text-sm">
                  <FileText size={16} /> PDF
                </button>
                <button onClick={generateExcel}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-md text-sm">
                  <Download size={16} /> Excel
                </button>
              </div>
            </div>
          </div>

          {/* FILTROS */}
          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Data Inicial</label>
                <input type="date" value={filters.startDate}
                  onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Data Final</label>
                <input type="date" value={filters.endDate}
                  onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ano de Referência</label>
                <input type="number" value={filters.year} min="2020" max="2030"
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    setFilters({ year, startDate: `${year}-01-01`, endDate: `${year}-12-31` });
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
              { label: 'Devolvidos', value: stats.devolvidos, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
              { label: 'Em Aberto', value: stats.emprestados, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
              { label: 'Atrasados', value: stats.atrasados, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
              { label: 'Perdidos/Danif.', value: stats.perdidos, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200 col-span-2 lg:col-span-1' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 text-center border ${s.bg}`}>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS + CONTEÚDO */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 flex-1 sm:flex-initial justify-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4">

            {/* ITENS MAIS EMPRESTADOS */}
            {activeTab === 'itens' && (
              <div className="overflow-x-auto">
                {topItems.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Nenhum dado no período</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Item</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Categoria</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Ocorrências</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Qtd Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {topItems.map((item, i) => (
                        <tr key={item.name} className="hover:bg-yellow-50">
                          <td className="px-4 py-3 text-sm font-bold text-yellow-600">#{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.category || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">{item.totalEmprestimos}x</span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-800">{item.totalQuantidade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* EMPRESAS */}
            {activeTab === 'empresas' && (
              <div className="overflow-x-auto">
                {topCompanies.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Nenhum dado no período</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Empresa</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Empréstimos</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Devolvidos</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Perdidos</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Itens Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {topCompanies.map((c, i) => (
                        <tr key={c.company} className="hover:bg-yellow-50">
                          <td className="px-4 py-3 text-sm font-bold text-yellow-600">#{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                            <Building2 size={14} className="text-gray-400" />{c.company}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-800">{c.totalEmprestimos}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{c.devolvidos}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.perdidos > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{c.perdidos}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">{c.itensTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TEMPO MÉDIO */}
            {activeTab === 'tempo' && (
              <div className="overflow-x-auto">
                {avgDuration.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Nenhum empréstimo concluído no período</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Empresa</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Concluídos</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Média de Dias</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {avgDuration.map(c => (
                        <tr key={c.company} className="hover:bg-yellow-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{c.company}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{c.count}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              c.avgDays <= 7 ? 'bg-green-100 text-green-700'
                              : c.avgDays <= 30 ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}>
                              {c.avgDays} dia(s)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* POR MÊS */}
            {activeTab === 'mensal' && (
              <div className="overflow-x-auto">
                {monthly.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Nenhum dado no período</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Mês</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Total</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Devolvidos</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Perdidos/Danif.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {monthly.map(m => (
                        <tr key={m.month} className="hover:bg-yellow-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{formatMonth(m.month)}</td>
                          <td className="px-4 py-3 text-center font-bold text-gray-800">{m.total}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{m.devolvidos}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.perdidos > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{m.perdidos}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-yellow-50">
                      <tr>
                        <td className="px-4 py-3 font-bold text-yellow-800">TOTAL ANUAL</td>
                        <td className="px-4 py-3 text-center font-bold text-yellow-800">{stats.total}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-700">{stats.devolvidos}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-700">{stats.perdidos}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}