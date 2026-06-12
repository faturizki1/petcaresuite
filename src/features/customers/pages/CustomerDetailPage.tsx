import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomer, useCustomerPets, useCustomerInvoices, useCustomerActivityLog } from '../customers.hooks';
import LoyaltyPointsCard from '../components/LoyaltyPointsCard';
import CustomerStatusBadge from '../components/CustomerStatusBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useCustomer(id);
  const petsQuery = useCustomerPets(id);
  const invoicesQuery = useCustomerInvoices(id);
  const activityQuery = useCustomerActivityLog(id);
  const [tab, setTab] = useState<'overview'|'pets'|'history'|'invoices'|'activity'>('overview');

  const customer = data as any;

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!customer) return <div className="p-6">Customer not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={customer.fullName}
        description="Customer details, activity, pets, invoices, and loyalty status."
        actions={
          <Link to={`/staff/customers/${id}/edit`}>
            <Button>Edit customer</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <CustomerStatusBadge status={customer.status} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Registered</p>
                <p className="mt-2 font-semibold text-slate-900">{new Date(customer.registeredAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Contact</p>
                <p className="mt-2 text-slate-900">{customer.whatsapp || 'No whatsapp'}</p>
                <p className="mt-1 text-sm text-slate-600">{customer.email || 'No email'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Address</p>
                <p className="mt-2 text-slate-900">{customer.address || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Membership tier</p>
                <p className="mt-2 text-slate-900">{customer.membershipTier || 'Standard'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Notes</p>
                <p className="mt-2 text-slate-900">{customer.notes || 'No notes added.'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Customer actions</p>
                <p className="mt-2 text-slate-900">Use the tabs to explore related data for this customer.</p>
              </div>
              <Link to={`/staff/pets/create?owner=${customer.id}`}>
                <Button>Register pet</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoyaltyPointsCard customerId={customer.id} points={customer.loyaltyPoints} />
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-3 border-b pb-4">
          {(['overview', 'pets', 'history', 'invoices', 'activity'] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setTab(entry)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${tab === entry ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              {entry === 'overview' ? 'Overview' : entry === 'pets' ? 'Pets' : entry === 'history' ? 'Medical History' : entry === 'invoices' ? 'Invoices' : 'Activity'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Contact details</p>
              <p className="mt-4 text-slate-900">{customer.whatsapp || 'No whatsapp'} • {customer.email || 'No email'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Loyalty points</p>
              <p className="mt-4 text-2xl font-semibold text-slate-900">{customer.loyaltyPoints}</p>
            </div>
          </div>
        )}

        {tab === 'pets' && (
          <div className="space-y-4">
            {petsQuery.isLoading ? (
              <div className="text-sm text-slate-600">Loading pets...</div>
            ) : petsQuery.data?.length ? (
              <div className="grid gap-3">
                {petsQuery.data.map((pet: any) => (
                  <div key={pet.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{pet.name}</p>
                        <p className="text-sm text-slate-600">{pet.species} • {pet.breed || 'Unknown breed'}</p>
                      </div>
                      <Link to={`/staff/pets/${pet.id}`} className="text-sm text-slate-700 underline">View pet</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No pets registered for this customer yet.</div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-4">
            {activityQuery.isLoading ? (
              <div className="text-sm text-slate-600">Loading medical history...</div>
            ) : activityQuery.data?.length ? (
              <ul className="space-y-3">
                {activityQuery.data.map((entry: any) => (
                  <li key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      <span className="font-semibold">{entry.event || 'Log entry'}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{entry.notes || 'No details available.'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No medical history entries found.</div>
            )}
          </div>
        )}

        {tab === 'invoices' && (
          <div className="space-y-4">
            {invoicesQuery.isLoading ? (
              <div className="text-sm text-slate-600">Loading invoices...</div>
            ) : invoicesQuery.data?.length ? (
              <div className="grid gap-3">
                {invoicesQuery.data.map((invoice: any) => (
                  <div key={invoice.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">Invoice #{invoice.id}</p>
                        <p className="text-sm text-slate-600">Total: {invoice.total_amount ?? invoice.total ?? 'N/A'}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">{invoice.status || 'unknown'}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{invoice.description || invoice.notes || 'No invoice notes.'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No invoices available for this customer.</div>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="space-y-4">
            {activityQuery.isLoading ? (
              <div className="text-sm text-slate-600">Loading activity log...</div>
            ) : activityQuery.data?.length ? (
              <ul className="space-y-3">
                {activityQuery.data.map((entry: any) => (
                  <li key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">{new Date(entry.created_at).toLocaleString()}</p>
                    <p className="mt-2 text-slate-900">{entry.event || 'Activity event'}</p>
                    <p className="mt-1 text-sm text-slate-600">{entry.notes || 'No details available.'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No activity logged for this customer yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
