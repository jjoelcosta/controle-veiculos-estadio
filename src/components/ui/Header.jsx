import React from 'react';
import { Car, Building2 } from 'lucide-react';

export default function Header({ 
  logoUrl, 
  companyName = "Estádio Nacional", 
  subtitle = "Sistema de Controle de Veículos",
  vehicleCount,
  ownerCount 
}) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-8 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-6">
        
        {/* Logo e Título */}
        <div className="flex items-center gap-6">
          {/* Logo */}
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
          
          {/* Textos */}
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

        {/* Estatísticas */}
        <div className="flex gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
            <div className="text-3xl font-bold">{vehicleCount}</div>
            <div className="text-blue-100 text-sm">Veículos</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
            <div className="text-3xl font-bold">{ownerCount}</div>
            <div className="text-blue-100 text-sm">Proprietários</div>
          </div>
        </div>
      </div>
    </div>
  );
}