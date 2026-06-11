import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { websiteService } from './website.service';

export function useWebsiteContent() {
  return useQuery(['websiteContent'], () => websiteService.getWebsiteContent());
}

export function useUpdateWebsiteContent() {
  const qc = useQueryClient();
  return useMutation(({ sectionKey, content }: any) => websiteService.updateWebsiteContent(sectionKey, content), { onSuccess: () => qc.invalidateQueries(['websiteContent']) });
}

export function useArticles(params?: any) {
  return useQuery(['articles', params], () => websiteService.getArticles(params));
}

export function useArticleBySlug(slug?: string) {
  return useQuery(['article', slug], () => (slug ? websiteService.getArticleBySlug(slug) : Promise.resolve(null)));
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation((payload: any) => websiteService.createArticle(payload), { onSuccess: () => qc.invalidateQueries(['articles']) });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation(({ id, updates }: any) => websiteService.updateArticle(id, updates), { onSuccess: () => qc.invalidateQueries(['articles']) });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation((id: string) => websiteService.deleteArticle(id), { onSuccess: () => qc.invalidateQueries(['articles']) });
}

export function useTestimonials() {
  return useQuery(['testimonials'], () => websiteService.getTestimonials());
}

export function useManageTestimonial() {
  const qc = useQueryClient();
  return useMutation((payload: any) => websiteService.manageTestimonial(payload), { onSuccess: () => qc.invalidateQueries(['testimonials']) });
}

export default {};
