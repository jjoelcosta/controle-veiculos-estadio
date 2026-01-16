import React, { useState, useEffect } from 'react';
import { Save, X, MapPin } from 'lucide-react';
import { vehicleTypes, parkingLocations } from '../../utils/vehicleTypes';
import { useToast } from '../ui/Toast';

export default function VehicleForm({ 
  initialData = null, 
  owners = [], 
  onSubmit, 
  onCancel 
}) {
  const { success, error } = useToast();
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

  const handleSubmit = () => {
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

    onSubmit(formData);
    success(initialData ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!');
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
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Placa *
          </label>
          <input
            type="text"
            value={formData.plate}
            onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
            placeholder="ABC-1234"
            maxLength={8}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Tipo *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            {vehicleTypes.map(vt => (
              <option key={vt.value} value={vt.value}>{vt.value}</option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Marca *
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="Toyota, Honda..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Modelo
          </label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="Corolla, Civic..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Local de Estacionamento */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
            <MapPin size={14} className="text-green-600" />
            Local Autorizado para Estacionar
          </label>
          <select
            value={formData.parkingLocation}
            onChange={(e) => handleChange('parkingLocation', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
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
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Proprietário *
        </label>
        <select
          value={formData.ownerId}
          onChange={(e) => handleChange('ownerId', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
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
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Save size={18} />
          {initialData ? 'Salvar Alterações' : 'Cadastrar'}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <X size={18} />
          Cancelar
        </button>
      </div>
    </div>
  );
}