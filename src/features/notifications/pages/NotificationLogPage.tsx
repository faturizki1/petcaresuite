import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge, Button } from '@/components/ui';
import { useNotificationLogs, useRetryNotification } from '../notifications.hooks';

export default function NotificationLogPage() {
  const { data, isLoading } = useNotificationLogs({ page: 1, pageSize: 50 });
  const retry = useRetryNotification();

  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Log" description="History of sent notifications" />
      <div>
        <DataTable
          columns={[
            { key: 'channel', title: 'Channel', render: (r: any) => <Badge>{r.channel.toUpperCase()}</Badge> },
            { key: 'recipient', title: 'Recipient' },
            { key: 'template', title: 'Template', render: (r: any) => r.template_key || '-' },
            { key: 'status', title: 'Status', render: (r: any) => r.status === 'success' ? <Badge className="bg-green-100 text-green-800">Success</Badge> : (r.status === 'failed' ? <Badge className="bg-red-100 text-red-800">Failed</Badge> : <Badge>Pending</Badge>) },
            { key: 'sentAt', title: 'Sent At', render: (r: any) => r.sent_at ? new Date(r.sent_at).toLocaleString() : '-' },
            { key: 'actions', title: 'Actions', render: (r: any) => r.status === 'failed' ? <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); retry.mutate(r.id); }}>Retry</Button> : null }
          ]}
          data={items as any}
          isLoading={isLoading}
          emptyTitle="No notifications"
          emptyDescription="No notification logs yet"
        />
      </div>
    </div>
  );
}
