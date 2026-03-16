import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const ResetAdmissionPassword = () => {

    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
  const preventRedirect = () => {
    if (window.location.pathname.startsWith("/admission/reset-password")) {
      return;
    }
  };

  preventRedirect();
}, []);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600 font-semibold">
                    Invalid reset link
                </p>
            </div>
        );
    }

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.warn("Fill all fields");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {

            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admissions/reset-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ newPassword: password })
                }
            );

            let data = {};
            try {
                data = await res.json();
            } catch {
                throw new Error("Unexpected server response");
            }

            if (!res.ok) {
                throw new Error(data.message || "Reset failed");
            }

            toast.success("Password reset successful");
            setSuccess(true);

        } catch (err) {

            toast.error(err.message || "Reset failed");

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

                {success ? (

                    <div className="text-center">

                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-600 w-8 h-8" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900">
                            Password Updated
                        </h2>

                        <p className="text-slate-600 mt-2">
                            You can now login with your new password.
                        </p>

                        <button
                            onClick={() => navigate("/admission/login")}
                            className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold"
                        >
                            Go to Login
                        </button>

                    </div>

                ) : (

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="text-center mb-6">

                            <h2 className="text-2xl font-bold text-slate-900">
                                Reset Password
                            </h2>

                            <p className="text-slate-600 mt-1">
                                Enter a new password for your admission account
                            </p>

                        </div>

                        <div className="space-y-1">

                            <label className="text-xs font-semibold text-slate-800">
                                New Password
                            </label>

                            <div className="relative">

                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>

                            </div>

                        </div>

                        <div className="space-y-1">

                            <label className="text-xs font-semibold text-slate-800">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl flex justify-center items-center gap-2 disabled:opacity-60"
                        >

                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                "Reset Password"
                            )}

                        </button>

                    </form>

                )}

            </motion.div>

        </section>

    );

};

export default ResetAdmissionPassword;