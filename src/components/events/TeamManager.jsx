import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, User, Phone, Mail, Save, X } from 'lucide-react';
import { useToast } from '../ui/Toast';
import LoadingButton from '../ui/LoadingButton';

const POSITIONS = ['Supervisor', 'Coordenador', 'Analista', 'Gerente', 'Outro'];

const emptyForm = { name: '', position: 'Agente', phone: '', email: '' };

export default function TeamManager({ team, onAdd, onUpdate, onDelete, onBack }) {
  const { error: showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');

  const filtered = team.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.position.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.position?.trim()) newErrors.position = 'Cargo é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { showError('Preencha os campos obrigatórios'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await onUpdate(editingId, formData);
      } else {
        await onAdd(formData);
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

  const handleEdit = (emp) => {
    setFormData({ name: emp.name, position: emp.position, phone: emp.phone || '', email: emp.email || '' });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(emptyForm);
    setEditingId(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white mb-4">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <User size={28} /> Equipe de Segurança
                </h1>
                <p className="text-slate-300 mt-1">{team.length} funcionário(s) ativo(s)</p>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium"
                >
                  <Plus size={18} /> Adicionar
                </button>
              )}
            </div>
          </div>

          {/* Busca */}
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              placeholder="Buscar por nome ou cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* FORMULÁRIO */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="text-slate-600" size={20} />
              {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={saving}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${
                      errors.name ? 'border-red-500' : 'border-gray-300 focus:border-slate-500'
                    }`}
                    placeholder="Nome completo"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">❌ {errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-500 focus:outline-none disabled:opacity-50"
                  >
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-500 focus:outline-none disabled:opacity-50"
                    placeholder="(61) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-500 focus:outline-none disabled:opacity-50"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <LoadingButton
                  loading={saving}
                  onClick={handleSubmit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingId ? 'Salvar' : 'Adicionar'}
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
            <User size={50} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-500">Nenhum funcionário encontrado</h3>
            <p className="text-gray-400 text-sm mt-1">Adicione membros da equipe de segurança</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(emp => (
              <div key={emp.id} className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{emp.name}</div>
                    <div className="text-sm text-slate-600 font-medium">{emp.position}</div>
                    <div className="flex gap-3 mt-1">
                      {emp.phone && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={11} /> {emp.phone}
                        </span>
                      )}
                      {emp.email && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={11} /> {emp.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Remover "${emp.name}" da equipe?`)) onDelete(emp.id);
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}