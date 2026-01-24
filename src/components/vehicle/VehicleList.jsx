import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, User, MapPin, Building2, Briefcase, X, Car, Truck } from 'lucide-react';
import VehicleCard from './VehicleCard';
import VehicleForm from './VehicleForm';
import Header from '../ui/Header';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export default function VehicleList({ 
  vehicles, 
  owners,
  thirdPartyVehicles, // ✅ ADICIONA
  editingVehicleId,
  onViewDetail, 
  onAdd, 
  onEdit, 
  onDelete,
  onNavigateToOwners,
  onNavigateToThirdParty, // ✅ ADICIONA
  onCancelEdit 
}) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();
  
  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterSector, setFilterSector] = useState('');

  /* ================================
     LÓGICA DE FILTROS
  ================================ */

  const thirdPartyCount = thirdPartyVehicles?.length || 0;

  // Veículos filtrados
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const owner = owners.find(o => o.id === v.ownerId);
      
      const matchesSearch = !searchTerm || 
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBrand = !filterBrand || v.brand === filterBrand;
      const matchesType = !filterType || v.type === filterType;
      const matchesLocation = !filterLocation || v.parkingLocation === filterLocation;
      const matchesCompany = !filterCompany || owner?.company === filterCompany;
      const matchesSector = !filterSector || owner?.sector === filterSector;
      
      return matchesSearch && matchesBrand && matchesType && matchesLocation && matchesCompany && matchesSector;
    });
  }, [vehicles, owners, searchTerm, filterBrand, filterType, filterLocation, filterCompany, filterSector]);

  // Listas únicas para filtros
  const uniqueBrands = useMemo(() => 
    [...new Set(vehicles.map(v => v.brand))].filter(Boolean).sort(),
    [vehicles]
  );
  
  const uniqueTypes = useMemo(() => 
    [...new Set(vehicles.map(v => v.type))].filter(Boolean).sort(),
    [vehicles]
  );
  
  const uniqueLocations = useMemo(() => 
    [...new Set(vehicles.map(v => v.parkingLocation))].filter(Boolean).sort(),
    [vehicles]
  );
  
  const uniqueCompanies = useMemo(() => 
    [...new Set(owners.map(o => o.company))].filter(Boolean).sort(),
    [owners]
  );
  
  const uniqueSectors = useMemo(() => 
    [...new Set(owners.map(o => o.sector))].filter(Boolean).sort(),
    [owners]
  );

  // Verificar se tem filtros ativos
  const hasActiveFilters = searchTerm || filterBrand || filterType || filterLocation || filterCompany || filterSector;

  /* ================================
     HANDLERS - FORMULÁRIO
  ================================ */

  const handleAddClick = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEditClick = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (owners.length === 0) {
      onNavigateToOwners();
    } else {
      setShowForm(false);
      setEditingVehicle(null);
    }
  };

  /* ================================
     HANDLERS - AÇÕES
  ================================ */

  const handleDeleteClick = (vehicle) => {
    openModal({
      title: 'Remover Veículo',
      message: `Deseja remover o veículo ${vehicle.plate} da lista?\n\nEle poderá ser restaurado posteriormente.`,
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
    
    success('✅ Arquivo CSV exportado com sucesso!');
  };

  /* ================================
     RENDERIZAÇÃO
  ================================ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        <Header 
          companyName="ARENA BRB / ARENA 360"
          subtitle="Sistema de Controle de Veículos - Segurança"
          vehicleCount={vehicles.length}
          ownerCount={owners.length}
        />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
          
          {/* Botões de Ação */}
          <div className="flex flex-wrap justify-end gap-2 sm:gap-3 mb-6">
              <button
                onClick={onNavigateToOwners}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-orange-600 hover:to-purple-700 text-white px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl flex items-center gap-2 text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap font-medium"
              >
                <User size={20} />
                <span>Proprietários ARENA</span>
                <span className="bg-white/20 px-2.5 py-1 rounded-full text-sm font-bold">{owners.length}</span>
              </button>

              <button
                onClick={onNavigateToThirdParty}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl flex items-center gap-2 text-base sm:text-lg transition-all shadow-lg hover:shadow-xl whitespace-nowrap font-medium"
              >
                <Truck size={20} />
                <span>Terceiros</span>
                <span className="bg-white/20 px-2.5 py-1 rounded-full text-sm font-bold">{thirdPartyCount}</span>
              </button>

              <button
                onClick={handleAddClick}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl flex items-center gap-2 text-base sm:text-lg transition-all shadow-lg hover:shadow-xl whitespace-nowrap font-medium"
              >
                <Plus size={20} />
                <span>Novo Veículo</span>
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

          {/* Busca e Lista */}
          {!showForm && (
            <>
              {/* 🔍 BUSCA AVANÇADA */}
              <div className="mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                      
                      {/* Busca Principal */}
                      <div className="relative mb-4">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => {
                              setSearchTerm(e.target.value);
                              if (e.target.value === '') {
                                setShowResults(false);
                              }
                            }}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder="Digite a placa, marca, modelo ou nome do proprietário..."
                          className="w-full px-4 sm:px-6 py-3 sm:py-4 pl-10 sm:pl-14 text-base sm:text-lg border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                        />
                        <Search className="absolute left-3 sm:left-5 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>

                      {/* Filtros Rápidos (Opcionais) */}
                      <details className="mb-4">
                        <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                          <Filter size={16} />
                          Filtros Avançados (opcional)
                        </summary>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                          {/* Tipo */}
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                              <Car size={16} className="inline mr-1 text-blue-600" />
                              Tipo
                            </label>
                            <select
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
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
                              <Filter size={16} className="inline mr-1 text-blue-600" />
                              Marca
                            </label>
                            <select
                              value={filterBrand}
                              onChange={(e) => setFilterBrand(e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
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
                              Local
                            </label>
                            <select
                              value={filterLocation}
                              onChange={(e) => setFilterLocation(e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
                            >
                              <option value="">Todos os locais</option>
                              {uniqueLocations.map(location => (
                                <option key={location} value={location}>{location}</option>
                              ))}
                            </select>
                          </div>

                          {/* Empresa */}
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                              <Building2 size={16} className="inline mr-1 text-purple-600" />
                              Empresa
                            </label>
                            <select
                              value={filterCompany}
                              onChange={(e) => setFilterCompany(e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
                            >
                              <option value="">Todas as empresas</option>
                              {uniqueCompanies.map(company => (
                                <option key={company} value={company}>{company}</option>
                              ))}
                            </select>
                          </div>

                          {/* Setor */}
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                              <Briefcase size={16} className="inline mr-1 text-orange-600" />
                              Setor
                            </label>
                            <select
                              value={filterSector}
                              onChange={(e) => setFilterSector(e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
                            >
                              <option value="">Todos os setores</option>
                              {uniqueSectors.map(sector => (
                                <option key={sector} value={sector}>{sector}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        </details>

                      {/* Botões de Ação */}
                      <div className="flex gap-2 sm:gap-3 flex-wrap">
                      <button
                        onClick={handleSearch}
                        className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <Search size={18} />
                        Buscar
                      </button>
                      
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <X size={16} />
                          <span className="hidden sm:inline">Limpar</span>
                        </button>
                      )}

                      <button
                        onClick={exportToCSV}
                        disabled={!showResults || filteredVehicles.length === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <Download size={16} />
                        <span className="hidden sm:inline">CSV</span>
                        <span className="sm:hidden">↓</span>
                      </button>
                    </div>
                    </div>
                  </div>

              {/* TELA INICIAL OU RESULTADOS */}
              {!showResults ? (
                <div className="text-center py-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <Car size={80} className="mx-auto mb-6 text-blue-400 opacity-50" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">
                    Sistema de Controle de Veículos
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Use a busca acima para consultar veículos cadastrados
                  </p>
                </div>
              ) : (
                <>
                  {/* Contador de resultados */}
                  <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="text-lg">
                      📊 Mostrando <strong className="text-blue-600">{filteredVehicles.length}</strong> de {vehicles.length} veículos
                    </div>
                    {hasActiveFilters && (
                      <div className="text-sm text-gray-600">
                        Filtros ativos: {[
                          searchTerm && 'Busca', 
                          filterType && 'Tipo', 
                          filterBrand && 'Marca', 
                          filterLocation && 'Local', 
                          filterCompany && 'Empresa', 
                          filterSector && 'Setor'
                        ].filter(Boolean).join(', ')}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {filteredVehicles.map(vehicle => (
                        <VehicleCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          owner={owners.find(o => o.id === vehicle.ownerId)}
                          onEdit={handleEditClick}
                          onDelete={handleDeleteClick}
                          onClick={() => onViewDetail(vehicle)}
                        />
                      ))}
                    </div>
                  )}
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