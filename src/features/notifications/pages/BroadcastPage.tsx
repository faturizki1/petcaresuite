import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button } from '@/components/ui';
import { useTemplates, useBroadcast } from '../notifications.hooks';

export default function BroadcastPage() {
  const { data: templates = [] } = useTemplates();
  const broadcast = useBroadcast();
  const [templateKey, setTemplateKey] = useState('');
  const [segment, setSegment] = useState('all');

  async function handleSend() {
    await broadcast.mutateAsync({ templateKey, segment });
    // show toast ideally
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Broadcast" description="Send broadcast messages to customer segments" />
      <Card className="p-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Template</label>
            <select value={templateKey} onChange={(e) => setTemplateKey(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
              <option value="">Select template</option>
              {templates.map((t: any) => <option key={t.id} value={t.key}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Segment</label>
            <select value={segment} onChange={(e) => setSegment(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
              <option value="all">All customers</option>
              <option value="vip">VIP customers</option>
              <option value="upcoming_vaccination">Upcoming vaccination</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={!templateKey}>Send Broadcast</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
