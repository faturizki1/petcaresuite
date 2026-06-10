import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalRecordsService } from './medical-records.service';
import type { MedicalRecordsQueryParams, MedicalRecordCreatePayload } from './medical-records.types';

export function useMedicalRecords(params: MedicalRecordsQueryParams) {
  return useQuery(['medicalRecords', params], () => medicalRecordsService.getMedicalRecords(params), {
    keepPreviousData: true
  });
}

export function useMedicalRecord(id?: string) {
  return useQuery(['medicalRecord', id], () => (id ? medicalRecordsService.getMedicalRecordById(id) : null), {
    enabled: !!id
  });
}

export function useCreateMedicalRecord() {
  const qc = useQueryClient();
  return useMutation((payload: MedicalRecordCreatePayload) => medicalRecordsService.createMedicalRecord(payload), {
    onSuccess: () => qc.invalidateQueries(['medicalRecords'])
  });
}

export function useAddPrescription() {
  const qc = useQueryClient();
  return useMutation(
    ({ recordId, prescription }: { recordId: string; prescription: any }) => medicalRecordsService.addPrescription(recordId, prescription),
    {
      onSuccess: (_data, variables) => qc.invalidateQueries(['medicalRecord', variables.recordId])
    }
  );
}

export function useRemovePrescription() {
  const qc = useQueryClient();
  return useMutation((id: string) => medicalRecordsService.removePrescription(id), {
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicalRecord'] })
  });
}

export function useUploadAttachment() {
  const qc = useQueryClient();
  return useMutation(
    ({ recordId, file }: { recordId: string; file: { name: string; url: string } }) => medicalRecordsService.uploadAttachment(recordId, file),
    {
      onSuccess: (_data, variables) => qc.invalidateQueries(['medicalRecord', variables.recordId])
    }
  );
}

export function useRemoveAttachment() {
  const qc = useQueryClient();
  return useMutation((id: string) => medicalRecordsService.removeAttachment(id), {
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicalRecord'] })
  });
}
