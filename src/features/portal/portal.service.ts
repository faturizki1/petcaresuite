import { supabase } from '@/lib/supabase';
import { AppError, handleSupabaseError } from '@/lib/error';
import type { PortalCustomer, PortalPet, PortalAppointment, PortalInvoice, PortalSummary } from './portal.types';

export const portalService = {
  async getCustomerByProfileId(profileId: string): Promise<PortalCustomer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, email, whatsapp, status, loyalty_points, registration_date')
      .eq('profile_id', profileId)
      .single();

    if (error) handleSupabaseError(error);
    if (!data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email ?? null,
      whatsapp: data.whatsapp ?? null,
      status: data.status,
      loyaltyPoints: data.loyalty_points,
      registeredAt: data.registration_date
    };
  },

  async getCustomerIdByProfileId(profileId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (error) handleSupabaseError(error);
    return data?.id ?? null;
  },

  async getPetsForCustomer(customerId: string): Promise<PortalPet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('id, name, photo_url, species(name), breeds(name)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);

    return (data || []).map((item: any) => {
      const speciesArr = item.species as Array<{ name: string }> | null;
      const breedArr = item.breeds as Array<{ name: string }> | null;
      return {
        id: item.id,
        name: item.name,
        species: speciesArr?.[0]?.name ?? 'Unknown',
        breed: breedArr?.[0]?.name ?? 'Unknown',
        photoUrl: item.photo_url ?? null
      };
    });
  },

  async getPetForCustomer(customerId: string, petId: string): Promise<PortalPet | null> {
    const { data, error } = await supabase
      .from('pets')
      .select('id, name, photo_url, species(name), breeds(name)')
      .eq('customer_id', customerId)
      .eq('id', petId)
      .single();

    if (error) handleSupabaseError(error);
    if (!data) return null;

    const speciesArr = data.species as Array<{ name: string }> | null;
    const breedArr = data.breeds as Array<{ name: string }> | null;
    return {
      id: data.id,
      name: data.name,
      species: speciesArr?.[0]?.name ?? 'Unknown',
      breed: breedArr?.[0]?.name ?? 'Unknown',
      photoUrl: data.photo_url ?? null
    };
  },

  async getMyPetById(petId: string): Promise<PortalPet> {
    const { data, error } = await supabase
      .from('pets')
      .select('id, name, photo_url, birth_date, weight, is_sterilized, species(name), breeds(name), customer_id')
      .eq('id', petId)
      .single();

    if (error) handleSupabaseError(error);
    if (!data) throw new AppError('Pet not found', 'PGRST116');

    const currentUserId = await this.getCurrentUserId();
    const customerCheck = await supabase
      .from('customers')
      .select('id')
      .eq('id', data.customer_id)
      .eq('profile_id', currentUserId)
      .single();

    if (customerCheck.error) handleSupabaseError(customerCheck.error);
    if (!customerCheck.data) throw new AppError('You do not have access to this pet', 'FORBIDDEN');

    const speciesArr = data.species as Array<{ name: string }> | null;
    const breedArr = data.breeds as Array<{ name: string }> | null;
    return {
      id: data.id,
      name: data.name,
      species: speciesArr?.[0]?.name ?? 'Unknown',
      breed: breedArr?.[0]?.name ?? 'Unknown',
      photoUrl: data.photo_url ?? null
    };
  },

  async getMyPetMedicalRecords(petId: string) {
    const { data, error } = await supabase
      .from('medical_records')
      .select('id, record_type, doctor_name, assessment, created_at')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getMyPetVaccinations(petId: string) {
    const { data, error } = await supabase
      .from('vaccination_records')
      .select('id, vaccinated_at, next_due_date, status, vaccines(name)')
      .eq('pet_id', petId)
      .order('vaccinated_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getMyPetWeightHistory(petId: string) {
    const { data, error } = await supabase
      .from('weight_records')
      .select('id, recorded_at, weight')
      .eq('pet_id', petId)
      .order('recorded_at', { ascending: true });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getMyPetMedications(petId: string) {
    const { data, error } = await supabase
      .from('medication_schedules')
      .select('id, drug_name, dose, schedule_time, status, pet_id')
      .eq('pet_id', petId)
      .eq('is_active', true);

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async logMyPetMedication(scheduleId: string, status: string, notes?: string) {
    const schedule = await supabase
      .from('medication_schedules')
      .select('id, pet_id')
      .eq('id', scheduleId)
      .single();

    if (schedule.error) handleSupabaseError(schedule.error);
    if (!schedule.data) throw new AppError('Medication schedule not found', 'PGRST116');

    const currentUserId = await this.getCurrentUserId();
    const customerCheck = await supabase
      .from('pets')
      .select('id')
      .eq('id', schedule.data.pet_id)
      .eq('customer_id', currentUserId)
      .single();

    if (customerCheck.error) handleSupabaseError(customerCheck.error);
    if (!customerCheck.data) throw new AppError('You do not have access to this schedule', 'FORBIDDEN');

    const { data, error } = await supabase
      .from('medication_logs')
      .insert({ medication_schedule_id: scheduleId, status, notes })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async uploadOwnerPhoto(petId: string, file: File, note: string) {
    const petResult = await supabase
      .from('pets')
      .select('id, customer_id')
      .eq('id', petId)
      .single();

    if (petResult.error) handleSupabaseError(petResult.error);
    if (!petResult.data) throw new AppError('Pet not found', 'PGRST116');

    const currentUserId = await this.getCurrentUserId();
    const customerCheck = await supabase
      .from('customers')
      .select('id')
      .eq('id', petResult.data.customer_id)
      .eq('profile_id', currentUserId)
      .single();

    if (customerCheck.error) handleSupabaseError(customerCheck.error);
    if (!customerCheck.data) throw new AppError('You do not have access to this pet', 'FORBIDDEN');

    const filePath = `${petId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('owner-uploads').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (uploadError) handleSupabaseError(uploadError);

    const { data: signedUrlData, error: urlError } = await supabase.storage.from('owner-uploads').createSignedUrl(filePath, 60 * 60);
    if (urlError) handleSupabaseError(urlError);
    if (!signedUrlData?.signedUrl) throw new AppError('Unable to generate upload URL', 'UPLOAD_FAILED');

    const { data, error } = await supabase
      .from('owner_uploads')
      .insert({ pet_id: petId, customer_id: customerCheck.data.id, photo_url: signedUrlData.signedUrl, note })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async getMyInpatientRecords() {
    const currentCustomerId = await this.getCurrentCustomerId();
    const petIds = await this.getCustomerPetIds(currentCustomerId);
    const { data, error } = await supabase
      .from('inpatient_records')
      .select('id, pet_id, status, admit_date, discharge_date, cage_id, total_bill, pets(name), cages(name), admitting_doctor_id')
      .in('pet_id', petIds)
      .order('admit_date', { ascending: false });

    if (error) handleSupabaseError(error);
    return (data || []).map((record: any) => ({
      ...record,
      petName: record.pets?.name ?? 'Unknown',
      cageName: record.cages?.name ?? 'Unknown',
      daysAdmitted: record.admit_date ? Math.max(0, Math.floor((new Date().getTime() - new Date(record.admit_date).getTime()) / (1000 * 60 * 60 * 24))) : 0,
      latestObservationDate: null,
      totalBill: Number(record.total_bill ?? 0)
    }));
  },

  async getMyInpatientObservations(inpatientRecordId: string) {
    const { data, error } = await supabase
      .from('daily_observations')
      .select('id, inpatient_record_id, temperature, appetite, weight, condition, notes, observed_at')
      .eq('inpatient_record_id', inpatientRecordId)
      .order('observed_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getMyGroomingRecords() {
    const currentCustomerId = await this.getCurrentCustomerId();
    const petIds = await this.getCustomerPetIds(currentCustomerId);
    const { data, error } = await supabase
      .from('grooming_records')
      .select('id, pet_id, service_id, scheduled_at, completed_at, status, notes, photo_before_url, photo_after_url, pets(name), grooming_services(name)')
      .in('pet_id', petIds)
      .order('scheduled_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return (data || []).map((record: any) => ({
      id: record.id,
      petName: record.pets?.name ?? 'Unknown',
      serviceName: record.grooming_services?.name ?? 'Unknown',
      scheduledAt: record.scheduled_at,
      completedAt: record.completed_at,
      status: record.status,
      notes: record.notes,
      photoBeforeUrl: record.photo_before_url ?? null,
      photoAfterUrl: record.photo_after_url ?? null
    }));
  },

  async getMyNotifications() {
    const currentUserId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('notification_logs')
      .select('id, channel, template_key, payload, status, sent_at, read_at')
      .eq('user_id', currentUserId)
      .order('sent_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async markAllNotificationsRead() {
    const currentUserId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('notification_logs')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', currentUserId)
      .is('read_at', null);

    if (error) handleSupabaseError(error);
  },

  async updateMyProfile(data: { fullName: string; whatsapp: string; address: string }) {
    const currentUserId = await this.getCurrentUserId();
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .update({ full_name: data.fullName, whatsapp: data.whatsapp, address: data.address })
      .eq('profile_id', currentUserId)
      .select()
      .single();

    if (custError) handleSupabaseError(custError);
    if (!customer) throw new AppError('Unable to update profile', 'UPDATE_FAILED');

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: data.fullName })
      .eq('id', currentUserId);

    if (profileError) handleSupabaseError(profileError);
    return customer;
  },

  async updateMyPassword(currentPassword: string, newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) handleSupabaseError(error);
    return true;
  },

  async getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error) handleSupabaseError(error);
    if (!data?.user?.id) throw new AppError('Unable to determine authenticated user', 'AUTH_REQUIRED');
    return data.user.id;
  },

  async getCustomerPetIds(customerId: string): Promise<string[]> {
    if (!customerId) return [];
    const { data, error } = await supabase
      .from('pets')
      .select('id')
      .eq('customer_id', customerId);
    if (error) handleSupabaseError(error);
    return (data || []).map((item: any) => item.id);
  },
  
  async getCurrentCustomerId(): Promise<string> {
    const currentUserId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', currentUserId)
      .single();
    if (error) handleSupabaseError(error);
    if (!data?.id) throw new AppError('Customer record not found', 'NOT_FOUND');
    return data.id;
  },
  async getUpcomingAppointments(customerId: string): Promise<PortalAppointment[]> {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('appointments')
      .select('id, appointment_date, start_time, end_time, status, services(name), doctors(profiles(full_name))')
      .eq('customer_id', customerId)
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .limit(10);

    if (error) handleSupabaseError(error);

    return (data || []).map((item: any) => ({
      id: item.id,
      service: item.services?.name ?? 'Service',
      appointmentDate: item.appointment_date,
      startTime: item.start_time,
      endTime: item.end_time,
      status: item.status,
      doctorName: item.doctors?.profiles?.full_name ?? null
    }));
  },

  async getInvoicesForCustomer(customerId: string): Promise<PortalInvoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, total, status, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) handleSupabaseError(error);

    return (data || []).map((invoice: any) => ({
      id: invoice.id,
      total: Number(invoice.total ?? 0),
      status: invoice.status,
      createdAt: invoice.created_at
    }));
  },

  async getPortalSummary(customerId: string): Promise<PortalSummary> {
    const [petResult, appointmentResult, invoiceResult] = await Promise.all([
      supabase.from('pets').select('id', { count: 'exact' }).eq('customer_id', customerId),
      supabase.from('appointments').select('id', { count: 'exact' }).eq('customer_id', customerId),
      supabase.from('invoices').select('id', { count: 'exact' }).eq('customer_id', customerId)
    ]);

    if (petResult.error) handleSupabaseError(petResult.error);
    if (appointmentResult.error) handleSupabaseError(appointmentResult.error);
    if (invoiceResult.error) handleSupabaseError(invoiceResult.error);

    return {
      petCount: petResult.count ?? 0,
      appointmentCount: appointmentResult.count ?? 0,
      invoiceCount: invoiceResult.count ?? 0
    };
  }
  ,
  async getMyVaccinationsDue(customerId: string) {
    const { data, error } = await supabase
      .from('vaccination_reminders')
      .select('id, remind_at, status, vaccination_record_id, vaccination_records(pet_id, vaccine_id, pets(name), vaccines(name))')
      .eq('status', 'pending')
      .lte('remind_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('remind_at', { ascending: true });

    if (error) handleSupabaseError(error);

    const petIds = await this.getCustomerPetIds(customerId);
    const petIdSet = new Set(petIds);

    return (data || [])
      .filter((r: any) => {
        const petId = r.vaccination_records?.pet_id;
        return petId && petIdSet.has(petId);
      })
      .map((r: any) => ({
        id: r.id,
        petName: r.vaccination_records?.pets?.name ?? 'Unknown',
        vaccineName: r.vaccination_records?.vaccines?.name ?? 'Unknown',
        dueDate: r.remind_at,
        status: r.status
      }));
  },

  async getMyTodayMedications(customerId: string) {
    const petIds = await this.getCustomerPetIds(customerId);
    if (!petIds.length) return [];

    const { data, error } = await supabase
      .from('medication_schedules')
      .select('id, drug_name, dose, schedule_time, status, pet_id, pets(name)')
      .in('pet_id', petIds)
      .eq('is_active', true);

    if (error) handleSupabaseError(error);
    return (data || []).map((ms: any) => ({
      id: ms.id,
      petName: ms.pets?.name ?? 'Unknown',
      drugName: ms.drug_name,
      dose: ms.dose,
      scheduleTime: ms.schedule_time,
      status: ms.status
    }));
  },

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    // ensure appointment belongs to current customer
    const customerId = await this.getCurrentCustomerId();
    const { data: appt, error: fetchErr } = await supabase.from('appointments').select('id, customer_id').eq('id', appointmentId).single();
    if (fetchErr) handleSupabaseError(fetchErr);
    if (!appt || appt.customer_id !== customerId) throw new AppError('Appointment not found or not owned by current customer', 'NOT_FOUND');

    const { data, error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId).select().single();
    if (error) handleSupabaseError(error);
    return true;
  }
};
