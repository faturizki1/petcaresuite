export interface SOAPData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface MedicalAttachment {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId?: string | null;
  petId: string;
  petName?: string | null;
  doctorId: string;
  doctorName?: string | null;
  recordType?: string;
  date: string;
  notes?: string | null;
  soap: SOAPData;
  prescriptions: Prescription[];
  attachments: MedicalAttachment[];
}

export interface MedicalRecordCreatePayload {
  appointmentId?: string | null;
  petId: string;
  doctorId: string;
  recordType: string;
  date: string;
  notes?: string;
  soap: SOAPData;
  prescriptions?: Array<Omit<Prescription, 'id'>>;
  attachments?: Array<File | Omit<MedicalAttachment, 'id' | 'uploadedAt'>>;
}

export interface MedicalRecordsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  petId?: string;
  doctorId?: string;
}
