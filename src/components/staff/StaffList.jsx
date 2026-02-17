import React, { useState, useMemo } from 'react';
import {
  Plus, Search, UserCheck, Trash2, ArrowLeft, X,
  Briefcase, Sun, Moon, Clock
} from 'lucide-react';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

const POSITIONS_OPERACIONAL = [
  'Agente de Portaria',
  'Auxiliar de Segurança',
  'Segurança Motorizado',
  'Técnico de Monitoramento'
];

const POSITIONS_ADMINISTRATIVO = [
  'Gerente',
  'Supervisor',
  'Coordenador do CCO',
  'Analista de Segurança',
  'Analista Operacional'
];

const STATUS_CONFIG = {
  ativo:     { label: 'Ativo',     color: 'bg-green-100 text-green-800',  icon: '🟢' },
  férias:    { label: 'Férias',    color: 'bg-blue-100 text-blue-800',    icon: '🔵' },
  afastado:  { label: 'Afastado', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  desligado: { label: 'Desligado',color: 'bg-gray-100 text-gray-800',     icon: '⚫' }
};

export default function StaffList({
  staff, onAdd, onViewDetail, onEdit, onDelete, onBackToVehicles
}) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('operacional');
  const [search, setSearch] = useState('');
  const [filterPosition, setFilterPosition] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  const operacional = useMemo(() =>
    staff.filter(s => s.team_type === 'operacional' || !s.team_type),
    [staff]);

  const administrativo = useMemo(() =>
    staff.filter(s => s.team_type === 'administrativo'),
    [staff]);

  const currentList = activeTab === 'operacional' ? operacional : administrativo;
  const positions = activeTab === 'operacional' ? POSITIONS_OPERACIONAL : POSITIONS_ADMINISTRATIVO;

  const filtered = useMemo(() => {
    return currentList.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.cpf?.includes(search);
      const matchPosition = filterPosition === 'todos' || s.position === filterPosition;
      const matchStatus = filterStatus === 'todos' || s.status === filterStatus;
      return matchSearch && matchPosition && matchStatus;
    });
  }, [currentList, search, filterPosition, filterStatus]);

  const stats = useMemo(() => ({
    op_total: operacional.length,
    op_ativo: operacional.filter(s => s.status === 'ativo').length,
    adm_total: administrativo.length,
    adm_ativo: administrativo.filter(s => s.status === 'ativo').length,
  }), [operacional, administrativo]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '-';
    const d = cpf.replace(/\D/g, '');
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  };

  const handleDeleteClick = (person) => {
    openModal({
      title: 'Confirmar Exclusão',
      message: `Deseja remover ${person.name} do sistema?`,
      variant: 'danger',
      confirmText: 'Sim, Remover',
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

  const StaffCard = ({ person }) => {
    const statusCfg = STATUS_CONFIG[person.status] || STATUS_CONFIG.ativo;
    const isAdm = person.team_type === 'administrativo';
    return (
      <div
        onClick={() => onViewDetail(person)}
        className={`bg-white rounded-xl border-2 p-4 hover:shadow-lg transition-all cursor-pointer ${
          isAdm ? 'border-indigo-200' : 'border-purple-200'
        }`}
      >
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="font-bold text-gray-800">{person.name}</div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusCfg.color}`}>
            {statusCfg.icon} {statusCfg.label}
          </span>
        </div>
        <div className="text-sm text-gray-600 space-y-1 mb-3">
          <div className="font-medium">{person.position}</div>
          {person.post_location && <div className="text-xs">📍 {person.post_location}</div>}
          {isAdm ? (
            <div className="text-xs">🕐 Horário Comercial • Seg–Sex</div>
          ) : (
            <div className="text-xs">
              {person.shift === 'Diurno' ? '☀️' : '🌙'} {person.shift} • {person.current_schedule}
            </div>
          )}
          <div className="text-xs text-gray-400">Admissão: {formatDate(person.hire_date)}</div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail(person); }}
            className={`flex-1 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
              isAdm
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
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

  const StaffRow = ({ person, index }) => {
    const statusCfg = STATUS_CONFIG[person.status] || STATUS_CONFIG.ativo;
    const isAdm = person.team_type === 'administrativo';
    return (
      <div
        className={`px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-purple-50 transition-colors cursor-pointer ${
          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
        }`}
        onClick={() => onViewDetail(person)}
      >
        <div className="col-span-3">
          <div className="font-semibold text-gray-800">{person.name}</div>
          <div className="text-xs text-gray-500">{formatCPF(person.cpf)}</div>
        </div>
        <div className="col-span-2">
          <div className="text-sm font-medium text-gray-700">{person.position}</div>
          {person.post_location && (
            <div className="text-xs text-gray-500">{person.post_location}</div>
          )}
        </div>
        <div className="col-span-2 text-sm">
          {isAdm ? (
            <div className="text-gray-600 text-xs">🕐 Comercial Seg–Sex</div>
          ) : (
            <>
              <div className="text-gray-700">{person.shift}</div>
              <div className="text-xs text-gray-500">{person.current_schedule}</div>
            </>
          )}
        </div>
        <div className="col-span-2 text-sm text-gray-600">
          {formatDate(person.hire_date)}
        </div>
        <div className="col-span-1">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusCfg.color}`}>
            {statusCfg.icon} {statusCfg.label}
          </span>
        </div>
        <div className="col-span-2 flex gap-1.5 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail(person); }}
            className={`text-white px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
              isAdm
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={onBackToVehicles}
              className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium mb-2"
            >
              <ArrowLeft size={20} /> Voltar
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <UserCheck className="text-purple-600" size={32} /> Gestão de Pessoal
            </h1>
          </div>
          <button
            onClick={() => onAdd(activeTab)}
            className={`text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md font-medium ${
              activeTab === 'administrativo'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <Plus size={18} />
            {activeTab === 'administrativo' ? 'Nova Equipe Adm.' : 'Novo Operacional'}
          </button>
        </div>

        {/* TABS PRINCIPAIS */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('operacional'); setFilterPosition('todos'); }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'operacional'
                  ? 'border-purple-500 text-purple-700 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sun size={16} />
              Operacional
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'operacional'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {stats.op_ativo} ativos / {stats.op_total}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('administrativo'); setFilterPosition('todos'); }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'administrativo'
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase size={16} />
              Administrativo
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'administrativo'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {stats.adm_ativo} ativos / {stats.adm_total}
              </span>
            </button>
          </div>

          {/* FILTROS */}
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-gray-400">
                    <X size={14} />
                  </button>
                )}
                <input
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
              >
                <option value="todos">Todos os cargos</option>
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
              >
                <option value="todos">Todos os status</option>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LISTA */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <UserCheck size={60} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">
              {activeTab === 'administrativo'
                ? 'Nenhum membro da equipe administrativa cadastrado'
                : 'Nenhum funcionário operacional cadastrado'}
            </h3>
            <p className="text-gray-400">
              Clique em "{activeTab === 'administrativo' ? 'Nova Equipe Adm.' : 'Novo Operacional'}" para começar
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden lg:block bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className={`text-white px-4 py-3 grid grid-cols-12 gap-3 font-semibold text-sm ${
                activeTab === 'administrativo'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-700'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-700'
              }`}>
                <div className="col-span-3">Funcionário</div>
                <div className="col-span-2">Cargo / Posto</div>
                <div className="col-span-2">Escala</div>
                <div className="col-span-2">Admissão</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-center">Ações</div>
              </div>
              <div className="divide-y divide-gray-100">
                {filtered.map((person, index) => (
                  <StaffRow key={person.id} person={person} index={index} />
                ))}
              </div>
            </div>

            {/* MOBILE */}
            <div className="lg:hidden space-y-3">
              {filtered.map(person => (
                <StaffCard key={person.id} person={person} />
              ))}
            </div>
          </>
        )}
      </div>
      <ModalComponent />
    </div>
  );
}