import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppointment, useUpdateAppointmentStatus } from '../appointments.hooks';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useAppointment(id);
  const mutation = useUpdateAppointmentStatus();

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Not found</div>;

  async function updateStatus(status: string) {
    try {
      await mutation.mutateAsync({ id: id as string, status });
      alert('Status updated');
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Appointment</div>
          <h1 className="text-2xl font-semibold">{data.service}</h1>
          <div className="mt-2"><AppointmentStatusBadge status={data.status} /></div>
        </div>
        <div className="flex gap-2">
          <Link to="/staff/appointments" className="px-3 py-1 border rounded">Back</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <div><strong>Pet:</strong> {data.petName || data.petId}</div>
          <div><strong>Customer:</strong> {data.customerName || data.customerId}</div>
          <div><strong>Doctor:</strong> {data.doctorName || data.doctorId || 'Unassigned'}</div>
          <div><strong>Service:</strong> {data.service}</div>
          <div><strong>Appointment date:</strong> {new Date(`${data.appointmentDate}T${data.startTime}`).toLocaleString()}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button disabled={mutation.isLoading || data.status !== 'scheduled'} onClick={() => updateStatus('checked_in')} className="px-3 py-1 border rounded disabled:opacity-50">Check-in</button>
            <button disabled={mutation.isLoading || data.status !== 'checked_in'} onClick={() => updateStatus('in_consultation')} className="px-3 py-1 border rounded disabled:opacity-50">Start</button>
            <button disabled={mutation.isLoading || data.status === 'completed' || data.status === 'cancelled'} onClick={() => updateStatus('completed')} className="px-3 py-1 border rounded disabled:opacity-50">Complete</button>
            <button disabled={mutation.isLoading || data.status === 'completed'} onClick={() => updateStatus('cancelled')} className="px-3 py-1 border rounded disabled:opacity-50">Cancel</button>
          </div>
        </div>
        <div className="p-4 border rounded">Notes: {data.notes}</div>
      </div>
    </div>
  );
}
