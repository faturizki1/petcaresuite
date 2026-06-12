import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }));

describe('appointmentsService', () => {
  let supabaseMock: any;
  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  it('createAppointment returns created appointment', async () => {
    const returned = { data: { id: 'a1', customer_id: 'c1', pet_id: 'p1', doctor_id: null, service_id: 's1', services: { name: 'Consult' }, scheduled_at: '2026-06-11T09:00:00.000Z', status: 'scheduled' }, error: null };
    const single = vi.fn().mockResolvedValue(returned);
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    supabaseMock.from.mockReturnValue({ insert });

    const { appointmentsService } = await import('./appointments.service');
    const res = await appointmentsService.createAppointment({
      customerId: 'c1',
      petId: 'p1',
      serviceId: 's1',
      doctorId: undefined,
      appointmentDate: '2026-06-11',
      startTime: '09:00:00',
      endTime: '10:00:00',
      notes: 'Test booking'
    });

    expect(insert).toHaveBeenCalled();
    expect(res.service).toBe('Consult');
  });

  it('generateQueueNumber returns formatted string', async () => {
    const { appointmentsService } = await import('./appointments.service');
    const q = await appointmentsService.generateQueueNumber('2026-06-11T09:00:00.000Z');
    expect(typeof q).toBe('string');
    expect(q).toMatch(/^20260611-\d{3}$/);
  });
});
