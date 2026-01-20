import { supabase } from '../lib/supabase';

const normalizeText = (value) => 
  value ? value.trim().replace(/\s+/g, ' ') : null;

const handleDbError = (error) => {
  if (error?.code === '23505') {
    throw new Error('❌ Registro duplicado.');
  }
  throw error;
};

/* PROPRIETÁRIOS */
const loadOwners = async () => {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;
  
  return (data || []).map(o => ({
    id: o.id,
    name: o.name,
    phone: o.phone,
    company: o.company,
    position: o.position,
    sector: o.sector,
    createdAt: new Date(o.created_at).toLocaleString('pt-BR'),
    updatedAt: o.updated_at ? new Date(o.updated_at).toLocaleString('pt-BR') : null
  }));
};

const addOwner = async (ownerData) => {
  try {
    const payload = {
      name: normalizeText(ownerData.name),
      phone: normalizeText(ownerData.phone),
      company: normalizeText(ownerData.company),
      sector: normalizeText(ownerData.sector),
      position: normalizeText(ownerData.position),
    };

    // ✅ CORRIGIDO: Validar duplicidade por NOME + EMPRESA
    const { data: existing } = await supabase
      .from('owners')
      .select('id')
      .ilike('name', payload.name)
      .ilike('company', payload.company)
      .is('deleted_at', null)
      .limit(1);

    if (existing?.length) {
      throw new Error('❌ Já existe um proprietário com este nome nesta empresa');
    }

    const { data, error } = await supabase
      .from('owners')
      .insert(payload)
      .select()
      .single();

    if (error) handleDbError(error);
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      company: data.company,
      position: data.position,
      sector: data.sector,
      createdAt: new Date(data.created_at).toLocaleString('pt-BR')
    };
  } catch (err) {
    handleDbError(err);
  }
};

const updateOwner = async (id, ownerData) => {
  try {
    const payload = {
      name: normalizeText(ownerData.name),
      phone: normalizeText(ownerData.phone),
      company: normalizeText(ownerData.company),
      sector: normalizeText(ownerData.sector),
      position: normalizeText(ownerData.position),
    };

    const { error } = await supabase
      .from('owners')
      .update(payload)
      .eq('id', id);

    if (error) handleDbError(error);
  } catch (err) {
    handleDbError(err);
  }
};

const deleteOwner = async (id) => {
  const { error } = await supabase
    .from('owners')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

/* VEÍCULOS */
const loadVehicles = async () => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .is('deleted_at', null)
    .order('plate', { ascending: true });

  if (error) throw error;
  
  return (data || []).map(v => ({
    id: v.id,
    plate: v.plate,
    brand: v.brand,
    model: v.model,
    type: v.type,
    parkingLocation: v.parking_location,
    ownerId: v.owner_id,
    createdAt: new Date(v.created_at).toLocaleString('pt-BR'),
    updatedAt: v.updated_at ? new Date(v.updated_at).toLocaleString('pt-BR') : null
  }));
};

const addVehicle = async (vehicleData) => {
  try {
    const payload = {
      plate: normalizeText(vehicleData.plate)?.toUpperCase(),
      type: normalizeText(vehicleData.type),
      brand: normalizeText(vehicleData.brand),
      model: normalizeText(vehicleData.model),
      parking_location: normalizeText(vehicleData.parkingLocation),
      owner_id: vehicleData.ownerId,
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert(payload)
      .select()
      .single();

    if (error) handleDbError(error);
    
    return {
      id: data.id,
      plate: data.plate,
      brand: data.brand,
      model: data.model,
      type: data.type,
      parkingLocation: data.parking_location,
      ownerId: data.owner_id,
      createdAt: new Date(data.created_at).toLocaleString('pt-BR')
    };
  } catch (err) {
    handleDbError(err);
  }
};

const updateVehicle = async (id, vehicleData) => {
  try {
    const payload = {
      plate: normalizeText(vehicleData.plate)?.toUpperCase(),
      type: normalizeText(vehicleData.type),
      brand: normalizeText(vehicleData.brand),
      model: normalizeText(vehicleData.model),
      parking_location: normalizeText(vehicleData.parkingLocation),
      owner_id: vehicleData.ownerId,
    };

    const { error } = await supabase
      .from('vehicles')
      .update(payload)
      .eq('id', id);

    if (error) handleDbError(error);
  } catch (err) {
    handleDbError(err);
  }
};

const deleteVehicle = async (id) => {
  const { error } = await supabase
    .from('vehicles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

export const storage = {
  loadOwners,
  loadVehicles,
  addOwner,
  updateOwner,
  deleteOwner,
  addVehicle,
  updateVehicle,
  deleteVehicle,
};