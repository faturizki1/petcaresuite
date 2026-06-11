import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useWebsiteContent } from '../../website.hooks';

export default function HomePage() {
  const { data = [] } = useWebsiteContent();
  const hero = data.find((d: any) => d.section_key === 'hero');
  const services = data.find((d: any) => d.section_key === 'services');

  return (
    <div className="space-y-6">
      <PageHeader title="Home" description="Welcome to our clinic" />
      <section>
        <h2 className="text-2xl font-semibold">Hero</h2>
        <p className="text-slate-600">{hero ? JSON.stringify(hero.content) : 'Configure hero in admin'}</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Services</h2>
        <p className="text-slate-600">{services ? JSON.stringify(services.content) : 'Configure services in admin'}</p>
      </section>
    </div>
  );
}
