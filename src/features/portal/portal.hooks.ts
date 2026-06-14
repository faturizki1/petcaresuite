import { useQuery } from '@tanstack/react-query';
import { portalService } from './portal.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function usePortalCustomerId(profileId?: string) {
  return useQuery(['portalCustomerId', profileId], () => (profileId ? portalService.getCustomerIdByProfileId(profileId) : Promise.resolve(null)), {
    enabled: Boolean(profileId)
  });
}

export function usePortalCustomer(profileId?: string) {
  return useQuery(['portalCustomer', profileId], () => (profileId ? portalService.getCustomerByProfileId(profileId) : Promise.resolve(null)), {
    enabled: Boolean(profileId)
  });
}

export function usePortalPets(customerId?: string) {
  return useQuery(['portalPets', customerId], () => (customerId ? portalService.getPetsForCustomer(customerId) : []), {
    enabled: Boolean(customerId)
  });
}

export function usePortalPet(customerId?: string, petId?: string) {
  return useQuery(
    ['portalPet', customerId, petId],
    () => (customerId && petId ? portalService.getPetForCustomer(customerId, petId) : null),
    {
      enabled: Boolean(customerId && petId)
    }
  );
}

export function usePortalPetById(petId?: string) {
  return useQuery(['portalPetById', petId], () => (petId ? portalService.getMyPetById(petId) : null), {
    enabled: Boolean(petId)
  });
}

export function usePortalPetMedicalRecords(petId?: string) {
  return useQuery(['portalPetMedicalRecords', petId], () => (petId ? portalService.getMyPetMedicalRecords(petId) : []), {
    enabled: Boolean(petId)
  });
}

export function usePortalPetVaccinations(petId?: string) {
  return useQuery(['portalPetVaccinations', petId], () => (petId ? portalService.getMyPetVaccinations(petId) : []), {
    enabled: Boolean(petId)
  });
}

export function usePortalPetWeightHistory(petId?: string) {
  return useQuery(['portalPetWeight', petId], () => (petId ? portalService.getMyPetWeightHistory(petId) : []), {
    enabled: Boolean(petId)
  });
}

export function usePortalPetMedications(petId?: string) {
  return useQuery(['portalPetMedications', petId], () => (petId ? portalService.getMyPetMedications(petId) : []), {
    enabled: Boolean(petId)
  });
}

export function usePortalInpatientRecords(customerId?: string) {
  return useQuery(['portalInpatientRecords', customerId], () => (customerId ? portalService.getMyInpatientRecords() : []), {
    enabled: Boolean(customerId)
  });
}

export function usePortalInpatientObservations(customerId?: string, recordId?: string) {
  return useQuery(['portalInpatientObservations', customerId, recordId], () => (recordId ? portalService.getMyInpatientObservations(recordId) : []), {
    enabled: Boolean(customerId && recordId)
  });
}

export function usePortalGroomingRecords(customerId?: string) {
  return useQuery(['portalGroomingRecords', customerId], () => (customerId ? portalService.getMyGroomingRecords() : []), {
    enabled: Boolean(customerId)
  });
}

export function usePortalNotifications() {
  return useQuery(['portalNotifications'], () => portalService.getMyNotifications());
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation(() => portalService.markAllNotificationsRead(), {
    onSuccess: () => qc.invalidateQueries(['portalNotifications'])
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation((data: { fullName: string; whatsapp: string; address: string }) => portalService.updateMyProfile(data), {
    onSuccess: () => qc.invalidateQueries(['portalCustomer'])
  });
}

export function usePortalAppointments(customerId?: string) {
  return useQuery(['portalAppointments', customerId], () => (customerId ? portalService.getUpcomingAppointments(customerId) : []), {
    enabled: Boolean(customerId)
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation((appointmentId: string) => portalService.cancelAppointment(appointmentId), {
    onSuccess: () => qc.invalidateQueries(['portalAppointments'])
  });
}

export function usePortalInvoices(customerId?: string) {
  return useQuery(['portalInvoices', customerId], () => (customerId ? portalService.getInvoicesForCustomer(customerId) : []), {
    enabled: Boolean(customerId)
  });
}

export function usePortalVaccinationsDue(customerId?: string) {
  return useQuery(['portalVaccinationsDue', customerId], () => (customerId ? portalService.getMyVaccinationsDue(customerId) : []), {
    enabled: Boolean(customerId)
  });
}

export function usePortalTodayMedications(customerId?: string) {
  return useQuery(['portalTodayMedications', customerId], () => (customerId ? portalService.getMyTodayMedications(customerId) : []), {
    enabled: Boolean(customerId)
  });
}

export function useLogMyPetMedication() {
  const qc = useQueryClient();
  return useMutation(({ scheduleId, status, notes }: { scheduleId: string; status: string; notes?: string }) => portalService.logMyPetMedication(scheduleId, status, notes), {
    onSuccess: () => qc.invalidateQueries(['portalTodayMedications'])
  });
}

export function usePortalSummary(customerId?: string) {
  return useQuery(['portalSummary', customerId], () => (customerId ? portalService.getPortalSummary(customerId) : Promise.resolve({ petCount: 0, appointmentCount: 0, invoiceCount: 0 })), {
    enabled: Boolean(customerId)
  });
}
