import React, { useState } from 'react';
import { useCreateAppointment, useGetDoctorAvailability } from '../appointments.hooks';

export default function CreateAppointmentPage() {
  const [customerId, setCustomerId] = useState('');
  const [petId, setPetId] = useState('');
  const [service, setService] = useState('Consult');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  const { data: availability } = useGetDoctorAvailability(doctorId, date);
  const mutation = useCreateAppointment();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId.trim() || !petId.trim() || !service.trim() || !doctorId.trim() || !(slot || date)) {
      alert('Please complete all required appointment fields.');
      return;
    }

    try {
      await mutation.mutateAsync({ customerId, petId, service, doctorId, scheduledAt: slot || date });
      navigate('/staff/appointments');
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Appointment</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Customer ID</label>
          <input value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Pet ID</label>
          <input value={petId} onChange={(e) => setPetId(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Service</label>
          <input value={service} onChange={(e) => setService(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Doctor ID</label>
          <input value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Available Slots</label>
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full p-2 border rounded">
            <option value="">-- choose --</option>
            {(availability?.slots || []).map((s: string) => <option key={s} value={s}>{new Date(s).toLocaleString()}</option>)}
          </select>
        </div>
        <div>
          <button type="submit" className="px-3 py-1 border rounded">Create</button>
        </div>
      </form>
    </div>
  );
}
