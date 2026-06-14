import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ShoppingCart, Receipt } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Card, Input, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { posService } from '../pos.service';
import useCartStore from '../stores/cart.store';
import ReceiptModal from '../components/ReceiptModal';
import { CustomerSearchPanel } from '../components/CustomerSearchPanel';
import { LoyaltyRedeemPanel } from '../components/LoyaltyRedeemPanel';
import { PaymentMethodPanel } from '../components/PaymentMethodPanel';
import { LoadInpatientBillModal } from '../components/LoadInpatientBillModal';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '../pos.types';

export default function PosPage() {
  const [tab, setTab] = useState<'products' | 'services'>('products');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [results, setResults] = useState<any[]>([]);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [receiptCart, setReceiptCart] = useState<any>(null);
  const [receiptPayment, setReceiptPayment] = useState<any>(null);
  const [inpatientModalOpen, setInpatientModalOpen] = useState(false);
  const [inpatientRecordId, setInpatientRecordId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const cart = useCartStore((s) => s.cart);
  const paymentData = useCartStore((s) => s.paymentData);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setItemDiscount = useCartStore((s) => s.setItemDiscount);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const setPaidAmount = useCartStore((s) => s.setPaidAmount);
  const setPaidAmountSecondary = useCartStore((s) => s.setPaidAmountSecondary);
  const setSecondaryMethod = useCartStore((s) => s.setSecondaryMethod);
  const toggleSplitPayment = useCartStore((s) => s.toggleSplitPayment);
  const setReference = useCartStore((s) => s.setReference);
  const setCustomer = useCartStore((s) => s.setCustomer);
  const setLoyaltyRedeem = useCartStore((s) => s.setLoyaltyRedeem);
  const loadInpatientBill = useCartStore((s) => s.loadInpatientBill);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    let mounted = true;

    async function search() {
      if (!debounced) {
        setResults([]);
        return;
      }

      try {
        const res = tab === 'products'
          ? await posService.searchProducts(debounced)
          : await posService.searchServices(debounced);

        if (mounted) setResults(res);
      } catch (error) {
        toast.error('Failed to search items. Please try again.');
      }
    }

    search();
    return () => { mounted = false; };
  }, [debounced, tab]);

  const addResultToCart = (result: any) => {
    const item: Omit<CartItem, 'id' | 'total'> = {
      name: result.name,
      itemType: tab === 'products' ? 'product' : 'service',
      referenceId: result.id,
      unitPrice: result.price,
      quantity: 1,
      discountAmount: 0
    };

    addItem(item);
  };

  const handleSelectCustomer = (customerId: string | null, customerName: string | null, loyaltyPoints: number, phone?: string | null) => {
    setCustomer(customerId, customerName, loyaltyPoints, phone ?? null);
    setLoyaltyRedeem(0);
  };

  const handleBillLoad = (items: CartItem[], recordId: string) => {
    loadInpatientBill(items);
    setInpatientRecordId(recordId);
  };

  const paymentInfo = useMemo(
    () => ({
      method: paymentData.method,
      methodSecondary: paymentData.methodSecondary ?? null,
      paidAmount: paymentData.paidAmount,
      paidAmountSecondary: paymentData.paidAmountSecondary ?? 0,
      changeAmount: paymentData.changeAmount,
      phone: cart.customerPhone ?? null,
      reference: paymentData.reference ?? null
    }),
    [cart.customerPhone, paymentData]
  );

  const checkout = async () => {
    if (!cart.items.length) {
      toast.error('Add items to the cart before checkout.');
      return;
    }

    const payload = {
      customer_id: cart.customerId ?? null,
      subtotal: cart.subtotal,
      discount_amount: cart.discountTotal,
      loyalty_points_used: cart.loyaltyPointsToRedeem || 0,
      loyalty_discount_amount: cart.loyaltyDiscount,
      total: cart.total,
      payment_method: paymentData.method,
      payment_method_secondary: paymentData.methodSecondary ?? null,
      paid_amount: paymentData.paidAmount + (paymentData.splitEnabled ? (paymentData.paidAmountSecondary || 0) : 0),
      change_amount: paymentData.changeAmount,
      status: 'paid',
      notes: paymentData.reference ?? null,
      inpatient_record_id: inpatientRecordId,
      items: cart.items.map((item) => ({
        item_type: item.itemType,
        reference_id: item.referenceId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discountAmount,
        total: item.total
      }))
    };

    setCheckoutLoading(true);
    try {
      const invoice = await posService.createInvoice(payload as any);
      setInvoiceNumber(invoice.invoice_number || invoice.id);
      setReceiptCart({
        ...cart,
        items: cart.items.map((item) => ({ ...item }))
      });
      setReceiptPayment({ ...paymentInfo });
      setReceiptOpen(true);
      clearCart();
      setInpatientRecordId(null);
    } catch (error) {
      toast.error('Failed to complete checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Point of Sale" description="Create invoices and process payments." />

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.2fr,1.4fr,420px]">
        <div className="space-y-4">
          <CustomerSearchPanel
            selectedCustomerId={cart.customerId ?? undefined}
            selectedCustomerName={cart.customerName ?? undefined}
            onSelect={handleSelectCustomer}
          />

          <LoyaltyRedeemPanel
            availablePoints={cart.loyaltyPointsAvailable ?? 0}
            currentTotal={cart.subtotal}
            pointsToRedeem={cart.loyaltyPointsToRedeem ?? 0}
            onRedeemChange={setLoyaltyRedeem}
          />

          <Card className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold">Search inventory</h3>
                <p className="text-sm text-slate-500">Add products or services to the cart.</p>
              </div>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'products' | 'services')}>
              <TabsList className="w-full">
                <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
                <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-3">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or SKU"
                aria-label="Search products and services"
              />
            </div>

            <div className="space-y-2 pt-4">
              {results.length ? (
                results.map((result) => (
                  <div key={result.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{result.name}</div>
                      <div className="text-sm text-slate-500">{formatCurrency(result.price)}</div>
                    </div>
                    <Button onClick={() => addResultToCart(result)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  {query ? 'No items found for this search.' : 'Search products or services to add to the cart.'}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setInpatientModalOpen(true)}>Load inpatient bill</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Cart items</h3>
                <p className="text-sm text-slate-500">Review items before checkout.</p>
              </div>
              <Button variant="outline" onClick={clearCart} disabled={!cart.items.length}>Clear cart</Button>
            </div>

            <div className="mt-4 space-y-3">
              {cart.items.length > 0 ? (
                cart.items.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                        <div className="text-sm text-slate-500">{formatCurrency(item.unitPrice)} x {item.quantity}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</Button>
                        <div className="w-10 text-center text-sm">{item.quantity}</div>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                        <Input
                          className="w-24"
                          type="number"
                          min={0}
                          value={item.discountAmount}
                          onChange={(event) => setItemDiscount(item.id, Number(event.target.value || 0))}
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>Remove</Button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">Line total: {formatCurrency(item.total)}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  Your cart is currently empty.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex justify-between py-1"><span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span></div>
              <div className="flex justify-between py-1"><span>Discount</span><span>{formatCurrency(cart.discountTotal)}</span></div>
              <div className="flex justify-between py-1"><span>Loyalty</span><span>{formatCurrency(cart.loyaltyDiscount)}</span></div>
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{formatCurrency(cart.total)}</span></div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <PaymentMethodPanel
            method={paymentData.method}
            methodSecondary={paymentData.methodSecondary}
            paidAmount={paymentData.paidAmount}
            paidAmountSecondary={paymentData.paidAmountSecondary}
            changeAmount={paymentData.changeAmount}
            splitEnabled={paymentData.splitEnabled}
            reference={paymentData.reference}
            onMethodChange={setPaymentMethod}
            onSecondaryMethodChange={setSecondaryMethod}
            onPaidAmountChange={setPaidAmount}
            onPaidAmountSecondaryChange={setPaidAmountSecondary}
            onSplitToggle={toggleSplitPayment}
            onReferenceChange={(reference) => setReference(reference)}
          />

          <Card className="space-y-4 p-4">
            <div>
              <h3 className="text-base font-semibold">Checkout</h3>
              <p className="text-sm text-slate-500">Confirm the invoice and complete payment.</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Customer</span><span>{cart.customerName ?? 'Walk-in'}</span></div>
              {cart.customerPhone ? <div className="flex justify-between"><span>Phone</span><span>{cart.customerPhone}</span></div> : null}
              <div className="flex justify-between"><span>Payment method</span><span>{paymentData.method}{paymentData.splitEnabled && paymentData.methodSecondary ? ` + ${paymentData.methodSecondary}` : ''}</span></div>
              <div className="flex justify-between"><span>Paid</span><span>{formatCurrency(paymentData.paidAmount + (paymentData.splitEnabled ? (paymentData.paidAmountSecondary || 0) : 0))}</span></div>
              <div className="flex justify-between"><span>Change</span><span>{formatCurrency(paymentData.changeAmount)}</span></div>
            </div>

            <Button onClick={checkout} disabled={!cart.items.length || checkoutLoading} className="w-full">
              {checkoutLoading ? 'Processing…' : 'Complete checkout'}
            </Button>
          </Card>
        </div>
      </div>

      <LoadInpatientBillModal
        open={inpatientModalOpen}
        onOpenChange={setInpatientModalOpen}
        onLoad={handleBillLoad}
      />

      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        invoiceNumber={invoiceNumber}
        cashier="POS"
        customerName={receiptCart?.customerName ?? cart.customerName}
        cart={receiptCart ?? cart}
        paymentInfo={receiptPayment ?? paymentInfo}
      />
    </div>
  );
}
