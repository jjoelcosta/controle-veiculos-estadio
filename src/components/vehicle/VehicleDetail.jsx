import React from 'react';
import { ArrowLeft, Edit2, Trash2, User, MapPin } from 'lucide-react';
import { getVehicleType } from '../../utils/vehicleTypes';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export default function VehicleDetail({ vehicle, owner, onBack, onEdit, onDelete }) {
  const { openModal, ModalComponent } = useModal();
  const { success } = useToast();
  const vehicleType = getVehicleType(vehicle.type);
  const VehicleIcon = vehicleType.icon;

  const handleDelete = () => {
    openModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o veículo ${vehicle.plate}?`,
      variant: 'danger',
      onConfirm: () => {
        onDelete(vehicle.id);
        success('Veículo excluído com sucesso!');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para a lista
          </button>

          <div className="border-b pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Detalhes do Veículo</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="font-mono text-4xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border-2 border-blue-300">
                    {vehicle.plate}
                  </div>
                  <span className={`${vehicleType.badgeBg} ${vehicleType.badgeText} px-3 py-1 rounded-full text-sm font-semibold`}>
                    {vehicle.type}
                  </span>
                  {vehicle.parkingLocation && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <MapPin size={14} />
                      {vehicle.parkingLocation}
                    </span>
                  )}
                </div>
              </div>
              <VehicleIcon className={vehicleType.iconColor} size={64} />
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <VehicleIcon size={24} className={vehicleType.iconColor} />
                Dados do Veículo
              </h2>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm text-gray-600 font-medium">Tipo</label>
                  <p className="text-lg font-semibold text-gray-800">{vehicle.type}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Marca</label>
                  <p className="text-lg font-semibold text-gray-800">{vehicle.brand}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Modelo</label>
                  <p className="text-lg font-semibold text-gray-800">{vehicle.model || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium flex items-center gap-1">
                    <MapPin size={14} className="text-green-600" />
                    Local Autorizado
                  </label>
                  <p className="text-lg font-semibold text-gray-800">{vehicle.parkingLocation || 'Não definido'}</p>
                </div>
              </div>
            </section>

            {owner && (
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <User size={24} className="text-purple-600" />
                  Dados do Proprietário
                </h2>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Nome</label>
                    <p className="text-lg font-semibold text-gray-800">{owner.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Telefone</label>
                    <p className="text-lg font-semibold text-gray-800">{owner.phone || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Empresa</label>
                    <p className="text-lg font-semibold text-gray-800">{owner.company || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Cargo</label>
                    <p className="text-lg font-semibold text-gray-800">{owner.position || '—'}</p>
                  </div>
                </div>
              </section>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => onEdit(vehicle.id, vehicle)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={18} />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
      <ModalComponent />
    </div>
  );
}
