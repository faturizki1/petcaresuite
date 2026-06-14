import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Input, Textarea, Badge, Skeleton } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CalendarCheck, CheckCircle } from 'lucide-react';

const STEPS = ['Contact Info', 'Service', 'Doctor', 'Date & Time', 'Confirm'];

export default function BookingPage() {
  const toast = useToast();
  useDocumentTitle('Book an Appointment');

  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [existingCustomerId, setExistingCustomerId] = useState<string | null>(null);

  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedDoctor, setConfirmedDoctor] = useState('');

  const phoneRegex = /^(\+62|62|0)8[0-9]{8,11}$/;

  const handleContinueFromContact = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!phoneRegex.test(phone.trim())) {
      toast.error('Please enter a valid Indonesian phone number.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    const { data } = await supabase
      .from('customers')
      .select('id')
      .ilike('whatsapp', `%${cleanPhone}%`)
      .limit(1);

    if (data && data.length > 0) {
      setExistingCustomerId(data[0].id);
    }
    setStep(1);
  };

  const loadServices = async () => {
    setServicesLoading(true);
    const { data } = await supabase.from('services').select('id, name, description, price, duration_minutes').eq('is_active', true).order('name');
    setServices(data || []);
    setServicesLoading(false);
  };

  const loadDoctors = async () => {
    setDoctorsLoading(true);
    const { data } = await supabase
      .from('doctors')
      .select('id, specialization, photo_url, profiles(full_name)')
      .eq('is_active', true);
    setDoctors(
      (data || []).map((d: any) => ({
        id: d.id,
        full_name: d.profiles?.full_name || 'Doctor',
        specialization: d.specialization,
        photo_url: d.photo_url
      }))
    );
    setDoctorsLoading(false);
  };

  const loadSlots = async (doctorId: string, date: string, duration: number) => {
    setSlotsLoading(true);
    const dayOfWeek = new Date(date).getDay();
    const { data: schedules } = await supabase
      .from('doctor_schedules')
      .select('start_time, end_time')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    const { data: booked } = await supabase
      .from('appointments')
      .select('start_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled');

    const bookedSet = new Set((booked || []).map((b: any) => b.start_time));
    const availableSlots: any[] = [];

    for (const s of schedules || []) {
      const startMin = parseInt(s.start_time.split(':')[0]) * 60 + parseInt(s.start_time.split(':')[1]);
      const endMin = parseInt(s.end_time.split(':')[0]) * 60 + parseInt(s.end_time.split(':')[1]);
      for (let t = startMin; t + duration <= endMin; t += duration) {
        const h = Math.floor(t / 60).toString().padStart(2, '0');
        const m = (t % 60).toString().padStart(2, '0');
        const startTime = `${h}:${m}:00`;
        if (!bookedSet.has(startTime)) {
          const eh = Math.floor((t + duration) / 60).toString().padStart(2, '0');
          const em = ((t + duration) % 60).toString().padStart(2, '0');
          availableSlots.push({ startTime, endTime: `${eh}:${em}:00` });
        }
      }
    }

    setSlots(availableSlots);
    setSlotsLoading(false);
  };

  const handleGoToStep = (s: number) => {
    if (s === 1) loadServices();
    if (s === 2) loadDoctors();
    setStep(s);
  };

  const handleSelectService = (svc: any) => {
    setSelectedService(svc);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedSlot(null);
    setSlots([]);
    setStep(2);
    loadDoctors();
  };

  const handleSelectDoctor = (doc: any) => {
    setSelectedDoctor(doc);
    setSelectedDate('');
    setSelectedSlot(null);
    setSlots([]);
    setStep(3);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (selectedDoctor && selectedService) {
      loadSlots(selectedDoctor.id, date, selectedService.duration_minutes);
    }
  };

  const handleSelectSlot = (slot: any) => {
    setSelectedSlot(slot);
    setStep(4);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let customerId = existingCustomerId;

      if (!customerId) {
        const { data: newCust, error: custErr } = await supabase
          .from('customers')
          .insert({
            full_name: `${firstName} ${lastName}`,
            whatsapp: phone.trim(),
            email: email.trim() || null,
            status: 'active'
          })
          .select('id')
          .single();
        if (custErr) throw custErr;
        customerId = newCust.id;
      }

      const { error: apptErr } = await supabase.from('appointments').insert({
        customer_id: customerId,
        service_id: selectedService.id,
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        notes: notes.trim() || null,
        status: 'scheduled'
      });

      if (apptErr) throw apptErr;

      setConfirmedDate(selectedDate);
      setConfirmedDoctor(selectedDoctor.full_name);
      setConfirmed(true);
    } catch {
      toast.error('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Card className="p-12">
          <CalendarCheck className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-bold">Booking Confirmed!</h2>
          <p className="mt-2 text-slate-600">
            Your appointment with {confirmedDoctor} on {formatDate(confirmedDate, { year: 'numeric', month: 'long', day: 'numeric' })} has been scheduled.
          </p>
          <p className="mt-1 text-sm text-slate-500">We will contact you to confirm.</p>
          <Button asChild className="mt-6">
            <Link to="/">Back to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Book an Appointment</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                i <= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i <= step ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-slate-200" />}
          </div>
        ))}
      </div>

      {/* Step 0: Contact Info */}
      {step === 0 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium">First Name *</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Last Name *</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Phone (WhatsApp) *</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" />
            <p className="text-xs text-slate-400">Indonesian number: 08xx, +62xx, or 62xx</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Email (optional)</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>
          <Button onClick={handleContinueFromContact} className="w-full">Continue</Button>
        </Card>
      )}

      {/* Step 1: Service */}
      {step === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Select Service</h2>
          {servicesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((svc: any) => (
                <div
                  key={svc.id}
                  onClick={() => handleSelectService(svc)}
                  className={`cursor-pointer rounded-lg border p-4 transition hover:border-blue-400 ${
                    selectedService?.id === svc.id ? 'border-blue-600 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{svc.name}</div>
                      <div className="text-sm text-slate-500">{svc.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(svc.price)}</div>
                      <div className="text-xs text-slate-400">{svc.duration_minutes} min</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Doctor */}
      {step === 2 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Select Doctor</h2>
          {doctorsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doc: any) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoctor(doc)}
                  className={`cursor-pointer rounded-lg border p-4 transition hover:border-blue-400 ${
                    selectedDoctor?.id === doc.id ? 'border-blue-600 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {doc.photo_url ? (
                      <img src={doc.photo_url} alt={doc.full_name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                        {doc.full_name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{doc.full_name}</div>
                      <Badge variant="secondary" className="text-xs">{doc.specialization}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Select Date & Time</h2>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleSelectDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
          {selectedDate && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Available Time Slots</label>
              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot: any) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      onClick={() => handleSelectSlot(slot)}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        selectedSlot?.startTime === slot.startTime
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'hover:border-blue-400'
                      }`}
                    >
                      {slot.startTime.slice(0, 5)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No available slots for this date.</p>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
          </div>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Confirm Booking</h2>
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Name</span>
              <span className="font-medium">{firstName} {lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone</span>
              <span className="font-medium">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Doctor</span>
              <span className="font-medium">{selectedDoctor?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-medium">{selectedSlot?.startTime?.slice(0, 5)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes (optional)</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any special requests..." />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? 'Submitting...' : 'Submit Booking'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}