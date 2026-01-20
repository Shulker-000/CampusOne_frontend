// src/pages/institution/branches/InstitutionBranches.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
    Hash,
    Pencil,
    Trash2,
    Search,
    Plus,
    ArrowRight,
    Loader2,
    Building2,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import ConfirmModal from "../../../components/ConfirmModal";
import Loader from "../../../components/Loader";

const InstitutionBranches = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = useSelector((s) => s.auth.institution.token);

    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [query, setQuery] = useState("");

    const [confirmState, setConfirmState] = useState({
        open: false,
        branchId: null,
        branchName: "",
    });

    const [deleting, setDeleting] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);

    // ================= FETCH BRANCHES =================
    const fetchBranches = async () => {
        if (!institutionId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${institutionId}/branches`,
                { headers: { Authorization: `Bearer ${institutionToken}` } }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch branches");

            setBranches(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch branches");
        } finally {
            setLoading(false);
        }
    };

    // ================= FETCH DEPARTMENTS (for showing dept name) =================
    const fetchDepartments = async () => {
        if (!institutionId) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
                { headers: { Authorization: `Bearer ${institutionToken}` } }
            );

            const data = await res.json();
            setDepartments(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("Department fetch error", err);
        }
    };

    useEffect(() => {
        fetchBranches();
        fetchDepartments();
    }, [institutionId]);

    const departmentById = useMemo(() => {
        const map = new Map();
        departments.forEach((d) => map.set(d._id, d));
        return map;
    }, [departments]);

    const filteredBranches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return branches;

        return branches.filter((b) => {
            const dept = departmentById.get(b.departmentId);
            return (
                (b?.name || "").toLowerCase().includes(q) ||
                (b?.code || "").toLowerCase().includes(q) ||
                (dept?.name || "").toLowerCase().includes(q)
            );
        });
    }, [branches, query, departmentById]);

    const askDeleteBranch = (branch) => {
        setConfirmState({
            open: true,
            branchId: branch._id,
            branchName: branch.name || "this branch",
        });
    };

    const deleteBranch = async () => {
        if (!confirmState.branchId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setDeleting(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/branches/${confirmState.branchId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${institutionToken}` },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");

            toast.success("Branch removed");
            setBranches((prev) => prev.filter((b) => b._id !== confirmState.branchId));
            setConfirmState({ open: false, branchId: null, branchName: "" });
        } catch (err) {
            toast.error(err.message || "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    const toggleStatus = async (branch) => {
        if (!branch?._id) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setStatusUpdatingId(branch._id);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/branches/${branch._id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${institutionToken}`,
                    },
                    body: JSON.stringify({ isOpen: !branch.isOpen }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Status update failed");

            const updated = data.data;
            setBranches((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));

            toast.success(`Branch marked as ${updated.isOpen ? "Open" : "Closed"}`);
        } catch (err) {
            toast.error(err.message || "Status update failed");
        } finally {
            setStatusUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <Loader />
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-6xl mx-auto px-5 py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
                            Branches
                        </h1>
                        <p className="text-[var(--muted-text)] text-sm mt-1">
                            View and manage branches under your institution.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search branches..."
                                className="pl-10 pr-4 py-2.5 w-full sm:w-72 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition text-sm text-[var(--text)] placeholder:text-[var(--muted-text)]"
                            />
                        </div>

                        <button
                            onClick={() => navigate("/institution/branches/create")}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                            type="button"
                        >
                            <Plus size={18} />
                            Add Branch
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                {filteredBranches.length === 0 ? (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10 text-center shadow-[var(--shadow)]">
                        <h3 className="text-lg font-semibold text-[var(--text)]">No branches found</h3>
                        <p className="text-[var(--muted-text)] text-sm mt-1">
                            Try a different search keyword.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredBranches.map((branch) => {
                            const dept = departmentById.get(branch.departmentId);

                            return (
                                <motion.div
                                    layout
                                    key={branch._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-[var(--shadow)] transition"
                                >
                                    {/* Top */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold truncate text-[var(--text)]">
                                                {branch.name}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted-text)]">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg font-semibold text-[var(--text)]">
                                                    <Hash size={12} />
                                                    {branch.code}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mt-3 text-sm text-[var(--muted-text)]">
                                                <Building2 size={16} className="text-[var(--muted-text)]" />
                                                <span className="truncate">{dept?.name || "Unknown Department"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => navigate(`/institution/branches/edit//${branch._id}`)}
                                                className="p-2 rounded-lg hover:bg-[var(--hover)] text-[var(--muted-text)] hover:text-[var(--text)] transition"
                                                title="Edit"
                                                type="button"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button
                                                onClick={() => askDeleteBranch(branch)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted-text)] hover:text-red-500 transition"
                                                title="Delete"
                                                type="button"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status Toggle */}
                                    <button
                                        onClick={() => toggleStatus(branch)}
                                        disabled={statusUpdatingId === branch._id}
                                        className="w-full mt-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
                    hover:bg-[var(--text)] hover:text-[var(--bg)] transition font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                                        type="button"
                                    >
                                        {statusUpdatingId === branch._id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : branch.isOpen ? (
                                            <ToggleRight size={18} />
                                        ) : (
                                            <ToggleLeft size={18} />
                                        )}
                                        {branch.isOpen ? "Open" : "Closed"}
                                    </button>

                                    {/* Bottom */}
                                    <button
                                        onClick={() => navigate(`/institution/branches/edit/${branch._id}`)}
                                        className="w-full mt-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
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
                title="Delete Branch?"
                message={`This will permanently delete "${confirmState.branchName}". This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
                onClose={() =>
                    !deleting &&
                    setConfirmState({ open: false, branchId: null, branchName: "" })
                }
                onConfirm={deleteBranch}
            />
        </div>
    );
};

export default InstitutionBranches;
