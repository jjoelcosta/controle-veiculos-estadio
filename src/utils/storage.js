const STORAGE_VERSION = 1;
const VEHICLES_KEY = 'parkingSystem_vehicles';
const OWNERS_KEY = 'parkingSystem_owners';

export const storage = {
  saveVehicles: (vehicles) => {
    try {
      const data = {
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        data: vehicles
      };
      localStorage.setItem(VEHICLES_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar veículos:', error);
      return false;
    }
  },

  loadVehicles: () => {
    try {
      const stored = localStorage.getItem(VEHICLES_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Versão incompatível. Migrando...');
        return Array.isArray(parsed) ? parsed : parsed.data || [];
      }

      return parsed.data || [];
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      return [];
    }
  },

  saveOwners: (owners) => {
    try {
      const data = {
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        data: owners
      };
      localStorage.setItem(OWNERS_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar proprietários:', error);
      return false;
    }
  },

  loadOwners: () => {
    try {
      const stored = localStorage.getItem(OWNERS_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Versão incompatível. Migrando...');
        return Array.isArray(parsed) ? parsed : parsed.data || [];
      }

      return parsed.data || [];
    } catch (error) {
      console.error('Erro ao carregar proprietários:', error);
      return [];
    }
  },

  clearAll: () => {
    localStorage.removeItem(VEHICLES_KEY);
    localStorage.removeItem(OWNERS_KEY);
  }
};