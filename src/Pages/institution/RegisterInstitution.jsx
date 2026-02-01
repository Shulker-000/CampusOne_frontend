import React, { useEffect, useRef, useState } from "react";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";

const RegisterInstitution = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

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

  const [codeStatus, setCodeStatus] = useState({
    checking: false,
    exists: false,
    checked: false,
  });

  const [showValidity, setShowValidity] = useState(false);
  const lastCheckedRef = useRef(null);

  const abortRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));

    if (name === "code") {
  if (value.trim().length < 2) {
    setCodeStatus({ checking: false, exists: false, checked: false });
    lastCheckedRef.current = null;
  }
}
  };

  const validateStep = () => {

    if (step === 1) {
      // 1. enforce code check completion
      if (!codeStatus.checked) {
        toast.warn("Please wait for institution code validation");
        return false;
      }

      // 2. enforce uniqueness
      if (codeStatus.exists) {
        toast.warn("Institution code already exists");
        return false;
      }

      const { name, code, address, establishedYear, type } = form;

      if (!name.trim() || !code.trim() || !address.trim() || !type.trim()) {
        toast.warn("Complete all institution details");
        return false;
      }

      const y = Number(establishedYear);
      const currentYear = new Date().getFullYear();
      if (!y || y < 1800 || y > currentYear) {
        toast.warn("Enter a valid established year");
        return false;
      }
    }

    if (step === 2) {
      const { contactEmail, contactPhone } = form;
      if (!contactEmail.trim() || !contactPhone.trim()) {
        toast.warn("Complete contact details");
        return false;
      }
      if (!/^[0-9]{10}$/.test(contactPhone)) {
        toast.warn("Enter a valid 10-digit phone number");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
        toast.warn("Enter a valid email");
        return false;
      }
    }

    if (step === 3) {
      if (!form.password.trim()) {
        toast.warn("Password is required");
        return false;
      }
      if (form.password.length < 6) {
        toast.warn("Password must be at least 6 characters");
        return false;
      }
    }

    return true;
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 3 || !validateStep()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/institutions/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

const checkInstitutionCode = async (code) => {
  const trimmed = code.trim();
  if (!trimmed) return;

  if (lastCheckedRef.current === trimmed) return;
  lastCheckedRef.current = trimmed;


    // cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setCodeStatus({ checking: true, exists: false, checked: false });

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/institutions/code-exists`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: trimmed }),
          signal: controller.signal,
        }
      );

      const data = await res.json();

      // stale response guard
      if (form.code.trim() !== trimmed) return;

      if (!res.ok) {
        setCodeStatus({ checking: false, exists: false, checked: false });
        return;
      }

      setCodeStatus({
        checking: false,
        exists: Boolean(data?.data?.exists),
        checked: true,
      });
      setShowValidity(true);

    } catch (err) {
      if (err.name === "AbortError") return;
      setCodeStatus({ checking: false, exists: false, checked: false });
    } finally {
  abortRef.current = null;
}

  };


  useEffect(() => {
    const code = form.code.trim();

   if (code.length < 2) {
  lastCheckedRef.current = null;
  setCodeStatus({ checking: false, exists: false, checked: false });
  setShowValidity(false);
  return;
}


    checkInstitutionCode(code);

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [form.code]);

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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black">
            Empower your
            <br />
            <span className="text-indigo-600">Institution</span>
          </h1>

          <p className="mt-6 text-lg text-slate-700 max-w-xl">
            Join the ecosystem of modern educational governance.
          </p>

          <div className="mt-10 space-y-6">
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
          className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-xl mx-auto text-slate-900"
        >
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="CampusOne" className="h-20 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-slate-900">
              Step {step} of 3
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && step !== 3) e.preventDefault();
            }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              {step === 1 && (
                <Step>
                  <Section title="Institution Details">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Institution Name"
                        icon={Building2}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Name"
                      />

                      <div>
                        <Input
                          label="Institution Code"
                          icon={Hash}
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          placeholder="CODE"
                        />

                        {showValidity && (codeStatus.checking || codeStatus.checked) && (
                          <p
                            className={`text-xs mt-1 ${codeStatus.exists ? "text-red-500" : "text-green-600"
                              }`}
                          >
                            {codeStatus.checking
                              ? "Checking availability..."
                              : codeStatus.exists
                                ? "Institution code already exists"
                                : "Institution code available"}
                          </p>
                        )}

                      </div>

                      <Input
                        label="Address"
                        icon={MapPin}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="address"
                      />

                      <Input
                        label="Established"
                        icon={Calendar}
                        name="establishedYear"
                        type="number"
                        value={form.establishedYear}
                        onChange={handleChange}
                        placeholder="YYYY"
                      />

                      <Select
                        label="Institution Type"
                        name="type"
                        value={form.type}
                        options={["University", "College", "School", "Institute"]}
                        onChange={handleChange}
                      />
                    </div>
                  </Section>
                </Step>
              )}

              {step === 2 && (
                <Step>
                  <Section title="Official Contact">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Contact Email"
                        icon={Mail}
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleChange}
                        placeholder="admin@abc.edu"
                      />

                      <Input
                        label="Contact Phone"
                        icon={Phone}
                        name="contactPhone"
                        value={form.contactPhone}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            contactPhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                          }))
                        }
                        placeholder="9876543210"
                      />

                    </div>
                  </Section>
                </Step>
              )}

              {step === 3 && (
                <Step>
                  <Section title="Security">
                    <PasswordInput
                      label="Set Password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      placeholder="Minimum 6 characters"
                    />

                  </Section>
                </Step>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full py-3 rounded-xl border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50"
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
  codeStatus.checking ||
  (showValidity && !codeStatus.checked) ||
  codeStatus.exists
}

                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-60"
                >
                  Next
                </button>


              ) : (
                <button
                  type="submit"
                  disabled={codeStatus.exists || codeStatus.checking}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              )}
            </div>

            <p className="text-xs text-center text-slate-700">
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

/* ===== helpers ===== */

const Step = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
  >
    {children}
  </motion.div>
);

const Feature = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3 text-slate-700">
    <div className="p-2 bg-indigo-100 rounded-lg">
      <Icon className="w-5 h-5 text-indigo-600" />
    </div>
    <span className="font-medium">{text}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
      {title}
    </h3>
    {children}
  </div>
);

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-800">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        {...props}
        className="w-full pl-10 py-2.5 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
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
    <label className="text-xs font-semibold text-slate-800">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-800">{label}</label>
    <select
      {...props}
      className="w-full py-2.5 rounded-xl border border-slate-200 bg-white/60 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Select Type</option>
      {options.map((o) => (
        <option key={o} value={o} className="text-slate-900">
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default RegisterInstitution;
