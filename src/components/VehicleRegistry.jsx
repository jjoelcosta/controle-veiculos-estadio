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
import LoanReports from './loan/LoanReports';
import LoanReturnForm from './loan/LoanReturnForm';
import LoanEditForm from './loan/LoanEditForm';
import Reports from './reports/Reports';
import StaffList from './staff/StaffList';
import StaffForm from './staff/StaffForm';
import StaffDetail from './staff/StaffDetail';
import EventList from './events/EventList';
import EventForm from './events/EventForm';
import EventDetail from './events/EventDetail';
import TeamManager from './events/TeamManager';
import HourBank from './events/HourBank';
import EventReports from './events/EventReports';
import VacationList from './events/VacationList';
import UserManagement from './admin/UserManagement';

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
  const [showLoanEdit, setShowLoanEdit] = useState(false);
  const [showLoanReports, setShowLoanReports] = useState(false);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffForm, setShowStaffForm] = useState(false);
  // Estados de Eventos
  const [events, setEvents] = useState([]);
  const [securityTeam, setSecurityTeam] = useState([]);
  const [hourBank, setHourBank] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [showHourBank, setShowHourBank] = useState(false);
  const [showEventReports, setShowEventReports] = useState(false);
  const [vacations, setVacations] = useState([]);
  const [showVacationList, setShowVacationList] = useState(false);
  const [staffTeamType, setStaffTeamType] = useState('operacional');
  // Estado de role
  const [userRole, setUserRole] = useState('operador');

  // ✅ CARREGAR DADOS DO SUPABASE
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [vehiclesData, ownersData, thirdPartyData, loanItemsData, loansData,
           eventsData, teamData, hourBankData, vacationsData, staffData, role] = await Promise.all([
        storage.loadVehicles(),
        storage.loadOwners(),
        storage.loadThirdPartyVehicles(),
        storage.loadLoanItems(),
        storage.loadLoans(),
        storage.loadEvents(),
        storage.loadSecurityTeam(),
        storage.loadHourBank(),
        storage.loadVacationExpenses(),
        storage.loadStaff(),
        storage.getUserRole()
      ]);

      setStaff(staffData);
      setVehicles(vehiclesData);
      setOwners(ownersData);
      setThirdPartyVehicles(thirdPartyData);
      setLoanItems(loanItemsData);
      setLoans(loansData);
      setEvents(eventsData);
      setSecurityTeam(teamData);
      setHourBank(hourBankData);
      setVacations(vacationsData);
      setUserRole(role || 'operador');

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
     HELPER: CHECAGEM DE PERMISSÃO DELETE
  ================================ */
  const checkDeletePermission = async () => {
    const admin = await storage.isAdmin();
    if (!admin) {
      throw new Error('⛔ Sem permissão para excluir. Apenas administradores.');
    }
    return true;
  };

  /* ================================
     NAVEGAÇÃO
  ================================ */
  
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
    setSelectedOwner(null);
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
      await loadData();
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
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao atualizar veículo:', err);
      throw err;
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicleId(vehicle.id);
    setCurrentView('vehicles');
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await checkDeletePermission();
      await storage.deleteVehicle(vehicleId);
      await loadData();
      
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
      await loadData();
      return newOwner.id;
    } catch (err) {
      console.error('❌ Erro ao adicionar proprietário:', err);
      throw err;
    }
  };

  const handleUpdateOwner = async (ownerId, ownerData) => {
    try {
      await storage.updateOwner(ownerId, ownerData);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao atualizar proprietário:', err);
      throw err;
    }
  };

  const handleDeleteOwner = async (ownerId) => {
    // Checar permissão primeiro
    try {
      await checkDeletePermission();
    } catch (err) {
      return { success: false, message: err.message };
    }

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
      await loadData();
      
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
      await checkDeletePermission();
      await storage.deleteThirdPartyVehicle(vehicleId);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao deletar veículo terceiro:', err);
      throw err;
    }
  };

  /* ================================
     CRUD - STAFF
  ================================ */
  const handleAddStaff = async (staffData) => {
    try {
      await storage.addStaff(staffData);
      await loadData();
      setShowStaffForm(false);
    } catch (err) {
      console.error('❌ Erro ao adicionar funcionário:', err);
      throw err;
    }
  };

  const handleUpdateStaff = async (staffId, staffData) => {
    try {
      await storage.updateStaff(staffId, staffData);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao atualizar funcionário:', err);
      throw err;
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      await checkDeletePermission();
      await storage.deleteStaff(staffId);
      await loadData();
      if (selectedStaff?.id === staffId) setSelectedStaff(null);
    } catch (err) {
      console.error('❌ Erro ao deletar funcionário:', err);
      throw err;
    }
  };

  /* ================================
     RENDERIZAÇÃO
  ================================ */

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

  const renderView = () => {
    switch (currentView) {
      case 'vehicleDetail':
        return (
          <VehicleDetail
            vehicle={selectedVehicle}
            owner={owners.find(o => o.id === selectedVehicle?.ownerId)}
            onBack={handleBackToVehicles}
            onEdit={handleOpenEditModal}
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
            onEditVehicle={handleOpenEditModal}
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

      case 'staff':
        if (showStaffForm) {
          return (
            <StaffForm
              staff={selectedStaff}
              teamType={staffTeamType}
              onSubmit={async (data) => {
                if (selectedStaff && !showStaffForm) {
                  await handleUpdateStaff(selectedStaff.id, data);
                } else if (selectedStaff) {
                  await handleUpdateStaff(selectedStaff.id, data);
                } else {
                  await handleAddStaff(data);
                }
                setShowStaffForm(false);
                setSelectedStaff(null);
              }}
              onCancel={() => {
                setShowStaffForm(false);
                setSelectedStaff(null);
              }}
            />
          );
        }
        if (selectedStaff && !showStaffForm) {
          return (
            <StaffDetail
              staff={selectedStaff}
              onBack={() => setSelectedStaff(null)}
              onEdit={(s) => { setSelectedStaff(s); setShowStaffForm(true); }}
              onDelete={async (id) => {
                await handleDeleteStaff(id);
                setSelectedStaff(null);
              }}
              onReload={loadData}
            />
          );
        }
        return (
          <StaffList
            staff={staff}
            onAdd={(teamType) => {
              setSelectedStaff(null);
              setStaffTeamType(teamType);
              setShowStaffForm(true);
            }}
            onViewDetail={(s) => setSelectedStaff(s)}
            onEdit={(s) => { setSelectedStaff(s); setShowStaffForm(true); }}
            onDelete={handleDeleteStaff}
            onBackToVehicles={() => setCurrentView('vehicles')}
          />
        );

      case 'loans': {
        if (showLoanReports) {
          return (
            <LoanReports
              loans={loans}
              onBack={() => setShowLoanReports(false)}
            />
          );
        }

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

        if (showLoanReturn && selectedLoan) {
          return (
            <LoanReturnForm
              loan={selectedLoan}
              onSubmit={handleReturnSubmit}
              onCancel={() => {
                setShowLoanReturn(false);
                loadData().then(() => {
                  const updatedLoan = loans.find(l => l.id === selectedLoan.id);
                  if (updatedLoan) setSelectedLoan(updatedLoan);
                });
              }}
            />
          );
        }

        if (showLoanEdit && selectedLoan) {
          return (
            <LoanEditForm
              loan={selectedLoan}
              onSubmit={handleUpdateLoan}
              onCancel={() => {
                setShowLoanEdit(false);
                loadData().then(() => {
                  const updatedLoan = loans.find(l => l.id === selectedLoan.id);
                  if (updatedLoan) setSelectedLoan(updatedLoan);
                });
              }}
            />
          );
        }

        if (selectedLoan) {
          return (
            <LoanDetail
              loan={selectedLoan}
              onBack={() => setSelectedLoan(null)}
              onEdit={handleEditLoan}
              onStartReturn={handleStartReturn}
              onGeneratePDF={handleGeneratePDF}
            />
          );
        }

        if (showLoanForm) {
          return (
            <LoanForm
              loanItems={loanItems}
              onSubmit={handleAddLoan}
              onCancel={() => setShowLoanForm(false)}
            />
          );
        }

        return (
          <LoanList
            loans={loans}
            onAdd={() => setShowLoanForm(true)}
            onViewDetail={handleViewLoanDetail}
            onDelete={handleDeleteLoan}
            onManageInventory={() => setShowLoanInventory(true)}
            onBackToVehicles={() => setCurrentView('vehicles')}
            onReports={() => setShowLoanReports(true)}
          />
        );
      }

      case 'events': {
        if (showVacationList) {
          return (
            <VacationList
              vacations={vacations}
              onAdd={handleAddVacation}
              onUpdate={handleUpdateVacation}
              onDelete={handleDeleteVacation}
              onBack={() => setShowVacationList(false)}
            />
          );
        }

        if (showEventReports) {
          return (
            <EventReports
              events={events}
              team={securityTeam}
              hourBank={hourBank}
              onBack={() => setShowEventReports(false)}
            />
          );
        }

        if (showHourBank) {
          return (
            <HourBank
              team={securityTeam}
              events={events}
              hourBank={hourBank}
              onAdd={handleAddHourBank}
              onUpdate={handleUpdateHourBank}
              onDelete={handleDeleteHourBank}
              onBack={() => setShowHourBank(false)}
            />
          );
        }

        if (showTeamManager) {
          return (
            <TeamManager
              team={securityTeam}
              onAdd={handleAddEmployee}
              onUpdate={handleUpdateEmployee}
              onDelete={handleDeleteEmployee}
              onBack={() => setShowTeamManager(false)}
            />
          );
        }

        if (showEventForm) {
          return (
            <EventForm
              event={editingEvent}
              onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}
              onCancel={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }}
            />
          );
        }

        if (selectedEvent) {
          return (
            <EventDetail
              event={selectedEvent}
              onBack={() => setSelectedEvent(null)}
              onEdit={(event) => {
                setEditingEvent(event);
                setShowEventForm(true);
              }}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          );
        }

        return (
          <EventList
            events={events}
            onAdd={() => setShowEventForm(true)}
            onViewDetail={(event) => setSelectedEvent(event)}
            onEdit={(event) => {
              setEditingEvent(event);
              setShowEventForm(true);
            }}
            onDelete={handleDeleteEvent}
            onBack={() => setCurrentView('vehicles')}
            onManageTeam={() => setShowTeamManager(true)}
            onHourBank={() => setShowHourBank(true)}
            onReports={() => setShowEventReports(true)}
            onVacations={() => setShowVacationList(true)}
          />
        );
      }

      case 'reports':
        return (
          <Reports
            vehicles={vehicles}
            owners={owners}
            thirdPartyVehicles={thirdPartyVehicles}
            loans={loans}
            events={events}
            staff={staff}
            onBack={() => setCurrentView('vehicles')}
          />
        );

      case 'admin':
        return (
          <UserManagement
            onBack={() => setCurrentView('vehicles')}
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
            events={events}
            staff={staff}
            userRole={userRole}
            editingVehicleId={editingVehicleId}
            onViewDetail={handleViewVehicleDetail}
            onAdd={handleAddVehicle}
            onEdit={handleUpdateVehicle}
            onDelete={handleDeleteVehicle}
            onNavigateToOwners={handleNavigateToOwners}
            onNavigateToThirdParty={() => setCurrentView('thirdParty')}
            onNavigateToLoans={() => setCurrentView('loans')}
            onNavigateToReports={() => setCurrentView('reports')}
            onNavigateToStaff={() => setCurrentView('staff')}
            onNavigateToEvents={() => setCurrentView('events')}
            onNavigateToAdmin={() => setCurrentView('admin')}
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
      await checkDeletePermission();
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
        finalStatus = 'emprestado';
      }

      await storage.updateLoanStatus(selectedLoan.id, finalStatus, {
        actualReturnDate: returnData.actualReturnDate,
        returnedBy: returnData.returnedBy
      });

      await loadData();
      setShowLoanReturn(false);
      
    } catch (err) {
      console.error('❌ Erro ao registrar devolução:', err);
      throw err;
    }
  };

  const handleEditLoan = () => {
    setShowLoanEdit(true);
  };

  const handleUpdateLoan = async (loanId, loanData) => {
  try {
    await storage.updateLoan(loanId, loanData);
    const freshLoans = await storage.loadLoans(); // ← trocar loadData() por isso
    setLoans(freshLoans);
    setShowLoanEdit(false);
    const updatedLoan = freshLoans.find(l => l.id === loanId); // ← freshLoans
    if (updatedLoan) setSelectedLoan(updatedLoan);
  } catch (err) {
    console.error('❌ Erro ao atualizar empréstimo:', err);
    throw err;
  }
};

  /* ================================
    CRUD - EVENTOS
  ================================ */

  const handleAddEvent = async (eventData) => {
    try {
      await storage.addEvent(eventData);
      await loadData();
      setShowEventForm(false);
      setEditingEvent(null);
    } catch (err) {
      console.error('❌ Erro ao adicionar evento:', err);
      throw err;
    }
  };

  const handleUpdateEvent = async (eventData) => {
  try {
    await storage.updateEvent(editingEvent.id, eventData);
    const freshEvents = await storage.loadEvents(); // ← trocar loadData() por isso
    setEvents(freshEvents);
    setShowEventForm(false);
    setEditingEvent(null);
    if (selectedEvent?.id === editingEvent.id) {
      const updated = freshEvents.find(e => e.id === editingEvent.id); // ← freshEvents
      if (updated) setSelectedEvent(updated);
    }
  } catch (err) {
    console.error('❌ Erro ao atualizar evento:', err);
    throw err;
  }
};

  const handleDeleteEvent = async (eventId) => {
    try {
      await checkDeletePermission();
      await storage.deleteEvent(eventId);
      await loadData();
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
    } catch (err) {
      console.error('❌ Erro ao deletar evento:', err);
      throw err;
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await storage.addEventExpense(expenseData);
      const freshEvents = await storage.loadEvents();
      setEvents(freshEvents);
      const updated = freshEvents.find(e => e.id === expenseData.eventId);
      if (updated) setSelectedEvent(updated);
    } catch (err) {
      console.error('❌ Erro ao adicionar gasto:', err);
      throw err;
    }
  };

  const handleUpdateExpense = async (expenseId, expenseData) => {
    try {
      await storage.updateEventExpense(expenseId, expenseData);
      const freshEvents = await storage.loadEvents();
      setEvents(freshEvents);
      const updated = freshEvents.find(e => e.id === expenseData.eventId);
      if (updated) setSelectedEvent(updated);
    } catch (err) {
      console.error('❌ Erro ao atualizar gasto:', err);
      throw err;
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await checkDeletePermission();
      await storage.deleteEventExpense(expenseId);
      const freshEvents = await storage.loadEvents();
      setEvents(freshEvents);
      if (selectedEvent) {
        const updated = freshEvents.find(e => e.id === selectedEvent.id);
        if (updated) setSelectedEvent(updated);
      }
    } catch (err) {
      console.error('❌ Erro ao deletar gasto:', err);
      throw err;
    }
  };

  /* ================================
    CRUD - EQUIPE
  ================================ */

  const handleAddEmployee = async (employeeData) => {
    try {
      await storage.addSecurityEmployee(employeeData);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao adicionar funcionário:', err);
      throw err;
    }
  };

  const handleUpdateEmployee = async (employeeId, employeeData) => {
    try {
      await storage.updateSecurityEmployee(employeeId, employeeData);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao atualizar funcionário:', err);
      throw err;
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await checkDeletePermission();
      await storage.deleteSecurityEmployee(employeeId);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao deletar funcionário:', err);
      throw err;
    }
  };

  /* ================================
     CRUD - FÉRIAS
  ================================ */

  const handleAddVacation = async (vacationData) => {
    try {
      await storage.addVacationExpense(vacationData);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao adicionar férias:', err);
      throw err;
    }
  };

  const handleUpdateVacation = async (vacationId, vacationData) => {
    try {
      await storage.updateVacationExpense(vacationId, vacationData);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao atualizar férias:', err);
      throw err;
    }
  };

  const handleDeleteVacation = async (vacationId) => {
    try {
      await checkDeletePermission();
      await storage.deleteVacationExpense(vacationId);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao deletar férias:', err);
      throw err;
    }
  };

  /* ================================
    CRUD - BANCO DE HORAS
  ================================ */

  const handleAddHourBank = async (hourData) => {
    try {
      await storage.addHourBank(hourData);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao registrar horas:', err);
      throw err;
    }
  };

  const handleUpdateHourBank = async (hourId, hourData) => {
    try {
      await storage.updateHourBank(hourId, hourData);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao atualizar horas:', err);
      throw err;
    }
  };

  const handleDeleteHourBank = async (hourId) => {
    try {
      await checkDeletePermission();
      await storage.deleteHourBank(hourId);
      await loadData();
    } catch (err) {
      console.error('❌ Erro ao deletar horas:', err);
      throw err;
    }
  };

  const handleGeneratePDF = async () => {
    try {
      if (selectedLoan.status === 'devolvido' || selectedLoan.status === 'perdido_danificado') {
        const fileName = await generateReturnPDF(selectedLoan);
        console.log('✅ PDF de devolução gerado:', fileName);
      } else {
        const fileName = await generateLoanPDF(selectedLoan);
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