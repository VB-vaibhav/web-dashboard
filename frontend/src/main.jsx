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
import App from './App';
import LoginPage from './pages/LoginPage'; // ensure this path is correct
import './index.css';
import ForgotPassword from './pages/ForgotPassword';
import OtpVerify from './pages/OtpVerify';
import ResetPassword from './pages/ResetPassword';

const isLoggedIn = () => {
  return !!localStorage.getItem('accessToken');
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Default route: show login if not logged in */}
        <Route path="/" element={isLoggedIn() ? <App /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Optional: Protect /app or /dashboard if user types it manually */}
        <Route path="/dashboard" element={isLoggedIn() ? <App /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
