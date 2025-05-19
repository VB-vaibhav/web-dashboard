// main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import App from './App';
import LoginPage from './pages/LoginPage'; // ensure this path is correct
import ForgotPassword from './pages/ForgotPassword';
import OtpVerify from './pages/OtpVerify';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './layouts/AdminLayout';
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
import './index.css';

const isLoggedIn = () => {
  return !!localStorage.getItem('accessToken');

};
const role = localStorage.getItem('role');
const permissions = JSON.parse(localStorage.getItem('permissions')) || {};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Default route: show login if not logged in */}
        {/* <Route path="/" element={isLoggedIn() ? <App /> : <Navigate to="/login" />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Optional: Protect /app or /dashboard if user types it manually */}
        {/* <Route path="/dashboard" element={isLoggedIn() ? <App /> : <Navigate to="/login" />} /> */}
        <Route path="/" element={<AdminLayout />}>
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
        </Route>

      </Routes>
    </Router>
  </React.StrictMode>
);
