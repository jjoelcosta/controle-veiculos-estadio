import React, { useState } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

const CATEGORIES = ['Corporativo', 'Corrida', 'Evento Esportivo', 'Feira', 'Jogo', 'Luta', 'Outro', 'Religioso', 'Show', 'Treinamento'];

export default function EventForm({ event, onSubmit, onCancel }) {
  const { error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: event?.name || '',
    category: event?.category || 'Show',
    startDate: event?.startDate || new Date().toISOString().split('T')[0],
    endDate: event?.endDate || new Date().toISOString().split('T')[0],
    status: event?.status || 'planejado',
    notes: event?.notes || ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.startDate) newErrors.startDate = 'Data início é obrigatória';
    if (formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'Data fim não pode ser anterior à data início';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { showError('Preencha os campos obrigatórios'); return; }
    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      showError(err.message || 'Erro ao salvar evento');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar size={28} />
                {event ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <button onClick={onCancel} disabled={saving} className="text-white hover:text-emerald-200">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Evento *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={saving}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors disabled:opacity-50 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 focus:border-emerald-500'
                }`}
                placeholder="Ex: Show Roberto Carlos, Jogo Flamengo x Fluminense..."
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">❌ {errors.name}</p>}
            </div>

            {/* Categoria e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="planejado">Planejado</option>
                  <option value="realizado">Realizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Início *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  disabled={saving}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300 focus:border-emerald-500'
                  }`}
                />
                {errors.startDate && <p className="text-red-600 text-sm mt-1">❌ {errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  disabled={saving}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300 focus:border-emerald-500'
                  }`}
                />
                {errors.endDate && <p className="text-red-600 text-sm mt-1">❌ {errors.endDate}</p>}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={saving}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none disabled:opacity-50 resize-none"
                placeholder="Informações adicionais sobre o evento..."
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <LoadingButton
                loading={saving}
                onClick={handleSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {event ? 'Salvar Alterações' : 'Criar Evento'}
              </LoadingButton>
              <button
                onClick={onCancel}
                disabled={saving}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}