import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useGetPets, useSpecies } from '../pets.hooks';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input } from '@/components/ui';

export default function PetsPage() {
  const [search, setSearch] = useState('');
  const [speciesId, setSpeciesId] = useState('all');

  const { data, isLoading } = useGetPets({ page: 1, pageSize: 12, search, speciesId: speciesId === 'all' ? undefined : speciesId });
  const speciesQuery = useSpecies();
  const items = data?.items ?? [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Pets"
        description="Track pet profiles, species, breeds, and active care plans."
        actions={
          <Link to="/staff/pets/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Pet
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pet name"
            className="border-0 px-0 ring-0 focus:ring-0"
          />
        </div>
        <select
          value={speciesId}
          onChange={(e) => setSpeciesId(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
        >
          <option value="all">All species</option>
          {speciesQuery.data?.map((species) => (
            <option key={species.id} value={species.id}>
              {species.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">Loading...</div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600">No pets found.</div>
        ) : (
          items.map((pet: any) => (
            <Link
              key={pet.id}
              to={`/staff/pets/${pet.id}`}
              className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{pet.name}</p>
                  <p className="text-sm text-slate-500">{pet.species || 'Unknown'} • {pet.breed || 'Unknown'}</p>
                </div>
                <span className="text-sm text-slate-400">View</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
