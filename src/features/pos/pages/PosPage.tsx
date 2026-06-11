import React, { useMemo, useState } from 'react';
import { DollarSign, ShoppingCart, Receipt, RefreshCcw } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useCustomers } from '@/features/customers/customers.hooks';
import { useProducts } from '@/features/petshop/petshop.hooks';
import { useInvoices, useCreateInvoice } from '../pos.hooks';
import { formatCurrency } from '@/lib/utils';
import type { InvoiceCreatePayload } from '../pos.types';

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export default function PosPage() {
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');

  const { data: customers = [] } = useCustomers({ page: 1, pageSize: 50 });
  const { data: productsData = { items: [], total: 0 } } = useProducts({ page: 1, pageSize: 100, search });
  const invoicesQuery = useInvoices({ page: 1, pageSize: 12 });
  const createInvoice = useCreateInvoice();

  const productList = useMemo(() => productsData.items.flatMap((product) => product.variants.map((variant) => ({
    id: variant.id,
    name: `${product.name} - ${variant.name}`,
    unitPrice: variant.price
  }))), [productsData.items]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;
  const paidAmount = total;
  const change = paidAmount - total;

  function addToCart() {
    const selected = productList.find((item) => item.id === selectedProductId);
    if (!selected) return;
    const quantityNumber = Number(quantity);
    if (quantityNumber <= 0) return;
    setCartItems((current) => {
      const existing = current.find((item) => item.id === selectedProductId);
      if (existing) {
        return current.map((item) =>
          item.id === selectedProductId
            ? { ...item, quantity: item.quantity + quantityNumber, total: (item.quantity + quantityNumber) * item.unitPrice }
            : item
        );
      }
      return [...current, { ...selected, quantity: quantityNumber, total: selected.unitPrice * quantityNumber }];
    });
  }

  function removeItem(itemId: string) {
    setCartItems((current) => current.filter((item) => item.id !== itemId));
  }

  async function handleCreateInvoice(event: React.FormEvent) {
    event.preventDefault();
    if (!cartItems.length) return;
    const payload: InvoiceCreatePayload = {
      customerId: customerId || undefined,
      subtotal,
      discountAmount: 0,
      loyaltyPointsUsed: 0,
      total,
      paymentMethod,
      paidAmount,
      changeAmount: change,
      status: 'Paid',
      notes: notes || undefined,
      items: cartItems.map((item) => ({
        itemType: 'product_variant',
        referenceId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
        total: item.total
      }))
    };

    await createInvoice.mutateAsync(payload);
    setCartItems([]);
    setNotes('');
    setCustomerId('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Point of Sale"
        description="Create retail invoices, collect payments, and manage cart checkout in one POS workflow."
        actions={
          <Button onClick={() => invoicesQuery.refetch()}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh invoices
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Cart</h2>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <select
                      value={selectedProductId}
                      onChange={(event) => setSelectedProductId(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      <option value="">Select product variant</option>
                      {productList.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                    <Input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="max-w-[120px]" />
                  </div>
                  <Button disabled={!selectedProductId} onClick={addToCart}>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to cart
                  </Button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Cart subtotal</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(subtotal)}</p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit price</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-slate-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-900">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-slate-900">{formatCurrency(item.total)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="secondary" size="sm" onClick={() => removeItem(item.id)}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!cartItems.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No items added.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>
            <form onSubmit={handleCreateInvoice} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Customer</label>
                <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
                  <option value="">Walk-in</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Payment method</label>
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm" rows={4} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Total due</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(total)}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Change</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(change)}</p>
                </div>
              </div>
              <Button type="submit" disabled={!cartItems.length || createInvoice.isLoading}>
                <Receipt className="w-4 h-4 mr-2" /> Complete payment
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Invoices</p>
                <p className="text-2xl font-semibold text-slate-900">{invoicesQuery.data?.items.length ?? 0}</p>
              </div>
              <DollarSign className="h-6 w-6 text-slate-500" />
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoicesQuery.data?.items.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-4 py-3 text-slate-900">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-900">{invoice.status}</td>
                      <td className="px-4 py-3 text-slate-900">{formatCurrency(invoice.total)}</td>
                    </tr>
                  ))}
                  {invoicesQuery.data?.items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-slate-500">No invoices yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
