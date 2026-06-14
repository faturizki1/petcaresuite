import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input } from '@/components/ui';
import { useFinancialReport, useRevenueByService } from '../reports.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatCurrency } from '@/lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

export default function FinancialReportsPage() {
  useDocumentTitle('Financial Reports');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const q = useFinancialReport({ startDate: from || undefined, endDate: to || undefined });
  const revenueServiceQ = useRevenueByService(from || undefined, to || undefined);

  const summary = q.data?.summary;
  const trend = q.data?.monthlyTrend || [];
  const revenueByService = revenueServiceQ.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Reports" description="Revenue, expenses, and trends." />

      <div className="grid gap-4 md:grid-cols-3 items-end">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button onClick={() => { q.refetch(); revenueServiceQ.refetch(); }}>Run</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className={`text-2xl font-semibold ${summary ? 'text-slate-900' : ''}`}>{summary ? formatCurrency(summary.totalRevenue) : '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Expense</p>
          <p className={`text-2xl font-semibold ${summary ? 'text-slate-900' : ''}`}>{summary ? formatCurrency(summary.totalExpense) : '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Net Profit</p>
          <p className={`text-2xl font-semibold ${summary ? (summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600') : ''}`}>
            {summary ? formatCurrency(summary.netProfit) : '-'}
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Revenue by Service Type</h3>
        {revenueServiceQ.isLoading ? (
          <div className="h-72 rounded-3xl bg-slate-100" />
        ) : revenueByService.length ? (
          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueByService} dataKey="amount" nameKey="serviceName" outerRadius={110} label>
                  {revenueByService.map((entry: any, index: number) => (
                    <Cell key={entry.serviceId || index} fill={['#2563eb', '#14b8a6', '#f59e0b', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-10 text-sm text-slate-500">No service revenue data available.</div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
        {q.isLoading ? (
          <div className="h-72 rounded-3xl bg-slate-100" />
        ) : trend.length ? (
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#2563eb" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-10 text-sm text-slate-500">No monthly trend data available.</div>
        )}
      </Card>
    </div>
  );
}
