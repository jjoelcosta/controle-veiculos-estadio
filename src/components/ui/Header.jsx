import React from 'react';
import { Car, Building2, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ 
  logoUrl, 
  companyName = "ARENA 360 / ARENA BRB", 
  subtitle = "Sistema de Controle de Veículos",
  vehicleCount,
  ownerCount 
}) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      await logout();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-8 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-6">
        
        {/* Logo e Título */}
        <div className="flex items-center gap-6">
          {logoUrl ? (
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <img 
                src={logoUrl} 
                alt={companyName}
                className="h-20 w-20 object-contain"
              />
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-white/20">
              <Building2 size={64} className="text-white" />
            </div>
          )}
          
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Car size={40} />
              {companyName}
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Estatísticas e Usuário */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
              <div className="text-3xl font-bold">{vehicleCount}</div>
              <div className="text-blue-100 text-sm">Veículos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
              <div className="text-3xl font-bold">{ownerCount}</div>
              <div className="text-blue-100 text-sm">Proprietários</div>
            </div>
          </div>

          {/* Usuário e Logout */}
          {user && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
              <div className="text-right">
                <div className="text-sm font-semibold">{user.email}</div>
                <div className="text-xs text-blue-100">Conectado</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}