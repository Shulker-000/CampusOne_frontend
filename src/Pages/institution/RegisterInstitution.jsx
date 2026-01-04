import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  Lock,
  MapPin,
  Calendar,
  Hash,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";

const RegisterInstitution = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    establishedYear: "",
    contactEmail: "",
    contactPhone: "",
    password: "",
    type: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(form).some((v) => !v)) {
      toast.warn("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/institutions/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("Institution registered successfully");
      setTimeout(() => navigate("/institution/login"), 1200);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-linear-to-br from-indigo-50 via-white to-emerald-50 py-12">
      <div className="absolute -top-32 -left-32 w-md h-md bg-indigo-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-md h-md bg-emerald-200/40 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Empower your
            <br />
            <span className="text-indigo-600">Institution</span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-xl">
            Join the ecosystem of modern educational governance. Unified
            management for students, staff, and administrative operations.
          </p>

          <div className="mt-10 space-y-6 text-slate-600">
            <Feature
              icon={ShieldCheck}
              text="Secure data encryption & sovereignty"
            />
            <Feature
              icon={Globe}
              text="Global standard accreditation workflows"
            />
            <Feature
              icon={Building2}
              text="Centralized multi-campus support"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-xl mx-auto"
        >
          <div className="mb-8 text-center lg:text-left">
            <img
              src="/logo.png"
              alt="CampusOne"
              className="h-24 mb-4 mx-auto object-contain"
            />
            <h2 className="text-2xl font-bold text-slate-900">Get Started</h2>
            <p className="text-slate-500 text-sm font-medium">
              Create your institutional profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Section title="Institution Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Institution Name"
                  icon={Building2}
                  name="name"
                  placeholder="Institution Name"
                  onChange={handleChange}
                />
                <Input
                  label="Institution Code"
                  icon={Hash}
                  name="code"
                  placeholder="Code"
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Address"
                icon={MapPin}
                name="address"
                placeholder="Address"
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Established"
                  icon={Calendar}
                  name="establishedYear"
                  type="number"
                  placeholder="YYYY"
                  min="1800"
                  max={new Date().getFullYear()}
                  step="1"
                  onChange={handleChange}
                />

                <Select
                  label="Institution Type"
                  name="type"
                  onChange={handleChange}
                  options={["University", "College", "School", "Institute"]}
                />
              </div>
            </Section>

            <Section title="Official Contact">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Email"
                  icon={Mail}
                  name="contactEmail"
                  placeholder="admin@univ.edu"
                  onChange={handleChange}
                />
                <Input
                  label="Contact Phone"
                  icon={Phone}
                  name="contactPhone"
                  placeholder="Contact Number"
                  onChange={handleChange}
                />
              </div>
            </Section>

            <Section title="Security">
              <Input
                label="Set Password"
                icon={Lock}
                name="password"
                type="password"
                placeholder="******"
                minLength={6}
                onChange={handleChange}
              />
            </Section>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white py-3 font-semibold shadow-md hover:shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <p className="text-xs text-center text-slate-600">
              Already registered?{" "}
              <Link
                to="/institution/login"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

const Feature = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-indigo-100 rounded-lg">
      <Icon className="w-5 h-5 text-indigo-600" />
    </div>
    <span className="font-medium">{text}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1">
    <label className="block text-xs font-semibold text-slate-700 ml-1">
      {label}
    </label>
    <div className="relative group">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="space-y-1">
    <label className="block text-xs font-semibold text-slate-700 ml-1">
      {label}
    </label>
    <select
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
    >
      <option value="">Select Type</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default RegisterInstitution;
