import React from "react";
import { useSelector } from "react-redux";

import PublicNavbar from "./navbars/PublicNavbar";
import InstitutionNavbar from "./navbars/InstitutionNavbar";
import UserNavbar from "./navbars/UserNavbar";

const Navbar = () => {
  const { institution, user } = useSelector((s) => s.auth);

  // block until auth resolved
  if (!institution.authChecked) {
    return null;
  }

  if (institution.isAuthenticated) {
    return <InstitutionNavbar />;
  }

  if (user.isAuthenticated) {
    return <UserNavbar />;
  }

  return <PublicNavbar />;
};

export default Navbar;
