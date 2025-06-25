// src/auth/authService.js
import { setCredentials, clearCredentials } from '../slices/authSlice';
import store from '../store';
import axios from '../api/axios';

// const API_URL = 'http://localhost:5000/api/auth';
// const API_URL = 'https://api.theearthace.in/api/auth';
const API_URL = `${import.meta.env.VITE_API_URL}/auth`;
// if (!API_URL) throw new Error("VITE_API_URL is not defined");

export const login = async (emailOrUsername, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include', // Needed to send refreshToken cookie
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password })
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();

  //   localStorage.setItem('accessToken', data.accessToken);
  //   localStorage.setItem('role', data.role);
  //   if (data.permissions) {
  //     localStorage.setItem('permissions', JSON.stringify(data.permissions));
  //   }
  //   return data;
  // };
  store.dispatch(setCredentials({
    accessToken: data.accessToken,
    role: data.role,
    permissions: data.permissions,
  }));

  localStorage.setItem('accessToken', data.accessToken); // Optional

  // ✅ Fetch full profile info (username, email, etc.)
  await refreshUserState();

  return data;
};

export const logout = async () => {
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  // localStorage.removeItem('accessToken');
  store.dispatch(clearCredentials());
};

export const refreshAccessToken = async () => {
  const res = await axios.post(`${API_URL}/refresh`, {}, { withCredentials: true });
  localStorage.setItem('accessToken', res.data.accessToken);
  return res.data.accessToken;
};

export const refreshUserState = async () => {
  // const res = await fetch('http://localhost:5000/api/auth/me', {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });

  const data = await res.json();
  store.dispatch(setCredentials({
    accessToken: localStorage.getItem('accessToken'),
    role: data.role,
    permissions: data.permissions,
    username: data.username,
    name: data.name,
    email: data.email,
    phone: data.phone,
    joinDate: data.join_date,
    userId: data.user_id,
    // avatarUrl: data.avatar ? `http://localhost:5000${data.avatar}` // ✅ Fix relative path here 
    //  : null
    avatarUrl: data.avatar ? `${import.meta.env.VITE_API_URL}${data.avatar}` : null

  }));
  localStorage.setItem('userId', data.userId); // ✅ Save in browser

};

// export const uploadAvatar = async (file) => {
//   const formData = new FormData();
//   formData.append('avatar', file);

//   const res = await fetch('http://localhost:5000/api/auth/upload-avatar', {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('accessToken')}`
//     },
//     body: formData
//   });

//   if (!res.ok) throw new Error("Upload failed");
//   return res.json(); // { avatarUrl: '/uploads/...jpg' }
// };

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const token = localStorage.getItem('accessToken'); // ✅ correct key

  return await axios.post('/auth/upload-avatar', formData, {
    headers: {
      Authorization: `Bearer ${token}`,              // ✅ required by verifyToken
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true  // ✅ Add this line
  });
};

export const updateProfile = async ({ name, email, phone }) => {
  return await axios.post('/auth/update-profile', { name, email, phone });
};