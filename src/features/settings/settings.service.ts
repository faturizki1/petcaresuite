import { supabase } from '@/lib/supabase';
import type { ClinicProfile, BusinessHours, InvoiceSettings } from './settings.types';

export const settingsService = {
  async getClinicProfile(): Promise<ClinicProfile | null> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'clinic_profile').single();
    if (error) return null;
    return data?.value || null;
  },

  async updateClinicProfile(profile: Partial<ClinicProfile>) {
    const { error } = await supabase.from('settings').upsert({ key: 'clinic_profile', value: profile }).select();
    if (error) throw new Error(error.message);
    return true;
  },

  async getBusinessHours(): Promise<BusinessHours[]> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'business_hours').single();
    if (error) return Array(7).fill(null).map((_, i) => ({ dayOfWeek: i, startTime: '08:00', endTime: '17:00', isClosed: false }));
    return data?.value || [];
  },

  async updateBusinessHours(hours: BusinessHours[]) {
    const { error } = await supabase.from('settings').upsert({ key: 'business_hours', value: hours }).select();
    if (error) throw new Error(error.message);
    return true;
  },

  async getInvoiceSettings(): Promise<InvoiceSettings> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'invoice_settings').single();
    if (error) return { prefix: 'INV', nextNumber: 1 };
    return data?.value || { prefix: 'INV', nextNumber: 1 };
  },

  async updateInvoiceSettings(settings: Partial<InvoiceSettings>) {
    const { error } = await supabase.from('settings').upsert({ key: 'invoice_settings', value: settings }).select();
    if (error) throw new Error(error.message);
    return true;
  },

  async getAuditLogs({ page = 1, pageSize = 50 }: any = {}): Promise<{ items: any[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const { data, count, error } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(error.message);
    return { items: (data || []) as any, total: typeof count === 'number' ? count : (data || []).length };
  }
};

export default settingsService;
