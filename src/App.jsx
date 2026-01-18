import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader.jsx";

import InstitutionRoutes from "./routes/InstitutionRoutes";
// import UserRoutes from "./routes/UserRoutes";

const App = () => {
  const institutionAuth = useSelector((s) => s.auth.institution);
  const userAuth = useSelector((s) => s.auth.user);

  if (!institutionAuth.authChecked || !userAuth.authChecked) {
    return <Loader text="Checking session..." />;
  }

  return (
    <Router>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            institutionAuth.isAuthenticated ? (
              <Navigate to="/institution/dashboard" replace />
            ) : userAuth.isAuthenticated ? (
              userAuth.data?.role ? (
                <Navigate to={`/${userAuth.data.role.toLowerCase()}/dashboard`} replace />
              ) : (
                <Loader text="Loading user..." />
              )
            ) : (
              <LandingPage />
            )
          }
        />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/institution/*" element={<InstitutionRoutes />} />
        {/* <Route path="/*" element={<UserRoutes />} /> */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
