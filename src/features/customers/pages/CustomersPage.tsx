import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../customers.hooks';
import CustomerStatusBadge from '../components/CustomerStatusBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input, Skeleton } from '@/components/ui';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive' | 'blacklisted'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCustomers({ page, pageSize: 10, search, status });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer records, loyalty, and communication history."
        actions={
          <Link to="/staff/customers/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or contact"
            className="border-0 px-0 ring-0 focus:ring-0"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blacklisted">Banned</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-3"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center">No customers found.</div>
        ) : (
          <table className="w-full min-w-full table-auto border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Contact</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Loyalty</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Registered</th>
              </tr>
            </thead>
            <tbody>
              {items.map((customer) => (
                <tr key={customer.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <Link to={`/staff/customers/${customer.id}`} className="font-medium text-slate-900 hover:text-slate-700">
                      {customer.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div>{customer.whatsapp}</div>
                    <div className="text-sm text-slate-500">{customer.email}</div>
                  </td>
                  <td className="px-4 py-4"><CustomerStatusBadge status={customer.status} /></td>
                  <td className="px-4 py-4">{customer.loyaltyPoints}</td>
                  <td className="px-4 py-4">{new Date(customer.registeredAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>Showing {items.length} of {total}</div>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-slate-200 px-3 py-2">
            Prev
          </button>
          <button onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-slate-200 px-3 py-2">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
