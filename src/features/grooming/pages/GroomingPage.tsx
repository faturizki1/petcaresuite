import React, { useState } from 'react';
import { Plus, Scissors, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useGroomingServices, useGroomingRecords, useCreateGroomingService, useCreateGroomingRecord } from '../grooming.hooks';
import { formatCurrency } from '@/lib/utils';

export default function GroomingPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('0');
  const [serviceDuration, setServiceDuration] = useState('30');
  const [recordPetId, setRecordPetId] = useState('');
  const [recordServiceId, setRecordServiceId] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordNotes, setRecordNotes] = useState('');

  const { data: services = [] } = useGroomingServices();
  const { data, isLoading } = useGroomingRecords({ page, pageSize: 12, search, status: status || undefined });
  const createService = useCreateGroomingService();
  const createRecord = useCreateGroomingRecord();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const activeServices = services.filter((item) => item.isActive).length;

  async function handleCreateService(event: React.FormEvent) {
    event.preventDefault();
    await createService.mutateAsync({
      name: serviceName,
      price: Number(servicePrice),
      durationMinutes: Number(serviceDuration)
    });
    setServiceName('');
    setServicePrice('0');
    setServiceDuration('30');
  }

  async function handleCreateRecord(event: React.FormEvent) {
    event.preventDefault();
    await createRecord.mutateAsync({
      petId: recordPetId,
      serviceId: recordServiceId,
      scheduledAt: recordDate,
      notes: recordNotes
    });
    setRecordPetId('');
    setRecordServiceId('');
    setRecordDate('');
    setRecordNotes('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grooming"
        description="Manage grooming services and schedule styling sessions for pets."
        actions={
          <Button onClick={() => setPage(1)}>
            <Plus className="w-4 h-4 mr-2" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-4 p-5">
              <Scissors className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Active services</p>
                <p className="text-2xl font-semibold text-slate-900">{activeServices}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <Sparkles className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Open appointments</p>
                <p className="text-2xl font-semibold text-slate-900">{total}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <Plus className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Service options</p>
                <p className="text-2xl font-semibold text-slate-900">{services.length}</p>
              </div>
            </Card>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search grooming records"
                className="border-0 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:ring-0"
              />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                <option value="">All status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="mt-6">
              <DataTable
                columns={[
                  { key: 'petId', title: 'Pet ID' },
                  { key: 'serviceId', title: 'Service' },
                  { key: 'scheduledAt', title: 'Date', render: (record: any) => new Date(record.scheduledAt).toLocaleDateString() },
                  { key: 'status', title: 'Status' }
                ]}
                data={items}
                isLoading={isLoading}
                pagination={{ page, pageSize: 12, total }}
                onPageChange={(nextPage) => setPage(nextPage)}
                emptyTitle="No grooming records found"
                emptyDescription="Add a grooming service or schedule a session to begin."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">New grooming service</h2>
            <form onSubmit={handleCreateService} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Service name</label>
                <Input value={serviceName} onChange={(event) => setServiceName(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Price</label>
                <Input type="number" value={servicePrice} onChange={(event) => setServicePrice(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Duration (minutes)</label>
                <Input type="number" value={serviceDuration} onChange={(event) => setServiceDuration(event.target.value)} />
              </div>
              <Button type="submit" disabled={createService.isLoading}>
                <Plus className="w-4 h-4 mr-2" /> Add service
              </Button>
            </form>
          </Card>

          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Schedule grooming</h2>
            <form onSubmit={handleCreateRecord} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Pet ID</label>
                <Input value={recordPetId} onChange={(event) => setRecordPetId(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Service</label>
                <select value={recordServiceId} onChange={(event) => setRecordServiceId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name} · {formatCurrency(service.price)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Groomer ID</label>
                <Input value={recordNotes} onChange={(event) => setRecordNotes(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Scheduled date</label>
                <Input type="datetime-local" value={recordDate} onChange={(event) => setRecordDate(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea value={recordNotes} onChange={(event) => setRecordNotes(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm" rows={3} />
              </div>
              <Button type="submit" disabled={createRecord.isLoading}>
                <Plus className="w-4 h-4 mr-2" /> Schedule
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
