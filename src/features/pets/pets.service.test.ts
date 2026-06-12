import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }));

describe('petsService', () => {
  let supabaseMock: any;
  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  it('createPet returns created pet', async () => {
    const returned = {
      data: {
        id: 'p1',
        name: 'Buddy',
        customer_id: 'c1',
        species_id: 's1',
        breed_id: 'b1',
        gender: 'male',
        birth_date: null,
        weight: null,
        color: null,
        is_sterilized: false,
        microchip_number: null,
        qr_code: null,
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        species: { name: 'Dog' },
        breeds: { name: 'Labrador' },
        customers: { full_name: 'Charlie Owner' }
      },
      error: null
    };
    const single = vi.fn().mockResolvedValue(returned);
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    supabaseMock.from.mockReturnValue({ insert });

    const { petsService } = await import('./pets.service');
    const res = await petsService.createPet({
      name: 'Buddy',
      customerId: 'c1',
      speciesId: 's1',
      breedId: 'b1',
      gender: 'male'
    });

    expect(insert).toHaveBeenCalled();
    expect(res.name).toBe('Buddy');
    expect(res.species).toBe('Dog');
    expect(res.breed).toBe('Labrador');
    expect(res.customerName).toBe('Charlie Owner');
  });

  it('getPetById returns pet', async () => {
    const returned = {
      data: {
        id: 'p1',
        name: 'Buddy',
        customer_id: 'c1',
        species_id: 's1',
        breed_id: 'b1',
        gender: 'male',
        birth_date: '2023-03-01',
        weight: 14.2,
        color: 'Golden',
        is_sterilized: true,
        microchip_number: '123-456-789',
        qr_code: 'qr_abc',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        species: { name: 'Dog' },
        breeds: { name: 'Labrador' },
        customers: { full_name: 'Charlie Owner' }
      },
      error: null
    };
    const single = vi.fn().mockResolvedValue(returned);
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    supabaseMock.from.mockReturnValue({ select });

    const { petsService } = await import('./pets.service');
    const res = await petsService.getPetById('p1');
    expect(res?.name).toBe('Buddy');
    expect(res?.species).toBe('Dog');
    expect(res?.breed).toBe('Labrador');
    expect(res?.customerName).toBe('Charlie Owner');
    expect(res?.birthDate).toBe('2023-03-01');
    expect(res?.weight).toBe(14.2);
  });
});
