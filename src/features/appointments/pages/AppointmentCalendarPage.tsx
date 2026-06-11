import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, List, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCalendarAppointments } from '../appointments.hooks';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';

const views = ['month', 'week', 'day'] as const;

export default function AppointmentCalendarPage() {
  const [view, setView] = useState<(typeof views)[number]>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const { start, end, label } = useMemo(() => {
    const date = new Date(currentDate);
    let startDate = new Date(date);
    let endDate = new Date(date);

    if (view === 'month') {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    if (view === 'week') {
      const dayIndex = date.getDay();
      startDate = new Date(date);
      startDate.setDate(date.getDate() - dayIndex);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    }

    if (view === 'day') {
      startDate = new Date(date);
      endDate = new Date(date);
    }

    return {
      start: startDate.toISOString(),
      end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59).toISOString(),
      label:
        view === 'month'
          ? date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
          : view === 'week'
          ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
          : date.toLocaleDateString()
    };
  }, [currentDate, view]);

  const { data = [], isLoading } = useCalendarAppointments(start, end);

  const current = new Date(currentDate);
  function navigate(amount: number) {
    const next = new Date(currentDate);
    if (view === 'month') next.setMonth(current.getMonth() + amount);
    if (view === 'week') next.setDate(current.getDate() + amount * 7);
    if (view === 'day') next.setDate(current.getDate() + amount);
    setCurrentDate(next);
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Appointment Calendar" description="Browse scheduled appointments by month, week, or day." />

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-slate-900">{label}</span>
            <Button variant="outline" size="sm" onClick={() => navigate(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {views.map((option) => (
              <Button
                key={option}
                variant={view === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView(option)}
              >
                {option === 'month' ? <LayoutGrid className="w-4 h-4 mr-2" /> : option === 'week' ? <CalendarDays className="w-4 h-4 mr-2" /> : <List className="w-4 h-4 mr-2" />}
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">Loading appointments...</div>
          ) : data.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600">No appointments scheduled in this range.</div>
          ) : (
            data.map((appointment: any) => (
              <div key={appointment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{new Date(appointment.scheduledAt).toLocaleString()}</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">{appointment.service}</h2>
                    <p className="mt-1 text-sm text-slate-600">Pet {appointment.petId} · Doctor {appointment.doctorId || 'TBD'}</p>
                  </div>
                  <AppointmentStatusBadge status={appointment.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
