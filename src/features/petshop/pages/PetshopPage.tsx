import React, { useState } from 'react';
import { Plus, Package, Tag, Archive } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useBrands, useProductCategories, useProducts, useCreateProduct, useCreateProductVariant } from '../petshop.hooks';
import { formatCurrency } from '@/lib/utils';

export default function PetshopPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [page, setPage] = useState(1);
  const [productName, setProductName] = useState('');
  const [productSlug, setProductSlug] = useState('');
  const [productSku, setProductSku] = useState('');
  const [productPrice, setProductPrice] = useState('0');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productBrandId, setProductBrandId] = useState('');
  const [variantName, setVariantName] = useState('');
  const [variantPrice, setVariantPrice] = useState('0');
  const [variantStock, setVariantStock] = useState('0');
  const [variantProductId, setVariantProductId] = useState('');

  const { data: categories = [] } = useProductCategories();
  const { data: brands = [] } = useBrands();
  const { data, isLoading } = useProducts({ page, pageSize: 12, search, categoryId: categoryId || undefined, brandId: brandId || undefined });
  const createProduct = useCreateProduct();
  const createVariant = useCreateProductVariant();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const activeProducts = items.filter((item) => item.isActive).length;
  const totalVariants = items.reduce((count, item) => count + item.variants.length, 0);

  async function handleCreateProduct(event: React.FormEvent) {
    event.preventDefault();
    await createProduct.mutateAsync({
      name: productName,
      slug: productSlug,
      sku: productSku,
      categoryId: productCategoryId || categories[0]?.id,
      brandId: productBrandId || brands[0]?.id,
      basePrice: Number(productPrice)
    });
    setProductName('');
    setProductSlug('');
    setProductSku('');
    setProductPrice('0');
  }

  async function handleCreateVariant(event: React.FormEvent) {
    event.preventDefault();
    if (!variantProductId) return;
    await createVariant.mutateAsync({
      productId: variantProductId,
      name: variantName || 'Default',
      price: Number(variantPrice),
      stock: Number(variantStock)
    });
    setVariantName('');
    setVariantPrice('0');
    setVariantStock('0');
    setVariantProductId('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Petshop"
        description="Manage product catalog, variants, and retail inventory for your petstore." 
        actions={
          <Button onClick={() => setPage(1)}>
            <Plus className="w-4 h-4 mr-2" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-4 p-5">
              <Package className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Products</p>
                <p className="text-2xl font-semibold text-slate-900">{items.length}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <Tag className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Variants</p>
                <p className="text-2xl font-semibold text-slate-900">{totalVariants}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <Archive className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Active products</p>
                <p className="text-2xl font-semibold text-slate-900">{activeProducts}</p>
              </div>
            </Card>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search products"
                className="border-0 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:ring-0"
              />
              <div className="flex items-center gap-3">
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
                <select
                  value={brandId}
                  onChange={(event) => setBrandId(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">All brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <DataTable
                columns={[
                  { key: 'name', title: 'Product' },
                  { key: 'sku', title: 'SKU' },
                  { key: 'brand', title: 'Brand', render: (record: any) => brands.find((brand) => brand.id === record.brandId)?.name ?? record.brandId },
                  { key: 'price', title: 'Base price', render: (record: any) => formatCurrency(record.basePrice) },
                  { key: 'variants', title: 'Variants', render: (record: any) => record.variants.length }
                ]}
                data={items}
                isLoading={isLoading}
                pagination={{ page, pageSize: 12, total }}
                onPageChange={(nextPage) => setPage(nextPage)}
                emptyTitle="No products found"
                emptyDescription="Add a new product or adjust search filters to display products."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">New product</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <Input value={productName} onChange={(event) => setProductName(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Slug</label>
                <Input value={productSlug} onChange={(event) => setProductSlug(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">SKU</label>
                <Input value={productSku} onChange={(event) => setProductSku(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select value={productCategoryId} onChange={(event) => setProductCategoryId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Brand</label>
                <select value={productBrandId} onChange={(event) => setProductBrandId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Base price</label>
                <Input type="number" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} />
              </div>
              <Button type="submit" disabled={createProduct.isLoading}>
                <Plus className="w-4 h-4 mr-2" /> Add product
              </Button>
            </div>
          </Card>

          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">New variant</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Product</label>
                <select value={variantProductId} onChange={(event) => setVariantProductId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
                  <option value="">Select product</option>
                  {items.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Variant name</label>
                <Input value={variantName} onChange={(event) => setVariantName(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Price</label>
                <Input type="number" value={variantPrice} onChange={(event) => setVariantPrice(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Stock</label>
                <Input type="number" value={variantStock} onChange={(event) => setVariantStock(event.target.value)} />
              </div>
              <Button type="submit" disabled={createVariant.isLoading}>
                <Plus className="w-4 h-4 mr-2" /> Add variant
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
