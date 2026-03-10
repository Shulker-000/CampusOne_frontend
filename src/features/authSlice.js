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
};

// isAuthenticated → user actually logged in or not
// authChecked → backend session verification completed
// both are needed to avoid wrong redirects before auth status is known

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
      // use ONLY when you are SURE auth is invalid
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
  },
});

export const {
  institutionLoginSuccess,
  institutionLogout,
  institutionAuthChecked,
  userLoginSuccess,
  userLogout,
  userAuthChecked,
} = authSlice.actions;

export default authSlice.reducer;
