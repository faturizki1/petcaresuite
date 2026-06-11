import { supabase } from '@/lib/supabase';
import type { Product, ProductVariant, ProductQueryParams, ProductPayload, ProductVariantPayload, ProductCategory, Brand } from './petshop.types';

function mapCategory(record: any): ProductCategory {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    createdAt: record.created_at
  };
}

function mapBrand(record: any): Brand {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.created_at
  };
}

function mapVariant(record: any): ProductVariant {
  return {
    id: record.id,
    productId: record.product_id,
    name: record.name,
    size: record.size,
    weight: Number(record.weight),
    color: record.color,
    price: Number(record.price),
    stock: record.stock,
    createdAt: record.created_at
  };
}

function mapProduct(record: any): Product {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    categoryId: record.category_id,
    brandId: record.brand_id,
    sku: record.sku,
    barcode: record.barcode,
    basePrice: Number(record.base_price),
    isActive: record.is_active,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    variants: Array.isArray(record.variants) ? record.variants.map(mapVariant) : []
  };
}

export const petshopService = {
  async getProductCategories(): Promise<ProductCategory[]> {
    const { data, error } = await supabase.from('product_categories').select('id, name, slug, created_at').order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(mapCategory);
  },

  async getBrands(): Promise<Brand[]> {
    const { data, error } = await supabase.from('brands').select('id, name, created_at').order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(mapBrand);
  },

  async getProducts(params: ProductQueryParams = {}): Promise<{ items: Product[]; total: number }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('products')
      .select('id, name, slug, description, category_id, brand_id, sku, barcode, base_price, is_active, created_at, updated_at, variants(*)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.search) query = query.ilike('name', `%${params.search}%`);
    if (params.categoryId) query = query.eq('category_id', params.categoryId);
    if (params.brandId) query = query.eq('brand_id', params.brandId);

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    const items = Array.isArray(res.data) ? res.data.map(mapProduct) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async createProduct(payload: ProductPayload): Promise<Product> {
    const { data, error } = await supabase.from('products').insert({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      category_id: payload.categoryId,
      brand_id: payload.brandId,
      sku: payload.sku,
      barcode: payload.barcode,
      base_price: payload.basePrice
    }).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to create product');
    return mapProduct({ ...data, variants: [] });
  },

  async createProductVariant(payload: ProductVariantPayload): Promise<ProductVariant> {
    const { data, error } = await supabase.from('product_variants').insert({
      product_id: payload.productId,
      name: payload.name,
      size: payload.size,
      weight: payload.weight,
      color: payload.color,
      price: payload.price,
      stock: payload.stock
    }).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to create product variant');
    return mapVariant(data);
  }
};