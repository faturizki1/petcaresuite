import { supabase } from '@/lib/supabase';
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
    createdAt: record.created_at
  };
}

export const groomingService = {
  async getServices(): Promise<GroomingService[]> {
    const { data, error } = await supabase.from('grooming_services').select('id, name, description, price, duration_minutes, is_active, created_at').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(mapService);
  },

  async getRecords({ page = 1, pageSize = 12, search, status }: GroomingQueryParams = {}): Promise<{ items: GroomingRecord[]; total: number }> {
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('grooming_records').select('id, pet_id, service_id, groomer_id, scheduled_at, completed_at, status, notes, photo_before_url, photo_after_url, created_at', { count: 'exact' }).order('scheduled_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (search) {
      const term = `%${search}%`;
      query = query.or(`pet_id.ilike.${term},notes.ilike.${term}`);
    }
    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
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
    if (error || !data) throw new Error(error?.message || 'Unable to create grooming service');
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
    if (error || !data) throw new Error(error?.message || 'Unable to create grooming record');
    return mapRecord(data);
  }
};