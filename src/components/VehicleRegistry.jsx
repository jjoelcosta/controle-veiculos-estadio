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
  const [currentView, setCurrentView] = useState('vehicles'); // 'vehicles' | 'vehicleDetail' | 'owners' | 'ownerDetail'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Carregar dados ao iniciar
  useEffect(() => {
    setVehicles(storage.loadVehicles());
    setOwners(storage.loadOwners());
  }, []);

  // Salvar automaticamente quando houver mudanças
  useEffect(() => {
    storage.saveVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    storage.saveOwners(owners);
  }, [owners]);

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

  // Handlers de CRUD para veículos
  const handleAddVehicle = (vehicleData) => {
    const newVehicle = {
      ...vehicleData,
      id: `vehicle_${Date.now()}`,
      createdAt: new Date().toLocaleString('pt-BR')
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const handleUpdateVehicle = (vehicleId, vehicleData) => {
    setVehicles(vehicles.map(v => 
      v.id === vehicleId 
        ? { ...vehicleData, id: vehicleId, updatedAt: new Date().toLocaleString('pt-BR') }
        : v
    ));
  };

  const handleDeleteVehicle = (vehicleId) => {
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
    if (selectedVehicle?.id === vehicleId) {
      handleBackToVehicles();
    }
  };

  // Handlers de CRUD para proprietários
  const handleAddOwner = (ownerData) => {
    const newOwner = {
      ...ownerData,
      id: `owner_${Date.now()}`,
      createdAt: new Date().toLocaleString('pt-BR')
    };
    setOwners([...owners, newOwner]);
    return newOwner.id;
  };

  const handleUpdateOwner = (ownerId, ownerData) => {
    setOwners(owners.map(o => 
      o.id === ownerId 
        ? { ...ownerData, id: ownerId, updatedAt: new Date().toLocaleString('pt-BR') }
        : o
    ));
  };

  const handleDeleteOwner = (ownerId) => {
    const ownerVehicles = vehicles.filter(v => v.ownerId === ownerId);
    if (ownerVehicles.length > 0) {
      return { success: false, message: `Este proprietário tem ${ownerVehicles.length} veículo(s) cadastrado(s)` };
    }
    setOwners(owners.filter(o => o.id !== ownerId));
    if (selectedOwner?.id === ownerId) {
      handleBackToOwners();
    }
    return { success: true };
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