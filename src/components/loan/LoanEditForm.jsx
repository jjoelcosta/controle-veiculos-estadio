import React, { useState } from 'react';
import { X, Save, Package, User, MapPin, Calendar } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

export default function LoanEditForm({ 
  loan,
  onSubmit, 
  onCancel 
}) {
  const { error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company: loan.company || '',
    requesterName: loan.requesterName || '',
    requesterCpf: loan.requesterCpf || '',
    requesterPhone: loan.requesterPhone || '',
    location: loan.location || '',
    deliveredBy: loan.deliveredBy || '',
    expectedReturnDate: loan.expectedReturnDate || '',
    notes: loan.notes || ''
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
      await onSubmit(loan.id, formData);
    } catch (err) {
      showError(err.message || 'Erro ao atualizar empréstimo');
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

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-yellow-600" size={28} />
          Editar Empréstimo
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

        {/* SEÇÃO: PREVISÃO DE DEVOLUÇÃO */}
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-yellow-600" />
            Previsão de Devolução
          </h3>

          <div>
            <input
              type="date"
              value={formData.expectedReturnDate}
              onChange={(e) => handleChange('expectedReturnDate', e.target.value)}
              disabled={saving}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50"
            />
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

        {/* ALERTA: ITENS NÃO PODEM SER EDITADOS */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Package className="text-blue-600 flex-shrink-0" size={24} />
            <div className="text-sm text-blue-800">
              <strong>Nota:</strong> Os itens emprestados não podem ser alterados após o cadastro. Para modificar itens, cancele este empréstimo e crie um novo.
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 pt-4">
          <LoadingButton
            loading={saving}
            onClick={handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Salvar Alterações
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