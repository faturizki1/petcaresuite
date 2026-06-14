import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Skeleton } from '@/components/ui';
import { useVaccinationRecord, useGenerateVaccinationCertificate, useAttachVaccinationCertificate } from '../vaccinations.hooks';

export default function VaccinationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: record, isLoading } = useVaccinationRecord(id);
  const gen = useGenerateVaccinationCertificate();
  const attach = useAttachVaccinationCertificate();

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full rounded-3xl" /><Skeleton className="h-40 w-full rounded-3xl" /></div>;
  if (!record) return <div className="p-6">Vaccination record not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate('/staff/vaccinations')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <PageHeader title="Vaccination Detail" description={`Details for ${record.vaccineName} administered to ${record.petId}.`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <div className="text-sm text-slate-500">Vaccine</div>
            <div className="text-lg font-semibold">{record.vaccineName}</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Pet ID</div>
              <div className="mt-2 font-medium">{record.petId}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Veterinarian</div>
              <div className="mt-2 font-medium">{record.veterinarianId}</div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Administered</div>
              <div className="mt-2 font-medium">{new Date(record.dateAdministered).toLocaleDateString()}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Next due</div>
              <div className="mt-2 font-medium">{record.nextDue ? new Date(record.nextDue).toLocaleDateString() : 'Not scheduled'}</div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Notes</div>
            <div className="mt-2 text-sm leading-6 text-slate-700">{record.notes || 'No additional notes.'}</div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm text-slate-500">Certificate</p>
              <p className="font-semibold">{record.certificateUrl ? 'Available' : 'Not generated yet'}</p>
            </div>
            {record.certificateUrl ? (
              <a
                href={record.certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            ) : (
              <Button
                type="button"
                onClick={async () => {
                  try {
                    const cert = await gen.mutateAsync(id as string);
                    await attach.mutateAsync({ id: id as string, url: cert.url });
                    window.open(cert.url, '_blank');
                  } catch {
                    toast.error('Failed to generate certificate. Please try again.');
                  }
                }}
                disabled={gen.isLoading || attach.isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Certificate
              </Button>
            )}
          </div>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
            Vaccination certificates include administration date, vaccine lot, and clinic authorization.
          </div>
        </div>
      </div>
    </div>
  );
}
