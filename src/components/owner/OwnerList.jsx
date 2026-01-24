import React, { useState, useMemo } from 'react';
import { User, Plus, ArrowLeft, Phone, Building2, Briefcase, Edit2, Trash2 } from 'lucide-react';
import OwnerForm from './OwnerForm';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export default function OwnerList({ 
  owners, 
  vehicles,
  onViewDetail, 
  onAdd, 
  onEdit, 
  onDelete,
  onBackToVehicles 
}) {
  const { openModal, ModalComponent } = useModal();
  const { success, error } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  /* ================================
     FUNÇÕES AUXILIARES
  ================================ */

  // ✅ Performance: Pré-calcula contagem de veículos (O(n) em vez de O(n²))
const vehicleCountMap = useMemo(() => {
  return vehicles.reduce((acc, v) => {
    acc[v.ownerId] = (acc[v.ownerId] || 0) + 1;
    return acc;
  }, {});
}, [vehicles]);

  // ✅ Ordenar alfabeticamente
  const sortedOwners = [...owners].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  // ✅ Filtrar por busca
  const filteredOwners = sortedOwners.filter(owner => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      owner.name?.toLowerCase().includes(search) ||
      owner.company?.toLowerCase().includes(search) ||
      owner.phone?.toLowerCase().includes(search) ||
      owner.position?.toLowerCase().includes(search) ||
      owner.sector?.toLowerCase().includes(search)
    );
  });

  /* ================================
     HANDLERS
  ================================ */

  const handleAddClick = () => {
    setEditingOwner(null);
    setShowForm(true);
  };

  const handleEditClick = (owner) => {
    setEditingOwner(owner);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (owner) => {
    const vehicleCount = vehicleCountMap[owner.id] || 0;
    
    if (vehicleCount > 0) {
      error(`❌ Não é possível excluir! Este proprietário tem ${vehicleCount} veículo(s) cadastrado(s).`);
      return;
    }

    openModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o proprietário ${owner.name}?`,
      variant: 'danger',
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const result = await onDelete(owner.id);
          if (result || result === true) {
            success('✅ Proprietário excluído com sucesso!');
          }
        } catch (err) {
          error('❌ Erro ao excluir proprietário');
        }
      }
    });
  };

  const handleFormSubmit = async (ownerData) => {
    try {
      if (editingOwner) {
        await onEdit(editingOwner.id, ownerData);
        success('✅ Proprietário atualizado com sucesso!');
      } else {
        await onAdd(ownerData);
        success('✅ Proprietário cadastrado com sucesso!');
      }
      setShowForm(false);
      setEditingOwner(null);
    } catch (err) {
      error(err.message || '❌ Erro ao salvar proprietário');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOwner(null);
  };

  /* ================================
     COMPONENTES DE LINHA/CARD
  ================================ */

  const OwnerRow = ({ owner, index }) => {
    const vehicleCount = vehicleCountMap[owner.id] || 0;
    const isEven = index % 2 === 0;

    return (
      <div 
        className={`px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-blue-50 transition-colors cursor-pointer ${
          isEven ? 'bg-white' : 'bg-gray-50'
        }`}
        onClick={() => onViewDetail(owner)}
      >
        {/* Nome */}
        <div className="col-span-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{owner.name}</div>
              {owner.sector && (
                <div className="text-xs text-gray-500">📂 {owner.sector}</div>
              )}
            </div>
          </div>
        </div>

        {/* Telefone */}
        <div className="col-span-2 text-sm text-gray-600">
          {owner.phone ? (
            <div className="flex items-center gap-1">
              <Phone size={14} className="text-blue-500" />
              {owner.phone}
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>

        {/* Empresa */}
        <div className="col-span-2 text-sm text-gray-600">
          {owner.company ? (
            <div className="flex items-center gap-1">
              <Building2 size={14} className="text-slate-500" />
              {owner.company}
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>

        {/* Cargo */}
        <div className="col-span-2 text-sm text-gray-600">
          {owner.position ? (
            <div className="flex items-center gap-1">
              <Briefcase size={14} className="text-orange-500" />
              {owner.position}
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>

        {/* Contador de Veículos */}
        <div className="col-span-1 text-center">
          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
            vehicleCount > 0 
              ? 'bg-slate-100 text-slate-700' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {vehicleCount} 🚗
          </span>
        </div>

        {/* Ações */}
        <div className="col-span-2 flex gap-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(owner);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm"
          >
            <Edit2 size={14} />
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(owner);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm"
          >
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      </div>
    );
  };

  const OwnerCard = ({ owner }) => {
    const vehicleCount = vehicleCountMap[owner.id] || 0;

    return (
      <div 
        className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => onViewDetail(owner)}
      >
        {/* Header do Card */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-slate-500 to-slate-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-800">{owner.name}</div>
              <div className="text-xs text-gray-500">{owner.createdAt}</div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            vehicleCount > 0 
              ? 'bg-slate-100 text-slate-700' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {vehicleCount} 🚗
          </span>
        </div>

        {/* Informações */}
        <div className="space-y-2 mb-3 text-sm">
          {owner.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={14} className="text-blue-500" />
              {owner.phone}
            </div>
          )}
          {owner.company && (
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 size={14} className="text-slate-500" />
              {owner.company}
            </div>
          )}
          {owner.position && (
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase size={14} className="text-orange-500" />
              {owner.position}
            </div>
          )}
          {owner.sector && (
            <div className="text-xs text-gray-500">
              📂 {owner.sector}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(owner);
            }}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
          >
            <Edit2 size={14} />
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(owner);
            }}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
          >
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      </div>
    );
  };

  /* ================================
     RENDERIZAÇÃO PRINCIPAL
  ================================ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <button
                onClick={onBackToVehicles}
                className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-800 font-medium transition-colors"
              >
                <ArrowLeft size={20} />
                Voltar para veículos
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <User className="text-purple-600" size={36} />
                Gerenciar Proprietários
              </h1>
              {!showForm && (
                <p className="text-purple-600 mt-2">
                  👥 {owners.length} proprietário(s) cadastrado(s)
                </p>
              )}
            </div>
            
            <button
              onClick={handleAddClick}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md"
            >
              <Plus size={20} />
              Novo Proprietário
            </button>
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="mb-6">
              <OwnerForm
                initialData={editingOwner}
                owners={owners} 
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          )}
          
          {/* Lista */}
          {!showForm && (
            <>
              {/* ✅ Campo de busca */}
              {owners.length > 0 && (
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="🔍 Buscar por nome, empresa, telefone, cargo ou setor..."
                      className="w-full px-4 py-3 pl-12 border-2 border-slate-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                    />
                    <svg 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" 
                      width="20" 
                      height="20" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
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
                      📊 Mostrando <strong className="text-slate-600">{filteredOwners.length}</strong> de {owners.length} proprietários
                    </p>
                  )}
                </div>
              )}

              {owners.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <User size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Nenhum proprietário cadastrado ainda</p>
                  <p className="text-sm">Clique em "Novo Proprietário" para começar</p>
                </div>
              ) : (
                <>
                  {/* 🖥️ VERSÃO DESKTOP (Tabela) */}
                  <div className="hidden lg:block bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 grid grid-cols-12 gap-4 font-semibold text-sm">
                      <div className="col-span-3">Nome</div>
                      <div className="col-span-2">Telefone</div>
                      <div className="col-span-2">Empresa</div>
                      <div className="col-span-2">Cargo</div>
                      <div className="col-span-1 text-center">Veículos</div>
                      <div className="col-span-2 text-center">Ações</div>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {filteredOwners.map((owner, index) => (
                        <OwnerRow key={owner.id} owner={owner} index={index} />
                      ))}
                    </div>
                  </div>

                  {/* 📱 VERSÃO MOBILE (Cards) */}
                  <div className="lg:hidden space-y-3">
                    {filteredOwners.map((owner) => (
                      <OwnerCard key={owner.id} owner={owner} />
                    ))}
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