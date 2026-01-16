import React from 'react';
import { Edit2, Trash2, Phone, Building2, MapPin } from 'lucide-react';
import { getVehicleType } from '../../utils/vehicleTypes';

export default function VehicleCard({ vehicle, owner, onEdit, onDelete, onClick }) {
  const vehicleType = getVehicleType(vehicle.type);
  const VehicleIcon = vehicleType.icon;

  return (
    <div 
      className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Cabeçalho: Placa e Ícone */}
      <div className="flex justify-between items-start mb-3">
        <div className="font-mono font-bold text-xl text-blue-600 bg-white px-3 py-1 rounded border-2 border-blue-300">
          {vehicle.plate}
        </div>
        <VehicleIcon className={vehicleType.iconColor} size={24} />
      </div>

      {/* Badges: Tipo e Localização */}
      <div className="mb-2 flex gap-2 flex-wrap">
        <span className={`${vehicleType.badgeBg} ${vehicleType.badgeText} px-2 py-1 rounded text-xs font-semibold`}>
          {vehicle.type}
        </span>
        {vehicle.parkingLocation && (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
            <MapPin size={10} />
            {vehicle.parkingLocation.split(' - ')[0]}
          </span>
        )}
      </div>

      {/* Marca e Modelo */}
      <div className="text-gray-800 font-semibold mb-2">
        {vehicle.brand} {vehicle.model}
      </div>

      {/* Informações do Proprietário */}
      <div className="space-y-1 text-sm">
        <div className="text-gray-700 flex items-center gap-1">
          👤 {owner?.name || 'Proprietário não encontrado'}
        </div>
        {owner?.phone && (
          <div className="text-gray-600 flex items-center gap-1">
            <Phone size={12} /> {owner.phone}
          </div>
        )}
        {owner?.company && (
          <div className="text-gray-600 flex items-center gap-1">
            <Building2 size={12} /> {owner.company}
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-1 text-sm"
        >
          <Edit2 size={14} />
          Editar
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-1 text-sm"
        >
          <Trash2 size={14} />
          Excluir
        </button>
      </div>

      {/* Data de Cadastro */}
      <div className="text-xs text-gray-400 mt-3">
        🕐 {vehicle.createdAt}
      </div>
    </div>
  );
}