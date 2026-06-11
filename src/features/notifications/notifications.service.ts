import { supabase } from '@/lib/supabase';
import type { NotificationLog, NotificationTemplate, WhatsAppConfig, EmailConfig } from './notifications.types';

export const notificationsService = {
  async getNotificationLogs({ page = 1, pageSize = 20, search, channel }: any = {}): Promise<{ items: NotificationLog[]; total: number }> {
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('notifications_log').select('*', { count: 'exact' }).order('sent_at', { ascending: false });
    if (channel) query = query.eq('channel', channel);
    if (search) query = query.or(`recipient.ilike.%${search}%,template_key.ilike.%${search}%`);
    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    return { items: (res.data || []) as NotificationLog[], total: typeof res.count === 'number' ? res.count : (res.data || []).length };
  },

  async retryNotification(id: string) {
    // mark pending and re-invoke edge function if available
    const { data, error } = await supabase.from('notifications_log').select('*').eq('id', id).single();
    if (error || !data) throw new Error(error?.message || 'Notification not found');

    await supabase.from('notifications_log').update({ status: 'pending', error_message: null }).eq('id', id);

    try {
      // attempt to call edge function send-whatsapp or send-email depending on channel
      if (data.channel === 'whatsapp') {
        await supabase.functions.invoke('send-whatsapp', { body: { logId: id } as any } as any);
      } else if (data.channel === 'email') {
        await supabase.functions.invoke('send-email', { body: { logId: id } as any } as any);
      }
      return true;
    } catch (err) {
      await supabase.from('notifications_log').update({ status: 'failed', error_message: (err as Error).message }).eq('id', id);
      throw err;
    }
  },

  async getTemplates(): Promise<NotificationTemplate[]> {
    const { data, error } = await supabase.from('notification_templates').select('*').order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as NotificationTemplate[];
  },

  async updateTemplate(id: string, updates: Partial<NotificationTemplate>) {
    const { data, error } = await supabase.from('notification_templates').update(updates).eq('id', id).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to update template');
    return data as NotificationTemplate;
  },

  async getWhatsAppConfig(): Promise<WhatsAppConfig | null> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'whatsapp_config').single();
    if (error) return null;
    return data?.value || null;
  },

  async saveWhatsAppConfig(cfg: WhatsAppConfig) {
    const { error } = await supabase.from('settings').upsert({ key: 'whatsapp_config', value: cfg }).select();
    if (error) throw new Error(error.message);
    return true;
  },

  async testWhatsApp(cfg: WhatsAppConfig, testNumber: string) {
    // write a pending log and try to invoke function
    const { data, error } = await supabase.from('notifications_log').insert({ channel: 'whatsapp', recipient: testNumber, template_key: null, payload: cfg, status: 'pending' }).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to create test log');
    try {
      await supabase.functions.invoke('send-whatsapp', { body: { logId: data.id } as any } as any);
      return true;
    } catch (err) {
      throw err;
    }
  },

  async getEmailConfig(): Promise<EmailConfig | null> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'email_config').single();
    if (error) return null;
    return data?.value || null;
  },

  async saveEmailConfig(cfg: EmailConfig) {
    const { error } = await supabase.from('settings').upsert({ key: 'email_config', value: cfg }).select();
    if (error) throw new Error(error.message);
    return true;
  },

  async testEmail(cfg: EmailConfig, testEmail: string) {
    const { data, error } = await supabase.from('notifications_log').insert({ channel: 'email', recipient: testEmail, template_key: null, payload: cfg, status: 'pending' }).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to create test log');
    try {
      await supabase.functions.invoke('send-email', { body: { logId: data.id } as any } as any);
      return true;
    } catch (err) {
      throw err;
    }
  },

  async broadcast({ templateKey, segment = 'all', payload = {} }: any) {
    // segment can be: all, vip, upcoming_vaccination
    // create entries in notifications_log for matching recipients and return count
    let recipients: string[] = [];
    if (segment === 'all') {
      const { data } = await supabase.from('customers').select('whatsapp');
      recipients = (data || []).map((r: any) => r.whatsapp).filter(Boolean);
    } else if (segment === 'vip') {
      const { data } = await supabase.from('customers').select('whatsapp').eq('membership_tier', 'vip');
      recipients = (data || []).map((r: any) => r.whatsapp).filter(Boolean);
    } else if (segment === 'upcoming_vaccination') {
      const { data } = await supabase.from('vaccination_reminders').select('vaccination_record_id').gt('remind_at', new Date().toISOString());
      // map to customer numbers via join (simplified)
      // fallback: empty
    }

    const rows = recipients.map((r) => ({ channel: 'whatsapp', recipient: r, template_key: templateKey, payload, status: 'pending' }));
    if (!rows.length) return 0;
    const { error } = await supabase.from('notifications_log').insert(rows);
    if (error) throw new Error(error.message);
    // ideally trigger worker; omitted for now
    return rows.length;
  }
};

export default notificationsService;
