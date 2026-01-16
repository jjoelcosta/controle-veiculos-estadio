import React from 'react';
import { User, Edit2, Trash2, Phone, Building2, Briefcase } from 'lucide-react';

export default function OwnerCard({ owner, vehicleCount, onEdit, onDelete, onClick }) {
  return (
    <div 
      className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Cabeçalho: Nome e Contador */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <User className="text-purple-600" size={24} />
          <h3 className="font-bold text-lg text-gray-800">{owner.name}</h3>
        </div>
        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
          {vehicleCount} 🚗
        </span>
      </div>

      {/* Informações do Proprietário */}
      <div className="space-y-1 text-sm mb-4">
        {owner.phone && (
          <div className="text-gray-600 flex items-center gap-1">
            <Phone size={12} /> {owner.phone}
          </div>
        )}
        {owner.company && (
          <div className="text-gray-600 flex items-center gap-1">
            <Building2 size={12} /> {owner.company}
          </div>
        )}
        {owner.position && (
          <div className="text-gray-600 flex items-center gap-1">
            <Briefcase size={12} /> {owner.position}
          </div>
        )}
        {owner.sector && (
          <div className="text-gray-600">
            📂 {owner.sector}
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-2 pt-3 border-t border-purple-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-1 text-sm"
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
        🕐 {owner.createdAt}
      </div>
    </div>
  );
}