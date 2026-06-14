import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle, Clock } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useCreateAppointment, useGetDoctorAvailability, useDoctors, useServices } from '../appointments.hooks';
import { formatCurrency } from '@/lib/utils';
import { useCustomers, useCustomerPets } from '@/features/customers/customers.hooks';

export default function CreateAppointmentPage() {
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [petId, setPetId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const customerQuery = useCustomers({ page: 1, pageSize: 50, search: customerSearch });
  const petsQuery = useCustomerPets(customerId);
  const doctorQuery = useDoctors(doctorSearch);
  const servicesQuery = useServices();
  const selectedService = useMemo(
    () => servicesQuery.data?.find((service) => service.id === serviceId),
    [servicesQuery.data, serviceId]
  );
  const { data: availability, isLoading: isAvailabilityLoading } = useGetDoctorAvailability(
    doctorId,
    date,
    selectedService?.durationMinutes
  );
  const mutation = useCreateAppointment();

  const slotOptions = useMemo(() => {
    if (!availability?.slots) return [];
    return availability.slots.slice(0, 12);
  }, [availability]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!customerId.trim()) nextErrors.customerId = 'Customer is required';
    if (!petId.trim()) nextErrors.petId = 'Pet is required';
    if (!serviceId.trim()) nextErrors.serviceId = 'Service is required';
    if (!doctorId.trim()) nextErrors.doctorId = 'Doctor is required';
    if (!date) nextErrors.date = 'Appointment date is required';
    if (!slot) nextErrors.slot = 'Please select an available time slot';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const selectedSlot = JSON.parse(slot) as { startTime: string; endTime: string };
      await mutation.mutateAsync({
        customerId,
        petId,
        serviceId,
        doctorId,
        appointmentDate: date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes
      });
      navigate('/staff/appointments');
    } catch (err: any) {
      setErrors({ form: err?.message || 'Unable to create appointment' });
    }
  }

  const customers = customerQuery.data?.items ?? [];
  const pets = petsQuery.data ?? [];
  const doctors = doctorQuery.data ?? [];
  const services = servicesQuery.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Create Appointment"
        description="Schedule a new consultation in six steps: customer, pet, service, doctor, date, and review."
      />

      <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Step 1: Customer</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Search Customer</label>
              <Input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search by customer name"
              />
            </div>
            <div>
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
          </div>
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Step 2: Pet</p>
          <div>
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
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Step 3: Service</p>
          <div>
            <label className="block text-sm font-medium text-slate-700">Service</label>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setSlot('');
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select a service</option>
                {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.durationMinutes} min · {formatCurrency(s.price)}
                </option>
              ))}
            </select>
            {errors.serviceId && <p className="mt-1 text-sm text-red-600">{errors.serviceId}</p>}
          </div>
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Step 4: Doctor</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Search Doctor</label>
              <Input
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search by doctor name or specialization"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Doctor</label>
              <select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setSlot('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select a doctor</option>
                {doctorQuery.data?.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName} {doctor.specialization ? `· ${doctor.specialization}` : ''}
                  </option>
                ))}
              </select>
              {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Step 5: Date & Time</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Appointment Date</label>
              <Input type="date" value={date} onChange={(e) => {
                setDate(e.target.value);
                setSlot('');
              }} />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Available Slot</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                disabled={!doctorId || !date || !selectedService}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Choose a time slot</option>
                {slotOptions.map((s) => (
                  <option key={s.startTime} value={JSON.stringify(s)}>
                    {s.startTime} — {s.endTime}
                  </option>
                ))}
              </select>
              {isAvailabilityLoading && <p className="mt-1 text-sm text-slate-500">Loading available slots...</p>}
              {errors.slot && <p className="mt-1 text-sm text-red-600">{errors.slot}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Step 6: Review</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Customer</p>
              <p className="font-medium text-slate-900">{customers.find((c) => c.id === customerId)?.fullName || 'Not chosen'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Pet</p>
              <p className="font-medium text-slate-900">{pets.find((p: any) => p.id === petId)?.name || 'Not chosen'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Service</p>
              <p className="font-medium text-slate-900">{selectedService?.name || 'Not chosen'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Doctor</p>
              <p className="font-medium text-slate-900">{doctorQuery.data?.find((d) => d.id === doctorId)?.fullName || 'Not chosen'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Date</p>
              <p className="font-medium text-slate-900">{date || 'Not chosen'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Slot</p>
              <p className="font-medium text-slate-900">{slot ? JSON.parse(slot).startTime + ' - ' + JSON.parse(slot).endTime : 'Not chosen'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
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
      </div>
    </div>
  );
}
