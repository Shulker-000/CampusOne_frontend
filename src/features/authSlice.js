import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  institution: {
    data: null,
    token: null,
    isAuthenticated: false,
    authChecked: false,
  },

  // reserved for future
  user: {
    data: null,
    token: null,
    isAuthenticated: false,
    authChecked: false,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /* ================= INSTITUTION ================= */

    institutionLoginSuccess: (state, action) => {
      state.institution.data = action.payload.institution;
      state.institution.token = action.payload.token ?? null;
      state.institution.isAuthenticated = true;
      state.institution.authChecked = true;
    },

    institutionLogout: (state) => {
      state.institution.data = null;
      state.institution.token = null;
      state.institution.isAuthenticated = false;
      state.institution.authChecked = true;
    },

    /* ================= USER (FUTURE) ================= */

    userLoginSuccess: (state, action) => {
      state.user.data = action.payload.user;
      state.user.token = action.payload.token ?? null;
      state.user.isAuthenticated = true;
      state.user.authChecked = true;
    },

    userLogout: (state) => {
      state.user.data = null;
      state.user.token = null;
      state.user.isAuthenticated = false;
      state.user.authChecked = true;
    },
  },
});

export const {
  institutionLoginSuccess,
  institutionLogout,
  userLoginSuccess,
  userLogout,
} = authSlice.actions;

export default authSlice.reducer;
