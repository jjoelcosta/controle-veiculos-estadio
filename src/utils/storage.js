import { supabase } from '../lib/supabase';

export const storage = {
  
  // =====================================================
  // VEÍCULOS
  // =====================================================
  
  loadVehicles: async (filters = {}) => {
    try {
      let query = supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtros no backend
      if (filters.plate) query = query.ilike('plate', `%${filters.plate}%`);
      if (filters.brand) query = query.eq('brand', filters.brand);
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.parkingLocation) query = query.eq('parking_location', filters.parkingLocation);

      const { data, error } = await query;
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
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      return [];
    }
  },

  addVehicle: async (vehicle) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          parking_location: vehicle.parkingLocation,
          owner_id: vehicle.ownerId
        }])
        .select()
        .single();
      
      if (error) throw error;
      
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
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      throw error;
    }
  },

  updateVehicle: async (id, vehicle) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update({
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          parking_location: vehicle.parkingLocation,
          owner_id: vehicle.ownerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        type: data.type,
        parkingLocation: data.parking_location,
        ownerId: data.owner_id,
        createdAt: new Date(data.created_at).toLocaleString('pt-BR'),
        updatedAt: new Date(data.updated_at).toLocaleString('pt-BR')
      };
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      throw error;
    }
  },

  deleteVehicle: async (id) => {
  try {
    // Soft delete: marca como deletado
    const { error } = await supabase
      .from('vehicles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null); // Só deleta se ainda não foi deletado
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    throw error;
  }
},


  // =====================================================
  // PROPRIETÁRIOS
  // =====================================================
  
  loadOwners: async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .order('created_at', { ascending: false });
      
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
    } catch (error) {
      console.error('Erro ao carregar proprietários:', error);
      return [];
    }
  },

  addOwner: async (owner) => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .insert([{
          name: owner.name,
          phone: owner.phone,
          company: owner.company,
          position: owner.position,
          sector: owner.sector
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        company: data.company,
        position: data.position,
        sector: data.sector,
        createdAt: new Date(data.created_at).toLocaleString('pt-BR')
      };
    } catch (error) {
      console.error('Erro ao adicionar proprietário:', error);
      throw error;
    }
  },

  updateOwner: async (id, owner) => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .update({
          name: owner.name,
          phone: owner.phone,
          company: owner.company,
          position: owner.position,
          sector: owner.sector,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        company: data.company,
        position: data.position,
        sector: data.sector,
        createdAt: new Date(data.created_at).toLocaleString('pt-BR'),
        updatedAt: new Date(data.updated_at).toLocaleString('pt-BR')
      };
    } catch (error) {
      console.error('Erro ao atualizar proprietário:', error);
      throw error;
    }
  },

  deleteOwner: async (id) => {
  try {
    // Soft delete: marca como deletado
    const { error } = await supabase
      .from('owners')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar proprietário:', error);
    throw error;
  }
},

// =====================================================
// FUNÇÕES ADMIN (para futuro)
// =====================================================

// Restaurar veículo deletado
restoreVehicle: async (id) => {
  try {
    const { error } = await supabase
      .from('vehicles')
      .update({ deleted_at: null })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao restaurar veículo:', error);
    throw error;
  }
},

// Listar veículos deletados (para admin)
loadDeletedVehicles: async () => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    
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
      deletedAt: new Date(v.deleted_at).toLocaleString('pt-BR')
    }));
  } catch (error) {
    console.error('Erro ao carregar veículos deletados:', error);
    return [];
  }
}
}