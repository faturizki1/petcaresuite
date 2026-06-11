import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountingService } from './accounting.service';
import type { AccountingQueryParams, JournalCreatePayload } from './accounting.types';

export function useLedgerTransactions(params: AccountingQueryParams) {
  return useQuery(['ledgerTransactions', params], () => accountingService.getLedgerTransactions(params), { keepPreviousData: true });
}

export function useJournalEntries(params: AccountingQueryParams) {
  return useQuery(['journalEntries', params], () => accountingService.getJournalEntries(params), { keepPreviousData: true });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation((payload: JournalCreatePayload) => accountingService.createJournalEntry(payload), {
    onSuccess: () => queryClient.invalidateQueries(['journalEntries'])
  });
}
