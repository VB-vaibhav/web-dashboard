// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
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
          <Route path="renewals" element={<RenewalsPage />} />
          {/* More routes */}
        </Route>

      </Routes>
    </Router>
  </React.StrictMode>
);
