import React, { useState, useMemo } from 'react';
import { Plus, Scissors, Sparkles, Search, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button, Card, Input, Badge, Skeleton, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Textarea, Switch } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useDebounce } from '@/hooks/useDebounce';
import { useGroomingServices, useGroomingRecords, useCreateGroomingService, useCreateGroomingRecord, useCompleteGrooming, useUpdateGroomingStatus, useToggleGroomingService, useUpdateGroomingService, useTodaySchedule } from '../grooming.hooks';
import { CreateGroomingModal } from '../components/CreateGroomingModal';
import { CompleteGroomingModal } from '../components/CompleteGroomingModal';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { GroomingRecord, GroomingService } from '../grooming.types';

export default function GroomingPage() {
  useDocumentTitle('Grooming');
  const qc = useQueryClient();

  // Today's schedule
  const { data: todaySchedule = [], isLoading: todayLoading } = useTodaySchedule();

  // All bookings
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { data: recordsData, isLoading: recordsLoading } = useGroomingRecords({
    page,
    pageSize: 12,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined
  });
  const records = recordsData?.items ?? [];
  const recordsTotal = recordsData?.total ?? 0;

  // Services
  const { data: services = [], isLoading: servicesLoading } = useGroomingServices();
  const createService = useCreateGroomingService();
  const toggleService = useToggleGroomingService();
  const updateService = useUpdateGroomingService();
  const updateStatus = useUpdateGroomingStatus();

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GroomingRecord | null>(null);
  const [cancelRecord, setCancelRecord] = useState<GroomingRecord | null>(null);

  // Add service inline form
  const [showAddService, setShowAddService] = useState(false);
  const [svcName, setSvcName] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcDuration, setSvcDuration] = useState('30');

  // Edit service dialog
  const [editService, setEditService] = useState<GroomingService | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');

  const activeServices = services.filter((s) => s.isActive).length;

  const handleCreateService = async () => {
    if (!svcName || !svcPrice) {
      toast.error('Name and price are required');
      return;
    }
    try {
      await createService.mutateAsync({
        name: svcName,
        description: svcDesc || undefined,
        price: Number(svcPrice),
        durationMinutes: Number(svcDuration)
      });
      toast.success('Service created');
      setSvcName('');
      setSvcDesc('');
      setSvcPrice('');
      setSvcDuration('30');
      setShowAddService(false);
    } catch {
      toast.error('Failed to create service');
    }
  };

  const handleToggleService = async (id: string, isActive: boolean) => {
    try {
      await toggleService.mutateAsync({ id, isActive });
      toast.success(isActive ? 'Service activated' : 'Service deactivated');
    } catch {
      toast.error('Failed to toggle service');
    }
  };

  const handleEditService = (service: GroomingService) => {
    setEditService(service);
    setEditName(service.name);
    setEditDesc(service.description ?? '');
    setEditPrice(String(service.price));
    setEditDuration(String(service.durationMinutes));
  };

  const handleSaveEditService = async () => {
    if (!editService) return;
    try {
      await updateService.mutateAsync({
        id: editService.id,
        payload: {
          name: editName,
          description: editDesc || undefined,
          price: Number(editPrice),
          durationMinutes: Number(editDuration)
        }
      });
      toast.success('Service updated');
      setEditService(null);
    } catch {
      toast.error('Failed to update service');
    }
  };

  const handleStartGrooming = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'in-progress' });
      toast.success('Grooming started');
    } catch {
      toast.error('Failed to start grooming');
    }
  };

  const handleCancelGrooming = async () => {
    if (!cancelRecord) return;
    try {
      await updateStatus.mutateAsync({ id: cancelRecord.id, status: 'cancelled' });
      toast.success('Grooming cancelled');
      setCancelRecord(null);
    } catch {
      toast.error('Failed to cancel grooming');
    }
  };

  const handleBookingSuccess = () => {
    qc.invalidateQueries(['groomingRecords']);
    qc.invalidateQueries(['groomingTodaySchedule']);
    setShowCreateModal(false);
  };

  const handleCompleteSuccess = () => {
    qc.invalidateQueries(['groomingRecords']);
    qc.invalidateQueries(['groomingTodaySchedule']);
    setSelectedRecord(null);
  };

  const todayCards = useMemo(() => {
    return todaySchedule.map((record) => ({
      ...record,
      time: new Date(record.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  }, [todaySchedule]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grooming"
        description="Manage grooming services and schedule styling sessions for pets."
      />

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
            <p className="text-sm text-slate-500">Today's schedule</p>
            <p className="text-2xl font-semibold text-slate-900">{todaySchedule.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <Search className="h-6 w-6 text-slate-500" />
          <div>
            <p className="text-sm text-slate-500">Total bookings</p>
            <p className="text-2xl font-semibold text-slate-900">{recordsTotal}</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
          <TabsTrigger value="bookings">All Bookings</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {todayLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-3xl" />
              ))}
            </div>
          ) : todayCards.length === 0 ? (
            <EmptyState
              icon={<Scissors className="h-12 w-12 text-slate-300" />}
              title="No grooming sessions today"
              description="No grooming sessions scheduled for today."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {todayCards.map((record) => (
                <Card key={record.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{record.petName ?? record.petId}</p>
                      <p className="text-sm text-slate-500">{record.serviceName ?? record.serviceId}</p>
                    </div>
                    <Badge
                      variant={
                        record.status === 'completed' ? 'default' :
                        record.status === 'in-progress' ? 'secondary' :
                        record.status === 'cancelled' ? 'destructive' : 'outline'
                      }
                      className={
                        record.status === 'completed' ? 'bg-green-100 text-green-800' :
                        record.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        record.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{record.time}</p>
                  <div className="flex gap-2">
                    {record.status === 'scheduled' && (
                      <Button size="sm" variant="outline" onClick={() => handleStartGrooming(record.id)}>
                        Start
                      </Button>
                    )}
                    {record.status === 'in-progress' && (
                      <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>
                        Complete
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search bookings..."
                  className="border-0 bg-transparent px-0 text-sm focus:ring-0"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                <option value="">All status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
                className="w-40 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                className="w-40 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Booking
            </Button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <DataTable
              columns={[
                { key: 'petName', title: 'Pet', render: (record: any) => record.petName ?? record.petId },
                { key: 'customerName', title: 'Customer', render: (record: any) => record.customerName ?? '-' },
                { key: 'serviceName', title: 'Service', render: (record: any) => record.serviceName ?? record.serviceId },
                { key: 'scheduledAt', title: 'Date', render: (record: any) => new Date(record.scheduledAt).toLocaleString() },
                {
                  key: 'status',
                  title: 'Status',
                  render: (record: any) => (
                    <Badge
                      variant={
                        record.status === 'completed' ? 'default' :
                        record.status === 'in-progress' ? 'secondary' :
                        record.status === 'cancelled' ? 'destructive' : 'outline'
                      }
                      className={
                        record.status === 'completed' ? 'bg-green-100 text-green-800' :
                        record.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        record.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }
                    >
                      {record.status}
                    </Badge>
                  )
                },
                {
                  key: 'actions',
                  title: 'Actions',
                  render: (record: any) => (
                    <div className="flex gap-2">
                      {record.status === 'in-progress' && (
                        <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>
                          Complete
                        </Button>
                      )}
                      {record.status === 'scheduled' && (
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => setCancelRecord(record)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  )
                }
              ]}
              data={records}
              isLoading={recordsLoading}
              pagination={{ page, pageSize: 12, total: recordsTotal }}
              onPageChange={(nextPage) => setPage(nextPage)}
              emptyTitle="No bookings found"
              emptyDescription="Create a new booking to get started."
            />
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Grooming Services</h2>
            <Button size="sm" onClick={() => setShowAddService(!showAddService)}>
              <Plus className="w-4 h-4 mr-2" /> Add Service
            </Button>
          </div>

          {showAddService && (
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <Input value={svcName} onChange={(e) => setSvcName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <Input value={svcDesc} onChange={(e) => setSvcDesc(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Price</label>
                  <Input type="number" value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Duration (min)</label>
                  <Input type="number" value={svcDuration} onChange={(e) => setSvcDuration(e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleCreateService} disabled={createService.isLoading}>
                  Save Service
                </Button>
                <Button variant="outline" onClick={() => setShowAddService(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <DataTable
              columns={[
                { key: 'name', title: 'Name' },
                { key: 'description', title: 'Description', render: (record: any) => record.description ?? '-' },
                { key: 'price', title: 'Price', render: (record: any) => formatCurrency(record.price) },
                { key: 'durationMinutes', title: 'Duration', render: (record: any) => `${record.durationMinutes} min` },
                {
                  key: 'isActive',
                  title: 'Active',
                  render: (record: any) => (
                    <Switch
                      checked={record.isActive}
                      onCheckedChange={(checked) => handleToggleService(record.id, checked)}
                    />
                  )
                },
                {
                  key: 'actions',
                  title: 'Actions',
                  render: (record: any) => (
                    <Button size="sm" variant="outline" onClick={() => handleEditService(record)}>
                      Edit
                    </Button>
                  )
                }
              ]}
              data={services}
              isLoading={servicesLoading}
              emptyTitle="No services"
              emptyDescription="Add a grooming service to get started."
            />
          </div>
        </TabsContent>
      </Tabs>

      {showCreateModal && <CreateGroomingModal onSuccess={handleBookingSuccess} onClose={() => setShowCreateModal(false)} />}
      {selectedRecord && (
        <CompleteGroomingModal record={selectedRecord} onSuccess={handleCompleteSuccess} onClose={() => setSelectedRecord(null)} />
      )}
      <Dialog open={!!editService} onOpenChange={(open) => { if (!open) setEditService(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Price</label>
              <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Duration (minutes)</label>
              <Input type="number" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditService(null)} type="button">Cancel</Button>
            <Button onClick={handleSaveEditService} disabled={updateService.isLoading} type="button">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!cancelRecord}
        onOpenChange={(open) => { if (!open) setCancelRecord(null); }}
        title="Cancel grooming"
        description={`Are you sure you want to cancel this grooming session for ${cancelRecord?.petName ?? cancelRecord?.petId}?`}
        onConfirm={handleCancelGrooming}
        variant="danger"
      />
    </div>
  );
}