import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAppointments } from '../appointments.hooks';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';
import { Link } from 'react-router-dom';

export default function AppointmentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all'|'scheduled'|'checked_in'|'in_consultation'|'completed'|'cancelled'>('all');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAppointments({ page, pageSize: 20, search, status: status==='all'?undefined:status });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <div className="flex gap-2">
          <Link to="/staff/appointments/create" className="px-3 py-1 border rounded">Create</Link>
          <Link to="/staff/appointments/calendar" className="px-3 py-1 border rounded">Calendar</Link>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center border rounded px-2">
          <Search className="w-4 h-4 mr-2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search service" className="p-2 outline-none" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="p-2 border rounded">
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="checked_in">Checked In</option>
          <option value="in_consultation">In Consultation</option>
          <option value="completed">Completed</option>
+          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white shadow rounded">
        {isLoading ? (
          <div className="p-6">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center">No appointments found.</div>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Queue</th>
                <th className="p-3">Service</th>
                <th className="p-3">Pet</th>
                <th className="p-3">Doctor</th>
                <th className="p-3">Scheduled</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a: any) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{a.queueNumber}</td>
                  <td className="p-3"><Link to={`/staff/appointments/${a.id}`}>{a.service}</Link></td>
                  <td className="p-3">{a.petName || a.petId}</td>
                  <td className="p-3">{a.doctorName || a.doctorId || 'Unassigned'}</td>
                  <td className="p-3">{new Date(a.scheduledAt).toLocaleString()}</td>
                  <td className="p-3"><AppointmentStatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>Showing {items.length} of {total}</div>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  );
}
