import { supabase } from '@/lib/supabase';
import type {
  MedicalRecord,
  MedicalRecordCreatePayload,
  MedicalRecordsQueryParams,
  Prescription,
  MedicalAttachment
} from './medical-records.types';

function mapPrescription(record: any): Prescription {
  return {
    id: record.id,
    medication: record.drug_name ?? record.medication,
    dosage: record.dose ?? record.dosage,
    frequency: record.instruction ?? record.frequency,
    duration: record.duration_days !== undefined && record.duration_days !== null ? String(record.duration_days) : record.duration ?? ''
  };
}

function mapAttachment(record: any): MedicalAttachment {
  return {
    id: record.id,
    filename: record.file_name ?? record.filename,
    url: record.file_url ?? record.url,
    uploadedAt: record.created_at ?? record.uploaded_at ?? record.uploadedAt
  };
}

function mapMedicalRecord(record: any): MedicalRecord {
  return {
    id: record.id,
    appointmentId: record.appointment_id || record.appointmentId || null,
    petId: record.pet_id || record.petId,
    petName: record.pets?.name ?? record.petName ?? null,
    doctorId: record.doctor_id || record.doctorId,
    doctorName: record.doctors?.profiles?.full_name ?? record.doctorName ?? null,
    recordType: record.record_type || record.recordType,
    date: record.date,
    notes: record.notes ?? null,
    soap: {
      subjective: record.subjective ?? record.soap?.subjective ?? '',
      objective: record.objective ?? record.soap?.objective ?? '',
      assessment: record.assessment ?? record.soap?.assessment ?? '',
      plan: record.plan ?? record.soap?.plan ?? ''
    },
    prescriptions: Array.isArray(record.prescriptions) ? record.prescriptions.map(mapPrescription) : [],
    attachments: Array.isArray(record.medical_attachments)
      ? record.medical_attachments.map(mapAttachment)
      : Array.isArray(record.attachments)
      ? record.attachments.map(mapAttachment)
      : []
  };
}

function mapSummaryRecord(record: any): MedicalRecord {
  return {
    id: record.id,
    appointmentId: record.appointment_id || record.appointmentId || null,
    petId: record.pet_id || record.petId,
    petName: record.pets?.name ?? record.petName ?? null,
    doctorId: record.doctor_id || record.doctorId,
    doctorName: record.doctors?.profiles?.full_name ?? record.doctorName ?? null,
    recordType: record.record_type || record.recordType,
    date: record.date,
    notes: record.notes ?? null,
    soap: record.soap || { subjective: '', objective: '', assessment: '', plan: '' },
    prescriptions: [],
    attachments: []
  };
}

export const medicalRecordsService = {
  async getMedicalRecords({ page = 1, pageSize = 20, search, petId, doctorId }: MedicalRecordsQueryParams = {}) {
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('medical_records')
      .select('id, appointment_id, pet_id, doctor_id, record_type, date, notes, pets(name), doctors(profiles(full_name))', { count: 'exact' })
      .order('date', { ascending: false });

    if (petId) query = query.eq('pet_id', petId);
    if (doctorId) query = query.eq('doctor_id', doctorId);
    if (search) {
      const term = `%${search}%`;
      query = query.or(`pets.name.ilike.${term},doctors.profiles.full_name.ilike.${term},record_type.ilike.${term},notes.ilike.${term}`);
    }

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);

    return {
      items: Array.isArray(res.data) ? res.data.map(mapSummaryRecord) : [],
      total: typeof res.count === 'number' ? res.count : (res.data || []).length
    };
  },

  async getMedicalRecordById(id: string): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*, prescriptions(*), medical_attachments(*), pets(name), doctors(profiles(full_name))')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data ? mapMedicalRecord(data) : null;
  },

  async createMedicalRecord(payload: MedicalRecordCreatePayload): Promise<MedicalRecord> {
    const { prescriptions = [], attachments = [], appointmentId, recordType, notes, ...recordPayload } = payload;
    const { data: record, error } = await supabase
      .from('medical_records')
      .insert({
        appointment_id: appointmentId ?? null,
        pet_id: recordPayload.petId,
        doctor_id: recordPayload.doctorId,
        date: recordPayload.date,
        record_type: recordType,
        subjective: recordPayload.soap.subjective,
        objective: recordPayload.soap.objective,
        assessment: recordPayload.soap.assessment,
        plan: recordPayload.soap.plan,
        notes: notes ?? null
      })
      .select()
      .single();

    if (error || !record) throw new Error(error?.message || 'Unable to create medical record');

    if (appointmentId) {
      await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId);
    }

    if (prescriptions.length) {
      await this.insertPrescriptions(record.id, prescriptions);
    }

    for (const attachment of attachments) {
      if (attachment instanceof File) {
        await this.uploadAttachment(record.id, attachment);
      } else {
        await this.insertAttachments(record.id, [attachment]);
      }
    }

    const created = await this.getMedicalRecordById(record.id);
    if (!created) throw new Error('Unable to retrieve new medical record');
    return created;
  },

  async updateMedicalRecord(id: string, updates: any) {
    const transformed: any = {
      ...(updates.petId !== undefined ? { pet_id: updates.petId } : {}),
      ...(updates.doctorId !== undefined ? { doctor_id: updates.doctorId } : {}),
      ...(updates.date !== undefined ? { date: updates.date } : {}),
      ...(updates.recordType !== undefined ? { record_type: updates.recordType } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {})
    };

    if (updates.soap) {
      transformed.subjective = updates.soap.subjective;
      transformed.objective = updates.soap.objective;
      transformed.assessment = updates.soap.assessment;
      transformed.plan = updates.soap.plan;
    }

    const { data, error } = await supabase.from('medical_records').update(transformed).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data ? mapMedicalRecord(data) : null;
  },

  async addPrescription(recordId: string, prescription: Omit<Prescription, 'id'>) {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({ medical_record_id: recordId, ...prescription })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapPrescription(data);
  },

  async removePrescription(id: string) {
    const { error } = await supabase.from('prescriptions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  async uploadAttachment(recordId: string, file: File | { name: string; url: string }) {
    let fileUrl = '';
    let fileName = '';
    let fileType = '';

    if (file instanceof File) {
      const path = `${recordId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('medical-attachments').upload(path, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw new Error(uploadError.message);
      fileUrl = path;
      fileName = file.name;
      fileType = file.type || 'application/octet-stream';
    } else {
      fileUrl = file.url;
      fileName = file.name;
      fileType = 'application/octet-stream';
    }

    const { data, error } = await supabase
      .from('medical_attachments')
      .insert({ medical_record_id: recordId, file_url: fileUrl, file_name: fileName, file_type: fileType })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapAttachment({
      id: data.id,
      filename: data.file_name,
      url: data.file_url,
      uploaded_at: data.created_at
    });
  },

  async removeAttachment(id: string) {
    const { error } = await supabase.from('medical_attachments').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  async insertPrescriptions(recordId: string, prescriptions: Array<Omit<Prescription, 'id'>>) {
    const rows = prescriptions.map((prescription) => ({
      medical_record_id: recordId,
      drug_name: prescription.medication,
      dose: prescription.dosage,
      instruction: prescription.frequency,
      duration_days: Number(prescription.duration) || 0
    }));
    const { error } = await supabase.from('prescriptions').insert(rows);
    if (error) throw new Error(error.message);
    return true;
  },

  async insertAttachments(recordId: string, attachments: Array<Omit<MedicalAttachment, 'id' | 'uploadedAt'>>) {
    const rows = attachments.map((attachment) => ({
      medical_record_id: recordId,
      file_name: attachment.filename,
      file_url: attachment.url,
      file_type: 'application/octet-stream'
    }));
    const { error } = await supabase.from('medical_attachments').insert(rows);
    if (error) throw new Error(error.message);
    return true;
  }
};

export default medicalRecordsService;
