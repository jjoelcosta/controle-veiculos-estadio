import { supabase } from '../lib/supabase';

const normalizeText = (value) => 
  value ? value.trim().replace(/\s+/g, ' ') : null;

const handleDbError = (error) => {
  if (error?.code === '23505') {
    throw new Error('❌ Registro duplicado.');
  }
  throw error;
};

/* ================================
   PROPRIETÁRIOS
================================ */

const loadOwners = async () => {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
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

    // Validar duplicidade por NOME + EMPRESA
    const { data: existing } = await supabase
      .from('owners')
      .select('id')
      .ilike('name', payload.name)
      .ilike('company', payload.company)
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
    throw err;
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
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('owners')
      .update(payload)
      .eq('id', id);

    if (error) handleDbError(error);
    
    return true;
  } catch (err) {
    throw err;
  }
};

const deleteOwner = async (id) => {
  const { error } = await supabase
    .from('owners')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/* ================================
   VEÍCULOS
================================ */

const loadVehicles = async () => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
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
    throw err;
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
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('vehicles')
      .update(payload)
      .eq('id', id);

    if (error) handleDbError(error);
    
    return true;
  } catch (err) {
    throw err;
  }
};

const deleteVehicle = async (id) => {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/* ================================
   VEÍCULOS TERCEIROS
================================ */

const loadThirdPartyVehicles = async () => {
  try {
    const { data, error } = await supabase
      .from('third_party_vehicles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(v => ({
      id: v.id,
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      color: v.color,
      vehicleType: v.vehicle_type,
      driverName: v.driver_name,
      driverPhone: v.driver_phone,
      company: v.company,
      serviceType: v.service_type,
      notes: v.notes,
      createdAt: new Date(v.created_at).toLocaleString('pt-BR'),
      updatedAt: v.updated_at ? new Date(v.updated_at).toLocaleString('pt-BR') : null
    }));
  } catch (err) {
    console.error('Erro ao carregar veículos terceiros:', err);
    throw err;
  }
};

const addThirdPartyVehicle = async (vehicleData) => {
  try {
    const normalizedPlate = normalizeText(vehicleData.plate)?.toUpperCase();

    // Verificar duplicata
    const { data: existing } = await supabase
      .from('third_party_vehicles')
      .select('id')
      .eq('plate', normalizedPlate)
      .is('deleted_at', null)
      .single();

    if (existing) {
      throw new Error(`Veículo com placa ${normalizedPlate} já cadastrado`);
    }

    const payload = {
      plate: normalizedPlate,
      brand: normalizeText(vehicleData.brand),
      model: normalizeText(vehicleData.model),
      color: normalizeText(vehicleData.color),
      vehicle_type: normalizeText(vehicleData.vehicleType) || 'Carro',
      driver_name: normalizeText(vehicleData.driverName),
      driver_phone: normalizeText(vehicleData.driverPhone),
      company: normalizeText(vehicleData.company),
      service_type: normalizeText(vehicleData.serviceType),
      notes: normalizeText(vehicleData.notes),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('third_party_vehicles')
      .insert([payload])
      .select()
      .single();

    if (error) handleDbError(error);
    
    return {
      id: data.id,
      plate: data.plate,
      brand: data.brand,
      model: data.model,
      color: data.color,
      vehicleType: data.vehicle_type,
      driverName: data.driver_name,
      driverPhone: data.driver_phone,
      company: data.company,
      serviceType: data.service_type,
      notes: data.notes,
      createdAt: new Date(data.created_at).toLocaleString('pt-BR')
    };
  } catch (err) {
    console.error('Erro ao adicionar veículo terceiro:', err);
    throw err;
  }
};

const updateThirdPartyVehicle = async (id, vehicleData) => {
  try {
    const payload = {
      plate: normalizeText(vehicleData.plate)?.toUpperCase(),
      brand: normalizeText(vehicleData.brand),
      model: normalizeText(vehicleData.model),
      color: normalizeText(vehicleData.color),
      vehicle_type: normalizeText(vehicleData.vehicleType),
      driver_name: normalizeText(vehicleData.driverName),
      driver_phone: normalizeText(vehicleData.driverPhone),
      company: normalizeText(vehicleData.company),
      service_type: normalizeText(vehicleData.serviceType),
      notes: normalizeText(vehicleData.notes),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('third_party_vehicles')
      .update(payload)
      .eq('id', id);

    if (error) handleDbError(error);
    
    return true;
  } catch (err) {
    console.error('Erro ao atualizar veículo terceiro:', err);
    throw err;
  }
};

const deleteThirdPartyVehicle = async (id) => {
  try {
    const { error } = await supabase
      .from('third_party_vehicles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (err) {
    console.error('Erro ao deletar veículo terceiro:', err);
    throw err;
  }
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
  loadThirdPartyVehicles,
  addThirdPartyVehicle,
  updateThirdPartyVehicle,
  deleteThirdPartyVehicle
};