import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@/components/ui';
import { posService } from '@/features/pos/pos.service';

interface InvoiceItemData {
  id?: string;
  name: string;
  itemType: string;
  referenceId?: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber?: string;
  items: InvoiceItemData[];
  total: number;
  subtotal: number;
}

export default function InvoiceReviewModal({ inpatientId, onClose }: { inpatientId: string; onClose: (saved?: boolean) => void }) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const inv = await posService.getInvoiceByInpatientRecord(inpatientId);
        if (mounted && inv) {
          setInvoice({
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            items: (inv.items || []).map((item: Record<string, unknown>) => ({
              id: item.id as string,
              name: item.name as string,
              itemType: item.item_type as string,
              referenceId: (item.reference_id as string) ?? null,
              quantity: Number(item.quantity || 0),
              unitPrice: Number(item.unit_price || 0),
              discount: Number(item.discount || 0),
              total: Number(item.total || 0)
            })),
            total: Number(inv.total || 0),
            subtotal: Number(inv.subtotal || 0)
          });
        }
      } catch {
        toast.error('Failed to process invoice. Please try again.');
      }
    })();
    return () => { mounted = false; };
  }, [inpatientId]);

  const subtotal = useMemo(() => {
    if (!invoice) return 0;
    return invoice.items.reduce((s: number, it: InvoiceItemData) => s + (Number(it.total) || 0), 0);
  }, [invoice]);

  async function handleSave() {
    if (!invoice) return;
    setIsSaving(true);
    try {
      await posService.createInvoice({
        inpatient_record_id: inpatientId,
        subtotal,
        discount_amount: 0,
        loyalty_points_used: 0,
        loyalty_discount_amount: 0,
        total: subtotal,
        payment_method: 'cash',
        paid_amount: 0,
        change_amount: 0,
        status: 'draft',
        notes: `Inpatient bill for record ${inpatientId}`,
        items: invoice.items.map((it: InvoiceItemData) => ({
          item_type: it.itemType,
          reference_id: it.referenceId ?? null,
          name: it.name,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          discount: it.discount,
          total: it.total
        }))
      });
      onClose(true);
    } catch {
      toast.error('Failed to save invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function updateItem(index: number, patch: Partial<InvoiceItemData>) {
    if (!invoice) return;
    const items = invoice.items.map((it: InvoiceItemData, i: number) => (i === index ? { ...it, ...patch } : it));
    const newItems = items.map((it: InvoiceItemData) => ({ ...it, total: Number(it.quantity) * Number(it.unitPrice) - (Number(it.discount) || 0) }));
    setInvoice({
      ...invoice,
      items: newItems,
      total: newItems.reduce((s: number, it: InvoiceItemData) => s + (Number(it.total) || 0), 0),
      subtotal: newItems.reduce((s: number, it: InvoiceItemData) => s + (Number(it.total) || 0), 0)
    });
  }

  if (!invoice) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Card className="w-[720px] p-6">Loading invoice...</Card>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Card className="w-[720px] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Review Invoice {invoice.invoiceNumber}</h3>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onClose(false)}>Close</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {invoice.items.map((item: InvoiceItemData, idx: number) => (
            <div key={item.id || `${idx}`} className="grid grid-cols-3 gap-3 items-center">
              <div className="col-span-1">
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-slate-500">{item.itemType}</div>
              </div>
              <div className="col-span-1 flex gap-2">
                <Input type="number" value={String(item.quantity)} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                <Input type="number" value={String(item.unitPrice)} onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} />
              </div>
              <div className="col-span-1 text-right">
                <div className="text-sm font-semibold">{item.total.toLocaleString()}</div>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <div className="flex justify-between">
              <div className="text-sm text-slate-600">Subtotal</div>
              <div className="text-sm font-semibold">{subtotal.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}