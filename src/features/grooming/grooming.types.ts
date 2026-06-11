export interface GroomingService {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
}

export interface GroomingRecord {
  id: string;
  petId: string;
  serviceId: string;
  groomerId?: string | null;
  scheduledAt: string;
  completedAt?: string | null;
  status: string;
  notes?: string | null;
  photoBeforeUrl?: string | null;
  photoAfterUrl?: string | null;
  createdAt: string;
}

export interface GroomingQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface GroomingServicePayload {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}

export interface GroomingRecordPayload {
  petId: string;
  serviceId: string;
  groomerId?: string;
  scheduledAt: string;
  notes?: string;
}
