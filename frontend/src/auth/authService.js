// src/auth/authService.js
import axios from '../api/axios';

const API_URL = 'http://localhost:5000/api/auth';

export const login = async (emailOrUsername, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include', // Needed to send refreshToken cookie
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password })
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('role', data.role);
  if (data.permissions) {
    localStorage.setItem('permissions', JSON.stringify(data.permissions));
  }
  return data;
};

export const logout = async () => {
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  localStorage.removeItem('accessToken');
};

export const refreshAccessToken = async () => {
  const res = await axios.post(`${API_URL}/refresh`, {}, { withCredentials: true });
  localStorage.setItem('accessToken', res.data.accessToken);
  return res.data.accessToken;
};
