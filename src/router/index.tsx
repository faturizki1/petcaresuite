import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import CustomersPage from '@/features/customers/pages/CustomersPage';
import CreateCustomerPage from '@/features/customers/pages/CreateCustomerPage';
import CustomerDetailPage from '@/features/customers/pages/CustomerDetailPage';
import EditCustomerPage from '@/features/customers/pages/EditCustomerPage';
import PetsPage from '@/features/pets/pages/PetsPage';
import CreatePetPage from '@/features/pets/pages/CreatePetPage';
import PetProfilePage from '@/features/pets/pages/PetProfilePage';
import EditPetPage from '@/features/pets/pages/EditPetPage';
import AppointmentsPage from '@/features/appointments/pages/AppointmentsPage';
import AppointmentCalendarPage from '@/features/appointments/pages/AppointmentCalendarPage';
import CreateAppointmentPage from '@/features/appointments/pages/CreateAppointmentPage';
import AppointmentDetailPage from '@/features/appointments/pages/AppointmentDetailPage';
import MedicalRecordsPage from '@/features/medical-records/pages/MedicalRecordsPage';
import WebsiteContentPage from '@/features/website/pages/WebsiteContentPage';
import ArticlesAdminPage from '@/features/website/pages/ArticlesAdminPage';
import TestimonialsPage from '@/features/website/pages/TestimonialsPage';
import PublicLayout from '@/features/website/PublicLayout';
import HomePagePublic from '@/features/website/pages/Public/HomePage';
import ArticlesPagePublic from '@/features/website/pages/Public/ArticlesPage';
import ArticleDetailPage from '@/features/website/pages/Public/ArticleDetailPage';

import CreateMedicalRecordPage from '@/features/medical-records/pages/CreateMedicalRecordPage';
import MedicalRecordDetailPage from '@/features/medical-records/pages/MedicalRecordDetailPage';
import VaccinationsPage from '@/features/vaccinations/pages/VaccinationsPage';
import CreateVaccinationPage from '@/features/vaccinations/pages/CreateVaccinationPage';
import VaccinationDetailPage from '@/features/vaccinations/pages/VaccinationDetailPage';
import MonitoringPage from '@/features/monitoring/pages/MonitoringPage';
import CreateMonitoringPage from '@/features/monitoring/pages/CreateMonitoringPage';
import MonitoringDetailPage from '@/features/monitoring/pages/MonitoringDetailPage';
import InventoryPage from '@/features/inventory/pages/InventoryPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import PosPage from '@/features/pos/pages/PosPage';
import PetshopPage from '@/features/petshop/pages/PetshopPage';
import GroomingPage from '@/features/grooming/pages/GroomingPage';
import InpatientPage from '@/features/inpatient/pages/InpatientPage';
import AccountingPage from '@/features/accounting/pages/AccountingPage';
import NotificationLogPage from '@/features/notifications/pages/NotificationLogPage';
import TemplatesPage from '@/features/notifications/pages/TemplatesPage';
import BroadcastPage from '@/features/notifications/pages/BroadcastPage';
import FinancialReportsPage from '@/features/reports/pages/FinancialReportsPage';
import ClinicProfilePage from '@/features/settings/pages/ClinicProfilePage';
import InvoiceSettingsPage from '@/features/settings/pages/InvoiceSettingsPage';
import BusinessHoursPage from '@/features/settings/pages/BusinessHoursPage';
import AuditLogPage from '@/features/settings/pages/AuditLogPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { RoleGuard } from '@/features/auth/RoleGuard';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePagePublic />} />
        <Route path="/articles" element={<ArticlesPagePublic />} />
        <Route path="/articles/:slug" element={<ArticleDetailPage />} />
      </Route>

      <Route element={<AuthGuard><AppShell /></AuthGuard>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="staff/customers" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><CustomersPage /></RoleGuard>} />
        <Route path="staff/customers/create" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><CreateCustomerPage /></RoleGuard>} />
        <Route path="staff/customers/:id" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><CustomerDetailPage /></RoleGuard>} />
        <Route path="staff/customers/:id/edit" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><EditCustomerPage /></RoleGuard>} />
        <Route path="staff/pets" element={<RoleGuard allowedRoles={[ 'owner', 'staff', 'customer' ]}><PetsPage /></RoleGuard>} />
        <Route path="staff/pets/create" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><CreatePetPage /></RoleGuard>} />
        <Route path="staff/pets/:id" element={<RoleGuard allowedRoles={[ 'owner', 'staff', 'customer' ]}><PetProfilePage /></RoleGuard>} />
        <Route path="staff/pets/:id/edit" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><EditPetPage /></RoleGuard>} />
        <Route path="staff/appointments" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><AppointmentsPage /></RoleGuard>} />
        <Route path="staff/appointments/create" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><CreateAppointmentPage /></RoleGuard>} />
        <Route path="staff/appointments/calendar" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><AppointmentCalendarPage /></RoleGuard>} />
        <Route path="staff/appointments/:id" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><AppointmentDetailPage /></RoleGuard>} />
        <Route path="staff/inventory" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><InventoryPage /></RoleGuard>} />
        <Route path="staff/pos" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><PosPage /></RoleGuard>} />
        <Route path="staff/invoices" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><InvoicesPage /></RoleGuard>} />
        <Route path="staff/petshop" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><PetshopPage /></RoleGuard>} />
        <Route path="staff/grooming" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><GroomingPage /></RoleGuard>} />
        <Route path="staff/inpatient" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><InpatientPage /></RoleGuard>} />
        <Route path="staff/accounting" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><AccountingPage /></RoleGuard>} />
        <Route path="staff/notifications" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><NotificationLogPage /></RoleGuard>} />
        <Route path="staff/notifications/templates" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><TemplatesPage /></RoleGuard>} />
        <Route path="staff/notifications/broadcast" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><BroadcastPage /></RoleGuard>} />
        <Route path="staff/reports/financial" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><FinancialReportsPage /></RoleGuard>} />
        <Route path="doctor/medical-records" element={<RoleGuard allowedRoles={[ 'owner', 'doctor' ]}><MedicalRecordsPage /></RoleGuard>} />
        <Route path="doctor/medical-records/create" element={<RoleGuard allowedRoles={[ 'owner', 'doctor' ]}><CreateMedicalRecordPage /></RoleGuard>} />
        <Route path="doctor/medical-records/:id" element={<RoleGuard allowedRoles={[ 'owner', 'doctor' ]}><MedicalRecordDetailPage /></RoleGuard>} />
        <Route path="staff/vaccinations" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><VaccinationsPage /></RoleGuard>} />
        <Route path="staff/vaccinations/create" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><CreateVaccinationPage /></RoleGuard>} />
        <Route path="staff/vaccinations/:id" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><VaccinationDetailPage /></RoleGuard>} />
        <Route path="staff/monitoring" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><MonitoringPage /></RoleGuard>} />
        <Route path="staff/monitoring/create" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><CreateMonitoringPage /></RoleGuard>} />
        <Route path="staff/monitoring/:id" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><MonitoringDetailPage /></RoleGuard>} />
        <Route path="staff/settings/clinic" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><ClinicProfilePage /></RoleGuard>} />
        <Route path="staff/settings/invoice" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><InvoiceSettingsPage /></RoleGuard>} />
        <Route path="staff/settings/hours" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><BusinessHoursPage /></RoleGuard>} />
        <Route path="staff/settings/audit" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><AuditLogPage /></RoleGuard>} />
        <Route path="profile" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff', 'customer' ]}><ProfilePage /></RoleGuard>} />
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
