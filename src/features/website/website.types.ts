export interface WebsiteContent {
  id: string;
  sectionKey: string;
  content: any;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverUrl?: string;
  authorId?: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  content: string;
  rating: number;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export default {};
