import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Building2, Briefcase, Layers } from 'lucide-react';
import { useToast } from '../ui/Toast';

export default function OwnerForm({ initialData, owners = [], onSubmit, onCancel }) {
  const { error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    position: '',
    sector: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        position: initialData.position || '',
        sector: initialData.sector || ''
      });
    }
  }, [initialData]);

      const validateForm = () => {
  const newErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = 'Nome é obrigatório';
  }

  if (!formData.company.trim()) {
    newErrors.company = 'Empresa é obrigatória';
  }

  // ✅ CORRIGIDO: Validar duplicidade por NOME + EMPRESA
  if (!initialData) {
    const duplicateExists = owners.some(
      o => 
        o.name?.toLowerCase().trim() === formData.name.trim().toLowerCase() &&
        o.company?.toLowerCase().trim() === formData.company.trim().toLowerCase()
    );
    
    if (duplicateExists) {
      newErrors.name = 'Já existe este colaborador nesta empresa';
      showError('Já existe este colaborador nesta empresa');
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {initialData ? '✏️ Editar Proprietário' : '➕ Novo Proprietário'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User size={16} className="inline mr-1" />
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.name 
                ? 'border-red-500 focus:border-red-600' 
                : 'border-gray-300 focus:border-purple-500'
            }`}
            placeholder="Digite o nome completo"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">❌ {errors.name}</p>
          )}
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Building2 size={16} className="inline mr-1" />
            Empresa *
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.company 
                ? 'border-red-500 focus:border-red-600' 
                : 'border-gray-300 focus:border-purple-500'
            }`}
            placeholder="Nome da empresa"
          />
          {errors.company && (
            <p className="text-red-600 text-sm mt-1">❌ {errors.company}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Telefone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone size={16} className="inline mr-1" />
              Telefone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Briefcase size={16} className="inline mr-1" />
              Cargo
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Ex: Gerente, Diretor..."
            />
          </div>
        </div>

        {/* Setor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Layers size={16} className="inline mr-1" />
            Setor
          </label>
          <input
            type="text"
            value={formData.sector}
            onChange={(e) => handleChange('sector', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="Ex: Administrativo, TI, Financeiro..."
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Save size={20} />
            {initialData ? 'Salvar Alterações' : 'Cadastrar Proprietário'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}