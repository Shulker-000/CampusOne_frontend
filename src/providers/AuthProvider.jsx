import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  institutionLoginSuccess,
  institutionLogout,
  userLoginSuccess,
  userLogout,
  setInstitutionAuthChecked,
  setUserAuthChecked,
} from "../features/authSlice";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const loginInstitution = async (data) => {
    dispatch(
      institutionLoginSuccess({
        institution: data.data,
      })
    );
  };

  const loginUser = async (formData) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user/login`, {
      method: "POST",
      credentials: "include",
      body: formData
    });

    if (!res.ok) throw new Error("User login failed");

    const data = await res.json();

    dispatch(
      userLoginSuccess({
        user: data.data,
      })
    );
  };

  const logoutInstitution = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/institution/logout`, {
      method: "POST",
      credentials: "include"
    });

    dispatch(institutionLogout());
  };

  const logoutUser = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user/logout`, {
      method: "POST",
      credentials: "include"
    });

    dispatch(userLogout());
  };

  const verifyInstitution = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/institutions/current-institution`, {
        credentials: "include"
      });

      if (!res.ok) return dispatch(setInstitutionAuthChecked());

      const data = await res.json();

      dispatch(
        institutionLoginSuccess({
          institution: data.data,
        })
      );
    } finally {
      dispatch(setInstitutionAuthChecked());
    }
  };

  const verifyUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/current-user`, {
        credentials: "include"
      });

      if (!res.ok) return dispatch(setUserAuthChecked());

      const data = await res.json();
      dispatch(
        userLoginSuccess({
          user: data.data,
        })
      );
    } finally {
      dispatch(setUserAuthChecked());
    }
  };

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
