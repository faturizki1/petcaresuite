import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { ModuleStatus } from '@/types';

interface ModuleState {
  modules: ModuleStatus;
  isLoading: boolean;
  error: string | null;
  setModules: (modules: ModuleStatus) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchModuleStatus: () => Promise<void>;
}

const defaultModules: ModuleStatus = {
  clinic: true,
  monitoring: false,
  inpatient: false,
  grooming: false,
  petshop: false,
  inventory: false,
  accounting: false,
  website: false
};

function parseModuleStatus(value: unknown): ModuleStatus {
  if (!value || typeof value !== 'object') {
    return defaultModules;
  }

  return {
    clinic: Boolean((value as Record<string, unknown>).clinic ?? defaultModules.clinic),
    monitoring: Boolean((value as Record<string, unknown>).monitoring ?? defaultModules.monitoring),
    inpatient: Boolean((value as Record<string, unknown>).inpatient ?? defaultModules.inpatient),
    grooming: Boolean((value as Record<string, unknown>).grooming ?? defaultModules.grooming),
    petshop: Boolean((value as Record<string, unknown>).petshop ?? defaultModules.petshop),
    inventory: Boolean((value as Record<string, unknown>).inventory ?? defaultModules.inventory),
    accounting: Boolean((value as Record<string, unknown>).accounting ?? defaultModules.accounting),
    website: Boolean((value as Record<string, unknown>).website ?? defaultModules.website)
  };
}

export const useModuleStore = create<ModuleState>((set) => ({
  modules: defaultModules,
  isLoading: false,
  error: null,
  setModules: (modules) => set({ modules }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  fetchModuleStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'modules')
        .single();

      if (error) {
        throw error;
      }

      set({ modules: parseModuleStatus(data?.value), isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load module settings';
      set({ error: message, isLoading: false });
    }
  }
}));
