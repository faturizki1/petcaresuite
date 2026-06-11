import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { useArticleBySlug } from '../../website.hooks';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { data } = useArticleBySlug(slug);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={data.title} description={data.excerpt || ''} />
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />
    </div>
  );
}
