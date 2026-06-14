import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@/components/ui';
import { posService } from '@/features/pos/pos.service';
import type { Invoice, InvoiceItem } from '@/features/pos/pos.types';

export default function InvoiceReviewModal({ inpatientId, onClose }: { inpatientId: string; onClose: (saved?: boolean) => void }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const inv = await posService.getInvoiceByInpatientRecord(inpatientId);
        if (mounted) setInvoice(inv);
      } catch {
        toast.error('Failed to process invoice. Please try again.');
      }
    })();
    return () => { mounted = false; };
  }, [inpatientId]);

  const subtotal = useMemo(() => {
    if (!invoice) return 0;
    return invoice.items.reduce((s, it) => s + (Number(it.total) || 0), 0);
  }, [invoice]);

  async function handleSave() {
    if (!invoice) return;
    setIsSaving(true);
    try {
      const updated = await posService.updateInvoice(invoice.id, {
        subtotal,
        total: subtotal,
        items: invoice.items.map((it) => ({
          itemType: it.itemType,
          referenceId: it.referenceId,
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          total: it.total
        }))
      });
      setInvoice(updated);
      onClose(true);
    } catch (err) {
      toast.error('Failed to save invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function updateItem(index: number, patch: Partial<InvoiceItem>) {
    if (!invoice) return;
    const items = invoice.items.map((it, i) => (i === index ? { ...it, ...patch } : it));
    // recompute totals
    const newItems = items.map((it) => ({ ...it, total: Number(it.quantity) * Number(it.unitPrice) - (Number(it.discount) || 0) }));
    setInvoice({ ...invoice, items: newItems, total: newItems.reduce((s, it) => s + (Number(it.total) || 0), 0), subtotal: newItems.reduce((s, it) => s + (Number(it.total) || 0), 0) } as Invoice);
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
          {invoice.items.map((item, idx) => (
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
