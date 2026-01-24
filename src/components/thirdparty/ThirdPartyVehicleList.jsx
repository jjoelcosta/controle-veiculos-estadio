import React, { useState, useMemo } from 'react';
import { Plus, Search, Truck, Edit2, Trash2, Phone, Building2, ArrowLeft } from 'lucide-react';
import ThirdPartyVehicleForm from './ThirdPartyVehicleForm';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { getVehicleType } from '../../utils/vehicleTypes';

export default function ThirdPartyVehicleList({ 
  vehicles, 
  onAdd, 
  onEdit, 
  onDelete,
  onBackToVehicles
}) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar veículos
  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    
    const search = searchTerm.toLowerCase();
    return vehicles.filter(v => 
      v.plate?.toLowerCase().includes(search) ||
      v.driverName?.toLowerCase().includes(search) ||
      v.company?.toLowerCase().includes(search) ||
      v.brand?.toLowerCase().includes(search)
    );
  }, [vehicles, searchTerm]);

  const handleAddClick = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEditClick = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (vehicle) => {
    openModal({
      title: 'Confirmar Exclusão',
      message: `Deseja remover o veículo ${vehicle.plate}?`,
      variant: 'warning',
      confirmText: 'Sim, Remover',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await onDelete(vehicle.id);
          success('✅ Veículo removido com sucesso!');
        } catch (err) {
          error('❌ Erro ao remover veículo');
        }
      }
    });
  };

  const handleFormSubmit = async (vehicleData) => {
    try {
      if (editingVehicle) {
        await onEdit(editingVehicle.id, vehicleData);
        success('✅ Veículo atualizado com sucesso!');
      } else {
        await onAdd(vehicleData);
        success('✅ Veículo cadastrado com sucesso!');
      }
      setShowForm(false);
      setEditingVehicle(null);
    } catch (err) {
      error(err.message || '❌ Erro ao salvar veículo');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  const VehicleCard = ({ vehicle }) => {
    const vehicleType = getVehicleType(vehicle.vehicleType);
    const VehicleIcon = vehicleType.icon;

    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-3">
          {/* Placa */}
          <div className="font-mono font-bold text-2xl text-blue-600 bg-blue-50 px-3 py-1 rounded border-2 border-blue-300">
            {vehicle.plate}
          </div>
          <VehicleIcon className={vehicleType.iconColor} size={28} />
        </div>

        {/* Badge tipo */}
        <div className="mb-3">
          <span className={`${vehicleType.badgeBg} ${vehicleType.badgeText} px-2 py-1 rounded text-xs font-semibold`}>
            {vehicle.vehicleType}
          </span>
        </div>

        {/* Marca/Modelo/Cor */}
        <div className="text-gray-800 font-semibold mb-3">
          {vehicle.brand} {vehicle.model}
          {vehicle.color && <span className="text-gray-500"> - {vehicle.color}</span>}
        </div>

        {/* Motorista */}
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-700">👤 {vehicle.driverName}</div>
          {vehicle.driverPhone && (
            <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
              <Phone size={12} className="text-blue-500" />
              {vehicle.driverPhone}
            </div>
          )}
        </div>

        {/* Empresa */}
        <div className="mb-2">
          <div className="text-sm text-gray-600 flex items-center gap-1">
            <Building2 size={14} className="text-purple-500" />
            {vehicle.company}
          </div>
          {vehicle.serviceType && (
            <div className="text-xs text-gray-500 mt-1">
              🔧 {vehicle.serviceType}
            </div>
          )}
        </div>

        {/* Observações */}
        {vehicle.notes && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-3">
            📝 {vehicle.notes}
          </div>
        )}

        {/* Data */}
        <div className="text-xs text-gray-400 mt-3 mb-3">
          📅 {vehicle.createdAt}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={() => handleEditClick(vehicle)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
          >
            <Edit2 size={14} />
            Editar
          </button>
          <button
            onClick={() => handleDeleteClick(vehicle)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
          >
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
                <button
                    onClick={onBackToVehicles}
                    className="mb-4 flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Voltar para veículos
                </button>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Truck className="text-orange-600" size={36} />
                    Veículos de Terceiros
                </h1>
              {!showForm && (
                <p className="text-gray-600 mt-2">
                  🚚 {vehicles.length} veículo(s) cadastrado(s)
                </p>
              )}
            </div>
            
            <button
              onClick={handleAddClick}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md"
            >
              <Plus size={20} />
              Novo Veículo Terceiro
            </button>
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="mb-6">
              <ThirdPartyVehicleForm
                initialData={editingVehicle}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {/* Busca */}
          {!showForm && vehicles.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Buscar por placa, motorista, empresa ou marca..."
                  className="w-full px-4 py-3 pl-12 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none text-lg"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" size={20} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-2">
                  📊 Mostrando <strong className="text-orange-600">{filteredVehicles.length}</strong> de {vehicles.length} veículos
                </p>
              )}
            </div>
          )}

          {/* Lista */}
          {!showForm && (
            <>
              {vehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Truck size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Nenhum veículo terceiro cadastrado</p>
                  <p className="text-sm">Clique em "Novo Veículo Terceiro" para começar</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Search size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Nenhum veículo encontrado</p>
                  <p className="text-sm">Tente ajustar sua busca</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVehicles.map(vehicle => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
      <ModalComponent />
    </div>
  );
}