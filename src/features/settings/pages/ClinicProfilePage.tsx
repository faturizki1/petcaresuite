import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input } from '@/components/ui';
import { useClinicProfile, useUpdateClinicProfile } from '../settings.hooks';

export default function ClinicProfilePage() {
  const { data } = useClinicProfile();
  const update = useUpdateClinicProfile();
  const [form, setForm] = useState(data || { name: '', address: '', phone: '', email: '' });

  async function save() {
    await update.mutateAsync(form);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Clinic Profile" description="Manage clinic information." />
      <Card className="p-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Clinic Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Button onClick={save}>Save</Button>
        </div>
      </Card>
    </div>
  );
}
