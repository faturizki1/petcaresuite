import React, { useMemo, useState } from 'react';
import { Plus, Box, ClipboardList, Archive } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useInventoryCategories, useInventoryItems, useInventoryBatches, useSuppliers, useCreateInventoryItem, useCreateInventoryBatch } from '../inventory.hooks';
import { formatCurrency } from '@/lib/utils';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
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
  const { data, isLoading } = useInventoryItems({ page, pageSize: 12, search, categoryId: categoryId || undefined });
  const { data: batchesData } = useInventoryBatches(1);
  const createItem = useCreateInventoryItem();
  const createBatch = useCreateInventoryBatch();

  const items = data?.items ?? [];
  const totalItems = data?.total ?? 0;

  const lowStockCount = useMemo(() => items.filter((item) => item.currentStock <= item.minStock).length, [items]);

  async function handleCreateItem(event: React.FormEvent) {
    event.preventDefault();
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
        description="Manage stock items, suppliers, inbound batches, and low-stock alerts."
        actions={
          <Button onClick={() => setPage(1)}>
            <Plus className="w-4 h-4 mr-2" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-4 p-5">
              <Box className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Total inventory items</p>
                <p className="text-2xl font-semibold text-slate-900">{totalItems}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <ClipboardList className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Low stock count</p>
                <p className="text-2xl font-semibold text-slate-900">{lowStockCount}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <Archive className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Supplier partners</p>
                <p className="text-2xl font-semibold text-slate-900">{suppliers.length}</p>
              </div>
            </Card>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search inventory items"
                  className="border-0 bg-transparent px-0 text-sm focus:ring-0"
                />
              </div>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
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
                  { key: 'name', title: 'Item' },
                  { key: 'category', title: 'Category', render: (item: any) => categories.find((category) => category.id === item.categoryId)?.name ?? item.categoryId },
                  { key: 'stock', title: 'Stock', render: (item: any) => item.currentStock },
                  { key: 'minStock', title: 'Min', render: (item: any) => item.minStock },
                  { key: 'pricePerUnit', title: 'Price', render: (item: any) => formatCurrency(item.pricePerUnit) }
                ]}
                data={items}
                isLoading={isLoading}
                pagination={{ page, pageSize: 12, total: totalItems }}
                onPageChange={(nextPage) => setPage(nextPage)}
                emptyTitle="No inventory items found"
                emptyDescription="Add a new item or update filters to find inventory stock."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Add new inventory item</h2>
            <form onSubmit={handleCreateItem} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Item name</label>
                <Input value={itemName} onChange={(event) => setItemName(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
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
            </form>
          </Card>

          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Receive stock batch</h2>
            <form onSubmit={handleCreateBatch} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Inventory item</label>
                <select value={batchItemId} onChange={(event) => setBatchItemId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
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
                  <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
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
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
