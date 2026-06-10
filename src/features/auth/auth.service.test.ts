import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';

// create mock inside factory and import it during tests to avoid hoisting issues
vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from } };
});

let supabaseMock: any;

describe('authService', () => {
  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  it('createProfile returns created profile on success', async () => {
    const returned = { data: { user_id: 'u1', email: 'a@b.com', full_name: 'Alice', role: 'staff', is_active: true }, error: null };

    const single = vi.fn().mockResolvedValue(returned);
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    supabaseMock.from.mockReturnValue({ insert });

    const res = await authService.createProfile('u1', 'a@b.com', 'Alice', 'staff');

    expect(supabaseMock.from).toHaveBeenCalledWith('profiles');
    expect(insert).toHaveBeenCalled();
    expect(res.id).toBe('u1');
    expect(res.email).toBe('a@b.com');
    expect(res.fullName).toBe('Alice');
    expect(res.role).toBe('staff');
    expect(res.isActive).toBe(true);
  });

  it('updateProfile updates and returns profile', async () => {
    const returned = { data: { user_id: 'u1', email: 'a@b.com', full_name: 'Bob', role: 'owner', is_active: false }, error: null };

    const single = vi.fn().mockResolvedValue(returned);
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    supabaseMock.from.mockReturnValue({ update });

    const res = await authService.updateProfile('u1', { fullName: 'Bob', role: 'owner', isActive: false });

    expect(supabaseMock.from).toHaveBeenCalledWith('profiles');
    expect(update).toHaveBeenCalled();
    expect(res.fullName).toBe('Bob');
    expect(res.role).toBe('owner');
    expect(res.isActive).toBe(false);
  });

  it('fetchProfile returns data when present', async () => {
    const returned = { data: { full_name: 'Carol', role: 'customer', is_active: true }, error: null };
    const single = vi.fn().mockResolvedValue(returned);
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    supabaseMock.from.mockReturnValue({ select });

    const res = await authService.fetchProfile('u2', 'c@d.com');

    expect(supabaseMock.from).toHaveBeenCalledWith('profiles');
    expect(res.id).toBe('u2');
    expect(res.email).toBe('c@d.com');
    expect(res.fullName).toBe('Carol');
    expect(res.role).toBe('customer');
    expect(res.isActive).toBe(true);
  });
});
