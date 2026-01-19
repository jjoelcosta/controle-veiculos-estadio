import React, { useState, useEffect } from 'react';
import { Car, User } from 'lucide-react';
import { ToastProvider } from './ui/Toast';
import { storage } from '../utils/storage';
import VehicleList from './vehicle/VehicleList';
import VehicleDetail from './vehicle/VehicleDetail';
import OwnerList from './owner/OwnerList';
import OwnerDetail from './owner/OwnerDetail';

export default function VehicleRegistry() {
  // Estados principais
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [currentView, setCurrentView] = useState('vehicles');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FUNÇÃO PARA RECARREGAR DADOS
  const loadData = async () => {
    try {
      setLoading(true);
      const vehiclesData = await storage.loadVehicles();
      const ownersData = await storage.loadOwners();
      setVehicles(vehiclesData);
      setOwners(ownersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARREGAR DADOS AO INICIAR
  useEffect(() => {
    loadData();
  }, []);

  // Handlers de navegação
  const handleViewVehicleDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentView('vehicleDetail');
  };

  const handleViewOwnerDetail = (owner) => {
    setSelectedOwner(owner);
    setCurrentView('ownerDetail');
  };

  const handleBackToVehicles = () => {
    setCurrentView('vehicles');
    setSelectedVehicle(null);
  };

  const handleBackToOwners = () => {
    setCurrentView('owners');
    setSelectedOwner(null);
  };

  const handleNavigateToOwners = () => {
    setCurrentView('owners');
  };

  const handleNavigateToVehicles = () => {
    setCurrentView('vehicles');
  };

  // ✅ HANDLERS DE CRUD PARA VEÍCULOS (COM RELOAD!)
  const handleAddVehicle = async (vehicleData) => {
    try {
      await storage.addVehicle(vehicleData);
      await loadData(); // ✅ RECARREGA TUDO
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      throw error;
    }
  };

  const handleUpdateVehicle = async (vehicleId, vehicleData) => {
    try {
      await storage.updateVehicle(vehicleId, vehicleData);
      await loadData(); // ✅ RECARREGA TUDO
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      throw error;
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await storage.deleteVehicle(vehicleId);
      await loadData(); // ✅ RECARREGA TUDO (agora não traz mais o deletado!)
      if (selectedVehicle?.id === vehicleId) {
        handleBackToVehicles();
      }
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
      throw error;
    }
  };

  // ✅ HANDLERS DE CRUD PARA PROPRIETÁRIOS (COM RELOAD!)
  const handleAddOwner = async (ownerData) => {
    try {
      const newOwner = await storage.addOwner(ownerData);
      await loadData(); // ✅ RECARREGA TUDO
      return newOwner.id;
    } catch (error) {
      console.error('Erro ao adicionar proprietário:', error);
      throw error;
    }
  };

  const handleUpdateOwner = async (ownerId, ownerData) => {
    try {
      await storage.updateOwner(ownerId, ownerData);
      await loadData(); // ✅ RECARREGA TUDO
    } catch (error) {
      console.error('Erro ao atualizar proprietário:', error);
      throw error;
    }
  };

  const handleDeleteOwner = async (ownerId) => {
    const ownerVehicles = vehicles.filter(v => v.ownerId === ownerId);
    if (ownerVehicles.length > 0) {
      return { success: false, message: `Este proprietário tem ${ownerVehicles.length} veículo(s) cadastrado(s)` };
    }
    try {
      await storage.deleteOwner(ownerId);
      await loadData(); // ✅ RECARREGA TUDO
      if (selectedOwner?.id === ownerId) {
        handleBackToOwners();
      }
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar proprietário:', error);
      return { success: false, message: error.message };
    }
  };

  // Renderização condicional baseada na view atual
  const renderView = () => {
    switch (currentView) {
      case 'vehicleDetail':
        return (
          <VehicleDetail
            vehicle={selectedVehicle}
            owner={owners.find(o => o.id === selectedVehicle?.ownerId)}
            onBack={handleBackToVehicles}
            onEdit={handleUpdateVehicle}
            onDelete={handleDeleteVehicle}
          />
        );

      case 'owners':
        return (
          <OwnerList
            owners={owners}
            vehicles={vehicles}
            onViewDetail={handleViewOwnerDetail}
            onAdd={handleAddOwner}
            onEdit={handleUpdateOwner}
            onDelete={handleDeleteOwner}
            onBackToVehicles={handleNavigateToVehicles}
          />
        );

      case 'ownerDetail':
        return (
          <OwnerDetail
            owner={selectedOwner}
            vehicles={vehicles.filter(v => v.ownerId === selectedOwner?.id)}
            onBack={handleBackToOwners}
            onEdit={handleUpdateOwner}
            onDelete={handleDeleteOwner}
            onEditVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        );

      case 'vehicles':
      default:
        return (
          <VehicleList
            vehicles={vehicles}
            owners={owners}
            onViewDetail={handleViewVehicleDetail}
            onAdd={handleAddVehicle}
            onEdit={handleUpdateVehicle}
            onDelete={handleDeleteVehicle}
            onNavigateToOwners={handleNavigateToOwners}
          />
        );
    }
  };

  return (
    <ToastProvider>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Carregando dados...</p>
          </div>
        </div>
      ) : (
        renderView()
      )}
    </ToastProvider>
  );
}
