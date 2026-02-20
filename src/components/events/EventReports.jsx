import React, { useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft, FileText, Download, TrendingUp,
  Calendar, Users, Package, BarChart2, Sun
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────
// Helpers puros (fora do componente = não recriam a cada render)
// ─────────────────────────────────────────────
const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

function parseDate(str) {
  return new Date(str + 'T00:00:00');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(value || 0);
}

function formatHours(decimal) {
  const rounded = Math.round(decimal * 100) / 100;
  const hours   = Math.floor(rounded);
  const minutes = Math.round((rounded - hours) * 60);
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`;
}

function formatDate(date) {
  if (!date) return '-';
  return parseDate(date).toLocaleDateString('pt-BR');
}

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  return `${MONTH_NAMES[parseInt(month) - 1]}/${year}`;
}

function getExpenseMonth(expense, eventStartDate) {
  const date = expense.expenseDate || eventStartDate;
  return date ? date.substring(0, 7) : null;
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────
export default function EventReports({ events, team, hourBank, vacations = [], onBack }) {
  const { success, error: showError } = useToast();

  const [filters, setFilters] = useState(() => {
    const year = new Date().getFullYear();
    return { startDate: `${year}-01-01`, endDate: `${year}-12-31`, year };
  });

  const [activeTab,    setActiveTab]    = useState('resumo');
  const [isGenerating, setIsGenerating] = useState(null); // 'pdf' | 'excel' | null

  // ─── Validação de filtro ──────────────────────
  const filtersAreValid = useMemo(
    () => filters.startDate <= filters.endDate,
    [filters.startDate, filters.endDate]
  );

  // ─────────────────────────────────────────────
  // 1. EVENTOS FILTRADOS
  // ─────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    const start = parseDate(filters.startDate);
    const end   = parseDate(filters.endDate);
    end.setHours(23, 59, 59);
    return events.filter(e => {
      if (!e.startDate) return false;
      const d = parseDate(e.startDate);
      return d >= start && d <= end;
    });
  }, [events, filters.startDate, filters.endDate]);

  // ─────────────────────────────────────────────
  // 2. VIEW-MODEL: totais pré-calculados por evento
  // ─────────────────────────────────────────────
  const eventTotals = useMemo(() => {
    const map = {};
    filteredEvents.forEach(e => {
      let pessoal = 0, aluguel = 0;
      (e.expenses || []).forEach(ex => {
        const v = ex.totalValue || 0;
        if      (ex.expenseCategory === 'pessoal') pessoal += v;
        else if (ex.expenseCategory === 'aluguel') aluguel += v;
      });
      map[e.id] = { pessoal, aluguel };
    });
    return map;
  }, [filteredEvents]);

  // ─────────────────────────────────────────────
  // 3. ESTATÍSTICAS GERAIS
  // ─────────────────────────────────────────────
   const stats = useMemo(() => {
    const totalPessoal  = filteredEvents.reduce((s, e) => s + (eventTotals[e.id]?.pessoal || 0), 0);
    const totalAluguel  = filteredEvents.reduce((s, e) => s + (eventTotals[e.id]?.aluguel || 0), 0);
    const totalExpenses = filteredEvents.reduce((s, e) => s + (e.totalExpenses || 0), 0);
    const realizados    = filteredEvents.filter(e => e.status === 'realizado').length;
    // Férias é calculado depois em vacationStats, mas precisamos do valor aqui para o total
    // Usamos 0 de placeholder e atualizamos no render
    return { totalEvents: filteredEvents.length, realizados, totalExpenses, totalPessoal, totalAluguel };
  }, [filteredEvents, eventTotals]);

  // ─────────────────────────────────────────────
  // 4. GASTOS POR MÊS
  // ─────────────────────────────────────────────
  const monthlyExpenses = useMemo(() => {
    const monthly = {};

    filteredEvents.forEach(event => {
      const expenses = event.expenses || [];

      if (expenses.length === 0) {
        const month = event.startDate?.substring(0, 7);
        if (!month) return;
        if (!monthly[month]) {
          monthly[month] = { month, events: new Set(), totalExpenses: 0, totalPessoal: 0, totalAluguel: 0 };
        }
        monthly[month].events.add(event.id);
        return;
      }

      expenses.forEach(ex => {
        const month = getExpenseMonth(ex, event.startDate);
        if (!month) return;

        if (!monthly[month]) {
          monthly[month] = { month, events: new Set(), totalExpenses: 0, totalPessoal: 0, totalAluguel: 0 };
        }
        monthly[month].events.add(event.id);
        monthly[month].totalExpenses += ex.totalValue || 0;

        if      (ex.expenseCategory === 'pessoal') monthly[month].totalPessoal += ex.totalValue || 0;
        else if (ex.expenseCategory === 'aluguel') monthly[month].totalAluguel += ex.totalValue || 0;
      });
    });

    return Object.values(monthly)
      .map(m => ({ ...m, eventCount: m.events.size }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredEvents]);

  // ─────────────────────────────────────────────
  // 5. GASTOS POR TIPO
  // ─────────────────────────────────────────────
  const expensesByType = useMemo(() => {
    const byType = {};
    filteredEvents.forEach(event => {
      (event.expenses || []).forEach(ex => {
        const key = ex.expenseType?.trim() || '(sem tipo)';
        if (!byType[key]) {
          byType[key] = { type: key, category: ex.expenseCategory, totalValue: 0, count: 0, totalShifts: 0, totalPeople: 0 };
        }
        byType[key].totalValue += ex.totalValue || 0;
        byType[key].count++;
        if (ex.expenseCategory === 'pessoal') {
          byType[key].totalShifts += ex.shifts   || 0;
          byType[key].totalPeople += ex.quantity || 0;
        }
      });
    });
    return Object.values(byType).sort((a, b) => b.totalValue - a.totalValue);
  }, [filteredEvents]);

  // ─────────────────────────────────────────────
  // 6. GASTOS POR TIPO POR MÊS
  // ─────────────────────────────────────────────
  const expensesByTypeByMonth = useMemo(() => {
    const data = {};
    filteredEvents.forEach(event => {
      (event.expenses || []).forEach(ex => {
        const month = getExpenseMonth(ex, event.startDate);
        if (!month) return;

        const key = ex.expenseType?.trim() || '(sem tipo)';
        if (!data[key]) data[key] = {};
        if (!data[key][month]) {
          data[key][month] = { totalValue: 0, shifts: 0, people: 0, count: 0, category: ex.expenseCategory };
        }
        data[key][month].totalValue += ex.totalValue || 0;
        data[key][month].count++;
        if (ex.expenseCategory === 'pessoal') {
          data[key][month].shifts  += ex.shifts   || 0;
          data[key][month].people  += ex.quantity || 0;
        }
      });
    });
    return data;
  }, [filteredEvents]);

  // ─────────────────────────────────────────────
  // 7. BANCO DE HORAS MENSAL
  // ─────────────────────────────────────────────
  const hourBankMonthly = useMemo(() => {
    const start = parseDate(filters.startDate);
    const end   = parseDate(filters.endDate);
    end.setHours(23, 59, 59);

    const filtered = hourBank.filter(h => {
      if (!h.eventDate) return false;
      const d = parseDate(h.eventDate);
      return d >= start && d <= end;
    });

    const byEmployee = {};
    team.forEach(emp => {
      byEmployee[emp.id] = { name: emp.name, position: emp.position, totalHours: 0, months: {} };
    });

    filtered.forEach(h => {
      if (!byEmployee[h.employeeId]) return;
      const month = h.eventDate?.substring(0, 7);
      if (!month) return;

      const hrs = parseFloat(h.hoursWorked) || 0;
      byEmployee[h.employeeId].totalHours += hrs;
      byEmployee[h.employeeId].months[month] = (byEmployee[h.employeeId].months[month] || 0) + hrs;
    });

    return Object.values(byEmployee)
      .filter(e => e.totalHours > 0)
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [hourBank, team, filters.startDate, filters.endDate]);

    // ─────────────────────────────────────────────
  // 8. GASTOS DE FÉRIAS POR MÊS
  // ─────────────────────────────────────────────
  const vacationStats = useMemo(() => {
    const start = parseDate(filters.startDate);
    const end   = parseDate(filters.endDate);
    end.setHours(23, 59, 59);

    const filtered = vacations.filter(v => {
      if (!v.startDate) return false;
      const d = parseDate(v.startDate);
      return d >= start && d <= end;
    });

    const totalValue  = filtered.reduce((s, v) => s + (v.totalValue || 0), 0);
    const totalDays   = filtered.reduce((s, v) => s + (v.totalDays  || 0), 0);
    const totalCovers = filtered.length;

    const byMonth = {};
        filtered.forEach(v => {
      // Usa mês de pagamento se definido, senão usa mês da cobertura
      const month = v.paymentMonth || v.startDate?.substring(0, 7);
      if (!month) return;
      if (!byMonth[month]) byMonth[month] = { month, totalValue: 0, totalDays: 0, count: 0 };
      byMonth[month].totalValue += v.totalValue || 0;
      byMonth[month].totalDays  += v.totalDays  || 0;
      byMonth[month].count++;
    });

    return {
      filtered,
      totalValue,
      totalDays,
      totalCovers,
      byMonth: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)),
    };
  }, [vacations, filters.startDate, filters.endDate]);

  // ─────────────────────────────────────────────
  // 9. GERAR PDF
  // ─────────────────────────────────────────────
  const generatePDF = useCallback(async () => {
    if (!filtersAreValid) { showError('❌ Data inicial maior que a final'); return; }
    setIsGenerating('pdf');
    try {
      const doc       = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin    = 20;
      let yPos        = 20;

      const addHeader = (title, color = [0, 153, 76]) => {
        doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(...color);
        doc.text('ARENA BRB 360', pageWidth / 2, yPos, { align: 'center' }); yPos += 8;
        doc.setFontSize(14); doc.setTextColor(80, 80, 80);
        doc.text(title, pageWidth / 2, yPos, { align: 'center' }); yPos += 6;
        doc.setFontSize(10);
        doc.text(
          `Período: ${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}`,
          pageWidth / 2, yPos, { align: 'center' }
        );
        yPos += 10;
        doc.setDrawColor(...color); doc.setLineWidth(1);
        doc.line(margin, yPos, pageWidth - margin, yPos); yPos += 12;
      };

      // Página 1 – Resumo
      addHeader('RELATÓRIO DE GASTOS COM PESSOAL');
      autoTable(doc, {
        startY: yPos,
        head: [['Indicador', 'Valor']],
        body: [
          ['Total de Eventos',        stats.totalEvents.toString()],
          ['Eventos Realizados',       stats.realizados.toString()],
          ['Total Gasto com Pessoal',  formatCurrency(stats.totalPessoal)],
          ['Total Gasto com Aluguéis', formatCurrency(stats.totalAluguel)],
          ['TOTAL GERAL',              formatCurrency(stats.totalExpenses)],
        ],
        theme: 'grid', headStyles: { fillColor: [0, 153, 76] },
        bodyStyles: { fontSize: 10 }, margin: { left: margin, right: margin },
      });

      // Página 2 – Gastos mensais
      doc.addPage(); yPos = 20; addHeader('GASTOS MENSAIS');
      autoTable(doc, {
        startY: yPos,
        head: [['Mês', 'Eventos', 'Pessoal', 'Aluguel', 'Total']],
        body: monthlyExpenses.map(m => [
          formatMonth(m.month), m.eventCount.toString(),
          formatCurrency(m.totalPessoal), formatCurrency(m.totalAluguel), formatCurrency(m.totalExpenses),
        ]),
        theme: 'striped', headStyles: { fillColor: [0, 153, 76] },
        styles: { fontSize: 9 }, margin: { left: margin, right: margin },
      });

      // Página 3 – Por tipo
      doc.addPage(); yPos = 20; addHeader('GASTOS POR TIPO');
      autoTable(doc, {
        startY: yPos,
        head: [['Tipo', 'Categoria', 'Registros', 'Plantões', 'Pessoas', 'Total']],
        body: expensesByType.map(t => [
          t.type,
          t.category === 'pessoal' ? 'Pessoal' : 'Aluguel',
          t.count.toString(),
          t.category === 'pessoal' ? t.totalShifts.toString() : '-',
          t.category === 'pessoal' ? t.totalPeople.toString() : '-',
          formatCurrency(t.totalValue),
        ]),
        theme: 'striped', headStyles: { fillColor: [0, 153, 76] },
        styles: { fontSize: 9 }, margin: { left: margin, right: margin },
      });

      // Página 4 – Por evento
      doc.addPage(); yPos = 20; addHeader('DETALHAMENTO POR EVENTO');
      autoTable(doc, {
        startY: yPos,
        head: [['Evento', 'Categoria', 'Data', 'Status', 'Pessoal', 'Aluguel', 'Total']],
        body: filteredEvents.map(e => [
          e.name, e.category, formatDate(e.startDate), e.status,
          formatCurrency(eventTotals[e.id]?.pessoal || 0),
          formatCurrency(eventTotals[e.id]?.aluguel || 0),
          formatCurrency(e.totalExpenses),
        ]),
        theme: 'striped', headStyles: { fillColor: [0, 153, 76] },
        styles: { fontSize: 8 }, margin: { left: margin, right: margin },
      });

      // Página 5 – Banco de horas
      if (hourBankMonthly.length > 0) {
        doc.addPage(); yPos = 20; addHeader('BANCO DE HORAS - EQUIPE', [37, 99, 235]);
        autoTable(doc, {
          startY: yPos,
          head: [['Funcionário', 'Cargo', 'Total de Horas']],
          body: hourBankMonthly.map(e => [e.name, e.position, formatHours(e.totalHours)]),
          theme: 'striped', headStyles: { fillColor: [37, 99, 235] },
          styles: { fontSize: 9 }, margin: { left: margin, right: margin },
        });
      }

      // Rodapé em todas as páginas
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${totalPages} | Gerado em ${new Date().toLocaleString('pt-BR')}`,
          pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' }
        );
      }

      doc.save(`Relatorio_Gastos_Arena_BRB_${filters.year}.pdf`);
      success('✅ Relatório PDF gerado!');
    } catch (err) {
      console.error(err);
      showError('❌ Erro ao gerar PDF');
    } finally {
      setIsGenerating(null);
    }
  }, [filteredEvents, eventTotals, stats, monthlyExpenses, expensesByType, hourBankMonthly, filters, filtersAreValid, success, showError]);

  // ─────────────────────────────────────────────
  // 10. GERAR EXCEL
  // ─────────────────────────────────────────────
  const generateExcel = useCallback(async () => {
    if (!filtersAreValid) { showError('❌ Data inicial maior que a final'); return; }
    setIsGenerating('excel');
    try {
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['RELATÓRIO DE GASTOS - ARENA BRB 360'],
        [`Período: ${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}`],
        [],
        ['RESUMO EXECUTIVO'],
        ['Indicador',          'Valor'],
        ['Total de Eventos',   stats.totalEvents],
        ['Eventos Realizados', stats.realizados],
        ['Total Pessoal',      stats.totalPessoal],
        ['Total Aluguel',      stats.totalAluguel],
        ['TOTAL GERAL',        stats.totalExpenses],
      ]), 'Resumo');

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Mês', 'Eventos', 'Pessoal (R$)', 'Aluguel (R$)', 'Total (R$)'],
        ...monthlyExpenses.map(m => [formatMonth(m.month), m.eventCount, m.totalPessoal, m.totalAluguel, m.totalExpenses]),
      ]), 'Gastos Mensais');

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Tipo', 'Categoria', 'Registros', 'Total Plantões', 'Total Pessoas', 'Total (R$)'],
        ...expensesByType.map(t => [
          t.type,
          t.category === 'pessoal' ? 'Pessoal' : 'Aluguel',
          t.count,
          t.category === 'pessoal' ? t.totalShifts : '-',
          t.category === 'pessoal' ? t.totalPeople : '-',
          t.totalValue,
        ]),
      ]), 'Por Tipo');

      const typeMonthRows = [['Tipo', 'Mês', 'Registros', 'Plantões', 'Pessoas', 'Total (R$)']];
      Object.entries(expensesByTypeByMonth).forEach(([type, months]) => {
        Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).forEach(([month, data]) => {
          typeMonthRows.push([
            type, formatMonth(month), data.count,
            data.category === 'pessoal' ? data.shifts  : '-',
            data.category === 'pessoal' ? data.people  : '-',
            data.totalValue,
          ]);
        });
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(typeMonthRows), 'Tipo por Mês');

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Evento', 'Categoria', 'Data Início', 'Data Fim', 'Status', 'Pessoal (R$)', 'Aluguel (R$)', 'Total (R$)'],
        ...filteredEvents.map(e => [
          e.name, e.category, formatDate(e.startDate), formatDate(e.endDate), e.status,
          eventTotals[e.id]?.pessoal || 0,
          eventTotals[e.id]?.aluguel || 0,
          e.totalExpenses || 0,
        ]),
      ]), 'Eventos');

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Funcionário', 'Cargo', 'Total de Horas'],
        ...hourBankMonthly.map(e => [e.name, e.position, formatHours(e.totalHours)]),
      ]), 'Banco de Horas');

      const start = parseDate(filters.startDate);
      const end   = parseDate(filters.endDate);
      end.setHours(23, 59, 59);
      const filteredHours = hourBank.filter(h => {
        if (!h.eventDate) return false;
        const d = parseDate(h.eventDate);
        return d >= start && d <= end;
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Funcionário', 'Cargo', 'Data', 'Evento', 'Horas', 'Observações'],
        ...filteredHours.map(h => [
          h.employeeName, h.employeePosition, formatDate(h.eventDate),
          h.eventName || '-', formatHours(parseFloat(h.hoursWorked) || 0), h.notes || '-',
        ]),
      ]), 'Horas Detalhado');

      XLSX.writeFile(wb, `Gastos_Arena_BRB_${filters.year}.xlsx`);
      success('✅ Excel gerado!');
    } catch (err) {
      console.error(err);
      showError('❌ Erro ao gerar Excel');
    } finally {
      setIsGenerating(null);
    }
  }, [filteredEvents, eventTotals, stats, monthlyExpenses, expensesByType, expensesByTypeByMonth, hourBankMonthly, hourBank, filters, filtersAreValid, success, showError]);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
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
                  disabled={!!isGenerating}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md"
                >
                  <FileText size={18} />
                  {isGenerating === 'pdf' ? 'Gerando...' : 'PDF'}
                </button>
                <button
                  onClick={generateExcel}
                  disabled={!!isGenerating}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md"
                >
                  <Download size={18} />
                  {isGenerating === 'excel' ? 'Gerando...' : 'Excel'}
                </button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Data Final</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`w-full px-2 py-1.5 border-2 rounded-lg focus:outline-none text-xs sm:text-sm ${
                    !filtersAreValid ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                  }`}
                />
                {!filtersAreValid && (
                  <p className="text-xs text-red-500 mt-1">Data final menor que a inicial</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ano de Referência</label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={e => {
                    const year = parseInt(e.target.value);
                    if (!isNaN(year)) setFilters({ year, startDate: `${year}-01-01`, endDate: `${year}-12-31` });
                  }}
                  className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
                  min="2020" max="2030"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-4">
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
            <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
              <div className="text-sm sm:text-lg font-bold text-amber-700 truncate">{formatCurrency(vacationStats.totalValue)}</div>
              <div className="text-xs text-gray-600">Coberturas de Férias</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center border border-red-200 col-span-2 lg:col-span-1">
              <div className="text-sm sm:text-lg font-bold text-red-700 truncate">
                {formatCurrency(stats.totalExpenses + vacationStats.totalValue)}
              </div>
              <div className="text-xs text-gray-600">Total Geral</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'resumo',  label: 'Por Evento',     icon: Calendar   },
              { id: 'mensal',  label: 'Por Mês',        icon: TrendingUp },
              { id: 'tipo',    label: 'Por Tipo',       icon: Package    },
              { id: 'tipoMes', label: 'Tipo/Mês',       icon: Users      },
              { id: 'horas',   label: 'Banco de Horas', icon: Users      },
              { id: 'ferias',  label: 'Férias',         icon: Sun        },
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
                  <Icon size={16} />{tab.label}
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
                    {filteredEvents.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{e.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{e.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(e.startDate)}</td>
                        <td className="px-4 py-3 text-right text-sm text-emerald-700">{formatCurrency(eventTotals[e.id]?.pessoal || 0)}</td>
                        <td className="px-4 py-3 text-right text-sm text-orange-600">{formatCurrency(eventTotals[e.id]?.aluguel || 0)}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(e.totalExpenses)}</td>
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
                        <td className="px-4 py-3 text-center text-gray-600">{m.eventCount}</td>
                        <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(m.totalPessoal)}</td>
                        <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(m.totalAluguel)}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(m.totalExpenses)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-emerald-50">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 font-bold text-emerald-800">TOTAL</td>
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
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Registros</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Plantões</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Pessoas</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expensesByType.map(t => (
                      <tr key={t.type} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{t.type}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            t.category === 'pessoal' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {t.category === 'pessoal' ? 'Pessoal' : 'Aluguel'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">{t.count}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{t.category === 'pessoal' ? t.totalShifts : '-'}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{t.category === 'pessoal' ? t.totalPeople : '-'}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(t.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-emerald-50">
                    <tr>
                      <td colSpan={5} className="px-4 py-3 font-bold text-emerald-800">TOTAL</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {formatCurrency(expensesByType.reduce((s, t) => s + t.totalValue, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TAB: TIPO POR MÊS */}
            {activeTab === 'tipoMes' && (
              <div className="space-y-6">
                {Object.entries(expensesByTypeByMonth).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Package size={40} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhum gasto no período</p>
                  </div>
                ) : (
                  Object.entries(expensesByTypeByMonth)
                    .sort(([, a], [, b]) => {
                      const tA = Object.values(a).reduce((s, m) => s + m.totalValue, 0);
                      const tB = Object.values(b).reduce((s, m) => s + m.totalValue, 0);
                      return tB - tA;
                    })
                    .map(([type, months]) => {
                      const monthEntries = Object.entries(months).sort(([a], [b]) => a.localeCompare(b));
                      const grandTotal   = monthEntries.reduce((s, [, d]) => s + d.totalValue, 0);
                      const totalPeople  = monthEntries.reduce((s, [, d]) => s + d.people,     0);
                      const totalShifts  = monthEntries.reduce((s, [, d]) => s + d.shifts,     0);
                      const isPessoal    = monthEntries[0]?.[1]?.category === 'pessoal';

                      return (
                        <div key={type} className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className={`flex items-center justify-between px-4 py-3 ${isPessoal ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                            <div className="font-bold text-gray-800">{type}</div>
                            <div className="text-lg font-bold text-gray-800">{formatCurrency(grandTotal)}</div>
                          </div>
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Mês</th>
                                <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600">Registros</th>
                                {isPessoal && <>
                                  <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600">Plantões</th>
                                  <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600">Pessoas</th>
                                </>}
                                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Valor</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {monthEntries.map(([month, data]) => (
                                <tr key={month} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm font-medium text-gray-700">{formatMonth(month)}</td>
                                  <td className="px-4 py-2 text-sm text-center text-gray-600">{data.count}</td>
                                  {isPessoal && <>
                                    <td className="px-4 py-2 text-sm text-center text-gray-600">{data.shifts}</td>
                                    <td className="px-4 py-2 text-sm text-center text-gray-600">{data.people}</td>
                                  </>}
                                  <td className="px-4 py-2 text-sm text-right font-bold text-gray-800">{formatCurrency(data.totalValue)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                              <tr>
                                <td className="px-4 py-2 text-xs font-bold text-gray-700">TOTAL</td>
                                <td className="px-4 py-2 text-xs text-center font-bold text-gray-700">{monthEntries.reduce((s, [, d]) => s + d.count, 0)}</td>
                                {isPessoal && <>
                                  <td className="px-4 py-2 text-xs text-center font-bold text-gray-700">{totalShifts}</td>
                                  <td className="px-4 py-2 text-xs text-center font-bold text-gray-700">{totalPeople}</td>
                                </>}
                                <td className="px-4 py-2 text-xs text-right font-bold text-gray-900">{formatCurrency(grandTotal)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      );
                    })
                )}
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
                    const months = Object.entries(emp.months).sort(([a], [b]) => a.localeCompare(b));
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

            {/* TAB: FÉRIAS */}
            {activeTab === 'ferias' && (
              <div className="space-y-4">
                {/* Resumo */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-amber-700">{vacationStats.totalCovers}</div>
                    <div className="text-xs text-gray-500">Coberturas</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-orange-700">{vacationStats.totalDays}</div>
                    <div className="text-xs text-gray-500">Plantões pagos</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-red-700 truncate">{formatCurrency(vacationStats.totalValue)}</div>
                    <div className="text-xs text-gray-500">Total gasto</div>
                  </div>
                </div>

                {/* Por mês */}
                {vacationStats.byMonth.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                    <div className="bg-amber-50 px-4 py-2 font-bold text-amber-800 text-sm">Por Mês</div>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Mês</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600">Coberturas</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600">Plantões</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {vacationStats.byMonth.map(m => (
                          <tr key={m.month} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-700">{formatMonth(m.month)}</td>
                            <td className="px-4 py-2 text-sm text-center text-gray-600">{m.count}</td>
                            <td className="px-4 py-2 text-sm text-center text-gray-600">{m.totalDays}</td>
                            <td className="px-4 py-2 text-sm text-right font-bold text-amber-700">{formatCurrency(m.totalValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-amber-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-xs font-bold text-amber-800">TOTAL</td>
                          <td className="px-4 py-2 text-xs text-right font-bold text-amber-900">{formatCurrency(vacationStats.totalValue)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* Listagem individual */}
                {vacationStats.filtered.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Sun size={40} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhuma cobertura de férias no período</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Posto</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Funcionário</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Período</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Plantões</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Diária</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {vacationStats.filtered.map(v => (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-800">{v.postLocation}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{v.employeeOnVacation || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDate(v.startDate)} → {formatDate(v.endDate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">{v.totalDays}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(v.dailyRate)}</td>
                            <td className="px-4 py-3 text-right font-bold text-amber-700">{formatCurrency(v.totalValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-amber-50">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 font-bold text-amber-800">TOTAL</td>
                          <td className="px-4 py-3 text-right font-bold text-amber-900">{formatCurrency(vacationStats.totalValue)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}