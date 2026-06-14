import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button } from '@/components/ui';
import { FileUpload } from '@/components/common/FileUpload';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortalPetById, usePortalPetMedicalRecords, usePortalPetVaccinations, usePortalPetWeightHistory, usePortalPetMedications, useUploadOwnerPhoto, useLogMyPetMedication, usePortalGroomingByPet } from '../portal.hooks';
import { formatDate } from '@/lib/utils';

export default function PortalPetProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<'medical' | 'vaccinations' | 'monitoring' | 'grooming' | 'documents'>('medical');

  const petQuery = usePortalPetById(id);
  const medicalQuery = usePortalPetMedicalRecords(id);
  const vaccinationsQuery = usePortalPetVaccinations(id);
  const weightQuery = usePortalPetWeightHistory(id);
  const medicationsQuery = usePortalPetMedications(id);

  const uploadOwnerPhoto = useUploadOwnerPhoto();
  const logMedication = useLogMyPetMedication();
  const groomingQuery = usePortalGroomingByPet(id);

  useDocumentTitle(petQuery.data?.name ?? 'Pet Profile');

  return (
    <div className="space-y-6">
      <PageHeader title={petQuery.data?.name ?? 'Pet Profile'} description={`Profile for ${petQuery.data?.name ?? 'pet'}`} />

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Owner</div>
            <div className="text-lg font-semibold">{petQuery.data?.name ?? 'Unknown'}</div>
          </div>
          <div>
            <Button variant="outline" onClick={async () => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  try {
                    await uploadOwnerPhoto.mutateAsync({ petId: id as string, file });
                  } catch {
                    toast.error('Failed to upload photo. Please try again.');
                  }
                }
              };
              input.click();
            }}>Upload Photo</Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button variant={tab === 'medical' ? 'default' : 'ghost'} onClick={() => setTab('medical')}>Medical</Button>
          <Button variant={tab === 'vaccinations' ? 'default' : 'ghost'} onClick={() => setTab('vaccinations')}>Vaccinations</Button>
          <Button variant={tab === 'monitoring' ? 'default' : 'ghost'} onClick={() => setTab('monitoring')}>Monitoring</Button>
          <Button variant={tab === 'grooming' ? 'default' : 'ghost'} onClick={() => setTab('grooming')}>Grooming</Button>
          <Button variant={tab === 'documents' ? 'default' : 'ghost'} onClick={() => setTab('documents')}>Documents</Button>
        </div>

        <div>
          {tab === 'medical' && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Medical Records</h4>
              {!medicalQuery.data?.length ? (
                <div className="text-sm text-slate-500">No medical records found.</div>
              ) : (
                <div className="space-y-3">
                  {medicalQuery.data.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{m.title || m.diagnosis}</div>
                        <div className="text-sm text-slate-500">{formatDate(m.date)}</div>
                      </div>
                      <div>
                        <a className="text-sm text-blue-600" href={`/portal/pets/${id}/medical/${m.id}`}>View</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === 'vaccinations' && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Vaccinations</h4>
              {!vaccinationsQuery.data?.length ? (
                <div className="text-sm text-slate-500">No vaccination records.</div>
              ) : (
                <div className="space-y-2">
                  {vaccinationsQuery.data.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{v.vaccine_name || v.name}</div>
                        <div className="text-sm text-slate-500">{formatDate(v.date)}</div>
                      </div>
                      <div>
                        <a className="text-sm text-blue-600" href={`/portal/pets/${id}/vaccinations/${v.id}`}>View</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === 'monitoring' && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Weight & Monitoring</h4>
              {!weightQuery.data?.length ? (
                <div className="text-sm text-slate-500">No monitoring data.</div>
              ) : (
                <div className="space-y-2">
                  {weightQuery.data.map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{w.weight} kg</div>
                        <div className="text-sm text-slate-500">{formatDate(w.recorded_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === 'grooming' && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Grooming</h4>
              {/* Reuse groomingQuery if present */}
              {!groomingQuery.data?.length ? (
                <div className="text-sm text-slate-500">No grooming records.</div>
              ) : (
                <div className="space-y-2">
                  {groomingQuery.data.map((g: any) => (
                    <div key={g.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{g.service_name || g.serviceName}</div>
                        <div className="text-sm text-slate-500">{formatDate(g.scheduled_at || g.created_at)}</div>
                      </div>
                      <div>
                        <a className="text-sm text-blue-600" href={`/portal/grooming/${g.id}`}>View</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === 'documents' && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Documents</h4>
              <div className="text-sm text-slate-500">Upload and view documents like vaccine certificates.</div>
              <div className="mt-3">
                <Button variant="outline" onClick={async () => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      try {
                        await uploadOwnerPhoto.mutateAsync({ petId: id as string, file });
                      } catch {
                        toast.error('Failed to upload document. Please try again.');
                      }
                    }
                  };
                  input.click();
                }}>Upload Document</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
