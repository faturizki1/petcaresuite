import { useMemo } from 'react';
import { Home, ShoppingCart, Wallet, Settings, Users, Stethoscope, PawPrint, Box, CalendarDays, FileText, ShieldCheck, HeartPulse, ChevronLeft, ChevronRight, Scissors, Package, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useModuleStore } from '@/stores/module.store';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
  section: 'main' | 'clinical' | 'operations' | 'finance' | 'system';
  moduleKey?: string;
  roles: Array<'owner' | 'doctor' | 'staff' | 'customer'>;
}

const items: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Home, section: 'main', roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { label: 'Appointments', path: '/staff/appointments', icon: CalendarDays, section: 'clinical', roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { label: 'Medical', path: '/doctor/medical-records', icon: Stethoscope, section: 'clinical', roles: ['owner', 'doctor'], moduleKey: 'clinic' },
  { label: 'Vaccinations', path: '/staff/vaccinations', icon: ShieldCheck, section: 'clinical', roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { label: 'Monitoring', path: '/staff/monitoring', icon: HeartPulse, section: 'clinical', roles: ['owner', 'doctor', 'staff'], moduleKey: 'monitoring' },
  { label: 'Customers', path: '/staff/customers', icon: Users, section: 'operations', roles: ['owner', 'staff'], moduleKey: 'clinic' },
  { label: 'Pets', path: '/staff/pets', icon: PawPrint, section: 'operations', roles: ['owner', 'staff', 'customer'], moduleKey: 'clinic' },
  { label: 'Inpatient', path: '/staff/inpatient', icon: HeartPulse, section: 'operations', roles: ['owner', 'staff'], moduleKey: 'inpatient' },
  { label: 'Grooming', path: '/staff/grooming', icon: Scissors, section: 'operations', roles: ['owner', 'staff'], moduleKey: 'grooming' },
  { label: 'Petshop', path: '/staff/petshop', icon: Package, section: 'operations', roles: ['owner', 'staff'], moduleKey: 'petshop' },
  { label: 'Inventory', path: '/staff/inventory', icon: Box, section: 'operations', roles: ['owner', 'staff'], moduleKey: 'inventory' },
  { label: 'POS', path: '/staff/pos', icon: ShoppingCart, section: 'finance', roles: ['owner', 'staff'], moduleKey: 'accounting' },
  { label: 'Billing', path: '/staff/invoices', icon: Wallet, section: 'finance', roles: ['owner', 'staff'], moduleKey: 'accounting' },
  { label: 'Accounting', path: '/staff/accounting', icon: DollarSign, section: 'finance', roles: ['owner', 'staff'], moduleKey: 'accounting' },
  { label: 'Reports', path: '/dashboard/reports', icon: FileText, section: 'system', roles: ['owner'] },
  { label: 'Settings', path: '/dashboard/settings', icon: Settings, section: 'system', roles: ['owner'] }
];

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ activePath, onNavigate, isMobileOpen = false, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const role = useAuthStore((state) => state.role);
  const modules = useModuleStore((state) => state.modules);
  const collapseSidebar = useUIStore((state) => state.toggleSidebar);

  const sections = useMemo(() => {
    const grouped = items.filter((item) => {
      const enabled = item.moduleKey ? modules[item.moduleKey as keyof typeof modules] : true;
      return enabled && item.roles.includes(role ?? 'customer');
    });

    return grouped.reduce<Record<string, NavItem[]>>((acc, item) => {
      acc[item.section] = acc[item.section] ?? [];
      acc[item.section].push(item);
      return acc;
    }, {});
  }, [modules, role]);

  const widthClasses = isCollapsed ? 'w-20' : 'w-72';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 overflow-y-auto border-r border-slate-200 bg-slate-50 p-5 shadow-xl transition duration-300 dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 lg:shadow-none',
        widthClasses,
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex items-center justify-between gap-3 pb-5">
        {!isCollapsed && <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Navigation</div>}
        <Button variant="outline" size="sm" onClick={onToggleCollapse ?? collapseSidebar} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <div className="space-y-8">
        {Object.entries(sections).map(([section, sectionItems]) => (
          <div key={section} className="space-y-3">
            {!isCollapsed && <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{section}</h2>}
            <div className="space-y-1">
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      'w-full justify-start gap-3 text-left',
                      isActive ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : '',
                      isCollapsed ? 'justify-center' : ''
                    )}
                    onClick={() => {
                      onNavigate(item.path);
                      onClose?.();
                    }}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
