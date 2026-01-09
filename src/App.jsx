import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import LandingPage from "./Pages/general/LandingPage";
import AboutPage from "./Pages/general/AboutPage";
import ContactPage from "./Pages/general/ContactPage";
import NotFound from "./Pages/general/NotFound";
import Navbar from "./components/Navbar";

import InstitutionRoutes from "./routes/InstitutionRoutes";
import {
  institutionLoginSuccess,
  institutionLogout,
} from "./features/authSlice";

const App = () => {
  const dispatch = useDispatch();

  const { isAuthenticated, authChecked } = useSelector(
    (state) => state.auth.institution
  );

  useEffect(() => {
    const checkInstitutionAuth = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/institutions/current-institution`,
          { credentials: "include" }
        );

        if (!res.ok) {
          dispatch(institutionLogout());
          return;
        }

        const data = await res.json();
        dispatch(
          institutionLoginSuccess({
            institution: data.data,
            token: null,
          })
        );
      } catch {
        dispatch(institutionLogout());
      }
    };

    checkInstitutionAuth();
  }, [dispatch]);

  // ⛔ Block rendering until auth state is resolved
  if (!authChecked) {
    return null; // or global loader
  }

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* ROOT */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/institution/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* GENERAL PUBLIC */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* INSTITUTION */}
        <Route path="/institution/*" element={<InstitutionRoutes />} />

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
