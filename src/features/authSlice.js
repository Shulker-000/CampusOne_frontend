import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  institution: {
    data: null,
    isAuthenticated: false,
    authChecked: false,
  },
  user: {
    data: null,
    isAuthenticated: false,
    authChecked: false,
  },
  admission: {
    data: null,
    isAuthenticated: false,
    authChecked: false,
  },
};

// isAuthenticated → user actually logged in or not
// authChecked → backend session verification completed
// both prevent wrong redirects before auth status is known

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    // ===== INSTITUTION =====
    institutionLoginSuccess: (state, action) => {
      state.institution.data = action.payload.institution;
      state.institution.isAuthenticated = true;
      state.institution.authChecked = true;
    },

    institutionLogout: (state) => {
      state.institution.data = null;
      state.institution.isAuthenticated = false;
      state.institution.authChecked = true;
    },

    institutionAuthChecked: (state) => {
      state.institution.authChecked = true;
      state.institution.isAuthenticated = false;
      state.institution.data = null;
    },

    // ===== USER =====
    userLoginSuccess: (state, action) => {
      state.user.data = action.payload.user;
      state.user.isAuthenticated = true;
      state.user.authChecked = true;
    },

    userLogout: (state) => {
      state.user.data = null;
      state.user.isAuthenticated = false;
      state.user.authChecked = true;
    },

    userAuthChecked: (state) => {
      state.user.authChecked = true;
      state.user.isAuthenticated = false;
      state.user.data = null;
    },

    // ===== ADMISSION =====
    admissionLoginSuccess: (state, action) => {
      state.admission.data = action.payload.application;
      state.admission.isAuthenticated = true;
      state.admission.authChecked = true;
    },

    admissionLogout: (state) => {
      state.admission.data = null;
      state.admission.isAuthenticated = false;
      state.admission.authChecked = true;
    },

    admissionAuthChecked: (state) => {
      state.admission.authChecked = true;
      state.admission.isAuthenticated = false;
      state.admission.data = null;
    },
  },
});

export const {
  institutionLoginSuccess,
  institutionLogout,
  institutionAuthChecked,

  userLoginSuccess,
  userLogout,
  userAuthChecked,

  admissionLoginSuccess,
  admissionLogout,
  admissionAuthChecked,
} = authSlice.actions;

export default authSlice.reducer;