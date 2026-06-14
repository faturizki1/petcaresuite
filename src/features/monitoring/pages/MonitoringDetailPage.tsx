import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Skeleton } from '@/components/ui';
import { useMonitoringEntry, useApproveUpload } from '../monitoring.hooks';

export default function MonitoringDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useMonitoringEntry(id);
  const approveUpload = useApproveUpload();

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full rounded-3xl" /><Skeleton className="h-40 w-full rounded-3xl" /></div>;
  if (!data) return <div className="p-6">Monitoring entry not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate('/staff/monitoring')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <PageHeader title="Monitoring Detail" description={`Tracking recovery and medication for pet ${data.petId}.`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Date</p>
              <p className="mt-2 text-base font-semibold">{new Date(data.date).toLocaleDateString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Weight</p>
              <p className="mt-2 text-base font-semibold">{data.weightKg} kg</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Medication Plan</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{data.medicationPlan}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Recovery Notes</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{data.recoveryNotes}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Next Check</p>
              <p className="mt-2 text-base font-semibold">{data.nextCheck ? new Date(data.nextCheck).toLocaleDateString() : 'Not scheduled'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Uploads</p>
              <p className="mt-2 text-base font-semibold">{data.uploads.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Owner Uploads</p>
                <p className="font-semibold">Review media submitted by the owner.</p>
              </div>
            </div>
            {data.uploads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">No owner uploads yet.</div>
            ) : (
              <div className="space-y-3">
                {data.uploads.map((upload) => (
                  <div key={upload.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{upload.filename}</p>
                        <p className="text-sm text-slate-500">{new Date(upload.uploadedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={upload.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                        >
                          Open
                        </a>
                        <Button
                          variant="default"
                          onClick={() => approveUpload.mutate({ id: upload.id, status: upload.status === 'approved' ? 'rejected' : 'approved', entryId: data.id })}
                        >
                          {upload.status === 'approved' ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                          {upload.status === 'approved' ? 'Reject' : 'Approve'}
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Status: {upload.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
