import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Loader2,
    ArrowRight,
    Eye,
    EyeOff,
    GraduationCap,
    BookOpen,
    Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useAuth } from "../../../providers/AuthProvider.jsx";
import Loader from "../../../components/Loader.jsx";

const FacultyLogin = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const userAuth = useSelector((s) => s.auth.user);
    if (!userAuth.authChecked) return <Loader />;

    const { loginUser, logoutUser } = useAuth();

    const [form, setForm] = useState({
        identifier: "",
        password: "",
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.identifier || !form.password) {
            toast.warn("All fields are required");
            return;
        }

        setLoading(true);

        try {
            const payload = form.identifier.includes("@")
                ? { email: form.identifier, password: form.password }
                : { phone: form.identifier, password: form.password };

            await loginUser(payload);

            toast.success("Login successful");

            navigate("/user/faculty/profile");

        } catch (err) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative min-h-screen flex items-center bg-linear-to-br from-indigo-50 via-white to-blue-50 py-12">
            {/* Background */}
            <div className="absolute -top-32 -left-32 w-md h-md bg-indigo-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-md h-md bg-blue-200/40 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

                {/* LEFT SIDE */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:block"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-black">
                        Welcome back
                        <br />
                        <span className="text-indigo-600">Faculty Portal</span>
                    </h1>

                    <p className="mt-6 text-lg text-slate-700 max-w-xl">
                        Access your academic dashboard to manage courses, students,
                        attendance, and institutional activities.
                    </p>

                    <div className="mt-10 space-y-6">
                        <Feature icon={GraduationCap} text="Manage your classes & lectures" />
                        <Feature icon={Users} text="Track student performance" />
                        <Feature icon={BookOpen} text="Organize academic resources" />
                    </div>
                </motion.div>

                {/* RIGHT SIDE FORM */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-xl mx-auto"
                >
                    <div className="mb-8 text-center lg:text-left">
                        <img
                            src="/logo.png"
                            alt="CampusOne"
                            className="h-24 mb-4 mx-auto object-contain"
                        />
                        <h2 className="text-2xl font-bold text-slate-900">
                            Faculty Login
                        </h2>
                        <p className="text-sm text-slate-600">
                            Sign in using Email or Phone
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Section title="Credentials">

                            <Input
                                label="Email or Phone"
                                className="text-black"
                                icon={Mail}
                                name="identifier"
                                placeholder="faculty contact"
                                value={form.identifier}
                                onChange={handleChange}
                            />

                            <PasswordInput
                                label="Password"
                                name="password"
                                placeholder="********"
                                value={form.password}
                                onChange={handleChange}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                className="text-black"
                            />

                            <div className="flex justify-end">
                                <Link
                                    to="/user/forgot-password"
                                    className="text-xs font-semibold text-indigo-600 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </Section>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white py-3 font-semibold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-60"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Login
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>

                        <p className="text-xs text-center text-slate-600">
                            Are you a student?{" "}
                            <Link
                                to="/user/student/login"
                                className="text-indigo-600 font-semibold hover:underline"
                            >
                                Student Login
                            </Link>
                        </p>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

/* ================= UI COMPONENTS ================= */

const Feature = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-3 text-slate-700">
        <div className="p-2 bg-indigo-100 rounded-lg">
            <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <span className="font-medium">{text}</span>
    </div>
);

const Section = ({ title, children }) => (
    <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
            {title}
        </h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const Input = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-800 ml-1">
            {label}
        </label>
        <div className="relative group">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input
                {...props}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
        </div>
    </div>
);

const PasswordInput = ({
    label,
    showPassword,
    setShowPassword,
    ...props
}) => (
    <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-800 ml-1">
            {label}
        </label>
        <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

            <input
                {...props}
                type={showPassword ? "text" : "password"}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />

            <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
                {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                ) : (
                    <Eye className="w-4 h-4" />
                )}
            </button>
        </div>
    </div>
);

export default FacultyLogin;