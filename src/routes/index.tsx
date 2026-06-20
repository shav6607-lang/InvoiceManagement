import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAppSelector } from '../redux/hooks';

// Lazy load pages for better performance
const Login = React.lazy(() => import('../pages/Login/index'));
const Dashboard = React.lazy(() => import('../pages/Dashboard/index'));
const InvoiceList = React.lazy(() => import('../pages/Invoices/index'));
const CreateInvoice = React.lazy(() => import('../pages/Invoices/CreateInvoice'));
const DCList = React.lazy(() => import('../pages/DC/index'));
const CreateDC = React.lazy(() => import('../pages/DC/CreateDC'));
const Reports = React.lazy(() => import('../pages/Reports/index'));
const Users = React.lazy(() => import('../pages/Users/index'));
const Companies = React.lazy(() => import('../pages/Companies/index'));
const Materials = React.lazy(() => import('../pages/Materials/index'));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        
        <Route 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/dc" element={<DCList />} />
          <Route path="/dc/create" element={<CreateDC />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
};
