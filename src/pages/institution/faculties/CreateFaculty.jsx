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

const CreateFaculty = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = useSelector((s) => s.auth.institution.token);

    // Step control: 1 = User, 2 = Faculty
    const [step, setStep] = useState(1);

    // Confirmation modal before proceeding to Faculty step
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Loading states
    const [userCreating, setUserCreating] = useState(false);
    const [facultyCreating, setFacultyCreating] = useState(false);

    // Created user stored in memory (same page only)
    const [createdUser, setCreatedUser] = useState(null); // { _id, name, email, phone ... }

    // Departments
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    // Step-1 form (User)
    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    // Step-2 form (Faculty)
    const [facultyForm, setFacultyForm] = useState({
        departmentId: "",
        designation: "",
        dateOfJoining: "",
    });

    const canProceedToFaculty = useMemo(() => {
        const { name, email, phone, password } = userForm;
        return (
            institutionId &&
            institutionToken &&
            name.trim() &&
            email.trim() &&
            phone.trim() &&
            password.trim()
        );
    }, [userForm, institutionId, institutionToken]);

    const canCreateFaculty = useMemo(() => {
        const { departmentId, designation, dateOfJoining } = facultyForm;
        return (
            institutionId &&
            institutionToken &&
            createdUser?._id &&
            departmentId &&
            designation.trim() &&
            dateOfJoining
        );
    }, [facultyForm, institutionId, institutionToken, createdUser]);

    const fetchDepartments = async () => {
        if (!institutionId) return;

        if (!institutionToken) {
            setDepartmentsLoading(false);
            return;
        }

        try {
            setDepartmentsLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
                {
                    credentials: "include",
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch departments");

            setDepartments(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch departments");
        } finally {
            setDepartmentsLoading(false);
        }
    };

    // Fetch departments once - or you can fetch only when step becomes 2
    useEffect(() => {
        fetchDepartments();
    }, [institutionId]);

    const handleUserChange = (e) => {
        setUserForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleFacultyChange = (e) => {
        setFacultyForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    // Step 1 API: create user
    const createUser = async () => {
        const { name, email, phone, password } = userForm;

        if (!institutionId) {
            toast.error("Institution not found. Please login again.");
            return;
        }
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
            toast.error("All fields are required");
            return;
        }

        try {
            setUserCreating(true);

            const payload = {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password: password.trim(),
                role: "Faculty", // IMPORTANT: ideally backend should hardcode this too
            };

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        credentials: "include",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "User creation failed");

            const user = data?.data;
            if (!user?._id) throw new Error("User created but userId missing");

            setCreatedUser(user);

            toast.success("User created successfully");
            setConfirmOpen(false);
            setStep(2);
        } catch (err) {
            toast.error(err.message || "User creation failed");
        } finally {
            setUserCreating(false);
        }
    };

    // Step 2 API: create faculty, if fail -> delete created user
    const createFaculty = async (e) => {
        e.preventDefault();

        if (!createdUser?._id) {
            toast.error("User not created. Please create user first.");
            setStep(1);
            return;
        }

        const { departmentId, designation, dateOfJoining } = facultyForm;

        if (!institutionId || !institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (!departmentId || !designation.trim() || !dateOfJoining) {
            toast.error("All fields are required");
            return;
        }

        try {
            setFacultyCreating(true);

            const payload = {
                userId: createdUser._id,
                institutionId,
                departmentId,
                designation: designation.trim(),
                dateOfJoining,
            };

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/faculties/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    credentials: "include",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                // rollback: delete created user
                try {
                    await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/user/delete/${createdUser._id}`,
                        {
                            method: "DELETE",
                            headers: {
                                credentials: "include",
                            },
                        }
                    );
                } catch (_) {
                    // do nothing, just report the faculty error (primary)
                }

                throw new Error(data.message || "Faculty creation failed");
            }

            toast.success("Faculty created successfully");
            navigate("/institution/faculties", { replace: true });
        } catch (err) {
            toast.error(err.message || "Faculty creation failed");

            // Reset flow after rollback attempt
            setCreatedUser(null);
            setStep(1);
        } finally {
            setFacultyCreating(false);
        }
    };

    const openProceedConfirm = () => {
        if (!canProceedToFaculty) {
            toast.error("Fill all user details first");
            return;
        }
        setConfirmOpen(true);
    };

    return (
        <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-10 py-8">
            <div className="w-full">
                {/* TOP BAR */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate("/institution/faculties")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] hover:opacity-80 transition"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>

                {/* PAGE HEADER */}
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-[var(--text)]">
                        Create Faculty
                    </h1>
                    <p className="text-sm text-[var(--muted-text)] mt-1">
                        Create user first, then create faculty profile.
                    </p>

                    {/* STEPPER */}
                    <div className="mt-6 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <StepPill active={step === 1} done={step > 1} text="1. Create User" />
                            <div className="h-[2px] flex-1 bg-[var(--border)] opacity-70" />
                            <StepPill active={step === 2} done={false} text="2. Create Faculty" />
                        </div>
                    </div>

                    {/* STEP CONTENT */}
                    <div className="mt-6 max-w-3xl">
                        {/* STEP 1 CARD */}
                        {step === 1 && (
                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] p-5">
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
                                            placeholder="e.g. Rahul Sharma"
                                            autoComplete="off"
                                        />

                                        <Input
                                            label="Email"
                                            icon={Mail}
                                            name="email"
                                            type="email"
                                            value={userForm.email}
                                            onChange={handleUserChange}
                                            placeholder="e.g. rahul@campusone.in"
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

                                        <Input
                                            label="Password"
                                            icon={Lock}
                                            name="password"
                                            type="password"
                                            value={userForm.password}
                                            onChange={handleUserChange}
                                            placeholder="Date of birth in DDMMYYYY format"
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={userCreating || !canProceedToFaculty}
                                        className="w-full sm:w-1/2 md:w-1/3 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                                    >
                                        {userCreating ? "Please wait..." : "Proceed to Faculty"}
                                    </button>

                                    <p className="text-[11px] text-[var(--muted-text)]">
                                        You cannot go back once user is created (as per your flow).
                                    </p>
                                </form>
                            </div>
                        )}

                        {/* STEP 2 CARD */}
                        {step === 2 && (
                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] p-5">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <BadgeCheck className="w-5 h-5 text-[var(--muted-text)]" />
                                    Faculty Details
                                </h2>

                                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-sm font-semibold text-[var(--text)]">
                                        Linked User:
                                    </p>
                                    <p className="text-sm text-[var(--muted-text)] mt-1">
                                        {createdUser?.name || "Faculty User"} - {createdUser?.email || "N/A"} - {createdUser?.phone || "N/A"}
                                    </p>
                                </div>

                                <form onSubmit={createFaculty} className="mt-5 space-y-5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                                            Department
                                        </label>

                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                                            <select
                                                name="departmentId"
                                                value={facultyForm.departmentId}
                                                onChange={handleFacultyChange}
                                                disabled={departmentsLoading || facultyCreating}
                                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                                            >
                                                <option value="">
                                                    {departmentsLoading ? "Loading departments..." : "Select Department"}
                                                </option>

                                                {departments.map((d) => (
                                                    <option key={d._id} value={d._id}>
                                                        {d.name} ({d.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <Input
                                        label="Designation"
                                        icon={BadgeCheck}
                                        name="designation"
                                        value={facultyForm.designation}
                                        onChange={handleFacultyChange}
                                        placeholder="e.g. Assistant Professor"
                                        autoComplete="off"
                                        disabled={facultyCreating}
                                    />

                                    <Input
                                        label="Date of Joining"
                                        icon={CalendarDays}
                                        name="dateOfJoining"
                                        type="date"
                                        value={facultyForm.dateOfJoining}
                                        onChange={handleFacultyChange}
                                        disabled={facultyCreating}
                                    />

                                    <button
                                        type="submit"
                                        disabled={facultyCreating || !canCreateFaculty}
                                        className="w-full sm:w-1/2 md:w-1/3 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                                    >
                                        {facultyCreating ? "Creating..." : "Create Faculty"}
                                    </button>

                                    <p className="text-[11px] text-[var(--muted-text)]">
                                        If faculty creation fails, the system will delete the created user automatically.
                                    </p>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CONFIRM MODAL (before creating user + proceeding) */}
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
                        <p>
                            <span className="font-semibold text-[var(--text)]">Name:</span>{" "}
                            {userForm.name || "-"}
                        </p>
                        <p>
                            <span className="font-semibold text-[var(--text)]">Email:</span>{" "}
                            {userForm.email || "-"}
                        </p>
                        <p>
                            <span className="font-semibold text-[var(--text)]">Phone:</span>{" "}
                            {userForm.phone || "-"}
                        </p>
                    </div>
                </div>
            </ConfirmModal>
        </div>
    );
};

const StepPill = ({ active, done, text }) => {
    const base =
        "px-3 py-2 rounded-xl text-sm font-semibold border transition select-none";
    const activeCls = "bg-[var(--accent)] text-white border-transparent";
    const doneCls =
        "bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]";
    const idleCls =
        "bg-transparent text-[var(--muted-text)] border-[var(--border)]";

    return (
        <div className={`${base} ${active ? activeCls : done ? doneCls : idleCls}`}>
            {text}
        </div>
    );
};

const Input = ({ label, icon: Icon, disabled, ...props }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-[var(--muted-text)]">
            {label}
        </label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
            <input
                {...props}
                disabled={disabled}
                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
            />
        </div>
    </div>
);

export default CreateFaculty;
