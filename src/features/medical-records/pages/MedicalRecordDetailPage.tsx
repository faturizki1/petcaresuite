import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Paperclip, Pill, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useMedicalRecord, useAddPrescription, useUploadAttachment, useRemovePrescription, useRemoveAttachment } from '../medical-records.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';

const tabs = [
  { id: 'soap', label: 'SOAP' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'followup', label: 'Follow Up' }
] as const;

export default function MedicalRecordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('soap');
  const [newPrescription, setNewPrescription] = useState({ medication: '', dosage: '', frequency: '', duration: '' });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const { data, isLoading } = useMedicalRecord(id);
  const addPrescription = useAddPrescription();
  const uploadAttachment = useUploadAttachment();
  const removePrescription = useRemovePrescription();
  const removeAttachment = useRemoveAttachment();
  const toast = useToast();

  useDocumentTitle(data ? `Medical Record • ${data.petName || data.petId}` : 'Medical Record');

  const prescriptions = data?.prescriptions ?? [];
  const attachments = data?.attachments ?? [];

  const prescriptionValid = useMemo(
    () => newPrescription.medication.trim() && newPrescription.dosage.trim(),
    [newPrescription]
  );

  const handleAddPrescription = async () => {
    if (!id || !prescriptionValid) return;
    try {
      await addPrescription.mutateAsync({ recordId: id, prescription: newPrescription });
      setNewPrescription({ medication: '', dosage: '', frequency: '', duration: '' });
    } catch {
      // swallow error, query invalidation will surface
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAttachmentFile(file);
  };

  const handleUpload = async () => {
    if (!id || !attachmentFile) return;
    await uploadAttachment.mutateAsync({ recordId: id, file: attachmentFile });
    setAttachmentFile(null);
  };

  if (isLoading) {
    return <div className="p-6">Loading medical record...</div>;
  }

  if (!data) {
    return <div className="p-6">Medical record not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={() => navigate('/doctor/medical-records')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <PageHeader title="Medical Record Details" description={`Record for pet ${data.petId} with doctor ${data.doctorId}.`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Date</p>
              <p className="text-base font-semibold">{new Date(data.date).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Pet</p>
              <p className="text-base font-semibold">{data.petName || data.petId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Doctor</p>
              <p className="text-base font-semibold">{data.doctorName || data.doctorId}</p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="soap">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Subjective</p>
                  <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6">{data.soap.subjective}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Objective</p>
                  <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6">{data.soap.objective}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Assessment</p>
                  <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6">{data.soap.assessment}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Plan</p>
                  <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6">{data.soap.plan}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prescriptions">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Prescriptions</h2>
                      <p className="text-sm text-slate-500">Add, review, and manage medication instructions.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Medication</label>
                      <Input
                        value={newPrescription.medication}
                        onChange={(event) => setNewPrescription((current) => ({ ...current, medication: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Dosage</label>
                      <Input
                        value={newPrescription.dosage}
                        onChange={(event) => setNewPrescription((current) => ({ ...current, dosage: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Frequency</label>
                      <Input
                        value={newPrescription.frequency}
                        onChange={(event) => setNewPrescription((current) => ({ ...current, frequency: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Duration</label>
                      <Input
                        value={newPrescription.duration}
                        onChange={(event) => setNewPrescription((current) => ({ ...current, duration: event.target.value }))}
                      />
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={handleAddPrescription} disabled={!prescriptionValid}>
                    <Pill className="w-4 h-4 mr-2" /> Add prescription
                  </Button>
                </div>

                <div className="space-y-3">
                  {prescriptions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No prescriptions have been recorded yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {prescriptions.map((item) => (
                        <div key={item.id} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1.2fr_1fr]">
                          <div>
                            <p className="text-sm font-semibold">{item.medication}</p>
                            <p className="text-sm text-slate-500">{item.frequency} · {item.duration}</p>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                            <div>{item.dosage}</div>
                            <Button type="button" variant="destructive" onClick={async () => {
                                try {
                                  await removePrescription.mutateAsync({ id: item.id, recordId: id as string });
                                  toast.success('Prescription removed');
                                } catch (error: any) {
                                  toast.error(error?.message || 'Unable to remove prescription');
                                }
                              }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attachments">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Upload attachment</label>
                    <input type="file" onChange={handleFileChange} className="mt-2 block w-full text-sm text-slate-700" />
                  </div>
                  <Button type="button" variant="outline" onClick={handleUpload} disabled={!attachmentFile}>
                    <FileText className="w-4 h-4 mr-2" /> Upload
                  </Button>
                </div>
                {attachments.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No attachments uploaded yet.</div>
                ) : (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <p className="text-sm font-semibold">{attachment.filename}</p>
                          <a href={attachment.url} className="text-sm text-slate-600 hover:text-slate-900">Open file</a>
                        </div>
                        <Button type="button" variant="destructive" onClick={async () => {
                            try {
                              await removeAttachment.mutateAsync({ id: attachment.id, recordId: id as string });
                              toast.success('Attachment removed');
                            } catch (error: any) {
                              toast.error(error?.message || 'Unable to remove attachment');
                            }
                          }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="followup">
              <div className="space-y-4">
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  Follow-up notes and next review dates can be tracked here once the record is synced with your clinic schedule.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <Paperclip className="w-4 h-4" />
            <span>{attachments.length} attachments</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Pill className="w-4 h-4" />
            <span>{prescriptions.length} prescriptions</span>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Summary</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{data.soap.assessment}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Care plan</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{data.soap.plan}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Action</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Use the tabs above to manage prescriptions and attachments for this record.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
