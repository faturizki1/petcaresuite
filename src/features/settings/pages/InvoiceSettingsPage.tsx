import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input } from '@/components/ui';
import { useInvoiceSettings, useUpdateInvoiceSettings } from '../settings.hooks';

export default function InvoiceSettingsPage() {
  const { data } = useInvoiceSettings();
  const update = useUpdateInvoiceSettings();
  const [form, setForm] = useState(data || { prefix: 'INV', nextNumber: 1 });

  async function save() {
    await update.mutateAsync(form);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Invoice Settings" description="Configure invoice numbering and templates." />
      <Card className="p-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Invoice Prefix</label>
            <Input value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Next Number</label>
            <Input type="number" value={form.nextNumber} onChange={(e) => setForm({ ...form, nextNumber: parseInt(e.target.value) })} />
          </div>
          <div>
            <p className="text-sm text-slate-600">Preview: {form.prefix}-{form.nextNumber}</p>
          </div>
          <Button onClick={save}>Save</Button>
        </div>
      </Card>
    </div>
  );
}
