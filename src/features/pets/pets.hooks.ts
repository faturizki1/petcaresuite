import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsService } from './pets.service';

export function useGetPets(params: any) {
  return useQuery(['pets', params], () => petsService.getPets(params), { keepPreviousData: true });
}

export function usePet(id?: string) {
  return useQuery(['pet', id], () => (id ? petsService.getPetById(id) : null), { enabled: !!id });
}

export function usePetTimeline(id?: string) {
  return useQuery(['petTimeline', id], () => (id ? petsService.getPetTimeline(id) : []), { enabled: !!id });
}

export function useCreatePet() {
  const qc = useQueryClient();
  return useMutation((payload: any) => petsService.createPet(payload), { onSuccess: () => qc.invalidateQueries(['pets']) });
}

export function useUpdatePet() {
  const qc = useQueryClient();
  return useMutation(({ id, updates }: any) => petsService.updatePet(id, updates), { onSuccess: (_d, vars) => qc.invalidateQueries(['pet', vars.id]) });
}
