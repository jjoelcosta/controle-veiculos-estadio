import React, { useState, useEffect } from 'react';
import { X, Save, MapPin } from 'lucide-react';
import { vehicleTypes, parkingLocations } from '../../utils/vehicleTypes';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

export default function VehicleEditModal({ 
  isOpen, 
  vehicle, 
  owners, 
  onSave, 
  onClose 
}) {
  const { error } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    type: 'Carro',
    ownerId: '',
    parkingLocation: ''
  });

  // Preencher formulário quando abrir
  useEffect(() => {
    if (isOpen && vehicle) {
      setFormData({
        plate: vehicle.plate || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        type: vehicle.type || 'Carro',
        ownerId: vehicle.ownerId || '',
        parkingLocation: vehicle.parkingLocation || ''
      });
    }
  }, [isOpen, vehicle]);

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
      await onSave(vehicle.id, formData);
      onClose();
    } catch (err) {
      error('Erro ao salvar veículo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">
            ✏️ Editar Veículo
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Placa */}
            <div>
              <label htmlFor="modal-plate" className="block text-sm font-medium mb-1 text-gray-700">
                Placa *
              </label>
              <input
                id="modal-plate"
                type="text"
                value={formData.plate}
                onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                maxLength={8}
                disabled={saving}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="modal-type" className="block text-sm font-medium mb-1 text-gray-700">
                Tipo de Veículo *
              </label>
              <select
                id="modal-type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
              >
                {vehicleTypes.map(vt => (
                  <option key={vt.value} value={vt.value}>{vt.value}</option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div>
              <label htmlFor="modal-brand" className="block text-sm font-medium mb-1 text-gray-700">
                Marca *
              </label>
              <input
                id="modal-brand"
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="Toyota, Honda..."
                disabled={saving}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Modelo */}
            <div>
              <label htmlFor="modal-model" className="block text-sm font-medium mb-1 text-gray-700">
                Modelo e Cor
              </label>
              <input
                id="modal-model"
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Corolla Prata, Civic Preto..."
                disabled={saving}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Local de Estacionamento */}
            <div className="md:col-span-2">
              <label htmlFor="modal-parking" className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
                <MapPin size={14} className="text-green-600" />
                Local Autorizado para Estacionar
              </label>
              <select
                id="modal-parking"
                value={formData.parkingLocation}
                onChange={(e) => handleChange('parkingLocation', e.target.value)}
                disabled={saving}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">Selecione o local...</option>
                {parkingLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Proprietário */}
          <div className="mb-6">
            <label htmlFor="modal-owner" className="block text-sm font-medium mb-1 text-gray-700">
              Proprietário *
            </label>
            <select
              id="modal-owner"
              value={formData.ownerId}
              onChange={(e) => handleChange('ownerId', e.target.value)}
              disabled={saving}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Save size={18} />
              Salvar Alterações
            </LoadingButton>
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X size={18} />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}