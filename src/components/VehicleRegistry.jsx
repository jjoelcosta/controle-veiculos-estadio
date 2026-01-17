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

  // ✅ CARREGAR DADOS AO INICIAR (ASYNC/AWAIT!)
  useEffect(() => {
    const loadData = async () => {
      try {
        const vehiclesData = await storage.loadVehicles();
        const ownersData = await storage.loadOwners();
        setVehicles(vehiclesData);
        setOwners(ownersData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
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

  // ✅ HANDLERS DE CRUD PARA VEÍCULOS (ASYNC!)
  const handleAddVehicle = async (vehicleData) => {
    try {
      const newVehicle = await storage.addVehicle(vehicleData);
      setVehicles([...vehicles, newVehicle]);
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      alert('Erro ao cadastrar veículo. Verifique sua conexão.');
    }
  };

  const handleUpdateVehicle = async (vehicleId, vehicleData) => {
    try {
      const updatedVehicle = await storage.updateVehicle(vehicleId, vehicleData);
      setVehicles(vehicles.map(v => v.id === vehicleId ? updatedVehicle : v));
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      alert('Erro ao atualizar veículo. Verifique sua conexão.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await storage.deleteVehicle(vehicleId);
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      if (selectedVehicle?.id === vehicleId) {
        handleBackToVehicles();
      }
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
      alert('Erro ao deletar veículo. Verifique sua conexão.');
    }
  };

  // ✅ HANDLERS DE CRUD PARA PROPRIETÁRIOS (ASYNC!)
  const handleAddOwner = async (ownerData) => {
    try {
      const newOwner = await storage.addOwner(ownerData);
      setOwners([...owners, newOwner]);
      return newOwner.id;
    } catch (error) {
      console.error('Erro ao adicionar proprietário:', error);
      alert('Erro ao cadastrar proprietário. Verifique sua conexão.');
    }
  };

  const handleUpdateOwner = async (ownerId, ownerData) => {
    try {
      const updatedOwner = await storage.updateOwner(ownerId, ownerData);
      setOwners(owners.map(o => o.id === ownerId ? updatedOwner : o));
    } catch (error) {
      console.error('Erro ao atualizar proprietário:', error);
      alert('Erro ao atualizar proprietário. Verifique sua conexão.');
    }
  };

  const handleDeleteOwner = async (ownerId) => {
    const ownerVehicles = vehicles.filter(v => v.ownerId === ownerId);
    if (ownerVehicles.length > 0) {
      return { success: false, message: `Este proprietário tem ${ownerVehicles.length} veículo(s) cadastrado(s)` };
    }
    try {
      await storage.deleteOwner(ownerId);
      setOwners(owners.filter(o => o.id !== ownerId));
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
      {renderView()}
    </ToastProvider>
  );
}