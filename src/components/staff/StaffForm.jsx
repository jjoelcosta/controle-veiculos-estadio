import React, { useState } from 'react';
import { X, Save, UserCheck, Calendar, MapPin, Clock } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

const POSITIONS_OPERACIONAL = [
  'Agente de Portaria',
  'Auxiliar de Segurança',
  'Segurança Motorizado',
  'Técnico de Monitoramento'
];

const POSITIONS_ADMINISTRATIVO = [
  'Gerente de Segurança',
  'Supervisor de Segurança',
  'Coordenador de Monitoramento de Segurança',
  'Analista de Segurança',
  'Assistente Administrativo',
  'Jovem Aprendiz'
];

const EMPLOYMENT_TYPES = ['Efetivo', 'Terceirizado'];
const SHIFTS = ['Diurno', 'Noturno'];
const SCHEDULES = ['Dias Pares', 'Dias Ímpares'];

const POST_LOCATIONS = [
  'Portaria A',
  'Portaria L',
  'Portaria M',
  'Portaria Guarita Sul',
  'Área Leste',
  'CCO',
  'Ronda Motorizada',
  'Caixa-d,água',
  'Rendição',
  'GNN',
  'Bosque / Defer',
  'Gestão Operacional',
  'Administrativo'
];

const emptyForm = (teamType = 'operacional') => ({
  name: '',
  cpf: '',
  birth_date: '',
  hire_date: '',
  position: teamType === 'administrativo' ? 'Gerente de Segurança' : 'Agente de Portaria',
  employment_type: 'Efetivo',
  post_location: '',
  shift: teamType === 'administrativo' ? '' : 'Diurno',
  current_schedule: teamType === 'administrativo' ? 'Segunda a Sexta' : 'Dias Pares',
  team_type: teamType,
  work_hours: teamType === 'administrativo' ? '09h-19h' : '12x36',
  status: 'ativo'
});

const formatCPF = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
};

const validateCPF = (cpf) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10 || check === 11) check = 0;
  if (check !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10 || check === 11) check = 0;
  return check === parseInt(digits[10]);
};

export default function StaffForm({ staff, onSubmit, onCancel, teamType = 'operacional' }) {
  const { error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const isAdm = staff?.team_type === 'administrativo' || teamType === 'administrativo';

  const [formData, setFormData] = useState(
    staff ? {
      name: staff.name || '',
      cpf: staff.cpf || '',
      birth_date: staff.birth_date || '',
      hire_date: staff.hire_date || '',
      position: staff.position || (isAdm ? 'Gerente' : 'Agente de Portaria'),
      employment_type: staff.employment_type || 'Efetivo',
      post_location: staff.post_location || '',
      shift: staff.shift || 'Diurno',
      current_schedule: staff.current_schedule || (isAdm ? 'Segunda a Sexta' : 'Dias Pares'),
      team_type: staff.team_type || teamType || 'operacional',
      work_hours: staff.work_hours || (isAdm ? '08h-17h' : '12x36'),
      status: staff.status || 'ativo'
    } : emptyForm(teamType || 'operacional')
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.cpf?.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    if (!formData.birth_date) newErrors.birth_date = 'Data de nascimento é obrigatória';
    if (!formData.hire_date) newErrors.hire_date = 'Data de admissão é obrigatória';
    if (!formData.position) newErrors.position = 'Cargo é obrigatório';
    if (!formData.post_location?.trim()) newErrors.post_location = 'Posto/Local é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { showError('Preencha todos os campos obrigatórios'); return; }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, '') // salva só os dígitos
      };
      await onSubmit(payload);
    } catch (err) {
      showError(err.message || 'Erro ao salvar funcionário');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCPFChange = (value) => {
    handleChange('cpf', formatCPF(value));
  };

  // Calcula idade
  const calcAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate + 'T12:00:00');
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // Calcula tempo de empresa
  const calcTenure = (hireDate) => {
    if (!hireDate) return null;
    const today = new Date();
    const hire = new Date(hireDate + 'T12:00:00');
    const years = today.getFullYear() - hire.getFullYear();
    const months = today.getMonth() - hire.getMonth();
    const totalMonths = years * 12 + months;
    if (totalMonths < 12) return `${totalMonths} mês(es)`;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return m > 0 ? `${y} ano(s) e ${m} mês(es)` : `${y} ano(s)`;
  };

  const age = calcAge(formData.birth_date);
  const tenure = calcTenure(formData.hire_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserCheck size={28} />
                {staff ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h2>
              <button onClick={onCancel} disabled={saving} className="text-white hover:text-purple-200">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* ── DADOS PESSOAIS ── */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                <UserCheck size={16} /> Dados Pessoais
              </h3>
              <div className="space-y-4">

                {/* Nome */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={saving}
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                      errors.name ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                    }`}
                    placeholder="Nome completo do funcionário"
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">❌ {errors.name}</p>}
                </div>

                {/* CPF + Data Nascimento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">CPF *</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => handleCPFChange(e.target.value)}
                      disabled={saving}
                      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none disabled:opacity-50 font-mono ${
                        errors.cpf ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                      }`}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    {errors.cpf && <p className="text-red-600 text-xs mt-1">❌ {errors.cpf}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Data de Nascimento *
                      {age !== null && <span className="text-purple-600 font-normal ml-2">({age} anos)</span>}
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleChange('birth_date', e.target.value)}
                      disabled={saving}
                      className={`w-full max-w-full px-2 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg focus:outline-none disabled:opacity-50 text-sm ${
                        errors.birth_date ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                      }`}
                    />
                    {errors.birth_date && <p className="text-red-600 text-xs mt-1">❌ {errors.birth_date}</p>}
                  </div>
                </div>

                {/* Data Admissão */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Data de Admissão *
                      {tenure && <span className="text-purple-600 font-normal ml-2">({tenure})</span>}
                    </label>
                    <input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => handleChange('hire_date', e.target.value)}
                      disabled={saving}
                      className={`w-full max-w-full px-2 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg focus:outline-none disabled:opacity-50 text-sm ${
                        errors.hire_date ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                      }`}
                    />
                    {errors.hire_date && <p className="text-red-600 text-xs mt-1">❌ {errors.hire_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vínculo *</label>
                    <select
                      value={formData.employment_type}
                      onChange={(e) => handleChange('employment_type', e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none disabled:opacity-50"
                    >
                      {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* ── FUNÇÃO E POSTO ── */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">
                <MapPin size={16} /> Função e Posto
              </h3>
              <div className="space-y-4">

                {/* Cargo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cargo *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    disabled={saving}
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                      errors.position ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                    }`}
                  >
                    {(formData.team_type === 'administrativo'
                      ? POSITIONS_ADMINISTRATIVO
                      : POSITIONS_OPERACIONAL
                    ).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Posto */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Posto de Serviço *</label>
                  <select
                    value={formData.post_location}
                    onChange={(e) => handleChange('post_location', e.target.value)}
                    disabled={saving}
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                      errors.post_location ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
                    }`}
                  >
                    <option value="">Selecione o posto...</option>
                    {POST_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.post_location && <p className="text-red-600 text-xs mt-1">❌ {errors.post_location}</p>}
                </div>

              </div>
            </div>

                {/* ── ESCALA ── */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <Clock size={16} /> Escala de Trabalho
                  </h3>

                  {formData.team_type === 'administrativo' ? (
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-indigo-200 text-sm text-indigo-800 text-center">
                        🕐 Horário Comercial — Segunda a Sexta
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Horário</label>
                        <select
                          value={formData.work_hours}
                          onChange={(e) => handleChange('work_hours', e.target.value)}
                          disabled={saving}
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="09h-19h">09h às 19h</option>
                          <option value="06h-16h">06h às 16h</option>
                          <option value="11h-21h">11h às 21h</option>
                          <option value="09h-15h">09h às 15h</option>
                          <option value="10h-20h">10h às 20h</option>
                          <option value="08h-18h">08h às 18h</option>
                        </select>
                      </div>
                      <div className="mt-3 bg-white rounded-lg p-3 border border-indigo-200 text-sm text-indigo-800 text-center">
                        Escala: <strong>{formData.work_hours}</strong> • Segunda a Sexta
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Turno */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {SHIFTS.map(shift => (
                          <button
                            key={shift}
                            type="button"
                            onClick={() => handleChange('shift', shift)}
                            disabled={saving}
                            className={`py-3 rounded-xl font-medium text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                              formData.shift === shift
                                ? shift === 'Diurno'
                                  ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                                  : 'border-indigo-500 bg-indigo-50 text-indigo-800'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {shift === 'Diurno' ? '☀️' : '🌙'} {shift}
                          </button>
                        ))}
                      </div>
                      {/* Pares/Ímpares */}
                      <div className="grid grid-cols-2 gap-3">
                        {SCHEDULES.map(schedule => (
                          <button
                            key={schedule}
                            type="button"
                            onClick={() => handleChange('current_schedule', schedule)}
                            disabled={saving}
                            className={`py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                              formData.current_schedule === schedule
                                ? 'border-blue-500 bg-blue-50 text-blue-800'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {schedule === 'Dias Pares' ? '2️⃣' : '1️⃣'} {schedule}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 bg-white rounded-lg p-3 border border-blue-200 text-sm text-blue-800 text-center">
                        Escala: <strong>{formData.shift}</strong> • <strong>{formData.current_schedule}</strong> • 12x36h
                      </div>
                    </>
                  )}
                </div>

              {/* Preview da escala */}
              {formData.team_type !== 'administrativo' && (
                <div className="mt-3 bg-white rounded-lg p-3 border border-blue-200 text-sm text-blue-800 text-center">
                  Escala: <strong>{formData.shift}</strong> • <strong>{formData.current_schedule}</strong> • 12x36h
                </div>
              )}

            {/* ── STATUS (só na edição) ── */}
            {staff && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="ativo">🟢 Ativo</option>
                  <option value="férias">🔵 Férias</option>
                  <option value="afastado">🟠 Afastado</option>
                  <option value="desligado">⚫ Desligado</option>
                </select>
              </div>
            )}

            {/* ── BOTÕES ── */}
            <div className="flex gap-3 pt-2">
              <LoadingButton
                loading={saving}
                onClick={handleSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {staff ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
              </LoadingButton>
              <button
                onClick={onCancel}
                disabled={saving}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}