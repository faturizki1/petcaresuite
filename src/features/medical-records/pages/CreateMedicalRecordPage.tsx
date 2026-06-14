import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { useCreateMedicalRecord } from '../medical-records.hooks';
import { useAppointment } from '@/features/appointments/appointments.hooks';
import { useGetPets } from '@/features/pets/pets.hooks';
import { useDoctors } from '@/features/appointments/appointments.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const emptyPrescription = { medication: '', dosage: '', frequency: '', duration: '' };

export default function CreateMedicalRecordPage() {
  const [searchParams] = useSearchParams();
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [petId, setPetId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [recordType, setRecordType] = useState('consultation');
  const [notes, setNotes] = useState('');
  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [prescriptions, setPrescriptions] = useState([emptyPrescription]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const mutation = useCreateMedicalRecord();

  useDocumentTitle('Create Medical Record');

  useEffect(() => {
    const paramPetId = searchParams.get('petId');
    const paramAppointmentId = searchParams.get('appointmentId');
    if (paramPetId) setPetId(paramPetId);
    if (paramAppointmentId) setAppointmentId(paramAppointmentId);
  }, [searchParams]);

  const appointmentQuery = useAppointment(appointmentId || undefined);
  const petsQuery = useGetPets({ page: 1, pageSize: 200, search: '' });
  const doctorsQuery = useDoctors('');
  const pets = petsQuery.data?.items ?? [];
  const doctors = doctorsQuery.data ?? [];

  useEffect(() => {
    if (!appointmentQuery.data) return;
    setPetId(appointmentQuery.data.petId);
    setDoctorId(appointmentQuery.data.doctorId ?? '');
    setDate(appointmentQuery.data.appointmentDate);
  }, [appointmentQuery.data]);

  function setPrescriptionField(index: number, field: keyof typeof emptyPrescription, value: string) {
    setPrescriptions((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removePrescription(index: number) {
    setPrescriptions((current) => current.filter((_, i) => i !== index));
  }

  function addPrescription() {
    setPrescriptions((current) => [...current, emptyPrescription]);
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;
    setAttachments((current) => [...current, ...Array.from(files)]);
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!petId.trim()) nextErrors.petId = 'Pet is required';
    if (!doctorId.trim()) nextErrors.doctorId = 'Doctor is required';
    if (!date) nextErrors.date = 'Visit date is required';
    if (!soap.subjective.trim()) nextErrors.subjective = 'Subjective field is required';
    if (!soap.objective.trim()) nextErrors.objective = 'Objective field is required';
    if (!soap.assessment.trim()) nextErrors.assessment = 'Assessment field is required';
    if (!soap.plan.trim()) nextErrors.plan = 'Plan field is required';
    prescriptions.forEach((prescription, index) => {
      if (prescription.medication.trim() || prescription.dosage.trim() || prescription.frequency.trim() || prescription.duration.trim()) {
        if (!prescription.medication.trim()) nextErrors[`prescription-${index}-medication`] = 'Medication is required';
        if (!prescription.dosage.trim()) nextErrors[`prescription-${index}-dosage`] = 'Dosage is required';
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const filteredPrescriptions = prescriptions.filter((prescription) => prescription.medication.trim());
    const payload = {
      appointmentId,
      petId,
      doctorId,
      recordType,
      date,
      notes,
      soap,
      prescriptions: filteredPrescriptions,
      attachments
    };

    try {
      await mutation.mutateAsync(payload);
      navigate('/doctor/medical-records');
    } catch (error: any) {
      setErrors({ form: error?.message || 'Failed to create medical record' });
    }
  }

  const isSaving = mutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Create Medical Record"
        description="Capture SOAP notes, prescriptions, and supporting attachments for a pet visit."
      />

      <div className="space-y-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Patient</label>
            <Select value={petId} onValueChange={(value) => setPetId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a pet" />
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet: any) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name} {pet.species ? `· ${pet.species}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.petId && <p className="mt-1 text-sm text-red-600">{errors.petId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Doctor</label>
            <Select value={doctorId} onValueChange={(value) => setDoctorId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor: any) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Visit Date</label>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Record Type</label>
            <Select value={recordType} onValueChange={(value) => setRecordType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Subjective</label>
            <textarea
              rows={4}
              value={soap.subjective}
              onChange={(event) => setSoap((current) => ({ ...current, subjective: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.subjective && <p className="mt-1 text-sm text-red-600">{errors.subjective}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Objective</label>
            <textarea
              rows={4}
              value={soap.objective}
              onChange={(event) => setSoap((current) => ({ ...current, objective: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.objective && <p className="mt-1 text-sm text-red-600">{errors.objective}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Assessment</label>
            <textarea
              rows={4}
              value={soap.assessment}
              onChange={(event) => setSoap((current) => ({ ...current, assessment: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.assessment && <p className="mt-1 text-sm text-red-600">{errors.assessment}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Plan</label>
            <textarea
              rows={4}
              value={soap.plan}
              onChange={(event) => setSoap((current) => ({ ...current, plan: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.plan && <p className="mt-1 text-sm text-red-600">{errors.plan}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Prescriptions</h2>
            <Button type="button" variant="outline" onClick={addPrescription}>
              <Plus className="w-4 h-4 mr-2" /> Add row
            </Button>
          </div>

          {prescriptions.map((prescription, index) => (
            <div key={`prescription-${index}`} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Medication</label>
                <Input
                  value={prescription.medication}
                  onChange={(event) => setPrescriptionField(index, 'medication', event.target.value)}
                />
                {errors[`prescription-${index}-medication`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`prescription-${index}-medication`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Dosage</label>
                <Input
                  value={prescription.dosage}
                  onChange={(event) => setPrescriptionField(index, 'dosage', event.target.value)}
                />
                {errors[`prescription-${index}-dosage`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`prescription-${index}-dosage`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Frequency</label>
                <Input
                  value={prescription.frequency}
                  onChange={(event) => setPrescriptionField(index, 'frequency', event.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Duration</label>
                <Input
                  value={prescription.duration}
                  onChange={(event) => setPrescriptionField(index, 'duration', event.target.value)}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="button" variant="danger" onClick={() => removePrescription(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Attachments</label>
          <input type="file" multiple onChange={handleFiles} className="block w-full text-sm text-slate-700" />
          {attachments.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {attachments.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            <Upload className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Record'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/doctor/medical-records')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
