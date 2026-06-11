import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from './inventory.service';
import type { InventoryQueryParams } from './inventory.types';

export function useInventoryCategories() {
  return useQuery(['inventoryCategories'], () => inventoryService.getCategories());
}

export function useSuppliers() {
  return useQuery(['suppliers'], () => inventoryService.getSuppliers());
}

export function useInventoryItems(params: InventoryQueryParams) {
  return useQuery(['inventoryItems', params], () => inventoryService.getInventoryItems(params), { keepPreviousData: true });
}

export function useInventoryBatches(page: number) {
  return useQuery(['inventoryBatches', page], () => inventoryService.getInventoryBatches(page), { keepPreviousData: true });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation((payload: any) => inventoryService.createInventoryItem(payload), {
    onSuccess: () => qc.invalidateQueries(['inventoryItems'])
  });
}

export function useCreateInventoryBatch() {
  const qc = useQueryClient();
  return useMutation((payload: any) => inventoryService.createInventoryBatch(payload), {
    onSuccess: () => {
      qc.invalidateQueries(['inventoryBatches']);
      qc.invalidateQueries(['inventoryItems']);
    }
  });
}
