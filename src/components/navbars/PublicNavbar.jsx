import BaseNavbar from "./BaseNavbar";

const PublicNavbar = () => {
  return (
    <BaseNavbar
      logoLink="/"
      centerLinks={[
        { label: "Home", to: "/" },
        { label: "About", to: "/about" },
        { label: "Contact", to: "/contact" },
      ]}
      actions={{
        type: "dropdown",
        label: "Sign in",
        items: [
          { label: "Individual", to: "/login" },
          { label: "Institution", to: "/institution/login" },
        ],
        mobile: [
          {
            label: "Register Institution",
            to: "/institution/register",
            className:
              "block text-center px-4 py-3 bg-gray-100 rounded-lg font-medium",
          },
        ],
      }}
    />
  );
};

export default PublicNavbar;
