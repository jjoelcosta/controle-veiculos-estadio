import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, User, MapPin, Building2, Briefcase, X, Car, Truck, Package, FileText, Calendar, ChevronLeft, ChevronRight, BarChart2, BarChart, UserCheck, Users } from 'lucide-react';
import VehicleCard from './VehicleCard';
import VehicleForm from './VehicleForm';
import Header from '../ui/Header';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import Dashboard from '../Dashboard';

export default function VehicleList({ 
  vehicles, 
  owners,
  thirdPartyVehicles,
  loans,
  events,
  staff,
  editingVehicleId,
  onViewDetail, 
  onAdd, 
  onEdit, 
  onDelete,
  onNavigateToOwners,
  onNavigateToThirdParty,
  onNavigateToLoans,
  onNavigateToReports,
  onNavigateToStaff,
  onNavigateToEvents,
  onCancelEdit 
}) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showVehicleSearch, setShowVehicleSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('vehicles');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterSector, setFilterSector] = useState('');

  const thirdPartyCount = thirdPartyVehicles?.length || 0;
  const activeLoans = loans?.filter(l => l.status === 'emprestado')?.length || 0;
  const loansCount = loans?.length || 0;

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

  const uniqueBrands = useMemo(() => [...new Set(vehicles.map(v => v.brand))].filter(Boolean).sort(), [vehicles]);
  const uniqueTypes = useMemo(() => [...new Set(vehicles.map(v => v.type))].filter(Boolean).sort(), [vehicles]);
  const uniqueLocations = useMemo(() => [...new Set(vehicles.map(v => v.parkingLocation))].filter(Boolean).sort(), [vehicles]);
  const uniqueCompanies = useMemo(() => [...new Set(owners.map(o => o.company))].filter(Boolean).sort(), [owners]);
  const uniqueSectors = useMemo(() => [...new Set(owners.map(o => o.sector))].filter(Boolean).sort(), [owners]);
  const hasActiveFilters = searchTerm || filterBrand || filterType || filterLocation || filterCompany || filterSector;

  const handleAddClick = () => { setEditingVehicle(null); setShowForm(true); };
  const handleEditClick = (vehicle) => { setEditingVehicle(vehicle); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

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
    if (owners.length === 0) { onNavigateToOwners(); } 
    else { setShowForm(false); setEditingVehicle(null); }
  };

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

  const handleSearch = () => setShowResults(true);

  const clearAllFilters = () => {
    setSearchTerm(''); setFilterBrand(''); setFilterType('');
    setFilterLocation(''); setFilterCompany(''); setFilterSector('');
    setShowResults(false);
  };

  const exportToCSV = () => {
    const headers = ['Placa', 'Tipo', 'Marca', 'Modelo', 'Local', 'Proprietário', 'Telefone', 'Empresa', 'Setor'];
    const rows = filteredVehicles.map(v => {
      const owner = owners.find(o => o.id === v.ownerId);
      return [v.plate, v.type, v.brand, v.model, v.parkingLocation || '', owner?.name || '', owner?.phone || '', owner?.company || '', owner?.sector || ''];
    });
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `veiculos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success('✅ Arquivo CSV exportado com sucesso!');
  };

  // Menu lateral
  const menuItems = [
  { id: 'vehicles', label: 'Veículos', icon: Car, action: null, badge: vehicles.length,
    activeClass: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 font-semibold',
    iconClass: 'text-blue-600', badgeClass: 'bg-blue-100 text-blue-700' },
  { id: 'owners', label: 'Proprietários', icon: User, action: onNavigateToOwners, badge: owners.length,
    activeClass: 'bg-slate-100 text-slate-700 border-l-4 border-slate-500 font-semibold',
    iconClass: 'text-slate-600', badgeClass: 'bg-slate-200 text-slate-700' },
  { id: 'thirdparty', label: 'Terceiros', icon: Truck, action: onNavigateToThirdParty, badge: thirdPartyCount,
    activeClass: 'bg-orange-50 text-orange-700 border-l-4 border-orange-500 font-semibold',
    iconClass: 'text-orange-600', badgeClass: 'bg-orange-100 text-orange-700' },
  { id: 'loans', label: 'Empréstimos', icon: Package, action: onNavigateToLoans, badge: loansCount,
    activeClass: 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500 font-semibold',
    iconClass: 'text-yellow-600', badgeClass: 'bg-yellow-100 text-yellow-700' },
  { id: 'staff', label: 'Pessoal', icon: UserCheck, action: onNavigateToStaff, badge: staff?.filter(s => s.status === 'ativo').length || 0,
    activeClass: 'bg-purple-50 text-purple-700 border-l-4 border-purple-500 font-semibold',
    iconClass: 'text-purple-600', badgeClass: 'bg-purple-100 text-purple-700' },
  { id: 'events', label: 'Eventos', icon: Calendar, action: onNavigateToEvents, badge: events?.length || 0,
    activeClass: 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 font-semibold',
    iconClass: 'text-emerald-600', badgeClass: 'bg-emerald-100 text-emerald-700' },
  { id: 'reports', label: 'Relatórios', icon: BarChart2, action: onNavigateToReports, badge: null,
    activeClass: 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500 font-semibold',
    iconClass: 'text-indigo-600', badgeClass: 'bg-indigo-100 text-indigo-700' },
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">

      {/* ══════════════ HEADER TOPO ══════════════ */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-xl">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo + Título */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Car size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Arena BRB / Arena 360
                </h1>
                <p className="text-blue-200 text-xs sm:text-2xl hidden sm:block">
                  Gestão Integrada de Segurança
                </p>
              </div>
            </div>

            {/* Stats Cards - aparecem em todas as telas */}
            <div className="flex items-center gap-2">
              <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-1.5 text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">{vehicles.length}</div>
                <div className="text-blue-200 text-xs hidden sm:block">Veículos</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-1.5 text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">{owners.length}</div>
                <div className="text-blue-200 text-xs hidden sm:block">Proprietários</div>
              </div>
              <div className="hidden sm:block bg-white/15 backdrop-blur rounded-xl px-3 py-1.5 text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">{thirdPartyCount}</div>
                <div className="text-blue-200 text-xs">Terceiros</div>
              </div>
              <div className={`hidden sm:block backdrop-blur rounded-xl px-3 py-1.5 text-center ${activeLoans > 0 ? 'bg-yellow-400/30' : 'bg-white/15'}`}>
                <div className={`text-lg sm:text-2xl font-bold ${activeLoans > 0 ? 'text-yellow-200' : 'text-white'}`}>{activeLoans}</div>
                <div className="text-blue-200 text-xs">Empréstimos</div>
              </div>
              <div className="hidden sm:block bg-white/15 backdrop-blur rounded-xl px-3 py-1.5 text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">{events?.length || 0}</div>
                <div className="text-blue-200 text-xs">Eventos</div>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-white text-xs font-medium">admin@estadio.com</div>
                <div className="text-blue-200 text-xs">Conectado</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ LAYOUT PRINCIPAL ══════════════ */}
      <div className="flex flex-1">

        {/* ══════════════ SIDEBAR ESQUERDA ══════════════ */}
        <div className={`
          bg-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0
          ${sidebarOpen ? 'w-48 sm:w-56' : 'w-12 sm:w-16'}
        `}>
          
          {/* Toggle */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            {sidebarOpen && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Menu</span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>

          {/* Items do Menu */}
          <nav className="flex-1 p-2 space-y-1">
           {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (item.id === 'vehicles') {
                      setShowVehicleSearch(false); // voltando pelo menu = volta pro dashboard
                      setShowResults(false);
                      setSearchTerm('');
                    }
                    if (item.action) item.action();
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl transition-all text-left ${
                    isActive ? item.activeClass : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon size={20} className={`flex-shrink-0 ${isActive ? item.iconClass : 'text-gray-400'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-sm truncate">{item.label}</span>
                      {item.badge !== null && item.badge !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isActive ? item.badgeClass : 'bg-gray-100 text-gray-500'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Botão Novo Veículo no rodapé da sidebar */}
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={handleAddClick}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                text-white font-semibold transition-all shadow-md hover:shadow-lg
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
              title={!sidebarOpen ? 'Novo Veículo' : ''}
            >
              <Plus size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">Novo Veículo</span>}
            </button>
          </div>
        </div>

        {/* ══════════════ CONTEÚDO PRINCIPAL ══════════════ */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto">

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

          {!showForm && (
            <>
              {activeMenu === 'vehicles' && !showVehicleSearch && !showResults && !searchTerm ? (
                <Dashboard
                  vehicles={vehicles}
                  owners={owners}
                  thirdPartyVehicles={thirdPartyVehicles}
                  loans={loans}
                  events={events}
                  staff={staff}
                  onNavigate={(view) => {
                    if (view === 'vehicles') {
                      setActiveMenu('vehicles');
                      setShowVehicleSearch(true);
                      setShowResults(false);
                      setSearchTerm('');
                    } else {
                      setActiveMenu(view);
                      if (view === 'owners') onNavigateToOwners();
                      else if (view === 'thirdparty') onNavigateToThirdParty();
                      else if (view === 'loans') onNavigateToLoans();
                      else if (view === 'events') onNavigateToEvents();
                      else if (view === 'staff') onNavigateToStaff();
                      else if (view === 'reports') onNavigateToReports();
                    }
                  }}
                />
              ) : (
                <>

                  {/* BOTÃO VOLTAR */}
                  <button
                    onClick={() => {
                      setShowVehicleSearch(false);
                      setShowResults(false);
                      setSearchTerm('');
                      setFilterBrand('');
                      setFilterType('');
                      setFilterLocation('');
                      setFilterCompany('');
                      setFilterSector('');
                    }}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
                  >
                    <ChevronLeft size={20} /> Voltar ao Dashboard
                  </button>

                  {/* BUSCA */}
                  <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 mb-6">
                    <div className="relative mb-4">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value === '') setShowResults(false); }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Digite a placa, marca, modelo ou nome do proprietário..."
                        className="w-full px-4 py-3 pl-12 text-base border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <details className="mb-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-2">
                        <Filter size={16} /> Filtros Avançados (opcional)
                      </summary>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700"><Car size={14} className="inline mr-1 text-blue-600" />Tipo</label>
                          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-sm">
                            <option value="">Todos</option>
                            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700"><Filter size={14} className="inline mr-1 text-blue-600" />Marca</label>
                          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-sm">
                            <option value="">Todas</option>
                            {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700"><MapPin size={14} className="inline mr-1 text-green-600" />Local</label>
                          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-sm">
                            <option value="">Todos</option>
                            {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700"><Building2 size={14} className="inline mr-1 text-purple-600" />Empresa</label>
                          <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:invoke-none bg-white text-sm">
                            <option value="">Todas</option>
                            {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700"><Briefcase size={14} className="inline mr-1 text-orange-600" />Setor</label>
                          <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-sm">
                            <option value="">Todos</option>
                            {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </details>

                    <div className="flex gap-2 flex-wrap">
                      <button onClick={handleSearch} className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2">
                        <Search size={18} /> Buscar
                      </button>
                      {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2">
                          <X size={16} /> Limpar
                        </button>
                      )}
                      <button
                        onClick={exportToCSV}
                        disabled={!showResults || filteredVehicles.length === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2"
                      >
                        <Download size={16} /> CSV
                      </button>
                    </div>
                  </div>

                  {/* RESULTADOS */}
                  {!showResults ? (
                    <div className="text-center py-24 bg-white/60 rounded-2xl border border-gray-200">
                      <Car size={80} className="mx-auto mb-6 text-blue-400 opacity-40" />
                      <h3 className="text-2xl font-bold text-gray-700 mb-3">Busca de Veículos Autorizados</h3>
                      <p className="text-gray-500 text-lg">Use a busca acima para consultar</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
                        <div className="text-lg">
                          📊 Mostrando <strong className="text-blue-600">{filteredVehicles.length}</strong> de {vehicles.length} veículos
                        </div>
                        {hasActiveFilters && (
                          <div className="text-sm text-gray-600">
                            Filtros ativos: {[searchTerm && 'Busca', filterType && 'Tipo', filterBrand && 'Marca', filterLocation && 'Local', filterCompany && 'Empresa', filterSector && 'Setor'].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                      {filteredVehicles.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-white rounded-xl">
                          <Car size={64} className="mx-auto mb-4 opacity-30" />
                          <p className="text-lg">Nenhum veículo encontrado</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </>
          )}  
        </div>
      </div>

      <ModalComponent />
    </div>
  );
}