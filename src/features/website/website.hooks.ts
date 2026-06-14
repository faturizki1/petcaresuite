import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { websiteService } from './website.service';

export function useWebsiteContent() {
  return useQuery({ queryKey: ['websiteContent'], queryFn: () => websiteService.getWebsiteContent() });
}

export function useUpdateWebsiteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionKey, content }: any) => websiteService.updateWebsiteContent(sectionKey, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['websiteContent'] })
  });
}

export function useArticles(params?: any) {
  return useQuery({ queryKey: ['articles', params], queryFn: () => websiteService.getArticles(params) });
}

export function useArticleBySlug(slug?: string) {
  return useQuery({ queryKey: ['article', slug], queryFn: () => (slug ? websiteService.getArticleBySlug(slug) : Promise.resolve(null)), enabled: Boolean(slug) });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: any) => websiteService.createArticle(payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }) });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, updates }: any) => websiteService.updateArticle(id, updates), onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }) });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => websiteService.deleteArticle(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }) });
}

export function useTestimonials() {
  return useQuery({ queryKey: ['testimonials'], queryFn: () => websiteService.getTestimonials() });
}

export function useManageTestimonial() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: any) => websiteService.manageTestimonial(payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['testimonials'] }) });
}

export function useActiveServices() {
  return useQuery({ queryKey: ['activeServices'], queryFn: () => websiteService.getActiveServices() });
}

export function useActiveDoctors() {
  return useQuery({ queryKey: ['activeDoctors'], queryFn: () => websiteService.getActiveDoctors() });
}

export function useActiveTestimonials() {
  return useQuery({ queryKey: ['activeTestimonials'], queryFn: () => websiteService.getActiveTestimonials() });
}

export function useLatestArticles() {
  return useQuery({ queryKey: ['latestArticles'], queryFn: () => websiteService.getLatestArticles() });
}

export function useAllActiveServices() {
  return useQuery({ queryKey: ['allActiveServices'], queryFn: () => websiteService.getAllActiveServices() });
}

export default {};
