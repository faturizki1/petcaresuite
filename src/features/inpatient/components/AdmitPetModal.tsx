import { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { inpatientService } from '../inpatient.service';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Textarea, Badge } from '@/components/ui';
import { toast } from 'react-hot-toast';
import type { Cage } from '../inpatient.types';

interface AdmitPetModalProps {
  cage: Cage;
  onSuccess: () => void;
  onClose: () => void;
}

interface PetSearchResult {
  id: string;
  name: string;
}

interface DoctorSearchResult {
  id: string;
  full_name: string;
}

export function AdmitPetModal({ cage, onSuccess, onClose }: AdmitPetModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [petQuery, setPetQuery] = useState('');
  const [petResults, setPetResults] = useState<PetSearchResult[]>([]);
  const [petId, setPetId] = useState('');
  const [petName, setPetName] = useState('');
  const [doctorQuery, setDoctorQuery] = useState('');
  const [doctorResults, setDoctorResults] = useState<DoctorSearchResult[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [admitDate, setAdmitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const debouncedPetQuery = useDebounce(petQuery, 300);
  const debouncedDoctorQuery = useDebounce(doctorQuery, 300);

  useEffect(() => {
    let active = true;
    async function searchPets() {
      if (!debouncedPetQuery) {
        setPetResults([]);
        return;
      }

      const results = await inpatientService.searchPets(debouncedPetQuery);
      if (!active) return;
      setPetResults(results);
    }

    searchPets();
    return () => {
      active = false;
    };
  }, [debouncedPetQuery]);

  useEffect(() => {
    let active = true;
    async function searchDoctors() {
      if (!debouncedDoctorQuery) {
        setDoctorResults([]);
        return;
      }

      const results = await inpatientService.searchDoctors(debouncedDoctorQuery);
      if (!active) return;
      setDoctorResults(results);
    }

    searchDoctors();
    return () => {
      active = false;
    };
  }, [debouncedDoctorQuery]);

  const selectedPet = useMemo(() => petResults.find((pet) => pet.id === petId), [petId, petResults]);
  const selectedDoctor = useMemo(() => doctorResults.find((doc) => doc.id === doctorId), [doctorId, doctorResults]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSubmit = async () => {
    setError('');

    if (!petId) {
      setError('Pet selection is required.');
      return;
    }

    if (!doctorId) {
      setError('Doctor selection is required.');
      return;
    }

    if (!admitDate) {
      setError('Admit date is required.');
      return;
    }

    setIsSaving(true);

    try {
      await inpatientService.admitPet({
        petId,
        cageId: cage.id,
        admittingDoctorId: doctorId,
        admitDate,
        reason,
        notes
      });
      toast.success('Pet admitted');
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error('Unable to admit pet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Admit pet to {cage.name}</DialogTitle>
          <DialogDescription>Assign a patient and admitting doctor before placing them in the cage.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Search pet</label>
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by pet name"
                  value={petQuery}
                  onChange={(event) => setPetQuery(event.target.value)}
                  className="border-0 bg-transparent p-0 text-sm focus:ring-0"
                />
              </div>
              {petResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
                  {petResults.map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-slate-900 hover:bg-slate-50"
                      onClick={() => {
                        setPetId(pet.id);
                        setPetName(pet.name);
                        setPetQuery(pet.name);
                        setPetResults([]);
                      }}
                    >
                      {pet.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Search doctor</label>
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Users className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search doctor"
                  value={doctorQuery}
                  onChange={(event) => setDoctorQuery(event.target.value)}
                  className="border-0 bg-transparent p-0 text-sm focus:ring-0"
                />
              </div>
              {doctorResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
                  {doctorResults.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-slate-900 hover:bg-slate-50"
                      onClick={() => {
                        setDoctorId(doctor.id);
                        setDoctorName(doctor.full_name);
                        setDoctorQuery(doctor.full_name);
                        setDoctorResults([]);
                      }}
                    >
                      {doctor.full_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Admit date</label>
              <Input type="date" value={admitDate} onChange={(event) => setAdmitDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Reason</label>
              <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </div>

          {error ? <Badge variant="outline" className="text-red-600 border-red-200">{error}</Badge> : null}
        </div>

        <DialogFooter>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleClose} type="button">Cancel</Button>
            <Button onClick={handleSubmit} type="button" disabled={isSaving}>{isSaving ? 'Admitting…' : 'Admit pet'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
