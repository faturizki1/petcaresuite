import { supabase } from '@/lib/supabase';
import type { Customer, CustomerFormData, GetCustomersParams, PaginatedResult, LoyaltyTransaction } from './customers.types';

function mapCustomer(record: any): Customer {
  return {
    id: record.id,
    fullName: record.full_name,
    whatsapp: record.whatsapp ?? null,
    email: record.email ?? null,
    address: record.address ?? null,
    notes: record.notes ?? null,
    status: record.status,
    loyaltyPoints: record.loyalty_points ?? 0,
    membershipTier: record.membership_tier ?? null,
    registeredAt: record.registration_date ?? record.created_at
  };
}

export const customersService = {
  async getCustomers(params: GetCustomersParams = {}): Promise<PaginatedResult<Customer>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    let query: any = supabase
      .from('customers')
      .select('id, full_name, whatsapp, email, address, status, loyalty_points, membership_tier, registration_date', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.search) {
      query = query.ilike('full_name', `%${params.search}%`);
    }

    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    const res = await query.range(offset, offset + pageSize - 1);

    if (res.error) throw new Error(res.error.message);

    const items: Customer[] = (res.data || []).map(mapCustomer);
    return { items, total: res.count ?? items.length };
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, whatsapp, email, address, notes, status, loyalty_points, membership_tier, registration_date, created_at')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapCustomer(data);
  },

  async createCustomer(payload: CustomerFormData): Promise<Customer> {
    const insert = {
      full_name: payload.fullName,
      whatsapp: payload.whatsapp ?? null,
      email: payload.email ?? null,
      address: payload.address ?? null,
      notes: payload.notes ?? null,
      status: payload.status ?? 'active',
      loyalty_points: 0,
      membership_tier: payload.membershipTier ?? null
    };

    const { data, error } = await supabase.from('customers').insert(insert).select().single();
    if (error) throw new Error(error.message);
    return mapCustomer(data);
  },

  async updateCustomer(id: string, updates: Partial<CustomerFormData>): Promise<Customer> {
    const payload: any = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.membershipTier !== undefined) payload.membership_tier = updates.membershipTier;

    const { data, error } = await supabase.from('customers').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapCustomer(data);
  },

  async updateCustomerStatus(id: string, status: string): Promise<Customer> {
    const { data, error } = await supabase.from('customers').update({ status }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapCustomer(data);
  },

  async getCustomerPets(customerId: string) {
    const { data, error } = await supabase
      .from('pets')
      .select('id, name, photo_url, customer_id, species_id, breed_id, gender, birth_date, weight, color, is_sterilized, microchip_number, qr_code, is_active, created_at, updated_at, species(name), breeds(name)')
      .eq('customer_id', customerId);
    if (error) throw new Error(error.message);
    return (data || []).map((record: any) => ({
      id: record.id,
      name: record.name,
      customerId: record.customer_id,
      photoUrl: record.photo_url ?? null,
      speciesId: record.species_id,
      species: record.species?.name ?? null,
      breedId: record.breed_id,
      breed: record.breeds?.name ?? null,
      gender: record.gender ?? 'unknown',
      birthDate: record.birth_date ?? null,
      weight: record.weight ?? null,
      color: record.color ?? null,
      isSterilized: record.is_sterilized ?? false,
      microchipNumber: record.microchip_number ?? null,
      qrCode: record.qr_code ?? null,
      isActive: record.is_active ?? true,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }));
  },

  async getCustomerInvoices(customerId: string) {
    const { data, error } = await supabase.from('invoices').select('*').eq('customer_id', customerId);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getCustomerActivityLog(customerId: string) {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return data || [];
  },

  async adjustLoyaltyPoints(customerId: string, amount: number, reason?: string): Promise<LoyaltyTransaction> {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .insert({ customer_id: customerId, amount, reason })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      customerId: data.customer_id,
      amount: data.amount,
      reason: data.reason,
      createdAt: data.created_at
    };
  }
};

export default customersService;
