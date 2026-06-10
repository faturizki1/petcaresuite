import React, { useState } from 'react';
import { useCreateCustomer } from '../customers.hooks';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateCustomerPage() {
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
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
      await mutation.mutateAsync({ fullName, whatsapp, email });
      alert('Customer created');
      navigate('/staff/customers');
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Customer</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2 border rounded" />
          {errors.fullName && <div className="text-red-600 text-sm">{errors.fullName}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium">Whatsapp</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" />
          {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isLoading} className="inline-flex items-center px-3 py-1 border rounded bg-blue-50">
            <Plus className="w-4 h-4 mr-2" /> {mutation.isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
