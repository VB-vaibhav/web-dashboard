import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  role: null,
  permissions: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, role, permissions } = action.payload;
      state.accessToken = accessToken;
      state.role = role;
      state.permissions = permissions;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.role = null;
      state.permissions = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
