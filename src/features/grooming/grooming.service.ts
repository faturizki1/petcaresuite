import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type { GroomingService, GroomingRecord, GroomingQueryParams, GroomingServicePayload, GroomingRecordPayload } from './grooming.types';

function mapService(record: any): GroomingService {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    price: Number(record.price),
    durationMinutes: record.duration_minutes,
    isActive: record.is_active,
    createdAt: record.created_at
  };
}

function mapRecord(record: any): GroomingRecord {
  return {
    id: record.id,
    petId: record.pet_id,
    serviceId: record.service_id,
    groomerId: record.groomer_id,
    scheduledAt: record.scheduled_at,
    completedAt: record.completed_at,
    status: record.status,
    notes: record.notes,
    photoBeforeUrl: record.photo_before_url,
    photoAfterUrl: record.photo_after_url,
    serviceName: record.grooming_services?.name ?? null,
    groomerName: record.profiles?.full_name ?? null,
    petName: record.pets?.name ?? null,
    createdAt: record.created_at
  };
}

export const groomingService = {
  async getServices(): Promise<GroomingService[]> {
    const { data, error } = await supabase.from('grooming_services').select('id, name, description, price, duration_minutes, is_active, created_at').order('created_at', { ascending: false });
    if (error) handleSupabaseError(error);
    return (data || []).map(mapService);
  },

  async getRecords({ page = 1, pageSize = 12, search, status }: GroomingQueryParams = {}): Promise<{ items: GroomingRecord[]; total: number }> {
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('grooming_records').select('id, pet_id, service_id, groomer_id, scheduled_at, completed_at, status, notes, photo_before_url, photo_after_url, created_at, pets(name), grooming_services(name), profiles(full_name)', { count: 'exact' }).order('scheduled_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (search) {
      const term = `%${search}%`;
      query = query.or(`pet_id.ilike.${term},notes.ilike.${term}`);
    }
    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) handleSupabaseError(res.error);
    const items = Array.isArray(res.data) ? res.data.map(mapRecord) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async createService(payload: GroomingServicePayload): Promise<GroomingService> {
    const { data, error } = await supabase.from('grooming_services').insert({
      name: payload.name,
      description: payload.description,
      price: payload.price,
      duration_minutes: payload.durationMinutes
    }).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to create grooming service');
    return mapService(data);
  },

  async createRecord(payload: GroomingRecordPayload): Promise<GroomingRecord> {
    const { data, error } = await supabase.from('grooming_records').insert({
      pet_id: payload.petId,
      service_id: payload.serviceId,
      groomer_id: payload.groomerId,
      scheduled_at: payload.scheduledAt,
      status: 'scheduled',
      notes: payload.notes
    }).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to create grooming record');
    return mapRecord(data);
  },

  async completeGrooming(id: string, payload: { completedAt: string; photoBeforeUrl?: string | null; photoAfterUrl?: string | null; notes?: string }): Promise<GroomingRecord> {
    const { data, error } = await supabase.from('grooming_records').update({
      status: 'completed',
      completed_at: payload.completedAt,
      photo_before_url: payload.photoBeforeUrl,
      photo_after_url: payload.photoAfterUrl,
      notes: payload.notes
    }).eq('id', id).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to complete grooming');
    return mapRecord(data);
  },

  async updateGroomingStatus(id: string, status: string): Promise<GroomingRecord> {
    const { data, error } = await supabase.from('grooming_records').update({ status }).eq('id', id).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to update grooming status');
    return mapRecord(data);
  },

  async toggleGroomingService(id: string, isActive: boolean): Promise<GroomingService> {
    const { data, error } = await supabase.from('grooming_services').update({ is_active: isActive }).eq('id', id).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to toggle grooming service');
    return mapService(data);
  },

  async updateGroomingService(id: string, payload: GroomingServicePayload): Promise<GroomingService> {
    const { data, error } = await supabase.from('grooming_services').update({
      name: payload.name,
      description: payload.description,
      price: payload.price,
      duration_minutes: payload.durationMinutes
    }).eq('id', id).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to update grooming service');
    return mapService(data);
  },

  async getTodaySchedule(): Promise<GroomingRecord[]> {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('grooming_records')
      .select('id, pet_id, service_id, groomer_id, scheduled_at, completed_at, status, notes, photo_before_url, photo_after_url, created_at, pets(name), grooming_services(name), profiles(full_name)')
      .gte('scheduled_at', today)
      .lt('scheduled_at', new Date(new Date(today).getTime() + 86400000).toISOString())
      .order('scheduled_at', { ascending: true });
    if (error) handleSupabaseError(error);
    return (data || []).map(mapRecord);
  }
};
