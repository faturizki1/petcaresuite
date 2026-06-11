import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useTemplates, useUpdateTemplate } from '../notifications.hooks';

export default function TemplatesPage() {
  const { data, isLoading } = useTemplates();
  const update = useUpdateTemplate();
  const items = data || [];
  const [editing, setEditing] = useState<any | null>(null);

  async function save() {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, updates: { body: editing.body, title: editing.title } });
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Templates" description="Manage templates with placeholders like {{pet_name}}" />
      <div>
        <DataTable
          columns={[
            { key: 'key', title: 'Key' },
            { key: 'title', title: 'Title' },
            { key: 'body', title: 'Body', render: (r: any) => <div className="truncate max-w-md">{r.body}</div> },
            { key: 'actions', title: 'Actions', render: (r: any) => <Button size="sm" onClick={() => setEditing(r)}>Edit</Button> }
          ]}
          data={items as any}
          isLoading={isLoading}
          emptyTitle="No templates"
          emptyDescription="Create templates in DB to use with broadcasts"
        />

        {editing && (
          <Card className="mt-4 p-4">
            <div className="grid gap-2">
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm" rows={6} />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
