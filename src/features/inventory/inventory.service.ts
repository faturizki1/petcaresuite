import { supabase } from '@/lib/supabase';
import type {
  InventoryCategory,
  Supplier,
  InventoryItem,
  InventoryBatch,
  StockMovement,
  InventoryQueryParams
} from './inventory.types';

export const inventoryService = {
  async getCategories(): Promise<InventoryCategory[]> {
    const { data, error } = await supabase.from('inventory_categories').select('id, name, created_at');
    if (error) throw new Error(error.message);
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      createdAt: item.created_at
    }));
  },

  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase.from('suppliers').select('id, name, contact, address, notes, created_at');
    if (error) throw new Error(error.message);
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      contact: item.contact,
      address: item.address,
      notes: item.notes,
      createdAt: item.created_at
    }));
  },

  async getInventoryItems(params: InventoryQueryParams = {}): Promise<{ items: InventoryItem[]; total: number }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('inventory_items').select('id, name, category_id, unit, min_stock, current_stock, price_per_unit, is_active, created_at, updated_at', { count: 'exact' }).order('created_at', { ascending: false });

    if (params.search) query = query.ilike('name', `%${params.search}%`);
    if (params.categoryId) query = query.eq('category_id', params.categoryId);

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);

    const items: InventoryItem[] = Array.isArray(res.data)
      ? res.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          categoryId: item.category_id,
          unit: item.unit,
          minStock: item.min_stock,
          currentStock: item.current_stock,
          pricePerUnit: Number(item.price_per_unit),
          isActive: item.is_active,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }))
      : [];

    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async getInventoryBatches(page = 1, pageSize = 12) {
    const offset = (page - 1) * pageSize;
    const { data, error, count } = await supabase
      .from('inventory_batches')
      .select('id, item_id, supplier_id, batch_number, quantity, expiry_date, purchase_price, received_at, created_by', { count: 'exact' })
      .order('received_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(error.message);
    const items: InventoryBatch[] = Array.isArray(data)
      ? data.map((item: any) => ({
          id: item.id,
          itemId: item.item_id,
          supplierId: item.supplier_id,
          batchNumber: item.batch_number,
          quantity: item.quantity,
          expiryDate: item.expiry_date,
          purchasePrice: Number(item.purchase_price),
          receivedAt: item.received_at,
          createdBy: item.created_by
        }))
      : [];

    return { items, total: typeof count === 'number' ? count : items.length };
  },

  async createInventoryItem(payload: {
    name: string;
    categoryId: string;
    unit: string;
    minStock: number;
    currentStock: number;
    pricePerUnit: number;
  }): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        name: payload.name,
        category_id: payload.categoryId,
        unit: payload.unit,
        min_stock: payload.minStock,
        current_stock: payload.currentStock,
        price_per_unit: payload.pricePerUnit
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Unable to create inventory item');

    return {
      id: data.id,
      name: data.name,
      categoryId: data.category_id,
      unit: data.unit,
      minStock: data.min_stock,
      currentStock: data.current_stock,
      pricePerUnit: Number(data.price_per_unit),
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createInventoryBatch(payload: {
    itemId: string;
    supplierId?: string | null;
    batchNumber: string;
    quantity: number;
    expiryDate?: string | null;
    purchasePrice: number;
  }): Promise<InventoryBatch> {
    const { data, error } = await supabase
      .from('inventory_batches')
      .insert({
        item_id: payload.itemId,
        supplier_id: payload.supplierId,
        batch_number: payload.batchNumber,
        quantity: payload.quantity,
        expiry_date: payload.expiryDate,
        purchase_price: payload.purchasePrice
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Unable to create inventory batch');

    await this.adjustStock(payload.itemId, payload.quantity, 'inbound', 'batch', data.id, `Receipt ${payload.batchNumber}`);

    return {
      id: data.id,
      itemId: data.item_id,
      supplierId: data.supplier_id,
      batchNumber: data.batch_number,
      quantity: data.quantity,
      expiryDate: data.expiry_date,
      purchasePrice: Number(data.purchase_price),
      receivedAt: data.received_at,
      createdBy: data.created_by
    };
  },

  async adjustStock(
    itemId: string,
    quantity: number,
    movementType: 'inbound' | 'outbound' | 'adjustment',
    referenceType?: string,
    referenceId?: string,
    notes?: string
  ): Promise<boolean> {
    const { error: movementError } = await supabase.from('stock_movements').insert({
      item_id: itemId,
      movement_type: movementType,
      quantity,
      reference_type: referenceType,
      reference_id: referenceId,
      notes
    });
    if (movementError) throw new Error(movementError.message);

    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ current_stock: supabase.raw('current_stock + ?', [quantity]) })
      .eq('id', itemId);

    if (updateError) throw new Error(updateError.message);
    return true;
  }
};
