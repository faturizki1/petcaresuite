import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input } from '@/components/ui';
import { useCreateVaccination } from '../vaccinations.hooks';

export default function CreateVaccinationPage() {
  const [searchParams] = useSearchParams();
  const [petId, setPetId] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [dateAdministered, setDateAdministered] = useState('');
  const [nextDue, setNextDue] = useState('');
  const [veterinarianId, setVeterinarianId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const mutation = useCreateVaccination();

  useEffect(() => {
    const paramPetId = searchParams.get('petId');
    if (paramPetId) setPetId(paramPetId);
  }, [searchParams]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!petId.trim()) nextErrors.petId = 'Pet ID is required';
    if (!vaccineName.trim()) nextErrors.vaccineName = 'Vaccine name is required';
    if (!dateAdministered) nextErrors.dateAdministered = 'Date administered is required';
    if (!veterinarianId.trim()) nextErrors.veterinarianId = 'Veterinarian ID is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    try {
      await mutation.mutateAsync({ petId, vaccineName, dateAdministered, nextDue: nextDue || null, veterinarianId, notes });
      navigate('/staff/vaccinations');
    } catch (error: any) {
      setErrors({ form: error?.message || 'Unable to create vaccination record' });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Create Vaccination" description="Log a new vaccine administration and schedule the next due date." />
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Pet ID</label>
            <Input value={petId} onChange={(event) => setPetId(event.target.value)} />
            {errors.petId && <p className="mt-1 text-sm text-red-600">{errors.petId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Vaccine Name</label>
            <Input value={vaccineName} onChange={(event) => setVaccineName(event.target.value)} />
            {errors.vaccineName && <p className="mt-1 text-sm text-red-600">{errors.vaccineName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date Administered</label>
            <Input type="date" value={dateAdministered} onChange={(event) => setDateAdministered(event.target.value)} />
            {errors.dateAdministered && <p className="mt-1 text-sm text-red-600">{errors.dateAdministered}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Next Due</label>
            <Input type="date" value={nextDue} onChange={(event) => setNextDue(event.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Veterinarian ID</label>
            <Input value={veterinarianId} onChange={(event) => setVeterinarianId(event.target.value)} />
            {errors.veterinarianId && <p className="mt-1 text-sm text-red-600">{errors.veterinarianId}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleSave} disabled={mutation.isLoading}>
            <CalendarDays className="w-4 h-4 mr-2" />
            {mutation.isLoading ? 'Saving...' : 'Save Vaccination'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/staff/vaccinations')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
