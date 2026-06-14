import { useMemo } from 'react';
import { Card, Skeleton } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { useAllActiveServices } from '../../website.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatCurrency } from '@/lib/utils';
import { Stethoscope } from 'lucide-react';

export default function ServicesPagePublic() {
  const { data = [], isLoading } = useAllActiveServices();

  useDocumentTitle('Our Services');

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    data.forEach((svc: any) => {
      const cat = svc.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(svc);
    });
    return map;
  }, [data]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-8">
        <Skeleton className="h-10 w-48 mx-auto" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <EmptyState
          icon={Stethoscope}
          title="No services available"
          description="Service listings will appear here once configured."
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Our Services</h1>

      {Object.entries(grouped).map(([category, services]) => (
        <section key={category} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((svc: any) => (
              <Card key={svc.id} className="p-6">
                <h3 className="text-lg font-semibold">{svc.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{svc.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900">{formatCurrency(svc.price)}</span>
                  <span className="text-slate-500">{svc.duration_minutes} min</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}