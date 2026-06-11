import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from './notifications.service';

export function useNotificationLogs(params?: any) {
  return useQuery(['notificationLogs', params], () => notificationsService.getNotificationLogs(params));
}

export function useRetryNotification() {
  const qc = useQueryClient();
  return useMutation((id: string) => notificationsService.retryNotification(id), {
    onSuccess: () => qc.invalidateQueries(['notificationLogs'])
  });
}

export function useTemplates() {
  return useQuery(['notificationTemplates'], () => notificationsService.getTemplates());
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation(({ id, updates }: any) => notificationsService.updateTemplate(id, updates), {
    onSuccess: () => qc.invalidateQueries(['notificationTemplates'])
  });
}

export function useWhatsAppConfig() {
  return useQuery(['whatsappConfig'], () => notificationsService.getWhatsAppConfig());
}

export function useSaveWhatsAppConfig() {
  const qc = useQueryClient();
  return useMutation((cfg: any) => notificationsService.saveWhatsAppConfig(cfg), { onSuccess: () => qc.invalidateQueries(['whatsappConfig']) });
}

export function useTestWhatsApp() {
  return useMutation(({ cfg, number }: any) => notificationsService.testWhatsApp(cfg, number));
}

export function useEmailConfig() {
  return useQuery(['emailConfig'], () => notificationsService.getEmailConfig());
}

export function useSaveEmailConfig() {
  const qc = useQueryClient();
  return useMutation((cfg: any) => notificationsService.saveEmailConfig(cfg), { onSuccess: () => qc.invalidateQueries(['emailConfig']) });
}

export function useTestEmail() {
  return useMutation(({ cfg, email }: any) => notificationsService.testEmail(cfg, email));
}

export function useBroadcast() {
  const qc = useQueryClient();
  return useMutation((payload: any) => notificationsService.broadcast(payload), { onSuccess: () => qc.invalidateQueries(['notificationLogs']) });
}

export default {};
