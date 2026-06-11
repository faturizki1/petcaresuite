import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';
import { useFinancialReport } from '../reports.hooks';
// lightweight sparkline implementation to avoid adding external chart deps

export default function FinancialReportsPage() {
  const { data, isLoading } = useFinancialReport();

  const summary = data?.summary;
  const trend = data?.monthlyTrend || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Reports" description="Revenue, expenses, and trends." />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-semibold">{summary ? summary.totalRevenue.toLocaleString() : '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Expense</p>
          <p className="text-2xl font-semibold">{summary ? summary.totalExpense.toLocaleString() : '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Net Profit</p>
          <p className="text-2xl font-semibold">{summary ? summary.netProfit.toLocaleString() : '-'}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-2">Month</th>
                <th className="px-4 py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((pt) => (
                <tr key={pt.month} className="border-b border-slate-100">
                  <td className="px-4 py-2">{pt.month}</td>
                  <td className="px-4 py-2 text-right">{pt.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
