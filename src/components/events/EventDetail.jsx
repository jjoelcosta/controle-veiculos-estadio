import React, { useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft, Plus, Edit, Trash2, Calendar,
  Users, Package, Save, X, Clock
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────
const EXPENSE_TYPES_PESSOAL = ['Carregador', 'Coordenador', 'Segurança', 'Ascensorista', 'Segurança Motorizado'];
const EXPENSE_TYPES_ALUGUEL = ['Fechamento Cego', 'Gradis'];

const STATUS_COLORS = {
  planejado: 'bg-blue-100 text-blue-800',
  realizado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

const CATEGORY_COLORS = {
  Show:        'bg-purple-100 text-purple-800',
  Jogo:        'bg-green-100 text-green-800',
  Treinamento: 'bg-blue-100 text-blue-800',
  Corporativo: 'bg-gray-100 text-gray-800',
  Férias:      'bg-red-100 text-red-800',
  Feira:       'bg-yellow-100 text-yellow-800',
  Outro:       'bg-orange-100 text-orange-800',
};

const EMPTY_EXPENSE = {
  expenseCategory: 'pessoal',
  expenseType:     'Carregador',
  expenseDate:     '',
  shifts:          1,
  quantity:        1,
  unitValue:       '',
  notes:           '',
};

// ─────────────────────────────────────────────
// Helpers puros
// ─────────────────────────────────────────────
function parseDate(str) {
  return new Date(str + 'T00:00:00');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(value || 0);
}

function formatDate(date) {
  if (!date) return '-';
  return parseDate(date).toLocaleDateString('pt-BR');
}

function calcExpenseTotal(expenseData) {
  if (expenseData.expenseCategory === 'pessoal') {
    return (expenseData.shifts || 0) * (expenseData.quantity || 0) * (parseFloat(expenseData.unitValue) || 0);
  }
  return parseFloat(expenseData.unitValue) || 0;
}

/**
 * Classifica o dia em relação ao evento.
 * Função pura — não depende de estado/props do componente.
 */
function getDayLabel(date, eventStartDate, eventEndDate) {
  if (!date || date === 'sem-data') return null;

  const d     = parseDate(date);
  const start = parseDate(eventStartDate);
  const end   = parseDate(eventEndDate || eventStartDate);

  if (d < start) {
    const diff = Math.round((start - d) / (1000 * 60 * 60 * 24));
    return { label: `${diff} dia(s) antes`, color: 'bg-yellow-100 text-yellow-800' };
  }
  if (d > end) {
    const diff = Math.round((d - end) / (1000 * 60 * 60 * 24));
    return { label: `${diff} dia(s) depois`, color: 'bg-orange-100 text-orange-800' };
  }
  return { label: 'Dia do Evento', color: 'bg-emerald-100 text-emerald-800' };
}

function scrollToTop() {
  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────
export default function EventDetail({
  event,
  onBack,
  onEdit,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) {
  const { error: showError } = useToast();

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense,  setEditingExpense]  = useState(null);
  const [saving,          setSaving]          = useState(false);
  const [expenseData,     setExpenseData]     = useState(EMPTY_EXPENSE);
  const [viewMode,        setViewMode]        = useState('timeline');

  // ─── Totais ──────────────────────────────────
  const { totalPessoal, totalAluguel } = useMemo(() => {
    let pessoal = 0, aluguel = 0;
    (event.expenses || []).forEach(ex => {
      if      (ex.expenseCategory === 'pessoal') pessoal += ex.totalValue || 0;
      else if (ex.expenseCategory === 'aluguel') aluguel += ex.totalValue || 0;
    });
    return { totalPessoal: pessoal, totalAluguel: aluguel };
  }, [event.expenses]);

  // ─── Timeline agrupada por data ──────────────
  const timeline = useMemo(() => {
    const byDate = {};
    (event.expenses || []).forEach(ex => {
      const date = ex.expenseDate || 'sem-data';
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(ex);
    });

    return Object.entries(byDate)
      .sort(([a], [b]) => {
        if (a === 'sem-data') return 1;
        if (b === 'sem-data') return -1;
        return a.localeCompare(b);
      })
      .map(([date, items]) => ({
        date,
        items,
        total: items.reduce((sum, ex) => sum + (ex.totalValue || 0), 0),
      }));
  }, [event.expenses]);

  // ─── Preview do total do formulário ──────────
  const previewTotal = useMemo(() => calcExpenseTotal(expenseData), [expenseData]);

  // ─── Abrir formulário (add ou edit) ──────────
  const openForm = useCallback((expense = null) => {
    if (expense) {
      setExpenseData({
        expenseCategory: expense.expenseCategory,
        expenseType:     expense.expenseType,
        expenseDate:     expense.expenseDate || '',
        shifts:          expense.shifts   || 1,
        quantity:        expense.quantity || 1,
        unitValue:       expense.unitValue || '',
        notes:           expense.notes    || '',
      });
      setEditingExpense(expense);
    } else {
      setExpenseData({ ...EMPTY_EXPENSE, expenseDate: event.startDate || '' });
      setEditingExpense(null);
    }
    setShowExpenseForm(true);
    scrollToTop();
  }, [event.startDate]);

  // ─── Cancelar formulário ─────────────────────
  const handleCancel = useCallback(() => {
    setShowExpenseForm(false);
    setEditingExpense(null);
    setExpenseData(EMPTY_EXPENSE);
  }, []);

  // ─── Salvar gasto ─────────────────────────────
  const handleSaveExpense = useCallback(async () => {
    if (!expenseData.unitValue || parseFloat(expenseData.unitValue) <= 0) {
      showError('Informe o valor unitário');
      return;
    }
    setSaving(true);
    try {
      if (editingExpense) {
        await onUpdateExpense(editingExpense.id, { ...expenseData, eventId: event.id });
      } else {
        await onAddExpense({ ...expenseData, eventId: event.id });
      }
      handleCancel();
    } catch (err) {
      showError(err.message || 'Erro ao salvar gasto');
    } finally {
      setSaving(false);
    }
  }, [expenseData, editingExpense, event.id, onUpdateExpense, onAddExpense, handleCancel, showError]);

  // ─── Deletar gasto ────────────────────────────
  const handleDeleteExpense = useCallback((expenseId) => {
    if (window.confirm('Deletar este gasto?')) onDeleteExpense(expenseId);
  }, [onDeleteExpense]);

  // ─── Alterar campo do formulário ──────────────
  const handleChangeExpense = useCallback((field, value) => {
    setExpenseData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'expenseCategory') {
        updated.expenseType = value === 'pessoal'
          ? EXPENSE_TYPES_PESSOAL[0]
          : EXPENSE_TYPES_ALUGUEL[0];
      }
      return updated;
    });
  }, []);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
            <button onClick={onBack} className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{event.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-800'}`}>
                    {event.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[event.status]}`}>
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-emerald-100">
                  <Calendar size={16} />
                  <span className="text-sm">
                    {formatDate(event.startDate)}
                    {event.endDate && event.endDate !== event.startDate && ` → ${formatDate(event.endDate)}`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{formatCurrency(event.totalExpenses)}</div>
                <div className="text-emerald-200 text-sm">Total do Evento</div>
                <button
                  onClick={() => onEdit(event)}
                  className="mt-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <Edit size={14} /> Editar Evento
                </button>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 p-3">
            <div className="text-center px-2">
              <div className="text-sm sm:text-xl font-bold text-emerald-700 truncate">{formatCurrency(totalPessoal)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Pessoal</div>
            </div>
            <div className="text-center px-2">
              <div className="text-sm sm:text-xl font-bold text-orange-600 truncate">{formatCurrency(totalAluguel)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Aluguéis</div>
            </div>
            <div className="text-center px-2">
              <div className="text-sm sm:text-xl font-bold text-gray-800 truncate">{formatCurrency(event.totalExpenses)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Total</div>
            </div>
          </div>
        </div>

        {/* FORMULÁRIO DE GASTO */}
        {showExpenseForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-emerald-600" size={20} />
              {editingExpense ? 'Editar Gasto' : 'Adicionar Gasto'}
            </h3>

            <div className="space-y-4">

              {/* Categoria */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChangeExpense('expenseCategory', 'pessoal')}
                  className={`py-3 rounded-xl font-medium text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                    expenseData.expenseCategory === 'pessoal'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-500 hover:border-emerald-300'
                  }`}
                >
                  <Users size={16} /> Pessoal (Plantão)
                </button>
                <button
                  onClick={() => handleChangeExpense('expenseCategory', 'aluguel')}
                  className={`py-3 rounded-xl font-medium text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                    expenseData.expenseCategory === 'aluguel'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-500 hover:border-orange-300'
                  }`}
                >
                  <Package size={16} /> Aluguel
                </button>
              </div>

              {/* Data do Gasto + Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Data do Gasto
                    <span className="text-gray-400 font-normal text-xs ml-1">(opcional)</span>
                  </label>
                  <input
                    type="date"
                    value={expenseData.expenseDate}
                    onChange={e => handleChangeExpense('expenseDate', e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo *</label>
                  <select
                    value={expenseData.expenseType}
                    onChange={e => handleChangeExpense('expenseType', e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  >
                    {(expenseData.expenseCategory === 'pessoal'
                      ? EXPENSE_TYPES_PESSOAL
                      : EXPENSE_TYPES_ALUGUEL
                    ).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Campos Pessoal */}
              {expenseData.expenseCategory === 'pessoal' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Plantões (12h) *</label>
                    <input
                      type="number" min="1"
                      value={expenseData.shifts}
                      onChange={e => handleChangeExpense('shifts', parseInt(e.target.value) || 1)}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pessoas *</label>
                    <input
                      type="number" min="1"
                      value={expenseData.quantity}
                      onChange={e => handleChangeExpense('quantity', parseInt(e.target.value) || 1)}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valor/Plantão *</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={expenseData.unitValue}
                      onChange={e => handleChangeExpense('unitValue', e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              )}

              {/* Campo Aluguel */}
              {expenseData.expenseCategory === 'aluguel' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Total *</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={expenseData.unitValue}
                    onChange={e => handleChangeExpense('unitValue', e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    placeholder="0,00"
                  />
                </div>
              )}

              {/* Preview Total */}
              {parseFloat(expenseData.unitValue) > 0 && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                  {expenseData.expenseCategory === 'pessoal' ? (
                    <div className="text-sm text-emerald-800">
                      <span className="font-medium">Cálculo:</span>{' '}
                      {expenseData.shifts} plantão(ões) × {expenseData.quantity} pessoa(s) × {formatCurrency(expenseData.unitValue)}
                    </div>
                  ) : (
                    <div className="text-sm text-emerald-800">
                      <span className="font-medium">Aluguel:</span> Valor fixo
                    </div>
                  )}
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    = {formatCurrency(previewTotal)}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                <input
                  type="text"
                  value={expenseData.notes}
                  onChange={e => handleChangeExpense('notes', e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="Observações opcionais..."
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <LoadingButton
                  loading={saving}
                  onClick={handleSaveExpense}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingExpense ? 'Salvar' : 'Adicionar'}
                </LoadingButton>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white py-3 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTROLES DE VISUALIZAÇÃO + BOTÃO ADICIONAR */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {[
              { id: 'timeline', label: '📅 Timeline' },
              { id: 'tipo',     label: '👥 Por Tipo'  },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === v.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          {!showExpenseForm && (
            <button
              onClick={() => openForm()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-md"
            >
              <Plus size={16} /> Adicionar Gasto
            </button>
          )}
        </div>

        {/* VISUALIZAÇÃO TIMELINE */}
        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {timeline.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400">Nenhum gasto registrado</p>
                <p className="text-gray-400 text-sm">Clique em "Adicionar Gasto" para começar</p>
              </div>
            ) : (
              timeline.map(({ date, items, total }) => {
                const dayLabel = getDayLabel(date, event.startDate, event.endDate);
                return (
                  <div key={date} className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-emerald-600" />
                        <span className="font-bold text-gray-800">
                          {date === 'sem-data' ? 'Sem data específica' : formatDate(date)}
                        </span>
                        {dayLabel && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dayLabel.color}`}>
                            {dayLabel.label}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-emerald-700">{formatCurrency(total)}</span>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {items.map(expense => (
                        <div key={expense.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              expense.expenseCategory === 'pessoal'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {expense.expenseCategory === 'pessoal' ? 'Pessoal' : 'Aluguel'}
                            </span>
                            <div>
                              <div className="font-medium text-gray-800 text-sm">{expense.expenseType}</div>
                              {expense.expenseCategory === 'pessoal' && (
                                <div className="text-xs text-gray-500">
                                  {expense.shifts} plantão(ões) × {expense.quantity} pessoa(s) × {formatCurrency(expense.unitValue)}
                                </div>
                              )}
                              {expense.notes && (
                                <div className="text-xs text-gray-400">{expense.notes}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-800">{formatCurrency(expense.totalValue)}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openForm(expense)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VISUALIZAÇÃO POR TIPO */}
        {viewMode === 'tipo' && (
          <div className="space-y-4">

            {/* Pessoal */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Users className="text-emerald-600" size={20} />
                  Pessoal Terceirizado
                </h3>
              </div>
              {(event.expenses || []).filter(e => e.expenseCategory === 'pessoal').length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Nenhum gasto com pessoal registrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Data</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Tipo</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Plantões</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Pessoas</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Valor/Plantão</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Total</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(event.expenses || [])
                        .filter(e => e.expenseCategory === 'pessoal')
                        .sort((a, b) => (a.expenseDate || '').localeCompare(b.expenseDate || ''))
                        .map(expense => (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {expense.expenseDate ? formatDate(expense.expenseDate) : '-'}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800">{expense.expenseType}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{expense.shifts}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{expense.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(expense.unitValue)}</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(expense.totalValue)}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => openForm(expense)} className="text-blue-600 hover:text-blue-800 p-1 rounded">
                                  <Edit size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-emerald-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 font-bold text-emerald-800">Total Pessoal</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-800">{formatCurrency(totalPessoal)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Aluguéis */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Package className="text-orange-600" size={20} />
                  Aluguéis
                </h3>
              </div>
              {(event.expenses || []).filter(e => e.expenseCategory === 'aluguel').length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Package size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Nenhum aluguel registrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Data</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Tipo</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Observações</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Valor</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(event.expenses || [])
                        .filter(e => e.expenseCategory === 'aluguel')
                        .sort((a, b) => (a.expenseDate || '').localeCompare(b.expenseDate || ''))
                        .map(expense => (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {expense.expenseDate ? formatDate(expense.expenseDate) : '-'}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800">{expense.expenseType}</td>
                            <td className="px-4 py-3 text-gray-500 text-sm">{expense.notes || '-'}</td>
                            <td className="px-4 py-3 text-right font-bold text-orange-600">{formatCurrency(expense.totalValue)}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => openForm(expense)} className="text-blue-600 hover:text-blue-800 p-1 rounded">
                                  <Edit size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-orange-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 font-bold text-orange-800">Total Aluguéis</td>
                        <td className="px-4 py-3 text-right font-bold text-orange-800">{formatCurrency(totalAluguel)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOTAL GERAL */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-emerald-200 text-xs sm:text-sm font-medium">TOTAL GERAL DO EVENTO</div>
              <div className="text-white text-xs sm:text-sm mt-1">
                Pessoal: {formatCurrency(totalPessoal)} + Aluguéis: {formatCurrency(totalAluguel)}
              </div>
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-white">
              {formatCurrency(event.totalExpenses)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}