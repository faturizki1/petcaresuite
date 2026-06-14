import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import PublicLayout from '@/features/website/PublicLayout';
import { publicRoutes } from '@/router/route-config';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { CustomerRoute } from '@/features/auth/RoleRoutes';
import PortalLayout from '@/features/portal/PortalLayout';
import PortalOverviewPage from '@/features/portal/pages/PortalOverviewPage';
import PortalPetsPage from '@/features/portal/pages/PortalPetsPage';
import PortalAppointmentsPage from '@/features/portal/pages/PortalAppointmentsPage';
import PortalInvoicesPage from '@/features/portal/pages/PortalInvoicesPage';
import PortalPetProfilePage from '@/features/portal/pages/PortalPetProfilePage';
import PortalInpatientPage from '@/features/portal/pages/PortalInpatientPage';
import PortalGroomingPage from '@/features/portal/pages/PortalGroomingPage';
import PortalNotificationsPage from '@/features/portal/pages/PortalNotificationsPage';
import PortalProfilePage from '@/features/portal/pages/PortalProfilePage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { protectedRoutes, renderProtectedRoute } from '@/router/route-config';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<PublicLayout />}>
        {publicRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Route>

      <Route element={<AuthGuard><PortalLayout /></AuthGuard>}>
        <Route path="portal" element={<CustomerRoute><PortalOverviewPage /></CustomerRoute>} />
        <Route path="portal/pets" element={<CustomerRoute><PortalPetsPage /></CustomerRoute>} />
        <Route path="portal/pets/:id" element={<CustomerRoute><PortalPetProfilePage /></CustomerRoute>} />
        <Route path="portal/appointments" element={<CustomerRoute><PortalAppointmentsPage /></CustomerRoute>} />
        <Route path="portal/inpatient" element={<CustomerRoute><PortalInpatientPage /></CustomerRoute>} />
        <Route path="portal/grooming" element={<CustomerRoute><PortalGroomingPage /></CustomerRoute>} />
        <Route path="portal/notifications" element={<CustomerRoute><PortalNotificationsPage /></CustomerRoute>} />
        <Route path="portal/profile" element={<CustomerRoute><PortalProfilePage /></CustomerRoute>} />
        <Route path="portal/invoices" element={<CustomerRoute><PortalInvoicesPage /></CustomerRoute>} />
      </Route>

      <Route element={<AuthGuard><AppShell /></AuthGuard>}>
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={renderProtectedRoute(route)} />
        ))}
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
