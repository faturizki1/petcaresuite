import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Skeleton } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { useArticles } from '../../website.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/lib/utils';
import { FileText } from 'lucide-react';

const PAGE_SIZE = 12;

export default function ArticlesPagePublic() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useArticles({ page, pageSize: PAGE_SIZE });

  useDocumentTitle('Articles');

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <Skeleton className="h-10 w-48 mx-auto mb-8" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <EmptyState
          icon={FileText}
          title="No articles yet"
          description="Check back soon for new articles."
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Articles</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {items.map((a: any) => (
          <Card key={a.id} className="overflow-hidden flex flex-col">
            {a.cover_url ? (
              <img src={a.cover_url} alt={a.title} className="h-48 w-full object-cover" />
            ) : (
              <div className="h-48 w-full bg-slate-200 flex items-center justify-center text-slate-400">
                No Image
              </div>
            )}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="mt-1 text-sm text-slate-600 line-clamp-3 flex-1">
                {a.excerpt?.length > 100 ? `${a.excerpt.slice(0, 100)}...` : a.excerpt}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">{formatDate(a.published_at, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <Link to={`/articles/${a.slug}`} className="text-sm font-medium text-blue-600 hover:underline">
                  Read More →
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}