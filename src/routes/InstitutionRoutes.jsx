import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import LoginInstitution from "../Pages/institution/LoginInstitution";
import RegisterInstitution from "../Pages/institution/RegisterInstitution";
import ForgotPasswordInstitution from "../Pages/institution/ForgotPasswordInstitution";
import ResetPasswordInstitution from "../Pages/institution/ResetPasswordInstitution";
import VerifyInstitutionEmail from "../Pages/institution/VerifyInstitutionEmail";
import InstitutionDashboard from "../Pages/institution/InstitutionDashboard";
import InstitutionProfile from "../Pages/institution/InstitutionProfile";

/* ---------- Guards ---------- */

// for /institution/dashboard, /institution/profile
const InstitutionProtected = ({ children }) => {
  const { isAuthenticated, authChecked } = useSelector(
    (s) => s.auth.institution
  );

  if (!authChecked) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// for /institution/login, register, etc
const InstitutionAuthPublic = ({ children }) => {
  const { isAuthenticated, authChecked } = useSelector(
    (s) => s.auth.institution
  );

  if (!authChecked) return null;

  if (isAuthenticated) {
    return <Navigate to="/institution/dashboard" replace />;
  }

  return children;
};

/* ---------- Routes ---------- */

const InstitutionRoutes = () => {
  return (
    <Routes>
      {/* AUTH PUBLIC */}
      <Route
        path="login"
        element={
          <InstitutionAuthPublic>
            <LoginInstitution />
          </InstitutionAuthPublic>
        }
      />

      <Route
        path="register"
        element={
          <InstitutionAuthPublic>
            <RegisterInstitution />
          </InstitutionAuthPublic>
        }
      />

      <Route
        path="forgot-password"
        element={
          <InstitutionAuthPublic>
            <ForgotPasswordInstitution />
          </InstitutionAuthPublic>
        }
      />

      <Route
        path="reset-password/:token"
        element={
          <InstitutionAuthPublic>
            <ResetPasswordInstitution />
          </InstitutionAuthPublic>
        }
      />

      {/* PROTECTED */}
      <Route
        path="dashboard"
        element={
          <InstitutionProtected>
            <InstitutionDashboard />
          </InstitutionProtected>
        }
      />

      <Route
        path="profile"
        element={
          <InstitutionProtected>
            <InstitutionProfile />
          </InstitutionProtected>
        }
      />

      {/* ALWAYS PUBLIC */}
      <Route
        path="verify-email/:token"
        element={<VerifyInstitutionEmail />}
      />
    </Routes>
  );
};

export default InstitutionRoutes;
