import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

export default function VehicleList({
  vehicles = [],
  onAdd,
  onBack
}) {
  return (
    <div className="p-6">
      <button onClick={onBack} className="flex items-center gap-2 mb-6">
        <ArrowLeft size={20} />
        Voltar
      </button>

      <button
        onClick={onAdd}
        className="bg-purple-600 text-white px-4 py-2 rounded mb-4 flex items-center gap-2"
      >
        <Plus size={18} />
        Novo Veículo
      </button>

      {vehicles.map(v => (
        <div key={v.id} className="border p-4 rounded mb-2">
          {v.plate}
        </div>
      ))}
    </div>
  );
}
