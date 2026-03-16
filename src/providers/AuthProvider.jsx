import { createContext, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  institutionLoginSuccess,
  institutionLogout,
  institutionAuthChecked,
  userLoginSuccess,
  userLogout,
  userAuthChecked,
  admissionLoginSuccess,
  admissionLogout,
  admissionAuthChecked
} from "../features/authSlice";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

const originalFetch = window.fetch;

let isRefreshing = false;
let refreshPromise = null;
let redirecting = false;

const authExcludedRoutes = [
  "/refresh",
  "/login",
  "/reset-password",
  "/verify-email",
  "/admissions/reset-password",
  "/admissions/verify-email"
];

const refreshAccessToken = async (refreshUrl) => {
  if (!refreshPromise) {
    refreshPromise = originalFetch(
      `${import.meta.env.VITE_BACKEND_URL}${refreshUrl}`,
      {
        method: "POST",
        credentials: "include",
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Refresh failed");
      })
      .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });

    isRefreshing = true;
  }

  return refreshPromise;
};

if (!window.__FETCH_INTERCEPTOR__) {
  window.__FETCH_INTERCEPTOR__ = true;

  window.fetch = async (...args) => {
    let res = await originalFetch(...args);

    if (res.status !== 401) {
      return res;
    }

    const url = args[0]?.url || args[0];

    if (url?.includes("/api/admissions/reset-password")) return res;
    if (url?.includes("/api/admissions/verify-email")) return res;

    if (authExcludedRoutes.some((route) => url?.includes(route))) {
      return res;
    }

    try {

      let refreshUrl = null;

      if (url?.includes("/api/users")) {
        refreshUrl = "/api/users/refresh";
      }
      else if (url?.includes("/api/institutions")) {
        refreshUrl = "/api/institutions/refresh";
      }

      if (!refreshUrl) return res;

      if (!isRefreshing) {
        await refreshAccessToken(refreshUrl);
      } else {
        await refreshPromise;
      }

      res = await originalFetch(...args);
      return res;
    } catch {
      if (!redirecting) {
        redirecting = true;

        const currentPath = window.location.pathname;

        const publicRoutes = [
          "/",
          "/about",
          "/contact",
          "/admission/login",
          "/admission/reset-password",
          "/admission/verify-email"
        ];

        const isPublic = publicRoutes.some((route) =>
          currentPath.startsWith(route)
        );

        if (!isPublic) {
          toast.error("Session Expired, login again");
          window.location.href = "/";
        }
      }

      return res;
    }
  };
};
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  /* ================= INSTITUTION ================= */

  const loginInstitution = async (payload) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/institutions/login`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }

    // IMPORTANT: do NOT dispatch here
    await verifyInstitution(); // backend is source of truth
  };

  const logoutInstitution = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/institutions/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } finally {
      dispatch(institutionLogout());
    }
  };

  const verifyInstitution = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/institutions/current-institution`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        dispatch(institutionLogout());
        dispatch(institutionAuthChecked());
        return;
      }

      const data = await res.json();

      dispatch(
        institutionLoginSuccess({
          institution: data.data,
        })
      );
    } catch {
      dispatch(institutionLogout());
      dispatch(institutionAuthChecked());
    }
  };


  /* ================= USER ================= */

  const loginUser = async (formData) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }

    await verifyUser();
  };

  const logoutUser = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } finally {
      dispatch(userLogout());
    }
  };

  const verifyUser = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/current-user`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        dispatch(userAuthChecked());
        return;
      }

      const data = await res.json();

      dispatch(
        userLoginSuccess({
          user: data.data,
        })
      );
    } catch {
      dispatch(userAuthChecked());
    }
  };


  /* ================= ADMISSION ================= */

  const loginAdmission = async (payload) => {

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admissions/login`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }

    await verifyAdmission();
  };

  const logoutAdmission = async () => {

    try {

      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

    } finally {

      dispatch(admissionLogout());

    }

  };

  const verifyAdmission = async () => {

    try {

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/me`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {

        dispatch(admissionAuthChecked());
        return;

      }

      const data = await res.json();

      dispatch(
        admissionLoginSuccess({
          application: data.data,
        })
      );

    } catch {

      dispatch(admissionAuthChecked());

    }
    
  };

  /* ================= INITIAL SYNC ================= */

  useEffect(() => {

    const path = window.location.pathname;

    const isAdmissionPublicPage =
      path.startsWith("/admission/reset-password") ||
      path.startsWith("/admission/verify-email");

    verifyInstitution();
    verifyUser();

    if (!isAdmissionPublicPage) {
      verifyAdmission();
    }

  }, []);

  return (
    <AuthContext.Provider
      value={{
        loginInstitution,
        loginUser,
        logoutInstitution,
        logoutUser,

        loginAdmission,
        logoutAdmission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
