import React, { useState, useMemo } from 'react';
import { Package, Plus, Search, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export default function LoanList({ 
  loans,
  onAdd,
  onViewDetail,
  onDelete,
  onManageInventory,
  onBackToVehicles
}) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filtrar empréstimos
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

  // Contadores por status
  const statusCounts = useMemo(() => {
    return {
      emprestado: loans.filter(l => l.status === 'emprestado').length,
      devolvido: loans.filter(l => l.status === 'devolvido').length,
      atrasado: loans.filter(l => l.status === 'atrasado').length,
      perdido_danificado: loans.filter(l => l.status === 'perdido_danificado').length
    };
  }, [loans]);

  const getStatusBadge = (status) => {
    const badges = {
      emprestado: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: '⏳ Emprestado' },
      devolvido: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: '✅ Devolvido' },
      atrasado: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: '⚠️ Atrasado' },
      perdido_danificado: { bg: 'bg-orange-100', text: 'text-orange-700', icon: XCircle, label: '❌ Perdido/Danificado' }
    };
    return badges[status] || badges.emprestado;
  };

  const handleDeleteClick = (loan) => {
    openModal({
      title: 'Confirmar Exclusão',
      message: `Deseja excluir o empréstimo para ${loan.company}?\n\nIsso restaurará as quantidades ao estoque.`,
      variant: 'danger',
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await onDelete(loan.id);
          success('✅ Empréstimo excluído com sucesso!');
        } catch (err) {
          error('❌ Erro ao excluir empréstimo');
        }
      }
    });
  };

  const LoanCard = ({ loan }) => {
    const statusBadge = getStatusBadge(loan.status);
    const StatusIcon = statusBadge.icon;

    return (
      <div 
        onClick={() => onViewDetail(loan)}
        className="bg-white rounded-xl border-2 border-yellow-200 p-5 hover:shadow-lg transition-all cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
              {loan.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-800">{loan.company}</div>
              <div className="text-sm text-gray-600">{loan.requesterName}</div>
            </div>
          </div>
          <span className={`${statusBadge.bg} ${statusBadge.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
            <StatusIcon size={14} />
            {statusBadge.label}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            📍 <span className="font-medium">Local:</span> {loan.location}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            📦 <span className="font-medium">Itens:</span> {loan.items.length} tipo(s)
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            📅 <span className="font-medium">Retirada:</span> {new Date(loan.loanDate).toLocaleDateString('pt-BR')}
          </div>
          {loan.expectedReturnDate && (
            <div className="flex items-center gap-2 text-gray-600">
              🔄 <span className="font-medium">Previsão:</span> {new Date(loan.expectedReturnDate).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>

        {/* Itens */}
        <div className="bg-yellow-50 p-3 rounded-lg mb-3">
          <div className="text-xs font-semibold text-gray-700 mb-2">Itens emprestados:</div>
          {loan.items.map(item => (
            <div key={item.id} className="text-xs text-gray-600">
              • {item.name} - <strong>{item.quantityBorrowed}x</strong>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-400 pt-3 border-t border-gray-200">
          Entregue por: {loan.deliveredBy}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <button
                onClick={onBackToVehicles}
                className="mb-4 flex items-center gap-2 text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
              >
                <ArrowLeft size={20} />
                Voltar para veículos
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Package className="text-yellow-600" size={36} />
                Controle de Empréstimos
              </h1>
              <p className="text-gray-600 mt-2">
                🎯 {loans.length} empréstimo(s) registrado(s)
              </p>
            </div>
            
            <button
              onClick={onManageInventory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md font-medium"
            >
              <Package size={20} />
              Gerenciar Estoque
            </button>

            <button
              onClick={onAdd}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md font-medium"
            >
              <Plus size={20} />
              Novo Empréstimo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-700">{statusCounts.emprestado}</div>
              <div className="text-sm text-gray-600">Emprestados</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">{statusCounts.devolvido}</div>
              <div className="text-sm text-gray-600">Devolvidos</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700">{statusCounts.atrasado}</div>
              <div className="text-sm text-gray-600">Atrasados</div>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-700">{statusCounts.perdido_danificado}</div>
              <div className="text-sm text-gray-600">Perdidos/Danif.</div>
            </div>
          </div>

          {/* Busca e Filtros */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Buscar por empresa, responsável ou local..."
                className="w-full px-4 py-3 pl-12 border-2 border-yellow-300 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400" size={20} />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus('')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === '' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('emprestado')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'emprestado' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Emprestados
              </button>
              <button
                onClick={() => setFilterStatus('atrasado')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'atrasado' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Atrasados
              </button>
              <button
                onClick={() => setFilterStatus('devolvido')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'devolvido' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Devolvidos
              </button>
            </div>
          </div>

          {/* Lista */}
          {loans.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhum empréstimo registrado</p>
              <p className="text-sm">Clique em "Novo Empréstimo" para começar</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhum empréstimo encontrado</p>
              <p className="text-sm">Tente ajustar os filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLoans.map(loan => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          )}

        </div>
      </div>
      <ModalComponent />
    </div>
  );
}