import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle, Clock } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useCreateAppointment, useGetDoctorAvailability, useDoctors } from '../appointments.hooks';
import { useCustomers, useCustomerPets } from '@/features/customers/customers.hooks';

export default function CreateAppointmentPage() {
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [petId, setPetId] = useState('');
  const [service, setService] = useState('Consult');
  const [doctorId, setDoctorId] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const customerQuery = useCustomers({ page: 1, pageSize: 50, search: customerSearch });
  const petsQuery = useCustomerPets(customerId);
  const doctorQuery = useDoctors(doctorSearch);
  const { data: availability, isLoading: isAvailabilityLoading } = useGetDoctorAvailability(doctorId, date);
  const mutation = useCreateAppointment();

  const slotOptions = useMemo(() => (availability?.slots || []).slice(0, 8), [availability]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!customerId.trim()) nextErrors.customerId = 'Customer ID is required';
    if (!petId.trim()) nextErrors.petId = 'Pet ID is required';
    if (!service.trim()) nextErrors.service = 'Service is required';
    if (!doctorId.trim()) nextErrors.doctorId = 'Doctor ID is required';
    if (!date) nextErrors.date = 'Scheduled date is required';
    if (!slot) nextErrors.slot = 'Please select an available time slot';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await mutation.mutateAsync({ customerId, petId, service, doctorId, scheduledAt: slot });
      navigate('/staff/appointments');
    } catch (err: any) {
      setErrors({ form: err?.message || 'Unable to create appointment' });
    }
  }

  const customers = customerQuery.data?.items ?? [];
  const pets = petsQuery.data ?? [];
  const doctors = doctorQuery.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Create Appointment"
        description="Schedule a new consultation with a doctor and select an available slot."
      />

      <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Search Customer</label>
            <Input
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search by customer name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Customer</label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setPetId('');
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
            {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Pet</label>
            <select
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              disabled={!customerId}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select a pet</option>
              {pets.map((pet: any) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} · {pet.species}
                </option>
              ))}
            </select>
            {errors.petId && <p className="mt-1 text-sm text-red-600">{errors.petId}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Service</label>
            <Input value={service} onChange={(e) => setService(e.target.value)} />
            {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Search Doctor</label>
            <Input
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              placeholder="Search by doctor name or specialization"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName} {doctor.specialization ? `· ${doctor.specialization}` : ''}
                </option>
              ))}
            </select>
            {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Available Slot</label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              disabled={!doctorId || !date}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Choose a time slot</option>
              {slotOptions.map((s) => (
                <option key={s} value={s}>{new Date(s).toLocaleString()}</option>
              ))}
            </select>
            {isAvailabilityLoading && <p className="mt-1 text-sm text-slate-500">Loading available slots...</p>}
            {errors.slot && <p className="mt-1 text-sm text-red-600">{errors.slot}</p>}
          </div>
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={mutation.isLoading}>
            <CalendarDays className="w-4 h-4 mr-2" />
            {mutation.isLoading ? 'Scheduling...' : 'Schedule Appointment'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/staff/appointments')}>
            <Clock className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
