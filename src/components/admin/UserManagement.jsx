import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, UserX, UserCheck } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { useModal } from '../ui/Modal';
import { storage } from '../../utils/storage';

export default function UserManagement({ onBack }) {
  const { success, error } = useToast();
  const { openModal, ModalComponent } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await storage.loadUsers();
      setUsers(data);
    } catch (err) {
      error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentActive, email) => {
    openModal({
      title: currentActive ? 'Desativar Usuário' : 'Ativar Usuário',
      message: currentActive
        ? `Desativar ${email}? O usuário não conseguirá mais acessar o sistema.`
        : `Reativar ${email}?`,
      variant: 'warning',
      confirmText: currentActive ? 'Sim, Desativar' : 'Sim, Ativar',
      onConfirm: async () => {
        try {
          await storage.toggleUserActive(userId, !currentActive);
          success(currentActive ? '🔒 Usuário desativado' : '✅ Usuário ativado');
          await loadUsers();
        } catch (err) {
          error('Erro ao alterar status');
        }
      }
    });
  };

  const handleChangeRole = async (userId, currentRole, email) => {
    const newRole = currentRole === 'admin' ? 'operador' : 'admin';
    openModal({
      title: 'Alterar Permissão',
      message: `Alterar ${email} de ${currentRole.toUpperCase()} para ${newRole.toUpperCase()}?${
        newRole === 'admin' ? '\n\nAdmins podem excluir registros e gerenciar usuários.' : '\n\nOperadores não podem excluir registros.'
      }`,
      variant: 'warning',
      confirmText: 'Sim, Alterar',
      onConfirm: async () => {
        try {
          await storage.updateUserRole(userId, newRole);
          success(`✅ ${email} agora é ${newRole}`);
          await loadUsers();
        } catch (err) {
          error('Erro ao alterar permissão');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* HEADER */}
          <div className="mb-8">
            <button onClick={onBack} className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <Shield className="text-indigo-600" size={36} /> Gerenciamento de Usuários
                </h1>
                <p className="text-gray-600 mt-2">{users.length} usuário(s) cadastrado(s)</p>
              </div>
            </div>
          </div>

          {/* INFO */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm">
              <strong>Como adicionar novos usuários:</strong> Crie o usuário no painel do Supabase 
              (Authentication → Users → Add user), depois ele aparecerá aqui automaticamente no primeiro login.
              Novos usuários entram como <strong>Operador</strong> por padrão.
            </p>
          </div>

          {/* LEGENDA */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs">👑 Admin</span>
              <span className="text-gray-500">Acesso total (criar, editar, excluir)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-xs">👤 Operador</span>
              <span className="text-gray-500">Criar e editar (sem excluir)</span>
            </div>
          </div>

          {/* LISTA */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-sm rounded-tl-xl">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Permissão</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-sm rounded-tr-xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, index) => (
                  <tr key={user.id} className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 Operador'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        user.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {user.active ? '✅ Ativo' : '🔒 Desativado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleChangeRole(user.user_id, user.role, user.email)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                        >
                          <Shield size={12} /> 
                          {user.role === 'admin' ? 'Tornar Operador' : 'Tornar Admin'}
                        </button>
                        <button 
                          onClick={() => handleToggleActive(user.user_id, user.active, user.email)}
                          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 text-white transition-colors ${
                            user.active
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {user.active 
                            ? <><UserX size={12} /> Desativar</> 
                            : <><UserCheck size={12} /> Ativar</>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
      <ModalComponent />
    </div>
  );
}