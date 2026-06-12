import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input } from '@/components/ui';
import { useMedicalRecords } from '../medical-records.hooks';

export default function MedicalRecordsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useMedicalRecords({ page, pageSize: 10, search });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo(
    () => [
      { key: 'date', title: 'Date', render: (record: any) => new Date(record.date).toLocaleDateString() },
      { key: 'type', title: 'Type', render: (record: any) => record.recordType ?? 'Consultation' },
      { key: 'petName', title: 'Pet', render: (record: any) => record.petName || record.petId },
      { key: 'doctorName', title: 'Doctor', render: (record: any) => record.doctorName || record.doctorId },
      { key: 'prescriptions', title: 'Prescriptions', render: (record: any) => record.prescriptions?.length ?? 0 },
      { key: 'attachments', title: 'Attachments', render: (record: any) => record.attachments?.length ?? 0 }
    ],
    []
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Medical Records"
        description="Review SOAP notes, prescriptions, and attachments for each pet visit."
        actions={
          <Button onClick={() => navigate('/doctor/medical-records/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search pet or doctor ID"
            className="border-0 px-0 ring-0 focus:ring-0"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        pagination={{ page, pageSize: 10, total }}
        onPageChange={(nextPage) => setPage(nextPage)}
        onRowClick={(record) => navigate(`/doctor/medical-records/${record.id}`)}
        emptyTitle="No medical records found"
        emptyDescription="Create a new medical record or adjust the search filter."
      />
    </div>
  );
}
