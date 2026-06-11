export interface LedgerTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  entryDate: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  createdAt: string;
}

export interface AccountBalance {
  account: string;
  balance: number;
}

export interface AccountingQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}

export interface JournalCreatePayload {
  entryDate: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  category: string;
}
