import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Card } from '@/components/ui';
import { useInvoice, useProcessRefund } from '../pos.hooks';
import RefundModal from '../components/RefundModal';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading, refetch } = useInvoice(id);
  const refundMutation = useProcessRefund();
  const [refundOpen, setRefundOpen] = useState(false);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!invoice) {
    return <div className="p-6">Invoice not found.</div>;
  }

  const totalRefunded = (invoice.refunds ?? []).reduce((sum: number, refund: Record<string, unknown>) => sum + Number((refund.amount as number) || 0), 0);

  const handleRefundSubmit = async (amount: number, reason: string) => {
    await refundMutation.mutateAsync({ invoiceId: invoice.id, amount, reason, processedBy: 'staff' });
    setRefundOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.invoice_number || invoice.id}`}
        description="Review payment details, items sold, and refunds."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        <div className="space-y-4">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Invoice number</p>
                <p className="mt-2 font-semibold text-slate-900">{invoice.invoice_number || invoice.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-2 font-semibold text-slate-900">{invoice.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Created</p>
                <p className="mt-2 font-semibold text-slate-900">{formatDate(invoice.created_at || new Date())}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Payment</p>
                <p className="mt-2 font-semibold text-slate-900">{invoice.payment_method || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="mt-4 space-y-3">
              {(invoice.items ?? []).map((item: Record<string, unknown>, idx: number) => (
                <div key={(item.id as string) ?? `${item.name}-${item.reference_id}-${idx}`} className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.name as React.ReactNode}</p>
                    <p className="text-sm text-slate-500">{String(item.quantity)} x {formatCurrency(Number(item.unit_price))}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">{formatCurrency(Number(item.discount))}</div>
                  <div className="text-right font-semibold text-slate-900">{formatCurrency(Number(item.total))}</div>
                </div>
              ))}
              {(invoice.items ?? []).length === 0 && <div className="text-sm text-slate-500">No items attached to this invoice.</div>}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="space-y-3">
              <div className="grid gap-3">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Discount</span>
                  <span>{formatCurrency(invoice.discount_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Loyalty discount</span>
                  <span>{formatCurrency(invoice.loyalty_discount_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Paid</span>
                  <span>{formatCurrency(invoice.paid_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Change</span>
                  <span>{formatCurrency(invoice.change_amount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>

              {invoice.refunds && invoice.refunds.length > 0 && (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-600">Refunds</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {invoice.refunds.map((refund: Record<string, unknown>, idx: number) => (
                      <div key={(refund.id as string) ?? `refund-${idx}`} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <div>{(refund.reason as string) || 'Refund issued'}</div>
                        <div className="text-right font-semibold">{formatCurrency(Number(refund.amount || 0))}</div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-rose-200 pt-3 text-sm font-semibold text-rose-700">
                      <span>Total refunded</span>
                      <span>{formatCurrency(totalRefunded)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  onClick={() => setRefundOpen(true)}
                  disabled={invoice.status === 'refunded'}
                >
                  Issue refund
                </Button>
                <Button variant="outline" onClick={() => navigate('/staff/pos/transactions')}>
                  Go to transactions
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <RefundModal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        invoiceTotal={invoice.total}
        isLoading={refundMutation.isLoading}
        onSubmit={handleRefundSubmit}
      />
    </div>
  );
}
