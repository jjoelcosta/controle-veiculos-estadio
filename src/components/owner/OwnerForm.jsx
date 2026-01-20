import React, { useState } from 'react';
import { useToast } from '../ui/Toast';

export default function OwnerForm({
  owners = [],
  initialData,
  onSubmit,
  onCancel
}) {
  const { error } = useToast();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    phone: initialData?.phone || '',
    position: initialData?.position || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nameNormalized = formData.name.trim().toLowerCase();

    const nameExists = owners.some(
      o =>
        o.id !== initialData?.id &&
        o.name.trim().toLowerCase() === nameNormalized
    );

    if (nameExists) {
      error('Já existe um proprietário com esse nome.');
      return;
    }

    if (formData.company) {
      const companyNormalized = formData.company.trim().toLowerCase();

      const companyExists = owners.some(
        o =>
          o.id !== initialData?.id &&
          o.company &&
          o.company.trim().toLowerCase() === companyNormalized
      );

      if (companyExists) {
        error('Essa empresa já está cadastrada.');
        return;
      }
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <input name="name" placeholder="Nome" value={formData.name} onChange={handleChange} required />
      <input name="company" placeholder="Empresa" value={formData.company} onChange={handleChange} />
      <input name="phone" placeholder="Telefone" value={formData.phone} onChange={handleChange} />
      <input name="position" placeholder="Cargo" value={formData.position} onChange={handleChange} />

      <div className="flex gap-4">
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
          Salvar
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
