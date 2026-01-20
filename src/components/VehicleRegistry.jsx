import React, { useState, useEffect } from 'react';
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

  // 🔄 Carregar dados (fonte única da verdade)
  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, ownersData] = await Promise.all([
        storage.loadVehicles(),
        storage.loadOwners()
      ]);
      setVehicles(vehiclesData || []);
      setOwners(ownersData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔁 Navegação
  const backToVehicles = () => {
    setCurrentView('vehicles');
    setSelectedVehicle(null);
    setSelectedOwner(null);
  };

  const backToOwners = () => {
    setCurrentView('owners');
    setSelectedOwner(null);
  };

  // 🚗 VEÍCULOS
  const handleAddVehicle = async (vehicleData) => {
    await storage.addVehicle(vehicleData);
    await loadData();
  };

  const handleUpdateVehicle = async (vehicleId, vehicleData) => {
    await storage.updateVehicle(vehicleId, vehicleData);
    await loadData();
  };

  const handleDeleteVehicle = async (vehicleId) => {
    await storage.deleteVehicle(vehicleId);
    await loadData();
    if (selectedVehicle?.id === vehicleId) {
      backToVehicles();
    }
  };

  // 👤 PROPRIETÁRIOS
  const handleAddOwner = async (ownerData) => {
    await storage.addOwner(ownerData);
    await loadData();
  };

  const handleUpdateOwner = async (ownerId, ownerData) => {
    await storage.updateOwner(ownerId, ownerData);
    await loadData();
  };

  // ❗ CORREÇÃO CRÍTICA: validação sempre pelo storage
  const handleDeleteOwner = async (ownerId) => {
    try {
      const allVehicles = await storage.loadVehicles();
      const ownerVehicles = allVehicles.filter(v => v.ownerId === ownerId);

      if (ownerVehicles.length > 0) {
        return {
          success: false,
          message: `Este proprietário tem ${ownerVehicles.length} veículo(s) cadastrado(s)`
        };
      }

      await storage.deleteOwner(ownerId);
      await loadData();

      if (selectedOwner?.id === ownerId) {
        backToOwners();
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar proprietário:', error);
      return { success: false, message: error.message };
    }
  };

  // 🧠 Renderização por estado
  const renderView = () => {
    switch (currentView) {
      case 'vehicleDetail':
        return (
          <VehicleDetail
            vehicle={selectedVehicle}
            owner={owners.find(o => o.id === selectedVehicle?.ownerId)}
            onBack={backToVehicles}
            onEdit={handleUpdateVehicle}
            onDelete={handleDeleteVehicle}
          />
        );

      case 'owners':
        return (
          <OwnerList
            owners={owners}
            vehicles={vehicles}
            onViewDetail={(owner) => {
              setSelectedOwner(owner);
              setCurrentView('ownerDetail');
            }}
            onAdd={handleAddOwner}
            onEdit={handleUpdateOwner}
            onDelete={handleDeleteOwner}
            onBackToVehicles={backToVehicles}
          />
        );

      case 'ownerDetail':
        return (
          <OwnerDetail
            owner={selectedOwner}
            vehicles={vehicles.filter(v => v.ownerId === selectedOwner?.id)}
            onBack={backToOwners}
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
            onViewDetail={(vehicle) => {
              setSelectedVehicle(vehicle);
              setCurrentView('vehicleDetail');
            }}
            onAdd={handleAddVehicle}
            onEdit={handleUpdateVehicle}
            onDelete={handleDeleteVehicle}
            onNavigateToOwners={() => setCurrentView('owners')}
          />
        );
    }
  };

  return (
    <ToastProvider>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      ) : (
        renderView()
      )}
    </ToastProvider>
  );
}
