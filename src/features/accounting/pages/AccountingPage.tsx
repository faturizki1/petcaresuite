import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Card, Input, Select, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui';
import { DataTable } from '@/components/common/DataTable';
import { formatCurrency } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAccounts, useTransactions, useCreateTransaction, useIncomeByPeriod, useExpenseByPeriod, useProfitLoss, useCashFlow } from '../accounting.hooks';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function AccountingPage() {
  useDocumentTitle('Accounting');
  const [tab, setTab] = useState('dashboard');
  const [txPage, setTxPage] = useState(1);
  const [txSearch, setTxSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [plMonth, setPlMonth] = useState(new Date().getMonth() + 1);
  const [plYear, setPlYear] = useState(new Date().getFullYear());

  const accountsQ = useAccounts();
  const txQ = useTransactions({ page: txPage, pageSize: 12, search: txSearch, from: fromDate || undefined, to: toDate || undefined });
  const createTx = useCreateTransaction();
  const incomePeriod = useIncomeByPeriod(fromDate || undefined, toDate || undefined);
  const expensePeriod = useExpenseByPeriod(fromDate || undefined, toDate || undefined);
  const plQ = useProfitLoss(plMonth, plYear);
  const cashflowQ = useCashFlow(selectedYear);

  const recentTx = txQ.data?.items ?? [];

  const chartData6Months = useMemo(() => {
    // take last 6 months from today
    const data: any[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const income = 0;
      const expense = 0;
      data.push({ month: key, income, expense });
    }
    // overlay data from period queries (best-effort)
    (incomePeriod.data || []).forEach((p: any) => {
      const month = p.period.slice(0, 7);
      const row = data.find((r) => r.month === month);
      if (row) row.income = p.amount;
    });
    (expensePeriod.data || []).forEach((p: any) => {
      const month = p.period.slice(0, 7);
      const row = data.find((r) => r.month === month);
      if (row) row.expense = p.amount;
    });
    return data;
  }, [incomePeriod.data, expensePeriod.data]);

  async function handleCreateExpense(values: { accountId: string; amount: number; description?: string; date?: string; reference?: string }) {
    await createTx.mutateAsync({ accountId: values.accountId, type: 'debit', amount: values.amount, description: values.description, transactionDate: values.date, reference: values.reference });
    setExpenseModalOpen(false);
  }

  async function handleExportPL() {
    const { data, error } = await supabase.functions.invoke('generate-pdf', {
      body: { type: 'profit-loss', month: plMonth, year: plYear }
    });
    if (error) {
      toast.error('Failed to generate PDF');
      return;
    }
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Accounting" description="Financial overview and reports." actions={<Button onClick={() => txQ.refetch()}>Refresh</Button>} />

      <Tabs value={tab} onValueChange={(v) => setTab(v)}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="pl">P&L Report</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div>
              <Card className="p-6">
                <h3 className="text-lg font-semibold">Income vs Expenses (last 6 months)</h3>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData6Months}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="income" fill="#22c55e" />
                      <Bar dataKey="expense" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="mt-6 p-6">
                <h3 className="text-lg font-semibold">Recent transactions</h3>
                <div className="mt-4">
                  <DataTable
                    columns={[
                      { key: 'transactionDate', title: 'Date' },
                      { key: 'accountName', title: 'Account' },
                      { key: 'type', title: 'Type' },
                      { key: 'amount', title: 'Amount', render: (r: any) => formatCurrency(r.amount) },
                      { key: 'description', title: 'Description' }
                    ]}
                    data={recentTx}
                    isLoading={txQ.isLoading}
                    pagination={{ page: txPage, pageSize: 10, total: txQ.data?.total ?? 0 }}
                    onPageChange={(p) => setTxPage(p)}
                  />
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6">
                <h3 className="text-lg font-semibold">Summary</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between"><span>Income (period)</span><strong>{formatCurrency((incomePeriod.data || []).reduce((s: number, r: any) => s + r.amount, 0))}</strong></div>
                  <div className="flex items-center justify-between"><span>Expenses (period)</span><strong>{formatCurrency((expensePeriod.data || []).reduce((s: number, r: any) => s + r.amount, 0))}</strong></div>
                  <div className="flex items-center justify-between"><span>Net</span><strong>{formatCurrency(((incomePeriod.data || []).reduce((s: number, r: any) => s + r.amount, 0) - (expensePeriod.data || []).reduce((s: number, r: any) => s + r.amount, 0)))}</strong></div>
                </div>
                <div className="mt-6">
                  <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
                    <DialogTrigger asChild>
                      <Button>Create Expense</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create expense</DialogTitle>
                        <DialogDescription>Record an expense transaction.</DialogDescription>
                      </DialogHeader>
                      <ExpenseForm accounts={accountsQ.data || []} onSubmit={handleCreateExpense} onCancel={() => setExpenseModalOpen(false)} />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="income">
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Input placeholder="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <Input placeholder="To" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              <div className="flex items-center gap-2"><Button onClick={() => {}}>Filter</Button></div>
            </div>
            <div className="mt-4">
              <DataTable
                columns={[{ key: 'transactionDate', title: 'Date' }, { key: 'accountName', title: 'Account' }, { key: 'description', title: 'Description' }, { key: 'amount', title: 'Amount', render: (r: any) => formatCurrency(r.amount) } ]}
                data={(txQ.data?.items || []).filter((t: any) => t.type === 'credit')}
                isLoading={txQ.isLoading}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Input placeholder="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <Input placeholder="To" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              <div className="flex items-center gap-2"><Button onClick={() => setExpenseModalOpen(true)}>Create Expense</Button></div>
            </div>
            <div className="mt-4">
              <DataTable
                columns={[{ key: 'transactionDate', title: 'Date' }, { key: 'accountName', title: 'Account' }, { key: 'description', title: 'Description' }, { key: 'amount', title: 'Amount', render: (r: any) => formatCurrency(r.amount) } ]}
                data={(txQ.data?.items || []).filter((t: any) => t.type === 'debit')}
                isLoading={txQ.isLoading}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Accounts</h3>
            <div className="mt-4">
              <DataTable columns={[{ key: 'name', title: 'Name' }, { key: 'type', title: 'Type' }, { key: 'description', title: 'Description' } ]} data={accountsQ.data || []} isLoading={accountsQ.isLoading} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pl">
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-3 items-end">
              <Input type="number" value={plMonth} onChange={(e) => setPlMonth(Number(e.target.value))} />
              <Input type="number" value={plYear} onChange={(e) => setPlYear(Number(e.target.value))} />
              <div className="flex gap-2"><Button onClick={() => plQ.refetch()}>Run</Button><Button onClick={handleExportPL}>Export PDF</Button></div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold">Income</h4>
              <table className="w-full mt-2 table-auto">
                <tbody>
                  {(plQ.data?.breakdown || []).filter((b: any) => b.type === 'credit').map((b: any, i: number) => (
                    <tr key={i}><td>{b.accountName}</td><td className="text-right">{formatCurrency(b.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
              <h4 className="font-semibold mt-4">Expenses</h4>
              <table className="w-full mt-2 table-auto">
                <tbody>
                  {(plQ.data?.breakdown || []).filter((b: any) => b.type === 'debit').map((b: any, i: number) => (
                    <tr key={i}><td>{b.accountName}</td><td className="text-right">{formatCurrency(b.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 font-semibold">Net Profit: {formatCurrency(plQ.data?.netProfit || 0)}</div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-3 items-end">
              <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} />
              <div className="col-span-2" />
            </div>
            <div style={{ height: 320 }} className="mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashflowQ.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#22c55e" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" />
                  <Line type="monotone" dataKey="net" stroke="#0284c7" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <table className="w-full table-auto">
                <thead><tr><th>Month</th><th className="text-right">Income</th><th className="text-right">Expenses</th><th className="text-right">Net</th></tr></thead>
                <tbody>
                  {(cashflowQ.data || []).map((m: any) => (
                    <tr key={m.month}><td>{m.month}</td><td className="text-right">{formatCurrency(m.income)}</td><td className="text-right">{formatCurrency(m.expenses)}</td><td className="text-right">{formatCurrency(m.net)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExpenseForm({ accounts, onSubmit, onCancel }: any) {
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [reference, setReference] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-700">Account</label>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
          {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
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
        <label className="block text-sm text-slate-700">Reference</label>
        <Input value={reference} onChange={(e) => setReference(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm text-slate-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" rows={3} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={async () => { await onSubmit({ accountId, amount: Number(amount), description, date, reference }); }}>Save</Button>
      </div>
    </div>
  );
}
