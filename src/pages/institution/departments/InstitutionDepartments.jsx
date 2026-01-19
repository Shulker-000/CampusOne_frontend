import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
    Mail,
    Hash,
    Pencil,
    Trash2,
    Search,
    User2,
    BadgeCheck,
    Plus,
    ArrowRight,
    Loader2,
} from "lucide-react";
import ConfirmModal from "../../../components/ConfirmModal";
import Loader from "./../../../components/Loader.jsx"

const InstitutionDepartments = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = useSelector((s) => s.auth.institution.token);

    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [query, setQuery] = useState("");

    const [confirmState, setConfirmState] = useState({
        open: false,
        departmentId: null,
        departmentName: "",
    });
    const [deleting, setDeleting] = useState(false);

    const fetchDepartments = async () => {
        if (!institutionId) return;
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
                { headers: { Authorization: `Bearer ${institutionToken}` } }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch departments");
            setDepartments(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch departments");
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculties = async () => {
        if (!institutionId) return;
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/institution/${institutionId}`,
                { headers: { Authorization: `Bearer ${institutionToken}` } }
            );
            const data = await res.json();
            setFaculties(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("Faculty fetch error", err);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchFaculties();
    }, [institutionId]);

    const facultyById = useMemo(() => {
        const map = new Map();
        faculties.forEach((f) => map.set(f._id, f));
        return map;
    }, [faculties]);

    const filteredDepartments = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return departments;
        return departments.filter((d) => {
            const hodFacultyId = d?.headOfDepartment?._id || d?.headOfDepartment || null;
            const hodFaculty = hodFacultyId ? facultyById.get(hodFacultyId) : null;
            const hodUser = hodFaculty?.userId;
            return (
                (d?.name || "").toLowerCase().includes(q) ||
                (d?.code || "").toLowerCase().includes(q) ||
                (d?.contactEmail || "").toLowerCase().includes(q) ||
                (hodUser?.name || "").toLowerCase().includes(q)
            );
        });
    }, [departments, query, facultyById]);

    const askDeleteDepartment = (dept) => {
        setConfirmState({
            open: true,
            departmentId: dept._id,
            departmentName: dept.name || "this department",
        });
    };

    const deleteDepartment = async () => {
        if (!confirmState.departmentId) return;

        try {
            setDeleting(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/delete-department/${confirmState.departmentId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${institutionToken}` },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");

            toast.success("Department removed");
            setDepartments((prev) => prev.filter((d) => d._id !== confirmState.departmentId));

            setConfirmState({ open: false, departmentId: null, departmentName: "" });
        } catch (err) {
            toast.error(err.message || "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-[var(--bg)]">
                <Loader/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-6xl mx-auto px-5 py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Departments</h1>
                        <p className="text-[var(--muted-text)] text-sm mt-1">
                            View and manage your institution departments.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search departments..."
                                className="pl-10 pr-4 py-2.5 w-full sm:w-72 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition text-sm text-[var(--text)]"
                            />
                        </div>

                        <button
                            onClick={() => navigate("/institution/departments/create")}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                            type="button"
                        >
                            <Plus size={18} />
                            Add Department
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                {filteredDepartments.length === 0 ? (
                    <div className="border border-[var(--border)] rounded-2xl p-10 text-center bg-[var(--surface-2)]">
                        <h3 className="text-lg font-semibold text-[var(--text)]">No departments found</h3>
                        <p className="text-[var(--muted-text)] text-sm mt-1">
                            Try a different search keyword.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredDepartments.map((dept) => {
                            const hodId = dept?.headOfDepartment?._id || dept?.headOfDepartment;
                            const hod = facultyById.get(hodId);
                            const user = hod?.userId;

                            return (
                                <motion.div
                                    layout
                                    key={dept._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-[var(--shadow)] transition"
                                >
                                    {/* Top */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold truncate text-[var(--text)]">
                                                {dept.name}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted-text)]">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg font-semibold">
                                                    <Hash size={12} />
                                                    {dept.code}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => navigate(`/institution/departments/edit/${dept._id}`)}
                                                className="p-2 rounded-lg hover:bg-[var(--hover)] text-[var(--muted-text)] hover:text-[var(--text)] transition"
                                                title="Edit"
                                                type="button"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button
                                                onClick={() => askDeleteDepartment(dept)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted-text)] hover:text-red-500 transition"
                                                title="Delete"
                                                type="button"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center gap-2 text-sm text-[var(--muted-text)] mt-4">
                                        <Mail size={14} className="text-[var(--muted-text)]" />
                                        <span className="truncate">{dept.contactEmail}</span>
                                    </div>

                                    {/* HOD */}
                                    <div className="mt-4 p-3 flex items-center gap-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]"
                                                alt=""
                                                onError={(e) => {
                                                    e.currentTarget.src = "/user.png";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--muted-text)]">
                                                <User2 size={18} />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] text-[var(--muted-text)] font-semibold">
                                                HOD
                                            </p>
                                            <p className="text-sm font-semibold truncate text-[var(--text)]">
                                                {user?.name || "Unassigned"}
                                            </p>
                                        </div>

                                        {user && <BadgeCheck className="w-5 h-5 text-emerald-500" />}
                                    </div>

                                    {/* Bottom */}
                                    <button
                                        onClick={() => navigate(`/institution/departments/edit/${dept._id}`)}
                                        className="w-full mt-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
                    hover:bg-[var(--text)] hover:text-[var(--bg)] transition font-semibold text-sm flex items-center justify-center gap-2"
                                        type="button"
                                    >
                                        Edit Details
                                        <ArrowRight size={16} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmModal
                open={confirmState.open}
                title="Delete Department?"
                message={`This will permanently delete "${confirmState.departmentName}". This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
                onClose={() =>
                    !deleting &&
                    setConfirmState({ open: false, departmentId: null, departmentName: "" })
                }
                onConfirm={deleteDepartment}
            />

        </div>
    );
};

export default InstitutionDepartments;
