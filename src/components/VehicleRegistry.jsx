import React, { useState, useEffect } from 'react';
import { ToastProvider } from './ui/Toast';
import { storage } from '../utils/storage';
import { generateLoanPDF, generateReturnPDF } from '../utils/loanPDF';
import VehicleList from './vehicle/VehicleList';
import VehicleDetail from './vehicle/VehicleDetail';
import OwnerList from './owner/OwnerList';
import OwnerDetail from './owner/OwnerDetail';
import VehicleEditModal from './vehicle/VehicleEditModal';
import ThirdPartyVehicleList from './thirdparty/ThirdPartyVehicleList';
import LoanList from './loan/LoanList';
import LoanForm from './loan/LoanForm';
import LoanInventory from './loan/LoanInventory';
import LoanDetail from './loan/LoanDetail';
import LoanReturnForm from './loan/LoanReturnForm';

export default function VehicleRegistry() {
  // Estados principais
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [currentView, setCurrentView] = useState('vehicles');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [thirdPartyVehicles, setThirdPartyVehicles] = useState([]);
  const [loanItems, setLoanItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showLoanInventory, setShowLoanInventory] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showLoanReturn, setShowLoanReturn] = useState(false);

  // ✅ CARREGAR DADOS DO SUPABASE
  const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const [vehiclesData, ownersData, thirdPartyData, loanItemsData, loansData] = await Promise.all([
      storage.loadVehicles(),
      storage.loadOwners(),
      storage.loadThirdPartyVehicles(),
      storage.loadLoanItems(),
      storage.loadLoans()
    ]);
    
    setVehicles(vehiclesData);
    setOwners(ownersData);
    setThirdPartyVehicles(thirdPartyData);
    setLoanItems(loanItemsData);
    setLoans(loansData);
  } catch (err) {
    console.error('❌ Erro ao carregar dados:', err);
    setError(err.message || 'Erro ao conectar com o banco de dados');
  } finally {
    setLoading(false);
  }
};
  // ✅ CARREGAR DADOS AO INICIAR
  useEffect(() => {
    loadData();
  }, []);

  /* ================================
     NAVEGAÇÃO
  ================================ */
  
  const handleViewVehicleDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentView('vehicleDetail');
  };

  const handleViewOwnerDetail = (owner) => {
  console.log('🟢 RECEBEU NO REGISTRY:', owner);
  console.log('🟢 selectedOwner ANTES:', selectedOwner);
  setSelectedOwner(owner);
  setCurrentView('ownerDetail');
  console.log('🟢 Mudou view pra ownerDetail');
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
  setCurrentView('owners');  // ✅ Vai pra LISTA, não pra detail
  setSelectedOwner(null);    // ✅ Limpa o owner selecionado
};

  const handleNavigateToVehicles = () => {
    setCurrentView('vehicles');
  };

  /* ================================
     CRUD - VEÍCULOS
  ================================ */

  const handleAddVehicle = async (vehicleData) => {
    try {
      await storage.addVehicle(vehicleData);
      await loadData(); // Recarrega tudo
    } catch (err) {
      console.error('❌ Erro ao adicionar veículo:', err);
      throw err;
    }
  };

      const handleOpenEditModal = (vehicle) => {
      setEditingVehicle(vehicle);
      setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
      setEditModalOpen(false);
      setEditingVehicle(null);
    };

    const handleSaveFromModal = async (vehicleId, vehicleData) => {
      await handleUpdateVehicle(vehicleId, vehicleData);
      handleCloseEditModal();
    };

  const handleUpdateVehicle = async (vehicleId, vehicleData) => {
    try {
      await storage.updateVehicle(vehicleId, vehicleData);
      await loadData(); // Recarrega tudo
    } catch (err) {
      console.error('❌ Erro ao atualizar veículo:', err);
      throw err;
    }
  };

    const handleEditVehicle = (vehicle) => {
      setEditingVehicleId(vehicle.id);
      setCurrentView('vehicles'); // Volta pra lista
    };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await storage.deleteVehicle(vehicleId);
      await loadData(); // Recarrega (sem o deletado)
      
      if (selectedVehicle?.id === vehicleId) {
        handleBackToVehicles();
      }
    } catch (err) {
      console.error('❌ Erro ao deletar veículo:', err);
      throw err;
    }
  };

  /* ================================
     CRUD - PROPRIETÁRIOS
  ================================ */

  const handleAddOwner = async (ownerData) => {
    try {
      const newOwner = await storage.addOwner(ownerData);
      await loadData(); // Recarrega tudo
      return newOwner.id;
    } catch (err) {
      console.error('❌ Erro ao adicionar proprietário:', err);
      throw err;
    }
  };

  const handleUpdateOwner = async (ownerId, ownerData) => {
    try {
      await storage.updateOwner(ownerId, ownerData);
      await loadData(); // Recarrega tudo
    } catch (err) {
      console.error('❌ Erro ao atualizar proprietário:', err);
      throw err;
    }
  };

  const handleDeleteOwner = async (ownerId) => {
    // Validação: não permite deletar se tiver veículos vinculados
    const ownerVehicles = vehicles.filter(v => v.ownerId === ownerId);
    
    if (ownerVehicles.length > 0) {
      return { 
        success: false, 
        message: `Este proprietário tem ${ownerVehicles.length} veículo(s) cadastrado(s)` 
      };
    }

    try {
      await storage.deleteOwner(ownerId);
      await loadData(); // Recarrega tudo
      
      if (selectedOwner?.id === ownerId) {
        handleBackToOwners();
      }
      
      return { success: true };
    } catch (err) {
      console.error('❌ Erro ao deletar proprietário:', err);
      return { success: false, message: err.message };
    }
  };

  /* ================================
   CRUD - VEÍCULOS TERCEIROS
================================ */

const handleAddThirdPartyVehicle = async (vehicleData) => {
  try {
    await storage.addThirdPartyVehicle(vehicleData);
    await loadData();
  } catch (err) {
    console.error('❌ Erro ao adicionar veículo terceiro:', err);
    throw err;
  }
};

const handleUpdateThirdPartyVehicle = async (vehicleId, vehicleData) => {
  try {
    await storage.updateThirdPartyVehicle(vehicleId, vehicleData);
    await loadData();
  } catch (err) {
    console.error('❌ Erro ao atualizar veículo terceiro:', err);
    throw err;
  }
};

const handleDeleteThirdPartyVehicle = async (vehicleId) => {
  try {
    await storage.deleteThirdPartyVehicle(vehicleId);
    await loadData();
  } catch (err) {
    console.error('❌ Erro ao deletar veículo terceiro:', err);
    throw err;
  }
};

  /* ================================
     RENDERIZAÇÃO
  ================================ */

  // Tela de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro de Conexão</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderização condicional baseada na view
  const renderView = () => {
    switch (currentView) {
      case 'vehicleDetail':
        return (
          <VehicleDetail
            vehicle={selectedVehicle}
            owner={owners.find(o => o.id === selectedVehicle?.ownerId)}
            onBack={handleBackToVehicles}
            onEdit={handleOpenEditModal}  // ✅ Abre o modal
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
          onEditVehicle={handleOpenEditModal}  // ✅ CORRIGIDO
          onDeleteVehicle={handleDeleteVehicle}
        />
      );

      case 'thirdParty':
    return (
      <ThirdPartyVehicleList
        vehicles={thirdPartyVehicles}
        onAdd={handleAddThirdPartyVehicle}
        onEdit={handleUpdateThirdPartyVehicle}
        onDelete={handleDeleteThirdPartyVehicle}
        onBackToVehicles={() => setCurrentView('vehicles')}
      />
    );

   case 'loans':
  // Gestão de Estoque
  if (showLoanInventory) {
    return (
      <LoanInventory
        loanItems={loanItems}
        onUpdateQuantity={async (itemId, total, available) => {
          await storage.updateLoanItemQuantity(itemId, total, available);
          await loadData();
        }}
        onBack={() => setShowLoanInventory(false)}
      />
    );
  }

  // Formulário de Devolução
  if (showLoanReturn && selectedLoan) {
    return (
      <LoanReturnForm
        loan={selectedLoan}
        onSubmit={handleReturnSubmit}
        onCancel={() => {
          setShowLoanReturn(false);
          // Recarregar empréstimo atualizado
          loadData().then(() => {
            const updatedLoan = loans.find(l => l.id === selectedLoan.id);
            if (updatedLoan) setSelectedLoan(updatedLoan);
          });
        }}
      />
    );
  }

  // Detalhes do Empréstimo
  if (selectedLoan) {
    return (
      <LoanDetail
        loan={selectedLoan}
        onBack={() => setSelectedLoan(null)}
        onStartReturn={handleStartReturn}
        onGeneratePDF={handleGeneratePDF}
      />
    );
  }

  // Formulário de Cadastro
  if (showLoanForm) {
    return (
      <LoanForm
        loanItems={loanItems}
        onSubmit={handleAddLoan}
        onCancel={() => setShowLoanForm(false)}
      />
    );
  }
  
  // Lista Principal
  return (
    <LoanList
      loans={loans}
      onAdd={() => setShowLoanForm(true)}
      onViewDetail={handleViewLoanDetail}
      onDelete={handleDeleteLoan}
      onManageInventory={() => setShowLoanInventory(true)}
      onBackToVehicles={() => setCurrentView('vehicles')}
    />
  );

    case 'vehicles':
    default:
      return (
        <VehicleList
          vehicles={vehicles}
          owners={owners}
          thirdPartyVehicles={thirdPartyVehicles}
          loans={loans}
          editingVehicleId={editingVehicleId}
          onViewDetail={handleViewVehicleDetail}
          onAdd={handleAddVehicle}
          onEdit={handleUpdateVehicle}
          onDelete={handleDeleteVehicle}
          onNavigateToOwners={handleNavigateToOwners}
          onNavigateToThirdParty={() => setCurrentView('thirdParty')}
          onNavigateToLoans={() => setCurrentView('loans')}
          onCancelEdit={() => setEditingVehicleId(null)}
        />
      );
    }
  };

/* ================================
   CRUD - EMPRÉSTIMOS
================================ */

const handleAddLoan = async (loanData) => {
  try {
    await storage.addLoan(loanData);
    await loadData();
    setShowLoanForm(false);
  } catch (err) {
    console.error('❌ Erro ao adicionar empréstimo:', err);
    throw err;
  }
};

const handleDeleteLoan = async (loanId) => {
  try {
    await storage.deleteLoan(loanId);
    await loadData();
  } catch (err) {
    console.error('❌ Erro ao deletar empréstimo:', err);
    throw err;
  }
};

const handleViewLoanDetail = (loan) => {
  setSelectedLoan(loan);
};

const handleStartReturn = () => {
  setShowLoanReturn(true);
};

const handleReturnSubmit = async (returnData) => {
  try {
    // 1. Atualizar cada item devolvido
    for (const item of returnData.items) {
      await storage.updateLoanItemReturn(item.id, {
        quantityReturned: item.quantityReturned,
        condition: item.condition,
        damageFee: item.damageFee,
        paymentMethod: item.paymentMethod,
        paymentDate: item.paymentDate,
        notes: item.notes
      });
    }

    // 2. Determinar status final
    const allReturned = returnData.items.every(
      item => item.quantityReturned === item.quantityBorrowed
    );
    const hasDamage = returnData.items.some(
      item => item.condition === 'Danificado' || item.condition === 'Perdido'
    );

    let finalStatus = 'devolvido';
    if (hasDamage) {
      finalStatus = 'perdido_danificado';
    } else if (!allReturned) {
      finalStatus = 'emprestado'; // Devolução parcial mantém emprestado
    }

    // 3. Atualizar status do empréstimo
    await storage.updateLoanStatus(selectedLoan.id, finalStatus, {
      actualReturnDate: returnData.actualReturnDate,
      returnedBy: returnData.returnedBy
    });

    // 4. Recarregar dados
    await loadData();
    
    // 5. Voltar para detalhes
    setShowLoanReturn(false);
    
  } catch (err) {
    console.error('❌ Erro ao registrar devolução:', err);
    throw err;
  }
};

const handleGeneratePDF = () => {
  try {
    // Gerar PDF de empréstimo ou devolução
    if (selectedLoan.status === 'devolvido' || selectedLoan.status === 'perdido_danificado') {
      const fileName = generateReturnPDF(selectedLoan);
      console.log('✅ PDF de devolução gerado:', fileName);
    } else {
      const fileName = generateLoanPDF(selectedLoan);
      console.log('✅ PDF de empréstimo gerado:', fileName);
    }
  } catch (err) {
    console.error('❌ Erro ao gerar PDF:', err);
    alert('Erro ao gerar PDF. Verifique o console.');
  }
};

  return (
  <ToastProvider>
    {renderView()}
    <VehicleEditModal
      isOpen={editModalOpen}
      vehicle={editingVehicle}
      owners={owners}
      onSave={handleSaveFromModal}
      onClose={handleCloseEditModal}
    />
  </ToastProvider>
);
}