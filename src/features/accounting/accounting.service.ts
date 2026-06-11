import { supabase } from '@/lib/supabase';
import type { LedgerTransaction, JournalEntry, AccountingQueryParams, JournalCreatePayload } from './accounting.types';

function mapLedger(record: any): LedgerTransaction {
  return {
    id: record.id,
    date: record.date,
    description: record.description,
    amount: Number(record.amount),
    type: record.type,
    category: record.category,
    createdAt: record.created_at
  };
}

function mapJournal(record: any): JournalEntry {
  return {
    id: record.id,
    entryDate: record.entry_date,
    reference: record.reference,
    description: record.description,
    debit: Number(record.debit),
    credit: Number(record.credit),
    createdAt: record.created_at
  };
}

export const accountingService = {
  async getLedgerTransactions({ page = 1, pageSize = 12, search, category }: AccountingQueryParams = {}): Promise<{ items: LedgerTransaction[]; total: number }> {
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('ledger_transactions').select('id, date, description, amount, type, category, created_at', { count: 'exact' }).order('date', { ascending: false });
    if (search) query = query.ilike('description', `%${search}%`);
    if (category) query = query.eq('category', category);
    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    const items = Array.isArray(res.data) ? res.data.map(mapLedger) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async getJournalEntries({ page = 1, pageSize = 12, search }: AccountingQueryParams = {}): Promise<{ items: JournalEntry[]; total: number }> {
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('journal_entries').select('id, entry_date, reference, description, debit, credit, created_at', { count: 'exact' }).order('entry_date', { ascending: false });
    if (search) query = query.ilike('reference', `%${search}%`).or(`description.ilike.%${search}%`);
    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    const items = Array.isArray(res.data) ? res.data.map(mapJournal) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async createJournalEntry(payload: JournalCreatePayload): Promise<JournalEntry> {
    const { data, error } = await supabase.from('journal_entries').insert({
      entry_date: payload.entryDate,
      reference: payload.reference,
      description: payload.description,
      debit: payload.debit,
      credit: payload.credit,
      category: payload.category
    }).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to create journal entry');
    return mapJournal(data);
  }
};
