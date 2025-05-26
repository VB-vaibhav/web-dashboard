// main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store, { persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';

// import App from './App';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage'; // ensure this path is correct
import ForgotPassword from './pages/ForgotPassword';
import OtpVerify from './pages/OtpVerify';
import ResetPassword from './pages/ResetPassword';
import DashboardPage from './pages/DashboardPage'; // if implemented
import RenewalsPage from './pages/RenewalsPage';   // if implemented
import ClientsPage from './pages/ClientsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotificationSchedulerPage from './pages/NotificationSchedulerPage';
import MailSchedulerPage from './pages/MailSchedulerPage';
// Service-specific
import CloudServerClientsPage from './pages/CloudServerClientsPage';
import CerberusClientsPage from './pages/CerberusClientsPage';
import ProxyClientsPage from './pages/ProxyClientsPage';
import StorageServerClientsPage from './pages/StorageServerClientsPage';
import VarysClientsPage from './pages/VarysClientsPage';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { hasAccess } from './utils/accessUtils';
import { RefreshProvider } from './context/RefreshContext';
import { ProfileProvider } from './context/ProfileContext';
import ProfilePage from './pages/ProfilePage';
import EditProfilePageMobile from './pages/EditProfilePageMobile';
import './index.css';

const isLoggedIn = () => {
  return !!localStorage.getItem('accessToken');

};

// const role = localStorage.getItem('role');
// const permissions = JSON.parse(localStorage.getItem('permissions')) || {};

const ProtectedRoutes = () => {
  const role = useSelector(state => state.auth.role);
  const permissions = useSelector(state => state.auth.permissions);
  const [timeout, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimeoutReached(true), 2000); // 2 sec max wait
    return () => clearTimeout(timer);
  }, []);

  if (!role || !permissions) {
    return timeout
      ? <Navigate to="/login" />
      : <div className="p-6 text-center text-sm text-gray-500">Loading session...</div>;
  }
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="renewals" element={['superadmin', 'admin', 'middleman'].includes(role) ? <RenewalsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients" element={['superadmin', 'admin', 'middleman'].includes(role) ? <ClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/cloud" element={hasAccess(role, permissions, 'is_vps') ? <CloudServerClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/cerberus" element={hasAccess(role, permissions, 'is_cerberus') ? <CerberusClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/proxy" element={hasAccess(role, permissions, 'is_proxy') ? <ProxyClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/storage" element={hasAccess(role, permissions, 'is_storage') ? <StorageServerClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/varys" element={hasAccess(role, permissions, 'is_varys') ? <VarysClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="notification-scheduler" element={
          hasAccess(role, permissions, 'is_notification') ? <NotificationSchedulerPage /> : <Navigate to="/unauthorized" />
        } />
        <Route path="mail-scheduler" element={
          hasAccess(role, permissions, 'is_mail') ? <MailSchedulerPage /> : <Navigate to="/unauthorized" />
        } />
        <Route path="reports" element={
          hasAccess(role, permissions, 'is_reports') ? <ReportsPage /> : <Navigate to="/unauthorized" />
        } />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePageMobile />} />
        <Route path="unauthorized" element={<h2 className="p-8 text-red-600">Unauthorized</h2>} />
      </Route>
    </Routes>
  );
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div className="p-8">Loading session...</div>} persistor={persistor}>
        <RefreshProvider>
          <ProfileProvider>
            <Router>
              <Routes>
                {/* Default route: show login if not logged in */}
                {/* <Route path="/" element={isLoggedIn() ? <App /> : <Navigate to="/login" />} /> */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<OtpVerify />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* <Route path="/profile" element={<ProfilePage />} /> */}
                {/* Optional: Protect /app or /dashboard if user types it manually */}
                {/* <Route path="/dashboard" element={isLoggedIn() ? <App /> : <Navigate to="/login" />} /> */}
                {/* <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="renewals" element={
            ['superadmin', 'admin', 'middleman'].includes(role)
              ? <RenewalsPage />
              : <Navigate to="/unauthorized" />
          } />
          <Route path="clients" element={
            ['superadmin', 'admin', 'middleman'].includes(role)
              ? <ClientsPage />
              : <Navigate to="/unauthorized" />
          } />
          <Route path="clients/cloud" element={
            role === 'superadmin' || (permissions.is_vps === 1)
              ? <CloudServerClientsPage />
              : <Navigate to="/unauthorized" />
          } />

          <Route path="clients/cerberus" element={
            role === 'superadmin' || (permissions.is_cerberus === 1)
              ? <CerberusClientsPage />
              : <Navigate to="/unauthorized" />
          } />

          <Route path="clients/proxy" element={
            role === 'superadmin' || (permissions.is_proxy === 1)
              ? <ProxyClientsPage />
              : <Navigate to="/unauthorized" />
          } />

          <Route path="clients/storage" element={
            role === 'superadmin' || (permissions.is_storage === 1)
              ? <StorageServerClientsPage />
              : <Navigate to="/unauthorized" />
          } />

          <Route path="clients/varys" element={
            role === 'superadmin' || (permissions.is_varys === 1)
              ? <VarysClientsPage />
              : <Navigate to="/unauthorized" />
          } />
          <Route path="notification-scheduler" element={<NotificationSchedulerPage />} />
          <Route path="mail-scheduler" element={<MailSchedulerPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="unauthorized" element={<h2 className="p-8 text-red-600">Unauthorized</h2>} />
        </Route> */}
                <Route path="/*" element={<ProtectedRoutes />} />

              </Routes>
            </Router>
          </ProfileProvider>
        </RefreshProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
