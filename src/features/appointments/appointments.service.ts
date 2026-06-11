import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentFormData, DoctorAvailability } from './appointments.types';

function mapAppointment(record: any): Appointment {
  return {
    id: record.id,
    queueNumber: record.queue_number ?? record.queueNumber ?? null,
    customerId: record.customer_id ?? record.customerId,
    petId: record.pet_id ?? record.petId,
    doctorId: record.doctor_id ?? record.doctorId ?? null,
    service: record.service,
    notes: record.notes ?? null,
    scheduledAt: record.scheduled_at ?? record.scheduledAt,
    status: record.status,
    createdAt: record.created_at ?? record.createdAt
  };
}

export const appointmentsService = {
  async getAppointments({ page = 1, pageSize = 20, search, status, from, to, doctorId }: any = {}) {
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('appointments')
      .select('id, queue_number, customer_id, pet_id, doctor_id, service, notes, scheduled_at, status, created_at', { count: 'exact' })
      .order('scheduled_at', { ascending: true });

    if (search) query = query.ilike('service', `%${search}%`);
    if (status) query = query.eq('status', status);
    if (doctorId) query = query.eq('doctor_id', doctorId);
    if (from) query = query.gte('scheduled_at', from);
    if (to) query = query.lte('scheduled_at', to);

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);

    return {
      items: Array.isArray(res.data) ? res.data.map(mapAppointment) : [],
      total: typeof res.count === 'number' ? res.count : (res.data || []).length
    };
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase.from('appointments').select('id, queue_number, customer_id, pet_id, doctor_id, service, notes, scheduled_at, status, created_at').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data ? mapAppointment(data) : null;
  },

  async createAppointment(payload: AppointmentFormData): Promise<Appointment> {
    const queueNumber = await this.generateQueueNumber(payload.scheduledAt);
    const insert = {
      queue_number: queueNumber,
      customer_id: payload.customerId,
      pet_id: payload.petId,
      doctor_id: payload.doctorId ?? null,
      service: payload.service,
      notes: payload.notes ?? null,
      scheduled_at: payload.scheduledAt,
      status: 'scheduled'
    };
    const { data, error } = await supabase.from('appointments').insert(insert).select().single();
    if (error || !data) throw new Error(error.message || 'Unable to create appointment');
    return mapAppointment(data);
  },

  async updateAppointmentStatus(id: string, status: string) {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to update appointment status');
    return mapAppointment(data);
  },

  async getCalendarAppointments(from: string, to: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, queue_number, customer_id, pet_id, doctor_id, service, notes, scheduled_at, status, created_at')
      .gte('scheduled_at', from)
      .lte('scheduled_at', to)
      .order('scheduled_at', { ascending: true });
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data.map(mapAppointment) : [];
  },

  async getDoctors(search?: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, profile_id, specialization, photo_url, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const doctors = Array.isArray(data) ? data : [];
    const normalized = search?.trim().toLowerCase() || '';

    const filtered = normalized
      ? doctors.filter((doc: any) => {
          const profileName = doc.profiles?.full_name?.toLowerCase() ?? '';
          return (
            profileName.includes(normalized) ||
            String(doc.specialization ?? '').toLowerCase().includes(normalized)
          );
        })
      : doctors;

    return filtered.slice(0, 50).map((doc: any) => ({
      id: doc.id,
      profileId: doc.profile_id,
      fullName: doc.profiles?.full_name ?? 'Doctor',
      specialization: doc.specialization,
      photoUrl: doc.photo_url ?? null
    }));
  },

  async generateQueueNumber(date: string) {
    const normalized = new Date(date);
    const suffix = Math.floor(Math.random() * 900) + 100;
    return `${normalized.toISOString().slice(0, 10).replace(/-/g, '')}-${suffix}`;
  },

  async getDoctorAvailability(doctorId: string, date: string): Promise<DoctorAvailability> {
    const slots = Array.from({ length: 8 }).map((_, i) => {
      const d = new Date(date);
      d.setHours(9 + i, 0, 0, 0);
      return d.toISOString();
    });

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const { data: booked, error } = await supabase
      .from('appointments')
      .select('scheduled_at')
      .eq('doctor_id', doctorId)
      .gte('scheduled_at', date)
      .lt('scheduled_at', nextDay.toISOString());

    if (error) throw new Error(error.message);

    const bookedSet = new Set((booked || []).map((b: any) => b.scheduled_at));
    return { doctorId, date, slots: slots.filter((s) => !bookedSet.has(s)) };
  }
};

export default appointmentsService;
