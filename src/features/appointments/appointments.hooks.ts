import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from './appointments.service';

export function useAppointments(params: any) {
  return useQuery(['appointments', params], () => appointmentsService.getAppointments(params), { keepPreviousData: true });
}

export function useAppointment(id?: string) {
  return useQuery(['appointment', id], () => (id ? appointmentsService.getAppointmentById(id) : null), { enabled: !!id });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation((payload: any) => appointmentsService.createAppointment(payload), {
    onSuccess: () => qc.invalidateQueries(['appointments'])
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation(({ id, status }: any) => appointmentsService.updateAppointmentStatus(id, status), {
    onSuccess: (_data, variables) => {
      qc.invalidateQueries(['appointments']);
      qc.invalidateQueries(['appointment', variables.id]);
      qc.invalidateQueries(['calendarAppointments']);
    }
  });
}

export function useDoctors(search?: string) {
  return useQuery(['appointmentDoctors', search], () => appointmentsService.getDoctors(search), {
    enabled: !!search || search === ''
  });
}

export function useGetDoctorAvailability(doctorId?: string, date?: string) {
  return useQuery(
    ['doctorAvailability', doctorId, date],
    () => (doctorId && date ? appointmentsService.getDoctorAvailability(doctorId, date) : null),
    { enabled: !!doctorId && !!date }
  );
}

export function useCalendarAppointments(from?: string, to?: string) {
  return useQuery(
    ['calendarAppointments', from, to],
    () => (from && to ? appointmentsService.getCalendarAppointments(from, to) : []),
    { enabled: !!from && !!to, keepPreviousData: true }
  );
}
