import React, { useRef } from 'react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Cart } from '../pos.types';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  cashier?: string;
  customerName?: string | null;
  cart: Cart;
  paymentInfo?: {
    method?: string;
    methodSecondary?: string | null;
    paidAmount?: number;
    paidAmountSecondary?: number | null;
    changeAmount?: number;
    phone?: string | null;
    reference?: string | null;
  };
}

export function ReceiptModal({ open, onClose, invoiceNumber, cashier, customerName, cart, paymentInfo }: ReceiptModalProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({ contentRef: ref });

  const sendWhatsApp = async (number?: string) => {
    if (!number) return;
    try {
      await supabase.functions.invoke('send-whatsapp', { body: { number, message: `Invoice ${invoiceNumber} - Total: ${formatCurrency(cart.total)}` } } as any);
    } catch (err) {
      toast.error('Failed to send WhatsApp message. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receipt - {invoiceNumber}</DialogTitle>
        </DialogHeader>
        <div ref={ref} className="space-y-4 p-4">
          <div className="text-sm">
            <div>Cashier: {cashier || 'Unknown'}</div>
            <div>Customer: {customerName || 'Walk-in'}</div>
            {paymentInfo?.phone ? <div>Phone: {paymentInfo.phone}</div> : null}
            <div>Date: {new Date().toLocaleString()}</div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td className="text-right">{it.quantity}</td>
                  <td className="text-right">{formatCurrency(it.unitPrice)}</td>
                  <td className="text-right">{formatCurrency(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right space-y-2">
            <div>Subtotal: {formatCurrency(cart.subtotal)}</div>
            <div>Discount: {formatCurrency(cart.discountTotal)}</div>
            <div>Loyalty: {formatCurrency(cart.loyaltyDiscount)}</div>
            {paymentInfo?.reference ? <div>Reference: {paymentInfo.reference}</div> : null}
            <div>Payment: {paymentInfo?.method ?? 'N/A'}{paymentInfo?.methodSecondary ? ` / ${paymentInfo.methodSecondary}` : ''}</div>
            {typeof paymentInfo?.paidAmount === 'number' ? <div>Paid: {formatCurrency(paymentInfo.paidAmount + (paymentInfo.paidAmountSecondary || 0))}</div> : null}
            <div>Change: {formatCurrency(paymentInfo?.changeAmount ?? 0)}</div>
            <div className="text-xl font-semibold">Total: {formatCurrency(cart.total)}</div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button onClick={() => handlePrint()}>Print</Button>
            <Button onClick={() => sendWhatsApp(paymentInfo?.phone ?? undefined)} disabled={!paymentInfo?.phone}>Send WhatsApp</Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReceiptModal;
