import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Activity } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input } from '@/components/ui';
import { useCreateMonitoringEntry } from '../monitoring.hooks';
import type { MonitoringCreatePayload } from '../monitoring.types';

export default function CreateMonitoringPage() {
  const [searchParams] = useSearchParams();
  const [petId, setPetId] = useState('');
  const [date, setDate] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [medicationPlan, setMedicationPlan] = useState('');
  const [recoveryNotes, setRecoveryNotes] = useState('');
  const [nextCheck, setNextCheck] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const mutation = useCreateMonitoringEntry();

  useEffect(() => {
    const paramPetId = searchParams.get('petId');
    if (paramPetId) setPetId(paramPetId);
  }, [searchParams]);
  const saving = mutation.isLoading;

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!petId.trim()) nextErrors.petId = 'Pet ID is required';
    if (!date) nextErrors.date = 'Date is required';
    if (!weightKg || Number.isNaN(Number(weightKg))) nextErrors.weightKg = 'Valid weight is required';
    if (!medicationPlan.trim()) nextErrors.medicationPlan = 'Medication plan is required';
    if (!recoveryNotes.trim()) nextErrors.recoveryNotes = 'Recovery notes are required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const payload = {
      petId,
      date,
      weightKg: Number(weightKg),
      medicationPlan,
      recoveryNotes,
      nextCheck: nextCheck || null,
      uploads: attachment ? [{ petId, filename: attachment.name, url: `/uploads/${encodeURIComponent(attachment.name)}` }] : []
    };

    try {
      await mutation.mutateAsync(payload);
      navigate('/staff/monitoring');
    } catch (error: any) {
      setErrors({ form: error?.message || 'Unable to create monitoring entry' });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Create Monitoring Entry" description="Capture weight, medication, recovery notes, and owner uploads." />
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Pet ID</label>
            <Input value={petId} onChange={(event) => setPetId(event.target.value)} />
            {errors.petId && <p className="mt-1 text-sm text-red-600">{errors.petId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Weight (kg)</label>
            <Input value={weightKg} onChange={(event) => setWeightKg(event.target.value)} />
            {errors.weightKg && <p className="mt-1 text-sm text-red-600">{errors.weightKg}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Next Check</label>
            <Input type="date" value={nextCheck} onChange={(event) => setNextCheck(event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Medication Plan</label>
            <textarea
              rows={3}
              value={medicationPlan}
              onChange={(event) => setMedicationPlan(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.medicationPlan && <p className="mt-1 text-sm text-red-600">{errors.medicationPlan}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Recovery Notes</label>
            <textarea
              rows={4}
              value={recoveryNotes}
              onChange={(event) => setRecoveryNotes(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.recoveryNotes && <p className="mt-1 text-sm text-red-600">{errors.recoveryNotes}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Owner Upload</label>
            <input type="file" onChange={(event) => setAttachment(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm text-slate-700" />
          </div>
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleSave} disabled={saving}>
            <Activity className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Entry'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/staff/monitoring')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
