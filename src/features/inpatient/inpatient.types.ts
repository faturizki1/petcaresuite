export interface Cage {
  id: string;
  name: string;
  cageType?: string | null;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  notes?: string | null;
  createdAt: string;
}

export interface InpatientRecord {
  id: string;
  petId: string;
  cageId: string;
  admittingDoctorId: string;
  admitDate: string;
  dischargeDate?: string | null;
  reason?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Observation {
  id: string;
  inpatientRecordId: string;
  temperature?: number | null;
  appetite?: string | null;
  weight?: number | null;
  condition?: string | null;
  notes?: string | null;
  observedBy?: string | null;
  observedAt: string;
}

export interface MedicationSchedule {
  id: string;
  inpatientRecordId: string;
  drugName: string;
  dose: string;
  scheduleTime: string;
  givenAt?: string | null;
  givenBy?: string | null;
  status: string;
}

export interface InpatientQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface InpatientCreatePayload {
  petId: string;
  cageId: string;
  admittingDoctorId: string;
  admitDate: string;
  reason?: string;
  notes?: string;
}

export interface ObservationPayload {
  inpatientRecordId: string;
  temperature?: number;
  appetite?: string;
  weight?: number;
  condition?: string;
  notes?: string;
}

export interface MedicationPayload {
  inpatientRecordId: string;
  drugName: string;
  dose: string;
  scheduleTime: string;
  status: string;
}
