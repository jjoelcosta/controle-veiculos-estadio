import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, TrendingUp, Calendar, Users, Package, BarChart2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function EventReports({ events, team, hourBank, onBack }) {
  const { success, error: showError } = useToast();
  const [filters, setFilters] = useState({
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
    year: new Date().getFullYear()
  });
  const [activeTab, setActiveTab] = useState('resumo');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const fromDecimal = (decimal) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return { hours, minutes };
  };

  const formatHours = (decimal) => {
    const { hours, minutes } = fromDecimal(decimal);
    if (minutes === 0) return `${hours}h`;
    return `${hours}h${String(minutes).padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[parseInt(month) - 1]}/${year}`;
  };

  // ============================================
  // FILTRAR EVENTOS
  // ============================================
  const getFilteredEvents = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59);
    return events.filter(e => {
      const d = new Date(e.startDate);
      return d >= start && d <= end;
    });
  };

  // ============================================
  // ESTATÍSTICAS GERAIS
  // ============================================
  const getStats = () => {
    const filtered = getFilteredEvents();
    const totalExpenses = filtered.reduce((sum, e) => sum + (e.totalExpenses || 0), 0);
    const totalPessoal = filtered.reduce((sum, e) =>
      sum + (e.expenses?.filter(ex => ex.expenseCategory === 'pessoal')
        .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0), 0);
    const totalAluguel = filtered.reduce((sum, e) =>
      sum + (e.expenses?.filter(ex => ex.expenseCategory === 'aluguel')
        .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0), 0);
    const realizados = filtered.filter(e => e.status === 'realizado').length;
    const empresas = [...new Set(filtered.map(e => e.category))];

    return {
      totalEvents: filtered.length,
      realizados,
      totalExpenses,
      totalPessoal,
      totalAluguel,
      categorias: empresas.length
    };
  };

  // ============================================
  // GASTOS POR MÊS
  // ============================================
  const getMonthlyExpenses = () => {
    const filtered = getFilteredEvents();
    const monthly = {};
    filtered.forEach(event => {
      const month = event.startDate?.substring(0, 7);
      if (!month) return;
      if (!monthly[month]) {
        monthly[month] = { month, events: 0, totalExpenses: 0, totalPessoal: 0, totalAluguel: 0 };
      }
      monthly[month].events++;
      monthly[month].totalExpenses += event.totalExpenses || 0;
      monthly[month].totalPessoal += event.expenses?.filter(ex => ex.expenseCategory === 'pessoal')
        .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0;
      monthly[month].totalAluguel += event.expenses?.filter(ex => ex.expenseCategory === 'aluguel')
        .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0;
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  };

  // ============================================
  // GASTOS POR TIPO DE PESSOAL
  // ============================================
  const getExpensesByType = () => {
    const filtered = getFilteredEvents();
    const byType = {};
    filtered.forEach(event => {
      event.expenses?.forEach(ex => {
        if (!byType[ex.expenseType]) {
          byType[ex.expenseType] = {
            type: ex.expenseType,
            category: ex.expenseCategory,
            totalValue: 0,
            count: 0,
            totalShifts: 0,
            totalPeople: 0
          };
        }
        byType[ex.expenseType].totalValue += ex.totalValue || 0;
        byType[ex.expenseType].count++;
        byType[ex.expenseType].totalShifts += ex.shifts || 0;
        byType[ex.expenseType].totalPeople += ex.quantity || 0;
      });
    });
    return Object.values(byType).sort((a, b) => b.totalValue - a.totalValue);
  };

  // ============================================
  // BANCO DE HORAS MENSAL
  // ============================================
  const getHourBankMonthly = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const filtered = hourBank.filter(h => {
      const d = new Date(h.eventDate);
      return d >= start && d <= end;
    });

    const byEmployee = {};
    team.forEach(emp => {
      byEmployee[emp.id] = {
        name: emp.name,
        position: emp.position,
        totalHours: 0,
        months: {}
      };
    });

    filtered.forEach(h => {
      if (!byEmployee[h.employeeId]) return;
      const month = h.eventDate?.substring(0, 7);
      byEmployee[h.employeeId].totalHours += parseFloat(h.hoursWorked) || 0;
      if (!byEmployee[h.employeeId].months[month]) {
        byEmployee[h.employeeId].months[month] = 0;
      }
      byEmployee[h.employeeId].months[month] += parseFloat(h.hoursWorked) || 0;
    });

    return Object.values(byEmployee).filter(e => e.totalHours > 0)
      .sort((a, b) => b.totalHours - a.totalHours);
  };

  const stats = getStats();
  const monthlyExpenses = getMonthlyExpenses();
  const expensesByType = getExpensesByType();
  const hourBankMonthly = getHourBankMonthly();

  // ============================================
  // GERAR PDF
  // ============================================
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPos = 20;

      const addHeader = (title, color = [0, 153, 76]) => {
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...color);
        doc.text('ARENA BRB', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        doc.setFontSize(14);
        doc.setTextColor(80, 80, 80);
        doc.text(title, pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;
        doc.setFontSize(10);
        doc.text(
          `Período: ${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}`,
          pageWidth / 2, yPos, { align: 'center' }
        );
        yPos += 10;
        doc.setDrawColor(...color);
        doc.setLineWidth(1);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 12;
      };

      // PÁGINA 1: RESUMO EXECUTIVO
      addHeader('RELATÓRIO DE GASTOS COM PESSOAL');

      autoTable(doc, {
        startY: yPos,
        head: [['Indicador', 'Valor']],
        body: [
          ['Total de Eventos', stats.totalEvents.toString()],
          ['Eventos Realizados', stats.realizados.toString()],
          ['Total Gasto com Pessoal', formatCurrency(stats.totalPessoal)],
          ['Total Gasto com Aluguéis', formatCurrency(stats.totalAluguel)],
          ['TOTAL GERAL', formatCurrency(stats.totalExpenses)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 153, 76] },
        bodyStyles: { fontSize: 10 },
        margin: { left: margin, right: margin }
      });

      // PÁGINA 2: GASTOS MENSAIS
      doc.addPage();
      yPos = 20;
      addHeader('GASTOS MENSAIS');

      autoTable(doc, {
        startY: yPos,
        head: [['Mês', 'Eventos', 'Pessoal', 'Aluguel', 'Total']],
        body: monthlyExpenses.map(m => [
          formatMonth(m.month),
          m.events.toString(),
          formatCurrency(m.totalPessoal),
          formatCurrency(m.totalAluguel),
          formatCurrency(m.totalExpenses)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 153, 76] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      // PÁGINA 3: GASTOS POR TIPO
      doc.addPage();
      yPos = 20;
      addHeader('GASTOS POR TIPO DE PESSOAL/ALUGUEL');

      autoTable(doc, {
        startY: yPos,
        head: [['Tipo', 'Categoria', 'Ocorrências', 'Total']],
        body: expensesByType.map(t => [
          t.type,
          t.category === 'pessoal' ? 'Pessoal' : 'Aluguel',
          t.count.toString(),
          formatCurrency(t.totalValue)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 153, 76] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      // PÁGINA 4: DETALHAMENTO POR EVENTO
      doc.addPage();
      yPos = 20;
      addHeader('DETALHAMENTO POR EVENTO');

      autoTable(doc, {
        startY: yPos,
        head: [['Evento', 'Categoria', 'Data', 'Status', 'Total']],
        body: getFilteredEvents().map(e => [
          e.name,
          e.category,
          formatDate(e.startDate),
          e.status,
          formatCurrency(e.totalExpenses)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 153, 76] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin }
      });

      // PÁGINA 5: BANCO DE HORAS
      if (hourBankMonthly.length > 0) {
        doc.addPage();
        yPos = 20;
        addHeader('BANCO DE HORAS - EQUIPE', [37, 99, 235]);

        autoTable(doc, {
          startY: yPos,
          head: [['Funcionário', 'Cargo', 'Total de Horas']],
          body: hourBankMonthly.map(e => [
            e.name,
            e.position,
            `${e.totalHours}h`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235] },
          styles: { fontSize: 9 },
          margin: { left: margin, right: margin }
        });
      }

      // Rodapé em todas as páginas
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${totalPages} | Gerado em ${new Date().toLocaleString('pt-BR')}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(`Relatorio_Gastos_Arena_BRB_${filters.year}.pdf`);
      success('✅ Relatório PDF gerado!');
    } catch (err) {
      console.error(err);
      showError('❌ Erro ao gerar PDF');
    }
  };

  // ============================================
  // GERAR EXCEL
  // ============================================
  const generateExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // ABA 1: RESUMO
      const wsResumo = XLSX.utils.aoa_to_sheet([
        ['RELATÓRIO DE GASTOS - ARENA BRB'],
        [`Período: ${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}`],
        [],
        ['RESUMO EXECUTIVO'],
        ['Indicador', 'Valor'],
        ['Total de Eventos', stats.totalEvents],
        ['Eventos Realizados', stats.realizados],
        ['Total Pessoal', stats.totalPessoal],
        ['Total Aluguel', stats.totalAluguel],
        ['TOTAL GERAL', stats.totalExpenses]
      ]);
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

      // ABA 2: GASTOS MENSAIS
      const wsMonthly = XLSX.utils.aoa_to_sheet([
        ['Mês', 'Eventos', 'Pessoal (R$)', 'Aluguel (R$)', 'Total (R$)'],
        ...monthlyExpenses.map(m => [
          formatMonth(m.month),
          m.events,
          m.totalPessoal,
          m.totalAluguel,
          m.totalExpenses
        ])
      ]);
      XLSX.utils.book_append_sheet(wb, wsMonthly, 'Gastos Mensais');

      // ABA 3: POR TIPO
      const wsByType = XLSX.utils.aoa_to_sheet([
        ['Tipo', 'Categoria', 'Ocorrências', 'Total Plantões', 'Total Pessoas', 'Total (R$)'],
        ...expensesByType.map(t => [
          t.type,
          t.category === 'pessoal' ? 'Pessoal' : 'Aluguel',
          t.count,
          t.totalShifts,
          t.totalPeople,
          t.totalValue
        ])
      ]);
      XLSX.utils.book_append_sheet(wb, wsByType, 'Por Tipo');

      // ABA 4: EVENTOS
      const wsEvents = XLSX.utils.aoa_to_sheet([
        ['Evento', 'Categoria', 'Data Início', 'Data Fim', 'Status', 'Pessoal (R$)', 'Aluguel (R$)', 'Total (R$)'],
        ...getFilteredEvents().map(e => [
          e.name,
          e.category,
          formatDate(e.startDate),
          formatDate(e.endDate),
          e.status,
          e.expenses?.filter(ex => ex.expenseCategory === 'pessoal')
            .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0,
          e.expenses?.filter(ex => ex.expenseCategory === 'aluguel')
            .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0,
          e.totalExpenses || 0
        ])
      ]);
      XLSX.utils.book_append_sheet(wb, wsEvents, 'Eventos');

      // ABA 5: BANCO DE HORAS
      const wsHours = XLSX.utils.aoa_to_sheet([
        ['Funcionário', 'Cargo', 'Total de Horas'],
        ...hourBankMonthly.map(e => [e.name, e.position, e.totalHours])
      ]);
      XLSX.utils.book_append_sheet(wb, wsHours, 'Banco de Horas');

      // ABA 6: DETALHAMENTO BANCO DE HORAS
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const filteredHours = hourBank.filter(h => {
        const d = new Date(h.eventDate);
        return d >= start && d <= end;
      });

      const wsHoursDetail = XLSX.utils.aoa_to_sheet([
        ['Funcionário', 'Cargo', 'Data', 'Evento', 'Horas', 'Observações'],
        ...filteredHours.map(h => [
          h.employeeName,
          h.employeePosition,
          formatDate(h.eventDate),
          h.eventName || '-',
          h.hoursWorked,
          h.notes || '-'
        ])
      ]);
      XLSX.utils.book_append_sheet(wb, wsHoursDetail, 'Horas Detalhado');

      XLSX.writeFile(wb, `Gastos_Arena_BRB_${filters.year}.xlsx`);
      success('✅ Excel gerado!');
    } catch (err) {
      console.error(err);
      showError('❌ Erro ao gerar Excel');
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-6">
            <button onClick={onBack} className="flex items-center gap-2 text-emerald-200 hover:text-white mb-4">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart2 size={28} /> Relatórios de Gastos
                </h1>
                <p className="text-emerald-200 mt-1">Análise completa de gastos e banco de horas</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={generatePDF}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md"
                >
                  <FileText size={18} /> PDF
                </button>
                <button
                  onClick={generateExcel}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md"
                >
                  <Download size={18} /> Excel
                </button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Data Final</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ano de Referência</label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    setFilters({
                      year,
                      startDate: `${year}-01-01`,
                      endDate: `${year}-12-31`
                    });
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                  min="2020" max="2030"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
              <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                <div className="text-xl sm:text-2xl font-bold text-emerald-700">{stats.totalEvents}</div>
                <div className="text-xs text-gray-600">Eventos</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
                <div className="text-sm sm:text-lg font-bold text-blue-700 truncate">{formatCurrency(stats.totalPessoal)}</div>
                <div className="text-xs text-gray-600">Pessoal</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-200">
                <div className="text-sm sm:text-lg font-bold text-orange-600 truncate">{formatCurrency(stats.totalAluguel)}</div>
                <div className="text-xs text-gray-600">Aluguéis</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center border border-red-200 col-span-2 lg:col-span-1">
                <div className="text-sm sm:text-lg font-bold text-red-700 truncate">{formatCurrency(stats.totalExpenses)}</div>
                <div className="text-xs text-gray-600">Total Geral</div>
              </div>
            </div>
          </div>

        {/* TABS */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'resumo', label: 'Por Evento', icon: Calendar },
              { id: 'mensal', label: 'Por Mês', icon: TrendingUp },
              { id: 'tipo', label: 'Por Tipo', icon: Package },
              { id: 'horas', label: 'Banco de Horas', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4">

            {/* TAB: POR EVENTO */}
            {activeTab === 'resumo' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Evento</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Categoria</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Data</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Pessoal</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Aluguel</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getFilteredEvents().map(e => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{e.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{e.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(e.startDate)}</td>
                        <td className="px-4 py-3 text-right text-sm text-emerald-700">
                          {formatCurrency(e.expenses?.filter(ex => ex.expenseCategory === 'pessoal')
                            .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-orange-600">
                          {formatCurrency(e.expenses?.filter(ex => ex.expenseCategory === 'aluguel')
                            .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                          {formatCurrency(e.totalExpenses)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-emerald-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 font-bold text-emerald-800">TOTAL</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-800">{formatCurrency(stats.totalPessoal)}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-700">{formatCurrency(stats.totalAluguel)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TAB: POR MÊS */}
            {activeTab === 'mensal' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Mês</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Eventos</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Pessoal</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Aluguel</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monthlyExpenses.map(m => (
                      <tr key={m.month} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{formatMonth(m.month)}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{m.events}</td>
                        <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(m.totalPessoal)}</td>
                        <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(m.totalAluguel)}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(m.totalExpenses)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-emerald-50">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 font-bold text-emerald-800">TOTAL ANUAL</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-800">{formatCurrency(stats.totalPessoal)}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-700">{formatCurrency(stats.totalAluguel)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TAB: POR TIPO */}
            {activeTab === 'tipo' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Categoria</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Ocorrências</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Total Plantões</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Total Pessoas</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Total Gasto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expensesByType.map(t => (
                      <tr key={t.type} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{t.type}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            t.category === 'pessoal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {t.category === 'pessoal' ? 'Pessoal' : 'Aluguel'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">{t.count}</td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {t.category === 'pessoal' ? t.totalShifts : '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {t.category === 'pessoal' ? t.totalPeople : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                          {formatCurrency(t.totalValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: BANCO DE HORAS */}
            {activeTab === 'horas' && (
              <div className="space-y-4">
                {hourBankMonthly.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Users size={40} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhum registro de horas no período</p>
                  </div>
                ) : (
                  hourBankMonthly.map(emp => {
                    const months = Object.entries(emp.months)
                      .sort((a, b) => a[0].localeCompare(b[0]));
                    return (
                      <div key={emp.name} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between bg-blue-50 px-4 py-3">
                          <div>
                            <div className="font-bold text-gray-800">{emp.name}</div>
                            <div className="text-sm text-gray-500">{emp.position}</div>
                          </div>
                          <div className="text-2xl font-bold text-blue-700">{formatHours(emp.totalHours)}</div>
                        </div>
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Mês</th>
                              <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Horas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {months.map(([month, hours]) => (
                              <tr key={month} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-700">{formatMonth(month)}</td>
                                <td className="px-4 py-2 text-right font-medium text-blue-700">{formatHours(hours)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}