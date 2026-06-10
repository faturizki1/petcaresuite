import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from '@/components/common/CommandPalette';
import { useUIStore } from '@/stores/ui.store';
import { useModuleStore } from '@/stores/module.store';

const routes = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Appointments', path: '/staff/appointments' },
  { label: 'Customers', path: '/staff/customers' },
  { label: 'Pets', path: '/staff/pets' },
  { label: 'Vaccinations', path: '/staff/vaccinations' },
  { label: 'Monitoring', path: '/staff/monitoring' },
  { label: 'Inventory', path: '/staff/inventory' },
  { label: 'POS', path: '/staff/pos' },
  { label: 'Billing', path: '/staff/invoices' },
  { label: 'Medical Records', path: '/doctor/medical-records' }
];

const breadcrumbLabelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  staff: 'Staff',
  doctor: 'Doctor',
  customers: 'Customers',
  pets: 'Pets',
  appointments: 'Appointments',
  monitoring: 'Monitoring',
  vaccinations: 'Vaccinations',
  inventory: 'Inventory',
  invoices: 'Invoices',
  'medical-records': 'Medical Records',
  profile: 'Profile'
};

export function AppShell({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);
  const isPaletteOpen = useUIStore((state) => state.isCommandPaletteOpen);
  const activeTheme = useUIStore((state) => state.activeTheme);
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const fetchModuleStatus = useModuleStore((state) => state.fetchModuleStatus);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const path = location.pathname;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', activeTheme === 'dark');
  }, [activeTheme]);

  useEffect(() => {
    fetchModuleStatus();
  }, [fetchModuleStatus]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [path]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  const breadcrumbSegments = path
    .split('/')
    .filter(Boolean)
    .map((segment, index, segments) => ({
      label: breadcrumbLabelMap[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      path: `/${segments.slice(0, index + 1).join('/')}`
    }));

  return (
    <div className={activeTheme === 'dark' ? 'min-h-screen bg-slate-950 text-slate-100' : 'min-h-screen bg-slate-50 text-slate-950'}>
      <div className="lg:flex">
        <Sidebar
          activePath={path}
          onNavigate={(route) => {
            navigate(route);
            setIsMobileSidebarOpen(false);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <div className="flex-1 lg:min-w-0 lg:ml-0">
          <Navbar
            onOpenCommand={() => setCommandPaletteOpen(true)}
            onToggleSidebar={() => setIsMobileSidebarOpen((open) => !open)}
            unreadCount={3}
          />
          <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 lg:px-6">
            <nav className="flex flex-wrap items-center gap-2">
              {breadcrumbSegments.length ? (
                breadcrumbSegments.map((segment, index) => (
                  <span key={segment.path} className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(segment.path)}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    >
                      {segment.label}
                    </button>
                    {index < breadcrumbSegments.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
                  </span>
                ))
              ) : (
                <span>Dashboard</span>
              )}
            </nav>
          </div>
          <main className={`px-4 py-5 sm:px-6 lg:px-8 ${isSidebarCollapsed ? 'lg:pl-24' : ''}`}>
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
      {isMobileSidebarOpen && <div className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />}
      <CommandPalette open={isPaletteOpen} onClose={() => setCommandPaletteOpen(false)} routes={routes} />
    </div>
  );
}
