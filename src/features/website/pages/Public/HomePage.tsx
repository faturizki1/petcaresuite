import { Link } from 'react-router-dom';
import { Button, Card, Skeleton } from '@/components/ui';
import { useActiveServices, useActiveDoctors, useActiveTestimonials, useLatestArticles, useWebsiteContent } from '../../website.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Star } from 'lucide-react';

export default function HomePage() {
  const { data: contentData = [] } = useWebsiteContent();
  const servicesQuery = useActiveServices();
  const doctorsQuery = useActiveDoctors();
  const testimonialsQuery = useActiveTestimonials();
  const articlesQuery = useLatestArticles();

  useDocumentTitle('Home');

  const heroContent = contentData.find((d: any) => d.section_key === 'hero');
  const heroTitle = heroContent?.content?.title || 'Welcome to PetCare Suite';
  const heroSubtitle = heroContent?.content?.subtitle || 'Compassionate care for your beloved pets.';

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {heroTitle}
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          {heroSubtitle}
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/booking">Book Appointment</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/services">Our Services</Link>
          </Button>
        </div>
      </section>

      {/* Services Section */}
      {servicesQuery.data && servicesQuery.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {servicesQuery.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
              : servicesQuery.data.map((svc: any) => (
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
      )}

      {/* Doctors Section */}
      {doctorsQuery.data && doctorsQuery.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Meet Our Doctors</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctorsQuery.isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)
              : doctorsQuery.data.map((doc: any) => (
                  <Card key={doc.id} className="p-6 text-center">
                    {doc.photo_url ? (
                      <img src={doc.photo_url} alt={doc.full_name} className="mx-auto h-24 w-24 rounded-full object-cover" />
                    ) : (
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                        {doc.full_name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                    )}
                    <h3 className="mt-4 font-semibold">{doc.full_name}</h3>
                    <p className="text-sm text-slate-500">{doc.specialization}</p>
                  </Card>
                ))}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonialsQuery.data && testimonialsQuery.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Our Clients Say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonialsQuery.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
              : testimonialsQuery.data.map((t: any) => (
                  <Card key={t.id} className="p-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 italic">&ldquo;{t.content}&rdquo;</p>
                    <p className="mt-3 text-sm font-semibold">— {t.customer_name}</p>
                  </Card>
                ))}
          </div>
        </section>
      )}

      {/* Articles Section */}
      {articlesQuery.data && articlesQuery.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Latest Articles</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {articlesQuery.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
              : articlesQuery.data.map((a: any) => (
                  <Card key={a.id} className="overflow-hidden">
                    {a.cover_url ? (
                      <img src={a.cover_url} alt={a.title} className="h-48 w-full object-cover" />
                    ) : (
                      <div className="h-48 w-full bg-slate-200 flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold">{a.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-3">
                        {a.excerpt?.length > 100 ? `${a.excerpt.slice(0, 100)}...` : a.excerpt}
                      </p>
                      <Link to={`/articles/${a.slug}`} className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
                        Read More →
                      </Link>
                    </div>
                  </Card>
                ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <Card className="bg-slate-900 text-white p-12 text-center">
          <h2 className="text-3xl font-bold">Ready to Visit Us?</h2>
          <p className="mt-3 text-slate-300">Schedule an appointment for your pet today.</p>
          <Button asChild size="lg" className="mt-6 bg-white text-slate-900 hover:bg-slate-100">
            <Link to="/booking">Book Appointment</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}