import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import { posService } from '@/features/pos/pos.service';
import medicalRecordsService from '@/features/medical-records/medical-records.service';
import type {
  Cage,
  InpatientRecord,
  Observation,
  MedicationSchedule,
  InpatientQueryParams,
  InpatientCreatePayload,
  ObservationPayload,
  MedicationPayload
} from './inpatient.types';

function mapCage(record: any): Cage {
  return {
    id: record.id,
    name: record.name,
    cageType: record.cage_type,
    status: record.status,
    notes: record.notes,
    createdAt: record.created_at
  };
}

function mapInpatientRecord(record: any): InpatientRecord {
  return {
    id: record.id,
    petId: record.pet_id,
    cageId: record.cage_id,
    admittingDoctorId: record.admitting_doctor_id,
    admitDate: record.admit_date,
    dischargeDate: record.discharge_date,
    reason: record.reason,
    notes: record.notes,
    status: record.status,
    petName: record.pets?.name ?? null,
    doctorName: record.doctors?.profiles?.full_name ?? null,
    cageName: record.cages?.name ?? null,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

function mapObservation(record: any): Observation {
  return {
    id: record.id,
    inpatientRecordId: record.inpatient_record_id,
    temperature: record.temperature,
    appetite: record.appetite,
    weight: record.weight,
    condition: record.condition,
    notes: record.notes,
    observedBy: record.observed_by,
    observedAt: record.observed_at
  };
}

function mapMedicationSchedule(record: any): MedicationSchedule {
  return {
    id: record.id,
    inpatientRecordId: record.inpatient_record_id,
    drugName: record.drug_name,
    dose: record.dose,
    scheduleTime: record.schedule_time,
    givenAt: record.given_at,
    givenBy: record.given_by,
    status: record.status
  };
}

export const inpatientService = {
  async getCages(): Promise<Cage[]> {
    const { data, error } = await supabase.from('cages').select('id, name, cage_type, status, notes, created_at').order('name');
    if (error) handleSupabaseError(error);
    return (data || []).map(mapCage);
  },

  async searchPets(query: string): Promise<Array<{ id: string; name: string }>> {
    const q = query?.trim();
    const { data, error } = await supabase
      .from('pets')
      .select('id, name')
      .ilike('name', `%${q}%`)
      .limit(20);
    if (error) handleSupabaseError(error);
    return Array.isArray(data) ? data.map((pet: any) => ({ id: pet.id, name: pet.name })) : [];
  },

  async searchDoctors(query: string): Promise<Array<{ id: string; full_name: string }>> {
    const q = query?.trim();
    const { data, error } = await supabase
      .from('doctors')
      .select('id, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) handleSupabaseError(error);

    const providers = Array.isArray(data) ? data : [];
    const normalized = q?.toLowerCase() || '';
    const filtered = normalized
      ? providers.filter((doctor: any) => doctor.profiles?.full_name?.toLowerCase().includes(normalized))
      : providers;

    return filtered.map((doctor: any) => ({ id: doctor.id, full_name: doctor.profiles?.full_name ?? 'Doctor' }));
  },

  async getInpatientRecords({ page = 1, pageSize = 12, search, status }: InpatientQueryParams = {}): Promise<{ items: InpatientRecord[]; total: number }> {
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('inpatient_records')
      .select('id, pet_id, cage_id, admitting_doctor_id, admit_date, discharge_date, reason, notes, status, created_at, updated_at, pets(name), cages(name), doctors(profiles(full_name))', { count: 'exact' })
      .order('admit_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) {
      const term = `%${search}%`;
      query = query.or(`reason.ilike.${term},notes.ilike.${term}`);
    }

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) handleSupabaseError(res.error);
    const items = Array.isArray(res.data) ? res.data.map(mapInpatientRecord) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async createInpatientRecord(payload: InpatientCreatePayload): Promise<InpatientRecord> {
    const { data, error } = await supabase
      .from('inpatient_records')
      .insert({
        pet_id: payload.petId,
        cage_id: payload.cageId,
        admitting_doctor_id: payload.admittingDoctorId,
        admit_date: payload.admitDate,
        reason: payload.reason,
        notes: payload.notes,
        status: 'admitted'
      })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to admit inpatient');
    return mapInpatientRecord(data);
  },

  async admitPet(payload: InpatientCreatePayload): Promise<InpatientRecord> {
    return this.createInpatientRecord(payload);
  },

  async getInpatientRecordById(id: string): Promise<InpatientRecord | null> {
    const { data, error } = await supabase
      .from('inpatient_records')
      .select('id, pet_id, cage_id, admitting_doctor_id, admit_date, discharge_date, reason, notes, status, created_at, updated_at, pets(name), cages(name), doctors(profiles(full_name))')
      .eq('id', id)
      .single();
    if (error) handleSupabaseError(error);
    return data ? mapInpatientRecord(data) : null;
  },

  async getInpatientBill(inpatientRecordId: string) {
    const items = await posService.getInpatientPendingBill(inpatientRecordId);
    const total = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
    return { items, total };
  },

  async dischargePet(id: string, payload: { paymentMethod: string; paidAmount: number; notes?: string; dischargeDate?: string }) {
    if (payload.paidAmount < 0) {
      throw new Error('Paid amount must be a non-negative number');
    }

    const { data: recordData, error: recordError } = await supabase.from('inpatient_records').select('pet_id').eq('id', id).single();
    if (recordError) handleSupabaseError(recordError);
    if (!recordData) throw new Error('Inpatient record not found');

    const petId = recordData.pet_id;
    const { data: petData, error: petError } = await supabase.from('pets').select('customer_id').eq('id', petId).single();
    if (petError && petError.code !== 'PGRST116') handleSupabaseError(petError);

    const customerId = petData?.customer_id ?? null;
    const bill = await this.getInpatientBill(id);
    if (payload.paidAmount < bill.total) {
      throw new Error('Paid amount must cover the bill total');
    }

    const updatedRecord = await this.updateInpatientStatus(id, 'discharged', payload.dischargeDate ?? new Date().toISOString().slice(0, 10));
    await posService.createInvoice({
      customer_id: customerId,
      inpatient_record_id: id,
      subtotal: bill.total,
      discount_amount: 0,
      loyalty_points_used: 0,
      loyalty_discount_amount: 0,
      total: bill.total,
      payment_method: payload.paymentMethod as any,
      paid_amount: payload.paidAmount,
      change_amount: Math.max(0, payload.paidAmount - bill.total),
      status: 'paid',
      notes: payload.notes,
      items: bill.items.map((item) => ({
        item_type: item.itemType,
        reference_id: item.referenceId ?? null,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discountAmount,
        total: item.total
      }))
    });

    return updatedRecord;
  },

  async updateInpatientStatus(id: string, status: string, dischargeDate?: string): Promise<InpatientRecord> {
    const payload: any = { status };
    if (dischargeDate) payload.discharge_date = dischargeDate;
    const { data, error } = await supabase.from('inpatient_records').update(payload).eq('id', id).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to update inpatient status');
    return mapInpatientRecord(data);
  },

  async getObservations(inpatientRecordId: string): Promise<Observation[]> {
    const { data, error } = await supabase
      .from('daily_observations')
      .select('id, inpatient_record_id, temperature, appetite, weight, condition, notes, observed_by, observed_at')
      .eq('inpatient_record_id', inpatientRecordId)
      .order('observed_at', { ascending: false });
    if (error) handleSupabaseError(error);
    return (data || []).map(mapObservation);
  },

  async addObservation(payload: ObservationPayload): Promise<Observation> {
    const { data, error } = await supabase
      .from('daily_observations')
      .insert({
        inpatient_record_id: payload.inpatientRecordId,
        temperature: payload.temperature,
        appetite: payload.appetite,
        weight: payload.weight,
        condition: payload.condition,
        notes: payload.notes
      })
      .select()
      .single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to add observation');
    return mapObservation(data);
  },

  async getMedicationSchedules(inpatientRecordId: string): Promise<MedicationSchedule[]> {
    const { data, error } = await supabase
      .from('inpatient_medication_schedules')
      .select('id, inpatient_record_id, drug_name, dose, schedule_time, given_at, given_by, status')
      .eq('inpatient_record_id', inpatientRecordId)
      .order('schedule_time', { ascending: true });
    if (error) handleSupabaseError(error);
    return (data || []).map(mapMedicationSchedule);
  },

  async scheduleMedication(payload: MedicationPayload): Promise<MedicationSchedule> {
    const { data, error } = await supabase
      .from('inpatient_medication_schedules')
      .insert({
        inpatient_record_id: payload.inpatientRecordId,
        drug_name: payload.drugName,
        dose: payload.dose,
        schedule_time: payload.scheduleTime,
        status: payload.status
      })
      .select()
      .single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to schedule medication');
    return mapMedicationSchedule(data);
  },

  async addDailyObservation(inpatientRecordId: string, payload: { temperature?: number; appetite?: string; weight?: number; condition?: string; notes?: string }): Promise<Observation> {
    const { data, error } = await supabase
      .from('daily_observations')
      .insert({
        inpatient_record_id: inpatientRecordId,
        temperature: payload.temperature,
        appetite: payload.appetite,
        weight: payload.weight,
        condition: payload.condition,
        notes: payload.notes
      })
      .select()
      .single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to add daily observation');
    return mapObservation(data);
  },

  async addInpatientMedication(inpatientRecordId: string, payload: { drugName: string; dose: string; scheduleTime: string; notes?: string }): Promise<MedicationSchedule> {
    const { data, error } = await supabase
      .from('inpatient_medication_schedules')
      .insert({
        inpatient_record_id: inpatientRecordId,
        drug_name: payload.drugName,
        dose: payload.dose,
        schedule_time: payload.scheduleTime,
        status: 'pending'
      })
      .select()
      .single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to add medication');
    return mapMedicationSchedule(data);
  },

  async markMedicationGiven(medicationId: string): Promise<MedicationSchedule> {
    const { data, error } = await supabase
      .from('inpatient_medication_schedules')
      .update({ status: 'given', given_at: new Date().toISOString() })
      .eq('id', medicationId)
      .select()
      .single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to mark medication as given');
    return mapMedicationSchedule(data);
  }
};
