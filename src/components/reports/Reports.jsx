import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, FileText, Download, Filter, TrendingUp,
  Car, Users, Package, Calendar, UserCheck, BarChart2,
  Truck, AlertCircle, Sun
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports({
  vehicles,
  owners,
  thirdPartyVehicles,
  loans,
  events,
  staff,
  onBack
}) {
  const { success, error } = useToast();
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
  });
  const [activeTab, setActiveTab] = useState('resumo');

  const formatCurrency = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const formatDateRaw = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // ─────────────────────────────────────────
  // DADOS FILTRADOS
  // ─────────────────────────────────────────
  const start = useMemo(() => new Date(filters.startDate), [filters.startDate]);
  const end = useMemo(() => { const d = new Date(filters.endDate); d.setHours(23,59,59); return d; }, [filters.endDate]);

  const filteredLoans = useMemo(() =>
    loans.filter(l => { const d = new Date(l.loanDate); return d >= start && d <= end; }),
    [loans, start, end]);

  const filteredEvents = useMemo(() =>
    events.filter(e => { const d = new Date(e.startDate); return d >= start && d <= end; }),
    [events, start, end]);

  const filteredThirdParty = useMemo(() =>
    thirdPartyVehicles.filter(v => {
      if (!v.createdAt) return true;
      const d = new Date(v.createdAt);
      return d >= start && d <= end;
    }),
    [thirdPartyVehicles, start, end]);

  // ─────────────────────────────────────────
  // ESTATÍSTICAS
  // ─────────────────────────────────────────
  const stats = useMemo(() => {
    const loanTaxas = filteredLoans.reduce((sum, l) =>
      sum + l.items.reduce((s, i) => s + (i.damageFee || 0), 0), 0);

    const eventTotal = filteredEvents.reduce((sum, e) => sum + (e.totalExpenses || 0), 0);
    const eventPessoal = filteredEvents.reduce((sum, e) =>
      sum + (e.expenses?.filter(ex => ex.expenseCategory === 'pessoal')
        .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0), 0);
    const eventAluguel = filteredEvents.reduce((sum, e) =>
      sum + (e.expenses?.filter(ex => ex.expenseCategory === 'aluguel')
        .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0), 0);

    // Alertas de férias
    const today = new Date();
    const staffAlerts = (staff || []).filter(s => {
      if (!s.hire_date || s.status === 'desligado') return false;
      const hire = new Date(s.hire_date + 'T12:00:00');
      const totalMonths = (today.getFullYear() - hire.getFullYear()) * 12 +
        (today.getMonth() - hire.getMonth());
      if (totalMonths < 12) return false;
      // Verifica se tem férias vencendo em 90 dias ou vencidas
      const periods = Math.floor(totalMonths / 12);
      const lastPeriodEnd = new Date(hire);
      lastPeriodEnd.setFullYear(lastPeriodEnd.getFullYear() + periods);
      const expiresOn = new Date(lastPeriodEnd);
      expiresOn.setFullYear(expiresOn.getFullYear() + 1);
      const daysUntil = Math.round((expiresOn - today) / (1000 * 60 * 60 * 24));
      return daysUntil <= 90;
    });

    return {
      // Veículos
      totalVehicles: vehicles.length,
      totalOwners: owners.length,
      totalThirdParty: filteredThirdParty.length,
      // Empréstimos
      totalLoans: filteredLoans.length,
      activeLoans: filteredLoans.filter(l => l.status === 'emprestado').length,
      returnedLoans: filteredLoans.filter(l => l.status === 'devolvido').length,
      lateLoans: filteredLoans.filter(l => l.status === 'atrasado').length,
      loanTaxas,
      // Eventos
      totalEvents: filteredEvents.length,
      eventTotal,
      eventPessoal,
      eventAluguel,
      // Pessoal
      totalStaff: (staff || []).length,
      activeStaff: (staff || []).filter(s => s.status === 'ativo').length,
      staffOnVacation: (staff || []).filter(s => s.status === 'férias').length,
      staffAbsent: (staff || []).filter(s => s.status === 'afastado').length,
      staffAlerts: staffAlerts.length,
    };
  }, [filteredLoans, filteredEvents, filteredThirdParty, vehicles, owners, staff]);

  // ─────────────────────────────────────────
  // GERAR PDF COMPLETO
  // ─────────────────────────────────────────
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const W = doc.internal.pageSize.width;
      const M = 20;

      const addPageHeader = (title, subtitle = '', color = [37, 99, 235]) => {
        let y = 20;
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...color);
        doc.text('Arena BRB / Arena 360', W / 2, y, { align: 'center' });
        y += 7;
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text('Gestão Integrada de Segurança', W / 2, y, { align: 'center' });
        y += 6;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(title, W / 2, y, { align: 'center' });
        if (subtitle) {
          y += 5;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(120, 120, 120);
          doc.text(subtitle, W / 2, y, { align: 'center' });
        }
        y += 4;
        doc.setDrawColor(...color);
        doc.setLineWidth(0.8);
        doc.line(M, y, W - M, y);
        return y + 10;
      };

      const periodo = `Período: ${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}`;

      // ── PÁG 1: RESUMO EXECUTIVO ──
      let y = addPageHeader('RELATÓRIO GERAL DO SISTEMA', periodo);
      autoTable(doc, {
        startY: y,
        head: [['MÓDULO', 'INDICADOR', 'VALOR']],
        body: [
          ['🚗 Veículos', 'Veículos Autorizados', stats.totalVehicles],
          ['🚗 Veículos', 'Proprietários', stats.totalOwners],
          ['🚗 Veículos', 'Terceiros Cadastrados', stats.totalThirdParty],
          ['📦 Empréstimos', 'Total no Período', stats.totalLoans],
          ['📦 Empréstimos', 'Ativos', stats.activeLoans],
          ['📦 Empréstimos', 'Devolvidos', stats.returnedLoans],
          ['📦 Empréstimos', 'Taxas Cobradas', formatCurrency(stats.loanTaxas)],
          ['💚 Eventos', 'Total no Período', stats.totalEvents],
          ['💚 Eventos', 'Gasto com Pessoal', formatCurrency(stats.eventPessoal)],
          ['💚 Eventos', 'Gasto com Aluguéis', formatCurrency(stats.eventAluguel)],
          ['💚 Eventos', 'TOTAL GASTO', formatCurrency(stats.eventTotal)],
          ['👥 Pessoal', 'Total Cadastrado', stats.totalStaff],
          ['👥 Pessoal', 'Ativos', stats.activeStaff],
          ['👥 Pessoal', 'De Férias', stats.staffOnVacation],
          ['👥 Pessoal', 'Afastados', stats.staffAbsent],
          ['👥 Pessoal', 'Alertas de Férias', stats.staffAlerts],
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 },
        columnStyles: { 2: { halign: 'right' } },
        margin: { left: M, right: M }
      });

      // ── PÁG 2: VEÍCULOS ──
      doc.addPage();
      y = addPageHeader('VEÍCULOS AUTORIZADOS', periodo, [59, 130, 246]);
      autoTable(doc, {
        startY: y,
        head: [['Placa', 'Marca/Modelo', 'Tipo', 'Proprietário', 'Empresa', 'Local']],
        body: vehicles.map(v => {
          const owner = owners.find(o => o.id === v.ownerId);
          return [v.plate, `${v.brand} ${v.model}`, v.type, owner?.name || '-', owner?.company || '-', v.parkingLocation || '-'];
        }),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
        margin: { left: M, right: M }
      });

      // ── PÁG 3: EMPRÉSTIMOS ──
      doc.addPage();
      y = addPageHeader('EMPRÉSTIMOS DE ACERVO', periodo, [202, 138, 4]);
      autoTable(doc, {
        startY: y,
        head: [['Data', 'Empresa', 'Solicitante', 'Itens', 'Status', 'Taxa']],
        body: filteredLoans.map(l => [
          formatDateRaw(l.loanDate),
          l.company,
          l.requesterName,
          l.items.length,
          l.status,
          formatCurrency(l.items.reduce((s, i) => s + (i.damageFee || 0), 0))
        ]),
        theme: 'striped',
        headStyles: { fillColor: [202, 138, 4] },
        styles: { fontSize: 8 },
        margin: { left: M, right: M }
      });

      // ── PÁG 4: EVENTOS ──
      doc.addPage();
      y = addPageHeader('GESTÃO DE EVENTOS', periodo, [5, 150, 105]);
      autoTable(doc, {
        startY: y,
        head: [['Evento', 'Categoria', 'Data', 'Status', 'Pessoal', 'Aluguel', 'Total']],
        body: filteredEvents.map(e => [
          e.name,
          e.category,
          formatDate(e.startDate),
          e.status,
          formatCurrency(e.expenses?.filter(ex => ex.expenseCategory === 'pessoal')
            .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0),
          formatCurrency(e.expenses?.filter(ex => ex.expenseCategory === 'aluguel')
            .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0),
          formatCurrency(e.totalExpenses)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 8 },
        margin: { left: M, right: M }
      });

      // ── PÁG 5: PESSOAL ──
      if ((staff || []).length > 0) {
        doc.addPage();
        y = addPageHeader('PESSOAL OPERACIONAL', periodo, [124, 58, 237]);
        autoTable(doc, {
          startY: y,
          head: [['Nome', 'Cargo', 'Posto', 'Turno', 'Escala', 'Admissão', 'Status']],
          body: (staff || []).map(s => [
            s.name,
            s.position,
            s.post_location || '-',
            s.shift,
            s.current_schedule,
            formatDate(s.hire_date),
            s.status
          ]),
          theme: 'striped',
          headStyles: { fillColor: [124, 58, 237] },
          styles: { fontSize: 8 },
          margin: { left: M, right: M }
        });
      }

      // ── PÁG 6: TERCEIROS ──
      if (filteredThirdParty.length > 0) {
        doc.addPage();
        y = addPageHeader('VEÍCULOS TERCEIROS', periodo, [234, 88, 12]);
        autoTable(doc, {
          startY: y,
          head: [['Placa', 'Marca/Modelo', 'Empresa', 'Motorista', 'Serviço']],
          body: filteredThirdParty.map(v => [
            v.plate,
            `${v.brand || ''} ${v.model || ''}`.trim(),
            v.company || '-',
            v.driverName || '-',
            v.serviceType || '-'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [234, 88, 12] },
          styles: { fontSize: 8 },
          margin: { left: M, right: M }
        });
      }

      // Rodapé em todas as páginas
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Arena BRB / Arena 360 — Gestão Integrada de Segurança | Página ${i} de ${totalPages} | ${new Date().toLocaleString('pt-BR')}`,
          W / 2, doc.internal.pageSize.height - 8, { align: 'center' }
        );
      }

      doc.save(`Arena_BRB_360_Relatorio_${filters.year}.pdf`);
      success('✅ Relatório PDF gerado!');
    } catch (err) {
      console.error(err);
      error('❌ Erro ao gerar PDF');
    }
  };

  // ─────────────────────────────────────────
  // GERAR EXCEL COMPLETO
  // ─────────────────────────────────────────
  const generateExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // ABA 1: RESUMO
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Arena BRB / Arena 360 — Gestão Integrada de Segurança'],
        [`Relatório Geral — Período: ${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}`],
        [],
        ['MÓDULO', 'INDICADOR', 'VALOR'],
        ['Veículos', 'Veículos Autorizados', stats.totalVehicles],
        ['Veículos', 'Proprietários', stats.totalOwners],
        ['Veículos', 'Terceiros Cadastrados', stats.totalThirdParty],
        ['Empréstimos', 'Total no Período', stats.totalLoans],
        ['Empréstimos', 'Ativos', stats.activeLoans],
        ['Empréstimos', 'Devolvidos', stats.returnedLoans],
        ['Empréstimos', 'Taxas Cobradas (R$)', stats.loanTaxas],
        ['Eventos', 'Total no Período', stats.totalEvents],
        ['Eventos', 'Gasto Pessoal (R$)', stats.eventPessoal],
        ['Eventos', 'Gasto Aluguel (R$)', stats.eventAluguel],
        ['Eventos', 'Total Gasto (R$)', stats.eventTotal],
        ['Pessoal', 'Total Cadastrado', stats.totalStaff],
        ['Pessoal', 'Ativos', stats.activeStaff],
        ['Pessoal', 'De Férias', stats.staffOnVacation],
        ['Pessoal', 'Afastados', stats.staffAbsent],
      ]), 'Resumo Geral');

      // ABA 2: VEÍCULOS
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Placa', 'Marca', 'Modelo', 'Tipo', 'Local', 'Proprietário', 'Empresa', 'Setor'],
        ...vehicles.map(v => {
          const owner = owners.find(o => o.id === v.ownerId);
          return [v.plate, v.brand, v.model, v.type, v.parkingLocation || '-',
            owner?.name || '-', owner?.company || '-', owner?.sector || '-'];
        })
      ]), 'Veículos');

      // ABA 3: PROPRIETÁRIOS
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Nome', 'Empresa', 'Setor', 'Cargo', 'Telefone', 'Qtd Veículos'],
        ...owners.map(o => [
          o.name, o.company, o.sector, o.position, o.phone,
          vehicles.filter(v => v.ownerId === o.id).length
        ])
      ]), 'Proprietários');

      // ABA 4: TERCEIROS
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Placa', 'Marca', 'Modelo', 'Empresa', 'Motorista', 'Telefone', 'Serviço'],
        ...filteredThirdParty.map(v => [
          v.plate, v.brand || '-', v.model || '-', v.company || '-',
          v.driverName || '-', v.driverPhone || '-', v.serviceType || '-'
        ])
      ]), 'Terceiros');

      // ABA 5: EMPRÉSTIMOS
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Data', 'Empresa', 'Solicitante', 'CPF', 'Telefone', 'Local', 'Itens', 'Status', 'Taxa (R$)'],
        ...filteredLoans.map(l => [
          formatDateRaw(l.loanDate), l.company, l.requesterName,
          l.requesterCpf || '-', l.requesterPhone || '-', l.location || '-',
          l.items.length, l.status,
          l.items.reduce((s, i) => s + (i.damageFee || 0), 0)
        ])
      ]), 'Empréstimos');

      // ABA 6: EVENTOS
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Evento', 'Categoria', 'Data Início', 'Data Fim', 'Status', 'Pessoal (R$)', 'Aluguel (R$)', 'Total (R$)'],
        ...filteredEvents.map(e => [
          e.name, e.category, formatDate(e.startDate), formatDate(e.endDate), e.status,
          e.expenses?.filter(ex => ex.expenseCategory === 'pessoal').reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0,
          e.expenses?.filter(ex => ex.expenseCategory === 'aluguel').reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0,
          e.totalExpenses || 0
        ])
      ]), 'Eventos');

      // ABA 7: PESSOAL
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Nome', 'CPF', 'Cargo', 'Vínculo', 'Posto', 'Turno', 'Escala', 'Admissão', 'Status'],
        ...(staff || []).map(s => [
          s.name,
          s.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || '-',
          s.position, s.employment_type, s.post_location || '-',
          s.shift, s.current_schedule, formatDate(s.hire_date), s.status
        ])
      ]), 'Pessoal');

      XLSX.writeFile(wb, `Arena_BRB_360_Relatorio_${filters.year}.xlsx`);
      success('✅ Excel gerado!');
    } catch (err) {
      console.error(err);
      error('❌ Erro ao gerar Excel');
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6">
            <button onClick={onBack} className="flex items-center gap-2 text-indigo-200 hover:text-white mb-4">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart2 size={28} /> Relatórios Gerais
                </h1>
                <p className="text-indigo-200 mt-1">
                  Arena BRB / Arena 360 — Gestão Integrada de Segurança
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={generatePDF}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-md">
                  <FileText size={18} /> PDF Completo
                </button>
                <button onClick={generateExcel}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-md">
                  <Download size={18} /> Excel Completo
                </button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-3 sm:p-4 border-b border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 min-w-0">
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Data Inicial</label>
                <input type="date" value={filters.startDate}
                  onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full min-w-0 px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs sm:text-sm" />
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Data Final</label>
                <input type="date" value={filters.endDate}
                  onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full min-w-0 px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs sm:text-sm" />
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ano de Referência</label>
                <input type="number" value={filters.year}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    setFilters({ year, startDate: `${year}-01-01`, endDate: `${year}-12-31` });
                  }}
                  className="w-full min-w-0 px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs sm:text-sm"
                  min="2020" max="2030" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 p-4">
            {[
              { label: 'Veículos', value: stats.totalVehicles, color: 'bg-blue-50 text-blue-700', icon: Car },
              { label: 'Proprietários', value: stats.totalOwners, color: 'bg-slate-50 text-slate-700', icon: Users },
              { label: 'Terceiros', value: stats.totalThirdParty, color: 'bg-orange-50 text-orange-700', icon: Truck },
              { label: 'Empréstimos', value: stats.totalLoans, color: 'bg-yellow-50 text-yellow-700', icon: Package },
              { label: 'Eventos', value: stats.totalEvents, color: 'bg-emerald-50 text-emerald-700', icon: Calendar },
              { label: 'Pessoal', value: stats.totalStaff, color: 'bg-purple-50 text-purple-700', icon: UserCheck },
              { label: 'Alertas Férias', value: stats.staffAlerts, color: stats.staffAlerts > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-500', icon: AlertCircle },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                  <Icon size={16} className="mx-auto mb-1 opacity-70" />
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'resumo',      label: 'Resumo',      icon: BarChart2 },
              { id: 'veiculos',    label: 'Veículos',    icon: Car },
              { id: 'emprestimos', label: 'Empréstimos', icon: Package },
              { id: 'eventos',     label: 'Eventos',     icon: Calendar },
              { id: 'pessoal',     label: 'Pessoal',     icon: UserCheck },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 flex-1 justify-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4">

            {/* ── RESUMO ── */}
            {activeTab === 'resumo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Veículos */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><Car size={16}/> Veículos</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Autorizados</span><strong>{stats.totalVehicles}</strong></div>
                      <div className="flex justify-between"><span>Proprietários</span><strong>{stats.totalOwners}</strong></div>
                      <div className="flex justify-between"><span>Terceiros</span><strong>{stats.totalThirdParty}</strong></div>
                    </div>
                  </div>

                  {/* Empréstimos */}
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2"><Package size={16}/> Empréstimos</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Total no período</span><strong>{stats.totalLoans}</strong></div>
                      <div className="flex justify-between"><span>Ativos</span><strong>{stats.activeLoans}</strong></div>
                      <div className="flex justify-between"><span>Devolvidos</span><strong>{stats.returnedLoans}</strong></div>
                      <div className="flex justify-between"><span>Taxas cobradas</span><strong className="text-yellow-700">{formatCurrency(stats.loanTaxas)}</strong></div>
                    </div>
                  </div>

                  {/* Eventos */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><Calendar size={16}/> Eventos</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Total no período</span><strong>{stats.totalEvents}</strong></div>
                      <div className="flex justify-between"><span>Gasto Pessoal</span><strong>{formatCurrency(stats.eventPessoal)}</strong></div>
                      <div className="flex justify-between"><span>Gasto Aluguel</span><strong>{formatCurrency(stats.eventAluguel)}</strong></div>
                      <div className="flex justify-between border-t border-emerald-200 pt-2"><span className="font-bold">Total Gasto</span><strong className="text-emerald-700">{formatCurrency(stats.eventTotal)}</strong></div>
                    </div>
                  </div>

                  {/* Pessoal */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2"><UserCheck size={16}/> Pessoal Operacional</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Total cadastrado</span><strong>{stats.totalStaff}</strong></div>
                      <div className="flex justify-between"><span className="text-green-700">Ativos</span><strong>{stats.activeStaff}</strong></div>
                      <div className="flex justify-between"><span className="text-blue-700">De Férias</span><strong>{stats.staffOnVacation}</strong></div>
                      <div className="flex justify-between"><span className="text-orange-700">Afastados</span><strong>{stats.staffAbsent}</strong></div>
                      {stats.staffAlerts > 0 && (
                        <div className="flex justify-between border-t border-red-200 pt-2">
                          <span className="text-red-700 font-bold flex items-center gap-1"><AlertCircle size={12}/> Alertas Férias</span>
                          <strong className="text-red-700">{stats.staffAlerts}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── VEÍCULOS ── */}
            {activeTab === 'veiculos' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Placa','Marca/Modelo','Tipo','Proprietário','Empresa','Local'].map(h => (
                        <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vehicles.map(v => {
                      const owner = owners.find(o => o.id === v.ownerId);
                      return (
                        <tr key={v.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 font-mono font-bold text-blue-700">{v.plate}</td>
                          <td className="px-3 py-3 text-sm">{v.brand} {v.model}</td>
                          <td className="px-3 py-3 text-sm text-gray-600">{v.type}</td>
                          <td className="px-3 py-3 text-sm">{owner?.name || '-'}</td>
                          <td className="px-3 py-3 text-sm text-gray-600">{owner?.company || '-'}</td>
                          <td className="px-3 py-3 text-sm text-gray-600">{v.parkingLocation || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── EMPRÉSTIMOS ── */}
            {activeTab === 'emprestimos' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Data','Empresa','Solicitante','Itens','Status','Taxa'].map(h => (
                        <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLoans.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm">{formatDateRaw(l.loanDate)}</td>
                        <td className="px-3 py-3 text-sm font-medium">{l.company}</td>
                        <td className="px-3 py-3 text-sm">{l.requesterName}</td>
                        <td className="px-3 py-3 text-sm text-center">{l.items.length}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            l.status === 'devolvido' ? 'bg-green-100 text-green-800'
                            : l.status === 'emprestado' ? 'bg-yellow-100 text-yellow-800'
                            : l.status === 'atrasado' ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>{l.status}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-right">
                          {formatCurrency(l.items.reduce((s, i) => s + (i.damageFee || 0), 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-yellow-50">
                    <tr>
                      <td colSpan={5} className="px-3 py-3 font-bold text-yellow-800">TOTAL TAXAS</td>
                      <td className="px-3 py-3 text-right font-bold text-yellow-800">{formatCurrency(stats.loanTaxas)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* ── EVENTOS ── */}
            {activeTab === 'eventos' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Evento','Categoria','Data','Status','Pessoal','Aluguel','Total'].map(h => (
                        <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEvents.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 font-medium text-sm">{e.name}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{e.category}</td>
                        <td className="px-3 py-3 text-sm">{formatDate(e.startDate)}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            e.status === 'realizado' ? 'bg-green-100 text-green-800'
                            : e.status === 'planejado' ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>{e.status}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-right text-emerald-700">
                          {formatCurrency(e.expenses?.filter(ex => ex.expenseCategory === 'pessoal').reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0)}
                        </td>
                        <td className="px-3 py-3 text-sm text-right text-orange-600">
                          {formatCurrency(e.expenses?.filter(ex => ex.expenseCategory === 'aluguel').reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0)}
                        </td>
                        <td className="px-3 py-3 text-sm text-right font-bold">{formatCurrency(e.totalExpenses)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-emerald-50">
                    <tr>
                      <td colSpan={4} className="px-3 py-3 font-bold text-emerald-800">TOTAL</td>
                      <td className="px-3 py-3 text-right font-bold text-emerald-800">{formatCurrency(stats.eventPessoal)}</td>
                      <td className="px-3 py-3 text-right font-bold text-orange-700">{formatCurrency(stats.eventAluguel)}</td>
                      <td className="px-3 py-3 text-right font-bold text-gray-900">{formatCurrency(stats.eventTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* ── PESSOAL ── */}
            {activeTab === 'pessoal' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Nome','Cargo','Posto','Turno/Escala','Admissão','Status'].map(h => (
                        <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(staff || []).map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 font-medium text-sm">{s.name}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{s.position}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{s.post_location || '-'}</td>
                        <td className="px-3 py-3 text-sm">
                          <span className={`text-xs px-2 py-0.5 rounded-full mr-1 ${
                            s.shift === 'Diurno' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>{s.shift}</span>
                          <span className="text-xs text-gray-500">{s.current_schedule}</span>
                        </td>
                        <td className="px-3 py-3 text-sm">{formatDate(s.hire_date)}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            s.status === 'ativo' ? 'bg-green-100 text-green-800'
                            : s.status === 'férias' ? 'bg-blue-100 text-blue-800'
                            : s.status === 'afastado' ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}