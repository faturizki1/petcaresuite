export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  size?: string | null;
  weight?: number | null;
  color?: string | null;
  price: number;
  stock: number;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  brandId: string;
  sku: string;
  barcode?: string | null;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
}

export interface ProductPayload {
  name: string;
  slug: string;
  categoryId: string;
  brandId: string;
  sku: string;
  barcode?: string;
  basePrice: number;
  description?: string;
}

export interface ProductUpdatePayload extends Partial<ProductPayload> {
  isActive?: boolean;
  variants?: Array<Partial<ProductVariant> & { id?: string }>;
  images?: File[] | Array<{ url: string }>; // files to upload or existing urls
}

export interface ProductVariantPayload {
  productId: string;
  name: string;
  size?: string;
  weight?: number;
  color?: string;
  price: number;
  stock: number;
}

export interface ProductVariantUpdatePayload {
  id?: string;
  name?: string;
  size?: string;
  weight?: number;
  color?: string;
  price?: number;
  stock?: number;
}
