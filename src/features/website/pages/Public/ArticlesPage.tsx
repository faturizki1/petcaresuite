import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useArticles } from '../../website.hooks';
import { Card } from '@/components/ui';

export default function ArticlesPagePublic() {
  const { data } = useArticles({ page: 1, pageSize: 20 });
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Articles" description="Read our latest articles" />
      <div className="grid gap-4">
        {items.map((a: any) => (
          <Card key={a.id} className="p-4">
            <a href={`/articles/${a.slug}`} className="text-lg font-semibold">{a.title}</a>
            <p className="text-sm text-slate-600">{a.excerpt}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
