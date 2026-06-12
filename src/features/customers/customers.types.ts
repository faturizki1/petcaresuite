export type CustomerStatus = 'active' | 'inactive' | 'vip' | 'blacklisted';

export interface Customer {
  id: string;
  fullName: string;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  status: CustomerStatus;
  loyaltyPoints: number;
  membershipTier?: string | null;
  registeredAt: string; // ISO date
}

export interface CustomerFormData {
  fullName: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  status?: CustomerStatus;
  membershipTier?: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  amount: number;
  reason?: string;
  createdAt: string;
}

export interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CustomerStatus | 'all';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}
