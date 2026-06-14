import React, { useMemo, useState } from 'react';
import { Activity, AlertTriangle, Archive, Box, ClipboardList, Plus, Package, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useExpiringBatches,
  useInventoryBatches,
  useInventoryCategories,
  useInventoryItems,
  useInventoryValue,
  useLowStockItems,
  useStockMovements,
  useSuppliers,
  useCreateInventoryBatch,
  useCreateInventoryItem
} from '../inventory.hooks';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [batchPage, setBatchPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [movementSearch, setMovementSearch] = useState('');
  const [movementType, setMovementType] = useState<'inbound' | 'outbound' | 'adjustment' | ''>('');
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [price, setPrice] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [currentStock, setCurrentStock] = useState('0');
  const [batchItemId, setBatchItemId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [batchQuantity, setBatchQuantity] = useState('0');
  const [batchPrice, setBatchPrice] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const { data: categories = [] } = useInventoryCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { data: inventoryData, isLoading: isLoadingItems } = useInventoryItems({
    page,
    pageSize: 12,
    search,
    categoryId: categoryId || undefined
  });
  const { data: batchesData, isLoading: isLoadingBatches } = useInventoryBatches(batchPage);
  const { data: movementData, isLoading: isLoadingMovements } = useStockMovements({
    page: movementPage,
    pageSize: 12,
    search: movementSearch,
    type: movementType || undefined
  });
  const { data: lowStockItems = [] } = useLowStockItems();
  const { data: expiringBatches = [] } = useExpiringBatches(60);
  const { data: inventoryValue = [] } = useInventoryValue();
  const createItem = useCreateInventoryItem();
  const createBatch = useCreateInventoryBatch();

  const items = inventoryData?.items ?? [];
  const totalItems = inventoryData?.total ?? 0;
  const totalBatches = batchesData?.total ?? 0;
  const totalMovements = movementData?.total ?? 0;

  const inventoryValueTotal = useMemo(
    () => inventoryValue.reduce((sum, category) => sum + category.totalValue, 0),
    [inventoryValue]
  );

  async function handleCreateItem(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryId && categories.length === 0) return;

    await createItem.mutateAsync({
      name: itemName,
      categoryId: categoryId || categories[0]?.id,
      unit,
      minStock: Number(minStock),
      currentStock: Number(currentStock),
      pricePerUnit: Number(price)
    });

    setItemName('');
    setPrice('0');
    setMinStock('0');
    setCurrentStock('0');
  }

  async function handleCreateBatch(event: React.FormEvent) {
    event.preventDefault();
    if (!batchItemId) return;

    await createBatch.mutateAsync({
      itemId: batchItemId,
      supplierId: supplierId || null,
      batchNumber: batchNumber || `BATCH-${Date.now()}`,
      quantity: Number(batchQuantity),
      purchasePrice: Number(batchPrice),
      expiryDate: expiryDate || null
    });

    setBatchNumber('');
    setBatchQuantity('0');
    setBatchPrice('0');
    setExpiryDate('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track items, batches, stock movement, and alerts across your inventory."
        actions={
          <Button onClick={() => setPage(1)}>
            <Plus className="w-4 h-4 mr-2" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 p-4">
              <Box className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Items managed</p>
                <p className="text-2xl font-semibold text-slate-900">{totalItems}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 p-4">
              <ClipboardList className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Batches received</p>
                <p className="text-2xl font-semibold text-slate-900">{totalBatches}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 p-4">
              <Archive className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Suppliers</p>
                <p className="text-2xl font-semibold text-slate-900">{suppliers.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Value in stock</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(inventoryValueTotal)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Low stock alerts</p>
              <p className="text-2xl font-semibold text-slate-900">{lowStockItems.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Inventory summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Keep stock moving smoothly</h2>
                </div>
                <Activity className="h-6 w-6 text-slate-500" />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Average price</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(inventoryValueTotal / Math.max(items.length, 1))}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Expiring soon</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{expiringBatches.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Recent stock movements</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{totalMovements}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Next actions</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">Stock and ordering</h2>
                </div>
                <TrendingUp className="h-6 w-6 text-slate-500" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-700">Low stock items need review.</p>
                  <p className="mt-2 text-sm text-slate-600">Check reorder levels and schedule inbound batches for the next week.</p>
                </div>
                <div className="rounded-3xl border border-sky-100 bg-sky-50 p-4">
                  <p className="text-sm font-medium text-sky-700">Expiry watch.</p>
                  <p className="mt-2 text-sm text-slate-600">{expiringBatches.length} batches are expiring in the next 60 days.</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search inventory items"
                />
                <select
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6">
                <DataTable
                  columns={[
                    { key: 'name', header: 'Item' },
                    { key: 'category', header: 'Category', render: (item: any) => item.categoryName || categories.find((category) => category.id === item.categoryId)?.name || 'Unknown' },
                    { key: 'stock', header: 'Stock', render: (item: any) => item.currentStock },
                    { key: 'minStock', header: 'Min', render: (item: any) => item.minStock },
                    { key: 'pricePerUnit', header: 'Price', render: (item: any) => formatCurrency(item.pricePerUnit) }
                  ]}
                  data={items}
                  isLoading={isLoadingItems}
                  pagination={{ page, pageSize: 12, total: totalItems }}
                  onPageChange={setPage}
                  emptyTitle="No inventory items found"
                  emptyDescription="Adjust filters or create a new item to populate the list."
                />
              </div>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Create inventory item</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Item name</label>
                  <Input value={itemName} onChange={(event) => setItemName(event.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Unit</label>
                    <Input value={unit} onChange={(event) => setUnit(event.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Price per unit</label>
                    <Input type="number" value={price} onChange={(event) => setPrice(event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Min stock</label>
                    <Input type="number" value={minStock} onChange={(event) => setMinStock(event.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Current stock</label>
                    <Input type="number" value={currentStock} onChange={(event) => setCurrentStock(event.target.value)} />
                  </div>
                </div>
                <Button type="submit" disabled={createItem.isLoading}>
                  <Plus className="w-4 h-4 mr-2" /> Add item
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batches">
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Inbound batches</p>
                  <h2 className="text-xl font-semibold text-slate-900">Incoming stock</h2>
                </div>
                <Package className="h-6 w-6 text-slate-500" />
              </div>

              <div className="mt-6">
                <DataTable
                  columns={[
                    { key: 'batchNumber', header: 'Batch' },
                    { key: 'itemName', header: 'Item', render: (batch: any) => batch.itemName || 'Unknown' },
                    { key: 'supplierName', header: 'Supplier', render: (batch: any) => batch.supplierName || '—' },
                    { key: 'quantity', header: 'Qty', render: (batch: any) => batch.quantity },
                    { key: 'expiryDate', header: 'Expiry', render: (batch: any) => (batch.expiryDate ? formatDate(batch.expiryDate, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A') }
                  ]}
                  data={batchesData?.items ?? []}
                  isLoading={isLoadingBatches}
                  pagination={{ page: batchPage, pageSize: 12, total: totalBatches }}
                  onPageChange={setBatchPage}
                  emptyTitle="No batches available"
                  emptyDescription="Receive stock batches to populate the table."
                />
              </div>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Receive stock</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Inventory item</label>
                  <select
                    value={batchItemId}
                    onChange={(event) => setBatchItemId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="">Select item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Batch number</label>
                    <Input value={batchNumber} onChange={(event) => setBatchNumber(event.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Quantity</label>
                    <Input type="number" value={batchQuantity} onChange={(event) => setBatchQuantity(event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Purchase price</label>
                    <Input type="number" value={batchPrice} onChange={(event) => setBatchPrice(event.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Supplier</label>
                    <select
                      value={supplierId}
                      onChange={(event) => setSupplierId(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm"
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Expiry date</label>
                  <Input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} />
                </div>
                <Button type="submit" disabled={createBatch.isLoading}>
                  <Plus className="w-4 h-4 mr-2" /> Receive batch
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={movementSearch}
                  onChange={(event) => {
                    setMovementSearch(event.target.value);
                    setMovementPage(1);
                  }}
                  placeholder="Search movements"
                />
                <select
                  value={movementType}
                  onChange={(event) => {
                    setMovementType(event.target.value as typeof movementType);
                    setMovementPage(1);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">All movements</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Activity className="h-5 w-5 text-slate-500" />
                <p className="text-sm text-slate-500">Page {movementPage}</p>
              </div>
            </div>

            <div className="mt-6">
              <DataTable
                columns={[
                  { key: 'itemName', header: 'Item', render: (movement: any) => movement.itemName || 'Unknown' },
                  { key: 'movementType', header: 'Type', render: (movement: any) => movement.movementType },
                  { key: 'quantity', header: 'Qty', render: (movement: any) => movement.quantity },
                  { key: 'referenceType', header: 'Reference', render: (movement: any) => movement.referenceType || '—' },
                  { key: 'createdAt', header: 'Date', render: (movement: any) => formatDate(movement.createdAt) }
                ]}
                data={movementData?.items ?? []}
                isLoading={isLoadingMovements}
                pagination={{ page: movementPage, pageSize: 12, total: totalMovements }}
                onPageChange={setMovementPage}
                emptyTitle="No stock movements yet"
                emptyDescription="Record inbound, outbound, or adjustment movements from batches or item actions."
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Low stock</p>
                  <h2 className="text-xl font-semibold text-slate-900">Reorder alerts</h2>
                </div>
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>

              <div className="mt-6">
                <DataTable
                  columns={[
                    { key: 'name', header: 'Item' },
                    { key: 'categoryName', header: 'Category', render: (item: any) => item.categoryName || 'Unknown' },
                    { key: 'stock', header: 'Stock', render: (item: any) => item.currentStock },
                    { key: 'minStock', header: 'Min', render: (item: any) => item.minStock }
                  ]}
                  data={lowStockItems}
                  emptyTitle="Everything stocked"
                  emptyDescription="No items are below the reorder level right now."
                />
              </div>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Expiring batches</p>
                  <h2 className="text-xl font-semibold text-slate-900">Expiry alerts</h2>
                </div>
                <Package className="h-6 w-6 text-slate-500" />
              </div>

              <div className="mt-6">
                <DataTable
                  columns={[
                    { key: 'batchNumber', header: 'Batch' },
                    { key: 'itemName', header: 'Item', render: (batch: any) => batch.itemName || 'Unknown' },
                    { key: 'quantity', header: 'Qty', render: (batch: any) => batch.quantity },
                    { key: 'expiryDate', header: 'Expiry', render: (batch: any) => formatDate(batch.expiryDate) }
                  ]}
                  data={expiringBatches}
                  emptyTitle="No expiring batches"
                  emptyDescription="All batches are healthy for the next 60 days."
                />
              </div>
            </Card>
          </div>

          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Inventory value</p>
                <h2 className="text-xl font-semibold text-slate-900">Value by category</h2>
              </div>
              <TrendingUp className="h-6 w-6 text-slate-500" />
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Category</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inventoryValue.map((category) => (
                    <tr key={category.categoryId}>
                      <td className="px-4 py-3 text-slate-900">{category.categoryName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(category.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
