import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input } from '@/components/ui';
import { useTestimonials, useManageTestimonial } from '../website.hooks';

export default function TestimonialsPage() {
  const { data } = useTestimonials();
  const manage = useManageTestimonial();
  const items = data || [];
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Testimonials" description="Manage customer testimonials displayed on the website." />
      <div className="grid gap-4">
        {items.map((t: any) => (
          <Card key={t.id} className="p-4 flex justify-between items-start">
            <div>
              <div className="text-lg font-semibold">{t.customer_name}</div>
              <p className="text-sm text-slate-600 mt-1">{t.content}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="ghost" onClick={() => setEditing(t)}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <Card className="p-4">
          <div className="grid gap-2">
            <Input value={editing.customer_name} onChange={(e) => setEditing({ ...editing, customer_name: e.target.value })} />
            <textarea className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm" rows={6} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => { manage.mutate({ id: editing.id, customerName: editing.customer_name, content: editing.content, rating: editing.rating, photoUrl: editing.photo_url, isActive: editing.is_active }); setEditing(null); }}>Save</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
