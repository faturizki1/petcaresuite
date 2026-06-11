import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posService } from './pos.service';
import type { InvoiceCreatePayload, InvoiceQueryParams } from './pos.types';

export function useInvoices(params: InvoiceQueryParams) {
  return useQuery(['invoices', params], () => posService.getInvoices(params), { keepPreviousData: true });
}

export function useInvoice(id?: string) {
  return useQuery(['invoice', id], () => (id ? posService.getInvoiceById(id) : Promise.resolve(null)), {
    enabled: Boolean(id)
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation((payload: InvoiceCreatePayload) => posService.createInvoice(payload), {
    onSuccess: () => queryClient.invalidateQueries(['invoices'])
  });
}
