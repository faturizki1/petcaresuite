import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type { Pet, PetFormData, SpeciesOption, BreedOption } from './pets.types';

const PET_SELECT = `id, name, customer_id, photo_url, species_id, breed_id, gender, birth_date, weight, color, is_sterilized, microchip_number, qr_code, is_active, created_at, updated_at, species(name), breeds(name), customers(full_name)`;

function mapPet(record: any): Pet {
  return {
    id: record.id,
    name: record.name,
    customerId: record.customer_id,
    customerName: record.customers?.full_name ?? null,
    photoUrl: record.photo_url ?? null,
    speciesId: record.species_id,
    species: record.species?.name ?? null,
    breedId: record.breed_id,
    breed: record.breeds?.name ?? null,
    gender: record.gender ?? 'unknown',
    birthDate: record.birth_date ?? null,
    weight: record.weight ?? null,
    color: record.color ?? null,
    isSterilized: record.is_sterilized ?? false,
    microchipNumber: record.microchip_number ?? null,
    qrCode: record.qr_code ?? null,
    isActive: record.is_active ?? true,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

export const petsService = {
  async getPets({ page = 1, pageSize = 12, search, speciesId }: any = {}) {
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('pets').select(PET_SELECT, { count: 'exact' }).order('created_at', { ascending: false });
    if (search) query = query.ilike('name', `%${search}%`);
    if (speciesId) query = query.eq('species_id', speciesId);
    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) handleSupabaseError(res.error);
    const items = (res.data || []).map(mapPet);
    return { items, total: res.count ?? items.length };
  },

  async getPetById(id: string): Promise<Pet | null> {
    const { data, error } = await supabase.from('pets').select(PET_SELECT).eq('id', id).single();
    if (error) handleSupabaseError(error);
    if (!data) return null;
    return mapPet(data);
  },

  async getSpecies(): Promise<SpeciesOption[]> {
    const { data, error } = await supabase.from('species').select('id, name').order('name', { ascending: true });
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getBreedsBySpecies(speciesId: string): Promise<BreedOption[]> {
    const { data, error } = await supabase.from('breeds').select('id, name, species_id').eq('species_id', speciesId).order('name', { ascending: true });
    if (error) handleSupabaseError(error);
    return (data || []).map((row: { id: string; name: string; species_id: string }) => ({
      id: row.id,
      name: row.name,
      speciesId: row.species_id
    }));
  },

  async createPet(payload: PetFormData): Promise<Pet> {
    const insert = {
      name: payload.name,
      customer_id: payload.customerId,
      species_id: payload.speciesId,
      breed_id: payload.breedId,
      gender: payload.gender,
      birth_date: payload.birthDate ?? null,
      weight: payload.weight ?? null,
      color: payload.color ?? null,
      is_sterilized: payload.isSterilized ?? false,
      microchip_number: payload.microchipNumber ?? null,
      photo_url: payload.photoUrl ?? null,
      is_active: payload.isActive ?? true
    };

    const { data, error } = await supabase.from('pets').insert(insert).select(PET_SELECT).single();
    if (error) handleSupabaseError(error);
    return mapPet(data);
  },

  async updatePet(id: string, updates: Partial<PetFormData>) {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.customerId !== undefined) payload.customer_id = updates.customerId;
    if (updates.speciesId !== undefined) payload.species_id = updates.speciesId;
    if (updates.breedId !== undefined) payload.breed_id = updates.breedId;
    if (updates.gender !== undefined) payload.gender = updates.gender;
    if (updates.birthDate !== undefined) payload.birth_date = updates.birthDate ?? null;
    if (updates.weight !== undefined) payload.weight = updates.weight;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.isSterilized !== undefined) payload.is_sterilized = updates.isSterilized;
    if (updates.microchipNumber !== undefined) payload.microchip_number = updates.microchipNumber ?? null;
    if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { data, error } = await supabase.from('pets').update(payload).eq('id', id).select(PET_SELECT).single();
    if (error) handleSupabaseError(error);
    return mapPet(data);
  },

  async generateQRCode(id: string) {
    return `https://api.qrserver.com/v1/create-qr-code/?data=pet:${id}&size=200x200`;
  },

  async getPetTimeline(id: string) {
    const { data, error } = await supabase.from('pet_timeline').select('*').eq('pet_id', id).order('created_at', { ascending: false });
    if (error) handleSupabaseError(error);
    return data || [];
  }
};

export default petsService;
