import React, { useState, useEffect } from 'react';
import { X, Save, Truck, User, Phone, Building2, Wrench, FileText } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

export default function ThirdPartyVehicleForm({ initialData, onSubmit, onCancel }) {
  const { error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    vehicleType: 'Carro',
    brand: '',
    model: '',
    color: '',
    driverName: '',
    driverPhone: '',
    company: '',
    serviceType: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Preencher formulário quando editar
  useEffect(() => {
    if (initialData) {
      setFormData({
        plate: initialData.plate || '',
        vehicleType: initialData.vehicleType || 'Carro',
        brand: initialData.brand || '',
        model: initialData.model || '',
        color: initialData.color || '',
        driverName: initialData.driverName || '',
        driverPhone: initialData.driverPhone || '',
        company: initialData.company || '',
        serviceType: initialData.serviceType || '',
        notes: initialData.notes || ''
      });
      setErrors({});
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.plate?.trim()) {
      newErrors.plate = 'Placa é obrigatória';
    }

    if (!formData.driverName?.trim()) {
      newErrors.driverName = 'Nome do motorista é obrigatório';
    }

    if (!formData.company?.trim()) {
      newErrors.company = 'Empresa é obrigatória';
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
      await onSubmit(formData);
    } catch (err) {
      showError(err.message || 'Erro ao salvar veículo');
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
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border-2 border-orange-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Truck className="text-orange-600" size={28} />
          {initialData ? 'Editar Veículo Terceiro' : 'Novo Veículo Terceiro'}
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
        
        {/* SEÇÃO: DADOS DO VEÍCULO */}
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Truck size={18} className="text-orange-600" />
            Dados do Veículo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Placa *
              </label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
                disabled={saving}
                maxLength={8}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors disabled:opacity-50 font-mono text-lg ${
                  errors.plate 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-gray-300 focus:border-orange-500'
                }`}
                placeholder="ABC-1234"
              />
              {errors.plate && (
                <p className="text-red-600 text-sm mt-1">❌ {errors.plate}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Veículo
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => handleChange('vehicleType', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50"
              >
                <option value="Carro">🚗 Carro</option>
                <option value="Moto">🏍️ Moto</option>
                <option value="Caminhão">🚚 Caminhão</option>
                <option value="Van">🚐 Van</option>
                <option value="Pickup">🛻 Pickup</option>
              </select>
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Ex: Fiat, Ford, Honda..."
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Modelo
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Ex: Uno, Ranger, CG..."
              />
            </div>

            {/* Cor */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cor
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Ex: Branco, Preto, Prata..."
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO: DADOS DO MOTORISTA */}
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <User size={18} className="text-orange-600" />
            Dados do Motorista
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => handleChange('driverName', e.target.value)}
                disabled={saving}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors disabled:opacity-50 ${
                  errors.driverName 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-gray-300 focus:border-orange-500'
                }`}
                placeholder="Nome do motorista"
              />
              {errors.driverName && (
                <p className="text-red-600 text-sm mt-1">❌ {errors.driverName}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={formData.driverPhone}
                onChange={(e) => handleChange('driverPhone', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="(61) 99999-9999"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO: EMPRESA E SERVIÇO */}
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-orange-600" />
            Empresa e Serviço
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Empresa */}
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
                    : 'border-gray-300 focus:border-orange-500'
                }`}
                placeholder="Nome da empresa"
              />
              {errors.company && (
                <p className="text-red-600 text-sm mt-1">❌ {errors.company}</p>
              )}
            </div>

            {/* Tipo de Serviço */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Serviço
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => handleChange('serviceType', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                <option value="Reforma/Construção">🔨 Reforma/Construção</option>
                <option value="Manutenção">🔧 Manutenção</option>
                <option value="Elétrica">⚡ Elétrica</option>
                <option value="Hidráulica">💧 Hidráulica</option>
                <option value="Limpeza">🧹 Limpeza</option>
                <option value="Entrega">📦 Entrega</option>
                <option value="Fornecedor">🏭 Fornecedor</option>
                <option value="Segurança">🚨 Segurança</option>
                <option value="Outro">📋 Outro</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEÇÃO: OBSERVAÇÕES */}
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-orange-600" />
            Observações
          </h3>

          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={saving}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50 resize-none"
            placeholder="Informações adicionais (ex: camarotes que atende, horários, etc)..."
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
            {initialData ? 'Salvar Alterações' : 'Cadastrar Veículo'}
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