import React, { useState, useMemo } from 'react';
import { Plus, Search, Truck, Edit2, Trash2, Phone, Building2, ArrowLeft, X } from 'lucide-react';
import ThirdPartyVehicleForm from './ThirdPartyVehicleForm';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { getVehicleType } from '../../utils/vehicleTypes';

export default function ThirdPartyVehicleList({ vehicles, onAdd, onEdit, onDelete, onBackToVehicles }) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleAddClick = () => { setEditingVehicle(null); setShowForm(true); };
  const handleEditClick = (vehicle) => { setEditingVehicle(vehicle); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleDeleteClick = (vehicle) => {
    openModal({
      title: 'Confirmar Exclusão',
      message: `Deseja remover o veículo ${vehicle.plate}?`,
      variant: 'warning', confirmText: 'Sim, Remover', cancelText: 'Cancelar',
      onConfirm: async () => {
        try { await onDelete(vehicle.id); success('✅ Veículo removido!'); }
        catch (err) { error('❌ Erro ao remover'); }
      }
    });
  };

  const handleFormSubmit = async (vehicleData) => {
    try {
      if (editingVehicle) { await onEdit(editingVehicle.id, vehicleData); success('✅ Veículo atualizado!'); }
      else { await onAdd(vehicleData); success('✅ Veículo cadastrado!'); }
      setShowForm(false); setEditingVehicle(null);
    } catch (err) { error(err.message || '❌ Erro ao salvar'); }
  };

  const VehicleRow = ({ vehicle, index }) => {
    const vehicleType = getVehicleType(vehicle.vehicleType);
    const VehicleIcon = vehicleType.icon;
    const isEven = index % 2 === 0;
    return (
      <div className={`px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-orange-50 transition-colors ${isEven ? 'bg-white' : 'bg-gray-50'}`}>
        {/* Placa */}
        <div className="col-span-2">
          <div className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 text-center text-sm">
            {vehicle.plate}
          </div>
        </div>
        {/* Tipo + Marca */}
        <div className="col-span-2">
          <div className="flex items-center gap-1.5">
            <VehicleIcon size={16} className={vehicleType.iconColor} />
            <span className="text-sm font-medium text-gray-700">{vehicle.vehicleType}</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{vehicle.brand} {vehicle.model}</div>
        </div>
        {/* Motorista */}
        <div className="col-span-3">
          <div className="text-sm font-medium text-gray-800">{vehicle.driverName}</div>
          {vehicle.driverPhone && (
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone size={11} className="text-blue-500" />{vehicle.driverPhone}
            </div>
          )}
        </div>
        {/* Empresa */}
        <div className="col-span-3">
          <div className="text-sm text-gray-700 flex items-center gap-1">
            <Building2 size={13} className="text-purple-500 flex-shrink-0" />
            <span className="truncate">{vehicle.company}</span>
          </div>
          {vehicle.serviceType && (
            <div className="text-xs text-gray-500 mt-0.5">🔧 {vehicle.serviceType}</div>
          )}
        </div>
        {/* Ações */}
        <div className="col-span-2 flex gap-1.5 justify-center">
          <button onClick={() => handleEditClick(vehicle)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs">
            <Edit2 size={12} /> Editar
          </button>
          <button onClick={() => handleDeleteClick(vehicle)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs">
            <Trash2 size={12} /> Remover
          </button>
        </div>
      </div>
    );
  };

  const VehicleCard = ({ vehicle }) => {
    const vehicleType = getVehicleType(vehicle.vehicleType);
    const VehicleIcon = vehicleType.icon;
    return (
      <div className="bg-white rounded-xl border-2 border-orange-200 p-4 hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-3">
          <div className="font-mono font-bold text-xl text-blue-700 bg-blue-50 px-3 py-1 rounded border-2 border-blue-300">
            {vehicle.plate}
          </div>
          <div className="flex items-center gap-1.5">
            <VehicleIcon size={20} className={vehicleType.iconColor} />
            <span className={`text-xs px-2 py-1 rounded font-semibold ${vehicleType.badgeBg} ${vehicleType.badgeText}`}>
              {vehicle.vehicleType}
            </span>
          </div>
        </div>
        <div className="font-semibold text-gray-800 mb-2">{vehicle.brand} {vehicle.model}
          {vehicle.color && <span className="text-gray-500 font-normal"> - {vehicle.color}</span>}
        </div>
        <div className="space-y-1.5 text-sm mb-3">
          <div className="text-gray-700 font-medium">👤 {vehicle.driverName}</div>
          {vehicle.driverPhone && <div className="text-gray-500 flex items-center gap-1"><Phone size={12} className="text-blue-500" />{vehicle.driverPhone}</div>}
          <div className="text-gray-600 flex items-center gap-1"><Building2 size={13} className="text-purple-500" />{vehicle.company}</div>
          {vehicle.serviceType && <div className="text-gray-500 text-xs">🔧 {vehicle.serviceType}</div>}
        </div>
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button onClick={() => handleEditClick(vehicle)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1">
            <Edit2 size={13} /> Editar
          </button>
          <button onClick={() => handleDeleteClick(vehicle)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1">
            <Trash2 size={13} /> Remover
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <button onClick={onBackToVehicles} className="mb-4 flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium">
                <ArrowLeft size={20} /> Voltar para veículos
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Truck className="text-orange-600" size={36} /> Veículos de Terceiros
              </h1>
              {!showForm && <p className="text-gray-600 mt-2">🚚 {vehicles.length} veículo(s) cadastrado(s)</p>}
            </div>
            <button onClick={handleAddClick}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md font-medium">
              <Plus size={20} /> Novo Veículo Terceiro
            </button>
          </div>

          {/* FORMULÁRIO */}
          {showForm && (
            <div className="mb-6">
              <ThirdPartyVehicleForm initialData={editingVehicle} onSubmit={handleFormSubmit} onCancel={() => { setShowForm(false); setEditingVehicle(null); }} />
            </div>
          )}

          {/* BUSCA */}
          {!showForm && vehicles.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={20} />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Buscar por placa, motorista, empresa ou marca..."
                  className="w-full px-4 py-3 pl-12 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none" />
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-2">
                  📊 Mostrando <strong className="text-orange-600">{filteredVehicles.length}</strong> de {vehicles.length} veículos
                </p>
              )}
            </div>
          )}

          {/* LISTA */}
          {!showForm && (
            <>
              {vehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Truck size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Nenhum veículo terceiro cadastrado</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Search size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Nenhum veículo encontrado</p>
                </div>
              ) : (
                <>
                  {/* DESKTOP */}
                  <div className="hidden lg:block bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 grid grid-cols-12 gap-3 font-semibold text-sm">
                      <div className="col-span-2">Placa</div>
                      <div className="col-span-2">Tipo / Modelo</div>
                      <div className="col-span-3">Motorista</div>
                      <div className="col-span-3">Empresa</div>
                      <div className="col-span-2 text-center">Ações</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {filteredVehicles.map((vehicle, index) => <VehicleRow key={vehicle.id} vehicle={vehicle} index={index} />)}
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div className="lg:hidden space-y-3">
                    {filteredVehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <ModalComponent />
    </div>
  );
}