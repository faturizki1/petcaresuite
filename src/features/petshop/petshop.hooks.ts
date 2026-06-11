import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petshopService } from './petshop.service';
import type { ProductQueryParams, ProductPayload, ProductVariantPayload } from './petshop.types';

export function useProductCategories() {
  return useQuery(['productCategories'], () => petshopService.getProductCategories());
}

export function useBrands() {
  return useQuery(['brands'], () => petshopService.getBrands());
}

export function useProducts(params: ProductQueryParams) {
  return useQuery(['products', params], () => petshopService.getProducts(params), { keepPreviousData: true });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation((payload: ProductPayload) => petshopService.createProduct(payload), {
    onSuccess: () => qc.invalidateQueries(['products'])
  });
}

export function useCreateProductVariant() {
  const qc = useQueryClient();
  return useMutation((payload: ProductVariantPayload) => petshopService.createProductVariant(payload), {
    onSuccess: () => qc.invalidateQueries(['products'])
  });
}
