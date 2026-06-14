import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inpatientService } from './inpatient.service';
import type { InpatientCreatePayload, InpatientQueryParams, ObservationPayload, MedicationPayload } from './inpatient.types';

export function useCages() {
  return useQuery(['cages'], () => inpatientService.getCages());
}

export function useInpatientRecords(params: InpatientQueryParams) {
  return useQuery(['inpatientRecords', params], () => inpatientService.getInpatientRecords(params), { keepPreviousData: true });
}

export function useInpatientRecord(id?: string) {
  return useQuery(['inpatientRecord', id], () => (id ? inpatientService.getInpatientRecordById(id) : null), {
    enabled: !!id
  });
}

export function useCreateInpatientRecord() {
  const qc = useQueryClient();
  return useMutation((payload: InpatientCreatePayload) => inpatientService.createInpatientRecord(payload), {
    onSuccess: () => qc.invalidateQueries(['inpatientRecords'])
  });
}

export function useUpdateInpatientStatus() {
  const qc = useQueryClient();
  return useMutation(({ id, status, dischargeDate }: any) => inpatientService.updateInpatientStatus(id, status, dischargeDate), {
    onSuccess: (_data, variables) => {
      qc.invalidateQueries(['inpatientRecord', variables.id]);
      qc.invalidateQueries(['inpatientRecords']);
    }
  });
}

export function useObservations(inpatientRecordId?: string) {
  return useQuery(['observations', inpatientRecordId], () => (inpatientRecordId ? inpatientService.getObservations(inpatientRecordId) : []), {
    enabled: !!inpatientRecordId
  });
}

export function useMedicationSchedules(inpatientRecordId?: string) {
  return useQuery(['medicationSchedules', inpatientRecordId], () => (inpatientRecordId ? inpatientService.getMedicationSchedules(inpatientRecordId) : []), {
    enabled: !!inpatientRecordId
  });
}

export function useAddObservation() {
  const qc = useQueryClient();
  return useMutation((payload: ObservationPayload) => inpatientService.addObservation(payload), {
    onSuccess: (_data, variables) => {
      qc.invalidateQueries(['observations', variables.inpatientRecordId]);
    }
  });
}

export function useScheduleMedication() {
  const qc = useQueryClient();
  return useMutation((payload: MedicationPayload) => inpatientService.scheduleMedication(payload), {
    onSuccess: (_data, variables) => {
      qc.invalidateQueries(['medicationSchedules', variables.inpatientRecordId]);
    }
  });
}

export function useInpatientBill(inpatientRecordId?: string) {
  return useQuery(['inpatientBill', inpatientRecordId], () => (inpatientRecordId ? inpatientService.getInpatientBill(inpatientRecordId) : null), {
    enabled: !!inpatientRecordId
  });
}

export function useAddDailyObservation() {
  const qc = useQueryClient();
  return useMutation(
    ({ inpatientRecordId, payload }: { inpatientRecordId: string; payload: { temperature?: number; appetite?: string; weight?: number; condition?: string; notes?: string } }) =>
      inpatientService.addDailyObservation(inpatientRecordId, payload),
    {
      onSuccess: (_data, variables) => {
        qc.invalidateQueries(['observations', variables.inpatientRecordId]);
      }
    }
  );
}

export function useAddInpatientMedication() {
  const qc = useQueryClient();
  return useMutation(
    ({ inpatientRecordId, payload }: { inpatientRecordId: string; payload: { drugName: string; dose: string; scheduleTime: string; notes?: string } }) =>
      inpatientService.addInpatientMedication(inpatientRecordId, payload),
    {
      onSuccess: (_data, variables) => {
        qc.invalidateQueries(['medicationSchedules', variables.inpatientRecordId]);
      }
    }
  );
}

export function useMarkMedicationGiven() {
  const qc = useQueryClient();
  return useMutation(
    (medicationId: string) => inpatientService.markMedicationGiven(medicationId),
    {
      onSuccess: () => {
        qc.invalidateQueries(['medicationSchedules']);
      }
    }
  );
}
