import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useArticles, useCreateArticle, useUpdateArticle, useDeleteArticle } from '../website.hooks';

export default function ArticlesAdminPage() {
  const { data } = useArticles({ page: 1, pageSize: 50 });
  const create = useCreateArticle();
  const update = useUpdateArticle();
  const del = useDeleteArticle();
  const items = (data?.items || []);
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Articles" description="Manage public articles and blog posts." />
      <div>
        <DataTable
          columns={[
            { key: 'title', title: 'Title' },
            { key: 'slug', title: 'Slug' },
            { key: 'isPublished', title: 'Published', render: (r: any) => r.is_published ? 'Yes' : 'No' },
            { key: 'actions', title: 'Actions', render: (r: any) => (<div className="flex gap-2"><Button size="sm" onClick={() => setEditing(r)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => del.mutate(r.id)}>Delete</Button></div>) }
          ]}
          data={items as any}
          isLoading={!data}
        />
      </div>

      {editing && (
        <Card className="p-4">
          <div className="grid gap-2">
            <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            <textarea className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm" rows={8} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => { update.mutate({ id: editing.id, updates: editing }); setEditing(null); }}>Save</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
