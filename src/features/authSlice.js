import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  institution: null,
  token: null,
  isAuthenticated: false,
  authChecked: false, // 🔑 NEW
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.institution = action.payload.institution;
      state.token = action.payload.token ?? null;
      state.isAuthenticated = true;
      state.authChecked = true;
    },
    logout: (state) => {
      state.institution = null;
      state.token = null;
      state.isAuthenticated = false;
      state.authChecked = true;
    },
  },
});


export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
