import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import LandingPage from "./Pages/general/LandingPage";
import ContactPage from "./Pages/general/ContactPage";
import NotFound from "./Pages/general/NotFound";
import { loginSuccess, logout } from "./features/authSlice"; // Import the logout action from your authSlice

// Institution Pages
import RegisterInstitution from "./Pages/institution/RegisterInstitution";
import LoginInstitution from "./Pages/institution/LoginInstitution";
import ForgotPasswordInstitution from "./Pages/institution/ForgotPasswordInstitution";
import ResetPasswordInstitution from "./Pages/institution/ResetPasswordInstitution";
import InstitutionDashboard from "./Pages/institution/InstitutionDashboard";
import InstitutionProfile from "./Pages/institution/InstitutionProfile";
import Navbar from "./components/Navbar";

/* ---------- Route Guards ---------- */

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useSelector(state => state.auth);

  if (!authChecked) {
    return null; // or loading spinner
  }

  return isAuthenticated
    ? children
    : <Navigate to="/institution/login" replace />;
};


const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useSelector(state => state.auth);

  if (!authChecked) {
    return null;
  }

  return isAuthenticated
    ? <Navigate to="/dashboard" replace />
    : children;
};


/* ---------- App ---------- */

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/institutions/current-institution`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        dispatch(
          loginSuccess({
            institution: data.data,
          })
        );
      } catch {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch]);



  return (
    <Router>
      <Navbar />

      <Routes>
        {/* ===== PUBLIC ONLY ===== */}
        <Route path="/" element={
          <PublicOnlyRoute>
            <LandingPage />
          </PublicOnlyRoute>
        } />

        <Route path="/institution/login" element={
          <PublicOnlyRoute>
            <LoginInstitution />
          </PublicOnlyRoute>
        } />

        <Route path="/institution/register" element={
          <PublicOnlyRoute>
            <RegisterInstitution />
          </PublicOnlyRoute>
        } />

        <Route path="/institution/forgot-password" element={
          <PublicOnlyRoute>
            <ForgotPasswordInstitution />
          </PublicOnlyRoute>
        } />

        <Route path="/institution/reset-password/:token" element={
          <PublicOnlyRoute>
            <ResetPasswordInstitution />
          </PublicOnlyRoute>
        } />

        {/* ===== PROTECTED ===== */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <InstitutionDashboard />
          </ProtectedRoute>
        } />

        <Route path="/institution/profile" element={
          <ProtectedRoute>
            <InstitutionProfile />
          </ProtectedRoute>
        } />

        {/* ===== ALWAYS PUBLIC ===== */}
        <Route path="/contact" element={<ContactPage />} />

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
