import { useMemo, useState } from 'react';
import { HeartPulse, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortalCustomerId, usePortalInpatientRecords, usePortalInpatientObservations } from '../portal.hooks';
import { portalService } from '../portal.service';
import { Card, Button, Separator } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PortalInpatientPage() {
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const inpatientQuery = usePortalInpatientRecords(customerIdQuery.data ?? undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useDocumentTitle('Inpatient Status');

  const activeRecords = useMemo(
    () => (inpatientQuery.data || []).filter((record) => record.status === 'admitted'),
    [inpatientQuery.data]
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Inpatient Status</p>
            <h1 className="text-2xl font-semibold text-slate-900">Active inpatient care</h1>
          </div>
          <p className="text-sm text-slate-500">Monitor your pet’s inpatient stay and daily observations.</p>
        </div>
      </Card>

      {inpatientQuery.isLoading ? (
        <Card className="p-6 text-slate-600">Loading inpatient records...</Card>
      ) : !activeRecords.length ? (
        <EmptyState
          icon={HeartPulse}
          title="No active inpatient stay"
          description="Your pets do not currently have an active inpatient admission. Contact the clinic if you need urgent care."
          action={
            <Button asChild>
              <a href="/portal/appointments" className="inline-flex">Contact clinic</a>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {activeRecords.map((record) => (
            <Card key={record.id} className="space-y-6 p-6">
              <div className="grid gap-6 lg:grid-cols-[1.3fr,0.9fr]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-14 w-14 rounded-3xl bg-slate-100 dark:bg-slate-900" />
                    <div>
                      <p className="text-sm text-slate-500">Pet admitted</p>
                      <h2 className="text-xl font-semibold text-slate-900">{record.petName}</h2>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Cage</p>
                      <p className="mt-1 text-slate-900">{record.cageName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Admitted</p>
                      <p className="mt-1 text-slate-900">{formatDate(record.admitDate, { year: 'numeric', month: 'long', day: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Days admitted</p>
                      <p className="mt-1 text-slate-900">{record.daysAdmitted}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Latest observation</p>
                      <p className="mt-1 text-slate-900">{record.latestObservationDate ? formatDate(record.latestObservationDate, { year: 'numeric', month: 'long', day: '2-digit' }) : 'No observations yet'}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-sm text-slate-500">Billing</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">{formatCurrency(record.totalBill)}</div>
                  <p className="mt-2 text-sm text-slate-500">Final bill due at discharge.</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}>
                  {expandedId === record.id ? (
                    <><ChevronUp className="mr-2 h-4 w-4" /> Hide daily reports</>
                  ) : (
                    <><ChevronDown className="mr-2 h-4 w-4" /> View daily reports</>
                  )}
                </Button>
                <Button asChild>
                  <a href="/portal/inpatient" className="inline-flex">Open inpatient details</a>
                </Button>
              </div>

              {expandedId === record.id ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Daily reports</h3>
                  <InpatientReportList recordId={record.id} customerId={customerIdQuery.data ?? undefined} />
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InpatientReportList({ recordId, customerId }: { recordId: string; customerId?: string }) {
  const observationsQuery = usePortalInpatientObservations(customerId, recordId);

  if (observationsQuery.isLoading) {
    return <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">Loading reports...</div>;
  }

  if (!observationsQuery.data?.length) {
    return <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">No daily observations have been recorded yet.</div>;
  }

  return (
    <div className="space-y-4">
      {observationsQuery.data.map((observation) => (
        <Card key={observation.id} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{formatDate(observation.observed_at, { year: 'numeric', month: 'long', day: '2-digit' })}</p>
              <p className="mt-2 text-slate-900">Temp: {observation.temperature}°C · Appetite: {observation.appetite}</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Condition: {observation.condition}</div>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-slate-600">{observation.notes || 'No notes recorded.'}</p>
        </Card>
      ))}
    </div>
  );
}
