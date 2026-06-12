import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePet } from '../pets.hooks';
import { usePetVaccinations } from '@/features/vaccinations/vaccinations.hooks';
import { usePetMonitoring } from '@/features/monitoring/monitoring.hooks';
import { usePetTimeline } from '../pets.hooks';
import { useMedicalRecords } from '@/features/medical-records/medical-records.hooks';
import PetQRCard from '../components/PetQRCard';

export default function PetProfilePage() {
  const { id } = useParams();
  const { data, isLoading } = usePet(id);
  const vaccinationQuery = usePetVaccinations(id);
  const monitoringQuery = usePetMonitoring(id);
  const timelineQuery = usePetTimeline(id);
  const medicalRecordsQuery = useMedicalRecords({ petId: id, page: 1, pageSize: 5 });
  const pet = data as any;
  const [tab, setTab] = useState<'overview'|'medical'|'vaccinations'|'monitoring'|'timeline'>('overview');

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!pet) return <div className="p-6">Pet not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm text-slate-500">Pet</div>
          <h1 className="text-2xl font-semibold">{pet.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/staff/pets/${id}/edit`} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            Edit
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 border-b pb-4">
          {(['overview', 'medical', 'vaccinations', 'monitoring', 'timeline'] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setTab(entry)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${tab === entry ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              {entry === 'overview' ? 'Overview' : entry === 'medical' ? 'Medical' : entry === 'vaccinations' ? 'Vaccinations' : entry === 'monitoring' ? 'Monitoring' : 'Timeline'}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'overview' && (
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-sm text-slate-500">Details</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Species</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.species || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Breed</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.breed || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Gender</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.gender || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Owner</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.customerName || 'Unknown owner'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Birth date</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Weight</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.weight ? `${pet.weight} kg` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Color</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.color || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Microchip</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.microchipNumber || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Sterilized</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.isSterilized ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Active</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.isActive ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <PetQRCard petId={pet.id} />
              </div>
            </div>
          )}

          {tab === 'medical' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Medical records</h2>
                  <p className="text-sm text-slate-500">Visit notes and prescriptions for this pet.</p>
                </div>
                <Link
                  to={`/doctor/medical-records/create?petId=${encodeURIComponent(id ?? '')}`}
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  New Record
                </Link>
              </div>
              {medicalRecordsQuery.isLoading ? (
                <div className="text-sm text-slate-600">Loading medical records...</div>
              ) : medicalRecordsQuery.data?.items.length ? (
                <div className="space-y-3">
                  {medicalRecordsQuery.data.items.map((record: any) => (
                    <Link
                      key={record.id}
                      to={`/doctor/medical-records/${record.id}`}
                      className="block rounded-3xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">Visit on {new Date(record.date).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-600">Doctor: {record.doctorId}</p>
                        </div>
                        <span className="text-sm text-slate-500">View record</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No medical records found for this pet.</div>
              )}
            </div>
          )}

          {tab === 'vaccinations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Vaccination history</h2>
                  <p className="text-sm text-slate-500">Past vaccines and upcoming due dates.</p>
                </div>
                <Link
                  to={`/staff/vaccinations/create?petId=${encodeURIComponent(id ?? '')}`}
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  New Vaccination
                </Link>
              </div>
              {vaccinationQuery.isLoading ? (
                <div className="text-sm text-slate-600">Loading vaccination history...</div>
              ) : vaccinationQuery.data?.length ? (
                <ul className="space-y-3">
                  {vaccinationQuery.data.map((record: any) => (
                    <li key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{record.vaccineName}</p>
                          <p className="text-sm text-slate-600">Administered {new Date(record.dateAdministered).toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm text-slate-500">Next due {record.nextDue ? new Date(record.nextDue).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No vaccination history available for this pet.</div>
              )}
            </div>
          )}

          {tab === 'monitoring' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Monitoring history</h2>
                  <p className="text-sm text-slate-500">Track recovery, weight, and follow-up care.</p>
                </div>
                <Link
                  to={`/staff/monitoring/create?petId=${encodeURIComponent(id ?? '')}`}
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  New Entry
                </Link>
              </div>
              {monitoringQuery.isLoading ? (
                <div className="text-sm text-slate-600">Loading monitoring history...</div>
              ) : monitoringQuery.data?.length ? (
                <ul className="space-y-3">
                  {monitoringQuery.data.map((entry: any) => (
                    <li key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{new Date(entry.date).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-600">Weight {entry.weightKg} kg</p>
                        </div>
                        <div className="text-right text-sm text-slate-600">
                          <p>Next check</p>
                          <p className="font-medium text-slate-900">{entry.nextCheck ? new Date(entry.nextCheck).toLocaleDateString() : 'None'}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No monitoring entries available.</div>
              )}
            </div>
          )}

          {tab === 'timeline' && (
            <div className="space-y-4">
              {timelineQuery.isLoading ? (
                <div className="text-sm text-slate-600">Loading timeline...</div>
              ) : timelineQuery.data?.length ? (
                <ul className="space-y-3">
                  {timelineQuery.data.map((entry: any) => (
                    <li key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">{new Date(entry.created_at || entry.date).toLocaleDateString()}</p>
                      <p className="mt-2 font-semibold text-slate-900">{entry.title || entry.event || 'Timeline entry'}</p>
                      <p className="mt-1 text-sm text-slate-600">{entry.description || entry.notes || 'No details available.'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No timeline entries available.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
