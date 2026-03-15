import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { GraduationCap, Lock, Hash, Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../providers/AuthProvider.jsx";

const AdmissionsLogin = () => {

    const navigate = useNavigate();

    const { loginAdmission } = useAuth();

    const admissionAuth = useSelector((s) => s.auth.admission);

    if (!admissionAuth.authChecked) return <Loader />;

    const [form, setForm] = useState({
        applicationNumber: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: name === "applicationNumber" ? value.toUpperCase() : value
        }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.applicationNumber || !form.password) {
            toast.warn("Enter application number and password");
            return;
        }

        setLoading(true);

        try {

            await loginAdmission(form);

            toast.success("Login successful");

            navigate("/admissions/dashboard");

        } catch (err) {

            toast.error(err.message || "Login failed");

        } finally {

            setLoading(false);

        }

    };

    return (

        <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center px-6">

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-3xl shadow-xl p-10 w-full max-w-md"
            >

                <div className="text-center mb-8">

                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8 text-indigo-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900">
                        Admission Login
                    </h2>

                    <p className="text-slate-600 mt-1">
                        Access your admission application
                    </p>

                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="space-y-1">

                        <label className="text-xs font-semibold text-slate-800">
                            Application Number
                        </label>

                        <div className="relative">

                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                            <input
                                name="applicationNumber"
                                value={form.applicationNumber}
                                onChange={handleChange}
                                placeholder="Enter application number"
                                className="w-full pl-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                        </div>

                    </div>

                    <div className="space-y-1">

                        <label className="text-xs font-semibold text-slate-800">
                            Password
                        </label>

                        <div className="relative">

                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>

                        </div>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl flex justify-center items-center gap-2 disabled:opacity-60"
                    >

                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            "Login"
                        )}

                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/admissions")}
                        className="w-full text-sm text-indigo-600 font-semibold mt-2"
                    >
                        Back to Admissions
                    </button>

                </form>

            </motion.div>

        </section>

    );

};

export default AdmissionsLogin;