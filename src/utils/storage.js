import { supabase } from '../lib/supabase';

export const storage = {
  // Carregar veículos
  loadVehicles: async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
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

  // Carregar proprietários
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

  // Adicionar veículo
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

  // Atualizar veículo
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

  // Deletar veículo
  deleteVehicle: async (id) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
      throw error;
    }
  },

  // Adicionar proprietário
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

  // Atualizar proprietário
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

  // Deletar proprietário
  deleteOwner: async (id) => {
    try {
      const { error } = await supabase
        .from('owners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar proprietário:', error);
      throw error;
    }
  }
};