import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/redux/hooks';

const Login = React.lazy(() => import('@/pages/Login/index'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard/index'));
const InvoiceList = React.lazy(() => import('@/pages/Invoices/index'));
const CreateInvoice = React.lazy(() => import('@/pages/Invoices/CreateInvoice'));
const DCList = React.lazy(() => import('@/pages/DC/index'));
const CreateDC = React.lazy(() => import('@/pages/DC/CreateDC'));
const Reports = React.lazy(() => import('@/pages/Reports/index'));
const Users = React.lazy(() => import('@/pages/Users/index'));
const Companies = React.lazy(() => import('@/pages/Companies/index'));
const Materials = React.lazy(() => import('@/pages/Materials/index'));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => (
  <React.Suspense fallback={<LoadingSpinner fullScreen message="Loading application..." />}>
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.INVOICES} element={<InvoiceList />} />
        <Route path={ROUTES.INVOICES_CREATE} element={<CreateInvoice />} />
        <Route path={ROUTES.DC} element={<DCList />} />
        <Route path={ROUTES.DC_CREATE} element={<CreateDC />} />
        <Route path={ROUTES.REPORTS} element={<Reports />} />
        <Route path={ROUTES.USERS} element={<Users />} />
        <Route path={ROUTES.COMPANIES} element={<Companies />} />
        <Route path={ROUTES.MATERIALS} element={<Materials />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Route>
    </Routes>
  </React.Suspense>
);
