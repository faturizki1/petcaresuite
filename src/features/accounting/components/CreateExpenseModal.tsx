import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button, Input } from '@/components/ui';
import { useCreateTransaction, useAccounts } from '../accounting.hooks';

export default function CreateExpenseModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: accounts = [] } = useAccounts();
  const createTx = useCreateTransaction();
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  async function handleSubmit() {
    await createTx.mutateAsync({ accountId, type: 'debit', amount: Number(amount), description, transactionDate: date || undefined });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm text-slate-700">Account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">Select account</option>
              {accounts.map((a: any) => (<option key={a.id} value={a.id}>{a.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700">Amount</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSubmit} disabled={createTx.isLoading}>Create</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
