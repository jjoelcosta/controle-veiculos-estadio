import React, { useState } from 'react';
import { Plus, ArrowLeft, Calendar, Tag, TrendingUp, Search, Edit, Trash2, Eye, CheckCircle, Clock, XCircle, BarChart2, Sun } from 'lucide-react';

const CATEGORIES = ['Show', 'Jogo', 'Treinamento', 'Corporativo', 'Férias', 'Feira', 'Outro'];

const STATUS_CONFIG = {
  planejado: { label: 'Planejado', color: 'bg-blue-100 text-blue-800', icon: Clock },
  realizado: { label: 'Realizado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const CATEGORY_COLORS = {
  Show: 'bg-purple-100 text-purple-800',
  Jogo: 'bg-green-100 text-green-800',
  Treinamento: 'bg-blue-100 text-blue-800',
  Corporativo: 'bg-gray-100 text-gray-800',
  Férias: 'bg-red-100 text-red-800',
  Feira: 'bg-yellow-100 text-yellow-800',
  Outro: 'bg-orange-100 text-orange-800'
};

export default function EventList({
  events,
  onAdd,
  onViewDetail,
  onEdit,
  onDelete,
  onBack,
  onManageTeam,
  onHourBank,
  onReports,
  onVacations
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
  const totalEventos = filtered.length;
  const realizados = filtered.filter(e => e.status === 'realizado').length;

  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-medium mb-2 transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Calendar className="text-emerald-600" size={32} />
              Gestão de Eventos
            </h1>
            <p className="text-gray-600 mt-1">Eventos, gastos com pessoal e banco de horas</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onHourBank}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-medium"
            >
              <Clock size={18} />
              Banco de Horas
            </button>
            <button
              onClick={onVacations}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-medium"
            >
              <Sun size={18} />
              Férias
            </button>
            <button
              onClick={onManageTeam}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-medium"
            >
              <Tag size={18} />
              Equipe
            </button>
            <button
            onClick={onReports}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-medium"
            >
            <BarChart2 size={18} />
            Relatórios
            </button>
            <button
              onClick={onAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-medium"
            >
              <Plus size={18} />
              Novo Evento
            </button>
          </div>
        </div>

        {/* DASHBOARD */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-emerald-500">
            <div className="text-2xl font-bold text-emerald-700">{totalEventos}</div>
            <div className="text-sm text-gray-600">Total de Eventos</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-700">{realizados}</div>
            <div className="text-sm text-gray-600">Realizados</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500 col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totalGasto)}</div>
            <div className="text-sm text-gray-600">Total de Gastos</div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar evento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              <option value="todos">Todas as categorias</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              <option value="todos">Todos os status</option>
              <option value="planejado">Planejado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* LISTA DE EVENTOS */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <Calendar size={60} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-400">Clique em "Novo Evento" para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(event => {
              const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.planejado;
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white text-lg leading-tight">{event.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-800'}`}>
                        {event.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar size={14} className="text-emerald-200" />
                      <span className="text-emerald-100 text-sm">
                        {formatDate(event.startDate)}
                        {event.endDate && event.endDate !== event.startDate && 
                          ` → ${formatDate(event.endDate)}`}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${statusCfg.color}`}>
                        <StatusIcon size={12} />
                        {statusCfg.label}
                      </span>
                      <span className="text-lg font-bold text-emerald-700">
                        {formatCurrency(event.totalExpenses || 0)}
                      </span>
                    </div>

                    {event.expenses?.length > 0 && (
                      <div className="text-xs text-gray-500 mb-3">
                        {event.expenses.length} tipo(s) de gasto registrado(s)
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => onViewDetail(event)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                      <button
                        onClick={() => onEdit(event)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Deletar "${event.name}"?`)) onDelete(event.id);
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}