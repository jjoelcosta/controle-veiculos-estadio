import React from 'react';
import { ArrowLeft, User, Edit2, Trash2, Phone, Building2, Briefcase, Car, Plus, MapPin } from 'lucide-react';
import { getVehicleType } from '../../utils/vehicleTypes';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export default function OwnerDetail({ 
  owner, 
  vehicles, 
  onBack, 
  onEdit, 
  onDelete,
  onEditVehicle,
  onDeleteVehicle 
}) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();

  const handleDelete = () => {
    if (vehicles.length > 0) {
      error(`Não é possível excluir! Este proprietário tem ${vehicles.length} veículo(s) cadastrado(s).`);
      return;
    }

    openModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o proprietário ${owner.name}?`,
      variant: 'danger',
      onConfirm: () => {
        const result = onDelete(owner.id);
        if (result.success) {
          success('Proprietário excluído com sucesso!');
        } else {
          error(result.message);
        }
      }
    });
  };

  const handleDeleteVehicle = (vehicleId, plate) => {
    openModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o veículo ${plate}?`,
      variant: 'danger',
      onConfirm: () => {
        onDeleteVehicle(vehicleId);
        success('Veículo excluído com sucesso!');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Botão Voltar */}
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para proprietários
          </button>

          {/* Cabeçalho */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <User className="text-purple-600" size={40} />
                  {owner.name}
                </h1>
                <p className="text-gray-600">
                  {vehicles.length} veículo(s) cadastrado(s)
                </p>
              </div>
            </div>
          </div>

          {/* Informações do Proprietário */}
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Briefcase size={24} className="text-purple-600" />
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm text-gray-600 font-medium flex items-center gap-1">
                    <Phone size={14} /> Telefone
                  </label>
                  <p className="text-lg font-semibold text-gray-800">{owner.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium flex items-center gap-1">
                    <Building2 size={14} /> Empresa
                  </label>
                  <p className="text-lg font-semibold text-gray-800">{owner.company || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Cargo</label>
                  <p className="text-lg font-semibold text-gray-800">{owner.position || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Setor</label>
                  <p className="text-lg font-semibold text-gray-800">{owner.sector || '—'}</p>
                </div>
              </div>
            </section>

            {/* Veículos do Proprietário */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <Car size={24} className="text-blue-600" />
                  Veículos Cadastrados ({vehicles.length})
                </h2>
              </div>

              {vehicles.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                  <Car size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Nenhum veículo cadastrado para este proprietário</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map(v => {
                    const vehicleType = getVehicleType(v.type);
                    const VehicleIcon = vehicleType.icon;

                    return (
                      <div 
                        key={v.id} 
                        className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-mono font-bold text-xl text-blue-600 bg-white px-3 py-1 rounded border-2 border-blue-300">
                            {v.plate}
                          </div>
                          <VehicleIcon className={vehicleType.iconColor} size={24} />
                        </div>

                        <div className="mb-2">
                          <span className={`${vehicleType.badgeBg} ${vehicleType.badgeText} px-2 py-1 rounded text-xs font-semibold`}>
                            {v.type}
                          </span>
                        </div>
                        
                        <div className="text-gray-800 font-semibold mb-2">{v.brand} {v.model}</div>

                        {v.parkingLocation && (
                          <div className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                            <MapPin size={12} className="text-green-600" />
                            {v.parkingLocation}
                          </div>
                        )}

                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-300">
                          <button
                            onClick={() => onEditVehicle(v.id, v)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-1 text-sm"
                          >
                            <Edit2 size={14} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(v.id, v.plate)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-1 text-sm"
                          >
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        </div>

                        <div className="text-xs text-gray-400 mt-3">
                          🕐 {v.createdAt}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Ações do Proprietário */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => onEdit(owner.id, owner)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={18} />
                Editar Proprietário
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Excluir Proprietário
              </button>
            </div>
          </div>
        </div>
      </div>
      <ModalComponent />
    </div>
  );
}
