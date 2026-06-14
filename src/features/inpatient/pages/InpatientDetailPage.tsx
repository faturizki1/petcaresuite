import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Check, RefreshCw } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button, Card, Input, Textarea, Badge, Skeleton, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Select } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { DischargeModal } from '../components/DischargeModal';
import { useInpatientRecord, useObservations, useMedicationSchedules, useInpatientBill, useAddDailyObservation, useAddInpatientMedication, useMarkMedicationGiven, useUpdateInpatientStatus } from '../inpatient.hooks';
import { inpatientService } from '../inpatient.service';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import type { CartItem } from '@/features/pos/pos.types';

export default function InpatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useDocumentTitle('Inpatient Detail');

  const { data: record, isLoading: recordLoading } = useInpatientRecord(id);
  const { data: observations = [], isLoading: obsLoading } = useObservations(id);
  const { data: medications = [], isLoading: medsLoading } = useMedicationSchedules(id);
  const { data: bill, isLoading: billLoading } = useInpatientBill(id);

  const addObservation = useAddDailyObservation();
  const addMedication = useAddInpatientMedication();
  const markGiven = useMarkMedicationGiven();
  const updateStatus = useUpdateInpatientStatus();

  const [showObservationForm, setShowObservationForm] = useState(false);
  const [obsTemperature, setObsTemperature] = useState('');
  const [obsAppetite, setObsAppetite] = useState('good');
  const [obsWeight, setObsWeight] = useState('');
  const [obsCondition, setObsCondition] = useState('');
  const [obsNotes, setObsNotes] = useState('');

  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [medDrugName, setMedDrugName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medScheduleTime, setMedScheduleTime] = useState('');
  const [medNotes, setMedNotes] = useState('');

  const [dischargeRecord, setDischargeRecord] = useState<any>(null);
  const [pendingBill, setPendingBill] = useState<{ items: CartItem[]; total: number } | null>(null);

  if (recordLoading) return <PageSkeleton />;
  if (!record) return <EmptyState title="Record not found" description="The inpatient record could not be found." />;

  const daysAdmitted = Math.ceil((Date.now() - new Date(record.admitDate).getTime()) / 86400000);

  const handleAddObservation = async () => {
    if (!id) return;
    try {
      await addObservation.mutateAsync({
        inpatientRecordId: id,
        payload: {
          temperature: obsTemperature ? Number(obsTemperature) : undefined,
          appetite: obsAppetite,
          weight: obsWeight ? Number(obsWeight) : undefined,
          condition: obsCondition,
          notes: obsNotes || undefined
        }
      });
      toast.success('Observation saved');
      setShowObservationForm(false);
      setObsTemperature('');
      setObsAppetite('good');
      setObsWeight('');
      setObsCondition('');
      setObsNotes('');
    } catch {
      toast.error('Failed to save observation');
    }
  };

  const handleAddMedication = async () => {
    if (!id) return;
    try {
      await addMedication.mutateAsync({
        inpatientRecordId: id,
        payload: {
          drugName: medDrugName,
          dose: medDose,
          scheduleTime: medScheduleTime,
          notes: medNotes || undefined
        }
      });
      toast.success('Medication added');
      setShowMedicationDialog(false);
      setMedDrugName('');
      setMedDose('');
      setMedScheduleTime('');
      setMedNotes('');
    } catch {
      toast.error('Failed to add medication');
    }
  };

  const handleMarkGiven = async (medicationId: string) => {
    try {
      await markGiven.mutateAsync(medicationId);
      toast.success('Medication marked as given');
    } catch {
      toast.error('Failed to mark medication');
    }
  };

  const handleOpenDischarge = async () => {
    if (!id) return;
    try {
      const billData = await inpatientService.getInpatientBill(id);
      setPendingBill(billData);
      setDischargeRecord(record);
    } catch {
      setPendingBill({ items: [], total: 0 });
    }
  };

  const handleDischargeSuccess = () => {
    setDischargeRecord(null);
    setPendingBill(null);
  };

  const latestObservation = observations.length > 0 ? observations[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/staff/inpatient')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{record.petName ?? record.petId}</h1>
            <p className="text-sm text-slate-500">Cage {record.cageName ?? record.cageId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={record.status} />
          {record.status === 'admitted' && (
            <Button onClick={handleOpenDischarge}>Discharge</Button>
          )}
        </div>
      </div>

      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">Admitting doctor</p>
            <p className="font-medium text-slate-900">{record.doctorName ?? record.admittingDoctorId}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Admit date</p>
            <p className="font-medium text-slate-900">{new Date(record.admitDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Days admitted</p>
            <p className="font-medium text-slate-900">{daysAdmitted} days</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <StatusBadge status={record.status} />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="observations">Daily Observations</TabsTrigger>
          <TabsTrigger value="medications">Medication Schedule</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="report">Daily Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pet Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Pet</p>
                <Link to={`/staff/pets/${record.petId}`} className="font-medium text-blue-600 hover:underline">
                  {record.petName ?? record.petId}
                </Link>
              </div>
              <div>
                <p className="text-sm text-slate-500">Admission reason</p>
                <p className="font-medium text-slate-900">{record.reason ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Notes</p>
                <p className="text-slate-700">{record.notes ?? 'No notes'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Doctor</p>
                <p className="font-medium text-slate-900">{record.doctorName ?? record.admittingDoctorId}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="observations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Daily Observations</h2>
            <Button size="sm" onClick={() => setShowObservationForm(!showObservationForm)}>
              <Plus className="w-4 h-4 mr-2" /> Add Observation
            </Button>
          </div>

          {showObservationForm && (
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Temperature (°C)</label>
                    <Input type="number" step="0.1" value={obsTemperature} onChange={(e) => setObsTemperature(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Appetite</label>
                    <select
                      value={obsAppetite}
                      onChange={(e) => setObsAppetite(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Weight (kg)</label>
                    <Input type="number" step="0.1" value={obsWeight} onChange={(e) => setObsWeight(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Condition</label>
                    <Textarea value={obsCondition} onChange={(e) => setObsCondition(e.target.value)} rows={2} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Notes</label>
                  <Textarea value={obsNotes} onChange={(e) => setObsNotes(e.target.value)} rows={2} />
                </div>
                <Button onClick={handleAddObservation} disabled={addObservation.isLoading}>
                  Save Observation
                </Button>
              </div>
            </Card>
          )}

          {obsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-3xl" />
              ))}
            </div>
          ) : observations.length === 0 ? (
            <EmptyState title="No observations" description="No daily observations recorded yet." />
          ) : (
            <div className="space-y-4">
              {observations.map((obs) => (
                <Card key={obs.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-slate-500">{new Date(obs.observedAt).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Observer: {obs.observedBy ?? 'N/A'}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-500">Temperature</p>
                      <p className="font-medium">{obs.temperature != null ? `${obs.temperature} °C` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Appetite</p>
                      <p className="font-medium capitalize">{obs.appetite ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Weight</p>
                      <p className="font-medium">{obs.weight != null ? `${obs.weight} kg` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Condition</p>
                      <p className="font-medium">{obs.condition ?? 'N/A'}</p>
                    </div>
                  </div>
                  {obs.notes && <p className="mt-2 text-sm text-slate-600">{obs.notes}</p>}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Medication Schedule</h2>
            <Button size="sm" onClick={() => setShowMedicationDialog(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Medication
            </Button>
          </div>

          {medsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-3xl" />
              ))}
            </div>
          ) : medications.length === 0 ? (
            <EmptyState title="No medications" description="No medications scheduled yet." />
          ) : (
            <div className="space-y-4">
              {medications.map((med) => (
                <Card key={med.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{med.drugName}</p>
                      <p className="text-sm text-slate-500">Dose: {med.dose}</p>
                      <p className="text-sm text-slate-500">Schedule: {new Date(med.scheduleTime).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          med.status === 'given' ? 'default' :
                          med.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className={
                          med.status === 'given' ? 'bg-green-100 text-green-800' :
                          med.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {med.status}
                      </Badge>
                      {med.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkGiven(med.id)} disabled={markGiven.isLoading}>
                          <Check className="w-4 h-4 mr-1" /> Mark Given
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={showMedicationDialog} onOpenChange={(open) => !open && setShowMedicationDialog(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Drug name</label>
                  <Input value={medDrugName} onChange={(e) => setMedDrugName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Dose</label>
                  <Input value={medDose} onChange={(e) => setMedDose(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Schedule time</label>
                  <Input type="datetime-local" value={medScheduleTime} onChange={(e) => setMedScheduleTime(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Notes</label>
                  <Textarea value={medNotes} onChange={(e) => setMedNotes(e.target.value)} rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMedicationDialog(false)} type="button">Cancel</Button>
                <Button onClick={handleAddMedication} disabled={addMedication.isLoading} type="button">Add Medication</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Billing</h2>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>

          {billLoading ? (
            <Skeleton className="h-40 w-full rounded-3xl" />
          ) : bill && bill.items.length > 0 ? (
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 font-medium text-slate-500">Item</th>
                    <th className="text-right py-3 font-medium text-slate-500">Qty</th>
                    <th className="text-right py-3 font-medium text-slate-500">Unit Price</th>
                    <th className="text-right py-3 font-medium text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-3 text-slate-900">{item.name}</td>
                      <td className="py-3 text-right text-slate-700">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right font-medium text-slate-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-4 text-right font-semibold text-slate-900">Current Bill:</td>
                    <td className="py-4 text-right font-bold text-lg text-slate-900">{formatCurrency(bill.total)}</td>
                  </tr>
                </tfoot>
              </table>
              <p className="mt-4 text-sm text-slate-500">Final amount due at discharge.</p>
            </Card>
          ) : (
            <EmptyState title="No billing items" description="No billing items have been added yet." />
          )}
        </TabsContent>

        <TabsContent value="report" className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Daily Report</h2>
          <p className="text-sm text-slate-500 mb-4">This is what your customer sees in their portal.</p>

          {latestObservation ? (
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Condition</p>
                    <p className="font-medium text-slate-900">{latestObservation.condition ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Appetite</p>
                    <p className="font-medium text-slate-900 capitalize">{latestObservation.appetite ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Temperature</p>
                    <p className="font-medium text-slate-900">{latestObservation.temperature != null ? `${latestObservation.temperature} °C` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Last updated</p>
                    <p className="font-medium text-slate-900">{formatDistanceToNow(new Date(latestObservation.observedAt), { addSuffix: true })}</p>
                  </div>
                </div>
                {latestObservation.notes && (
                  <div>
                    <p className="text-sm text-slate-500">Notes</p>
                    <p className="text-slate-700">{latestObservation.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <EmptyState title="No report data" description="No observations recorded yet to display in the report." />
          )}
        </TabsContent>
      </Tabs>

      {dischargeRecord && pendingBill && (
        <DischargeModal
          inpatientRecord={dischargeRecord}
          pendingBill={pendingBill}
          onSuccess={handleDischargeSuccess}
          onClose={() => { setDischargeRecord(null); setPendingBill(null); }}
        />
      )}
    </div>
  );
}