import { useState } from 'react';
import { Button, Card, Input, Textarea, Skeleton } from '@/components/ui';
import { useClinicProfile, useBusinessHours } from '@/features/settings/settings.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { CheckCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPagePublic() {
  const clinicQuery = useClinicProfile();
  const hoursQuery = useBusinessHours();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useDocumentTitle('Contact Us');

  const clinic = clinicQuery.data;
  const hours = hoursQuery.data;

  const handleSend = async () => {
    if (!name.trim() || !message.trim()) {
      toast.error('Please fill in your name and message.');
      return;
    }

    setSending(true);
    try {
      const clinicEmail = clinic?.email || '';
      const subject = `Contact Form: ${name}`;
      const text = `Name: ${name}\nEmail: ${email || 'N/A'}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`;

      const { error } = await supabase.functions.invoke('send-email', {
        body: { to: clinicEmail, subject, text }
      });

      if (error) throw error;
      setSent(true);
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Card className="p-12">
          <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-bold">Message sent!</h2>
          <p className="mt-2 text-slate-600">We will get back to you as soon as possible.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Contact Us</h1>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left: Clinic Info */}
        <div className="space-y-6">
          {clinicQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold">{clinic?.name || 'Our Clinic'}</h2>
              <div className="space-y-3 text-slate-600">
                {clinic?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-slate-400" />
                    <span>{clinic.address}</span>
                  </div>
                )}
                {clinic?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <span>{clinic.phone}</span>
                  </div>
                )}
                {clinic?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <span>{clinic.email}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" /> Business Hours
            </h3>
            {hoursQuery.isLoading ? (
              <div className="mt-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-40" />
                ))}
              </div>
            ) : hours ? (
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const d = (hours as any)[day];
                  if (!d || !d.open) return null;
                  return (
                    <div key={day} className="flex justify-between max-w-xs">
                      <span className="capitalize">{day}</span>
                      <span>{d.open} - {d.close}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Contact Form */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Send us a message</h2>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62..." />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Message *</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="How can we help?" required />
          </div>
          <Button onClick={handleSend} disabled={sending} className="w-full">
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </Card>
      </div>
    </div>
  );
}