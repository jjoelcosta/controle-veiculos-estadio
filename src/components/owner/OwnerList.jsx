import React, { useState } from 'react';
import { User, Plus, ArrowLeft } from 'lucide-react';
import OwnerCard from './OwnerCard';
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

  const getOwnerVehicleCount = (ownerId) => {
    return vehicles.filter(v => v.ownerId === ownerId).length;
  };

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
      error(`Não é possível excluir! Este proprietário tem ${vehicleCount} veículo(s) cadastrado(s).`);
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

  const handleFormSubmit = (ownerData) => {
    if (editingOwner) {
      onEdit(editingOwner.id, ownerData);
    } else {
      onAdd(ownerData);
    }
    setShowForm(false);
    setEditingOwner(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOwner(null);
  };

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
              <p className="text-gray-600 mt-2">
                👥 {owners.length} proprietário(s) cadastrado(s)
              </p>
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
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {/* Lista de Proprietários */}
          {owners.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <User size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhum proprietário cadastrado ainda</p>
              <p className="text-sm">Clique em "Novo Proprietário" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {owners.map(owner => (
                <OwnerCard
                  key={owner.id}
                  owner={owner}
                  vehicleCount={getOwnerVehicleCount(owner.id)}
                  onEdit={() => handleEditClick(owner)}
                  onDelete={() => handleDeleteClick(owner)}
                  onClick={() => onViewDetail(owner)}
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