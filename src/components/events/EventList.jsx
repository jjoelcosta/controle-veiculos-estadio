import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus, ArrowLeft, Calendar, Tag, Search, Edit, Trash2, Eye,
  CheckCircle, Clock, XCircle, BarChart2, Sun, X, Users, TrendingUp
} from 'lucide-react';

const CATEGORIES = [
  'Corporativo', 'Corrida', 'Evento Esportivo', 'Feira',
  'Jogo', 'Luta', 'Outro', 'Religioso', 'Show', 'Treinamento'
];

const STATUS_CONFIG = {
  planejado: { label: 'Planejado', color: 'bg-blue-100 text-blue-800',   icon: Clock        },
  realizado: { label: 'Realizado', color: 'bg-green-100 text-green-800', icon: CheckCircle  },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800',     icon: XCircle      },
};

const CATEGORY_COLORS = {
  Corporativo:          'bg-gray-100 text-gray-800',
  Corrida:              'bg-orange-100 text-orange-800',
  'Evento Esportivo':   'bg-cyan-100 text-cyan-800',
  Feira:                'bg-yellow-100 text-yellow-800',
  Jogo:                 'bg-green-100 text-green-800',
  Luta:                 'bg-red-100 text-red-800',
  Outro:                'bg-slate-100 text-slate-800',
  Religioso:            'bg-indigo-100 text-indigo-800',
  Show:                 'bg-purple-100 text-purple-800',
  Treinamento:          'bg-blue-100 text-blue-800',
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}
function formatDate(date) {
  if (!date) return '-';
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
}
function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${months[parseInt(month) - 1]}/${year}`;
}

// ─────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────
function EventRow({ event, index, onViewDetail, onEdit, onDelete }) {
  const statusCfg  = STATUS_CONFIG[event.status] || STATUS_CONFIG.planejado;
  const StatusIcon = statusCfg.icon;
  return (
    <div
      className={`px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-emerald-50 transition-colors cursor-pointer ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
      }`}
      onClick={() => onViewDetail(event)}
    >
      <div className="col-span-4">
        <div className="font-semibold text-gray-800 truncate">{event.name}</div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-800'}`}>
          {event.category}
        </span>
      </div>
      <div className="col-span-2 text-sm text-gray-600">
        <div>{formatDate(event.startDate)}</div>
        {event.endDate && event.endDate !== event.startDate && (
          <div className="text-xs text-gray-400">até {formatDate(event.endDate)}</div>
        )}
      </div>
      <div className="col-span-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${statusCfg.color}`}>
          <StatusIcon size={11} />{statusCfg.label}
        </span>
      </div>
      <div className="col-span-2 text-right font-bold text-emerald-700 text-sm">
        {formatCurrency(event.totalExpenses || 0)}
      </div>
      <div className="col-span-2 flex gap-1.5 justify-center">
        <button onClick={e => { e.stopPropagation(); onViewDetail(event); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs">
          <Eye size={12} /> Ver
        </button>
        <button onClick={e => { e.stopPropagation(); onEdit(event); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs">
          <Edit size={12} /> Editar
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(event); }}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 rounded-lg text-xs">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function EventCard({ event, onViewDetail, onEdit, onDelete }) {
  const statusCfg  = STATUS_CONFIG[event.status] || STATUS_CONFIG.planejado;
  const StatusIcon = statusCfg.icon;
  return (
    <div className="bg-white rounded-xl border-2 border-emerald-200 p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="font-bold text-gray-800">{event.name}</div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-800'}`}>
          {event.category}
        </span>
      </div>
      <div className="text-sm text-gray-500 mb-2">
        <Calendar size={13} className="inline mr-1" />
        {formatDate(event.startDate)}
        {event.endDate && event.endDate !== event.startDate && ` → ${formatDate(event.endDate)}`}
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${statusCfg.color}`}>
          <StatusIcon size={11} />{statusCfg.label}
        </span>
        <span className="font-bold text-emerald-700">{formatCurrency(event.totalExpenses || 0)}</span>
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button onClick={() => onViewDetail(event)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1">
          <Eye size={13} /> Ver
        </button>
        <button onClick={() => onEdit(event)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1">
          <Edit size={13} /> Editar
        </button>
        <button onClick={() => onDelete(event)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
export default function EventList({
  events, onAdd, onViewDetail, onEdit, onDelete,
  onBack, onManageTeam, onHourBank, onReports, onVacations
}) {
  const [search,          setSearch]          = useState('');
  const [filterCategory,  setFilterCategory]  = useState('todos');
  const [filterStatus,    setFilterStatus]    = useState('todos');
  const [filterMonth,     setFilterMonth]     = useState('todos');
  const [filterType,      setFilterType]      = useState('todos'); // ← filtro por tipo de gasto

  // ── Meses disponíveis ───────────────────────
  const availableMonths = useMemo(() => [
    ...new Set(events.map(e => e.startDate?.substring(0, 7)).filter(Boolean))
  ].sort().reverse(), [events]);

  // ── Eventos filtrados ───────────────────────
  const filtered = useMemo(() =>
    events.filter(event => {
      const matchSearch   = event.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'todos' || event.category === filterCategory;
      const matchStatus   = filterStatus   === 'todos' || event.status   === filterStatus;
      const matchMonth    = filterMonth    === 'todos' || event.startDate?.startsWith(filterMonth);
      const matchType     = filterType     === 'todos' ||
        (event.expenses || []).some(ex => ex.expenseType?.trim() === filterType);
      return matchSearch && matchCategory && matchStatus && matchMonth && matchType;
    }),
    [events, search, filterCategory, filterStatus, filterMonth, filterType]
  );

  // ── Totais ──────────────────────────────────
  const { totalGasto, totalPessoal, totalAluguel, realizados } = useMemo(() => {
    let totalGasto = 0, totalPessoal = 0, totalAluguel = 0, realizados = 0;
    filtered.forEach(e => {
      totalGasto += e.totalExpenses || 0;
      if (e.status === 'realizado') realizados++;
      (e.expenses || []).forEach(ex => {
        const v = ex.totalValue || 0;
        if      (ex.expenseCategory === 'pessoal') totalPessoal += v;
        else if (ex.expenseCategory === 'aluguel') totalAluguel += v;
      });
    });
    return { totalGasto, totalPessoal, totalAluguel, realizados };
  }, [filtered]);

  // ── Gastos por mês ──────────────────────────
  const monthlyExpenses = useMemo(() => {
    const monthly = {};
    filtered.forEach(event => {
      const month = event.startDate?.substring(0, 7);
      if (!month) return;
      if (!monthly[month]) {
        monthly[month] = { month, events: 0, totalExpenses: 0, totalPessoal: 0, totalAluguel: 0 };
      }
      monthly[month].events++;
      monthly[month].totalExpenses += event.totalExpenses || 0;
      (event.expenses || []).forEach(ex => {
        const v = ex.totalValue || 0;
        if      (ex.expenseCategory === 'pessoal') monthly[month].totalPessoal += v;
        else if (ex.expenseCategory === 'aluguel') monthly[month].totalAluguel += v;
      });
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  // ── Gastos por tipo ─────────────────────────
  const expensesByType = useMemo(() => {
    const byType = {};
    filtered.forEach(event => {
      (event.expenses || []).forEach(ex => {
        const key = ex.expenseType?.trim() || '(sem tipo)';
        if (!byType[key]) {
          byType[key] = { type: key, category: ex.expenseCategory, totalValue: 0, count: 0, totalPeople: 0 };
        }
        byType[key].totalValue  += ex.totalValue || 0;
        byType[key].count++;
        if (ex.expenseCategory === 'pessoal') byType[key].totalPeople += ex.quantity || 0;
      });
    });
    return Object.values(byType).sort((a, b) => b.totalValue - a.totalValue);
  }, [filtered]);

  const handleDelete = useCallback((event) => {
    if (window.confirm(`Deletar "${event.name}"?`)) onDelete(event.id);
  }, [onDelete]);

  const hasActiveFilters = search || filterCategory !== 'todos' || filterStatus !== 'todos'
    || filterMonth !== 'todos' || filterType !== 'todos';

  const clearFilters = useCallback(() => {
    setSearch('');
    setFilterCategory('todos');
    setFilterStatus('todos');
    setFilterMonth('todos');
    setFilterType('todos');
  }, []);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-medium mb-2">
              <ArrowLeft size={20} /> Voltar
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Calendar className="text-emerald-600" size={32} /> Gestão de Eventos
            </h1>
            <p className="text-gray-600 mt-1">{events.length} evento(s) cadastrado(s)</p>
          </div>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
            <button onClick={onHourBank}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md">
              <Clock size={15} /><span className="hidden sm:inline">Banco de </span>Horas
            </button>
            <button onClick={onVacations}
              className="bg-amber-500 hover:bg-amber-600 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md">
              <Sun size={15} /> Férias
            </button>
            <button onClick={onManageTeam}
              className="bg-slate-600 hover:bg-slate-700 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md">
              <Tag size={15} /> Equipe
            </button>
            <button onClick={onReports}
              className="bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md">
              <BarChart2 size={15} /><span className="hidden sm:inline">Relatórios</span><span className="sm:hidden">Relat.</span>
            </button>
            <button onClick={onAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md col-span-2 sm:col-span-1">
              <Plus size={15} /> Novo Evento
            </button>
          </div>
        </div>

        {/* ── DASHBOARD CARDS — simples e limpos ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">{filtered.length}</div>
              <div className="text-xs text-gray-500">Eventos{filtered.length !== events.length ? ' filtrados' : ''}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">{realizados}</div>
              <div className="text-xs text-gray-500">Realizados</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-800 truncate">{formatCurrency(totalPessoal)}</div>
              <div className="text-xs text-gray-500">Pessoal</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-red-600" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-800 truncate">{formatCurrency(totalGasto)}</div>
              <div className="text-xs text-gray-500">Total Geral</div>
            </div>
          </div>
        </div>

        {/* ── TABELAS: GASTOS POR MÊS + POR TIPO ── */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

            {/* Gastos por Mês — clicável */}
            {monthlyExpenses.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <TrendingUp size={15} className="text-emerald-600" /> Gastos por Mês
                  </h3>
                  {filterMonth !== 'todos' && (
                    <button onClick={() => setFilterMonth('todos')}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                      <X size={12} /> limpar
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-52">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Mês</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Eventos</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">Pessoal</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {monthlyExpenses.map(m => (
                        <tr
                          key={m.month}
                          onClick={() => setFilterMonth(filterMonth === m.month ? 'todos' : m.month)}
                          className={`cursor-pointer transition-colors ${
                            filterMonth === m.month
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-3 py-2 text-sm font-medium flex items-center gap-1.5">
                            {filterMonth === m.month && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            )}
                            {formatMonth(m.month)}
                          </td>
                          <td className="px-3 py-2 text-xs text-center text-gray-500">{m.events}</td>
                          <td className="px-3 py-2 text-xs text-right text-emerald-700">{formatCurrency(m.totalPessoal)}</td>
                          <td className="px-3 py-2 text-xs text-right font-bold text-gray-800">{formatCurrency(m.totalExpenses)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-100">
                      <tr>
                        <td colSpan={2} className="px-3 py-2 text-xs font-bold text-gray-600">TOTAL</td>
                        <td className="px-3 py-2 text-xs text-right font-bold text-emerald-700">{formatCurrency(totalPessoal)}</td>
                        <td className="px-3 py-2 text-xs text-right font-bold text-gray-800">{formatCurrency(totalGasto)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Gastos por Tipo — clicável */}
            {expensesByType.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <Users size={15} className="text-blue-600" /> Gastos por Tipo
                  </h3>
                  {filterType !== 'todos' && (
                    <button onClick={() => setFilterType('todos')}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                      <X size={12} /> limpar
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-52">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Tipo</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Eventos</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Pessoas</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {expensesByType.map(t => (
                        <tr
                          key={t.type}
                          onClick={() => setFilterType(filterType === t.type ? 'todos' : t.type)}
                          className={`cursor-pointer transition-colors ${
                            filterType === t.type
                              ? 'bg-blue-50 text-blue-800'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-3 py-2 text-sm font-medium flex items-center gap-1.5">
                            {filterType === t.type && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                              t.category === 'pessoal'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {t.category === 'pessoal' ? '👤' : '📦'}
                            </span>
                            <span className="truncate">{t.type}</span>
                          </td>
                          <td className="px-3 py-2 text-xs text-center text-gray-500">{t.count}</td>
                          <td className="px-3 py-2 text-xs text-center text-gray-500">
                            {t.category === 'pessoal' ? t.totalPeople : '—'}
                          </td>
                          <td className="px-3 py-2 text-xs text-right font-bold text-gray-800">{formatCurrency(t.totalValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-100">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-xs font-bold text-gray-600">TOTAL</td>
                        <td className="px-3 py-2 text-xs text-right font-bold text-gray-800">{formatCurrency(totalGasto)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FILTROS */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-3 text-gray-400" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
              <input
                type="text"
                placeholder="Buscar evento..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-colors ${
                filterMonth !== 'todos' ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-200 focus:border-emerald-500'
              }`}>
              <option value="todos">Todos os meses</option>
              {availableMonths.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-colors ${
                filterCategory !== 'todos' ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-200 focus:border-emerald-500'
              }`}>
              <option value="todos">Todas as categorias</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-colors ${
                filterStatus !== 'todos' ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-200 focus:border-emerald-500'
              }`}>
              <option value="todos">Todos os status</option>
              <option value="planejado">Planejado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-bold text-emerald-700">{filtered.length}</span> de{' '}
                <span className="font-bold">{events.length}</span> eventos
              </p>
              <button onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
                <X size={13} /> Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* LISTA */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <Calendar size={50} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-500 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-400 text-sm mb-4">
              {hasActiveFilters ? 'Tente ajustar os filtros' : 'Clique em "Novo Evento" para começar'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium underline">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white px-4 py-3 grid grid-cols-12 gap-3 font-semibold text-sm">
                <div className="col-span-4">Evento</div>
                <div className="col-span-2">Data</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Total Gastos</div>
                <div className="col-span-2 text-center">Ações</div>
              </div>
              <div className="divide-y divide-gray-100">
                {filtered.map((event, index) => (
                  <EventRow key={event.id} event={event} index={index}
                    onViewDetail={onViewDetail} onEdit={onEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>

            {/* MOBILE */}
            <div className="lg:hidden space-y-3">
              {filtered.map(event => (
                <EventCard key={event.id} event={event}
                  onViewDetail={onViewDetail} onEdit={onEdit} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}