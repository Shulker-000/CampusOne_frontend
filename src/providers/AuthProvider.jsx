import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  institutionLoginSuccess,
  institutionLogout,
  userLoginSuccess,
  userLogout,
  setInstitutionAuthChecked,
  setUserAuthChecked,
} from "../redux/authSlice";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const [tokens, setTokens] = useState({
    institutionToken: localStorage.getItem("institutionToken"),
    userToken: localStorage.getItem("userToken"),
  });


  const loginInstitution = (token, data) => {
    localStorage.setItem("institutionToken", token);
    setTokens((prev) => ({ ...prev, institutionToken: token }));
    dispatch(
        institutionLoginSuccess({
          institution: data,
          token,
        })
      );
  };

  const loginUser = (token, data) => {
    localStorage.setItem("userToken", token);
    setTokens((prev) => ({ ...prev, userToken: token }));
    dispatch(
        userLoginSuccess({
          user: data,
          token,
        })
      );
  };


  const logoutInstitution = () => {
    localStorage.removeItem("institutionToken");
    setTokens((prev) => ({ ...prev, institutionToken: null }));
    dispatch(institutionLogout());
  };

  const logoutUser = () => {
    localStorage.removeItem("userToken");
    setTokens((prev) => ({ ...prev, userToken: null }));
    dispatch(userLogout());
  };

  const verifyInstitution = async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/institutions/current-institution`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return logoutInstitution();

      const data = await res.json();

      dispatch(
        institutionLoginSuccess({
          institution: data,
          token,
        })
      );
    } catch {
      logoutInstitution();
    } finally {
      dispatch(setInstitutionAuthChecked());
    }
  };

  const verifyUser = async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/current-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return logoutUser();

      const data = await res.json();

      dispatch(
        userLoginSuccess({
          user: data,
          token,
        })
      );
    } catch {
      logoutUser();
    } finally {
      dispatch(setUserAuthChecked());
    }
  };


  useEffect(() => {
    if (tokens.institutionToken) verifyInstitution(tokens.institutionToken);
    else dispatch(setInstitutionAuthChecked());

    if (tokens.userToken) verifyUser(tokens.userToken);
    else dispatch(setUserAuthChecked());
  }, [tokens.institutionToken, tokens.userToken]);

  return (
    <AuthContext.Provider
      value={{
        loginInstitution,
        loginUser,
        logoutInstitution,
        logoutUser,
        tokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
