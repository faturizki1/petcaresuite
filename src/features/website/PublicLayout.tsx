import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button, Sheet } from '@/components/ui';
import { useClinicProfile } from '@/features/settings/settings.hooks';
import { Menu, X } from 'lucide-react';

export default function PublicLayout() {
  const { data: clinic } = useClinicProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const clinicName = clinic?.name || 'PetCare Suite';
  const clinicAddress = clinic?.address || '';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/articles', label: 'Articles' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-slate-900">
            {clinicName}
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-slate-600 hover:text-slate-900 transition"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm">
              <Link to="/booking">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{clinicName}</span>
            <button type="button" onClick={() => setMobileOpen(false)} className="p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-slate-600 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full mt-4">
              <Link to="/booking" onClick={() => setMobileOpen(false)}>Book Now</Link>
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-500">
          <p className="font-semibold text-slate-700">{clinicName}</p>
          {clinicAddress && <p className="mt-1">{clinicAddress}</p>}
          <p className="mt-3">&copy; {new Date().getFullYear()} {clinicName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}