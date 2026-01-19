import React, { useState, useEffect } from 'react';
import { Save, X, Phone, Building2, Briefcase } from 'lucide-react';
import { useToast } from '../ui/Toast';

export default function OwnerForm({ 
  initialData = null, 
  owners = [], // ✅ NOVO: Recebe lista de proprietários para validar
  onSubmit, 
  onCancel 
}) {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    position: '',
    sector: ''
  });

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // ✅ FUNÇÃO PARA NORMALIZAR TEXTO (case-insensitive)
  const normalizeText = (text) => {
    return text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const handleSubmit = () => {
    // Validação básica
    if (!formData.name?.trim()) {
      error('Por favor, informe o nome do proprietário');
      return;
    }

    // ✅ CORRIGIDO: Validar nome duplicado (case-insensitive)
    const normalizedName = normalizeText(formData.name);
    const nameExists = owners.some(owner => {
      // Se estiver editando, ignora o próprio registro
      if (initialData && owner.id === initialData.id) {
        return false;
      }
      return normalizeText(owner.name) === normalizedName;
    });

    if (nameExists) {
      error('Já existe um proprietário cadastrado com este nome!');
      return;
    }

    // ✅ CORRIGIDO: Validar empresa duplicada (case-insensitive)
    if (formData.company?.trim()) {
      const normalizedCompany = normalizeText(formData.company);
      const companyExists = owners.some(owner => {
        // Se estiver editando, ignora o próprio registro
        if (initialData && owner.id === initialData.id) {
          return false;
        }
        if (!owner.company) return false;
        return normalizeText(owner.company) === normalizedCompany;
      });

      if (companyExists) {
        error('Já existe um proprietário cadastrado com esta empresa!');
        return;
      }
    }

    onSubmit(formData);
    success(initialData ? 'Proprietário atualizado com sucesso!' : 'Proprietário cadastrado com sucesso!');
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        {initialData ? '✏️ Editar Proprietário' : '👤 Cadastrar Novo Proprietário'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div>
          <label htmlFor="owner-name" className="block text-sm font-medium mb-1 text-gray-700">
            Nome Completo *
          </label>
          <input
            id="owner-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="João da Silva"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Telefone */}
        <div>
          <label htmlFor="owner-phone" className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
            <Phone size={14} /> Telefone
          </label>
          <input
            id="owner-phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(11) 98765-4321"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Empresa */}
        <div>
          <label htmlFor="owner-company" className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
            <Building2 size={14} /> Empresa
          </label>
          <input
            id="owner-company"
            name="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Nome da empresa"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Cargo */}
        <div>
          <label htmlFor="owner-position" className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
            <Briefcase size={14} /> Cargo
          </label>
          <input
            id="owner-position"
            name="position"
            type="text"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            placeholder="Gerente, Analista, etc."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Setor */}
        <div className="md:col-span-2">
          <label htmlFor="owner-sector" className="block text-sm font-medium mb-1 text-gray-700">
            Setor
          </label>
          <input
            id="owner-sector"
            name="sector"
            type="text"
            value={formData.sector}
            onChange={(e) => handleChange('sector', e.target.value)}
            placeholder="Financeiro, TI, RH, etc."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Save size={18} />
          {initialData ? 'Salvar Alterações' : 'Cadastrar'}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <X size={18} />
          Cancelar
        </button>
      </div>
    </div>
  );
}
