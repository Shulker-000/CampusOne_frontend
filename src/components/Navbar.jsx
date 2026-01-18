// components/Navbar.jsx

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X, ChevronDown } from "lucide-react";

/* ---------------- MOBILE MENU ---------------- */

const MobileMenu = ({ open, onClose, links, actions }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
        <div className="h-16 px-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="h-8" alt="CampusOne" />
            <span className="font-bold text-lg">CampusOne</span>
          </div>

          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {links.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              onClick={onClose}
              className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100"
            >
              {r.label}
            </Link>
          ))}
        </div>

        {actions?.length > 0 && (
          <div className="border-t p-4 space-y-3">
            {actions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                onClick={onClose}
                className={a.className}
              >
                {a.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- PUBLIC NAVBAR (hooks live here) ---------------- */

const PublicNavbar = () => {
  // ✅ hooks are ALWAYS called because this component is only rendered when needed
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const centerLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const dropdownItems = [
    { label: "Student", to: "/student/login" },
    { label: "Faculty", to: "/faculty/login" },
    { label: "Institution", to: "/institution/login" },
  ];

  const mobileActions = [
    {
      label: "Login as Student",
      to: "/student/login",
      className:
        "block bg-blue-700 text-center text-white px-4 py-3 rounded-lg font-medium",
    },
    {
      label: "Login as Faculty",
      to: "/faculty/login",
      className:
        "block text-center px-4 py-3 bg-gray-100 rounded-lg font-medium",
    },
  ];

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  useEffect(() => {
    if (isMobile) return;

    const resetTimer = () => {
      setVisible(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setVisible(false), 3000);
    };

    const events = ["mousemove", "scroll", "keydown"];

    events.forEach((e) => {
      window.addEventListener(e, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timeoutRef.current);
    };
  }, [isMobile]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAuthOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 w-full z-50
          transition-all duration-500 ease-out
          ${!isMobile && !visible ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}
        `}
      >
        <div className="h-16 px-6 flex items-center backdrop-blur-xl bg-white/30 border-b border-white/20">
          {/* LEFT */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" className="h-8" alt="CampusOne" />
            <span className="font-bold text-lg">CampusOne</span>
          </Link>

          {/* CENTER */}
          <div className="hidden lg:flex flex-1 justify-center gap-10 text-sm font-semibold">
            {centerLinks.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="text-slate-700 hover:text-indigo-600"
              >
                {r.label}
              </Link>
            ))}
          </div>

          {/* RIGHT */}
          <div
            className="ml-auto hidden lg:flex items-center gap-4 relative"
            ref={dropdownRef}
          >
            <button
              onClick={() => setAuthOpen((v) => !v)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
            >
              Sign in
              <ChevronDown className="w-4 h-4" />
            </button>

            {authOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl overflow-hidden">
                {dropdownItems.map((i) => (
                  <Link
                    key={i.to}
                    to={i.to}
                    onClick={() => setAuthOpen(false)}
                    className="block px-4 py-3 text-sm hover:bg-indigo-50"
                  >
                    {i.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* MOBILE */}
          <button
            className="ml-auto lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={centerLinks}
        actions={mobileActions}
      />
    </>
  );
};

/* ---------------- NAVBAR GATE (NO hooks, only auth logic) ---------------- */

const Navbar = () => {
  const { institution, user } = useSelector((s) => s.auth);

  if (!institution.authChecked || !user.authChecked) return null;

  // ✅ as you wanted: logged in -> show nothing
  if (institution.isAuthenticated || user.isAuthenticated) return null;

  // only public users see navbar
  return <PublicNavbar />;
};

export default Navbar;
