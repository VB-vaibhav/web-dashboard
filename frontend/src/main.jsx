// // main.jsx
// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { useDispatch } from 'react-redux';
// import store, { persistor } from './store';
// import { PersistGate } from 'redux-persist/integration/react';

// // import App from './App';
// import AdminLayout from './layouts/AdminLayout';
// import LoginPage from './pages/LoginPage'; // ensure this path is correct
// import ForgotPassword from './pages/ForgotPassword';
// import OtpVerify from './pages/OtpVerify';
// import ResetPassword from './pages/ResetPassword';
// import DashboardPage from './pages/DashboardPage'; // if implemented
// import RenewalsPage from './pages/RenewalsPage';   // if implemented
// import ClientsPage from './pages/ClientsPage';
// import ReportsPage from './pages/ReportsPage';
// import SettingsPage from './pages/SettingsPage';


// import NotificationSchedulerPage from './pages/NotificationSchedulerPage';
// import MailSchedulerPage from './pages/MailSchedulerPage';
// // Service-specific
// import CloudServerClientsPage from './pages/CloudServerClientsPage';
// import CerberusClientsPage from './pages/CerberusClientsPage';
// import ProxyClientsPage from './pages/ProxyClientsPage';
// import StorageServerClientsPage from './pages/StorageServerClientsPage';
// import VarysClientsPage from './pages/VarysClientsPage';
// import { useSelector } from 'react-redux';
// import { useEffect, useState } from 'react';
// import { hasAccess } from './utils/accessUtils';
// import { RefreshProvider } from './context/RefreshContext';
// import { ProfileProvider } from './context/ProfileContext';
// import ProfilePage from './pages/ProfilePage';
// import EditProfilePageMobile from './pages/EditProfilePageMobile';
// import HelpPage from './pages/HelpPage';
// import ServiceAccessSettings from './pages/settings/ServiceAccessSettings';
// import ManageRoleSettings from './pages/settings/RoleManagementSettings';
// import PanelAccessSettings from './pages/settings/PanelAccessSettings';
// import UserManagementSettings from './pages/settings/UserManagementSettings';
// import ForbiddenPage from './pages/ForbiddenPage';
// import ExcludeClientSettings from './pages/settings/ExcludeClientsSettings';
// import { setCredentials } from './slices/authSlice';

// import './index.css';

// const isLoggedIn = () => {
//   return !!localStorage.getItem('accessToken');

// };

// // const role = localStorage.getItem('role');
// // const permissions = JSON.parse(localStorage.getItem('permissions')) || {};

// // const ProtectedRoutes = () => {
// //   const dispatch = useDispatch();
// //   const role = useSelector(state => state.auth.role);
// //   const permissions = useSelector(state => state.auth.permissions);
// //   const isRestricted = useSelector(state => state.auth.isRestricted);
// //   // const [timeout, setTimeoutReached] = useState(false);
// //   const [checked, setChecked] = useState(false);
// //   const [isReallyRestricted, setIsReallyRestricted] = useState(false);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const checkStatus = async () => {
// //       try {
// //         const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem('accessToken')}`
// //           }
// //         });
// //         const data = await res.json();

// //         // if (data?.role) {
// //         if (data?.is_restricted === 1) {
// //           dispatch(setCredentials({ is_restricted: 1 }));
// //           // dispatch(clearCredentials());
// //           return;
// //         }
// //         // }
// //       } catch (err) {
// //         console.error("Failed to validate session", err);
// //       } finally {
// //         setChecked(true);
// //       }
// //     };

// //     checkStatus();
// //   }, [dispatch]);

// //   if (!checked) {
// //     return <div className="p-6 text-center text-sm text-gray-500">Checking access...</div>;
// //   }

// //   if (isReallyRestricted) {
// //     window.location.href = '/403';
// //     return null;
// //   }

// //   // useEffect(() => {
// //   //   const timer = setTimeout(() => setTimeoutReached(true), 2000); // 2 sec max wait
// //   //   return () => clearTimeout(timer);
// //   // }, []);

// //   if (!role || !permissions) {
// //     return timeout
// //       ? <Navigate to="/login" />
// //       : <div className="p-6 text-center text-sm text-gray-500">Loading session...</div>;
// //   }
// //   // ✅ Add this hard guard
// //   // if (isRestricted) {
// //   //   return <Navigate to="/403" replace />;
// //   // }

// const ProtectedRoutes = () => {
//   const dispatch = useDispatch();
//   const role = useSelector(state => state.auth.role);
//   const permissions = useSelector(state => state.auth.permissions);
//   const [checked, setChecked] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkStatus = async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('accessToken')}`
//           }
//         });

//         const data = await res.json();

//         if (data?.is_restricted === 1) {
//           // ✅ Update Redux AND redirect immediately
//           dispatch(setCredentials({ is_restricted: 1 }));
//           window.location.href = '/403';
//           return;
//         }

//         // ✅ You can also dispatch user info here if needed
//         dispatch(setCredentials({
//           accessToken: localStorage.getItem('accessToken'),
//           role: data.role,
//           permissions: data.permissions,
//           username: data.username,
//           name: data.name,
//           email: data.email,
//           phone: data.phone,
//           joinDate: data.join_date,
//           userId: data.user_id,
//           avatarUrl: data.avatar ? `${import.meta.env.VITE_API_URL}${data.avatar}` : null,
//           is_restricted: data.is_restricted
//         }));

//       } catch (err) {
//         console.error("Session validation failed", err);
//       } finally {
//         setChecked(true);
//       }
//     };

//     checkStatus();
//   }, [dispatch]);

//   if (!checked) {
//     return <div className="p-6 text-center text-sm text-gray-500">Checking access...</div>;
//   }

//   return (
//     <Routes>
//       <Route path="/" element={<AdminLayout />}>
//         <Route index element={<DashboardPage />} />
//         <Route path="dashboard" element={<DashboardPage />} />

//         <Route path="renewals" element={['superadmin', 'admin', 'middleman'].includes(role) ? <RenewalsPage /> : <Navigate to="/unauthorized" />} />
//         <Route path="clients" element={['superadmin', 'admin', 'middleman'].includes(role) ? <ClientsPage /> : <Navigate to="/unauthorized" />} />
//         <Route path="clients/cloud" element={hasAccess(role, permissions, 'is_vps') ? <CloudServerClientsPage /> : <Navigate to="/unauthorized" />} />
//         <Route path="clients/cerberus" element={hasAccess(role, permissions, 'is_cerberus') ? <CerberusClientsPage /> : <Navigate to="/unauthorized" />} />
//         <Route path="clients/proxy" element={hasAccess(role, permissions, 'is_proxy') ? <ProxyClientsPage /> : <Navigate to="/unauthorized" />} />
//         <Route path="clients/storage" element={hasAccess(role, permissions, 'is_storage') ? <StorageServerClientsPage /> : <Navigate to="/unauthorized" />} />
//         <Route path="clients/varys" element={hasAccess(role, permissions, 'is_varys') ? <VarysClientsPage /> : <Navigate to="/unauthorized" />} />
//         <Route path="notification-scheduler" element={
//           hasAccess(role, permissions, 'is_notification') ? <NotificationSchedulerPage /> : <Navigate to="/unauthorized" />
//         } />
//         <Route path="mail-scheduler" element={
//           hasAccess(role, permissions, 'is_mail') ? <MailSchedulerPage /> : <Navigate to="/unauthorized" />
//         } />
//         <Route path="reports" element={
//           hasAccess(role, permissions, 'is_reports') ? <ReportsPage /> : <Navigate to="/unauthorized" />
//         } />
//         {/* <Route path="settings" element={<SettingsPage />} /> */}
//         {/* <Route path="settings" element={role === 'superadmin' ? <SettingsPage /> : <Navigate to="/unauthorized" />}> */}
//         <Route path="settings" element={hasAccess(role, permissions, 'is_settings') ? <SettingsPage /> : <Navigate to="/unauthorized" />} >
//           <Route index element={<Navigate to="service-access" />} />
//           <Route path="service-access" element={<ServiceAccessSettings />} />
//           <Route path="panel-access" element={<PanelAccessSettings />} />
//           <Route path="exclude-clients" element={<ExcludeClientSettings />} />
//           <Route path="role-management" element={<ManageRoleSettings />} />
//           <Route path="users" element={<UserManagementSettings />} />
//         </Route>

//         <Route path="/profile" element={<ProfilePage />} />
//         <Route path="/profile/edit" element={<EditProfilePageMobile />} />
//         <Route path="help" element={<HelpPage />} />
//         <Route path="unauthorized" element={<h2 className="p-8 text-red-600">Unauthorized</h2>} />
//       </Route>
//     </Routes>
//   );
// };

// createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <PersistGate loading={<div className="p-8">Loading session...</div>} persistor={persistor}>
//         <RefreshProvider>
//           <ProfileProvider>
//             <Router>
//               <Routes>
//                 {/* Default route: show login if not logged in */}
//                 {/* <Route path="/" element={isLoggedIn() ? <App /> : <Navigate to="/login" />} /> */}
//                 <Route path="/login" element={<LoginPage />} />
//                 <Route path="/forgot-password" element={<ForgotPassword />} />
//                 <Route path="/verify-otp" element={<OtpVerify />} />
//                 <Route path="/reset-password" element={<ResetPassword />} />
//                 {/* <Route path="/profile" element={<ProfilePage />} /> */}
//                 {/* Optional: Protect /app or /dashboard if user types it manually */}
//                 {/* <Route path="/dashboard" element={isLoggedIn() ? <App /> : <Navigate to="/login" />} /> */}
//                 {/* <Route path="/" element={<AdminLayout />}>
//           <Route index element={<DashboardPage />} />
//           <Route path="dashboard" element={<DashboardPage />} />
//           <Route path="renewals" element={
//             ['superadmin', 'admin', 'middleman'].includes(role)
//               ? <RenewalsPage />
//               : <Navigate to="/unauthorized" />
//           } />
//           <Route path="clients" element={
//             ['superadmin', 'admin', 'middleman'].includes(role)
//               ? <ClientsPage />
//               : <Navigate to="/unauthorized" />
//           } />
//           <Route path="clients/cloud" element={
//             role === 'superadmin' || (permissions.is_vps === 1)
//               ? <CloudServerClientsPage />
//               : <Navigate to="/unauthorized" />
//           } />

//           <Route path="clients/cerberus" element={
//             role === 'superadmin' || (permissions.is_cerberus === 1)
//               ? <CerberusClientsPage />
//               : <Navigate to="/unauthorized" />
//           } />

//           <Route path="clients/proxy" element={
//             role === 'superadmin' || (permissions.is_proxy === 1)
//               ? <ProxyClientsPage />
//               : <Navigate to="/unauthorized" />
//           } />

//           <Route path="clients/storage" element={
//             role === 'superadmin' || (permissions.is_storage === 1)
//               ? <StorageServerClientsPage />
//               : <Navigate to="/unauthorized" />
//           } />

//           <Route path="clients/varys" element={
//             role === 'superadmin' || (permissions.is_varys === 1)
//               ? <VarysClientsPage />
//               : <Navigate to="/unauthorized" />
//           } />
//           <Route path="notification-scheduler" element={<NotificationSchedulerPage />} />
//           <Route path="mail-scheduler" element={<MailSchedulerPage />} />
//           <Route path="reports" element={<ReportsPage />} />
//           <Route path="settings" element={<SettingsPage />} />
//           <Route path="unauthorized" element={<h2 className="p-8 text-red-600">Unauthorized</h2>} />
//         </Route> */}
//                 <Route path="/403" element={<ForbiddenPage />} />
//                 <Route path="/*" element={<ProtectedRoutes />} />

//               </Routes>
//             </Router>
//           </ProfileProvider>
//         </RefreshProvider>
//       </PersistGate>
//     </Provider>
//   </React.StrictMode>
// );

























// main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';

import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import OtpVerify from './pages/OtpVerify';
import ResetPassword from './pages/ResetPassword';
import DashboardPage from './pages/DashboardPage';
import ManageRenewalsPage from './pages/ManageRenewalsPage';
import ExpiringClientsTable from './pages/ExpiringClientsTable';
import CancelledClientsTable from './pages/CancelledClientsTable';
import DeletedClientsTable from './pages/DeletedClientsTable';
import ClientsPage from './pages/ClientsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotificationSchedulerPage from './pages/NotificationSchedulerPage';
import MailSchedulerPage from './pages/MailSchedulerPage';
import CloudServerClientsPage from './pages/CloudServerClientsPage';
import CerberusClientsPage from './pages/CerberusClientsPage';
import ProxyClientsPage from './pages/ProxyClientsPage';
import StorageServerClientsPage from './pages/StorageServerClientsPage';
import VarysClientsPage from './pages/VarysClientsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePageMobile from './pages/EditProfilePageMobile';
import HelpPage from './pages/HelpPage';
import ServiceAccessSettings from './pages/settings/ServiceAccessSettings';
import ManageRoleSettings from './pages/settings/RoleManagementSettings';
import PanelAccessSettings from './pages/settings/PanelAccessSettings';
import UserManagementSettings from './pages/settings/UserManagementSettings';
import ExcludeClientSettings from './pages/settings/ExcludeClientsSettings';
import ForbiddenPage from './pages/ForbiddenPage';

import { RefreshProvider } from './context/RefreshContext';
import { ProfileProvider } from './context/ProfileContext';
import { hasAccess } from './utils/accessUtils';
import { setCredentials } from './slices/authSlice';

import './index.css';

const isLoggedIn = () => !!localStorage.getItem('accessToken');

// ✅ PROTECTED ROUTES
const ProtectedRoutes = () => {
  const dispatch = useDispatch();
  const role = useSelector(state => state.auth.role);
  const permissions = useSelector(state => state.auth.permissions);
  const [checked, setChecked] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (res.status !== 200) {
          throw new Error('Session invalid');
        }

        const data = await res.json();

        if (data?.is_restricted === 1) {
          dispatch(setCredentials({ is_restricted: 1 }));
          window.location.href = '/403';
          return;
        }

        dispatch(setCredentials({
          accessToken: localStorage.getItem('accessToken'),
          role: data.role,
          permissions: data.permissions,
          username: data.username,
          name: data.name,
          email: data.email,
          phone: data.phone,
          joinDate: data.join_date,
          userId: data.user_id,
          avatarUrl: data.avatar ? `${import.meta.env.VITE_API_URL}${data.avatar}` : null,
          is_restricted: data.is_restricted
        }));

      } catch (err) {
        console.error("Session validation failed", err);
        localStorage.removeItem('accessToken');
        navigate('/login', { replace: true });
      } finally {
        setChecked(true);
      }
    };

    checkStatus();
  }, [dispatch, navigate]);

  if (!checked) {
    return <div className="p-6 text-center text-sm text-gray-500">Checking session...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="renewals" element={<ManageRenewalsPage />}>
          <Route index element={<Navigate to="expiring-clients" />} />
          <Route path="expiring-clients" element={<ExpiringClientsTable />} />
          <Route path="cancelled-clients" element={<CancelledClientsTable />} />
          <Route path="deleted-clients" element={<DeletedClientsTable />} />
        </Route>
        <Route path="clients" element={['superadmin', 'admin', 'middleman'].includes(role) ? <ClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/cloud" element={hasAccess(role, permissions, 'is_vps') ? <CloudServerClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/cerberus" element={hasAccess(role, permissions, 'is_cerberus') ? <CerberusClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/proxy" element={hasAccess(role, permissions, 'is_proxy') ? <ProxyClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/storage" element={hasAccess(role, permissions, 'is_storage') ? <StorageServerClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="clients/varys" element={hasAccess(role, permissions, 'is_varys') ? <VarysClientsPage /> : <Navigate to="/unauthorized" />} />
        <Route path="notification-scheduler" element={hasAccess(role, permissions, 'is_notification') ? <NotificationSchedulerPage /> : <Navigate to="/unauthorized" />} />
        <Route path="mail-scheduler" element={hasAccess(role, permissions, 'is_mail') ? <MailSchedulerPage /> : <Navigate to="/unauthorized" />} />
        <Route path="reports" element={hasAccess(role, permissions, 'is_reports') ? <ReportsPage /> : <Navigate to="/unauthorized" />} />

        <Route path="settings" element={hasAccess(role, permissions, 'is_settings') ? <SettingsPage /> : <Navigate to="/unauthorized" />}>
          <Route index element={<Navigate to="service-access" />} />
          <Route path="service-access" element={<ServiceAccessSettings />} />
          <Route path="panel-access" element={<PanelAccessSettings />} />
          <Route path="exclude-clients" element={<ExcludeClientSettings />} />
          <Route path="role-management" element={<ManageRoleSettings />} />
          <Route path="users" element={<UserManagementSettings />} />
        </Route>

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePageMobile />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="unauthorized" element={<h2 className="p-8 text-red-600">Unauthorized</h2>} />
      </Route>
    </Routes>
  );
};

// ✅ ROOT RENDER
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div className="p-8">Loading session...</div>} persistor={persistor}>
        <RefreshProvider>
          <ProfileProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<OtpVerify />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/403" element={<ForbiddenPage />} />

                {/* ✅ KEY CHANGE HERE */}
                <Route path="/*" element={isLoggedIn() ? <ProtectedRoutes /> : <Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </ProfileProvider>
        </RefreshProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
