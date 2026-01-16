import React, { useState } from 'react';
import { Car, Plus, Search, Filter, Download, User, MapPin } from 'lucide-react';
import VehicleCard from './VehicleCard';
import VehicleForm from './VehicleForm';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export default function VehicleList({ 
  vehicles, 
  owners, 
  onViewDetail, 
  onAdd, 
  onEdit, 
  onDelete,
  onNavigateToOwners 
}) {
  const { openModal, ModalComponent } = useModal();
  const { success } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Filtrar veículos
  const filteredVehicles = vehicles.filter(v => {
    const owner = owners.find(o => o.id === v.ownerId);
    const matchesSearch = v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === '' || v.brand === filterBrand;
    const matchesType = filterType === '' || v.type === filterType;
    const matchesLocation = filterLocation === '' || v.parkingLocation === filterLocation;
    return matchesSearch && matchesBrand && matchesType && matchesLocation;
  });

  // Listas únicas para filtros
  const uniqueBrands = [...new Set(vehicles.map(v => v.brand))].filter(Boolean).sort();
  const uniqueTypes = [...new Set(vehicles.map(v => v.type))].filter(Boolean).sort();
  const uniqueLocations = [...new Set(vehicles.map(v => v.parkingLocation))].filter(Boolean).sort();

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
      message: `Tem certeza que deseja excluir o veículo ${vehicle.plate}?`,
      variant: 'danger',
      onConfirm: () => {
        onDelete(vehicle.id);
        success('Veículo excluído com sucesso!');
      }
    });
  };

  const handleFormSubmit = (vehicleData) => {
    if (editingVehicle) {
      onEdit(editingVehicle.id, vehicleData);
    } else {
      onAdd(vehicleData);
    }
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleFormCancel = () => {
    if (owners.length === 0) {
      onNavigateToOwners();
    } else {
      setShowForm(false);
      setEditingVehicle(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Placa', 'Tipo', 'Marca', 'Modelo', 'Local', 'Proprietário', 'Telefone', 'Empresa'];
    const rows = filteredVehicles.map(v => {
      const owner = owners.find(o => o.id === v.ownerId);
      return [
        v.plate,
        v.type,
        v.brand,
        v.model,
        v.parkingLocation || '',
        owner?.name || '',
        owner?.phone || '',
        owner?.company || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `veiculos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success('Arquivo CSV exportado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Car className="text-blue-600" size={36} />
                Sistema de Controle de Veículos
              </h1>
              <p className="text-gray-600 mt-2">
                🏟️ Estacionamento do Estádio | 
                <span className="font-semibold ml-2">
                  {vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} cadastrado{vehicles.length !== 1 ? 's' : ''}
                </span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onNavigateToOwners}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md"
              >
                <User size={20} />
                Proprietários ({owners.length})
              </button>
              <button
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md"
              >
                <Plus size={20} />
                Novo Veículo
              </button>
            </div>
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="mb-6">
              <VehicleForm
                initialData={editingVehicle}
                owners={owners}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {/* Filtros */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  <Search size={16} className="inline mr-1" />
                  Buscar
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Placa ou proprietário..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  <Filter size={16} className="inline mr-1" />
                  Tipo
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Todos</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  <Filter size={16} className="inline mr-1" />
                  Marca
                </label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Todas</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  <MapPin size={16} className="inline mr-1 text-green-600" />
                  Local
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Todos</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={exportToCSV}
                disabled={filteredVehicles.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Exportar CSV
              </button>
              {(searchTerm || filterBrand || filterType || filterLocation) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBrand('');
                    setFilterType('');
                    setFilterLocation('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Contador */}
          <div className="mb-4 text-lg">
            📊 {filteredVehicles.length === vehicles.length ? (
              <>Total: <strong className="text-blue-600">{vehicles.length}</strong> veículo{vehicles.length !== 1 ? 's' : ''}</>
            ) : (
              <>Mostrando <strong className="text-blue-600">{filteredVehicles.length}</strong> de {vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''}</>
            )}
          </div>

          {/* Lista de Veículos */}
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Car size={64} className="mx-auto mb-4 opacity-30" />
              {vehicles.length === 0 ? (
                <>
                  <p className="text-lg">Nenhum veículo cadastrado ainda</p>
                  <p className="text-sm">Clique em "Novo Veículo" para começar</p>
                </>
              ) : (
                <>
                  <p className="text-lg">Nenhum veículo encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVehicles.map(vehicle => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  owner={owners.find(o => o.id === vehicle.ownerId)}
                  onEdit={() => handleEditClick(vehicle)}
                  onDelete={() => handleDeleteClick(vehicle)}
                  onClick={() => onViewDetail(vehicle)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <ModalComponent />
    </div>
  );
}