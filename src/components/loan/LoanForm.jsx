import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Package, User, MapPin, Calendar } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

export default function LoanForm({ 
  loanItems, 
  onSubmit, 
  onCancel 
}) {
   
  const { error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    requesterName: '',
    requesterCpf: '',
    requesterPhone: '',
    location: '',
    deliveredBy: '',
    loanDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    notes: '',
    items: []
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company?.trim()) {
      newErrors.company = 'Empresa é obrigatória';
    }

    if (!formData.requesterName?.trim()) {
      newErrors.requesterName = 'Nome do solicitante é obrigatório';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Local é obrigatório';
    }

    if (!formData.deliveredBy?.trim()) {
      newErrors.deliveredBy = 'Responsável pela entrega é obrigatório';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Adicione pelo menos um item';
    }

    // Validar quantidades
    formData.items.forEach((item, index) => {
      if (item.quantity <= 0) {
        newErrors[`item_${index}`] = 'Quantidade inválida';
      }
      const loanItem = loanItems.find(li => li.id === item.itemId);
      if (loanItem && item.quantity > loanItem.quantityAvailable) {
        newErrors[`item_${index}`] = `Disponível: ${loanItem.quantityAvailable}`;
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
      await onSubmit(formData);
    } catch (err) {
      showError(err.message || 'Erro ao cadastrar empréstimo');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddItem = () => {
    if (loanItems.length === 0) {
      showError('Nenhum item disponível no catálogo');
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', quantity: 1 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
    if (errors[`item_${index}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}`]: '' }));
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-yellow-600" size={28} />
          Novo Empréstimo
        </h2>
        <button
          onClick={onCancel}
          disabled={saving}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        
        {/* SEÇÃO: EMPRESA/SOLICITANTE */}
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <User size={18} className="text-yellow-600" />
            Dados do Solicitante
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Empresa *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                disabled={saving}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors disabled:opacity-50 ${
                  errors.company 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-gray-300 focus:border-yellow-500'
                }`}
                placeholder="Nome da empresa"
              />
              {errors.company && (
                <p className="text-red-600 text-sm mt-1">❌ {errors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Solicitante *
              </label>
              <input
                type="text"
                value={formData.requesterName}
                onChange={(e) => handleChange('requesterName', e.target.value)}
                disabled={saving}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors disabled:opacity-50 ${
                  errors.requesterName 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-gray-300 focus:border-yellow-500'
                }`}
                placeholder="Nome completo"
              />
              {errors.requesterName && (
                <p className="text-red-600 text-sm mt-1">❌ {errors.requesterName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CPF
              </label>
              <input
                type="text"
                value={formData.requesterCpf}
                onChange={(e) => handleChange('requesterCpf', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={formData.requesterPhone}
                onChange={(e) => handleChange('requesterPhone', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="(61) 99999-9999"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO: LOCAL E RESPONSÁVEL */}
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-yellow-600" />
            Local e Responsável pela Entrega
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Local onde será utilizado *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={saving}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors disabled:opacity-50 ${
                  errors.location 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-gray-300 focus:border-yellow-500'
                }`}
                placeholder="Ex: Portão 3, Estacionamento Norte, etc"
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-1">❌ {errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entregue por (Arena) *
              </label>
              <input
                type="text"
                value={formData.deliveredBy}
                onChange={(e) => handleChange('deliveredBy', e.target.value)}
                disabled={saving}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors disabled:opacity-50 ${
                  errors.deliveredBy 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-gray-300 focus:border-yellow-500'
                }`}
                placeholder="Nome do funcionário que entregou"
              />
              {errors.deliveredBy && (
                <p className="text-red-600 text-sm mt-1">❌ {errors.deliveredBy}</p>
              )}
            </div>
          </div>
        </div>

        {/* SEÇÃO: DATAS */}
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-yellow-600" />
            Datas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data de Retirada
              </label>
              <input
                type="date"
                value={formData.loanDate}
                onChange={(e) => handleChange('loanDate', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Previsão de Devolução
              </label>
              <input
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => handleChange('expectedReturnDate', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO: ITENS */}
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Package size={18} className="text-yellow-600" />
              Itens Emprestados
            </h3>
            <button
              onClick={handleAddItem}
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 text-sm"
            >
              <Plus size={16} />
              Adicionar Item
            </button>
          </div>

          {errors.items && (
            <p className="text-red-600 text-sm mb-3">❌ {errors.items}</p>
          )}

          <div className="space-y-3">
            {formData.items.map((item, index) => {
              const selectedItem = loanItems.find(li => li.id === item.itemId);
              
              return (
                <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <select
                        value={item.itemId}
                        onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                        disabled={saving}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">Selecione o item...</option>
                        {loanItems.map(loanItem => (
                          <option key={loanItem.id} value={loanItem.id}>
                            {loanItem.name} - Disponível: {loanItem.quantityAvailable}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        disabled={saving}
                        className={`flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                          errors[`item_${index}`]
                            ? 'border-red-500'
                            : 'border-gray-300 focus:border-yellow-500'
                        }`}
                        placeholder="Qtd"
                      />
                      <button
                        onClick={() => handleRemoveItem(index)}
                        disabled={saving}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {errors[`item_${index}`] && (
                    <p className="text-red-600 text-xs mt-1">❌ {errors[`item_${index}`]}</p>
                  )}

                  {selectedItem && (
                    <div className="text-xs text-gray-600 mt-2">
                      📦 {selectedItem.category} | 💰 Valor unitário: R$ {selectedItem.unitValue?.toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEÇÃO: OBSERVAÇÕES */}
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-gray-700 mb-4">Observações</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={saving}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50 resize-none"
            placeholder="Informações adicionais sobre o empréstimo..."
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 pt-4">
          <LoadingButton
            loading={saving}
            onClick={handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Cadastrar Empréstimo
          </LoadingButton>
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <X size={18} />
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}