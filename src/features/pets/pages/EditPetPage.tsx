import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePet, useUpdatePet, useSpecies, useBreeds } from '../pets.hooks';
import { useCustomers } from '@/features/customers/customers.hooks';
import { Button, Input } from '@/components/ui';

export default function EditPetPage() {
  const { id } = useParams();
  const { data, isLoading } = usePet(id);
  const customersQuery = useCustomers({ page: 1, pageSize: 50 });
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [speciesId, setSpeciesId] = useState('');
  const [breedId, setBreedId] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [color, setColor] = useState('');
  const [isSterilized, setIsSterilized] = useState(false);
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mutation = useUpdatePet();
  const speciesQuery = useSpecies();
  const breedsQuery = useBreeds(speciesId);

  useEffect(() => {
    if (data) {
      setName(data.name || '');
      setCustomerId(data.customerId);
      setSpeciesId(data.speciesId);
      setBreedId(data.breedId);
      setGender(data.gender ?? 'unknown');
      setBirthDate(data.birthDate ?? '');
      setWeight(data.weight ?? undefined);
      setColor(data.color ?? '');
      setIsSterilized(data.isSterilized ?? false);
      setMicrochipNumber(data.microchipNumber ?? '');
      setIsActive(data.isActive ?? true);
    }
  }, [data]);

  useEffect(() => {
    setBreedId((current) => (speciesId && breedsQuery.data?.find((breed) => breed.id === current) ? current : ''));
  }, [speciesId, breedsQuery.data]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Not found</div>;

  const customers = customersQuery.data?.items ?? [];
  const speciesOptions = speciesQuery.data ?? [];
  const breedOptions = breedsQuery.data ?? [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !customerId || !speciesId || !breedId) {
      setError('Name, owner, species, and breed are required.');
      return;
    }

    try {
      await mutation.mutateAsync({
        id: id as string,
        updates: {
          name,
          customerId,
          speciesId,
          breedId,
          gender,
          birthDate: birthDate || undefined,
          weight,
          color: color || undefined,
          isSterilized,
          microchipNumber: microchipNumber || undefined,
          isActive
        }
      });
      navigate(`/staff/pets/${id}`);
    } catch (err: any) {
      setError(err?.message || 'Unable to save pet');
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Pet</h1>
          <p className="text-sm text-slate-500">Update pet profile details and medical identifiers.</p>
        </div>
      </div>

      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm max-w-3xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Pet name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Owner</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Species</label>
            <select
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select species</option>
              {speciesOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Breed</label>
            <select
              value={breedId}
              onChange={(e) => setBreedId(e.target.value)}
              disabled={!speciesId}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select breed</option>
              {breedOptions.map((breed) => (
                <option key={breed.id} value={breed.id}>
                  {breed.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Birth date</label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Weight (kg)</label>
            <Input
              type="number"
              value={weight ?? ''}
              onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="5.4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Color</label>
            <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Brown" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={isSterilized} onChange={(e) => setIsSterilized(e.target.checked)} />
              Sterilized
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Microchip number</label>
            <Input value={microchipNumber} onChange={(e) => setMicrochipNumber(e.target.value)} placeholder="123-456-789" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active profile
          </label>
          <Button type="submit">Save Changes</Button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
