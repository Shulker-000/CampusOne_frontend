// src/pages/institution/branches/EditBranch.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Layers } from "lucide-react";
import Loader from "./../../../components/Loader.jsx"

const EditBranch = () => {
    const navigate = useNavigate();
    const { branchId } = useParams();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = useSelector((s) => s.auth.institution.token);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [branch, setBranch] = useState(null);

    const [departments, setDepartments] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        code: "",
        departmentId: "",
    });

    const fetchBranch = async () => {
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/branches/${branchId}`,
                { credentials: "include"}
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch branch");

            const b = data.data;
            setBranch(b);

            setForm({
                name: b?.name || "",
                code: b?.code || "",
                departmentId: b?.departmentId || "",
            });
        } catch (err) {
            toast.error(err.message || "Failed to load branch");
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        if (!institutionId) return;

        try {
            setDepartmentsLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
                { credentials: "include" }
            );

            const data = await res.json();
            setDepartments(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error("Failed to fetch departments");
        } finally {
            setDepartmentsLoading(false);
        }
    };

    useEffect(() => {
        if (!branchId) return;
        fetchBranch();
        fetchDepartments();
    }, [branchId, institutionId]);

    const departmentById = useMemo(() => {
        const map = new Map();
        departments.forEach((d) => map.set(d._id, d));
        return map;
    }, [departments]);

    const currentDept = form.departmentId ? departmentById.get(form.departmentId) : null;

    const handleChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        const { name, code, departmentId } = form;

        if (!name.trim() || !code.trim() || !departmentId) {
            toast.error("All fields are required");
            return;
        }

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setSaving(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/branches/${branchId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        credentials: "include",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        code: code.trim(),
                        departmentId,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");

            toast.success("Branch updated");
            navigate("/institution/branches", { replace: true });
        } catch (err) {
            toast.error(err.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Loader />
        );
    }

    if (!branch) return null;

    return (
        <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-10 py-8">
            <div className="w-full">
                {/* Top Bar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] hover:opacity-80 transition"
                        type="button"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                        type="button"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                >
                    <h1 className="text-xl font-bold text-[var(--text)]">Edit Branch</h1>
                    <p className="text-sm text-[var(--muted-text)] mt-1">
                        Update branch details and change its department.
                    </p>

                    <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-4xl">
                        <Field label="Branch Name" name="name" value={form.name} onChange={handleChange} />
                        <Field label="Branch Code" name="code" value={form.code} onChange={handleChange} />

                        {/* Department Select */}
                        <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                                Department
                            </label>

                            <div className="relative">
                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                                <select
                                    name="departmentId"
                                    value={form.departmentId}
                                    onChange={handleChange}
                                    disabled={departmentsLoading}
                                    className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
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

                            {currentDept && (
                                <p className="text-[11px] text-[var(--muted-text)]">
                                    Current department:{" "}
                                    <span className="font-semibold text-[var(--text)]">
                                        {currentDept.name}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const Field = ({ label, ...props }) => {
    return (
        <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                {label}
            </label>
            <input
                {...props}
                className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted-text)]"
            />
        </div>
    );
};

export default EditBranch;
