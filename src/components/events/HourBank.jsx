import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Clock, User, Calendar, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

const emptyForm = {
  employeeId: '',
  eventId: '',
  eventDate: new Date().toISOString().split('T')[0],
  hours: 12,
  minutes: 0,
  notes: ''
};

export default function HourBank({
  team,
  events,
  hourBank,
  onAdd,
  onUpdate,
  onDelete,
  onBack
}) {
  const { error: showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [filterEmployee, setFilterEmployee] = useState('todos');
  const [filterMonth, setFilterMonth] = useState('todos');
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  // Meses disponíveis
  const availableMonths = [...new Set(
    hourBank.map(h => h.eventDate?.substring(0, 7))
  )].filter(Boolean).sort().reverse();

    // Converte horas + minutos para decimal (ex: 12h30 = 12.50)
  const toDecimal = (hours, minutes) => {
    return parseFloat(hours || 0) + parseFloat((minutes || 0) / 60);
  };

  // Converte decimal para horas e minutos (ex: 12.50 = 12h30)
  const fromDecimal = (decimal) => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return { hours, minutes };
  };

  // Formata para exibição (ex: 12.50 → "12h30")
  const formatHours = (decimal) => {
    const { hours, minutes } = fromDecimal(decimal);
    if (minutes === 0) return `${hours}h`;
    return `${hours}h${String(minutes).padStart(2, '0')}`;
  };

  // Filtrar registros
  const filtered = hourBank.filter(h => {
    const matchEmployee = filterEmployee === 'todos' || h.employeeId === filterEmployee;
    const matchMonth = filterMonth === 'todos' || h.eventDate?.startsWith(filterMonth);
    return matchEmployee && matchMonth;
  });

  // Agrupar por funcionário
  const groupedByEmployee = team.map(emp => {
    const records = filtered.filter(h => h.employeeId === emp.id);
    const totalHours = records.reduce((sum, h) => sum + (parseFloat(h.hoursWorked) || 0), 0);
    return { ...emp, records, totalHours };
  }).filter(emp => emp.records.length > 0 || filterEmployee === emp.id);

  // Total geral
  const totalHoursAll = filtered.reduce((sum, h) => sum + (parseFloat(h.hoursWorked) || 0), 0);

  const validate = () => {
  const newErrors = {};
  if (!formData.employeeId) newErrors.employeeId = 'Selecione o funcionário';
  if (!formData.eventDate) newErrors.eventDate = 'Data é obrigatória';
  if (!formData.hours && formData.hours !== 0) newErrors.hours = 'Informe as horas';
  if (toDecimal(formData.hours, formData.minutes) <= 0) {
    newErrors.hours = 'Total deve ser maior que zero';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) { showError('Preencha os campos obrigatórios'); return; }
  setSaving(true);
  try {
    const dataToSave = {
      ...formData,
      hoursWorked: toDecimal(formData.hours, formData.minutes)
    };
    if (editingId) {
      await onUpdate(editingId, dataToSave);
    } else {
      await onAdd(dataToSave);
    }
      setShowForm(false);
      setFormData(emptyForm);
      setEditingId(null);
    } catch (err) {
      showError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
  const { hours, minutes } = fromDecimal(record.hoursWorked);
  setFormData({
    employeeId: record.employeeId,
    eventId: record.eventId || '',
    eventDate: record.eventDate,
    hours,
    minutes,
    notes: record.notes || ''
  });

    setEditingId(record.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(emptyForm);
    setEditingId(null);
    setErrors({});
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${months[parseInt(month) - 1]}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <button onClick={onBack} className="flex items-center gap-2 text-blue-200 hover:text-white mb-4">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Clock size={28} /> Banco de Horas
                </h1>
                <p className="text-blue-200 mt-1">Equipe de gestão de segurança Arena BRB</p>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all"
                >
                  <Plus size={18} /> Registrar Horas
                </button>
              )}
            </div>
          </div>

          {/* Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{totalHoursAll}h</div>
              <div className="text-xs text-gray-500">Total de Horas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-700">{filtered.length}</div>
              <div className="text-xs text-gray-500">Registros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">{team.length}</div>
              <div className="text-xs text-gray-500">Funcionários</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {team.length > 0 ? (totalHoursAll / team.length).toFixed(1) : 0}h
              </div>
              <div className="text-xs text-gray-500">Média/Pessoa</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="todos">Todos os funcionários</option>
              {team.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="todos">Todos os meses</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FORMULÁRIO */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-blue-600" size={20} />
              {editingId ? 'Editar Registro' : 'Registrar Horas'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Funcionário */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Funcionário *
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    disabled={saving}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                      errors.employeeId ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Selecione o funcionário...</option>
                    {team.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </option>
                    ))}
                  </select>
                  {errors.employeeId && <p className="text-red-600 text-sm mt-1">❌ {errors.employeeId}</p>}
                </div>

                {/* Evento (opcional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Evento (opcional)
                  </label>
                  <select
                    value={formData.eventId}
                    onChange={(e) => {
                      const selectedEvent = events.find(ev => ev.id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        eventId: e.target.value,
                        eventDate: selectedEvent?.startDate || prev.eventDate
                      }));
                    }}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Sem evento vinculado</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} - {formatDate(ev.startDate)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    disabled={saving}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                      errors.eventDate ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  {errors.eventDate && <p className="text-red-600 text-sm mt-1">❌ {errors.eventDate}</p>}
                </div>

               {/* Horas e Minutos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horas Trabalhadas *
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={formData.hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                      disabled={saving}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 text-center ${
                        errors.hours ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="0"
                    />
                    <span className="text-xs text-gray-500 text-center block mt-1">horas</span>
                  </div>
                  <div className="flex items-start pt-3 text-gray-400 font-bold text-xl">:</div>
                  <div className="flex-1">
                    <select
                      value={formData.minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, minutes: parseInt(e.target.value) }))}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 text-center"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500 text-center block mt-1">minutos</span>
                  </div>
                </div>
                {/* Preview */}
                <div className="mt-2 text-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    Total: {formatHours(toDecimal(formData.hours, formData.minutes))}
                  </span>
                </div>
                {errors.hours && <p className="text-red-600 text-sm mt-1 text-center">❌ {errors.hours}</p>}
              </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  disabled={saving}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  placeholder="Observações opcionais..."
                />
              </div>

              <div className="flex gap-3">
                <LoadingButton
                  loading={saving}
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingId ? 'Salvar' : 'Registrar'}
                </LoadingButton>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LISTA AGRUPADA POR FUNCIONÁRIO */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <Clock size={50} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-500">Nenhum registro encontrado</h3>
            <p className="text-gray-400 text-sm mt-1">Registre as horas trabalhadas por evento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {team.map(emp => {
              const records = filtered.filter(h => h.employeeId === emp.id);
              if (records.length === 0) return null;

              const totalHours = records.reduce((sum, h) => sum + (parseFloat(h.hoursWorked) || 0), 0);
              const isExpanded = expandedEmployee === emp.id;

              return (
                <div key={emp.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Employee Header */}
                  <button
                    onClick={() => setExpandedEmployee(isExpanded ? null : emp.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-800">{emp.name}</div>
                        <div className="text-sm text-gray-500">{emp.position} · {records.length} registro(s)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-700">{formatHours(totalHours)}</div>
                        <div className="text-xs text-gray-500">total acumulado</div>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Records */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Data</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Evento</th>
                            <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600">Horas</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Obs.</th>
                            <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {records.map(record => (
                            <tr key={record.id} className="hover:bg-blue-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(record.eventDate)}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{record.eventName || '-'}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded-full text-sm">
                                  {formatHours(record.hoursWorked)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500">{record.notes || '-'}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleEdit(record)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Deletar este registro?')) onDelete(record.id);
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-blue-50">
                          <tr>
                            <td colSpan={2} className="px-4 py-2 text-sm font-bold text-blue-800">
                              Total {filterMonth !== 'todos' ? formatMonth(filterMonth) : ''}
                            </td>
                            <td className="px-4 py-2 text-center font-bold text-blue-800">{formatHours(totalHours)}</td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}