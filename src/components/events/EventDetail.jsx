import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, TrendingUp, Users, Package, Save, X } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

const EXPENSE_TYPES_PESSOAL = ['Carregador', 'Segurança', 'Ascensorista', 'Segurança Motorizado'];
const EXPENSE_TYPES_ALUGUEL = ['Fechamento Cego', 'Gradis'];

const STATUS_COLORS = {
  planejado: 'bg-blue-100 text-blue-800',
  realizado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800'
};

const CATEGORY_COLORS = {
  Show: 'bg-purple-100 text-purple-800',
  Jogo: 'bg-green-100 text-green-800',
  Treinamento: 'bg-blue-100 text-blue-800',
  Corporativo: 'bg-gray-100 text-gray-800',
  Férias: 'bg-red-100 text-red-800',
  Feira: 'bg-yellow-100 text-yellow-800',
  Outro: 'bg-orange-100 text-orange-800'
};

const emptyExpense = {
  expenseCategory: 'pessoal',
  expenseType: 'Carregador',
  shifts: 1,
  quantity: 1,
  unitValue: '',
  notes: ''
};

export default function EventDetail({
  event,
  onBack,
  onEdit,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}) {
  const { error: showError, success } = useToast();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expenseData, setExpenseData] = useState(emptyExpense);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  // Calcular preview do total
  const calcTotal = () => {
    if (expenseData.expenseCategory === 'pessoal') {
      return (expenseData.shifts || 0) * (expenseData.quantity || 0) * (parseFloat(expenseData.unitValue) || 0);
    }
    return parseFloat(expenseData.unitValue) || 0;
  };

  const handleOpenAdd = () => {
    setExpenseData(emptyExpense);
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleOpenEdit = (expense) => {
    setExpenseData({
      expenseCategory: expense.expenseCategory,
      expenseType: expense.expenseType,
      shifts: expense.shifts || 1,
      quantity: expense.quantity || 1,
      unitValue: expense.unitValue || '',
      notes: expense.notes || ''
    });
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleSaveExpense = async () => {
    if (!expenseData.unitValue || parseFloat(expenseData.unitValue) <= 0) {
      showError('Informe o valor unitário'); return;
    }
    setSaving(true);
    try {
      if (editingExpense) {
        await onUpdateExpense(editingExpense.id, { ...expenseData, eventId: event.id });
      } else {
        await onAddExpense({ ...expenseData, eventId: event.id });
      }
      setShowExpenseForm(false);
      setExpenseData(emptyExpense);
      setEditingExpense(null);
    } catch (err) {
      showError(err.message || 'Erro ao salvar gasto');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeExpense = (field, value) => {
    setExpenseData(prev => {
      const updated = { ...prev, [field]: value };
      // Ao mudar categoria, reseta tipo
      if (field === 'expenseCategory') {
        updated.expenseType = value === 'pessoal'
          ? EXPENSE_TYPES_PESSOAL[0]
          : EXPENSE_TYPES_ALUGUEL[0];
      }
      return updated;
    });
  };

  // Agrupar gastos por categoria
  const pessoalExpenses = event.expenses?.filter(e => e.expenseCategory === 'pessoal') || [];
  const aluguelExpenses = event.expenses?.filter(e => e.expenseCategory === 'aluguel') || [];
  const totalPessoal = pessoalExpenses.reduce((sum, e) => sum + (e.totalValue || 0), 0);
  const totalAluguel = aluguelExpenses.reduce((sum, e) => sum + (e.totalValue || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{event.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[event.category]}`}>
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
                    {event.endDate && event.endDate !== event.startDate &&
                      ` → ${formatDate(event.endDate)}`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(event.totalExpenses)}
                </div>
                <div className="text-emerald-200 text-sm">Total do Evento</div>
                <button
                  onClick={() => onEdit(event)}
                  className="mt-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <Edit size={14} />
                  Editar Evento
                </button>
              </div>
            </div>
          </div>

          {/* Resumo de gastos */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 p-4">
            <div className="text-center px-4">
              <div className="text-xl font-bold text-emerald-700">{formatCurrency(totalPessoal)}</div>
              <div className="text-xs text-gray-500">Pessoal</div>
            </div>
            <div className="text-center px-4">
              <div className="text-xl font-bold text-orange-600">{formatCurrency(totalAluguel)}</div>
              <div className="text-xs text-gray-500">Aluguéis</div>
            </div>
            <div className="text-center px-4">
              <div className="text-xl font-bold text-gray-800">{formatCurrency(event.totalExpenses)}</div>
              <div className="text-xs text-gray-500">Total</div>
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
                  <Users size={16} />
                  Pessoal (Plantão)
                </button>
                <button
                  onClick={() => handleChangeExpense('expenseCategory', 'aluguel')}
                  className={`py-3 rounded-xl font-medium text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                    expenseData.expenseCategory === 'aluguel'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-500 hover:border-orange-300'
                  }`}
                >
                  <Package size={16} />
                  Aluguel
                </button>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo *</label>
                <select
                  value={expenseData.expenseType}
                  onChange={(e) => handleChangeExpense('expenseType', e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                >
                  {(expenseData.expenseCategory === 'pessoal'
                    ? EXPENSE_TYPES_PESSOAL
                    : EXPENSE_TYPES_ALUGUEL
                  ).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Campos de Pessoal */}
              {expenseData.expenseCategory === 'pessoal' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Plantões (12h) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={expenseData.shifts}
                      onChange={(e) => handleChangeExpense('shifts', parseInt(e.target.value) || 1)}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pessoas *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={expenseData.quantity}
                      onChange={(e) => handleChangeExpense('quantity', parseInt(e.target.value) || 1)}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor/Plantão *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={expenseData.unitValue}
                      onChange={(e) => handleChangeExpense('unitValue', e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              )}

              {/* Campo de Aluguel */}
              {expenseData.expenseCategory === 'aluguel' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valor Total *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseData.unitValue}
                    onChange={(e) => handleChangeExpense('unitValue', e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    placeholder="0,00"
                  />
                </div>
              )}

              {/* Preview do Total */}
              {expenseData.unitValue > 0 && (
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
                    = {formatCurrency(calcTotal())}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                <input
                  type="text"
                  value={expenseData.notes}
                  onChange={(e) => handleChangeExpense('notes', e.target.value)}
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
                  onClick={() => { setShowExpenseForm(false); setEditingExpense(null); }}
                  disabled={saving}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GASTOS - PESSOAL */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-emerald-600" size={20} />
              Pessoal Terceirizado
            </h3>
            {!showExpenseForm && (
              <button
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Adicionar Gasto
              </button>
            )}
          </div>

          {pessoalExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users size={40} className="mx-auto mb-2 opacity-30" />
              <p>Nenhum gasto com pessoal registrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Tipo</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Plantões</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Pessoas</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Valor/Plantão</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Total</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pessoalExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{expense.expenseType}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{expense.shifts}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{expense.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(expense.unitValue)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(expense.totalValue)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleOpenEdit(expense)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Deletar este gasto?')) onDeleteExpense(expense.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
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
                    <td colSpan={4} className="px-4 py-3 font-bold text-emerald-800">Total Pessoal</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-800">{formatCurrency(totalPessoal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* GASTOS - ALUGUEL */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-orange-600" size={20} />
              Aluguéis
            </h3>
          </div>

          {aluguelExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-30" />
              <p>Nenhum aluguel registrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Observações</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Valor</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {aluguelExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{expense.expenseType}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">{expense.notes || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">{formatCurrency(expense.totalValue)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleOpenEdit(expense)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Deletar este gasto?')) onDeleteExpense(expense.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
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
                    <td colSpan={2} className="px-4 py-3 font-bold text-orange-800">Total Aluguéis</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-800">{formatCurrency(totalAluguel)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* TOTAL GERAL */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-emerald-200 text-sm font-medium">TOTAL GERAL DO EVENTO</div>
              <div className="text-white text-sm mt-1">
                Pessoal: {formatCurrency(totalPessoal)} + Aluguéis: {formatCurrency(totalAluguel)}
              </div>
            </div>
            <div className="text-4xl font-bold text-white">
              {formatCurrency(event.totalExpenses)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}