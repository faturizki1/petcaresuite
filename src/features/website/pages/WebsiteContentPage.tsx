import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button } from '@/components/ui';
import { useWebsiteContent, useUpdateWebsiteContent } from '../website.hooks';

export default function WebsiteContentPage() {
  const { data = [] } = useWebsiteContent();
  const update = useUpdateWebsiteContent();
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Website Content" description="Manage hero, services, and other content sections." />
      <div className="grid gap-4">
        {data.map((sec: any) => (
          <Card key={sec.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{sec.section_key}</h3>
                <p className="text-sm text-slate-600 mt-2">{JSON.stringify(sec.content).slice(0, 200)}</p>
              </div>
              <div>
                <Button variant="ghost" onClick={() => setEditing(sec)}>Edit</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold">Edit {editing.section_key}</h4>
          <textarea className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm" rows={8} value={JSON.stringify(editing.content, null, 2)} onChange={(e) => setEditing({ ...editing, content: JSON.parse(e.target.value) })} />
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => { update.mutate({ sectionKey: editing.section_key, content: editing.content }); setEditing(null); }}>Save</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
