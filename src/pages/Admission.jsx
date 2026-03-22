import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
    Building2,
    GraduationCap,
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    ArrowRight,
    ArrowLeft,
    Loader2,
    LogIn
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ----------------------------- ROOT PAGE ----------------------------- */

const Admissions = () => {

    const [mode, setMode] = useState(null);

    return (

        <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center px-6 py-12">

            {!mode && <StartScreen setMode={setMode} />}

            {mode === "register" && <AdmissionRegister />}

        </section>

    );

};

export default Admissions;

/* ----------------------------- START SCREEN ----------------------------- */

const StartScreen = ({ setMode }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-10 w-full max-w-xl text-center"
        >

            <div className="mb-6">

                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">

                    <GraduationCap className="w-8 h-8 text-indigo-600" />

                </div>

                <h1 className="text-3xl font-bold text-slate-900">
                    Campus Admissions
                </h1>

                <p className="text-slate-600 mt-2">
                    Start a new admission application or continue an existing one
                </p>

            </div>

            <div className="space-y-4">

                <button
                    onClick={() => setMode("register")}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                    <GraduationCap size={18} />
                    Fresh Admission
                </button>

                <button
                    onClick={() => navigate("/admission/login")}
                    className="w-full py-3 rounded-xl border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                    <LogIn size={18} />
                    Login Application
                </button>

            </div>

        </motion.div>

    );
}

/* ----------------------------- REGISTER FORM ----------------------------- */

const AdmissionRegister = () => {

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [institutions, setInstitutions] = useState([]);
    const [branches, setBranches] = useState([]);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const [form, setForm] = useState({

        institutionId: "",
        branchId: "",

        fullName: "",
        fatherName: "",
        motherName: "",

        email: "",
        phone: "",

        dateOfBirth: "",
        gender: "",
        category: "",

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

        aadharNo: "",
        password: "",
        confirmPassword: ""

    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    /* ---------------- FETCH DATA ---------------- */

    useEffect(() => {

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/institutions`)
            .then(r => r.json())
            .then(d => setInstitutions(d.data || []))
            .catch(() => toast.error("Failed to load institutions"));

    }, []);

    useEffect(() => {

        if (!form.institutionId) return;

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${form.institutionId}`)
            .then(r => r.json())
            .then(d => setBranches(d.data || []))
            .catch(() => toast.error("Failed to load branches"));

    }, [form.institutionId]);

    /* ---------------- HANDLE INPUT ---------------- */

    const handleChange = e => {

        let { name, value } = e.target;

        if (name === "email")
            value = value.toLowerCase();

        if (name === "tenthBoard" || name === "twelfthBoard")
            value = value.toUpperCase();

        if (name === "tenthRollNumber" || name === "twelfthRollNumber") {
            value = value.toUpperCase().replace(/[^A-Z0-9/-]/g, "");
        }

        if (name === "phone")
            value = value.replace(/\D/g, "").slice(0, 10);

        if (name === "pincode")
            value = value.replace(/\D/g, "").slice(0, 6);

        if (name === "aadharNo")
            value = value.replace(/\D/g, "").slice(0, 12);

        if (name === "tenthMarks" || name === "twelfthMarks") {

            let num = Number(value);

            if (num > 100) num = 100;
            if (num < 0) num = 0;

            value = num;

        }

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    };

    /* ---------------- VALIDATION ---------------- */

    const validateStep = () => {

        if (step === 1) {
            if (!form.institutionId || !form.branchId) {
                toast.warn("Select institution and branch");
                return false;
            }
        }

        if (step === 2) {
            if (!form.fullName || !form.fatherName || !form.motherName) {
                toast.warn("Enter all personal details");
                return false;
            }
        }

        if (step === 3) {

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                toast.warn("Invalid email");
                return false;
            }

            if (!/^\d{10}$/.test(form.phone)) {
                toast.warn("Phone must be 10 digits");
                return false;
            }

        }

        if (step === 4) {

            if (!form.address || !form.city || !form.state) {
                toast.warn("Enter address details");
                return false;
            }

            if (!/^\d{6}$/.test(form.pincode)) {
                toast.warn("Invalid pincode");
                return false;
            }

        }

        if (step === 5) {

            if (
                form.tenthMarks === "" ||
                !form.tenthBoard ||
                !form.tenthPassingYear ||
                !form.tenthRollNumber ||

                form.twelfthMarks === "" ||
                !form.twelfthBoard ||
                !form.twelfthPassingYear ||
                !form.twelfthRollNumber
            ) {
                toast.warn("Complete academic details");
                return false;
            }

        }

        if (step === 6) {

            if (!/^\d{12}$/.test(form.aadharNo)) {
                toast.warn("Aadhar must be 12 digits");
                return false;
            }

            if (form.password.length < 6) {
                toast.warn("Password must be at least 6 characters");
                return false;
            }

            if (form.password !== form.confirmPassword) {
                toast.warn("Passwords do not match");
                return false;
            }
        }

        return true;

    };

    /* ---------------- NAVIGATION ---------------- */

    const nextStep = e => {
        e.preventDefault();
        if (!validateStep()) return;
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = async e => {

        e.preventDefault();

        if (!validateStep()) return;

        setLoading(true);

        try {

            const payload = {
                ...form,
                tenthMarks: Number(form.tenthMarks),
                twelfthMarks: Number(form.twelfthMarks),
                tenthPassingYear: Number(form.tenthPassingYear),
                twelfthPassingYear: Number(form.twelfthPassingYear)
            };

            delete payload.confirmPassword;

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admissions/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message);
                return;
            }

            setResult(data.data);

        } catch {
            toast.error("Network error");
        }
        finally {
            setLoading(false);
        }

    };

    /* ---------------- SUCCESS SCREEN ---------------- */

    if (result) {

        return (

            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-10 max-w-lg text-center">

                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Application Submitted
                </h2>

                <p className="text-slate-600 mb-6">
                    Save your application number for login
                </p>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">

                    <p className="text-sm text-slate-700">
                        Application Number
                    </p>

                    <p className="text-2xl font-bold text-indigo-600 mt-2">
                        {result.applicationNumber}
                    </p>

                </div>

                <button
                    onClick={() => {
                        navigator.clipboard.writeText(result.applicationNumber);
                        toast.success("Application number copied");
                        navigate("/admission/login")
                    }}
                    className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-lg"
                >
                    Copy & Login
                </button>

            </div>

        );
    }

    /* ---------------- UI ---------------- */

    return (

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 w-full max-w-4xl mx-auto"        >

            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                Admission Application - Step {step}/6
            </h2>

            <form className="space-y-6">

                <AnimatePresence mode="wait">

                    {step === 1 && (

                        <Step>

                            <div className="grid md:grid-cols-2 gap-4">

                                <Select
                                    label="Institution"
                                    name="institutionId"
                                    value={form.institutionId}
                                    onChange={handleChange}
                                    options={institutions.map(i => ({ label: i.name, value: i._id }))}
                                />

                                <Select
                                    label="Branch"
                                    name="branchId"
                                    value={form.branchId}
                                    onChange={handleChange}
                                    options={branches.map(b => ({ label: b.name, value: b._id }))}
                                />

                            </div>

                        </Step>

                    )}

                    {step === 2 && (

                        <Step>

                            <div className="grid md:grid-cols-2 gap-4">

                                <Input label="Full Name" name="fullName" value={form.fullName} placeholder="Your Name" onChange={handleChange} />
                                <Input label="Father Name" name="fatherName" value={form.fatherName} placeholder="Your Father's Name" onChange={handleChange} />
                                <Input label="Mother Name" name="motherName" value={form.motherName} placeholder="Your Mother's Name" onChange={handleChange} />
                                <Input type="date" label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />

                                <Select label="Gender" name="gender" value={form.gender} onChange={handleChange}
                                    options={[
                                        { label: "Male", value: "Male" },
                                        { label: "Female", value: "Female" },
                                        { label: "Other", value: "Other" }
                                    ]}
                                />

                                <Select label="Category" name="category" value={form.category} onChange={handleChange}
                                    options={[
                                        { label: "General", value: "General" },
                                        { label: "OBC", value: "OBC" },
                                        { label: "SC", value: "SC" },
                                        { label: "ST", value: "ST" }
                                    ]}
                                />

                            </div>

                        </Step>

                    )}

                    {step === 3 && (

                        <Step>

                            <div className="grid md:grid-cols-2 gap-4">

                                <Input label="Email" name="email" value={form.email} placeholder="student@email.com" onChange={handleChange} />
                                <Input label="Phone" name="phone" value={form.phone} placeholder="9876543210" maxLength={10} onChange={handleChange} />

                            </div>

                        </Step>

                    )}

                    {step === 4 && (

                        <Step>

                            <div className="grid md:grid-cols-2 gap-4">

                                <Input label="Address" name="address" value={form.address} placeholder="House / Street / Area" onChange={handleChange} />
                                <Input label="City" name="city" value={form.city} placeholder="City" onChange={handleChange} />
                                <Input label="State" name="state" value={form.state} placeholder="State" onChange={handleChange} />
                                <Input label="Pincode" name="pincode" value={form.pincode} placeholder="6 Digit Pincode" maxLength={6} onChange={handleChange} />

                            </div>

                        </Step>

                    )}

                    {step === 5 && (

                        <Step>

                            <div className="space-y-6">

                                {/* -------- 10th Section -------- */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                        10th Academic Details
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4">

                                        <Input
                                            label="Marks (%)"
                                            name="tenthMarks"
                                            value={form.tenthMarks}
                                            type="number"
                                            onChange={handleChange}
                                        />

                                        <Input
                                            label="Board"
                                            name="tenthBoard"
                                            value={form.tenthBoard}
                                            onChange={handleChange}
                                        />

                                        <Input
                                            label="Roll Number"
                                            name="tenthRollNumber"
                                            value={form.tenthRollNumber}
                                            placeholder="Roll No"
                                            onChange={handleChange}
                                        />

                                        <Input
                                            label="Passing Year"
                                            name="tenthPassingYear"
                                            value={form.tenthPassingYear}
                                            type="number"
                                            onChange={handleChange}
                                        />

                                    </div>

                                </div>


                                {/* -------- 12th Section -------- */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                        12th Academic Details
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4">

                                        <Input
                                            label="Marks (%)"
                                            name="twelfthMarks"
                                            value={form.twelfthMarks}
                                            type="number"
                                            onChange={handleChange}
                                        />

                                        <Input
                                            label="Board"
                                            name="twelfthBoard"
                                            value={form.twelfthBoard}
                                            onChange={handleChange}
                                        />

                                        <Input
                                            label="Roll Number"
                                            name="twelfthRollNumber"
                                            value={form.twelfthRollNumber}
                                            placeholder="Roll No"
                                            onChange={handleChange}
                                        />

                                        <Input
                                            label="Passing Year"
                                            name="twelfthPassingYear"
                                            value={form.twelfthPassingYear}
                                            type="number"
                                            onChange={handleChange}
                                        />

                                    </div>

                                </div>

                            </div>

                        </Step>

                    )}

                    {step === 6 && (

                        <Step>

                            <div className="grid md:grid-cols-2 gap-4">

                                <Input label="Aadhar Number" name="aadharNo" value={form.aadharNo} maxLength={12} placeholder="12 Digit Number" onChange={handleChange} type="number" />

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800">
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={form.password}
                                            placeholder="Enter password"
                                            onChange={handleChange}
                                            className="w-full py-2.5 px-3 rounded-xl border border-slate-200"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800">
                                        Confirm Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            placeholder="Re-enter password"
                                            onChange={handleChange}
                                            className="w-full py-2.5 px-3 rounded-xl border border-slate-200"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        >
                                            {showConfirm ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </Step>

                    )}

                </AnimatePresence>

                <div className="flex gap-3">

                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="w-full py-3 border border-slate-300 rounded-xl text-slate-800"
                        >
                            <ArrowLeft className="inline mr-1" />
                            Back
                        </button>
                    )}

                    {step < 6 ? (

                        <button
                            type="button"
                            onClick={nextStep}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold"
                        >
                            Next
                            <ArrowRight className="inline ml-1" />
                        </button>

                    ) : (

                        <button
                            onClick={handleSubmit}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
                        </button>

                    )}

                </div>

            </form>

        </motion.div>

    );

};

/* ---------------- REUSABLE COMPONENTS ---------------- */

const Step = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
    >
        {children}
    </motion.div>
);

const Input = ({ label, icon: Icon, ...props }) => (

    <div className="space-y-1">

        <label className="text-xs font-semibold text-slate-800">
            {label}
        </label>

        <div className="relative">

            {Icon && (
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            )}

            <input
                {...props}
                className="w-full pl-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
            />

        </div>

    </div>

);

const Select = ({ label, options = [], ...props }) => (

    <div className="space-y-1">

        <label className="text-xs font-semibold text-slate-800">
            {label}
        </label>

        <select
            {...props}
            className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
        >

            <option value="">Select</option>

            {options.map(o => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}

        </select>

    </div>

);