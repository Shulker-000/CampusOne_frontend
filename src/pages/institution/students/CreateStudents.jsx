import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    UserPlus,
    Mail,
    Phone,
    Lock,
    Building2,
    BadgeCheck,
    CalendarDays,
    GraduationCap,
} from "lucide-react";
import ConfirmModal from "../../../components/ConfirmModal";

const CreateStudent = () => {
    const navigate = useNavigate();
    const institutionId = useSelector((s) => s.auth.institution.data?._id);

    const [step, setStep] = useState(1);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [userCreating, setUserCreating] = useState(false);
    const [studentCreating, setStudentCreating] = useState(false);

    const [createdUser, setCreatedUser] = useState(null);

    const [branchesLoading, setBranchesLoading] = useState(true);
    const [branches, setBranches] = useState([]);

    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordEdited, setIsPasswordEdited] = useState(false);

    const getToday = () => new Date().toISOString().split("T")[0];

const today = getToday();

const formatDOBToPassword = (dob) => {
    const [year, month, day] = dob.split("-");
    return `${day}${month}${year}`;
};

const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: formatDOBToPassword(today),
    dob: today,
});

    const [studentForm, setStudentForm] = useState({
        branchId: "",
        enrollmentNumber: "",
        admissionYear: new Date().getFullYear(),
    });

    // ================= VALIDATIONS =================
    const canProceed = useMemo(() => {
        const { name, email, phone, password, dob } = userForm;

        const isPhoneValid = /^\d{10}$/.test(phone);
        const isPasswordValid = password.length >= 8;

        return (
            institutionId &&
            name.trim() &&
            email.trim() &&
            isPhoneValid &&
            isPasswordValid &&
            dob
        );
    }, [userForm, institutionId]);

    const canCreate = useMemo(() => {
        const { branchId, enrollmentNumber, admissionYear } = studentForm;
        return (
            institutionId &&
            createdUser?._id &&
            branchId &&
            enrollmentNumber.trim() &&
            admissionYear
        );
    }, [studentForm, createdUser, institutionId]);

    // ================= FETCH BRANCHES =================
    const fetchBranches = async () => {
        if (!institutionId) return;

        try {
            setBranchesLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${institutionId}`,
                { credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setBranches(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch branches");
        } finally {
            setBranchesLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, [institutionId]);

    // ================= HANDLERS =================
    const handleUserChange = (e) => {
        const { name, value } = e.target;

        setUserForm((p) => ({
            ...p,
            [name]: value,
            ...(name === "dob" && !isPasswordEdited ? { password: formatDOBToPassword(value) } : {})
        }));

        if (name === "password") {
            setIsPasswordEdited(true);
        }
    };

    const handleStudentChange = (e) => {
        setStudentForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const openProceedConfirm = () => {
        if (!canProceed) {
            toast.error("Fill all user details first");
            return;
        }
        setConfirmOpen(true);
    };

    // ================= CREATE USER =================

    const createUser = async () => {
        if (!institutionId) {
            toast.error("Institution not found. Please login again.");
            return;
        }
        if (!/^\d{10}$/.test(userForm.phone)) {
            return toast.error("Phone number must be exactly 10 digits");
        }

        if (userForm.password.length < 8) {
            return toast.error("Password must be at least 8 characters");
        }
        try {
            setUserCreating(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: userForm.name.trim(),
                        email: userForm.email.trim(),
                        phone: userForm.phone.trim(),
                        password: userForm.password.trim(),
                        dob: userForm.dob,
                        role: "Student",
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            if (!data?.data?._id) {
                throw new Error("User created but ID missing");
            }

            setCreatedUser(data.data);
            toast.success("User created successfully");
            setConfirmOpen(false);
            setStep(2);
        } catch (err) {
            toast.error(err.message || "User creation failed");
        } finally {
            setUserCreating(false);
        }
    };

    // ================= CREATE STUDENT =================
    const createStudent = async (e) => {
        e.preventDefault();

        if (!createdUser?._id) {
            toast.error("User not created. Please try again.");
            setStep(1);
            return;
        }

        try {
            setStudentCreating(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/students/create-student`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: createdUser._id,
                        institutionId,
                        branchId: studentForm.branchId,
                        enrollmentNumber: studentForm.enrollmentNumber.trim(),
                        semester: 1,
                        admissionYear: Number(studentForm.admissionYear),
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                // rollback
                try {
                    await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/users/delete/${createdUser._id}`,
                        { method: "DELETE", credentials: "include" }
                    );
                } catch (_) { }

                throw new Error(data.message || "Student creation failed");
            }

            toast.success("Student created successfully");
            navigate("/institution/students", { replace: true });
        } catch (err) {
            toast.error(err.message || "Student creation failed");
            setCreatedUser(null);
            setStep(1);
        } finally {
            setStudentCreating(false);
        }
    };

    // ================= UI =================
    return (
        <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-10 py-8">
            <div className="w-full">

                {/* TOP BAR */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate("/institution/students")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] hover:opacity-80 transition"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>

                {/* PAGE HEADER */}
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-[var(--text)]">
                        Create Student
                    </h1>

                    {/* STEPPER */}
                    <div className="mt-6 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <StepPill active={step === 1} done={step > 1} text="1. Create User" />
                            <div className="h-[2px] flex-1 bg-[var(--border)] opacity-70" />
                            <StepPill active={step === 2} done={false} text="2. Create Student" />
                        </div>
                    </div>

                    {/* STEP CONTENT */}
                    <div className="mt-6">

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="rounded-2xl p-5">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-[var(--muted-text)]" />
                                    User Details
                                </h2>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        openProceedConfirm();
                                    }}
                                    className="mt-5 space-y-5"
                                >
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Full Name"
                                            icon={GraduationCap}
                                            name="name"
                                            value={userForm.name}
                                            onChange={handleUserChange}
                                            placeholder="e.g. Aman Verma"
                                            autoComplete="off"
                                        />

                                        <Input
                                            label="Email"
                                            icon={Mail}
                                            name="email"
                                            type="email"
                                            value={userForm.email}
                                            onChange={handleUserChange}
                                            placeholder="e.g. aman@college.in"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Phone"
                                            icon={Phone}
                                            name="phone"
                                            value={userForm.phone}
                                            onChange={handleUserChange}
                                            placeholder="e.g. 9876543210"
                                            autoComplete="off"
                                        />

                                        <PasswordInput
                                            value={userForm.password}
                                            onChange={handleUserChange}
                                            show={showPassword}
                                            toggle={() => setShowPassword((p) => !p)}
                                        />

                                        <Input
                                            label="Date of Birth"
                                            icon={CalendarDays}
                                            name="dob"
                                            type="date"
                                            value={userForm.dob}
                                            onChange={handleUserChange}
                                            autoComplete="off"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={userCreating || !canProceed}
                                        className="w-full sm:w-1/2 md:w-1/3 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                                    >
                                        {userCreating ? "Please wait..." : "Proceed to Student"}
                                    </button>

                                    <p className="text-[11px] text-[var(--muted-text)]">
                                        You cannot go back once user is created.
                                    </p>
                                </form>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="p-5">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <BadgeCheck className="w-5 h-5 text-[var(--muted-text)]" />
                                    Student Details
                                </h2>

                                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-sm font-semibold text-[var(--text)]">
                                        User Details:
                                    </p>
                                    <p className="text-sm text-[var(--muted-text)] mt-1">
                                        {createdUser?.name || "Student User"} - {createdUser?.email || "N/A"} - {createdUser?.phone || "N/A"}
                                    </p>
                                </div>

                                <form onSubmit={createStudent} className="mt-5 space-y-5">

                                    {/* Branch */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                                            Branch
                                        </label>

                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                                            <select
                                                name="branchId"
                                                value={studentForm.branchId}
                                                onChange={handleStudentChange}
                                                disabled={branchesLoading || studentCreating}
                                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                                            >
                                                <option value="">
                                                    {branchesLoading ? "Loading branches..." : "Select Branch"}
                                                </option>

                                                {branches.map((b) => (
                                                    <option key={b._id} value={b._id}>
                                                        {b.name} ({b.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <Input
                                        label="Enrollment Number"
                                        icon={BadgeCheck}
                                        name="enrollmentNumber"
                                        value={studentForm.enrollmentNumber}
                                        onChange={handleStudentChange}
                                        placeholder="e.g. CSE23001"
                                        autoComplete="off"
                                        disabled={studentCreating}
                                    />

                                    <Input
                                        label="Admission Year"
                                        icon={CalendarDays}
                                        name="admissionYear"
                                        type="number"
                                        value={studentForm.admissionYear}
                                        onChange={handleStudentChange}
                                        placeholder="e.g. 2023"
                                        autoComplete="off"
                                        disabled={studentCreating}
                                    />

                                    <button
                                        type="submit"
                                        disabled={studentCreating || !canCreate}
                                        className="w-full sm:w-1/2 md:w-1/3 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                                    >
                                        {studentCreating ? "Creating..." : "Create Student"}
                                    </button>

                                    <p className="text-[11px] text-[var(--muted-text)]">
                                        If student creation fails, the system will delete the created user automatically.
                                    </p>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CONFIRM MODAL */}
            <ConfirmModal
                open={confirmOpen}
                variant="warning"
                title="Confirm Proceed"
                message="Once the user is created, you will not be able to go back. Continue?"
                confirmText="Yes, Create User"
                cancelText="Cancel"
                loading={userCreating}
                onClose={() => !userCreating && setConfirmOpen(false)}
                onConfirm={createUser}
            >
                <div className="space-y-2">
                    <p className="text-sm font-semibold">User Preview</p>
                    <div className="text-sm text-[var(--muted-text)] space-y-1">
                        <p><span className="font-semibold text-[var(--text)]">Name:</span> {userForm.name || "-"}</p>
                        <p><span className="font-semibold text-[var(--text)]">Email:</span> {userForm.email || "-"}</p>
                        <p><span className="font-semibold text-[var(--text)]">Phone:</span> {userForm.phone || "-"}</p>
                        <p><span className="font-semibold text-[var(--text)]">DOB:</span> {userForm.dob || "-"}</p>
                    </div>
                </div>
            </ConfirmModal>
        </div>
    );
};

const StepPill = ({ active, done, text }) => {
    const base = "px-3 py-2 rounded-xl text-sm font-semibold border";
    const activeCls = "bg-[var(--accent)] text-white border-transparent";
    const doneCls = "bg-[var(--surface-2)] border-[var(--border)]";
    const idleCls = "text-[var(--muted-text)] border-[var(--border)]";

    return <div className={`${base} ${active ? activeCls : done ? doneCls : idleCls}`}>{text}</div>;
};

const Input = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-[var(--muted-text)]">{label}</label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
            <input {...props} className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 bg-[var(--surface-2)]" />
        </div>
    </div>
);

const PasswordInput = ({ value, onChange, show, toggle }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-[var(--muted-text)]">
            Password
        </label>

        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                name="password"
                placeholder="Auto-filled from DOB (editable)"
                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-10 py-2.5 bg-[var(--surface-2)] text-[var(--text)]"
                autoComplete="new-password"
            />

            <button
                type="button"
                onClick={toggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-text)]"
            >
                {show ? "Hide" : "Show"}
            </button>
        </div>
    </div>
);

export default CreateStudent;