// src/api/axios.js
import axios from 'axios';
import { refreshAccessToken } from '../auth/authService';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // Needed for sending refresh cookie
});

// 🔁 Interceptor to auto-refresh expired token
instance.interceptors.response.use(
  response => response,
  async (error) => {
    const original = error.config;

    if (error.response && error.response.status === 403 && !original._retry) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return instance(original); // Retry with new token
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
