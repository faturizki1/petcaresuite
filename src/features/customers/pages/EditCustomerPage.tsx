import React, { useEffect, useState } from 'react';
import { useCustomer, useUpdateCustomer } from '../customers.hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Skeleton } from '@/components/ui';

export default function EditCustomerPage() {
  const { id } = useParams();
  const { data, isLoading } = useCustomer(id);
  const navigate = useNavigate();
  const mutation = useUpdateCustomer();

  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'vip' | 'blacklisted'>('active');
  const [membershipTier, setMembershipTier] = useState('');

  useEffect(() => {
    if (data) {
      setFullName((data as any).fullName || '');
      setWhatsapp((data as any).whatsapp || '');
      setEmail((data as any).email || '');
      setAddress((data as any).address || '');
      setNotes((data as any).notes || '');
      setStatus((data as any).status || 'active');
      setMembershipTier((data as any).membershipTier || '');
    }
  }, [data]);

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full rounded-3xl" /><Skeleton className="h-40 w-full rounded-3xl" /></div>;
  if (!data) return <div className="p-6">Not found</div>;

  async function onSubmit() {
    try {
      await mutation.mutateAsync({
        id: id as string,
        updates: {
          fullName,
          whatsapp,
          email,
          address,
          notes,
          status,
          membershipTier: membershipTier || undefined
        }
      });
      alert('Updated');
      navigate(`/staff/customers/${id}`);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Customer</h1>
      <div className="space-y-4 max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="vip">VIP</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">WhatsApp</label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input value={email} type="email" onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Membership Tier</label>
            <Input value={membershipTier} onChange={(e) => setMembershipTier(e.target.value)} placeholder="e.g. Gold" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm" rows={4} />
        </div>

        <div className="flex gap-2">
          <Button type="button" onClick={onSubmit}>Save Customer</Button>
        </div>
      </div>
    </div>
  );
}
