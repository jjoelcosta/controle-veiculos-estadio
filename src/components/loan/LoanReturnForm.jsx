import React, { useState } from 'react';
import { ArrowLeft, Save, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

export default function LoanReturnForm({ 
  loan, 
  onSubmit,
  onCancel 
}) {
  const { error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [returnData, setReturnData] = useState({
    actualReturnDate: new Date().toISOString().split('T')[0],
    returnedBy: '',
    items: loan.items.map(item => ({
      id: item.id,
      itemId: item.itemId,
      name: item.name,
      quantityBorrowed: item.quantityBorrowed,
      quantityReturned: item.quantityBorrowed, // Default: tudo devolvido
      condition: 'OK',
      damageFee: 0,
      paymentMethod: '',
      paymentDate: '',
      notes: ''
    }))
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!returnData.returnedBy?.trim()) {
      newErrors.returnedBy = 'Responsável pela recepção é obrigatório';
    }

    // Validar se todos os itens foram processados
    returnData.items.forEach((item, index) => {
      if (item.quantityReturned < 0 || item.quantityReturned > item.quantityBorrowed) {
        newErrors[`item_${index}_qty`] = 'Quantidade inválida';
      }

      // Se tem dano, precisa ter valor da taxa
      if ((item.condition === 'Danificado' || item.condition === 'Perdido') && item.damageFee <= 0) {
        newErrors[`item_${index}_fee`] = 'Informe o valor da taxa';
      }

      // Se tem taxa, precisa ter forma de pagamento
      if (item.damageFee > 0 && !item.paymentMethod) {
        newErrors[`item_${index}_payment`] = 'Informe forma de pagamento';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(returnData);
    } catch (err) {
      showError(err.message || 'Erro ao registrar devolução');
    } finally {
      setSaving(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    setReturnData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
    
    // Limpar erros
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
    }
  };

  const handleConditionChange = (index, condition) => {
    setReturnData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        
        // Se mudar para OK, zerar taxa
        if (condition === 'OK') {
          return { 
            ...item, 
            condition, 
            damageFee: 0,
            paymentMethod: '',
            paymentDate: ''
          };
        }
        
        return { ...item, condition };
      })
    }));
  };

  const totalDamageFee = returnData.items.reduce((sum, item) => sum + (item.damageFee || 0), 0);
  const hasAnyDamage = returnData.items.some(item => item.condition !== 'OK');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onCancel}
              className="mb-4 flex items-center gap-2 text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={36} />
              Registrar Devolução
            </h1>
            <p className="text-gray-600 mt-2">
              Empresa: <strong>{loan.company}</strong> | Solicitante: <strong>{loan.requesterName}</strong>
            </p>
          </div>

          {/* Dados da Devolução */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Dados da Devolução</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data da Devolução *
                </label>
                <input
                  type="date"
                  value={returnData.actualReturnDate}
                  onChange={(e) => setReturnData(prev => ({ ...prev, actualReturnDate: e.target.value }))}
                  disabled={saving}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recebido por (Arena) *
                </label>
                <input
                  type="text"
                  value={returnData.returnedBy}
                  onChange={(e) => setReturnData(prev => ({ ...prev, returnedBy: e.target.value }))}
                  disabled={saving}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                    errors.returnedBy 
                      ? 'border-red-500 focus:border-red-600' 
                      : 'border-gray-300 focus:border-green-500'
                  }`}
                  placeholder="Nome do funcionário que recebeu"
                />
                {errors.returnedBy && (
                  <p className="text-red-600 text-sm mt-1">❌ {errors.returnedBy}</p>
                )}
              </div>
            </div>
          </div>

          {/* Itens */}
          <div className="space-y-4 mb-6">
            {returnData.items.map((item, index) => (
              <div 
                key={item.id}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200"
              >
                <h4 className="font-bold text-gray-800 text-lg mb-4">{item.name}</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Quantidade Devolvida */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantidade Devolvida *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={item.quantityBorrowed}
                        value={item.quantityReturned}
                        onChange={(e) => handleItemChange(index, 'quantityReturned', parseInt(e.target.value) || 0)}
                        disabled={saving}
                        className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 text-lg font-bold ${
                          errors[`item_${index}_qty`]
                            ? 'border-red-500'
                            : 'border-gray-300 focus:border-green-500'
                        }`}
                      />
                      <span className="text-gray-600 font-medium">de {item.quantityBorrowed}</span>
                    </div>
                    {errors[`item_${index}_qty`] && (
                      <p className="text-red-600 text-sm mt-1">❌ {errors[`item_${index}_qty`]}</p>
                    )}
                  </div>

                  {/* Condição */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Condição *
                    </label>
                    <select
                      value={item.condition}
                      onChange={(e) => handleConditionChange(index, e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none disabled:opacity-50 font-bold"
                    >
                      <option value="OK">✅ OK</option>
                      <option value="Danificado">⚠️ Danificado</option>
                      <option value="Perdido">❌ Perdido</option>
                    </select>
                  </div>

                  {/* Taxa de Dano/Perda */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Taxa (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.damageFee}
                      onChange={(e) => handleItemChange(index, 'damageFee', parseFloat(e.target.value) || 0)}
                      disabled={saving || item.condition === 'OK'}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 disabled:bg-gray-100 text-lg font-bold ${
                        errors[`item_${index}_fee`]
                          ? 'border-red-500'
                          : 'border-gray-300 focus:border-red-500'
                      }`}
                      placeholder="0.00"
                    />
                    {errors[`item_${index}_fee`] && (
                      <p className="text-red-600 text-sm mt-1">❌ {errors[`item_${index}_fee`]}</p>
                    )}
                  </div>
                </div>

                {/* Se tem taxa, mostrar forma de pagamento */}
                {item.damageFee > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-yellow-300">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Forma de Pagamento *
                      </label>
                      <select
                        value={item.paymentMethod}
                        onChange={(e) => handleItemChange(index, 'paymentMethod', e.target.value)}
                        disabled={saving}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                          errors[`item_${index}_payment`]
                            ? 'border-red-500'
                            : 'border-gray-300 focus:border-green-500'
                        }`}
                      >
                        <option value="">Selecione...</option>
                        <option value="Dinheiro">💵 Dinheiro</option>
                        <option value="PIX">📱 PIX</option>
                        <option value="Cartão">💳 Cartão</option>
                        <option value="Boleto">🧾 Boleto</option>
                        <option value="Transferência">🏦 Transferência</option>
                        <option value="A Pagar">⏳ A Pagar</option>
                      </select>
                      {errors[`item_${index}_payment`] && (
                        <p className="text-red-600 text-sm mt-1">❌ {errors[`item_${index}_payment`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Data do Pagamento
                      </label>
                      <input
                        type="date"
                        value={item.paymentDate}
                        onChange={(e) => handleItemChange(index, 'paymentDate', e.target.value)}
                        disabled={saving}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {/* Observações do item */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observações sobre este item
                  </label>
                  <textarea
                    value={item.notes}
                    onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                    disabled={saving}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none disabled:opacity-50 resize-none"
                    placeholder="Ex: Cone com rachadura na lateral..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Resumo de Taxas */}
          {hasAnyDamage && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-red-600" />
                Resumo de Taxas
              </h3>
              
              <div className="space-y-2 mb-4">
                {returnData.items
                  .filter(item => item.damageFee > 0)
                  .map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">
                        {item.name} ({item.condition}):
                      </span>
                      <span className="font-bold text-red-700">
                        R$ {item.damageFee.toFixed(2)}
                      </span>
                    </div>
                  ))
                }
              </div>

              <div className="pt-4 border-t-2 border-red-300 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">TOTAL A PAGAR:</span>
                <span className="text-3xl font-bold text-red-700">
                  R$ {totalDamageFee.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <LoadingButton
              loading={saving}
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Save size={20} />
              Confirmar Devolução
            </LoadingButton>
            <button
              onClick={onCancel}
              disabled={saving}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          {/* Alerta */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="text-blue-600 flex-shrink-0" size={24} />
              <div className="text-sm text-blue-800">
                <strong>Atenção:</strong> Ao confirmar a devolução, as quantidades serão automaticamente atualizadas no estoque. Itens marcados como "OK" serão devolvidos ao estoque disponível.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}