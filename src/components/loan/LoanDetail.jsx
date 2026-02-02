import React, { useState } from 'react';
import { ArrowLeft, Package, User, MapPin, Calendar, CheckCircle, Clock, AlertCircle, FileText, Download } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { useModal } from '../ui/Modal';

export default function LoanDetail({ 
  loan, 
  onBack,
  onStartReturn,
  onGeneratePDF
}) {
  const { success } = useToast();
  const { openModal, ModalComponent } = useModal();

  const getStatusBadge = (status) => {
    const badges = {
      emprestado: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: '⏳ Emprestado' },
      devolvido: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: '✅ Devolvido' },
      atrasado: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: '⚠️ Atrasado' },
      perdido_danificado: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle, label: '❌ Perdido/Danificado' }
    };
    return badges[status] || badges.emprestado;
  };

  const statusBadge = getStatusBadge(loan.status);
  const StatusIcon = statusBadge.icon;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const canReturn = loan.status === 'emprestado' || loan.status === 'atrasado';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar para lista
            </button>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                  <Package className="text-yellow-600" size={36} />
                  Detalhes do Empréstimo
                </h1>
                <span className={`${statusBadge.bg} ${statusBadge.text} px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2`}>
                  <StatusIcon size={16} />
                  {statusBadge.label}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onGeneratePDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md font-medium"
                >
                  <Download size={18} />
                  Gerar PDF
                </button>
                
                {canReturn && (
                  <button
                    onClick={onStartReturn}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md font-medium"
                  >
                    <CheckCircle size={18} />
                    Registrar Devolução
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Empresa/Solicitante */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Solicitante
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Empresa:</span>
                  <p className="text-gray-900 font-bold text-lg">{loan.company}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Responsável:</span>
                  <p className="text-gray-900">{loan.requesterName}</p>
                </div>
                {loan.requesterCpf && (
                  <div>
                    <span className="font-semibold text-gray-700">CPF:</span>
                    <p className="text-gray-900">{loan.requesterCpf}</p>
                  </div>
                )}
                {loan.requesterPhone && (
                  <div>
                    <span className="font-semibold text-gray-700">Telefone:</span>
                    <p className="text-gray-900">{loan.requesterPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Local */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-green-600" />
                Local de Uso
              </h3>
              <p className="text-gray-900 font-bold text-lg">{loan.location}</p>
            </div>

            {/* Datas */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-purple-600" />
                Datas
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Retirada:</span>
                  <p className="text-gray-900">{formatDate(loan.loanDate)}</p>
                </div>
                {loan.expectedReturnDate && (
                  <div>
                    <span className="font-semibold text-gray-700">Previsão de Devolução:</span>
                    <p className="text-gray-900">{formatDateOnly(loan.expectedReturnDate)}</p>
                  </div>
                )}
                {loan.actualReturnDate && (
                  <div>
                    <span className="font-semibold text-gray-700">Devolução Real:</span>
                    <p className="text-gray-900">{formatDate(loan.actualReturnDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Responsáveis Arena */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-orange-600" />
                Responsáveis (Arena)
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Entregou:</span>
                  <p className="text-gray-900">{loan.deliveredBy}</p>
                </div>
                {loan.returnedBy && (
                  <div>
                    <span className="font-semibold text-gray-700">Recebeu Devolução:</span>
                    <p className="text-gray-900">{loan.returnedBy}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Itens Emprestados */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200 mb-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-yellow-600" />
              Itens Emprestados
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-yellow-300">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Item</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">Categoria</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">Emprestado</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">Devolvido</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">Condição</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {loan.items.map(item => (
                    <tr key={item.id} className="border-b border-yellow-200">
                      <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">{item.category}</td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900">{item.quantityBorrowed}</td>
                      <td className="py-3 px-4 text-center font-bold text-green-700">{item.quantityReturned || 0}</td>
                      <td className="py-3 px-4 text-center">
                        {item.condition === 'OK' && <span className="text-green-700 font-bold">✅ OK</span>}
                        {item.condition === 'Danificado' && <span className="text-orange-700 font-bold">⚠️ Danificado</span>}
                        {item.condition === 'Perdido' && <span className="text-red-700 font-bold">❌ Perdido</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        {item.damageFee > 0 ? `R$ ${item.damageFee.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total de Taxas */}
            {loan.items.some(item => item.damageFee > 0) && (
              <div className="mt-4 pt-4 border-t-2 border-yellow-300 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total de Taxas:</span>
                <span className="text-2xl font-bold text-red-700">
                  R$ {loan.items.reduce((sum, item) => sum + (item.damageFee || 0), 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Observações */}
          {loan.notes && (
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText size={20} className="text-gray-600" />
                Observações
              </h3>
              <p className="text-gray-700">{loan.notes}</p>
            </div>
          )}

        </div>
      </div>
      <ModalComponent />
    </div>
  );
}