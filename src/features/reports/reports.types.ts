export interface FinancialSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface MonthlyPoint {
  month: string;
  value: number;
}

export interface InventoryLowStockItem {
  id: string;
  name: string;
  categoryName: string;
  currentStock: number;
  minStock: number;
}

export interface InventoryBatchExpiry {
  id: string;
  itemName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysRemaining: number;
}

export interface InventoryValueByCategory {
  categoryId: string;
  categoryName: string;
  value: number;
}

export interface InventoryStats {
  lowStockCount: number;
  expiring30: number;
  expiring90: number;
  totalValue: number;
  lowStockItems: InventoryLowStockItem[];
  expiringBatches: InventoryBatchExpiry[];
  stockValueByCategory: InventoryValueByCategory[];
}

export interface ProductStat {
  reference: string;
  name: string;
  qty: number;
  revenue: number;
}

export interface FinancialReport {
  summary: FinancialSummary;
  monthlyTrend: MonthlyPoint[];
}
