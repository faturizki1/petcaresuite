import React, { useState, useEffect } from 'react';
import { useCustomer, useUpdateCustomer } from '../customers.hooks';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditCustomerPage() {
  const { id } = useParams();
  const { data, isLoading } = useCustomer(id);
  const navigate = useNavigate();
  const mutation = useUpdateCustomer();

  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (data) {
      setFullName((data as any).fullName || '');
      setWhatsapp((data as any).whatsapp || '');
      setEmail((data as any).email || '');
    }
  }, [data]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Not found</div>;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ id, updates: { fullName, whatsapp, email } });
      alert('Updated');
      navigate(`/staff/customers/${id}`);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Customer</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Whatsapp</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <button type="submit" className="px-3 py-1 border rounded">Save</button>
        </div>
      </form>
    </div>
  );
}
