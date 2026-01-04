import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";

// ---------------- CONFIG ----------------

const NAV_ROUTES = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

// ---------------- MOBILE MENU ----------------

const MobileMenu = ({
  open,
  onClose,
  isAuthenticated,
  user,
  onLogout,
}) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="h-8" alt="CampusOne" />
            <span className="font-bold text-lg">CampusOne</span>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Routes */}
        <div className="p-4 space-y-2">
          {NAV_ROUTES.map((r) => (
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

        {/* Auth */}
        <div className="border-t p-4 space-y-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/institution/register"
                onClick={onClose}
                className="block text-center px-4 py-3 bg-gray-100 rounded-lg font-medium"
              >
                Register Institution
              </Link>
              <Link
                to="/login"
                onClick={onClose}
                className="block text-center px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium"
              >
                Sign in (Individual)
              </Link>
              <Link
                to="/institution/login"
                onClick={onClose}
                className="block text-center px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium"
              >
                Sign in (Institution)
              </Link>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600">{user?.email}</div>
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-left"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------- NAVBAR ----------------

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = !!user;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const timeoutRef = useRef(null);
  const authRef = useRef(null);

  // Auto-hide (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const resetTimer = () => {
      setVisible(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 3000);
    };

    const events = ["mousemove", "scroll", "keydown"];
    events.forEach((e) =>
      window.addEventListener(e, resetTimer, { passive: true })
    );

    resetTimer();

    return () => {
      events.forEach((e) =>
        window.removeEventListener(e, resetTimer)
      );
      clearTimeout(timeoutRef.current);
    };
  }, [isMobile]);

  // Click outside for auth dropdown
  useEffect(() => {
    const handler = (e) => {
      if (authRef.current && !authRef.current.contains(e.target)) {
        setAuthOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 w-full z-50
          transition-all duration-500 ease-out
          ${!isMobile && !visible ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}
        `}
      >
        <div
          className="
            h-16 px-6 flex items-center
            backdrop-blur-xl
            bg-white/30
            supports-[backdrop-filter]:bg-white/25
            border-b border-white/20
            shadow-[0_4px_30px_rgba(0,0,0,0.04)]
          "
        >
          {/* LEFT */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="h-8" alt="CampusOne" />
            <span className="font-bold text-lg">CampusOne</span>
          </div>

          {/* CENTER (desktop) */}
          <div className="hidden lg:flex flex-1 justify-center gap-10 text-sm font-semibold">
            {NAV_ROUTES.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="text-slate-700 hover:text-indigo-600 transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>

          {/* RIGHT (desktop) */}
          <div className="ml-auto hidden lg:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/institution/register"
                  className="text-sm font-semibold text-slate-700 hover:text-indigo-600"
                >
                  Register
                </Link>

                <div className="relative" ref={authRef}>
                  <button
                    onClick={() => setAuthOpen((v) => !v)}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                  >
                    Sign in
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {authOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 overflow-hidden">
                      <Link
                        to="/login"
                        onClick={() => setAuthOpen(false)}
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50"
                      >
                        Individual
                      </Link>
                      <Link
                        to="/institution/login"
                        onClick={() => setAuthOpen(false)}
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50"
                      >
                        Institution
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            )}
          </div>

          {/* MOBILE BUTTON */}
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
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
