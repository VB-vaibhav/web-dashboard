// src/api/axios.js
import axios from 'axios';
import { refreshAccessToken } from '../auth/authService';

const instance = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // Needed for sending refresh cookie
});

// 🔁 Interceptor to auto-refresh expired token
// instance.interceptors.response.use(
//   response => response,
//   async (error) => {
//     const original = error.config;

//     if (error.response && error.response.status === 403 && !original._retry) {
//       original._retry = true;
//       try {
//         const newToken = await refreshAccessToken();
//         original.headers.Authorization = `Bearer ${newToken}`;
//         return instance(original); // Retry with new token
//       } catch (refreshErr) {
//         return Promise.reject(refreshErr);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// instance.interceptors.response.use(
//   response => response,
//   async (error) => {
//     const original = error.config;

//     if (error.response && error.response.status === 403) {
//       const message = error.response.data?.message || '';

//       if (message === 'You are restricted') {
//         localStorage.removeItem('accessToken');
//         window.location.href = '/403';
//         return Promise.reject(error);
//       }

//       if (!original._retry) {
//         original._retry = true;
//         try {
//           const newToken = await refreshAccessToken();
//           original.headers.Authorization = `Bearer ${newToken}`;
//           return instance(original); // Retry
//         } catch (refreshErr) {
//           return Promise.reject(refreshErr);
//         }
//       }
//     }


//     return Promise.reject(error);
//   }
// );

instance.interceptors.response.use(
  response => response,
  async (error) => {
    const original = error.config;

    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || error.response.data?.error || '';

      // ✅ If the user is restricted, immediately redirect
      if (message.toLowerCase().includes('restricted')) {
        localStorage.clear(); // remove token & session
        window.location.href = '/403'; // 💣 force 403 page
        return; // exit handler
      }

      // ✅ Handle token refresh (optional)
      if (message.toLowerCase().includes('session_expired') && !original._retry) {
        original._retry = true;
        try {
          const newToken = await refreshAccessToken();
          // localStorage.setItem('accessToken', newToken);

          original.headers.Authorization = `Bearer ${newToken}`;

          // ⬅️ This fixes DELETE retry issue
          // if (original.method === 'delete') {
          //   original.data = error.config.data;
          // }
          
          return instance(original);
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);


// instance.interceptors.response.use(
//   response => response,
//   async (error) => {
//     const original = error.config;

//     // ✅ Case 1: Restricted user → redirect to /403
//     if (
//       error.response?.status === 403 &&
//       error.response?.data?.error === 'restricted_user'
//     ) {
//       localStorage.clear(); // 🚨 remove accessToken, etc.
//       window.location.href = '/403'; // ⛔ redirect to 403 page
//       return Promise.reject(error);
//     }

//     // ✅ Case 2: Try token refresh if not yet retried
//     if (
//       error.response?.status === 403 &&
//       !original._retry &&
//       error.response?.data?.error === 'session_expired'
//     ) {
//       original._retry = true;
//       try {
//         const newToken = await refreshAccessToken();
//         original.headers.Authorization = `Bearer ${newToken}`;
//         return instance(original);
//       } catch (refreshErr) {
//         return Promise.reject(refreshErr);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default instance;
