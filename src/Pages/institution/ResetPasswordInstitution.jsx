import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";

const ResetPasswordInstitution = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/institutions/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setSuccess(true);
      toast.success("Password reset successful");
      setTimeout(() => navigate("/institution/login"), 2000);
    } catch (err) {
      toast.error(err.message || "Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-linear-to-br from-indigo-50 via-white to-emerald-50 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-md h-md bg-indigo-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-md h-md bg-emerald-200/40 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <h1 className="text-4xl md:text-5xl font-bold">
            Reset
            <br />
            <span className="text-indigo-600">Institution Password</span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-xl">
            Choose a strong password to restore secure access to your
            institutional dashboard.
          </p>

          <div className="mt-10 space-y-4 text-slate-600">
            <Feature icon={ShieldCheck} text="Encrypted password handling" />
            <Feature icon={CheckCircle2} text="Immediate access restoration" />
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto"
        >
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="CampusOne" className="mx-auto h-10" />
            <h2 className="mt-2 text-xl font-bold">Set New Password</h2>
          </div>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle2 className="mx-auto w-10 h-10 text-emerald-600 mb-3" />
              <p className="text-sm text-slate-700">
                Password updated successfully. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                icon={Lock}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Confirm Password"
                icon={Lock}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white py-2.5 font-semibold disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const Feature = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3">
    <Icon className="w-5 h-5 text-indigo-600" />
    <span>{text}</span>
  </div>
);

const Input = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-slate-700 mb-1 ml-1">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        {...props}
        className="w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  </div>
);

export default ResetPasswordInstitution;
