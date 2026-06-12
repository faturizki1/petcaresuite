import React, { useState } from 'react';
import { useCreateCustomer } from '../customers.hooks';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';

export default function CreateCustomerPage() {
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'vip' | 'blacklisted'>('active');
  const [membershipTier, setMembershipTier] = useState('');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const navigate = useNavigate();

  const mutation = useCreateCustomer();

  function validate() {
    const e: Record<string,string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await mutation.mutateAsync({ fullName, whatsapp, email, address, notes, status, membershipTier: membershipTier || undefined });
      alert('Customer created');
      navigate('/staff/customers');
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Customer</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            {errors.fullName && <div className="text-red-600 text-sm">{errors.fullName}</div>}
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
            {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
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
          <Button type="submit" disabled={mutation.isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            {mutation.isLoading ? 'Saving...' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
