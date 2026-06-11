import { supabase } from '@/lib/supabase';
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
    if (error) throw new Error(error.message);
    return (data || []).map(mapCage);
  },

  async getInpatientRecords({ page = 1, pageSize = 12, search, status }: InpatientQueryParams = {}): Promise<{ items: InpatientRecord[]; total: number }> {
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('inpatient_records')
      .select('id, pet_id, cage_id, admitting_doctor_id, admit_date, discharge_date, reason, status, created_at, updated_at', { count: 'exact' })
      .order('admit_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) {
      const term = `%${search}%`;
      query = query.or(`pet_id.ilike.${term},reason.ilike.${term}`);
    }

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    const items = Array.isArray(res.data) ? res.data.map(mapInpatientRecord) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async getInpatientRecordById(id: string): Promise<InpatientRecord | null> {
    const { data, error } = await supabase
      .from('inpatient_records')
      .select('id, pet_id, cage_id, admitting_doctor_id, admit_date, discharge_date, reason, notes, status, created_at, updated_at')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data ? mapInpatientRecord(data) : null;
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

    if (error || !data) throw new Error(error?.message || 'Unable to admit inpatient');
    return mapInpatientRecord(data);
  },

  async updateInpatientStatus(id: string, status: string, dischargeDate?: string): Promise<InpatientRecord> {
    const payload: any = { status };
    if (dischargeDate) payload.discharge_date = dischargeDate;
    const { data, error } = await supabase.from('inpatient_records').update(payload).eq('id', id).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to update inpatient status');
    const updated = mapInpatientRecord(data);

    // If discharged, create invoice linking this inpatient record
    if (status === 'discharged') {
      // gather potential billable items: medication schedules and prescriptions
      let invoiceItems: Array<any> = [];

      try {
        const medSchedules = await this.getMedicationSchedules(id);
        const medScheduleItems = (medSchedules || []).map((ms) => ({
          itemType: 'medication_schedule',
          referenceId: ms.id,
          name: `${ms.drugName} (medication)`,
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          total: 0
        }));
        invoiceItems = invoiceItems.concat(medScheduleItems);
      } catch (_) {
        // ignore failures fetching medication schedules — proceed with invoice creation
      }

      // gather prescriptions from recent medical records of the pet
      try {
        if (updated.petId) {
          const records = await medicalRecordsService.getMedicalRecords({ page: 1, pageSize: 100, petId: updated.petId });
          for (const rec of records.items) {
            try {
              const full = await medicalRecordsService.getMedicalRecordById(rec.id);
              if (full && Array.isArray(full.prescriptions)) {
                const presItems = full.prescriptions.map((p: any) => ({
                  itemType: 'prescription',
                  referenceId: rec.id,
                  name: `${p.medication} (prescription)`,
                  quantity: 1,
                  unitPrice: 0,
                  discount: 0,
                  total: 0
                }));
                invoiceItems = invoiceItems.concat(presItems);
              }
            } catch (_) {
              // ignore individual medical record fetch failures
            }
          }
        }
      } catch (_) {
        // ignore failures fetching medical records
      }

      // always include a placeholder inpatient stay line
      invoiceItems.unshift({
        itemType: 'inpatient_record',
        referenceId: id,
        name: `Inpatient stay - ${id}`,
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0
      });

      try {
        const createdInvoice = await posService.createInvoice({
          inpatientRecordId: id,
          subtotal: 0,
          discountAmount: 0,
          loyaltyPointsUsed: 0,
          total: 0,
          paymentMethod: 'Cash',
          paidAmount: 0,
          changeAmount: 0,
          status: 'pending',
          notes: `Auto-generated invoice for inpatient discharge ${id}`,
          items: invoiceItems
        });

        // record audit log for auto-created invoice
        try {
          await supabase.from('audit_logs').insert({
            user_id: null,
            action: 'auto_create_invoice',
            table_name: 'invoices',
            record_id: createdInvoice.id,
            old_value: null,
            new_value: JSON.stringify(createdInvoice),
            ip_address: null
          });
        } catch (_) {
          // non-fatal
        }
      } catch (err) {
        throw new Error((err as Error).message || 'Unable to create invoice for discharged inpatient');
      }
    }

    return updated;
  },

  async getObservations(inpatientRecordId: string): Promise<Observation[]> {
    const { data, error } = await supabase
      .from('daily_observations')
      .select('id, inpatient_record_id, temperature, appetite, weight, condition, notes, observed_by, observed_at')
      .eq('inpatient_record_id', inpatientRecordId)
      .order('observed_at', { ascending: false });
    if (error) throw new Error(error.message);
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
    if (error || !data) throw new Error(error?.message || 'Unable to add observation');
    return mapObservation(data);
  },

  async getMedicationSchedules(inpatientRecordId: string): Promise<MedicationSchedule[]> {
    const { data, error } = await supabase
      .from('inpatient_medication_schedules')
      .select('id, inpatient_record_id, drug_name, dose, schedule_time, given_at, given_by, status')
      .eq('inpatient_record_id', inpatientRecordId)
      .order('schedule_time', { ascending: true });
    if (error) throw new Error(error.message);
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
    if (error || !data) throw new Error(error?.message || 'Unable to schedule medication');
    return mapMedicationSchedule(data);
  }
};
