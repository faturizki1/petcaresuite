import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Upload, Image, Edit3, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input, Textarea } from '@/components/ui';
import { useBrands, useProductCategories, useProducts, useProduct, useCreateProduct, useUpdateProduct, useCreateProductVariant, useUpdateVariantStock } from '../petshop.hooks';
import type { ProductVariant } from '../petshop.types';
import { slugify } from '@/lib/utils';

function buildSlug(name: string) {
  return slugify(name || '').toLowerCase();
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editMode = Boolean(id);
  const { data: categories = [] } = useProductCategories();
  const { data: brands = [] } = useBrands();
  const { data: product } = useProduct(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const createVariant = useCreateProductVariant();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [basePrice, setBasePrice] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<Array<ProductVariant & { tempId: string }>>([]);
  const [images, setImages] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description || '');
      setCategoryId(product.categoryId);
      setBrandId(product.brandId);
      setSku(product.sku);
      setBarcode(product.barcode || '');
      setBasePrice(String(product.basePrice));
      setIsActive(product.isActive);
      setVariants(product.variants.map((variant) => ({ ...variant, tempId: variant.id })));
    }
  }, [product]);

  useEffect(() => {
    if (!editMode) {
      setSlug(buildSlug(name));
    }
  }, [name, editMode]);

  const totalStock = useMemo(() => variants.reduce((sum, variant) => sum + variant.stock, 0), [variants]);

  function addVariantRow() {
    setVariants((current) => [...current, { id: '', tempId: `temp-${Date.now()}`, productId: '', name: '', size: '', weight: 0, color: '', price: 0, stock: 0 }]);
  }

  function updateVariant(index: number, field: keyof ProductVariant, value: string | number | null) {
    setVariants((current) => current.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant)));
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, i) => i !== index));
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;
    setImages((current) => [...current, ...Array.from(files)]);
  }

  function moveImage(fromIndex: number, toIndex: number) {
    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      name,
      slug,
      description,
      categoryId,
      brandId,
      sku,
      barcode: barcode || undefined,
      basePrice: Number(basePrice),
      isActive,
      variants: variants.map((variant) => ({
        id: variant.id || undefined,
        name: variant.name,
        size: variant.size || undefined,
        weight: variant.weight || undefined,
        color: variant.color || undefined,
        price: variant.price,
        stock: variant.stock
      })),
      images
    };

    try {
      if (editMode && id) {
        await updateProduct.mutateAsync({ id, payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      navigate('/staff/petshop');
    } catch (error) {
      toast.error('Failed to save product. Please try again.');
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={editMode ? 'Edit Product' : 'Create Product'}
        description={editMode ? 'Update product details, variants, and images.' : 'Add a new petshop product and define variants.'}
      />

      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Basic information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug</label>
              <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Brand</label>
              <select value={brandId} onChange={(event) => setBrandId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">SKU</label>
              <Input value={sku} onChange={(event) => setSku(event.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Barcode</label>
              <Input value={barcode} onChange={(event) => setBarcode(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Base price</label>
              <Input type="number" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input id="activeToggle" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900" />
              <label htmlFor="activeToggle" className="text-sm text-slate-700">Active product</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2" rows={4} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Variants</h2>
            <Button type="button" variant="outline" onClick={addVariantRow}>
              <Plus className="w-4 h-4 mr-2" /> Add variant
            </Button>
          </div>
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={variant.tempId} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Variant name</label>
                  <Input value={variant.name} onChange={(event) => updateVariant(index, 'name', event.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Size</label>
                  <Input value={variant.size || ''} onChange={(event) => updateVariant(index, 'size', event.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Weight</label>
                  <Input type="number" value={variant.weight ?? 0} onChange={(event) => updateVariant(index, 'weight', Number(event.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Color</label>
                  <Input value={variant.color || ''} onChange={(event) => updateVariant(index, 'color', event.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Price</label>
                  <Input type="number" value={variant.price} onChange={(event) => updateVariant(index, 'price', Number(event.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Stock</label>
                  <Input type="number" value={variant.stock} onChange={(event) => updateVariant(index, 'stock', Number(event.target.value))} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="button" variant="danger" onClick={() => removeVariant(index)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            ))}
            {variants.length === 0 && <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">No variants added yet.</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Images</h2>
            <Button type="button" variant="outline" onClick={() => document.getElementById('productImages')?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Add images
            </Button>
          </div>
          <input id="productImages" type="file" multiple accept="image/*" onChange={handleFiles} className="sr-only" />
          {images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <div key={`${image.name}-${index}`} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{image.name}</span>
                    <button type="button" className="text-slate-500 hover:text-slate-900" onClick={() => setImages((current) => current.filter((_, i) => i !== index))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">{index === primaryImageIndex ? 'Primary image' : 'Click to promote'}</p>
                  <button type="button" className="mt-2 text-slate-700 underline" onClick={() => setPrimaryImageIndex(index)}>
                    {index === primaryImageIndex ? 'Primary' : 'Set primary'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Drag images here or choose files to upload.</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={createProduct.isLoading || updateProduct.isLoading}>
            <Edit3 className="w-4 h-4 mr-2" /> {editMode ? 'Update product' : 'Create product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/staff/petshop')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
