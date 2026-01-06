import BaseNavbar from "./BaseNavbar";

const UserNavbar = () => {
    return (
        <BaseNavbar
            logoLink="/user/dashboard"
            centerLinks={[
                { label: "Dashboard", to: "/user/dashboard" },
                { label: "Profile", to: "/user/profile" },
            ]}
        />
    );
};

export default UserNavbar;
