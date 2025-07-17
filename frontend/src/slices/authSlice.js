import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  role: null,
  permissions: null,
  username: null,
  name: null,
  email: null,
  phone: null,
  joinDate: null,
  userId: null,
  avatarUrl: null,
  isRestricted: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, role, permissions,
        username, name, email, phone, joinDate, userId, avatarUrl, is_restricted } = action.payload;
      state.accessToken = accessToken;
      state.role = role;
      state.permissions = permissions;
      state.username = username;
      state.name = name;
      state.email = email;
      state.phone = phone;
      state.joinDate = joinDate;
      state.userId = userId;
      state.avatarUrl = avatarUrl;
      state.isRestricted = is_restricted === 1;// ✅ convert 1 → true
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.role = null;
      state.permissions = null;
      state.username = null;
      state.name = null;
      state.email = null;
      state.phone = null;
      state.joinDate = null;
      state.userId = null;
      state.avatarUrl = null;
      state.isRestricted = false; // ✅ reset restriction on logout
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
