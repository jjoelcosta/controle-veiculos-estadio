import React, { useState, useMemo } from 'react';
import { Package, Plus, Search, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Eye, Trash2, X, BarChart2 } from 'lucide-react';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

const STATUS_CONFIG = {
  emprestado: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Emprestado', icon: Clock },
  devolvido: { bg: 'bg-green-100', text: 'text-green-700', label: 'Devolvido', icon: CheckCircle },
  atrasado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Atrasado', icon: AlertCircle },
  perdido_danificado: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Perdido/Danif.', icon: XCircle }
};

const formatDateBR = (dateStr) => {
  if (!dateStr) return '-';
  const datePart = String(dateStr).substring(0, 10);
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

export default function LoanList({ loans, onAdd, onViewDetail, onDelete, onManageInventory, onBackToVehicles, onReports }) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchesSearch = !searchTerm ||
        loan.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || loan.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [loans, searchTerm, filterStatus]);

  const statusCounts = useMemo(() => ({
    emprestado: loans.filter(l => l.status === 'emprestado').length,
    devolvido: loans.filter(l => l.status === 'devolvido').length,
    atrasado: loans.filter(l => l.status === 'atrasado').length,
    perdido_danificado: loans.filter(l => l.status === 'perdido_danificado').length
  }), [loans]);

  const handleDeleteClick = (loan) => {
    openModal({
      title: 'Confirmar Exclusão',
      message: `Deseja excluir o empréstimo para ${loan.company}?\n\nIsso restaurará as quantidades ao estoque.`,
      variant: 'danger', confirmText: 'Sim, Excluir', cancelText: 'Cancelar',
      onConfirm: async () => {
        try { await onDelete(loan.id); success('✅ Empréstimo excluído!'); }
        catch (err) { error('❌ Erro ao excluir'); }
      }
    });
  };

  const LoanRow = ({ loan, index }) => {
    const statusCfg = STATUS_CONFIG[loan.status] || STATUS_CONFIG.emprestado;
    const StatusIcon = statusCfg.icon;
    const isEven = index % 2 === 0;
    return (
      <div
        className={`px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-yellow-50 transition-colors cursor-pointer ${isEven ? 'bg-white' : 'bg-gray-50'}`}
        onClick={() => onViewDetail(loan)}
      >
        {/* Empresa + Responsável */}
        <div className="col-span-3">
          <div className="font-semibold text-gray-800 truncate">{loan.company}</div>
          <div className="text-xs text-gray-500 truncate">{loan.requesterName}</div>
        </div>
        {/* Local */}
        <div className="col-span-2 text-sm text-gray-600 truncate">
          📍 {loan.location}
        </div>
        {/* Itens */}
        <div className="col-span-2 text-sm text-gray-600">
          <div>📦 {loan.items.length} tipo(s)</div>
          <div className="text-xs text-gray-400 truncate">
            {loan.items.slice(0, 2).map(i => i.name).join(', ')}
            {loan.items.length > 2 && '...'}
          </div>
        </div>
      
        {/* Data */}
        <div className="col-span-2 text-sm text-gray-600">
          <div>📅 {formatDateBR(loan.loanDate)}</div>
          {loan.actualReturnDate ? (
            <div className="text-xs text-green-700 font-medium">✅ {formatDateBR(loan.actualReturnDate)}</div>
          ) : loan.expectedReturnDate ? (
            <div className="text-xs text-gray-400">↩ {formatDateBR(loan.expectedReturnDate)}</div>
          ) : null}
        </div>
        {/* Status */}
        <div className="col-span-1">
          <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${statusCfg.bg} ${statusCfg.text}`}>
            <StatusIcon size={11} />{statusCfg.label}
          </span>
        </div>
        {/* Ações */}
        <div className="col-span-2 flex gap-1.5 justify-center">
          <button onClick={(e) => { e.stopPropagation(); onViewDetail(loan); }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs">
            <Eye size={12} /> Ver
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(loan); }}
            className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs">
            <Trash2 size={12} /> Excluir
          </button>
        </div>
      </div>
    );
  };

  const LoanCard = ({ loan }) => {
    const statusCfg = STATUS_CONFIG[loan.status] || STATUS_CONFIG.emprestado;
    const StatusIcon = statusCfg.icon;
    return (
      <div onClick={() => onViewDetail(loan)} className="bg-white rounded-xl border-2 border-yellow-200 p-4 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div>
            <div className="font-bold text-gray-800">{loan.company}</div>
            <div className="text-sm text-gray-500">{loan.requesterName}</div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 whitespace-nowrap ${statusCfg.bg} ${statusCfg.text}`}>
            <StatusIcon size={11} />{statusCfg.label}
          </span>
        </div>
        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <div>📍 {loan.location}</div>
          <div>📦 {loan.items.length} tipo(s): {loan.items.slice(0, 2).map(i => i.name).join(', ')}{loan.items.length > 2 && '...'}</div>
          <div>
              📅 {formatDateBR(loan.loanDate)}
              {loan.actualReturnDate 
                ? ` ✅ ${formatDateBR(loan.actualReturnDate)}` 
                : loan.expectedReturnDate 
                ? ` → ${formatDateBR(loan.expectedReturnDate)}` 
                : ''}
            </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2 mb-3 text-xs text-gray-600">
          {loan.items.map(item => <div key={item.id}>• {item.name} — <strong>{item.quantityBorrowed}x</strong></div>)}
        </div>
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button onClick={(e) => { e.stopPropagation(); onViewDetail(loan); }}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1">
            <Eye size={13} /> Ver Detalhes
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(loan); }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <button onClick={onBackToVehicles} className="mb-4 flex items-center gap-2 text-yellow-600 hover:text-yellow-800 font-medium">
                <ArrowLeft size={20} /> Voltar para veículos
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Package className="text-yellow-600" size={36} /> Controle de Empréstimos
              </h1>
              <p className="text-gray-600 mt-2">🎯 {loans.length} empréstimo(s) registrado(s)</p>
            </div>
            <div className="flex gap-3 flex-wrap">
            <button onClick={onManageInventory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md font-medium">
              <Package size={18} /> Estoque
            </button>
            <button onClick={onReports}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md font-medium">
              <BarChart2 size={18} /> Relatórios
            </button>
            <button onClick={onAdd}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md font-medium">
              <Plus size={18} /> Novo Empréstimo
            </button>
          </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { key: 'emprestado', label: 'Emprestados', color: 'bg-yellow-100 text-yellow-700' },
              { key: 'devolvido', label: 'Devolvidos', color: 'bg-green-100 text-green-700' },
              { key: 'atrasado', label: 'Atrasados', color: 'bg-red-100 text-red-700' },
              { key: 'perdido_danificado', label: 'Perdidos/Danif.', color: 'bg-orange-100 text-orange-700' }
            ].map(s => (
              <button key={s.key} onClick={() => setFilterStatus(filterStatus === s.key ? '' : s.key)}
                className={`p-3 rounded-xl text-center transition-all border-2 ${filterStatus === s.key ? 'border-gray-400 scale-95' : 'border-transparent'} ${s.color}`}>
                <div className="text-2xl font-bold">{statusCounts[s.key]}</div>
                <div className="text-xs">{s.label}</div>
              </button>
            ))}
          </div>

          {/* BUSCA */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400" size={20} />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Buscar por empresa, responsável ou local..."
                className="w-full px-4 py-3 pl-12 border-2 border-yellow-300 rounded-xl focus:border-yellow-500 focus:outline-none" />
            </div>
          </div>

          {/* LISTA */}
          {loans.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhum empréstimo registrado</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhum empréstimo encontrado</p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden lg:block bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-3 grid grid-cols-12 gap-3 font-semibold text-sm">
                  <div className="col-span-3">Empresa / Responsável</div>
                  <div className="col-span-2">Local</div>
                  <div className="col-span-2">Itens</div>
                  <div className="col-span-2">Datas</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2 text-center">Ações</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredLoans.map((loan, index) => <LoanRow key={loan.id} loan={loan} index={index} />)}
                </div>
              </div>

              {/* MOBILE */}
              <div className="lg:hidden space-y-3">
                {filteredLoans.map(loan => <LoanCard key={loan.id} loan={loan} />)}
              </div>
            </>
          )}
        </div>
      </div>
      <ModalComponent />
    </div>
  );
}