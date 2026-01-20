import { supabase } from '../lib/supabase';

/* ================================
   UTILIDADES
================================ */
const normalizeText = (value) =>
  value ? value.trim().replace(/\s+/g, ' ') : null;

const handleDbError = (error) => {
  if (error?.code === '23505') {
    throw new Error('Registro duplicado. Verifique nome ou empresa.');
  }
  throw error;
};

/* ================================
   LOADERS
================================ */
const loadOwners = async () => {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

const loadVehicles = async () => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .is('deleted_at', null)
    .order('plate', { ascending: true });

  if (error) throw error;
  return data || [];
};

/* ================================
   OWNERS
================================ */
const addOwner = async (ownerData) => {
  try {
    const payload = {
      name: normalizeText(ownerData.name),
      phone: normalizeText(ownerData.phone),
      company: normalizeText(ownerData.company),
      sector: normalizeText(ownerData.sector),
      position: normalizeText(ownerData.position),
    };

    // 🔒 Validação prévia (UX, não substitui o banco)
    const { data: existing } = await supabase
      .from('owners')
      .select('id')
      .ilike('company', payload.company)
      .is('deleted_at', null)
      .limit(1);

    if (existing?.length) {
      throw new Error('Já existe um proprietário cadastrado com esta empresa');
    }

    const { data, error } = await supabase
      .from('owners')
      .insert(payload)
      .select()
      .single();

    if (error) handleDbError(error);
    return data;
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

/* ================================
   VEHICLES
================================ */
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
    return data;
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

/* ================================
   EXPORT
================================ */
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