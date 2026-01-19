import React, { useState } from 'react';
import { Plus, Search, Filter, Download, User, MapPin, Building2, Briefcase, X } from 'lucide-react';
import VehicleCard from './VehicleCard';
import VehicleForm from './VehicleForm';
import Header from '../ui/Header';
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
  
  // Estados de busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [showResults, setShowResults] = useState(false); // 🔒 PRIVACIDADE

  // Filtrar veículos
  const filteredVehicles = vehicles.filter(v => {
    const owner = owners.find(o => o.id === v.ownerId);
    const matchesSearch = 
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === '' || v.brand === filterBrand;
    const matchesType = filterType === '' || v.type === filterType;
    const matchesLocation = filterLocation === '' || v.parkingLocation === filterLocation;
    const matchesCompany = filterCompany === '' || owner?.company === filterCompany;
    const matchesSector = filterSector === '' || owner?.sector === filterSector;
    
    return matchesSearch && matchesBrand && matchesType && matchesLocation && matchesCompany && matchesSector;
  });

  // Listas únicas para filtros
  const uniqueBrands = [...new Set(vehicles.map(v => v.brand))].filter(Boolean).sort();
  const uniqueTypes = [...new Set(vehicles.map(v => v.type))].filter(Boolean).sort();
  const uniqueLocations = [...new Set(vehicles.map(v => v.parkingLocation))].filter(Boolean).sort();
  const uniqueCompanies = [...new Set(owners.map(o => o.company))].filter(Boolean).sort();
  const uniqueSectors = [...new Set(owners.map(o => o.sector))].filter(Boolean).sort();

  // Verificar se tem filtros ativos
  const hasActiveFilters = searchTerm || filterBrand || filterType || filterLocation || filterCompany || filterSector;

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

  const handleSearch = () => {
    setShowResults(true);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterBrand('');
    setFilterType('');
    setFilterLocation('');
    setFilterCompany('');
    setFilterSector('');
    setShowResults(false);
  };

  const exportToCSV = () => {
    const headers = ['Placa', 'Tipo', 'Marca', 'Modelo', 'Local', 'Proprietário', 'Telefone', 'Empresa', 'Setor'];
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
        owner?.company || '',
        owner?.sector || ''
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🆕 HEADER COM LOGO */}
        <Header 
          logoUrl={null} // ← COLOQUE URL DO LOGO AQUI
          companyName="Estádio Nacional de Brasília"
          subtitle="Sistema de Controle de Veículos - Segurança"
          vehicleCount={vehicles.length}
          ownerCount={owners.length}
        />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
          
          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={onNavigateToOwners}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <User size={20} />
              Proprietários ({owners.length})
            </button>
            <button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Novo Veículo
            </button>
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

          {/* 🔍 BUSCA AVANÇADA */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Search size={20} className="text-blue-600" />
                Busca Avançada
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Busca por texto */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    <Search size={16} className="inline mr-1" />
                    Busca Geral
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Placa, marca, modelo, proprietário..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    <Filter size={16} className="inline mr-1" />
                    Tipo de Veículo
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Todos os tipos</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Marca */}
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
                    <option value="">Todas as marcas</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Local */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    <MapPin size={16} className="inline mr-1 text-green-600" />
                    Local de Estacionamento
                  </label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Todos os locais</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* 🆕 Empresa */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    <Building2 size={16} className="inline mr-1 text-purple-600" />
                    Empresa
                  </label>
                  <select
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Todas as empresas</option>
                    {uniqueCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                {/* 🆕 Setor */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    <Briefcase size={16} className="inline mr-1 text-orange-600" />
                    Setor
                  </label>
                  <select
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Todos os setores</option>
                    {uniqueSectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Search size={18} />
                  Buscar ({filteredVehicles.length})
                </button>
                
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <X size={18} />
                    Limpar Filtros
                  </button>
                )}

                <button
                  onClick={exportToCSV}
                  disabled={!showResults || filteredVehicles.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>

          {/* 🔒 RESULTADOS (só aparecem após buscar) */}
          {!showResults ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
              <Search size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                🔒 Dados protegidos
              </h3>
              <p className="text-gray-600 mb-4">
                Use os filtros acima para buscar veículos
              </p>
              <p className="text-sm text-gray-500">
                Total cadastrado: <strong>{vehicles.length}</strong> veículos | <strong>{owners.length}</strong> proprietários
              </p>
            </div>
          ) : (
            <>
              {/* Contador de resultados */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-lg">
                  📊 Mostrando <strong className="text-blue-600">{filteredVehicles.length}</strong> de {vehicles.length} veículos
                </div>
                {hasActiveFilters && (
                  <div className="text-sm text-gray-600">
                    Filtros ativos: {[searchTerm && 'Busca', filterType && 'Tipo', filterBrand && 'Marca', filterLocation && 'Local', filterCompany && 'Empresa', filterSector && 'Setor'].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>

              {/* Lista de Veículos */}
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">
                  <Car size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Nenhum veículo encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros</p>
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
            </>
          )}
        </div>
      </div>
      <ModalComponent />
    </div>
  );
}