import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useGetPets } from '../pets.hooks';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input } from '@/components/ui';

export default function PetsPage() {
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState<'all'|'dog'|'cat'|'bird'|'other'>('all');
  const { data, isLoading } = useGetPets({ page: 1, pageSize: 12, search, species: species === 'all' ? undefined : species });
  const items = data?.items ?? [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Pets"
        description="Track pet profiles, species, age, and owner assignments."
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
          value={species}
          onChange={(e) => setSpecies(e.target.value as any)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
        >
          <option value="all">All species</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="other">Other</option>
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
                  <p className="text-sm text-slate-500">{pet.species} • {pet.breed || 'Unknown'}</p>
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
