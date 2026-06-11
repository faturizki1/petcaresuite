import { supabase } from '@/lib/supabase';
import type { Invoice, InvoiceCreatePayload, InvoiceQueryParams, InvoiceItem } from './pos.types';
import { inventoryService } from '@/features/inventory/inventory.service';

function mapItem(record: any): InvoiceItem {
  return {
    id: record.id,
    invoiceId: record.invoice_id,
    itemType: record.item_type,
    referenceId: record.reference_id,
    name: record.name,
    quantity: record.quantity,
    unitPrice: Number(record.unit_price),
    discount: Number(record.discount),
    total: Number(record.total),
    createdAt: record.created_at
  };
}

function mapInvoice(record: any): Invoice {
  return {
    id: record.id,
    invoiceNumber: record.invoice_number,
    customerId: record.customer_id,
    appointmentId: record.appointment_id,
    inpatientRecordId: record.inpatient_record_id,
    subtotal: Number(record.subtotal),
    discountAmount: Number(record.discount_amount),
    loyaltyPointsUsed: record.loyalty_points_used,
    total: Number(record.total),
    paymentMethod: record.payment_method,
    paymentMethodSecondary: record.payment_method_secondary,
    paidAmount: Number(record.paid_amount),
    changeAmount: Number(record.change_amount),
    status: record.status,
    notes: record.notes,
    createdBy: record.created_by,
    createdAt: record.created_at,
    paidAt: record.paid_at,
    items: Array.isArray(record.items) ? record.items.map(mapItem) : []
  };
}

export const posService = {
  async getInvoices({ page = 1, pageSize = 12, search, status }: InvoiceQueryParams = {}): Promise<{ items: Invoice[]; total: number }> {
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('invoices')
      .select('id, invoice_number, customer_id, appointment_id, inpatient_record_id, subtotal, discount_amount, loyalty_points_used, total, payment_method, payment_method_secondary, paid_amount, change_amount, status, notes, created_by, created_at, paid_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) query = query.or(`invoice_number.ilike.%${search}%,notes.ilike.%${search}%`);

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    const items = Array.isArray(res.data) ? res.data.map((record: any) => ({ ...mapInvoice(record), items: [] })) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return mapInvoice({ ...data, items: data.invoice_items });
  },

  async getInvoiceByInpatientRecord(inpatientId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('inpatient_record_id', inpatientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // if not found return null
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    if (!data) return null;
    return mapInvoice({ ...data, items: data.invoice_items });
  },

  async updateInvoice(id: string, payload: Partial<Invoice> & { items?: Array<Partial<InvoiceItem>> }): Promise<Invoice> {
    const transformed: any = {
      ...(payload.customerId !== undefined ? { customer_id: payload.customerId } : {}),
      ...(payload.appointmentId !== undefined ? { appointment_id: payload.appointmentId } : {}),
      ...(payload.inpatientRecordId !== undefined ? { inpatient_record_id: payload.inpatientRecordId } : {}),
      ...(payload.subtotal !== undefined ? { subtotal: payload.subtotal } : {}),
      ...(payload.discountAmount !== undefined ? { discount_amount: payload.discountAmount } : {}),
      ...(payload.loyaltyPointsUsed !== undefined ? { loyalty_points_used: payload.loyaltyPointsUsed } : {}),
      ...(payload.total !== undefined ? { total: payload.total } : {}),
      ...(payload.paymentMethod !== undefined ? { payment_method: payload.paymentMethod } : {}),
      ...(payload.paidAmount !== undefined ? { paid_amount: payload.paidAmount } : {}),
      ...(payload.changeAmount !== undefined ? { change_amount: payload.changeAmount } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {})
    };

    const { data, error } = await supabase.from('invoices').update(transformed).eq('id', id).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to update invoice');

    // replace items if provided
    if (payload.items && payload.items.length) {
      const { error: delErr } = await supabase.from('invoice_items').delete().eq('invoice_id', id);
      if (delErr) throw new Error(delErr.message);

      const rows = payload.items.map((it) => ({
        invoice_id: id,
        item_type: it.itemType || it.item_type,
        reference_id: it.referenceId || it.reference_id,
        name: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice || it.unit_price,
        discount: it.discount,
        total: it.total
      }));

      const { error: insErr } = await supabase.from('invoice_items').insert(rows);
      if (insErr) throw new Error(insErr.message);
    }

    return this.getInvoiceById(id) as Promise<Invoice>;
  },


  async createInvoice(payload: InvoiceCreatePayload): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: `INV-${Date.now()}`,
        customer_id: payload.customerId,
        appointment_id: payload.appointmentId,
        inpatient_record_id: payload.inpatientRecordId,
        subtotal: payload.subtotal,
        discount_amount: payload.discountAmount,
        loyalty_points_used: payload.loyaltyPointsUsed,
        total: payload.total,
        payment_method: payload.paymentMethod,
        paid_amount: payload.paidAmount,
        change_amount: payload.changeAmount,
        status: payload.status,
        notes: payload.notes
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Unable to create invoice');

    const invoiceId = data.id;
    if (payload.items.length) {
      const { error: itemsError } = await supabase.from('invoice_items').insert(
        payload.items.map((item) => ({
          invoice_id: invoiceId,
          item_type: item.itemType,
          reference_id: item.referenceId,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          total: item.total
        }))
      );
      if (itemsError) throw new Error(itemsError.message);
    }

    // Adjust stock: product variants and inventory items
    for (const item of payload.items) {
      try {
        if (item.itemType === 'product_variant' && item.referenceId) {
          await supabase
            .from('product_variants')
            .update({ stock: supabase.raw('stock - ?', [item.quantity]) })
            .eq('id', item.referenceId);
        }

        if (item.itemType === 'inventory_item' && item.referenceId) {
          // use inventoryService to record stock movement (outbound)
          await inventoryService.adjustStock(item.referenceId, -Math.abs(item.quantity), 'outbound', 'invoice', null, `Sold via invoice`);
        }
      } catch (err) {
        // surface error so caller can handle; we don't attempt DB transactions here
        throw new Error((err as Error).message || 'Unable to adjust stock for sold item');
      }
    }

    return this.getInvoiceById(invoiceId) as Promise<Invoice>;
  }
};
