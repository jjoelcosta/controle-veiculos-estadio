import React, { useState, useMemo } from 'react';
import { Plus, Search, UserCheck, Edit, Trash2, ArrowLeft, X, Calendar, AlertCircle } from 'lucide-react';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

const POSITIONS = [
  'Agente de Portaria',
  'Auxiliar de Segurança',
  'Segurança Motorizado',
  'Técnico de Monitoramento'
];

const SHIFTS = ['Diurno', 'Noturno'];
const SCHEDULES = ['Dias Pares', 'Dias Ímpares'];

const STATUS_CONFIG = {
  ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800', icon: '🟢' },
  férias: { label: 'Férias', color: 'bg-blue-100 text-blue-800', icon: '🔵' },
  afastado: { label: 'Afastado', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  desligado: { label: 'Desligado', color: 'bg-gray-100 text-gray-800', icon: '⚫' }
};

export default function StaffList({ staff, onAdd, onViewDetail, onEdit, onDelete, onBackToVehicles }) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();
  const [search, setSearch] = useState('');
  const [filterPosition, setFilterPosition] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  const filtered = useMemo(() => {
    return staff.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                         s.cpf.includes(search);
      const matchPosition = filterPosition === 'todos' || s.position === filterPosition;
      const matchStatus = filterStatus === 'todos' || s.status === filterStatus;
      return matchSearch && matchPosition && matchStatus;
    });
  }, [staff, search, filterPosition, filterStatus]);

  const stats = useMemo(() => ({
    total: staff.length,
    ativo: staff.filter(s => s.status === 'ativo').length,
    férias: staff.filter(s => s.status === 'férias').length,
    afastado: staff.filter(s => s.status === 'afastado').length,
    desligado: staff.filter(s => s.status === 'desligado').length
  }), [staff]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleDeleteClick = (person) => {
    openModal({
      title: 'Confirmar Exclusão',
      message: `Deseja remover ${person.name} do sistema?`,
      variant: 'danger',
      confirmText: 'Sim, Remover',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await onDelete(person.id);
          success('✅ Funcionário removido!');
        } catch (err) {
          error('❌ Erro ao remover');
        }
      }
    });
  };

  const StaffRow = ({ person, index }) => {
    const statusCfg = STATUS_CONFIG[person.status] || STATUS_CONFIG.ativo;
    const isEven = index % 2 === 0;
    return (
      <div
        className={`px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-purple-50 transition-colors cursor-pointer ${isEven ? 'bg-white' : 'bg-gray-50'}`}
        onClick={() => onViewDetail(person)}
      >
        {/* Nome + CPF */}
        <div className="col-span-3">
          <div className="font-semibold text-gray-800">{person.name}</div>
          <div className="text-xs text-gray-500">{formatCPF(person.cpf)}</div>
        </div>
        {/* Cargo + Posto */}
        <div className="col-span-2">
          <div className="text-sm font-medium text-gray-700">{person.position}</div>
          {person.post_location && (
            <div className="text-xs text-gray-500">{person.post_location}</div>
          )}
        </div>
        {/* Escala */}
        <div className="col-span-2 text-sm">
          <div className="text-gray-700">{person.shift}</div>
          <div className="text-xs text-gray-500">{person.current_schedule}</div>
        </div>
        {/* Admissão */}
        <div className="col-span-2 text-sm text-gray-600">
          {formatDate(person.hire_date)}
        </div>
        {/* Status */}
        <div className="col-span-1">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusCfg.color}`}>
            {statusCfg.icon} {statusCfg.label}
          </span>
        </div>
        {/* Ações */}
        <div className="col-span-2 flex gap-1.5 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail(person); }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1"
          >
            <UserCheck size={12} /> Ver
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(person); }}
            className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-lg text-xs"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  };

  const StaffCard = ({ person }) => {
    const statusCfg = STATUS_CONFIG[person.status] || STATUS_CONFIG.ativo;
    return (
      <div onClick={() => onViewDetail(person)} className="bg-white rounded-xl border-2 border-purple-200 p-4 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="font-bold text-gray-800">{person.name}</div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusCfg.color}`}>
            {statusCfg.icon} {statusCfg.label}
          </span>
        </div>
        <div className="text-sm text-gray-600 space-y-1 mb-3">
          <div>{person.position}</div>
          {person.post_location && <div className="text-xs">📍 {person.post_location}</div>}
          <div className="text-xs">{person.shift} • {person.current_schedule}</div>
          <div className="text-xs">Admissão: {formatDate(person.hire_date)}</div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail(person); }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1"
          >
            <UserCheck size={13} /> Ver Detalhes
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(person); }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={onBackToVehicles} className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium mb-2">
              <ArrowLeft size={20} /> Voltar
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <UserCheck className="text-purple-600" size={32} /> Pessoal Operacional
            </h1>
            <p className="text-gray-600 mt-1">👥 {staff.length} funcionário(s) cadastrado(s)</p>
          </div>
          <button
            onClick={onAdd}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md font-medium"
          >
            <Plus size={18} /> Novo Funcionário
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { key: 'total', label: 'Total', color: 'bg-purple-100 text-purple-700' },
            { key: 'ativo', label: 'Ativos', color: 'bg-green-100 text-green-700' },
            { key: 'férias', label: 'Férias', color: 'bg-blue-100 text-blue-700' },
            { key: 'afastado', label: 'Afastados', color: 'bg-orange-100 text-orange-700' },
            { key: 'desligado', label: 'Desligados', color: 'bg-gray-100 text-gray-700' }
          ].map(s => (
            <div key={s.key} className={`rounded-xl p-3 text-center ${s.color}`}>
              <div className="text-2xl font-bold">{stats[s.key]}</div>
              <div className="text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-3 text-gray-400" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
              <input
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="todos">Todos os cargos</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="todos">Todos os status</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTA */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <UserCheck size={60} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">Nenhum funcionário encontrado</h3>
            <p className="text-gray-400">Clique em "Novo Funcionário" para começar</p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden lg:block bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 py-3 grid grid-cols-12 gap-3 font-semibold text-sm">
                <div className="col-span-3">Funcionário</div>
                <div className="col-span-2">Cargo / Posto</div>
                <div className="col-span-2">Escala</div>
                <div className="col-span-2">Admissão</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-center">Ações</div>
              </div>
              <div className="divide-y divide-gray-100">
                {filtered.map((person, index) => <StaffRow key={person.id} person={person} index={index} />)}
              </div>
            </div>

            {/* MOBILE */}
            <div className="lg:hidden space-y-3">
              {filtered.map(person => <StaffCard key={person.id} person={person} />)}
            </div>
          </>
        )}
      </div>
      <ModalComponent />
    </div>
  );
}