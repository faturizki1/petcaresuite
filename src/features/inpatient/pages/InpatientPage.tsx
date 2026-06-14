import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, HeartPulse, ClipboardList, Save, Activity } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import InvoiceReviewModal from '../components/InvoiceReviewModal';
import { CageGrid } from '../components/CageGrid';
import { AdmitPetModal } from '../components/AdmitPetModal';
import { DischargeModal } from '../components/DischargeModal';
import { useCages, useInpatientRecords, useCreateInpatientRecord } from '../inpatient.hooks';
import { inpatientService } from '../inpatient.service';
import type { CartItem } from '@/features/pos/pos.types';
import type { Cage, InpatientRecord } from '../inpatient.types';

export default function InpatientPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [petId, setPetId] = useState('');
  const [cageId, setCageId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [admitDate, setAdmitDate] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCage, setSelectedCage] = useState<Cage | null>(null);
  const [dischargeRecord, setDischargeRecord] = useState<InpatientRecord | null>(null);
  const [pendingBill, setPendingBill] = useState<{ items: CartItem[]; total: number } | null>(null);
  const [isLoadingBill, setIsLoadingBill] = useState(false);

  const qc = useQueryClient();
  const { data: cages = [] } = useCages();
  const { data, isLoading } = useInpatientRecords({ page, pageSize: 12, search, status: status || undefined });
  const createRecord = useCreateInpatientRecord();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const occupied = items.filter((item) => item.status === 'admitted').length;
  const discharged = items.filter((item) => item.status === 'discharged').length;

  const availableCages = cages.filter((cage) => cage.status === 'available');

  async function handleAdmit() {
    await createRecord.mutateAsync({
      petId,
      cageId: cageId || cages[0]?.id,
      admittingDoctorId: doctorId,
      admitDate,
      reason,
      notes
    });
    setPetId('');
    setCageId('');
    setDoctorId('');
    setAdmitDate('');
    setReason('');
    setNotes('');
    qc.invalidateQueries(['inpatientRecords']);
    qc.invalidateQueries(['cages']);
  }

  const openAdmitModal = (cage: Cage) => {
    if (cage.status === 'available') {
      setSelectedCage(cage);
    }
  };

  const closeAdmitModal = () => {
    setSelectedCage(null);
  };

  const handleAdmitSuccess = () => {
    qc.invalidateQueries(['inpatientRecords']);
    qc.invalidateQueries(['cages']);
    setSelectedCage(null);
  };

  const handleOpenDischarge = async (record: InpatientRecord) => {
    setIsLoadingBill(true);
    try {
      const bill = await inpatientService.getInpatientBill(record.id);
      setPendingBill(bill);
      setDischargeRecord(record);
    } catch (err) {
      setPendingBill({ items: [], total: 0 });
    } finally {
      setIsLoadingBill(false);
    }
  };

  const closeDischargeModal = () => {
    setDischargeRecord(null);
    setPendingBill(null);
  };

  const handleDischargeSuccess = () => {
    qc.invalidateQueries(['inpatientRecords']);
    qc.invalidateQueries(['cages']);
    setDischargeRecord(null);
    setPendingBill(null);
  };

  const [reviewInvoiceFor, setReviewInvoiceFor] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inpatient"
        description="Track hospitalized pets, cage assignments, observations, and discharge workflows."
        actions={
          <Button onClick={() => setPage(1)}>
            <Plus className="w-4 h-4 mr-2" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-4 p-5">
                <HeartPulse className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Current admits</p>
                <p className="text-2xl font-semibold text-slate-900">{occupied}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <ClipboardList className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Discharged</p>
                <p className="text-2xl font-semibold text-slate-900">{discharged}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <Activity className="h-6 w-6 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Open records</p>
                <p className="text-2xl font-semibold text-slate-900">{total}</p>
              </div>
            </Card>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Ward overview</h2>
                  <p className="text-sm text-slate-500">Click a cage to admit a new patient.</p>
                </div>
                <div className="text-sm text-slate-600">Available cages: {availableCages.length}</div>
              </div>
              <CageGrid
                cages={cages}
                inpatientRecords={items}
                onCageClick={(cage, inpatient) => {
                  if (cage.status === 'occupied' && inpatient) {
                    navigate(`/staff/inpatient/${inpatient.id}`);
                  } else if (cage.status === 'available') {
                    openAdmitModal(cage);
                  }
                }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by pet ID or reason"
                  className="border-0 bg-transparent px-0 text-sm focus:ring-0"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                <option value="">All status</option>
                <option value="admitted">Admitted</option>
                <option value="discharged">Discharged</option>
                <option value="under observation">Under observation</option>
              </select>
            </div>
            <div className="mt-6">
              <DataTable
                columns={[
                  { key: 'petName', title: 'Pet', render: (record: any) => record.petName ?? record.petId },
                  { key: 'cageName', title: 'Cage', render: (record: any) => record.cageName ?? record.cageId },
                  { key: 'doctorName', title: 'Doctor', render: (record: any) => record.doctorName ?? record.admittingDoctorId },
                  { key: 'admitDate', title: 'Admit Date', render: (record: any) => new Date(record.admitDate).toLocaleDateString() },
                  { key: 'status', title: 'Status' },
                  {
                    key: 'actions',
                    title: 'Actions',
                    render: (record: any) => (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/staff/inpatient/${record.id}`); }}>
                          View
                        </Button>
                        {record.status === 'admitted' ? (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); void handleOpenDischarge(record); }}>
                            Discharge
                          </Button>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setReviewInvoiceFor(record.id); }}>
                          Review Invoice
                        </Button>
                      </div>
                    )
                  }
                ]}
                data={items}
                isLoading={isLoading}
                pagination={{ page, pageSize: 12, total }}
                onPageChange={(nextPage) => setPage(nextPage)}
                emptyTitle="No inpatient records"
                emptyDescription="Create a new admission record to start tracking a pet in care."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Admit new pet</h2>
                <p className="text-sm text-slate-500">Assign a cage and admit a patient for inpatient care.</p>
              </div>
              {selectedCage ? (
                <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Admitting to {selectedCage.name}</div>
              ) : null}
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Pet ID</label>
                <Input value={petId} onChange={(event) => setPetId(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Cage</label>
                <select value={cageId} onChange={(event) => setCageId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm">
                  <option value="">Select cage</option>
                  {cages.map((cage) => (
                    <option key={cage.id} value={cage.id}>{cage.name} · {cage.status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Admitting doctor ID</label>
                <Input value={doctorId} onChange={(event) => setDoctorId(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Admit date</label>
                <Input type="date" value={admitDate} onChange={(event) => setAdmitDate(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Reason</label>
                <Input value={reason} onChange={(event) => setReason(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm" rows={4} />
              </div>
              <Button type="button" onClick={handleAdmit} disabled={createRecord.isLoading}>
                <Save className="w-4 h-4 mr-2" /> Admit pet
              </Button>
            </div>
          </Card>
        </div>
        {selectedCage && <AdmitPetModal cage={selectedCage} onSuccess={handleAdmitSuccess} onClose={closeAdmitModal} />}
        {dischargeRecord && pendingBill ? (
          <DischargeModal
            inpatientRecord={dischargeRecord}
            pendingBill={pendingBill}
            onSuccess={handleDischargeSuccess}
            onClose={closeDischargeModal}
          />
        ) : null}
        {reviewInvoiceFor && <InvoiceReviewModal inpatientId={reviewInvoiceFor} onClose={() => setReviewInvoiceFor(null)} />}
      </div>
    </div>
  );
}
