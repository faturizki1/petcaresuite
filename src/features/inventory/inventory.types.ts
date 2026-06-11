export interface InventoryCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  minStock: number;
  currentStock: number;
  pricePerUnit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryBatch {
  id: string;
  itemId: string;
  supplierId?: string | null;
  batchNumber: string;
  quantity: number;
  expiryDate?: string | null;
  purchasePrice: number;
  receivedAt: string;
  createdBy?: string | null;
}

export interface StockMovement {
  id: string;
  itemId: string;
  batchId?: string | null;
  movementType: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface InventoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
}
