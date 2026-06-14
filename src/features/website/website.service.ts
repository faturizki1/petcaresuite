import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type { WebsiteContent, Article, Testimonial } from './website.types';

export const websiteService = {
  async getWebsiteContent(): Promise<WebsiteContent[]> {
    const { data, error } = await supabase.from('website_content').select('*').order('updated_at', { ascending: false });
    if (error) handleSupabaseError(error);
    return (data || []) as WebsiteContent[];
  },

  async updateWebsiteContent(sectionKey: string, content: any) {
    const { data, error } = await supabase.from('website_content').upsert({ section_key: sectionKey, content }).select().single();
    if (error) handleSupabaseError(error);
    return data as WebsiteContent;
  },

  async getArticles({ page = 1, pageSize = 12 }: any = {}): Promise<{ items: Article[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const { data, count, error } = await supabase.from('articles').select('*', { count: 'exact' }).order('published_at', { ascending: false }).range(offset, offset + pageSize - 1);
    if (error) handleSupabaseError(error);
    return { items: (data || []) as Article[], total: typeof count === 'number' ? count : (data || []).length };
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).eq('is_published', true).single();
    if (error) handleSupabaseError(error);
    return data || null;
  },

  async createArticle(payload: Partial<Article>) {
    const { data, error } = await supabase.from('articles').insert({
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      excerpt: payload.excerpt || null,
      cover_url: payload.coverUrl || null,
      author_id: payload.authorId || null,
      is_published: payload.isPublished || false,
      published_at: payload.publishedAt || null
    }).select().single();
    if (error) handleSupabaseError(error);
    return data as Article;
  },

  async updateArticle(id: string, updates: Partial<Article>) {
    const transformed: any = {
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.slug !== undefined ? { slug: updates.slug } : {}),
      ...(updates.content !== undefined ? { content: updates.content } : {}),
      ...(updates.excerpt !== undefined ? { excerpt: updates.excerpt } : {}),
      ...(updates.coverUrl !== undefined ? { cover_url: updates.coverUrl } : {}),
      ...(updates.isPublished !== undefined ? { is_published: updates.isPublished } : {}),
      ...(updates.publishedAt !== undefined ? { published_at: updates.publishedAt } : {})
    };
    const { data, error } = await supabase.from('articles').update(transformed).eq('id', id).select().single();
    if (error) handleSupabaseError(error);
    return data as Article;
  },

  async deleteArticle(id: string) {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) handleSupabaseError(error);
    return true;
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (error) handleSupabaseError(error);
    return (data || []) as Testimonial[];
  },

  async manageTestimonial(payload: Partial<Testimonial>) {
    if (payload.id) {
      const { data, error } = await supabase.from('testimonials').update({
        customer_name: payload.customerName,
        content: payload.content,
        rating: payload.rating,
        photo_url: payload.photoUrl,
        is_active: payload.isActive
      }).eq('id', payload.id).select().single();
      if (error) handleSupabaseError(error);
      return data as Testimonial;
    }
    const { data, error } = await supabase.from('testimonials').insert({
      customer_name: payload.customerName,
      content: payload.content,
      rating: payload.rating || 5,
      photo_url: payload.photoUrl || null,
      is_active: payload.isActive !== undefined ? payload.isActive : true
    }).select().single();
    if (error) handleSupabaseError(error);
    return data as Testimonial;
  },

  async getActiveServices() {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, price, duration_minutes, category')
      .eq('is_active', true)
      .limit(6);
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getActiveDoctors() {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, specialization, bio, photo_url, profiles(full_name)')
      .eq('is_active', true);
    if (error) handleSupabaseError(error);
    return (data || []).map((doc: any) => ({
      id: doc.id,
      full_name: doc.profiles?.full_name || '',
      specialization: doc.specialization,
      bio: doc.bio,
      photo_url: doc.photo_url
    }));
  },

  async getActiveTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, customer_name, content, rating')
      .eq('is_active', true)
      .limit(6);
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getLatestArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, cover_url, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3);
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getAllActiveServices() {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, price, duration_minutes, category')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (error) handleSupabaseError(error);
    return data || [];
  }
};

export default websiteService;