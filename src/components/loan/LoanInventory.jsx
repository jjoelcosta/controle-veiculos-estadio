import React, { useState } from 'react';
import { Package, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

export default function LoanInventory({ 
  loanItems, 
  onUpdateQuantity,
  onBack 
}) {
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [quantities, setQuantities] = useState(
    loanItems.reduce((acc, item) => {
      acc[item.id] = {
        total: item.quantityTotal || 0,
        available: item.quantityAvailable || 0
      };
      return acc;
    }, {})
  );

  const handleQuantityChange = (itemId, field, value) => {
    const numValue = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: numValue
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Atualizar cada item
      for (const itemId in quantities) {
        await onUpdateQuantity(
          itemId, 
          quantities[itemId].total, 
          quantities[itemId].available
        );
      }
      success('✅ Estoque atualizado com sucesso!');
    } catch (err) {
      error('❌ Erro ao atualizar estoque');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (category) => {
    if (category === 'Segurança') return 'bg-blue-100 text-blue-700';
    if (category === 'Sinalização') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar para empréstimos
            </button>
            
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Package className="text-yellow-600" size={36} />
              Gestão de Estoque
            </h1>
            <p className="text-gray-600 mt-2">
              Configure as quantidades disponíveis de cada item
            </p>
          </div>

          {/* Lista de Itens */}
          <div className="space-y-4 mb-6">
            {loanItems.map(item => (
              <div 
                key={item.id}
                className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl border-2 border-yellow-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <span className={`${getCategoryColor(item.category)} px-3 py-1 rounded-full text-xs font-bold`}>
                    {item.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quantidade Total */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📦 Quantidade Total no Estoque
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quantities[item.id]?.total || 0}
                      onChange={(e) => handleQuantityChange(item.id, 'total', e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none text-lg font-bold disabled:opacity-50"
                    />
                  </div>

                  {/* Quantidade Disponível */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ✅ Quantidade Disponível para Empréstimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={quantities[item.id]?.total || 0}
                      value={quantities[item.id]?.available || 0}
                      onChange={(e) => handleQuantityChange(item.id, 'available', e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none text-lg font-bold disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Alerta se disponível > total */}
                {quantities[item.id]?.available > quantities[item.id]?.total && (
                  <div className="mt-3 bg-red-100 border-2 border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
                    ⚠️ Disponível não pode ser maior que o total
                  </div>
                )}

                {/* Info */}
                <div className="mt-3 text-xs text-gray-600">
                  💰 Valor unitário: R$ {item.unitValue?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Botão Salvar */}
          <div className="flex gap-3">
            <LoadingButton
              loading={saving}
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Save size={20} />
              Salvar Estoque
            </LoadingButton>
            <button
              onClick={onBack}
              disabled={saving}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          {/* Dica */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-bold text-blue-800 mb-1">Dica</h4>
                <p className="text-sm text-blue-700">
                  <strong>Quantidade Total:</strong> Quantidade total que você possui no estádio<br/>
                  <strong>Quantidade Disponível:</strong> Quantidade que pode ser emprestada (não inclui itens já emprestados)
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}