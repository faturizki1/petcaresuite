import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { useAuditLogs } from '../settings.hooks';

export default function AuditLogPage() {
  const { data, isLoading } = useAuditLogs({ page: 1, pageSize: 50 });
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Track system changes and user actions." />
      <div>
        <DataTable
          columns={[
            { key: 'user_id', title: 'User' },
            { key: 'action', title: 'Action' },
            { key: 'table_name', title: 'Table' },
            { key: 'created_at', title: 'Time', render: (r: any) => new Date(r.created_at).toLocaleString() },
            { key: 'old_value', title: 'Old Value', render: (r: any) => r.old_value ? JSON.stringify(r.old_value).slice(0, 50) : '-' },
            { key: 'new_value', title: 'New Value', render: (r: any) => r.new_value ? JSON.stringify(r.new_value).slice(0, 50) : '-' }
          ]}
          data={items as any}
          isLoading={isLoading}
          emptyTitle="No audit logs"
        />
      </div>
    </div>
  );
}
