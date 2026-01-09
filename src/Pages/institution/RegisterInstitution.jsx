import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [step, setStep] = useState(1);

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateStep = () => {
    if (step === 1) {
      const { name, code, address, establishedYear, type } = form;
      if (!name || !code || !address || !establishedYear || !type) {
        toast.warn("Complete all institution details");
        return false;
      }
    }

    if (step === 2) {
      const { contactEmail, contactPhone } = form;
      if (!contactEmail || !contactPhone) {
        toast.warn("Complete contact details");
        return false;
      }
    }

    if (step === 3) {
      if (!form.password) {
        toast.warn("Password is required");
        return false;
      }
    }

    return true;
  };

const nextStep = (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!validateStep()) return;
  setStep((s) => s + 1);
};


  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 3) return;
    if (!validateStep()) return;

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
        {/* LEFT */}
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
            Join the ecosystem of modern educational governance.
          </p>

          <div className="mt-10 space-y-6 text-slate-600">
            <Feature icon={ShieldCheck} text="Secure data encryption" />
            <Feature icon={Globe} text="Global accreditation workflows" />
            <Feature icon={Building2} text="Multi-campus support" />
          </div>
        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-xl mx-auto"
        >
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="CampusOne" className="h-20 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Step {step} of 3</h2>
          </div>

          <form onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && step !== 3)
                e.preventDefault();
            }}
            className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <Section title="Institution Details">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Institution Name" icon={Building2} value={form.name} name="name" onChange={handleChange} />
                      <Input label="Institution Code" icon={Hash} value={form.code} name="code" onChange={handleChange} />
                    </div>
                    <Input label="Address" icon={MapPin} value={form.address} name="address" onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Established"
                        icon={Calendar}
                        value={form.establishedYear}
                        name="establishedYear"
                        type="number"
                        onChange={handleChange}
                      />
                      <Select
                        label="Institution Type"
                        value={form.type}
                        name="type"
                        options={["University", "College", "School", "Institute"]}
                        onChange={handleChange}
                      />
                    </div>
                  </Section>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <Section title="Official Contact">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Contact Email" icon={Mail} name="contactEmail" value={form.contactEmail} onChange={handleChange} />
                      <Input label="Contact Phone" icon={Phone} name="contactPhone" value={form.contactPhone} onChange={handleChange} />
                    </div>
                  </Section>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <Section title="Security">
                    <Input
                      label="Set Password"
                      icon={Lock}
                      value={form.password}
                      name="password"
                      type="password"
                      onChange={handleChange}
                    />
                  </Section>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="w-full py-3 rounded-xl border font-semibold">
                  Back
                </button>
              )}

              {step < 3 ? (
                <button type="button" onClick={nextStep} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold">
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Complete Registration"}
                </button>
              )}
            </div>

            <p className="text-xs text-center">
              Already registered?{" "}
              <Link to="/institution/login" className="text-indigo-600 font-semibold">
                Login here
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

/* ===== helpers unchanged ===== */

const Feature = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-indigo-100 rounded-lg">
      <Icon className="w-5 h-5 text-indigo-600" />
    </div>
    <span>{text}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
    {children}
  </div>
);

const Input = ({ label, icon: Icon, name, value, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        name={name}
        value={value}
        {...props}
        className="w-full pl-10 py-2.5 rounded-xl border"
      />
    </div>
  </div>
);


const Select = ({ label, name, value, options, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold">{label}</label>
    <select
      name={name}
      value={value}
      {...props}
      className="w-full py-2.5 rounded-xl border"
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
