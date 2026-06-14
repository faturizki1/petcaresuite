import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groomingService } from './grooming.service';
import type { GroomingQueryParams, GroomingServicePayload, GroomingRecordPayload } from './grooming.types';

export function useGroomingServices() {
  return useQuery(['groomingServices'], () => groomingService.getServices());
}

export function useGroomingRecords(params: GroomingQueryParams) {
  return useQuery(['groomingRecords', params], () => groomingService.getRecords(params), { keepPreviousData: true });
}

export function useCreateGroomingService() {
  const qc = useQueryClient();
  return useMutation((payload: GroomingServicePayload) => groomingService.createService(payload), {
    onSuccess: () => qc.invalidateQueries(['groomingServices'])
  });
}

export function useCreateGroomingRecord() {
  const qc = useQueryClient();
  return useMutation((payload: GroomingRecordPayload) => groomingService.createRecord(payload), {
    onSuccess: () => qc.invalidateQueries(['groomingRecords'])
  });
}

export function useCompleteGrooming() {
  const qc = useQueryClient();
  return useMutation(({ id, payload }: { id: string; payload: { completedAt: string; photoBeforeUrl?: string | null; photoAfterUrl?: string | null; notes?: string } }) => groomingService.completeGrooming(id, payload), {
    onSuccess: () => qc.invalidateQueries(['groomingRecords'])
  });
}

export function useUpdateGroomingStatus() {
  const qc = useQueryClient();
  return useMutation(({ id, status }: { id: string; status: string }) => groomingService.updateGroomingStatus(id, status), {
    onSuccess: () => qc.invalidateQueries(['groomingRecords'])
  });
}

export function useToggleGroomingService() {
  const qc = useQueryClient();
  return useMutation(({ id, isActive }: { id: string; isActive: boolean }) => groomingService.toggleGroomingService(id, isActive), {
    onSuccess: () => qc.invalidateQueries(['groomingServices'])
  });
}

export function useUpdateGroomingService() {
  const qc = useQueryClient();
  return useMutation(({ id, payload }: { id: string; payload: GroomingServicePayload }) => groomingService.updateGroomingService(id, payload), {
    onSuccess: () => qc.invalidateQueries(['groomingServices'])
  });
}

export function useTodaySchedule() {
  return useQuery(['groomingTodaySchedule'], () => groomingService.getTodaySchedule());
}
