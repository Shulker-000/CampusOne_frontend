import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
// faculties
import FacultyLogin from "../pages/user/faculty/FacultyLogin";
import FacultyProfile from "../pages/user/faculty/FacultyProfile";
import FacultyTimetable from "../pages/user/faculty/FacultyTimetable";


// // students
// import StudentLogin from "../pages/user/student/StudentLogin";
// import StudentProfile from "../pages/user/student/StudentProfile";
// import StudentTimetable from "../pages/user/student/StudentTimetable";


// import UserForgotPassword from "../pages/user/UserForgotPassword";
// import UserResetPassword from "../pages/user/UserResetPassword";
// import UserVerifyEmail from "../pages/user/UserVerifyEmail";

import NotFound from "../pages/NotFound";
import Loader from "../components/Loader";
import DashboardLayout from "../layouts/DashboardLayout";
import FacultyCourses from "../pages/user/faculty/FacultyCourses";
import FacultyPrevCourses from "../pages/user/faculty/FacultyPrevCourses";

/* ================= GUARDS ================= */

// Protected routes
const UserProtected = () => {
    const { isAuthenticated, authChecked } = useSelector(
        (s) => s.auth.user
    );

    if (!authChecked) return <Loader />;

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
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

                    {/* Timetable */}
                    <Route path="faculty/timetable" element={<FacultyTimetable />} />

                    {/* Courses */}
                    <Route path="faculty/courses" element={<FacultyCourses />} />
                    <Route path="faculty/prev-courses" element={<FacultyPrevCourses />} />


                    {/* STUDENT */}
                    {/* <Route path="student/profile" element={<StudentProfile />} /> */}
                    {/* <Route path="student/timetable" element={<StudentTimetable />} /> */}

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