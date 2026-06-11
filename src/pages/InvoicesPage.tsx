import { useMemo } from 'react';
import { RefreshCcw, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card } from '@/components/ui';
import { useInvoices } from '@/features/pos/pos.hooks';
import { formatCurrency } from '@/lib/utils';

export function InvoicesPage() {
  const { data, isLoading, refetch } = useInvoices({ page: 1, pageSize: 20 });
  const invoices = data?.items ?? [];
  const totalRevenue = useMemo(() => invoices.reduce((sum, invoice) => sum + invoice.total, 0), [invoices]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Process and review invoices for visits, sales, and payments."
        actions={
          <Button onClick={() => refetch()}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh invoices
          </Button>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Invoice count</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{invoices.length}</p>
        </Card>
        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total revenue</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
        </Card>
      </div>

      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <DataTable
          columns={[
            { key: 'invoiceNumber', title: 'Invoice' },
            { key: 'paymentMethod', title: 'Payment' },
            { key: 'status', title: 'Status' },
            { key: 'total', title: 'Total', render: (record: any) => formatCurrency(record.total) }
          ]}
          data={invoices}
          isLoading={isLoading}
          emptyTitle="No invoices yet"
          emptyDescription="Create a sale in POS to generate invoices."
        />
      </Card>
    </div>
  );
}
