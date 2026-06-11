import React, { useEffect, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input } from '@/components/ui';
import { useCreateMedicalRecord } from '../medical-records.hooks';

const emptyPrescription = { medication: '', dosage: '', frequency: '', duration: '' };

export default function CreateMedicalRecordPage() {
  const [searchParams] = useSearchParams();
  const [petId, setPetId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [prescriptions, setPrescriptions] = useState([emptyPrescription]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const mutation = useCreateMedicalRecord();

  useEffect(() => {
    const paramPetId = searchParams.get('petId');
    if (paramPetId) setPetId(paramPetId);
  }, [searchParams]);

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
    if (!petId.trim()) nextErrors.petId = 'Pet ID is required';
    if (!doctorId.trim()) nextErrors.doctorId = 'Doctor ID is required';
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

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    const filteredPrescriptions = prescriptions.filter((prescription) => prescription.medication.trim());
    const payload = {
      petId,
      doctorId,
      date,
      soap,
      prescriptions: filteredPrescriptions,
      attachments: attachments.map((file) => ({ filename: file.name, url: `/uploads/${encodeURIComponent(file.name)}` }))
    };

    try {
      await mutation.mutateAsync(payload);
      navigate('/doctor/medical-records');
    } catch (error: any) {
      setErrors({ form: error?.message || 'Failed to create medical record' });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Create Medical Record"
        description="Capture SOAP notes, prescriptions, and supporting attachments for a pet visit."
      />

      <form onSubmit={onSubmit} className="space-y-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Pet ID</label>
            <Input value={petId} onChange={(event) => setPetId(event.target.value)} />
            {errors.petId && <p className="mt-1 text-sm text-red-600">{errors.petId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Doctor ID</label>
            <Input value={doctorId} onChange={(event) => setDoctorId(event.target.value)} />
            {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Visit Date</label>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
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
          <Button type="submit" disabled={mutation.isLoading}>
            <Upload className="w-4 h-4 mr-2" />
            {mutation.isLoading ? 'Saving...' : 'Save Record'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/doctor/medical-records')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
