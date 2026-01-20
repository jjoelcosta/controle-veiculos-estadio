import React, { useState } from 'react';
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

  /* ================================
     FUNÇÕES AUXILIARES
  ================================ */

  const getOwnerVehicleCount = (ownerId) => {
    return vehicles.filter(v => v.ownerId === ownerId).length;
  };

  // ✅ Ordenar alfabeticamente
  const sortedOwners = [...owners].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

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
    const vehicleCount = getOwnerVehicleCount(owner.id);
    
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
          if (result.success) {
            success('✅ Proprietário excluído com sucesso!');
          } else {
            error(result.message);
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
    const vehicleCount = getOwnerVehicleCount(owner.id);
    const isEven = index % 2 === 0;

    return (
      <div 
        className={`px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-purple-50 transition-colors cursor-pointer ${
          isEven ? 'bg-white' : 'bg-gray-50'
        }`}
        onClick={() => onViewDetail(owner)}
      >
        {/* Nome */}
        <div className="col-span-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
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
              <Building2 size={14} className="text-purple-500" />
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
              ? 'bg-purple-100 text-purple-700' 
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm"
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
    const vehicleCount = getOwnerVehicleCount(owner.id);

    return (
      <div 
        className="bg-white rounded-xl border-2 border-purple-200 p-4 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => onViewDetail(owner)}
      >
        {/* Header do Card */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-800">{owner.name}</div>
              <div className="text-xs text-gray-500">{owner.createdAt}</div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            vehicleCount > 0 
              ? 'bg-purple-100 text-purple-700' 
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
              <Building2 size={14} className="text-purple-500" />
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
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <button
                onClick={onBackToVehicles}
                className="mb-4 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                <ArrowLeft size={20} />
                Voltar para veículos
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <User className="text-purple-600" size={36} />
                Gerenciar Proprietários
              </h1>
              {!showForm && (
                <p className="text-gray-600 mt-2">
                  👥 {owners.length} proprietário(s) cadastrado(s)
                </p>
              )}
            </div>
            
            <button
              onClick={handleAddClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md"
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
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 grid grid-cols-12 gap-4 font-semibold text-sm">
                      <div className="col-span-3">Nome</div>
                      <div className="col-span-2">Telefone</div>
                      <div className="col-span-2">Empresa</div>
                      <div className="col-span-2">Cargo</div>
                      <div className="col-span-1 text-center">Veículos</div>
                      <div className="col-span-2 text-center">Ações</div>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {sortedOwners.map((owner, index) => (
                        <OwnerRow key={owner.id} owner={owner} index={index} />
                      ))}
                    </div>
                  </div>

                  {/* 📱 VERSÃO MOBILE (Cards) */}
                  <div className="lg:hidden space-y-3">
                    {sortedOwners.map((owner) => (
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