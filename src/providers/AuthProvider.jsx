import { createContext, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  institutionLoginSuccess,
  institutionLogout,
  institutionAuthChecked,
  userLoginSuccess,
  userLogout,
  userAuthChecked,
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

    if (authExcludedRoutes.some((route) => url?.includes(route))) {
      return res;
    }

    try {
      const refreshUrl = "/api/institutions/refresh";

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

        if (currentPath !== "/") {
          toast.error("Session Expired, login again")
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

  /* ================= INITIAL SYNC ================= */

  useEffect(() => {
    verifyInstitution();
    verifyUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loginInstitution,
        loginUser,
        logoutInstitution,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
