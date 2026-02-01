import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Building2, Hash, Mail, ArrowLeft, Users } from "lucide-react";

const CreateDepartment = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);

    const [loading, setLoading] = useState(false);

    // faculties dropdown
    const [facultiesLoading, setFacultiesLoading] = useState(true);
    const [faculties, setFaculties] = useState([]);

    const [form, setForm] = useState({
        name: "",
        code: "",
        contactEmail: "",
        headOfDepartment: "", // optional
    });

    const [codeStatus, setCodeStatus] = useState({
        checking: false,
        exists: false,
        checked: false,
    });

    const fetchFaculties = async () => {
        if (!institutionId) return;

        try {
            setFacultiesLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/by-institution/${institutionId}`,
                {
                    credentials: "include",
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch faculties");

            setFaculties(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch faculties");
        } finally {
            setFacultiesLoading(false);
        }
    };

    const checkDepartmentCode = async (code) => {
        const trimmed = code.trim();
        if (!trimmed || !institutionId) return;

        try {
            setCodeStatus({ checking: true, exists: false, checked: false });

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/code-exists`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        institutionId,
                        code: trimmed,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setCodeStatus({
                checking: false,
                exists: Boolean(data?.data?.exists),
                checked: true,
            });
        } catch {
            setCodeStatus({ checking: false, exists: false, checked: false });
        }
    };

    useEffect(() => {
        fetchFaculties();
    }, [institutionId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));

        if (name === "code") {
            setCodeStatus({ checking: false, exists: false, checked: false });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, code, contactEmail, headOfDepartment } = form;

        if (!institutionId || !name.trim() || !code.trim() || !contactEmail.trim()) {
            toast.error("All fields are required");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                institutionId,
                name: name.trim(),
                code: code.trim(),
                contactEmail: contactEmail.trim(),
            };

            if (headOfDepartment) payload.headOfDepartment = headOfDepartment;

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/create-department`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Create failed");

            toast.success("Department created successfully");
            navigate("/institution/departments", { replace: true });
        } catch (err) {
            toast.error(err.message || "Create failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-10 py-8">
            <div className="w-full">
                {/* TOP BAR */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate("/institution/departments")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] hover:opacity-80 transition"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>

                {/* PAGE CONTENT (NO CARD) */}
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Create Department</h1>
                    <p className="text-sm text-[var(--muted-text)] mt-1">
                        Fill all details to create a new department.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-3xl">
                        {/* REQUIRED FIELDS */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Department Name"
                                icon={Building2}
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Computer Science"
                            />

                            <div>
                                <Input
                                    label="Department Code"
                                    icon={Hash}
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
                                    onBlur={(e) => checkDepartmentCode(e.target.value)}
                                    placeholder="e.g. CSE"
                                />

                                {(codeStatus.checked || codeStatus.checking) && (
                                    <p
                                        className={`text-xs mt-1 ${codeStatus.exists ? "text-red-500" : "text-green-600"
                                            }`}
                                    >
                                        {codeStatus.checking
                                            ? "Checking availability..."
                                            : codeStatus.exists
                                                ? "Department code already exists"
                                                : "Department code available"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Input
                            label="Department Contact Email"
                            icon={Mail}
                            name="contactEmail"
                            type="email"
                            value={form.contactEmail}
                            onChange={handleChange}
                            placeholder="e.g. cse@campusone.in"
                        />

                        {/* OPTIONAL HOD */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--muted-text)]">
                                Head of Department (Optional)
                            </label>

                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                                <select
                                    name="headOfDepartment"
                                    value={form.headOfDepartment}
                                    onChange={handleChange}
                                    disabled={facultiesLoading}
                                    className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                                >
                                    <option value="">
                                        {facultiesLoading ? "Loading faculties..." : "Select faculty (optional)"}
                                    </option>

                                    {faculties.map((f) => {
                                        const user = f.userId;
                                        return (
                                            <option key={f._id} value={f._id}>
                                                {user?.name || "Faculty"} - {f.designation || "N/A"}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <p className="text-[11px] text-[var(--muted-text)]">
                                You can skip this and assign HOD later from Edit page.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || codeStatus.exists || codeStatus.checking}
                            className="w-full mt-6 sm:w-1/2 md:w-1/3 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                        >

                            {loading ? "Creating..." : "Create Department"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Input = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-[var(--muted-text)]">{label}</label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
            <input
                {...props}
                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)]"
            />
        </div>
    </div>
);

export default CreateDepartment;
