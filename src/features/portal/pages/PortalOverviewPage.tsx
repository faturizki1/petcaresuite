import { Link } from 'react-router-dom';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuthStore } from '@/stores/auth.store';
import {
  usePortalCustomer,
  usePortalCustomerId,
  usePortalAppointments,
  usePortalVaccinationsDue,
  usePortalTodayMedications,
  usePortalInpatientRecords,
  usePortalInvoices,
  useLogMyPetMedication,
} from '../portal.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CalendarDays, ShieldCheck, Pill, Receipt } from 'lucide-react';

export default function PortalOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const customerQuery = usePortalCustomer(user?.id);
  const customerId = customerIdQuery.data ?? undefined;

  const appointmentsQuery = usePortalAppointments(customerId);
  const vaccinationsDueQuery = usePortalVaccinationsDue(customerId);
  const todayMedicationsQuery = usePortalTodayMedications(customerId);
  const inpatientQuery = usePortalInpatientRecords(customerId);
  const invoicesQuery = usePortalInvoices(customerId);

  const logMedication = useLogMyPetMedication();
  const toast = useToast();

  useDocumentTitle('My Dashboard');

  const customerName = customerQuery.data?.fullName ?? '';

  const handleLogMedication = (scheduleId: string) => {
    logMedication.mutate(
      { scheduleId, status: 'given' },
      {
        onSuccess: () => toast.success('Medication logged successfully'),
        onError: () => toast.error('Failed to log medication'),
      }
    );
  };

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getVaccinationColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 14) return 'text-amber-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Welcome back, {customerName || '...'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here's an overview of your pets and activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Widget 1: Upcoming Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/portal/appointments">New Booking</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/portal/appointments">View all</Link>
              </Button>
            </div>
          </div>
          {appointmentsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : appointmentsQuery.data && appointmentsQuery.data.length > 0 ? (
            <div className="space-y-3">
              {appointmentsQuery.data.slice(0, 3).map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{apt.service}</div>
                    <div className="text-sm text-slate-500">
                      {formatDate(apt.appointmentDate, { year: 'numeric', month: 'short', day: 'numeric' })} at {apt.startTime?.slice(0, 5)}
                    </div>
                  </div>
                  <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'}>
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming appointments"
              description="Book an appointment for your pet today."
              action={
                <Button asChild>
                  <Link to="/portal/appointments">Book Now</Link>
                </Button>
              }
            />
          )}
        </Card>

        {/* Widget 2: Vaccination Reminders */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Vaccination Reminders</h2>
          {vaccinationsDueQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : vaccinationsDueQuery.data && vaccinationsDueQuery.data.length > 0 ? (
            <div className="space-y-3">
              {vaccinationsDueQuery.data.map((v: any) => {
                const days = getDaysRemaining(v.dueDate);
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{v.petName}</div>
                      <div className="text-sm text-slate-500">{v.vaccineName}</div>
                    </div>
                    <div className={`text-sm font-semibold ${getVaccinationColor(days)}`}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d remaining`}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="All vaccinations up to date"
              description="No vaccination reminders due in the next 30 days."
            />
          )}
        </Card>

        {/* Widget 3: Today's Medications */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Medications</h2>
          {todayMedicationsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : todayMedicationsQuery.data && todayMedicationsQuery.data.length > 0 ? (
            <div className="space-y-3">
              {todayMedicationsQuery.data.map((med: any) => (
                <div key={med.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{med.petName}</div>
                    <div className="text-sm text-slate-500">
                      {med.drugName} — {med.dose}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLogMedication(med.id)}
                    disabled={logMedication.isLoading}
                  >
                    Log
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Pill}
              title="No medications today"
              description="Your pets have no scheduled medications for today."
            />
          )}
        </Card>

        {/* Widget 4: Active Inpatient */}
        {inpatientQuery.data && inpatientQuery.data.length > 0 && (
          <Card className="p-6 border-l-4 border-l-amber-500">
            <h2 className="text-lg font-semibold mb-4">Active Inpatient</h2>
            <div className="space-y-3">
              {inpatientQuery.data.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{r.petName}</div>
                    <div className="text-sm text-slate-500">
                      Cage: {r.cageName} · {r.daysAdmitted} day{r.daysAdmitted !== 1 ? 's' : ''} admitted
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/portal/inpatient">Details</Link>
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Widget 5: Recent Invoices */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/portal/invoices">View all</Link>
            </Button>
          </div>
          {invoicesQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : invoicesQuery.data && invoicesQuery.data.length > 0 ? (
            <div className="space-y-3">
              {invoicesQuery.data.slice(0, 3).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{inv.id?.slice(0, 8)}</div>
                    <div className="text-sm text-slate-500">{formatDate(inv.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(inv.total)}</span>
                    <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No invoices yet"
              description="Your invoices will appear here once generated."
            />
          )}
        </Card>
      </div>
    </div>
  );
}