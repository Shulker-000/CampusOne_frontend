import BaseNavbar from "./BaseNavbar";

const InstitutionNavbar = () => {
  return (
    <BaseNavbar
      logoLink="/institution/dashboard"
      centerLinks={[
        { label: "Dashboard", to: "/institution/dashboard" },
        { label: "About", to: "/about" },
        { label: "Contact", to: "/contact" },
        { label: "Profile", to: "/institution/profile" },
      ]}
    />
  );
};

export default InstitutionNavbar;
