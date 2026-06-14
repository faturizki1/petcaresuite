import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Card, Skeleton } from '@/components/ui';
import { useProduct } from '../petshop.hooks';
import { formatCurrency } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full rounded-3xl" /><Skeleton className="h-40 w-full rounded-3xl" /></div>;
  if (!product) return <div className="p-6">Product not found</div>;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title={product.name} description={product.description || undefined} actions={(
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/staff/petshop/${product.id}/edit`)}>Edit</Button>
        </div>
      )} />

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-slate-600">SKU</h3>
            <p className="text-lg font-semibold text-slate-900">{product.sku}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-600">Base price</h3>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(product.basePrice)}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-slate-600">Variants</h3>
            <div className="mt-3 space-y-3">
              {product.variants.map((v: import('../petshop.types').ProductVariant) => (
                <div key={v.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-700">{v.name}</div>
                      <div className="text-xs text-slate-500">Size: {v.size || '-' } • Color: {v.color || '-'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Stock</div>
                      <div className="text-lg font-semibold text-slate-900">{v.stock}</div>
                      <div className="text-sm text-slate-500">{formatCurrency(v.price)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
