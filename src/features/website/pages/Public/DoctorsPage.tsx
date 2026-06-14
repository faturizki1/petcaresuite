import { Card, Badge, Skeleton } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { useActiveDoctors } from '../../website.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { UserRound } from 'lucide-react';

export default function DoctorsPage() {
  const { data = [], isLoading } = useActiveDoctors();

  useDocumentTitle('Our Doctors');

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <Skeleton className="h-10 w-48 mx-auto mb-8" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <EmptyState
          icon={UserRound}
          title="No doctors available"
          description="Doctor profiles will appear here once added."
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Our Doctors</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((doc: any) => (
          <Card key={doc.id} className="p-6 text-center">
            {doc.photo_url ? (
              <img
                src={doc.photo_url}
                alt={doc.full_name}
                className="mx-auto h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                {doc.full_name?.charAt(0)?.toUpperCase() || 'D'}
              </div>
            )}
            <h3 className="mt-4 text-lg font-semibold">{doc.full_name}</h3>
            <Badge variant="secondary" className="mt-2">
              {doc.specialization}
            </Badge>
            {doc.bio && (
              <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                {doc.bio.length > 120 ? `${doc.bio.slice(0, 120)}...` : doc.bio}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}