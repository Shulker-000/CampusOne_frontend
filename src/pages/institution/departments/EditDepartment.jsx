import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Save,
    Loader2,
    Users,
    UserRoundCog,
    XCircle,
} from "lucide-react";

const EditDepartment = () => {
    const navigate = useNavigate();
    const { departmentId } = useParams();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = useSelector((s) => s.auth.institution.token);

    const [loading, setLoading] = useState(true);

    const [department, setDepartment] = useState(null);
    const [faculties, setFaculties] = useState([]);

    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        code: "",
        contactEmail: "",
        headOfDepartment: "",
    });

    // ---------- Fetch Department ----------
    const fetchDepartment = async () => {
        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/${departmentId}`
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch department");

            const dept = data.data;
            setDepartment(dept);

            setForm({
                name: dept?.name || "",
                code: dept?.code || "",
                contactEmail: dept?.contactEmail || "",
                headOfDepartment: dept?.headOfDepartment?._id || dept?.headOfDepartment || "",
            });
        } catch (err) {
            toast.error(err.message || "Failed to load department");
        } finally {
            setLoading(false);
        }
    };

    // ---------- Fetch Faculties ----------
    const fetchFaculties = async () => {
        if (!institutionId) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/institution/${institutionId}`,
                {
                    headers: { Authorization: `Bearer ${institutionToken}` },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch faculties");

            setFaculties(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch faculties");
        }
    };

    useEffect(() => {
        if (!departmentId) return;
        fetchDepartment();
    }, [departmentId]);

    useEffect(() => {
        if (!institutionId) return;
        fetchFaculties();
    }, [institutionId]);

    // ---------- Helpers ----------
    const facultyById = useMemo(() => {
        const map = new Map();
        faculties.forEach((f) => map.set(f._id, f));
        return map;
    }, [faculties]);

    const hodFaculty = form.headOfDepartment ? facultyById.get(form.headOfDepartment) : null;
    const hodUser = hodFaculty?.userId;

    // ---------- Inputs ----------
    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ---------- Save ----------
    const handleSave = async () => {
        const { name, code, contactEmail, headOfDepartment } = form;

        if (!name.trim() || !code.trim() || !contactEmail.trim()) {
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
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/update-department/${departmentId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${institutionToken}`,
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        code: code.trim(),
                        contactEmail: contactEmail.trim(),
                        headOfDepartment: headOfDepartment || null,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");

            toast.success("Department updated");
            navigate("/institution/departments", { replace: true });
        } catch (err) {
            toast.error(err.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const removeHod = () => {
        setForm((prev) => ({ ...prev, headOfDepartment: "" }));
    };

    // ---------- UI ----------
    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center font-semibold text-[var(--muted-text)] bg-[var(--bg)]">
                Loading department...
            </div>
        );
    }

    if (!department) return null;

    return (
        <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-10 py-8">
            <div className="w-full">
                {/* Top Bar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => navigate("/institution/departments")}
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

                {/* Page Content */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                >
                    <h1 className="text-xl font-bold text-[var(--text)]">Edit Department</h1>
                    <p className="text-sm text-[var(--muted-text)] mt-1">
                        Update department details and manage Head of Department (HOD).
                    </p>

                    {/* Form */}
                    <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-4xl">
                        <Field
                            label="Department Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                        />

                        <Field
                            label="Department Code"
                            name="code"
                            value={form.code}
                            onChange={handleChange}
                        />

                        <div className="sm:col-span-2">
                            <Field
                                label="Contact Email"
                                name="contactEmail"
                                value={form.contactEmail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* HOD */}
                    <div className="mt-8 border-t border-[var(--border)] pt-6 max-w-4xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={18} className="text-[var(--muted-text)]" />
                            <h2 className="font-bold text-[var(--text)]">Head of Department</h2>
                        </div>

                        {/* Current HOD */}
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                            {hodUser ? (
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-14 w-14 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] shrink-0">
                                            <img
                                                src={hodUser.avatar || "/user.png"}
                                                alt={hodUser.name || "HOD"}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/user.png";
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <p className="font-bold text-[var(--text)]">{hodUser.name}</p>
                                            <p className="text-sm text-[var(--muted-text)]">{hodUser.email}</p>
                                            <p className="text-xs text-[var(--muted-text)] mt-1">
                                                Designation: {hodFaculty?.designation || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={removeHod}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--hover)] transition text-sm font-semibold text-[var(--text)]"
                                        type="button"
                                    >
                                        <XCircle size={16} />
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--muted-text)]">
                                    No HOD assigned yet. Select a faculty below.
                                </p>
                            )}
                        </div>

                        {/* Select */}
                        <div className="mt-4">
                            <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                                Assign / Change HOD
                            </label>

                            <div className="mt-2 flex gap-2">
                                <select
                                    value={form.headOfDepartment}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            headOfDepartment: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface)] text-[var(--text)]"
                                >
                                    <option value="">Select faculty</option>

                                    {faculties.map((f) => {
                                        const user = f.userId;
                                        return (
                                            <option key={f._id} value={f._id}>
                                                {user?.name || "Faculty"} - {f.designation || "N/A"}
                                            </option>
                                        );
                                    })}
                                </select>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="shrink-0 inline-flex items-center gap-2 px-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                                    type="button"
                                >
                                    <UserRoundCog size={16} />
                                    Apply
                                </button>
                            </div>
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
                className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)]"
            />
        </div>
    );
};

export default EditDepartment;
