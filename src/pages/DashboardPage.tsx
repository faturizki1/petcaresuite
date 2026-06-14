import { useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Card, Badge, Button, Skeleton } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useOwnerStats, useWeeklyRevenue, useAppointmentBreakdown, useRecentTransactions, useLowStockItems, useDoctorStats, useStaffStats } from '@/features/dashboard/dashboard.hooks';
import { usePortalCustomer, usePortalCustomerId, usePortalInvoices, usePortalAppointments, usePortalSummary } from '@/features/portal/portal.hooks';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

function SectionSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} width="100%" height="1.25rem" />
      ))}
    </div>
  );
}

function StatCard({ title, value, description, isLoading }: { title: string; value: string; description: string; isLoading?: boolean }) {
  return (
    <Card className="space-y-3 p-6">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
      {isLoading
        ? <Skeleton className="h-9 w-24 mt-2" />
        : <div className="text-3xl font-semibold text-slate-950 dark:text-slate-100">{value}</div>
      }
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const variant = status === 'paid' || status === 'completed' ? 'default' : status === 'scheduled' || status === 'pending' ? 'secondary' : 'outline';
  return <Badge variant={variant}>{status}</Badge>;
}

function OwnerDashboard() {
  const statsQuery = useOwnerStats();
  const revenueQuery = useWeeklyRevenue();
  const breakdownQuery = useAppointmentBreakdown(new Date().getMonth() + 1, new Date().getFullYear());
  const transactionQuery = useRecentTransactions();
  const lowStockQuery = useLowStockItems();

  const stats = statsQuery.data;
  const weeklyRevenue = revenueQuery.data || [];
  const recentInvoices = transactionQuery.data || [];
  const lowStockItems = lowStockQuery.data || [];
  const breakdown = breakdownQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Revenue today" value={formatCurrency(stats?.revenueToday ?? 0)} description="Paid invoice revenue captured so far today." isLoading={statsQuery.isLoading} />
        <StatCard title="Appointments today" value={String(stats?.appointmentsToday ?? 0)} description="Scheduled patient visits for today." isLoading={statsQuery.isLoading} />
        <StatCard title="Active inpatients" value={String(stats?.activeInpatients ?? 0)} description="Pets currently admitted in inpatient care." isLoading={statsQuery.isLoading} />
        <StatCard title="Pending vaccinations" value={String(stats?.pendingVaccinations ?? 0)} description="Vaccination reminders due soon." isLoading={statsQuery.isLoading} />
        <StatCard title="Low stock alerts" value={String(stats?.lowStockCount ?? 0)} description="Items at or below minimum stock levels." isLoading={statsQuery.isLoading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Weekly revenue</p>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Last 7 days</h2>
            </div>
            <Badge variant="secondary">Revenue</Badge>
          </div>
          <div className="mt-6 h-72">
            {revenueQuery.isLoading ? (
              <SectionSkeleton lines={6} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
                  <YAxis tickFormatter={(value) => formatCurrency(Number(value))} tick={{ fill: '#64748b' }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Appointment status</p>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">This month</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => breakdownQuery.refetch()}>
              Refresh
            </Button>
          </div>
          {breakdownQuery.isLoading ? (
            <SectionSkeleton />
          ) : (
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <span>{item.status}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
              {!breakdown.length && <p className="text-sm text-slate-500 dark:text-slate-400">No appointment activity recorded yet.</p>}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent invoices</p>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Latest transactions</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => transactionQuery.refetch()}>
              Refresh
            </Button>
          </div>
          <div className="mt-6">
            <DataTable
              columns={[
                { key: 'invoiceNumber', header: 'Invoice' },
                { key: 'customerName', header: 'Customer' },
                { key: 'total', header: 'Total', render: (row: any) => formatCurrency(row.total) },
                { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> },
                { key: 'createdAt', header: 'Date', render: (row: any) => formatDate(row.createdAt, { day: 'numeric', month: 'short' }) }
              ]}
              data={recentInvoices}
              isLoading={transactionQuery.isLoading}
              emptyTitle="No invoice history"
              emptyDescription="Recent transactions will appear here once invoices are created."
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Low stock</p>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Inventory alerts</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => lowStockQuery.refetch()}>
              Refresh
            </Button>
          </div>
          {lowStockQuery.isLoading ? (
            <div className="mt-6">
              <SectionSkeleton />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {lowStockItems.length ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Minimum {item.minStock} / available {item.currentStock}</p>
                      </div>
                      <Badge variant="outline">{item.currentStock <= item.minStock ? 'Critical' : 'Low'}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">All tracked inventory levels are healthy.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function DoctorDashboard() {
  const user = useAuthStore((state) => state.user);
  const doctorQuery = useDoctorStats(user?.id);
  const doctorStats = doctorQuery.data;
  const appointmentRows = doctorStats?.todayAppointments || [];
  const recordRows = doctorStats?.recentMedicalRecords || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today appointments" value={String(appointmentRows.length)} description="Sessions scheduled for you today." isLoading={doctorQuery.isLoading} />
        <StatCard title="Active inpatients" value={String(doctorStats?.activeInpatients ?? 0)} description="Patients currently in inpatient care." isLoading={doctorQuery.isLoading} />
        <StatCard title="Recent records" value={String(recordRows.length)} description="Latest case notes created." isLoading={doctorQuery.isLoading} />
        <Card className="space-y-3 p-6">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Next actions</div>
          <p className="text-slate-700 dark:text-slate-200">Review upcoming appointments, update treatment notes, and close today&apos;s cases.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today&apos;s appointments</p>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Appointment schedule</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => doctorQuery.refetch()}>
              Refresh
            </Button>
          </div>
          <div className="mt-6">
            <DataTable
              columns={[
                { key: 'appointmentDate', header: 'Date', render: (row: any) => formatDate(row.appointmentDate, { day: 'numeric', month: 'short' }) },
                { key: 'startTime', header: 'Start', render: (row: any) => row.startTime ?? '-' },
                { key: 'service', header: 'Service' },
                { key: 'petName', header: 'Pet' },
                { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> }
              ]}
              data={appointmentRows}
              isLoading={doctorQuery.isLoading}
              emptyTitle="No appointments today"
              emptyDescription="Your schedule will appear once appointments are assigned."
            />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent medical records</p>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Recent notes</h2>
          </div>
          <div className="mt-6 space-y-4">
            {doctorQuery.isLoading ? (
              <SectionSkeleton />
            ) : recordRows.length ? (
              recordRows.map((record) => (
                <Card key={record.id} className="border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{record.recordType}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{record.petName ?? 'Unknown pet'}</p>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(record.createdAt, { day: 'numeric', month: 'short' })}</span>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No recent medical records available.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StaffDashboard() {
  const staffQuery = useStaffStats();
  const stats = staffQuery.data;
  const appointments = stats?.todayAppointments ?? [];
  const lowStock = stats?.lowStockAlerts ?? [];
  const grooming = stats?.todayGrooming ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today appointments" value={String(appointments.length)} description="Tasks scheduled for your team today." isLoading={staffQuery.isLoading} />
        <StatCard title="Grooming today" value={String(grooming.length)} description="Grooming services set for today." isLoading={staffQuery.isLoading} />
        <StatCard title="Low stock alerts" value={String(lowStock.length)} description="Needed inventory restocks." isLoading={staffQuery.isLoading} />
        <Card className="space-y-3 p-6">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Operational overview</div>
          <p className="text-slate-700 dark:text-slate-200">Keep track of service delivery, stock, and customer appointments.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's schedule</p>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Appointment list</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => staffQuery.refetch()}>
              Refresh
            </Button>
          </div>
          <div className="mt-6">
            <DataTable
              columns={[
                { key: 'appointmentDate', header: 'Date', render: (row: any) => formatDate(row.appointmentDate, { day: 'numeric', month: 'short' }) },
                { key: 'startTime', header: 'Start', render: (row: any) => row.startTime ?? '-' },
                { key: 'service', header: 'Service' },
                { key: 'petName', header: 'Pet' },
                { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> }
              ]}
              data={appointments}
              isLoading={staffQuery.isLoading}
              emptyTitle="No staff appointments"
              emptyDescription="Your team schedule will populate once appointments are created."
            />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inventory alerts</p>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Low stock items</h2>
          </div>
          <div className="mt-6 space-y-3">
            {staffQuery.isLoading ? (
              <SectionSkeleton />
            ) : lowStock.length ? (
              lowStock.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.currentStock} remaining · min {item.minStock}</p>
                    </div>
                    <Badge variant="outline">Restock</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Inventory levels look healthy today.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Grooming schedule</p>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Today&apos;s services</h2>
        </div>
        <div className="mt-6 space-y-4">
          {staffQuery.isLoading ? (
            <SectionSkeleton />
          ) : grooming.length ? (
            grooming.map((entry) => (
              <Card key={entry.id} className="border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.service ?? 'Service'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{entry.petName ?? 'Pet not assigned'}</p>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(entry.scheduledAt, { day: 'numeric', month: 'short' })}</span>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No grooming appointments scheduled for today.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function CustomerDashboard() {
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const summaryQuery = usePortalSummary(customerIdQuery.data ?? undefined);
  const customerQuery = usePortalCustomer(user?.id);
  const appointmentsQuery = usePortalAppointments(customerIdQuery.data ?? undefined);
  const invoicesQuery = usePortalInvoices(customerIdQuery.data ?? undefined);

  const summary = summaryQuery.data;
  const appointments = appointmentsQuery.data || [];
  const invoices = invoicesQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Your pets" value={String(summary?.petCount ?? 0)} description="Pets currently registered in your account." isLoading={summaryQuery.isLoading} />
        <StatCard title="Upcoming visits" value={String(summary?.appointmentCount ?? 0)} description="Future appointments scheduled for you." isLoading={summaryQuery.isLoading} />
        <StatCard title="Invoices" value={String(summary?.invoiceCount ?? 0)} description="Recent billing records on file." isLoading={summaryQuery.isLoading} />
        <Card className="space-y-3 p-6">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Account</div>
          <p className="text-slate-700 dark:text-slate-200">Manage bookings, payment history, and pet records in one place.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Your profile</p>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Account details</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{customerQuery.data?.fullName ?? user?.fullName ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{customerQuery.data?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">WhatsApp</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{customerQuery.data?.whatsapp ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{customerQuery.data?.status ?? '—'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming appointments</p>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Your next visits</h2>
            </div>
          </div>
          <div className="mt-6">
            <DataTable
              columns={[
                { key: 'appointmentDate', header: 'Date', render: (row: any) => formatDate(row.appointmentDate, { day: 'numeric', month: 'short' }) },
                { key: 'startTime', header: 'Start', render: (row: any) => row.startTime ?? '-' },
                { key: 'service', header: 'Service' },
                { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> }
              ]}
              data={appointments}
              isLoading={appointmentsQuery.isLoading}
              emptyTitle="No upcoming appointments"
              emptyDescription="Book a visit to see it appear in your dashboard."
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent invoices</p>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Billing history</h2>
          </div>
        </div>
        <div className="mt-6">
          <DataTable
            columns={[
              { key: 'id', header: 'Invoice ID' },
              { key: 'total', header: 'Total', render: (row: any) => formatCurrency(row.total) },
              { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> },
              { key: 'createdAt', header: 'Date', render: (row: any) => formatDate(row.createdAt, { day: 'numeric', month: 'short' }) }
            ]}
            data={invoices}
            isLoading={invoicesQuery.isLoading}
            emptyTitle="No billing records"
            emptyDescription="Invoices will appear here after checkout or service completion."
          />
        </div>
      </Card>
    </div>
  );
}

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const role = useAuthStore((state) => state.role);

  const dashboardContent = useMemo(() => {
    switch (role) {
      case 'owner':
        return <OwnerDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'customer':
      default:
        return <CustomerDashboard />;
    }
  }, [role]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Quick access to your PetCare Suite workspace and role-specific insights." />
      {dashboardContent}
    </div>
  );
}

