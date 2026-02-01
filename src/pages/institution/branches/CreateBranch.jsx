// src/pages/institution/branches/CreateBranch.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Building2, Hash, ArrowLeft, Layers } from "lucide-react";

const CreateBranch = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);

    const [loading, setLoading] = useState(false);

    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    const [form, setForm] = useState({
        name: "",
        code: "",
        departmentId: "",
    });

    const [codeStatus, setCodeStatus] = useState({
        checking: false,
        exists: false,
        checked: false,
    });

    const [showValidity, setShowValidity] = useState(false);
    const lastCheckedRef = React.useRef({ code: null });


    const fetchDepartments = async () => {
        if (!institutionId) return;

        try {
            setDepartmentsLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
                { credentials: "include" }
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

    const checkBranchCode = async (code) => {
        const trimmed = code.trim();
        if (!trimmed || !institutionId) return;

        try {
            setCodeStatus({ checking: true, exists: false, checked: false });

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/code-exists`,
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
            setShowValidity(true);
        } catch {
            setCodeStatus({ checking: false, exists: false, checked: false });
        }
    };


    useEffect(() => {
        fetchDepartments();
    }, [institutionId]);

    useEffect(() => {
        const code = form.code.trim();
        if (!code || !institutionId) return;

        if (lastCheckedRef.current.code === code) return;

        lastCheckedRef.current = { code };
        checkBranchCode(code);
    }, [form.code]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({
            ...p,
            [name]: name === "code" ? value.toUpperCase() : value,
        }));

        if (name === "code") {
            setCodeStatus({ checking: false, exists: false, checked: false });
            setShowValidity(false);
            lastCheckedRef.current = { code: null };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, code, departmentId } = form;

        if (!institutionId || !name.trim() || !code.trim() || !departmentId) {
            toast.error("All fields are required");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${institutionId}/branches`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        code: code.trim(),
                        departmentId,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Create failed");

            toast.success("Branch created successfully");
            navigate("/institution/branches", { replace: true });
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
                        onClick={() => navigate("/institution/branches")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] hover:opacity-80 transition"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>

                {/* PAGE CONTENT (no card) */}
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Create Branch</h1>
                    <p className="text-sm text-[var(--muted-text)] mt-1">
                        Create a branch inside a department.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-3xl">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Branch Name"
                                icon={Building2}
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Information Technology"
                            />

                            <div>
                                <Input
                                    label="Branch Code"
                                    icon={Hash}
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
                                    placeholder="e.g. IT"
                                />

                                {showValidity && (codeStatus.checked || codeStatus.checking) && (
                                    <p
                                        className={`text-xs mt-1 ${codeStatus.exists ? "text-red-500" : "text-green-600"
                                            }`}
                                    >
                                        {codeStatus.checking
                                            ? "Checking availability..."
                                            : codeStatus.exists
                                                ? "Branch code already exists"
                                                : "Branch code available"}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* Department (required) */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--muted-text)]">
                                Department
                            </label>

                            <div className="relative">
                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                                <select
                                    name="departmentId"
                                    value={form.departmentId}
                                    onChange={handleChange}
                                    disabled={departmentsLoading}
                                    className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                                >
                                    <option value="">
                                        {departmentsLoading ? "Loading departments..." : "Select department"}
                                    </option>

                                    {departments.map((d) => (
                                        <option key={d._id} value={d._id}>
                                            {d.name} ({d.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <p className="text-[11px] text-[var(--muted-text)]">
                                Branch must belong to a department.
                            </p>
                        </div>

                        <button
                            disabled={loading || codeStatus.exists || codeStatus.checking}
                            className="w-full sm:w-1/2 md:w-1/3 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                            type="submit"
                        >
                            {loading ? "Creating..." : "Create Branch"}
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
                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted-text)]"
            />
        </div>
    </div>
);

export default CreateBranch;
