import { supabase } from '@/lib/supabase';
import type { FinancialReport, MonthlyPoint } from './reports.types';

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const reportsService = {
  async getFinancialReport({ startDate, endDate }: { startDate?: string; endDate?: string } = {}): Promise<FinancialReport> {
    const from = startDate || new Date(new Date().setMonth(new Date().getMonth() - 11)).toISOString();
    const to = endDate || new Date().toISOString();

    // gather invoices in range
    const { data: invoices = [], error: invErr } = await supabase.from('invoices').select('id, total, created_at').gte('created_at', from).lte('created_at', to);
    if (invErr) throw new Error(invErr.message);

    // gather transactions (expenses) in range
    const { data: txs = [], error: txErr } = await supabase.from('transactions').select('id, amount, type, created_at').gte('created_at', from).lte('created_at', to);
    if (txErr) throw new Error(txErr.message);

    const totalRevenue = (invoices || []).reduce((s: number, inv: any) => s + Number(inv.total || 0), 0);
    const totalExpense = (txs || []).reduce((s: number, t: any) => s + (t.type === 'debit' ? Number(t.amount || 0) : 0), 0);

    // monthly trend — revenue per month
    const monthMap: Record<string, number> = {};
    (invoices || []).forEach((inv: any) => {
      const k = monthKey(inv.created_at || inv.createdAt || new Date().toISOString());
      monthMap[k] = (monthMap[k] || 0) + Number(inv.total || 0);
    });

    // produce last 12 months
    const points: MonthlyPoint[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      points.push({ month: k, value: monthMap[k] || 0 });
    }

    return {
      summary: {
        totalRevenue,
        totalExpense,
        netProfit: totalRevenue - totalExpense
      },
      monthlyTrend: points
    };
  }
};

export default reportsService;
