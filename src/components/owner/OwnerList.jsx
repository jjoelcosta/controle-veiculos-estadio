import React, { useState } from 'react';
import {
  User,
  Plus,
  ArrowLeft,
  Phone,
  Building2,
  Briefcase,
  Edit2,
  Trash2
} from 'lucide-react';
import OwnerForm from './OwnerForm';
import { useModal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export default function OwnerList({
  owners = [],
  vehicles = [],
  onViewDetail,
  onAdd,
  onEdit,
  onDelete,
  onBackToVehicles
}) {
  const { openModal } = useModal();
  const { success, error } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);

  const sortedOwners = [...owners].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

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
    openModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o proprietário ${owner.name}?`,
      variant: 'danger',
      onConfirm: async () => {
        const result = await onDelete(owner.id);

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
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={onBackToVehicles}
              className="flex items-center gap-2 text-purple-600 mb-4"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>

            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User size={32} />
              Proprietários
            </h1>
          </div>

          <button
            onClick={handleAddClick}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Proprietário
          </button>
        </div>

        {showForm && (
          <OwnerForm
            owners={owners}
            initialData={editingOwner}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}

        {!sortedOwners.length ? (
          <div className="text-center py-12 text-gray-400">
            <User size={64} className="mx-auto mb-4 opacity-30" />
            Nenhum proprietário cadastrado
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            {sortedOwners.map((owner) => (
              <div
                key={owner.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-purple-50 cursor-pointer"
                onClick={() => onViewDetail(owner)}
              >
                <div className="col-span-3 font-semibold">{owner.name}</div>

                <div className="col-span-2">
                  {owner.phone || '—'}
                </div>

                <div className="col-span-2">
                  {owner.company || '—'}
                </div>

                <div className="col-span-2">
                  {owner.position || '—'}
                </div>

                <div className="col-span-3 flex gap-2 justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(owner);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(owner);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
