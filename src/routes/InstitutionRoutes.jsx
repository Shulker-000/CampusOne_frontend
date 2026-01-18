import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import LoginInstitution from "../pages/institution/LoginInstitution";
import RegisterInstitution from "../pages/institution/RegisterInstitution";
import ForgotPasswordInstitution from "../pages/institution/ForgotPasswordInstitution";
import ResetPasswordInstitution from "../pages/institution/ResetPasswordInstitution";
import VerifyInstitutionEmail from "../pages/institution/VerifyInstitutionEmail";
import InstitutionDashboard from "../pages/institution/InstitutionDashboard";
import InstitutionProfile from "../pages/institution/InstitutionProfile";
import NotFound from "../pages/NotFound";

import Loader from "../components/Loader";
import DashboardLayout from "../layouts/DashboardLayout";
import InstitutionDepartments from "../pages/institution/departments/InstitutionDepartments";
import CreateDepartment from "../pages/institution/departments/CreateDepartment";
import EditDepartment from "../pages/institution/departments/EditDepartment";

/* ---------- Guards ---------- */

// for /institution/dashboard, /institution/profile
const InstitutionProtected = ({ children }) => {
  const { isAuthenticated, authChecked } = useSelector(
    (s) => s.auth.institution
  );

  if (!authChecked) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/institution/login" replace />;
  }

  return children;
};

// for /institution/login, register, etc
const InstitutionAuthPublic = ({ children }) => {
  const { isAuthenticated, authChecked } = useSelector(
    (s) => s.auth.institution
  );

  if (!authChecked) return <Loader />;

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
      <Route    // For SideBar Outlet
        element={
          <InstitutionProtected>
            <DashboardLayout />
          </InstitutionProtected>
        }
      >
        <Route path="dashboard" element={<InstitutionDashboard />} />
        <Route path="profile" element={<InstitutionProfile />} />

        <Route path="departments/create" element={<CreateDepartment />} />
        <Route path="departments" element={<InstitutionDepartments />} />
        <Route path="departments/edit/:departmentId" element={<EditDepartment />} />

      </Route>

      {/* ====================== ALWAYS PUBLIC ====================== */}
      <Route
        path="verify-email/:token"
        element={
          <VerifyInstitutionEmail />
        }
      />

      {/* FALLBACK */}
      <Route
        path="*"
        element={
          <NotFound />
        }
      />
    </Routes>
  );
};

export default InstitutionRoutes;
