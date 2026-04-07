import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import FacultyLogin from "../pages/user/faculty/FacultyLogin";
import FacultyProfile from "../pages/user/faculty/FacultyProfile";

// import StudentLogin from "../pages/user/student/StudentLogin";
// import StudentProfile from "../pages/user/student/StudentProfile";

// import FacultyDashboard from "../pages/user/faculty/FacultyDashboard";
// import StudentDashboard from "../pages/user/student/StudentDashboard";

// import UserForgotPassword from "../pages/user/UserForgotPassword";
// import UserResetPassword from "../pages/user/UserResetPassword";
// import UserVerifyEmail from "../pages/user/UserVerifyEmail";

import NotFound from "../pages/NotFound";
import Loader from "../components/Loader";
import DashboardLayout from "../layouts/DashboardLayout";
import FacultyTimetable from "../pages/user/faculty/FacultyTimetable";

/* ================= GUARDS ================= */

// Protected routes
const UserProtected = () => {
    const { isAuthenticated, authChecked } = useSelector(
        (s) => s.auth.user
    );

    if (!authChecked) return <Loader />;

    if (!isAuthenticated) {
        return <Navigate to="/user/faculty/login" replace />;
    }

    return <Outlet />;
};

// Public routes (login etc)
const UserAuthPublic = ({ children }) => {
    const { isAuthenticated, authChecked } = useSelector(
        (s) => s.auth.user
    );

    if (!authChecked) return <Loader />;

    if (isAuthenticated) {
        return <Navigate to="/user/faculty/profile" replace />;
    }

    return children;
};

/* ================= ROUTES ================= */

const UserRoutes = () => {
    return (
        <Routes>

            {/* ========= AUTH ========= */}
            <Route
                path="faculty/login"
                element={
                    <UserAuthPublic>
                        <FacultyLogin />
                    </UserAuthPublic>
                }
            />

            {/* <Route
                path="student/login"
                element={
                    <UserAuthPublic>
                        <StudentLogin />
                    </UserAuthPublic>
                }
            /> */}

            {/* ========= PROTECTED ========= */}
            <Route element={<UserProtected />}>
                <Route element={<DashboardLayout />}>

                    {/* PROFILE */}
                    <Route path="faculty/profile" element={<FacultyProfile />} />

                    
                    <Route path="faculty/timetable" element={<FacultyTimetable />} />

                    {/* FUTURE STUDENT */}
                    {/* <Route path="student/profile" element={<StudentProfile />} /> */}

                </Route>
            </Route>

            {/* ========= COMMON ========= */}
            {/* <Route path="forgot-password" element={<UserForgotPassword />} />
            <Route path="reset-password/:token" element={<UserResetPassword />} />
            <Route path="verify-email/:token" element={<UserVerifyEmail />} /> */}

            {/* ========= FALLBACK ========= */}
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
};

export default UserRoutes;