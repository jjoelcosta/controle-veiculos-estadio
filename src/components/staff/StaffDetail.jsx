import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Edit, UserCheck, Calendar, Clock, MapPin,
  AlertCircle, CheckCircle, Plus, Trash2, RefreshCw,
  Sun, ArrowLeftRight, FileText, Save, X
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import { useModal } from '../ui/Modal';
import LoadingButton from '../ui/LoadingButton';
import { storage } from '../../utils/storage';

const STATUS_CONFIG = {
  ativo:      { label: 'Ativo',      color: 'bg-green-100 text-green-800',  icon: '🟢' },
  férias:     { label: 'Férias',     color: 'bg-blue-100 text-blue-800',    icon: '🔵' },
  afastado:   { label: 'Afastado',   color: 'bg-orange-100 text-orange-800',icon: '🟠' },
  desligado:  { label: 'Desligado',  color: 'bg-gray-100 text-gray-800',    icon: '⚫' }
};

const ABSENCE_TYPES = ['Atestado Médico', 'Licença', 'Suspensão', 'Outro'];

// ─────────────────────────────────────────
// LÓGICA DE FÉRIAS CLT
// ─────────────────────────────────────────
const calcVacationPeriods = (hireDate) => {
  if (!hireDate) return [];
  const hire = new Date(hireDate + 'T12:00:00');
  const today = new Date();
  const periods = [];

  let periodStart = new Date(hire);
  while (periodStart < today) {
    const periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    periodEnd.setDate(periodEnd.getDate() - 1);

    const availableFrom = new Date(periodEnd);
    availableFrom.setDate(availableFrom.getDate() + 1);

    const expiresOn = new Date(availableFrom);
    expiresOn.setFullYear(expiresOn.getFullYear() + 1);
    expiresOn.setDate(expiresOn.getDate() - 1);

    const isExpired = expiresOn < today;
    const daysUntilExpiry = Math.round((expiresOn - today) / (1000 * 60 * 60 * 24));
    const isAvailable = availableFrom <= today;
    const isUrgent = isAvailable && !isExpired && daysUntilExpiry <= 90;

    periods.push({
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
      availableFrom: availableFrom.toISOString().split('T')[0],
      expiresOn: expiresOn.toISOString().split('T')[0],
      isAvailable,
      isExpired,
      isUrgent,
      daysUntilExpiry
    });

    periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() + 1);
  }

  return periods.reverse();
};

export default function StaffDetail({
  staff,
  onBack,
  onEdit,
  onDelete,
  onReload
}) {
  const { success, error: showError } = useToast();
  const { openModal, ModalComponent } = useModal();
  const [activeTab, setActiveTab] = useState('dados');

  // ── Férias ──
  const [vacations, setVacations] = useState([]);
  const [showVacForm, setShowVacForm] = useState(false);
  const [editingVac, setEditingVac] = useState(null);
    const [vacForm, setVacForm] = useState({
    acquisition_start: '', acquisition_end: '',
    available_from: '', expires_on: '',
    vacation_start: '', vacation_end: '',
    days_taken: 30, status: 'disponível', notes: '',
    gozadas_sem_data: false
  });

  // ── Trocas ──
  const [swaps, setSwaps] = useState([]);
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapForm, setSwapForm] = useState({
    target_id: '', original_date: '', swap_date: '',
    status: 'aprovada', notes: '',
    swap_type: 'por_data'  // 'por_data' | 'definitiva'
  });

  // ── Afastamentos ──
  const [absences, setAbsences] = useState([]);
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null);
  const [absenceForm, setAbsenceForm] = useState({
    absence_type: 'Atestado Médico',
    start_date: '', end_date: '',
    days_count: '', document_number: '', notes: '',
    indeterminate: false
  });
  const [saving, setSaving] = useState(false);
  const [allStaff, setAllStaff] = useState([]);

  // ── Carrega dados ──
  useEffect(() => {
    loadAll();
  }, [staff.id]);

  const loadAll = async () => {
    try {
      const [vacs, swapData, abs, staffAll] = await Promise.all([
        storage.loadStaffVacations(staff.id),
        storage.loadStaffShiftSwaps(),
        storage.loadStaffAbsences(staff.id),
        storage.loadStaff()
      ]);
      setVacations(vacs);
      setSwaps(swapData.filter(s =>
        s.requester_id === staff.id || s.target_id === staff.id
      ));
      setAbsences(abs);
      setAllStaff(staffAll.filter(s => s.id !== staff.id));
    } catch (err) {
      showError('Erro ao carregar dados');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '-';
    const d = cpf.replace(/\D/g, '');
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  };

  const calcAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate + 'T12:00:00');
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const calcTenure = (hireDate) => {
    if (!hireDate) return null;
    const today = new Date();
    const hire = new Date(hireDate + 'T12:00:00');
    const totalMonths = (today.getFullYear() - hire.getFullYear()) * 12 +
      (today.getMonth() - hire.getMonth());
    if (totalMonths < 12) return `${totalMonths} mês(es)`;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return m > 0 ? `${y} ano(s) e ${m} mês(es)` : `${y} ano(s)`;
  };

  const statusCfg = STATUS_CONFIG[staff.status] || STATUS_CONFIG.ativo;

// Chave única por período aquisitivo — função pura fora de hooks
const periodKey = (p) => `${p.periodStart}|${p.periodEnd}`;

// useMemo garante recalculo quando vacations mudar
const { vacationPeriods, takenPeriodKeys, alertPeriods } = React.useMemo(() => {
  const vacationPeriods = calcVacationPeriods(staff.hire_date);

  const takenPeriodKeys = new Set(
    (vacations || [])
      .filter(v =>
        (v.status === 'gozada' || v.gozadas_sem_data) &&
        v.acquisition_start && v.acquisition_end
      )
      .map(v => `${v.acquisition_start}|${v.acquisition_end}`)
  );

  const alertPeriods = vacationPeriods
    .filter(p => p.isUrgent || p.isExpired)
    .filter(p => !takenPeriodKeys.has(periodKey(p)));

  return { vacationPeriods, takenPeriodKeys, alertPeriods };
}, [vacations, staff.hire_date]);

  // ─────────────────────────────────────────
  // FÉRIAS — handlers
  // ─────────────────────────────────────────
  const handleVacFormFromPeriod = (period) => {
    setVacForm({
      acquisition_start: period.periodStart,
      acquisition_end: period.periodEnd,
      available_from: period.availableFrom,
      expires_on: period.expiresOn,
      vacation_start: '',
      vacation_end: '',
      days_taken: 30,
      status: 'agendada',
      notes: ''
    });
    setEditingVac(null);
    setShowVacForm(true);
    setActiveTab('ferias');
  };

    const handleSaveVacation = async () => {
    // Só exige data de início se NÃO for "gozada sem data"
    if (!vacForm.gozadas_sem_data && !vacForm.vacation_start) {
      showError('Informe a data de início das férias'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...vacForm,
        staff_id:       staff.id,
        vacation_start: vacForm.gozadas_sem_data ? null : (vacForm.vacation_start || null),
        vacation_end:   vacForm.gozadas_sem_data ? null : (vacForm.vacation_end   || null),
        status:         vacForm.gozadas_sem_data ? 'gozada' : vacForm.status,
      };
      if (editingVac) {
        await storage.updateStaffVacation(editingVac.id, payload);
        success('✅ Férias atualizadas!');
      } else {
        await storage.addStaffVacation(payload);
        success('✅ Férias registradas!');
      }
      setShowVacForm(false);
      setEditingVac(null);
      await loadAll();
      if (onReload) onReload();
    } catch (err) {
      showError(err.message || 'Erro ao salvar férias');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVacation = (vac) => {
    openModal({
      title: 'Excluir registro de férias?',
      message: 'Esta ação não pode ser desfeita.',
      variant: 'danger',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await storage.deleteStaffVacation(vac.id);
          success('✅ Registro excluído!');
          await loadAll();
        } catch (err) {
          showError('Erro ao excluir');
        }
      }
    });
  };

  const handleMarkVacationTakenNoDate = (period) => {
  openModal({
    title: 'Marcar férias como Gozadas (sem data)?',
    message:
      `Isso indica que o colaborador já tirou as férias do período ` +
      `${formatDate(period.periodStart)} a ${formatDate(period.periodEnd)}, ` +
      `mas você não possui as datas exatas do gozo. ` +
      `O sistema vai parar de alertar este período como vencido/a vencer.`,
    confirmText: 'Marcar como Gozadas',
    variant: 'warning',
    onConfirm: async () => {
      setSaving(true);
      try {
        await storage.addStaffVacation({
          staff_id:          staff.id,
          acquisition_start: period.periodStart,
          acquisition_end:   period.periodEnd,
          available_from:    period.availableFrom,
          expires_on:        period.expiresOn,
          vacation_start:    null,
          vacation_end:      null,
          days_taken:        30,
          status:            'gozada',
          notes:             'Gozadas sem data (cadastro retroativo)',
          gozadas_sem_data:  true
        });
        success('✅ Período marcado como férias gozadas!');
        await loadAll();
        if (onReload) onReload();
      } catch (err) {
        showError(err.message || 'Erro ao marcar como gozadas');
      } finally {
        setSaving(false);
      }
    }
  });
};

  // ─────────────────────────────────────────
  // TROCAS — handlers
  // ─────────────────────────────────────────
    const handleSaveSwap = async () => {
    if (!swapForm.target_id) {
      showError('Selecione o funcionário para troca'); return;
    }
    if (swapForm.swap_type === 'por_data') {
      if (!swapForm.original_date || !swapForm.swap_date) {
        showError('Preencha as datas da troca'); return;
      }
    } else {
      // definitiva: só precisa da data original de cada um
      if (!swapForm.original_date) {
        showError('Informe a escala atual do funcionário'); return;
      }
    }
    setSaving(true);
    try {
      await storage.addStaffShiftSwap({
        ...swapForm,
        // Para troca definitiva swap_date não é necessário
        swap_date: swapForm.swap_type === 'definitiva' ? null : swapForm.swap_date,
        requester_id: staff.id
      });
      success('✅ Troca registrada!');
      setShowSwapForm(false);
      setSwapForm({ target_id: '', original_date: '', swap_date: '', status: 'aprovada', notes: '', swap_type: 'por_data' });
      await loadAll();
    } catch (err) {
      showError(err.message || 'Erro ao registrar troca');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSwap = (swap) => {
    openModal({
      title: 'Excluir troca de plantão?',
      message: 'Esta ação não pode ser desfeita.',
      variant: 'danger',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await storage.deleteStaffShiftSwap(swap.id);
          success('✅ Troca excluída!');
          await loadAll();
        } catch (err) {
          showError('Erro ao excluir');
        }
      }
    });
  };

  // ─────────────────────────────────────────
  // AFASTAMENTOS — handlers
  // ─────────────────────────────────────────
  const calcAbsenceDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start + 'T12:00:00');
    const e = new Date(end + 'T12:00:00');
    return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
  };

    const handleSaveAbsence = async () => {
    if (!absenceForm.start_date) {
      showError('Informe a data de início'); return;
    }
    setSaving(true);
    try {
      const days = absenceForm.indeterminate
        ? 0
        : absenceForm.end_date
          ? calcAbsenceDays(absenceForm.start_date, absenceForm.end_date)
          : parseInt(absenceForm.days_count) || 0;

      const payload = {
        ...absenceForm,
        staff_id: staff.id,
        days_count: days,
        end_date: absenceForm.indeterminate ? null : absenceForm.end_date
      };

      if (editingAbsence) {
        await storage.updateStaffAbsence(editingAbsence.id, payload);
        success('✅ Afastamento atualizado!');
      } else {
        await storage.addStaffAbsence(payload);
        success('✅ Afastamento registrado!');
      }

      // ── Atualiza status do funcionário automaticamente ──
      const today = new Date().toISOString().split('T')[0];
      const isActive = absenceForm.end_date && absenceForm.end_date < today;
      // Se afastamento ainda está em curso (indeterminado ou data fim >= hoje) → afastado
      // Se data fim já passou → volta para ativo
      const newStatus = (!absenceForm.indeterminate && absenceForm.end_date && absenceForm.end_date < today)
        ? 'ativo'
        : 'afastado';

      if (staff.status !== newStatus) {
        await storage.updateStaff(staff.id, { status: newStatus });
        success(newStatus === 'afastado'
          ? '✅ Afastamento registrado! Status atualizado para Afastado.'
          : '✅ Afastamento registrado! Status atualizado para Ativo.'
        );
      }

      setShowAbsenceForm(false);
      setEditingAbsence(null);
      setAbsenceForm({
        absence_type: 'Atestado Médico',
        start_date: '', end_date: '',
        days_count: '', document_number: '',
        notes: '', indeterminate: false
      });
      await loadAll();
      if (onReload) onReload();
    } catch (err) {
      showError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

    const handleDeleteAbsence = (abs) => {
    openModal({
      title: 'Excluir afastamento?',
      message: 'Esta ação não pode ser desfeita.',
      variant: 'danger',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await storage.deleteStaffAbsence(abs.id);
          success('✅ Afastamento excluído!');

          // Recarrega afastamentos e verifica se ainda tem algum ativo
          const remaining = await storage.loadStaffAbsences(staff.id);
          const today = new Date().toISOString().split('T')[0];
          const stillAbsent = remaining.some(a => {
            if (a.indeterminate) return true;
            if (!a.end_date) return true;
            return a.end_date >= today;
          });

          // Se não tem mais afastamento ativo, volta para ativo
          if (!stillAbsent && staff.status === 'afastado') {
            await storage.updateStaff(staff.id, { status: 'ativo' });
          }

          await loadAll();
          if (onReload) onReload();
        } catch (err) {
          showError('Erro ao excluir');
        }
      }
    });
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
            <button onClick={onBack} className="flex items-center gap-2 text-purple-200 hover:text-white mb-4">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {staff.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{staff.name}</h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-sm text-purple-200">{staff.position}</span>
                    {staff.post_location && (
                      <span className="text-sm text-purple-300">• {staff.post_location}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusCfg.color}`}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                      {staff.shift} • {staff.current_schedule}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onEdit(staff)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 flex-shrink-0"
              >
                <Edit size={14} /> Editar
              </button>
            </div>
          </div>

          {/* Alertas de férias */}
          {alertPeriods.length > 0 && (
            <div className="p-4 space-y-2 border-b border-gray-100">
              {alertPeriods.map((p, i) => (
                <div
                  key={i}
                  onClick={() => handleVacFormFromPeriod(p)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:opacity-80 ${
                    p.isExpired
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <AlertCircle size={18} className={p.isExpired ? 'text-red-600' : 'text-yellow-600'} />
                  <div className="flex-1 text-sm">
                    {p.isExpired ? (
                      <span className="font-bold text-red-700">
                        ⚠️ Férias VENCIDAS — Período {formatDate(p.periodStart)} a {formatDate(p.periodEnd)}
                      </span>
                    ) : (
                      <span className="font-medium text-yellow-800">
                        Férias vencem em {p.daysUntilExpiry} dia(s) — {formatDate(p.expiresOn)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">Clique para agendar →</span>
                </div>
              ))}
            </div>
          )}

          {/* Info rápida */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 p-4">
            <div className="text-center px-3">
              <div className="font-bold text-gray-800">{formatCPF(staff.cpf)}</div>
              <div className="text-xs text-gray-500">CPF</div>
            </div>
            <div className="text-center px-3">
              <div className="font-bold text-gray-800">
                {calcAge(staff.birth_date)} anos
              </div>
              <div className="text-xs text-gray-500">Idade</div>
            </div>
            <div className="text-center px-3">
              <div className="font-bold text-gray-800">{formatDate(staff.hire_date)}</div>
              <div className="text-xs text-gray-500">Admissão</div>
            </div>
            <div className="text-center px-3">
              <div className="font-bold text-gray-800 text-sm">{calcTenure(staff.hire_date)}</div>
              <div className="text-xs text-gray-500">Tempo de Casa</div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'dados', label: 'Dados', icon: UserCheck },
              { id: 'ferias', label: 'Férias', icon: Sun, count: vacations.length },
              ...(staff.team_type !== 'administrativo' ? [
                { id: 'trocas', label: 'Trocas', icon: ArrowLeftRight, count: swaps.length }
              ] : []),
              { id: 'afastamentos', label: 'Afastamentos', icon: FileText, count: absences.length }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 flex-1 justify-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-700 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-6">

            {/* ════════════════════════════════
                TAB: DADOS
            ════════════════════════════════ */}
            {activeTab === 'dados' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nome Completo', value: staff.name },
                    { label: 'CPF', value: formatCPF(staff.cpf) },
                    { label: 'Data de Nascimento', value: `${formatDate(staff.birth_date)} (${calcAge(staff.birth_date)} anos)` },
                    { label: 'Data de Admissão', value: `${formatDate(staff.hire_date)} — ${calcTenure(staff.hire_date)}` },
                    { label: 'Cargo', value: staff.position },
                    { label: 'Vínculo', value: staff.employment_type },
                    { label: 'Posto de Serviço', value: staff.post_location || '-' },
                    { label: 'Turno', value: `${staff.shift} (${staff.current_schedule})` },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="font-semibold text-gray-800">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Períodos aquisitivos */}
                <div className="mt-6">
                  <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar size={16} /> Períodos Aquisitivos de Férias
                  </h3>
                  <div className="space-y-2">
                    {vacationPeriods.slice(0, 3).map((p, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-sm ${
                          p.isExpired ? 'bg-red-50 border-red-200'
                          : p.isUrgent ? 'bg-yellow-50 border-yellow-200'
                          : p.isAvailable ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-medium">
                              {formatDate(p.periodStart)} → {formatDate(p.periodEnd)}
                            </span>
                            <span className="text-gray-500 ml-2 text-xs">
                              (Pode tirar a partir de {formatDate(p.availableFrom)})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.isExpired && (
                              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                                VENCIDAS
                              </span>
                            )}
                            {p.isUrgent && !p.isExpired && (
                              <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                Vence em {p.daysUntilExpiry}d
                              </span>
                            )}
                            {p.isAvailable && !p.isExpired && !p.isUrgent && (
                              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                Disponível
                              </span>
                            )}
                            {!p.isAvailable && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Em andamento
                              </span>
                            )}
                            {takenPeriodKeys.has(periodKey(p)) ? (
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            ✅ GOZADAS
                          </span>
                        ) : (p.isAvailable || p.isExpired) ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleVacFormFromPeriod(p)}
                              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg"
                            >
                              + Agendar
                            </button>
                            <button
                              onClick={() => handleMarkVacationTakenNoDate(p)}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
                            >
                              ✓ Já gozadas
                            </button>
                          </div>
                        ) : null}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Prazo legal: {formatDate(p.expiresOn)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                TAB: FÉRIAS
            ════════════════════════════════ */}
            {activeTab === 'ferias' && (
              <div className="space-y-4">
                {!showVacForm && (
                  <button
                    onClick={() => {
                      setEditingVac(null);
                      setVacForm({
                        acquisition_start: '', acquisition_end: '',
                        available_from: '', expires_on: '',
                        vacation_start: '', vacation_end: '',
                        days_taken: 30, status: 'agendada', notes: '',
                        gozadas_sem_data: false
                      });
                      setShowVacForm(true);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Registrar Férias
                  </button>
                )}

                {showVacForm && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-purple-800">
                      {editingVac ? 'Editar Férias' : 'Registrar Férias'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Período Aquisitivo — Início</label>
                        <input type="date" value={vacForm.acquisition_start}
                          onChange={(e) => setVacForm(p => ({ ...p, acquisition_start: e.target.value }))}
                          className="w-full max-w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Período Aquisitivo — Fim</label>
                        <input type="date" value={vacForm.acquisition_end}
                          onChange={(e) => setVacForm(p => ({ ...p, acquisition_end: e.target.value }))}
                          className="w-full max-w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm" />
                      </div>
                      {/* Checkbox Gozadas sem data */}
                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none bg-green-50 border-2 border-green-200 rounded-lg px-3 py-2">
                          <input
                            type="checkbox"
                            checked={vacForm.gozadas_sem_data}
                            onChange={(e) => setVacForm(p => ({
                              ...p,
                              gozadas_sem_data: e.target.checked,
                              vacation_start: e.target.checked ? '' : p.vacation_start,
                              vacation_end:   e.target.checked ? '' : p.vacation_end,
                              status:         e.target.checked ? 'gozada' : (p.status === 'gozada' ? 'agendada' : p.status)
                            }))}
                            className="w-4 h-4 accent-green-600 cursor-pointer"
                          />
                          <div>
                            <span className="text-sm font-semibold text-green-800">
                              ✅ Férias já gozadas (sem data)
                            </span>
                            <p className="text-xs text-green-700 mt-0.5">
                              Use quando o colaborador já tirou as férias mas não temos as datas exatas.
                            </p>
                          </div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Início das Férias {!vacForm.gozadas_sem_data && '*'}
                        </label>
                        <input
                          type="date"
                          value={vacForm.vacation_start}
                          onChange={(e) => setVacForm(p => ({ ...p, vacation_start: e.target.value }))}
                          disabled={vacForm.gozadas_sem_data}
                          className={`w-full max-w-full px-2 py-1.5 border-2 rounded-lg focus:outline-none text-sm transition-colors ${
                            vacForm.gozadas_sem_data
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-purple-300 focus:border-purple-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Fim das Férias</label>
                        <input
                          type="date"
                          value={vacForm.vacation_end}
                          onChange={(e) => setVacForm(p => ({ ...p, vacation_end: e.target.value }))}
                          disabled={vacForm.gozadas_sem_data}
                          className={`w-full max-w-full px-2 py-1.5 border-2 rounded-lg focus:outline-none text-sm transition-colors ${
                            vacForm.gozadas_sem_data
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 focus:border-purple-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Dias de Férias</label>
                        <input type="number" min="1" max="30" value={vacForm.days_taken}
                          onChange={(e) => setVacForm(p => ({ ...p, days_taken: parseInt(e.target.value) || 30 }))}
                          className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                        <select value={vacForm.status}
                          onChange={(e) => setVacForm(p => ({ ...p, status: e.target.value }))}
                          className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm">
                          <option value="agendada">Agendada</option>
                          <option value="em_gozo">Em Gozo</option>
                          <option value="disponível">Disponível</option>
                          <option value="vencida">Vencida</option>
                          <option value="gozada">Gozadas</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Observações</label>
                      <input type="text" value={vacForm.notes}
                        onChange={(e) => setVacForm(p => ({ ...p, notes: e.target.value }))}
                        className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                        placeholder="Observações opcionais..." />
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton loading={saving} onClick={handleSaveVacation}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                        <Save size={14} /> Salvar
                      </LoadingButton>
                      <button onClick={() => { setShowVacForm(false); setEditingVac(null); }}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg text-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {vacations.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Sun size={40} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhum registro de férias</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vacations.map(vac => (
                      <div key={vac.id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-1">
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                vac.status === 'em_gozo'   ? 'bg-blue-100 text-blue-800'
                                : vac.status === 'agendada'  ? 'bg-yellow-100 text-yellow-800'
                                : vac.status === 'vencida'   ? 'bg-red-100 text-red-800'
                                : vac.status === 'gozada'    ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                                {vac.status}
                              </span>
                              {vac.gozadas_sem_data && (
                                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full font-medium">
                                  sem data
                                </span>
                              )}
                              <span className="text-xs text-gray-500">{vac.days_taken} dias</span>
                            </div>
                            {vac.vacation_start && (
                              <div className="text-sm font-medium text-gray-800">
                                {formatDate(vac.vacation_start)}
                                {vac.vacation_end && ` → ${formatDate(vac.vacation_end)}`}
                              </div>
                            )}
                            {vac.acquisition_start && (
                              <div className="text-xs text-gray-500 mt-1">
                                Período: {formatDate(vac.acquisition_start)} a {formatDate(vac.acquisition_end)}
                              </div>
                            )}
                            {vac.notes && <div className="text-xs text-gray-400 mt-1">{vac.notes}</div>}
                          </div>
                          <div className="flex gap-1">
                        <button onClick={() => { setEditingVac(vac); setVacForm({
                                              acquisition_start: vac.acquisition_start || '',
                                              acquisition_end:   vac.acquisition_end   || '',
                                              available_from:    vac.available_from    || '',
                                              expires_on:        vac.expires_on        || '',
                                              vacation_start:    vac.vacation_start    || '',
                                              vacation_end:      vac.vacation_end      || '',
                                              days_taken:        vac.days_taken        || 30,
                                              status:            vac.status            || 'agendada',
                                              notes:             vac.notes             || '',
                                              gozadas_sem_data:  !!vac.gozadas_sem_data
                                            }); setShowVacForm(true); }}
                              className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteVacation(vac)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════
                TAB: TROCAS DE PLANTÃO
            ════════════════════════════════ */}
            {activeTab === 'trocas' && (
              <div className="space-y-4">
                {!showSwapForm && (
                  <button
                    onClick={() => setShowSwapForm(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Registrar Troca de Plantão
                  </button>
                )}

                  {showSwapForm && (
                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-indigo-800">Nova Troca de Plantão</h4>

                    {/* Tipo de troca */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSwapForm(p => ({ ...p, swap_type: 'por_data' }))}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                          swapForm.swap_type === 'por_data'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        📅 Por Datas
                      </button>
                      <button
                        type="button"
                        onClick={() => setSwapForm(p => ({ ...p, swap_type: 'definitiva', swap_date: '' }))}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                          swapForm.swap_type === 'definitiva'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        🔄 Definitiva
                      </button>
                    </div>

                    {/* Descrição do tipo */}
                    <div className={`text-xs px-3 py-2 rounded-lg ${
                      swapForm.swap_type === 'definitiva'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {swapForm.swap_type === 'por_data'
                        ? '📅 Troca pontual: dois funcionários trocam datas específicas de plantão.'
                        : '🔄 Troca definitiva: mudança permanente de escala entre dois funcionários.'
                      }
                    </div>

                    {/* Funcionário */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Trocar com *
                      </label>
                      <select value={swapForm.target_id}
                        onChange={(e) => setSwapForm(p => ({ ...p, target_id: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm">
                        <option value="">Selecione o funcionário...</option>
                        {allStaff.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.position}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Campos por tipo */}
                    {swapForm.swap_type === 'por_data' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Data Original ({staff.name.split(' ')[0]}) *
                          </label>
                          <input type="date" value={swapForm.original_date}
                            onChange={(e) => setSwapForm(p => ({ ...p, original_date: e.target.value }))}
                            className="w-full max-w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Data da Troca *
                          </label>
                          <input type="date" value={swapForm.swap_date}
                            onChange={(e) => setSwapForm(p => ({ ...p, swap_date: e.target.value }))}
                            className="w-full max-w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Escala Atual de {staff.name.split(' ')[0]} *
                          </label>
                          <input type="text" value={swapForm.original_date}
                            onChange={(e) => setSwapForm(p => ({ ...p, original_date: e.target.value }))}
                            className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                            placeholder="Ex: Dias Pares, Noturno..." />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Data de Vigência
                          </label>
                          <input type="date" value={swapForm.swap_date}
                            onChange={(e) => setSwapForm(p => ({ ...p, swap_date: e.target.value }))}
                            className="w-full max-w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm" />
                          <p className="text-xs text-gray-400 mt-1">A partir de quando a troca vale</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Observações</label>
                      <input type="text" value={swapForm.notes}
                        onChange={(e) => setSwapForm(p => ({ ...p, notes: e.target.value }))}
                        className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
                        placeholder="Motivo ou observação..." />
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton loading={saving} onClick={handleSaveSwap}
                        className={`flex-1 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                          swapForm.swap_type === 'definitiva'
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}>
                        <Save size={14} /> Salvar
                      </LoadingButton>
                      <button onClick={() => {
                        setShowSwapForm(false);
                        setSwapForm({ target_id: '', original_date: '', swap_date: '', status: 'aprovada', notes: '', swap_type: 'por_data' });
                      }}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg text-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {swaps.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <ArrowLeftRight size={40} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhuma troca registrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {swaps.map(swap => {
                      const isRequester = swap.requester_id === staff.id;
                      const other = isRequester ? swap.target : swap.requester;
                      return (
                        <div key={swap.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <ArrowLeftRight size={14} className="text-indigo-600" />
                                <span className="font-medium text-gray-800 text-sm">
                                  {isRequester ? 'Trocou com' : 'Recebeu troca de'}{' '}
                                  <strong>{other?.name || 'Desconhecido'}</strong>
                                </span>
                              </div>
                                                            <div className="text-sm text-gray-600">
                                {swap.swap_type === 'definitiva' ? (
                                  <span className="flex items-center gap-1 flex-wrap">
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                      🔄 Definitiva
                                    </span>
                                    <span>Escala: <strong>{swap.original_date}</strong></span>
                                    {swap.swap_date && (
                                      <span className="text-gray-400">· vigência {formatDate(swap.swap_date)}</span>
                                    )}
                                  </span>
                                ) : (
                                  <span>
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold mr-1">
                                      📅 Por data
                                    </span>
                                    {formatDate(swap.original_date)} → {formatDate(swap.swap_date)}
                                  </span>
                                )}
                              </div>
                              {swap.notes && <div className="text-xs text-gray-400 mt-1">{swap.notes}</div>}
                              <div className="text-xs text-gray-400 mt-1">
                                Registrado em {formatDate(swap.created_at?.split('T')[0])}
                              </div>
                            </div>
                            <button onClick={() => handleDeleteSwap(swap)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════
                TAB: AFASTAMENTOS
            ════════════════════════════════ */}
            {activeTab === 'afastamentos' && (
              <div className="space-y-4">
                {!showAbsenceForm && (
                  <button
                    onClick={() => { setEditingAbsence(null); setAbsenceForm({ absence_type: 'Atestado Médico', start_date: '', end_date: '', days_count: '', document_number: '', notes: '', indeterminate: false }); setShowAbsenceForm(true); }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Registrar Afastamento
                  </button>
                )}

                {showAbsenceForm && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-orange-800">
                      {editingAbsence ? 'Editar Afastamento' : 'Novo Afastamento'}
                    </h4>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo *</label>
                      <select value={absenceForm.absence_type}
                        onChange={(e) => setAbsenceForm(p => ({ ...p, absence_type: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm">
                        {ABSENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Data Início *</label>
                        <input type="date" value={absenceForm.start_date}
                          onChange={(e) => setAbsenceForm(p => ({ ...p, start_date: e.target.value }))}
                          className="w-full max-w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm" />
                      </div>
                      <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Data Fim
                        {!absenceForm.indeterminate && absenceForm.start_date && absenceForm.end_date && (
                          <span className="text-orange-600 font-normal ml-2">
                            ({calcAbsenceDays(absenceForm.start_date, absenceForm.end_date)} dias)
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        value={absenceForm.end_date}
                        onChange={(e) => setAbsenceForm(p => ({ ...p, end_date: e.target.value }))}
                        disabled={absenceForm.indeterminate}
                        className={`w-full max-w-full px-2 py-1.5 border-2 rounded-lg focus:outline-none text-sm transition-colors ${
                          absenceForm.indeterminate
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 focus:border-orange-500'
                        }`}
                      />
                      <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={absenceForm.indeterminate}
                          onChange={(e) => setAbsenceForm(p => ({
                            ...p,
                            indeterminate: e.target.checked,
                            end_date: e.target.checked ? '' : p.end_date
                          }))}
                          className="w-4 h-4 accent-orange-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-orange-700">
                          Indeterminado (sem previsão de retorno)
                        </span>
                      </label>
                    </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Nº do Documento (Atestado)
                        </label>
                        <input type="text" value={absenceForm.document_number}
                          onChange={(e) => setAbsenceForm(p => ({ ...p, document_number: e.target.value }))}
                          className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                          placeholder="Número do CRM / protocolo" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Observações</label>
                        <input type="text" value={absenceForm.notes}
                          onChange={(e) => setAbsenceForm(p => ({ ...p, notes: e.target.value }))}
                          className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                          placeholder="Observações opcionais..." />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton loading={saving} onClick={handleSaveAbsence}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                        <Save size={14} /> Salvar
                      </LoadingButton>
                      <button onClick={() => { setShowAbsenceForm(false); setEditingAbsence(null); }}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg text-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {absences.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <FileText size={40} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhum afastamento registrado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {absences.map(abs => (
                      <div key={abs.id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-1">
                              <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                                {abs.absence_type}
                              </span>
                              {abs.days_count > 0 && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {abs.days_count} dia(s)
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-800">
                              {formatDate(abs.start_date)}
                              {abs.indeterminate
                                ? <span className="ml-2 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Indeterminado</span>
                                : abs.end_date ? ` → ${formatDate(abs.end_date)}` : ''
                              }
                            </div>
                            {abs.document_number && (
                              <div className="text-xs text-gray-500 mt-1">Doc: {abs.document_number}</div>
                            )}
                            {abs.notes && <div className="text-xs text-gray-400 mt-1">{abs.notes}</div>}
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => {
                              setEditingAbsence(abs);
                              setAbsenceForm({ 
                                absence_type: abs.absence_type  || 'Atestado Médico',
                                start_date:   abs.start_date    || '',
                                end_date:     abs.end_date      || '',
                                days_count:   abs.days_count    != null ? abs.days_count : '',
                                document_number: abs.document_number || '',
                                notes:        abs.notes         || '',
                                indeterminate: !!abs.indeterminate || (!abs.end_date && !!abs.start_date && (abs.days_count === 0 || abs.days_count == null))
                              });
                              setShowAbsenceForm(true);
                            }} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteAbsence(abs)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      <ModalComponent />
    </div>
  );
}