import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const InstitutionSpecificAdmission = () => {

  const { institutionId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    institutionId,
    branchId: "",
    fullName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    gender: "",
    category: "",
    aadharNo: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    tenthMarks: "",
    tenthBoard: "",
    tenthRollNumber: "",
    tenthPassingYear: "",
    twelfthMarks: "",
    twelfthBoard: "",
    twelfthRollNumber: "",
    twelfthPassingYear: "",
    password: "",
    confirmPassword: ""
  });

  /* ---------- ROUTE GUARD ---------- */
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/institutions/${institutionId}`)
      .then(r => r.json())
      .then(d => {
        if (!d.data?.isAcceptingApplication) {
          toast.info("This Institution is not accepting new applications currently")
          navigate("/admission/institutions");
        }
      });
  }, [institutionId]);

  /* ---------- FETCH BRANCHES ---------- */
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${institutionId}`)
      .then(r => r.json())
      .then(d => setBranches(d.data || []));
  }, [institutionId]);

  /* ---------- HANDLE INPUT ---------- */
  const handleChange = (e) => {
    let { name, value } = e.target;

    // EMAIL
    if (name === "email") {
      value = value.toLowerCase();
    }

    // BOARD → UPPERCASE
    if (name === "tenthBoard" || name === "twelfthBoard") {
      value = value.toUpperCase().replace(/[^A-Z\s]/g, "");
    }

    // ROLL NUMBER → A-Z 0-9 /
    if (name === "tenthRollNumber" || name === "twelfthRollNumber") {
      value = value.toUpperCase().replace(/[^A-Z0-9/-]/g, "");
    }

    // PHONE → 10 digits
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    // PINCODE → 6 digits
    if (name === "pincode") {
      value = value.replace(/\D/g, "").slice(0, 6);
    }

    // AADHAAR → 12 digits
    if (name === "aadharNo") {
      value = value.replace(/\D/g, "").slice(0, 12);
    }

    // MARKS → 0–100
    if (name === "tenthMarks" || name === "twelfthMarks") {
      value = value.replace(/\D/g, "");
      if (value !== "") {
        value = Math.min(100, Number(value)).toString();
      }
    }

    // YEAR → 4 digits
    if (name === "tenthPassingYear" || name === "twelfthPassingYear") {
      value = value.replace(/\D/g, "").slice(0, 4);
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ---------- NAV ---------- */
  const next = () => {

    if (step === 1) {
      if (
        !form.fullName ||
        !form.fatherName ||
        !form.motherName ||
        !form.dateOfBirth ||
        !form.gender ||
        !form.category ||
        !form.aadharNo ||
        !form.branchId
      ) {
        toast.warn("Fill all required fields");
        return;
      }
    }

    if (step === 2) {
      if (
        !form.email ||
        !form.phone ||
        !form.address ||
        !form.city ||
        !form.state ||
        !form.pincode
      ) {
        toast.warn("Fill all required fields");
        return;
      }
    }

    if (step === 3) {
      if (
        !form.tenthMarks ||
        !form.tenthBoard ||
        !form.tenthRollNumber ||
        !form.tenthPassingYear ||
        !form.twelfthMarks ||
        !form.twelfthBoard ||
        !form.twelfthRollNumber ||
        !form.twelfthPassingYear
      ) {
        toast.warn("Fill academic details");
        return;
      }
    }

    setStep(s => s + 1);
  };
  const prev = () => setStep(s => s - 1);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {

    if (form.password !== form.confirmPassword) {
      toast.warn("Passwords do not match");
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      yearOfAdmission: new Date().getFullYear(),
    };

    delete payload.confirmPassword;

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admissions/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(data);
    if (!res.ok) {
      toast.error(data.message);
      return;
    }
    setResult(data.data);;

    setLoading(false);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-white ">
        <div className="flex justify-center pt-24 px-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-10 max-w-lg text-center">

            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Application Submitted
            </h2>

            <p className="text-slate-600 mb-4">
              Save your application number
            </p>

            <p className="text-2xl font-bold text-indigo-600 mb-4">
              {result.applicationNumber}
            </p>

            {/* COPY BUTTON */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.applicationNumber);
                toast.success("Copied to clipboard");
              }}
              className="px-5 py-2 border border-slate-300 rounded-lg text-slate-800 mr-2"
            >
              Copy
            </button>

            {/* LOGIN BUTTON */}
            <button
              onClick={() => navigate("/admission/login")}
              className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Go to Login
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" >
      <div className="flex justify-center pt-24 px-4">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 w-full max-w-4xl"
        >

          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Admission Application - Step {step}/4
          </h2>

          <AnimatePresence mode="wait">

            {/* STEP 1 */}
            {step === 1 && (
              <Step key="step-1">
                <div className="grid md:grid-cols-2 gap-4">

                  <Input label="Full Name" name="fullName" value={form.fullName} placeholder="Your Name" required onChange={handleChange} />
                  <Input label="Father Name" name="fatherName" value={form.fatherName} placeholder="Father Name" required onChange={handleChange} />
                  <Input label="Mother Name" name="motherName" value={form.motherName} placeholder="Mother Name" required onChange={handleChange} />
                  <Input type="date" label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} required onChange={handleChange} />

                  <Select label="Gender" name="gender" value={form.gender} required onChange={handleChange}
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Others", value: "Others" },
                    ]}
                  />

                  <Select label="Category" name="category" value={form.category} required onChange={handleChange}
                    options={[
                      { label: "General", value: "General" },
                      { label: "OBC", value: "OBC" },
                      { label: "SC", value: "SC" },
                      { label: "ST", value: "ST" }
                    ]}
                  />

                  <Input
                    label="Aadhaar Number"
                    name="aadharNo"
                    value={form.aadharNo}
                    onChange={handleChange}
                    minLength={12}
                    maxLength={12}
                    inputMode="numeric"
                    pattern="\d{12}"
                    placeholder="12 Digit Number"
                    required
                  />

                  <Select label="Branch" name="branchId" value={form.branchId} required onChange={handleChange}
                    options={branches.map(b => ({ label: b.name, value: b._id }))}
                  />

                </div>
              </Step>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <Step key="step-2">
                <div className="grid md:grid-cols-2 gap-4">

                  <Input label="Email" name="email" value={form.email} placeholder="student@email.com" required onChange={handleChange} />
                  <Input
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="9876543210"
                    required
                  />

                  <Input label="Address" name="address" value={form.address} placeholder="House / Street / Area" required onChange={handleChange} />
                  <Input label="City" name="city" value={form.city} placeholder="City" required onChange={handleChange} />
                  <Input label="State" name="state" value={form.state} placeholder="State" required onChange={handleChange} />
                  <Input
                    label="Pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    inputMode="numeric"
                    required
                  />

                </div>
              </Step>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <Step key="step-3">
                <div className="space-y-6">

                  <Section title="10th Academic Details">
                    <Input
                      label="Marks (%)"
                      name="tenthMarks"
                      value={form.tenthMarks}
                      onChange={handleChange}
                      inputMode="numeric"
                      required
                    />
                    <Input
                      label="Board"
                      name="tenthBoard"
                      value={form.tenthBoard}
                      onChange={handleChange}
                      placeholder="CBSE"
                      required
                    />
                    <Input label="Roll Number" name="tenthRollNumber" value={form.tenthRollNumber} required onChange={handleChange} />
                    <Input
                      label="Passing Year"
                      name="tenthPassingYear"
                      value={form.tenthPassingYear}
                      onChange={handleChange}
                      maxLength={4}
                      inputMode="numeric"
                      required
                    />
                  </Section>

                  <Section title="12th Academic Details">
                    <Input
                      label="Marks (%)"
                      name="twelfthMarks"
                      value={form.twelfthMarks}
                      onChange={handleChange}
                      inputMode="numeric"
                      required
                    />

                    <Input
                      label="Board"
                      name="twelfthBoard"
                      value={form.twelfthBoard}
                      onChange={handleChange}
                      placeholder="CBSE"
                      required
                    />
                    <Input
                      label="Roll Number"
                      name="twelfthRollNumber"
                      value={form.twelfthRollNumber}
                      required
                      onChange={handleChange} />

                    <Input
                      label="Passing Year"
                      name="twelfthPassingYear"
                      value={form.twelfthPassingYear}
                      onChange={handleChange}
                      maxLength={4}
                      inputMode="numeric"
                      required
                    />
                  </Section>

                </div>
              </Step>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <Step key="step-4">
                <div className="grid md:grid-cols-2 gap-4">

                  <Input type="password" label="Password" name="password" value={form.password} placeholder="Enter password" required onChange={handleChange} />
                  <Input type="password" label="Confirm Password" name="confirmPassword" value={form.confirmPassword} placeholder="Re-enter password" required onChange={handleChange} />

                </div>
              </Step>
            )}

          </AnimatePresence>

          <div className="flex gap-3 mt-6">

            {step > 1 && (
              <button onClick={prev} className="w-full py-3 border border-slate-300 rounded-xl text-slate-800">
                <ArrowLeft className="inline mr-1" /> Back
              </button>
            )}

            {step < 4 ? (
              <button onClick={next} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold">
                Next <ArrowRight className="inline ml-1" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex justify-center">
                {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
              </button>
            )}

          </div>

        </motion.div>
      </div>
    </div>
  );
};

/* ---------- COMPONENTS ---------- */

const Step = ({ children }) => (
  <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
    {children}
  </motion.div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-800">{label}</label>
    <input {...props} required={props.required} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
  </div>
);

const Select = ({ label, options = [], ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-800">{label}</label>
    <select {...props} required={props.required} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500">
      <option value="">Select</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
    <div className="grid md:grid-cols-2 gap-4">{children}</div>
  </div>
);

export default InstitutionSpecificAdmission;