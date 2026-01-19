import React, { useState, useEffect } from 'react';
import { Save, X, MapPin } from 'lucide-react';
import { vehicleTypes, parkingLocations } from '../../utils/vehicleTypes';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

export default function VehicleForm({ 
  initialData = null, 
  owners = [], 
  onSubmit, 
  onCancel 
}) {
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    type: 'Carro',
    ownerId: '',
    parkingLocation: ''
  });

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.plate?.trim()) {
      error('Por favor, informe a placa do veículo');
      return;
    }
    if (!formData.brand?.trim()) {
      error('Por favor, informe a marca do veículo');
      return;
    }
    if (!formData.ownerId) {
      error('Por favor, selecione um proprietário');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formData);
      success(initialData ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!');
    } catch (err) {
      error('Erro ao salvar veículo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (owners.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-yellow-600 text-2xl">⚠️</div>
          <div>
            <h3 className="font-bold text-yellow-800 mb-2">Nenhum proprietário cadastrado!</h3>
            <p className="text-yellow-700 mb-3">
              Você precisa cadastrar pelo menos um proprietário antes de adicionar veículos.
            </p>
            <button
              onClick={onCancel}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ir para Proprietários
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        {initialData ? '✏️ Editar Veículo' : '🚗 Cadastrar Novo Veículo'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Placa */}
        <div>
          <label htmlFor="vehicle-plate" className="block text-sm font-medium mb-1 text-gray-700">
            Placa *
          </label>
          <input
            id="vehicle-plate"
            name="plate"
            type="text"
            value={formData.plate}
            onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
            placeholder="ABC-1234"
            maxLength={8}
            disabled={saving}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="vehicle-type" className="block text-sm font-medium mb-1 text-gray-700">
            Tipo de Veículo *
          </label>
          <select
            id="vehicle-type"
            name="type"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            disabled={saving}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {vehicleTypes.map(vt => (
              <option key={vt.value} value={vt.value}>{vt.value}</option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div>
          <label htmlFor="vehicle-brand" className="block text-sm font-medium mb-1 text-gray-700">
            Marca *
          </label>
          <input
            id="vehicle-brand"
            name="brand"
            type="text"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="Toyota, Honda..."
            disabled={saving}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Modelo */}
        <div>
          <label htmlFor="vehicle-model" className="block text-sm font-medium mb-1 text-gray-700">
            Modelo e Cor
          </label>
          <input
            id="vehicle-model"
            name="model"
            type="text"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="Corolla Prata, Civic Preto..."
            disabled={saving}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Local de Estacionamento */}
        <div className="md:col-span-2">
          <label htmlFor="vehicle-parking" className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
            <MapPin size={14} className="text-green-600" />
            Local Autorizado para Estacionar
          </label>
          <select
            id="vehicle-parking"
            name="parkingLocation"
            value={formData.parkingLocation}
            onChange={(e) => handleChange('parkingLocation', e.target.value)}
            disabled={saving}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Selecione o local...</option>
            {parkingLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Proprietário */}
      <div className="mb-4">
        <label htmlFor="vehicle-owner" className="block text-sm font-medium mb-1 text-gray-700">
          Proprietário *
        </label>
        <select
          id="vehicle-owner"
          name="ownerId"
          value={formData.ownerId}
          onChange={(e) => handleChange('ownerId', e.target.value)}
          disabled={saving}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Selecione um proprietário...</option>
          {owners.map(owner => (
            <option key={owner.id} value={owner.id}>
              {owner.name} {owner.company ? `(${owner.company})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <LoadingButton
          loading={saving}
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <Save size={18} />
          {initialData ? 'Salvar Alterações' : 'Cadastrar'}
        </LoadingButton>
        <button
          onClick={onCancel}
          disabled={saving}
          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={18} />
          Cancelar
        </button>
      </div>
    </div>
  );
}