import React from 'react';
import { Edit2, Trash2, Phone, Building2, MapPin, Calendar } from 'lucide-react';
import { getVehicleType } from '../../utils/vehicleTypes';

export default function VehicleCard({ vehicle, owner, onEdit, onDelete, onClick }) {
  const vehicleType = getVehicleType(vehicle.type);
  const VehicleIcon = vehicleType.icon;

  return (
    <div 
      className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Header com Gradiente */}
      <div className={`bg-gradient-to-r ${getGradientByType(vehicle.type)} p-4`}>
        <div className="flex justify-between items-start">
          {/* Placa */}
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border-2 border-white/50">
            <div className="font-mono font-black text-2xl text-gray-800 tracking-wider">
              {vehicle.plate}
            </div>
          </div>
          {/* Ícone */}
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <VehicleIcon className="text-white" size={28} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap mb-4">
          <span className={`${vehicleType.badgeBg} ${vehicleType.badgeText} px-3 py-1 rounded-full text-xs font-bold`}>
            {vehicle.type}
          </span>
          {vehicle.parkingLocation && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <MapPin size={12} />
              {vehicle.parkingLocation.split(' - ')[0]}
            </span>
          )}
        </div>

        {/* Marca e Modelo */}
        <div className="text-xl font-bold text-gray-800 mb-3">
          {vehicle.brand} {vehicle.model}
        </div>

        {/* Proprietário */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
          <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            👤 {owner?.name || 'Proprietário não encontrado'}
          </div>
          {owner?.phone && (
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <Phone size={12} className="text-blue-600" /> 
              {owner.phone}
            </div>
          )}
          {owner?.company && (
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <Building2 size={12} className="text-purple-600" /> 
              {owner.company}
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(vehicle);  // ✅ CORRIGIDO: passa o vehicle
            }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
          >
            <Edit2 size={16} />
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(vehicle);  // ✅ CORRIGIDO: passa o vehicle
            }}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
            title="Remover da lista (pode ser restaurado depois)"
          >
            <Trash2 size={16} />
            Remover
          </button>
        </div>

        {/* Data */}
        <div className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <Calendar size={12} />
          {vehicle.createdAt}
        </div>
      </div>
    </div>
  );
}

// Função auxiliar para gradientes por tipo
function getGradientByType(type) {
  const gradients = {
    'Carro': 'from-blue-500 to-blue-600',
    'Moto': 'from-green-500 to-green-600',
    'Caminhão': 'from-orange-500 to-orange-600',
    'Van': 'from-purple-500 to-purple-600',
    'Ônibus': 'from-red-500 to-red-600'
  };
  return gradients[type] || 'from-gray-500 to-gray-600';
}