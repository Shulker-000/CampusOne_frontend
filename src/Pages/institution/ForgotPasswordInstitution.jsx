import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { toast } from "react-toastify";

const ForgotPasswordInstitution = () => {
  const navigate = useNavigate();
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contactEmail) {
      toast.error("Email is required");
      return;
    }

    // ✅ ADDED (basic validation)
    if (!contactEmail.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/institutions/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactEmail }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setSuccess(true);
      toast.success("Password reset email sent");
    } catch (err) {
      toast.error(err.message || "Failed to send reset email");
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Institution
            <br />
            <span className="text-indigo-600">Account Recovery</span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-xl">
            Enter your registered institutional email to receive a secure
            password reset link.
          </p>

          <div className="mt-10 space-y-4 text-slate-600">
            <Feature icon={ShieldCheck} text="Secure token-based reset" />
            <Feature icon={KeyRound} text="Time-limited reset links" />
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto"
        >
          <div className="mb-4 text-center">
            <img src="/logo.png" alt="CampusOne" className="mx-auto h-10" />
            <h2 className="mt-2 text-xl font-bold">Forgot Password</h2>
            <p className="text-slate-500 text-sm">
              Institution account recovery
            </p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                A reset link has been sent to <b>{contactEmail}</b>
              </p>

              <button
                onClick={() => navigate("/institution/login")}
                className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Registered Institutional Email"
                icon={Mail}
                type="email"
                placeholder="admin@institution.edu"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                disabled={loading}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white py-2.5 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <div className="text-center">
                <Link
                  to="/institution/login"
                  className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Login
                </Link>
              </div>
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
        className="w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  </div>
);

export default ForgotPasswordInstitution;
