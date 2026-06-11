export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemType: string;
  referenceId?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  appointmentId?: string | null;
  inpatientRecordId?: string | null;
  subtotal: number;
  discountAmount: number;
  loyaltyPointsUsed: number;
  total: number;
  paymentMethod: string;
  paymentMethodSecondary?: string | null;
  paidAmount: number;
  changeAmount: number;
  status: string;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  paidAt?: string | null;
  items: InvoiceItem[];
}

export interface InvoiceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface InvoiceCreatePayload {
  customerId?: string;
  appointmentId?: string;
  inpatientRecordId?: string;
  subtotal: number;
  discountAmount: number;
  loyaltyPointsUsed: number;
  total: number;
  paymentMethod: string;
  paidAmount: number;
  changeAmount: number;
  status: string;
  notes?: string;
  items: Array<{
    itemType: string;
    referenceId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
}
