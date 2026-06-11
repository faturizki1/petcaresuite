import React, { useState } from 'react';
import { BookOpen, Calculator, Plus, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useJournalEntries, useLedgerTransactions, useCreateJournalEntry } from '../accounting.hooks';
import { formatCurrency } from '@/lib/utils';

export default function AccountingPage() {
  const [search, setSearch] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [debit, setDebit] = useState('0');
  const [credit, setCredit] = useState('0');
  const [category, setCategory] = useState('');

  const journalQuery = useJournalEntries({ page: 1, pageSize: 12, search });
  const ledgerQuery = useLedgerTransactions({ page: 1, pageSize: 12, search });
  const createJournal = useCreateJournalEntry();

  async function handleCreateJournal(event: React.FormEvent) {
    event.preventDefault();
    await createJournal.mutateAsync({
      entryDate,
      reference,
      description,
      debit: Number(debit),
      credit: Number(credit),
      category
    });
    setEntryDate('');
    setReference('');
    setDescription('');
    setDebit('0');
    setCredit('0');
    setCategory('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounting"
        description="Track ledger activity, journal entries, and financial performance across the clinic."
        actions={
          <Button onClick={() => journalQuery.refetch()}>
            <TrendingUp className="w-4 h-4 mr-2" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <BookOpen className="h-6 w-6 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Journal entries</p>
                  <p className="text-2xl font-semibold text-slate-900">{journalQuery.data?.items.length ?? 0}</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <Calculator className="h-6 w-6 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Ledger transactions</p>
                  <p className="text-2xl font-semibold text-slate-900">{ledgerQuery.data?.items.length ?? 0}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Recent journal activity</p>
                <h2 className="text-lg font-semibold text-slate-900">Financial journal</h2>
              </div>
              <Plus className="h-6 w-6 text-slate-500" />
            </div>
            <div className="mt-6 overflow-x-auto">
              <DataTable
                columns={[
                  { key: 'entryDate', title: 'Date' },
                  { key: 'reference', title: 'Reference' },
                  { key: 'description', title: 'Description' },
                  { key: 'debit', title: 'Debit', render: (record: any) => formatCurrency(record.debit) },
                  { key: 'credit', title: 'Credit', render: (record: any) => formatCurrency(record.credit) }
                ]}
                data={journalQuery.data?.items ?? []}
                isLoading={journalQuery.isLoading}
                emptyTitle="No journal entries"
                emptyDescription="Add an entry to start tracking accounting activity."
              />
            </div>
          </Card>
        </div>

        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">New journal entry</h2>
          <form onSubmit={handleCreateJournal} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <Input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Reference</label>
              <Input value={reference} onChange={(event) => setReference(event.target.value)} />
            </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm" rows={4} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Debit</label>
                <Input type="number" value={debit} onChange={(event) => setDebit(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Credit</label>
                <Input type="number" value={credit} onChange={(event) => setCredit(event.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <Input value={category} onChange={(event) => setCategory(event.target.value)} />
            </div>
            <Button type="submit" disabled={createJournal.isLoading}>
              Add journal entry
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
