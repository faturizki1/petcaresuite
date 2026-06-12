import { supabase } from '@/lib/supabase';
import { posService } from '@/features/pos/pos.service';
import type { Appointment, AppointmentFormData, DoctorAvailability, AppointmentServiceOption, TimeSlot } from './appointments.types';

function formatScheduledAt(date: string, time: string) {
  return `${date}T${time}`;
}

function mapAppointment(record: any): Appointment {
  const appointmentDate = record.appointment_date ?? record.appointmentDate;
  const startTime = record.start_time ?? record.startTime;
  const endTime = record.end_time ?? record.endTime;

  return {
    id: record.id,
    queueNumber: record.queue_number !== undefined && record.queue_number !== null ? String(record.queue_number) : record.queueNumber ?? null,
    customerId: record.customer_id ?? record.customerId,
    customerName: record.customers?.full_name ?? record.customerName ?? null,
    petId: record.pet_id ?? record.petId,
    petName: record.pets?.name ?? record.petName ?? null,
    doctorId: record.doctor_id ?? record.doctorId ?? null,
    doctorName: record.doctors?.profiles?.full_name ?? record.doctorName ?? null,
    serviceId: record.service_id ?? record.serviceId,
    service: record.services?.name ?? record.service ?? '',
    notes: record.notes ?? null,
    appointmentDate,
    startTime,
    endTime,
    scheduledAt: record.scheduled_at ?? record.scheduledAt ?? formatScheduledAt(appointmentDate, startTime),
    status: record.status,
    createdAt: record.created_at ?? record.createdAt
  };
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatDateTime(date: Date): string {
  return date.toISOString();
}

function buildTimeSlots(startTime: string, endTime: string, durationMinutes = 60) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const slots: TimeSlot[] = [];

  for (let current = start; current + durationMinutes <= end; current += durationMinutes) {
    const startHour = Math.floor(current / 60);
    const startMinute = current % 60;
    const finish = current + durationMinutes;
    const endHour = Math.floor(finish / 60);
    const endMinute = finish % 60;

    slots.push({
      startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`,
      endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`
    });
  }

  return slots;
}

export const appointmentsService = {
  async getAppointments({ page = 1, pageSize = 20, search, status, from, to, doctorId }: any = {}) {
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('appointments')
      .select('id, queue_number, customer_id, pet_id, doctor_id, service_id, services(name), customers(full_name), pets(name), doctors(profiles(full_name)), notes, appointment_date, start_time, end_time, status, created_at', { count: 'exact' })
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (status) query = query.eq('status', status);
    if (doctorId) query = query.eq('doctor_id', doctorId);
    if (from) query = query.gte('appointment_date', from);
    if (to) query = query.lte('appointment_date', to);

    if (search) {
      const serviceIds = await this.searchServiceIds(search);
      if (serviceIds.length === 0) {
        return { items: [], total: 0 };
      }
      query = query.in('service_id', serviceIds);
    }

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);

    const items = Array.isArray(res.data) ? res.data.map(mapAppointment) : [];
    return {
      items,
      total: typeof res.count === 'number' ? res.count : items.length
    };
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, queue_number, customer_id, pet_id, doctor_id, service_id, services(name), customers(full_name), pets(name), doctors(profiles(full_name)), notes, appointment_date, start_time, end_time, status, created_at')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data ? mapAppointment(data) : null;
  },

  async createAppointment(payload: AppointmentFormData): Promise<Appointment> {
    const queueNumber = await this.generateQueueNumber(payload.appointmentDate);
    const insert = {
      queue_number: queueNumber,
      customer_id: payload.customerId,
      pet_id: payload.petId,
      doctor_id: payload.doctorId ?? null,
      service_id: payload.serviceId,
      appointment_date: payload.appointmentDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      notes: payload.notes ?? null,
      status: 'scheduled'
    };
    const { data, error } = await supabase.from('appointments').insert(insert).select().single();
    if (error || !data) throw new Error(error?.message ?? 'Unable to create appointment');
    return mapAppointment(data);
  },

  async updateAppointmentStatus(id: string, status: string) {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to update appointment status');

    if (status === 'completed') {
      const reservation = await supabase.from('invoices').select('id').eq('appointment_id', id).limit(1);
      const alreadyExists = Array.isArray(reservation.data) ? reservation.data.length > 0 : !!reservation.data;
      if (!alreadyExists) {
        await posService.createInvoice({
          appointment_id: id,
          subtotal: 0,
          discount_amount: 0,
          loyalty_points_used: 0,
          loyalty_discount_amount: 0,
          total: 0,
          payment_method: 'cash',
          paid_amount: 0,
          change_amount: 0,
          status: 'draft',
          notes: `Draft invoice for appointment ${id}`,
          items: []
        });
      }
    }

    return mapAppointment(data);
  },

  async getCalendarAppointments(from: string, to: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, queue_number, customer_id, pet_id, doctor_id, service_id, services(name), customers(full_name), pets(name), doctors(profiles(full_name)), notes, appointment_date, start_time, end_time, status, created_at')
      .gte('appointment_date', from)
      .lte('appointment_date', to)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });
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
    try {
      const result = await supabase.functions.invoke('generate-queue', { body: { date } as any } as any);
      return (result as any)?.data?.queue_number ?? `${new Date(date).toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900) + 100}`;
    } catch {
      const normalized = new Date(date);
      const suffix = Math.floor(Math.random() * 900) + 100;
      return `${normalized.toISOString().slice(0, 10).replace(/-/g, '')}-${suffix}`;
    }
  },

  async getDoctorAvailability(doctorId: string, date: string, serviceDurationMinutes = 60): Promise<DoctorAvailability> {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const dateString = selectedDate.toISOString().slice(0, 10);

    const { data: schedules, error: scheduleError } = await supabase
      .from('doctor_schedules')
      .select('start_time, end_time')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (scheduleError) throw new Error(scheduleError.message);

    const { data: booked, error: bookedError } = await supabase
      .from('appointments')
      .select('start_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', dateString)
      .neq('status', 'cancelled');

    if (bookedError) throw new Error(bookedError.message);

    const bookedSlots = new Set((booked || []).map((b: any) => b.start_time));

    const availableSlots: TimeSlot[] = [];
    const slotDuration = serviceDurationMinutes;

    for (const schedule of schedules || []) {
      const candidateSlots = buildTimeSlots(schedule.start_time, schedule.end_time, slotDuration);
      for (const candidate of candidateSlots) {
        if (bookedSlots.has(candidate.startTime)) continue;
        availableSlots.push(candidate);
      }
    }

    return { doctorId, date: dateString, slots: availableSlots };
  },
  async searchServiceIds(search: string): Promise<string[]> {
    const { data, error } = await supabase.from('services').select('id').ilike('name', `%${search}%`).limit(50);
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data.map((row: any) => row.id) : [];
  },

  async getServices(search?: string): Promise<AppointmentServiceOption[]> {
    let query: any = supabase.from('services').select('id, name, duration_minutes, price').order('name');
    if (search) query = query.ilike('name', `%${search}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return Array.isArray(data)
      ? data.map((row: any) => ({ id: row.id, name: row.name, durationMinutes: row.duration_minutes, price: Number(row.price) }))
      : [];
  }
};

export default appointmentsService;
