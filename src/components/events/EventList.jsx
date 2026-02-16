import React, { useState } from 'react';
import { Plus, ArrowLeft, Calendar, Tag, Search, Edit, Trash2, Eye, CheckCircle, Clock, XCircle, BarChart2, Sun, X } from 'lucide-react';

const CATEGORIES = ['Corporativo', 'Corrida', 'Evento Esportivo', 'Feira', 'Jogo', 'Luta', 'Outro', 'Religioso', 'Show', 'Treinamento'];

const STATUS_CONFIG = {
  planejado: { label: 'Planejado', color: 'bg-blue-100 text-blue-800', icon: Clock },
  realizado: { label: 'Realizado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const CATEGORY_COLORS = {
  Corporativo: 'bg-gray-100 text-gray-800',
  Corrida: 'bg-orange-100 text-orange-800',
  'Evento Esportivo': 'bg-cyan-100 text-cyan-800',
  Feira: 'bg-yellow-100 text-yellow-800',
  Jogo: 'bg-green-100 text-green-800',
  Luta: 'bg-red-100 text-red-800',
  Outro: 'bg-slate-100 text-slate-800',
  Religioso: 'bg-indigo-100 text-indigo-800',
  Show: 'bg-purple-100 text-purple-800',
  Treinamento: 'bg-blue-100 text-blue-800'
};

export default function EventList({
  events, onAdd, onViewDetail, onEdit, onDelete,
  onBack, onManageTeam, onHourBank, onReports, onVacations
}) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  const filtered = events.filter(event => {
    const matchSearch = event.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'todos' || event.category === filterCategory;
    const matchStatus = filterStatus === 'todos' || event.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalGasto = filtered.reduce((sum, e) => sum + (e.totalExpenses || 0), 0);
  const realizados = filtered.filter(e => e.status === 'realizado').length;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const EventRow = ({ event, index }) => {
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.planejado;
    const StatusIcon = statusCfg.icon;
    const isEven = index % 2 === 0;
    return (
      <div
        className={`px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-emerald-50 transition-colors cursor-pointer ${isEven ? 'bg-white' : 'bg-gray-50'}`}
        onClick={() => onViewDetail(event)}
      >
        {/* Nome + Categoria */}
        <div className="col-span-4">
          <div className="font-semibold text-gray-800 truncate">{event.name}</div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-800'}`}>
            {event.category}
          </span>
        </div>
        {/* Datas */}
        <div className="col-span-2 text-sm text-gray-600">
          <div>{formatDate(event.startDate)}</div>
          {event.endDate && event.endDate !== event.startDate && (
            <div className="text-xs text-gray-400">até {formatDate(event.endDate)}</div>
          )}
        </div>
        {/* Status */}
        <div className="col-span-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${statusCfg.color}`}>
            <StatusIcon size={11} />{statusCfg.label}
          </span>
        </div>
        {/* Gastos */}
        <div className="col-span-2 text-right font-bold text-emerald-700 text-sm">
          {formatCurrency(event.totalExpenses || 0)}
        </div>
        {/* Ações */}
        <div className="col-span-2 flex gap-1.5 justify-center">
          <button onClick={(e) => { e.stopPropagation(); onViewDetail(event); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs">
            <Eye size={12} /> Ver
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(event); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs">
            <Edit size={12} /> Editar
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Deletar "${event.name}"?`)) onDelete(event.id); }}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 rounded-lg text-xs">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  };

  const EventCard = ({ event }) => {
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.planejado;
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
          <button onClick={() => { if (window.confirm(`Deletar "${event.name}"?`)) onDelete(event.id); }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

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
            <p className="text-gray-600 mt-1">👥 {events.length} evento(s) cadastrado(s)</p>
          </div>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
            <button onClick={onHourBank} className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md">
              <Clock size={15} /><span className="hidden sm:inline">Banco de </span>Horas
            </button>
            <button onClick={onVacations} className="bg-amber-500 hover:bg-amber-600 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md">
              <Sun size={15} /> Férias
            </button>
            <button onClick={onManageTeam} className="bg-slate-600 hover:bg-slate-700 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md">
              <Tag size={15} /> Equipe
            </button>
            <button onClick={onReports} className="bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md">
              <BarChart2 size={15} /><span className="hidden sm:inline">Relatórios</span><span className="sm:hidden">Relat.</span>
            </button>
            <button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium shadow-md col-span-2 sm:col-span-1">
              <Plus size={15} /> Novo Evento
            </button>
          </div>
        </div>

        {/* DASHBOARD */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border-l-4 border-emerald-500">
            <div className="text-xl sm:text-2xl font-bold text-emerald-700">{filtered.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xl sm:text-2xl font-bold text-green-700">{realizados}</div>
            <div className="text-xs sm:text-sm text-gray-600">Realizados</div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border-l-4 border-red-500">
            <div className="text-base sm:text-xl font-bold text-red-700 truncate">{formatCurrency(totalGasto)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Gastos</div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-3 text-gray-400" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
              <input type="text" placeholder="Buscar evento..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none" />
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none">
              <option value="todos">Todas as categorias</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none">
              <option value="todos">Todos os status</option>
              <option value="planejado">Planejado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* LISTA */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <Calendar size={60} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-400">Clique em "Novo Evento" para começar</p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden lg:block bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white px-4 py-3 grid grid-cols-12 gap-3 font-semibold text-sm">
                <div className="col-span-4">Evento</div>
                <div className="col-span-2">Data</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Total Gastos</div>
                <div className="col-span-2 text-center">Ações</div>
              </div>
              <div className="divide-y divide-gray-100">
                {filtered.map((event, index) => <EventRow key={event.id} event={event} index={index} />)}
              </div>
            </div>

            {/* MOBILE */}
            <div className="lg:hidden space-y-3">
              {filtered.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}