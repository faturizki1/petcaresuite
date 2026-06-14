import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Input, Button } from '@/components/ui';
import { useDoctorStats } from '../reports.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DataTable } from '@/components/common/DataTable';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DoctorReportsPage() {
  useDocumentTitle('Doctor Reports');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const from = month && year ? `${year}-${month}-01` : undefined;
  const to = month && year ? `${year}-${month}-31` : undefined;
  const q = useDoctorStats(from, to);

  const rows = q.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Doctor Reports" description="Performance and revenue by doctor." />

      <div className="grid gap-4 md:grid-cols-3 items-end">
        <Input placeholder="Month (MM)" value={month} onChange={(e) => setMonth(e.target.value)} />
        <Input placeholder="Year (YYYY)" value={year} onChange={(e) => setYear(e.target.value)} />
        <Button onClick={() => q.refetch()}>Run</Button>
      </div>

      <Card className="p-4">
        <DataTable
          columns={[
            { key: 'doctorName', header: 'Doctor' },
            { key: 'patients', header: 'Patients' },
            { key: 'services', header: 'Services' },
            { key: 'revenue', header: 'Revenue', render: (r: any) => formatCurrency(r.revenue || 0) }
          ]}
          data={rows}
          isLoading={q.isLoading}
          emptyTitle="No doctor data"
          emptyDescription="Select a month and year to view doctor performance."
        />
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Revenue by doctor</h3>
        {q.isLoading ? (
          <div className="h-72">
            <div className="h-full rounded-3xl bg-slate-100" />
          </div>
        ) : rows.length ? (
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ left: 100, right: 20, top: 20, bottom: 20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="doctorName" width={140} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-10">
            <p className="text-sm text-slate-500">No revenue data for this period.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
