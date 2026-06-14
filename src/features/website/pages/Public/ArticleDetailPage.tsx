import { useParams, useNavigate, Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui';
import { useArticleBySlug } from '../../website.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { useEffect } from 'react';

function renderContent(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4">');
}

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isLoading, isError } = useArticleBySlug(slug);

  useDocumentTitle(data?.title || 'Article');

  useEffect(() => {
    if (!isLoading && !data && isError) {
      toast.error('Article not found');
      navigate('/articles');
    }
  }, [isLoading, data, isError, navigate, toast]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const htmlContent = renderContent(data.content || '');

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link to="/articles" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Articles
      </Link>

      {data.cover_url && (
        <img src={data.cover_url} alt={data.title} className="w-full h-64 object-cover rounded-xl mb-8" />
      )}

      <h1 className="text-3xl font-bold">{data.title}</h1>

      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
        {data.author && <span>By {data.author}</span>}
        {data.published_at && <span>{formatDate(data.published_at, { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
      </div>

      <div className="mt-8 prose max-w-none">
        <p className="mb-4" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
}