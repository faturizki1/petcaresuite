import React, { lazy, Suspense } from 'react';
import PageSkeleton from '@/components/common/PageSkeleton';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import type { ReactNode } from 'react';
import type { ModuleKey, UserRole } from '@/types';
import { ModuleGuard } from '@/features/auth/ModuleGuard';
import { RoleGuard } from '@/features/auth/RoleGuard';
import RoleBasedRedirect from '@/features/auth/RoleBasedRedirect';
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));

const AppointmentsPage = lazy(() => import('@/features/appointments/pages/AppointmentsPage'));
const AppointmentCalendarPage = lazy(() => import('@/features/appointments/pages/AppointmentCalendarPage'));
const CreateAppointmentPage = lazy(() => import('@/features/appointments/pages/CreateAppointmentPage'));
const AppointmentDetailPage = lazy(() => import('@/features/appointments/pages/AppointmentDetailPage'));
const CustomerDetailPage = lazy(() => import('@/features/customers/pages/CustomerDetailPage'));
const CreateCustomerPage = lazy(() => import('@/features/customers/pages/CreateCustomerPage'));
const CustomersPage = lazy(() => import('@/features/customers/pages/CustomersPage'));
const ClinicProfilePage = lazy(() => import('@/features/settings/pages/ClinicProfilePage'));
const InvoiceSettingsPage = lazy(() => import('@/features/settings/pages/InvoiceSettingsPage'));
const BusinessHoursPage = lazy(() => import('@/features/settings/pages/BusinessHoursPage'));
const AuditLogPage = lazy(() => import('@/features/settings/pages/AuditLogPage'));
const WhatsAppSettingsPage = lazy(() => import('@/features/settings/pages/WhatsAppSettingsPage'));
const EmailSettingsPage = lazy(() => import('@/features/settings/pages/EmailSettingsPage'));
const ModuleManagerPage = lazy(() => import('@/features/settings/pages/ModuleManagerPage'));

const DoctorReportsPage = lazy(() => import('@/features/reports/pages/DoctorReportsPage'));
const ClinicalReportsPage = lazy(() => import('@/features/reports/pages/ClinicalReportsPage'));
const FinancialReportsPage = lazy(() => import('@/features/reports/pages/FinancialReportsPage'));
const InventoryReportsPage = lazy(() => import('@/features/reports/pages/InventoryReportsPage'));
const ProductReportsPage = lazy(() => import('@/features/reports/pages/ProductReportsPage'));

const NotificationLogPage = lazy(() => import('@/features/notifications/pages/NotificationLogPage'));
const TemplatesPage = lazy(() => import('@/features/notifications/pages/TemplatesPage'));
const BroadcastPage = lazy(() => import('@/features/notifications/pages/BroadcastPage'));

const InpatientPage = lazy(() => import('@/features/inpatient/pages/InpatientPage'));
const InpatientDetailPage = lazy(() => import('@/features/inpatient/pages/InpatientDetailPage'));
const AccountingPage = lazy(() => import('@/features/accounting/pages/AccountingPage'));
const PetshopPage = lazy(() => import('@/features/petshop/pages/PetshopPage'));
const ProductFormPage = lazy(() => import('@/features/petshop/pages/ProductFormPage'));
const ProductDetailPage = lazy(() => import('@/features/petshop/pages/ProductDetailPage'));
const PosPage = lazy(() => import('@/features/pos/pages/PosPage'));
const TransactionsPage = lazy(() => import('@/features/pos/pages/TransactionsPage'));
const InvoiceDetailPage = lazy(() => import('@/features/pos/pages/InvoiceDetailPage'));
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage })));
const InventoryPage = lazy(() => import('@/features/inventory/pages/InventoryPage'));
const VaccinationsPage = lazy(() => import('@/features/vaccinations/pages/VaccinationsPage'));
const CreateVaccinationPage = lazy(() => import('@/features/vaccinations/pages/CreateVaccinationPage'));
const VaccinationDetailPage = lazy(() => import('@/features/vaccinations/pages/VaccinationDetailPage'));
const MonitoringPage = lazy(() => import('@/features/monitoring/pages/MonitoringPage'));
const CreateMonitoringPage = lazy(() => import('@/features/monitoring/pages/CreateMonitoringPage'));
const MonitoringDetailPage = lazy(() => import('@/features/monitoring/pages/MonitoringDetailPage'));
const MedicalRecordsPage = lazy(() => import('@/features/medical-records/pages/MedicalRecordsPage'));
const CreateMedicalRecordPage = lazy(() => import('@/features/medical-records/pages/CreateMedicalRecordPage'));
const MedicalRecordDetailPage = lazy(() => import('@/features/medical-records/pages/MedicalRecordDetailPage'));
const PetsPage = lazy(() => import('@/features/pets/pages/PetsPage'));
const CreatePetPage = lazy(() => import('@/features/pets/pages/CreatePetPage'));
const PetProfilePage = lazy(() => import('@/features/pets/pages/PetProfilePage'));
const EditPetPage = lazy(() => import('@/features/pets/pages/EditPetPage'));
const EditCustomerPage = lazy(() => import('@/features/customers/pages/EditCustomerPage'));
const GroomingPage = lazy(() => import('@/features/grooming/pages/GroomingPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const HomePagePublic = lazy(() => import('@/features/website/pages/Public/HomePage'));
const ArticlesPagePublic = lazy(() => import('@/features/website/pages/Public/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('@/features/website/pages/Public/ArticleDetailPage'));
const ServicesPagePublic = lazy(() => import('@/features/website/pages/Public/ServicesPage'));
const ContactPagePublic = lazy(() => import('@/features/website/pages/Public/ContactPage'));
import {
  Home,
  Users,
  PawPrint,
  CalendarDays,
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  Box,
  Scissors,
  Package,
  ShoppingCart,
  Wallet,
  DollarSign,
  FileText,
  Settings
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavSection = 'main' | 'clinical' | 'operations' | 'finance' | 'system';

export const routeMeta: Record<string, { label: string; icon: LucideIcon; section: NavSection }> = {
  'dashboard': { label: 'Dashboard', icon: Home, section: 'main' },
  'staff/appointments': { label: 'Appointments', icon: CalendarDays, section: 'clinical' },
  'doctor/medical-records': { label: 'Medical Records', icon: Stethoscope, section: 'clinical' },
  'staff/vaccinations': { label: 'Vaccinations', icon: ShieldCheck, section: 'clinical' },
  'staff/monitoring': { label: 'Monitoring', icon: HeartPulse, section: 'clinical' },
  'staff/customers': { label: 'Customers', icon: Users, section: 'operations' },
  'staff/pets': { label: 'Pets', icon: PawPrint, section: 'operations' },
  'staff/inpatient': { label: 'Inpatient', icon: HeartPulse, section: 'operations' },
  'staff/grooming': { label: 'Grooming', icon: Scissors, section: 'operations' },
  'staff/petshop': { label: 'Petshop', icon: Package, section: 'operations' },
  'staff/inventory': { label: 'Inventory', icon: Box, section: 'operations' },
  'staff/pos': { label: 'POS', icon: ShoppingCart, section: 'finance' },
  'staff/invoices': { label: 'Invoices', icon: Wallet, section: 'finance' },
  'staff/accounting': { label: 'Accounting', icon: DollarSign, section: 'finance' },
  'staff/reports/financial': { label: 'Reports', icon: FileText, section: 'system' },
  'staff/settings/clinic': { label: 'Clinic Settings', icon: Settings, section: 'system' },
  'staff/settings/invoice': { label: 'Invoice Settings', icon: FileText, section: 'system' },
  'staff/settings/hours': { label: 'Business Hours', icon: CalendarDays, section: 'system' },
  'staff/settings/whatsapp': { label: 'WhatsApp', icon: ShieldCheck, section: 'system' },
  'staff/settings/email': { label: 'Email', icon: Wallet, section: 'system' },
  'staff/settings/modules': { label: 'Modules', icon: Box, section: 'system' },
  'profile': { label: 'Profile', icon: Users, section: 'main' }
};

// Visual metadata for public routes
routeMeta['home'] = { label: 'Home', icon: Home, section: 'main' };
routeMeta['articles'] = { label: 'Articles', icon: FileText, section: 'main' };
routeMeta['articles/:slug'] = { label: 'Article', icon: FileText, section: 'main' };
routeMeta['services'] = { label: 'Services', icon: Stethoscope, section: 'main' };
routeMeta['contact'] = { label: 'Contact', icon: Users, section: 'main' };

export const publicRoutes: { path: string; element: ReactNode }[] = [
  { path: '/', element: <HomePagePublic /> },
  { path: '/articles', element: <ArticlesPagePublic /> },
  { path: '/articles/:slug', element: <ArticleDetailPage /> },
  { path: '/services', element: <ServicesPagePublic /> },
  { path: '/contact', element: <ContactPagePublic /> }
];

export interface ProtectedRouteDefinition {
  path: string;
  element: ReactNode;
  roles?: UserRole[];
  moduleKey?: ModuleKey;
}

export const protectedRoutes: ProtectedRouteDefinition[] = [
  { path: '/', element: <RoleBasedRedirect /> },
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'staff/customers', element: <CustomersPage />, roles: ['owner', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/customers/create', element: <CreateCustomerPage />, roles: ['owner', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/customers/:id', element: <CustomerDetailPage />, roles: ['owner', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/customers/:id/edit', element: <EditCustomerPage />, roles: ['owner', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/pets', element: <PetsPage />, roles: ['owner', 'staff', 'customer'], moduleKey: 'clinic' },
  { path: 'staff/pets/create', element: <CreatePetPage />, roles: ['owner', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/pets/:id', element: <PetProfilePage />, roles: ['owner', 'staff', 'customer'], moduleKey: 'clinic' },
  { path: 'staff/pets/:id/edit', element: <EditPetPage />, roles: ['owner', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/appointments', element: <AppointmentsPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/appointments/create', element: <CreateAppointmentPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/appointments/calendar', element: <AppointmentCalendarPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/appointments/:id', element: <AppointmentDetailPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/inventory', element: <InventoryPage />, roles: ['owner', 'staff'], moduleKey: 'inventory' },
  { path: 'staff/pos', element: <PosPage />, roles: ['owner', 'staff'], moduleKey: 'accounting' },
  { path: 'staff/pos/transactions', element: <TransactionsPage />, roles: ['owner', 'staff'], moduleKey: 'accounting' },
  { path: 'staff/pos/transactions/:id', element: <InvoiceDetailPage />, roles: ['owner', 'staff'], moduleKey: 'accounting' },
  { path: 'staff/invoices', element: <InvoicesPage />, roles: ['owner', 'staff'], moduleKey: 'accounting' },
  { path: 'staff/petshop', element: <PetshopPage />, roles: ['owner', 'staff'], moduleKey: 'petshop' },
  { path: 'staff/petshop/create', element: <ProductFormPage />, roles: ['owner', 'staff'], moduleKey: 'petshop' },
  { path: 'staff/petshop/:id', element: <ProductDetailPage />, roles: ['owner', 'staff'], moduleKey: 'petshop' },
  { path: 'staff/petshop/:id/edit', element: <ProductFormPage />, roles: ['owner', 'staff'], moduleKey: 'petshop' },
  { path: 'staff/grooming', element: <GroomingPage />, roles: ['owner', 'staff'], moduleKey: 'grooming' },
  { path: 'staff/inpatient', element: <InpatientPage />, roles: ['owner', 'staff'], moduleKey: 'inpatient' },
  { path: 'staff/inpatient/:id', element: <InpatientDetailPage />, roles: ['owner', 'staff', 'doctor'], moduleKey: 'inpatient' },
  { path: 'staff/accounting', element: <AccountingPage />, roles: ['owner', 'staff'], moduleKey: 'accounting' },
  { path: 'staff/notifications', element: <NotificationLogPage />, roles: ['owner', 'staff'] },
  { path: 'staff/notifications/templates', element: <TemplatesPage />, roles: ['owner', 'staff'] },
  { path: 'staff/notifications/broadcast', element: <BroadcastPage />, roles: ['owner', 'staff'] },
  { path: 'staff/reports/financial', element: <FinancialReportsPage />, roles: ['owner'] },
  { path: 'staff/reports/clinical', element: <ClinicalReportsPage />, roles: ['owner'] },
  { path: 'staff/reports/doctors', element: <DoctorReportsPage />, roles: ['owner'] },
  { path: 'staff/reports/inventory', element: <InventoryReportsPage />, roles: ['owner'] },
  { path: 'staff/reports/products', element: <ProductReportsPage />, roles: ['owner'] },
  { path: 'doctor/medical-records', element: <MedicalRecordsPage />, roles: ['owner', 'doctor'], moduleKey: 'clinic' },
  { path: 'doctor/medical-records/create', element: <CreateMedicalRecordPage />, roles: ['owner', 'doctor'], moduleKey: 'clinic' },
  { path: 'doctor/medical-records/:id', element: <MedicalRecordDetailPage />, roles: ['owner', 'doctor'], moduleKey: 'clinic' },
  { path: 'staff/vaccinations', element: <VaccinationsPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/vaccinations/create', element: <CreateVaccinationPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/vaccinations/:id', element: <VaccinationDetailPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'clinic' },
  { path: 'staff/monitoring', element: <MonitoringPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'monitoring' },
  { path: 'staff/monitoring/create', element: <CreateMonitoringPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'monitoring' },
  { path: 'staff/monitoring/:id', element: <MonitoringDetailPage />, roles: ['owner', 'doctor', 'staff'], moduleKey: 'monitoring' },
  { path: 'staff/settings/clinic', element: <ClinicProfilePage />, roles: ['owner'] },
  { path: 'staff/settings/invoice', element: <InvoiceSettingsPage />, roles: ['owner'] },
  { path: 'staff/settings/hours', element: <BusinessHoursPage />, roles: ['owner'] },
  { path: 'staff/settings/audit', element: <AuditLogPage />, roles: ['owner'] },
  { path: 'staff/settings/whatsapp', element: <WhatsAppSettingsPage />, roles: ['owner'] },
  { path: 'staff/settings/email', element: <EmailSettingsPage />, roles: ['owner'] },
  { path: 'staff/settings/modules', element: <ModuleManagerPage />, roles: ['owner'] },
  { path: 'profile', element: <ProfilePage />, roles: ['owner', 'doctor', 'staff', 'customer'] }
];

export function renderProtectedRoute(route: ProtectedRouteDefinition) {
  const suspended = <ErrorBoundary><Suspense fallback={<PageSkeleton />}>{route.element}</Suspense></ErrorBoundary>;
  const element = route.moduleKey ? <ModuleGuard moduleKey={route.moduleKey}>{suspended}</ModuleGuard> : suspended;
  return route.roles ? <RoleGuard allowedRoles={route.roles}>{element}</RoleGuard> : element;
}
