import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from './settings.service';

export function useClinicProfile() {
  return useQuery(['clinicProfile'], () => settingsService.getClinicProfile());
}

export function useUpdateClinicProfile() {
  const qc = useQueryClient();
  return useMutation((profile: any) => settingsService.updateClinicProfile(profile), { onSuccess: () => qc.invalidateQueries(['clinicProfile']) });
}

export function useBusinessHours() {
  return useQuery(['businessHours'], () => settingsService.getBusinessHours());
}

export function useUpdateBusinessHours() {
  const qc = useQueryClient();
  return useMutation((hours: any) => settingsService.updateBusinessHours(hours), { onSuccess: () => qc.invalidateQueries(['businessHours']) });
}

export function useInvoiceSettings() {
  return useQuery(['invoiceSettings'], () => settingsService.getInvoiceSettings());
}

export function useUpdateInvoiceSettings() {
  const qc = useQueryClient();
  return useMutation((settings: any) => settingsService.updateInvoiceSettings(settings), { onSuccess: () => qc.invalidateQueries(['invoiceSettings']) });
}

export function useAuditLogs(params?: any) {
  return useQuery(['auditLogs', params], () => settingsService.getAuditLogs(params));
}

export default {};
