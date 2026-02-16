import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Sun, Save, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

const POSITIONS = ['Agente de Portaria', 'Auxiliar de Segurança', 'Técnico de Monitoramento', 'Segurança Motorizado'];

const SCHEDULES = [
  '07h00 às 19h00',
  '19h00 às 07h00',
  '08h00 às 20h00',
  '20h00 às 08h00',
  '06h00 às 18h00',
  '18h00 às 06h00'
];

const emptyForm = {
  position: 'Segurança',
  postLocation: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  workSchedule: '07h00 às 19h00',
  dailyRate: '',
  workedDays: '',       // ← dias trabalhados (editável)
  employeeOnVacation: '',
  notes: ''
};

export default function VacationList({ vacations, onAdd, onUpdate, onDelete, onBack }) {
  const { error: showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [filterPosition, setFilterPosition] = useState('todos');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  // Calcular total de dias automaticamente
 const calcDays = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
};

// Escala 12x36: substituto trabalha metade dos dias
const calcWorkedDays12x36 = (start, end) => {
  const total = calcDays(start, end);
  return Math.ceil(total / 2);
};

const getWorkedDays = () => {
  // Se o usuário editou manualmente, usa o valor dele
  if (formData.workedDays !== '' && formData.workedDays !== null) {
    return parseInt(formData.workedDays) || 0;
  }
  // Senão calcula automaticamente
  return calcWorkedDays12x36(formData.startDate, formData.endDate);
};

const calcTotal = () => {
  return getWorkedDays() * (parseFloat(formData.dailyRate) || 0);
};

  const filtered = vacations.filter(v =>
    filterPosition === 'todos' || v.position === filterPosition
  );

  const totalGeral = filtered.reduce((sum, v) => sum + (v.totalValue || 0), 0);

  const validate = () => {
    const newErrors = {};
    if (!formData.postLocation?.trim()) newErrors.postLocation = 'Informe o posto/local';
    if (!formData.startDate) newErrors.startDate = 'Data início obrigatória';
    if (!formData.endDate) newErrors.endDate = 'Data fim obrigatória';
    if (formData.endDate < formData.startDate) newErrors.endDate = 'Data fim não pode ser anterior ao início';
    if (!formData.dailyRate || parseFloat(formData.dailyRate) <= 0) newErrors.dailyRate = 'Informe o valor da diária';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { showError('Preencha os campos obrigatórios'); return; }
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        totalDays: getWorkedDays(), // ← salva dias trabalhados (não dias de férias)
        dailyRate: parseFloat(formData.dailyRate)
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

 const handleEdit = (vacation) => {
  setFormData({
    position: vacation.position,
    postLocation: vacation.postLocation,
    startDate: vacation.startDate,
    endDate: vacation.endDate,
    workSchedule: vacation.workSchedule,
    dailyRate: vacation.dailyRate,
    workedDays: vacation.totalDays, // ← carrega os dias salvos
    employeeOnVacation: vacation.employeeOnVacation || '',
    notes: vacation.notes || ''
  });
    setEditingId(vacation.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(emptyForm);
    setEditingId(null);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
            <button onClick={onBack} className="flex items-center gap-2 text-amber-100 hover:text-white mb-4">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sun size={28} /> Cobertura de Férias
                </h1>
                <p className="text-amber-100 mt-1">Seguranças terceirizados contratados por diária</p>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all"
                >
                  <Plus size={18} /> Nova Cobertura
                </button>
              )}
            </div>
          </div>

          {/* Dashboard */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 p-4 border-b border-gray-100">
            <div className="text-center px-4">
              <div className="text-2xl font-bold text-amber-700">{filtered.length}</div>
              <div className="text-xs text-gray-500">Coberturas</div>
            </div>
            <div className="text-center px-4">
              <div className="text-2xl font-bold text-orange-600">
              {filtered.reduce((sum, v) => sum + (v.totalDays || 0), 0)}
            </div>
            <div className="text-xs text-gray-500">Total de Plantões</div>
            </div>
            <div className="text-center px-4">
              <div className="text-xl font-bold text-red-700">{formatCurrency(totalGeral)}</div>
              <div className="text-xs text-gray-500">Total Gasto</div>
            </div>
          </div>

          {/* Filtro */}
          <div className="p-4">
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
            >
              <option value="todos">Todos os postos</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* FORMULÁRIO */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Sun className="text-amber-500" size={20} />
              {editingId ? 'Editar Cobertura' : 'Nova Cobertura de Férias'}
            </h3>

            <div className="space-y-4">

              {/* Posto e Funcionário de Férias */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Posto/Função *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  >
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Funcionário de Férias
                  </label>
                  <input
                    type="text"
                    value={formData.employeeOnVacation}
                    onChange={(e) => handleChange('employeeOnVacation', e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none disabled:opacity-50"
                    placeholder="Nome do funcionário em férias"
                  />
                </div>
              </div>

              {/* Local do Posto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Local/Posto de Serviço *
                </label>
                <input
                  type="text"
                  value={formData.postLocation}
                  onChange={(e) => handleChange('postLocation', e.target.value)}
                  disabled={saving}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                    errors.postLocation ? 'border-red-500' : 'border-gray-300 focus:border-amber-500'
                  }`}
                  placeholder="Ex: Portaria Principal, Gate A, Setor VIP..."
                />
                {errors.postLocation && <p className="text-red-600 text-sm mt-1">❌ {errors.postLocation}</p>}
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data Início *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    disabled={saving}
                    className={`w-full max-w-full px-2 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 text-sm ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300 focus:border-amber-500'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-600 text-sm mt-1">❌ {errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data Fim *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    disabled={saving}
                    className={`w-full max-w-full px-2 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 text-sm ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300 focus:border-amber-500'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-600 text-sm mt-1">❌ {errors.endDate}</p>}
                </div>
              </div>

              {/* Horário e Diária */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Horário *</label>
                  <select
                    value={formData.workSchedule}
                    onChange={(e) => handleChange('workSchedule', e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  >
                    {SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Valor por Diária *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.dailyRate}
                    onChange={(e) => handleChange('dailyRate', e.target.value)}
                    disabled={saving}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                      errors.dailyRate ? 'border-red-500' : 'border-gray-300 focus:border-amber-500'
                    }`}
                    placeholder="0,00"
                  />
                  {errors.dailyRate && <p className="text-red-600 text-sm mt-1">❌ {errors.dailyRate}</p>}
                </div>
              </div>

              {/* Preview */}
              {formData.startDate && formData.endDate && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 space-y-3">
                  
                  {/* Info escala */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="text-lg font-bold text-gray-700">
                        {calcDays(formData.startDate, formData.endDate)}
                      </div>
                      <div className="text-xs text-gray-500">dias de férias</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="text-lg font-bold text-amber-700">
                        {calcWorkedDays12x36(formData.startDate, formData.endDate)}
                      </div>
                      <div className="text-xs text-gray-500">plantões 12x36</div>
                    </div>
                  </div>

                  {/* Dias trabalhados editável */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Dias a Pagar
                      <span className="text-xs text-amber-600 font-normal ml-2">
                        (calculado automaticamente pela escala 12x36 — edite se necessário)
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.workedDays !== ''
                        ? formData.workedDays
                        : calcWorkedDays12x36(formData.startDate, formData.endDate)}
                      onChange={(e) => handleChange('workedDays', e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-2.5 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none font-bold text-center text-lg disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('workedDays', calcWorkedDays12x36(formData.startDate, formData.endDate))}
                      className="mt-1 text-xs text-amber-600 hover:text-amber-800 underline"
                    >
                      ↺ Recalcular automaticamente
                    </button>
                  </div>

                  {/* Total */}
                  {formData.dailyRate > 0 && (
                    <div className="border-t border-amber-200 pt-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {getWorkedDays()} dias × {formatCurrency(formData.dailyRate)}/dia
                      </div>
                      <div className="text-2xl font-bold text-orange-700">
                        = {formatCurrency(calcTotal())}
                      </div>
                      <div className="text-xs text-gray-500">Total da Cobertura</div>
                    </div>
                  )}
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  placeholder="Observações opcionais..."
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <LoadingButton
                  loading={saving}
                  onClick={handleSubmit}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingId ? 'Salvar' : 'Registrar Cobertura'}
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

        {/* LISTA */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <Sun size={50} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-500">Nenhuma cobertura registrada</h3>
            <p className="text-gray-400 text-sm mt-1">Registre coberturas de férias de seguranças</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(vacation => (
              <div key={vacation.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between p-4 gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                        {vacation.position}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {vacation.workSchedule}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {vacation.totalDays} plantão(ões)
                      </span>
                    </div>

                    <div className="font-bold text-gray-800 text-lg">{vacation.postLocation}</div>

                    {vacation.employeeOnVacation && (
                      <div className="text-sm text-gray-500 mt-1">
                        👤 Cobrindo férias de: <span className="font-medium">{vacation.employeeOnVacation}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {formatDate(vacation.startDate)} → {formatDate(vacation.endDate)}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">
                        {formatCurrency(vacation.dailyRate)}/dia
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        {formatCurrency(vacation.totalValue)}
                      </span>
                    </div>

                    {vacation.notes && (
                      <div className="text-xs text-gray-400 mt-1">{vacation.notes}</div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(vacation)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deletar cobertura de "${vacation.postLocation}"?`)) onDelete(vacation.id);
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}