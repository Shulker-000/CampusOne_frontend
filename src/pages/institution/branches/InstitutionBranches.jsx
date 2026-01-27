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
    Loader2,
    Building2,
    ToggleLeft,
    ToggleRight,
    BadgeCheck,
    Ban,
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

    // ========= Delete Modal State =========
    const [confirmState, setConfirmState] = useState({
        open: false,
        branchId: null,
        branchName: "",
    });

    // ========= Status Modal State (Faculty style) =========
    const [statusModal, setStatusModal] = useState({
        open: false,
        branchId: null,
        branchName: "",
        nextIsOpen: null,
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
                { credentials: "include" }
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

    // ================= FETCH DEPARTMENTS =================
    const fetchDepartments = async () => {
        if (!institutionId) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
                { credentials: "include" }
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
        departments.forEach((d) => map.set(String(d._id), d));
        return map;
    }, [departments]);

    const filteredBranches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return branches;

        return branches.filter((b) => {
            const dept = departmentById.get(String(b.departmentId));
            return (
                (b?.name || "").toLowerCase().includes(q) ||
                (b?.code || "").toLowerCase().includes(q) ||
                (dept?.name || "").toLowerCase().includes(q)
            );
        });
    }, [branches, query, departmentById]);

    // ================= DELETE =================
    const askDeleteBranch = (branch) => {
        setConfirmState({
            open: true,
            branchId: branch._id,
            branchName: branch.name || "this branch",
        });
    };

    const closeDeleteModal = () => {
        if (deleting) return;
        setConfirmState({ open: false, branchId: null, branchName: "" });
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
                    credentials: "include",
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");

            toast.success("Branch removed");
            setBranches((prev) => prev.filter((b) => b._id !== confirmState.branchId));
            closeDeleteModal();
        } catch (err) {
            toast.error(err.message || "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    // ================= STATUS (with confirmation modal) =================
    const openStatusModal = (branch) => {
        if (!branch?._id) return;

        setStatusModal({
            open: true,
            branchId: branch._id,
            branchName: branch?.name || "this branch",
            nextIsOpen: !branch.isOpen,
        });
    };

    const closeStatusModal = () => {
        if (statusUpdatingId) return;
        setStatusModal({ open: false, branchId: null, branchName: "", nextIsOpen: null });
    };

    const toggleStatus = async () => {
        if (!statusModal.branchId || typeof statusModal.nextIsOpen !== "boolean") return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setStatusUpdatingId(statusModal.branchId);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/branches/${statusModal.branchId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        credentials: "include",
                    },
                    body: JSON.stringify({ isOpen: statusModal.nextIsOpen }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Status update failed");

            const updated = data.data;
            setBranches((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));

            toast.success(`Branch marked as ${updated.isOpen ? "Open" : "Closed"}`);
            closeStatusModal();
        } catch (err) {
            toast.error(err.message || "Status update failed");
        } finally {
            setStatusUpdatingId(null);
        }
    };

    if (loading) return <Loader />;

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
                            const dept = departmentById.get(String(branch.departmentId));
                            const isUpdating = statusUpdatingId === branch._id;

                            return (
<motion.div
    layout
    key={branch._id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 transition ${branch.isOpen ? "hover:shadow-[var(--shadow)]" : "opacity-60"
        }`}
>
    {/* TOP HEADER */}
    <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden shrink-0 grid place-items-center">
                <Building2 size={18} className="text-[var(--muted-text)]" />
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold truncate text-[var(--text)]">
                    {branch.name || "Branch"}
                </h3>
                <p className="text-xs text-[var(--muted-text)] truncate">
                    {dept?.name || "Unknown Department"}
                </p>
            </div>
        </div>

        {/* Toggle (standardized colors - no red/green) */}
        <div className="shrink-0">
            <button
                type="button"
                onClick={() => openStatusModal(branch)}
                disabled={isUpdating}
                className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${isUpdating ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    }`}
                style={{
                    background: "var(--surface-2)",
                    borderColor: branch.isOpen ? "var(--accent)" : "var(--border)",
                }}
                title={branch.isOpen ? "Open" : "Closed"}
            >
                <span
                    className="inline-block h-5 w-5 transform rounded-full transition"
                    style={{
                        background: "var(--text)",
                        transform: branch.isOpen ? "translateX(24px)" : "translateX(4px)",
                    }}
                />

                {isUpdating && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-text)]" />
                    </span>
                )}
            </button>
        </div>
    </div>

    {/* BADGES */}
    <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]">
            <Hash size={14} />
            {branch.code || "N/A"}
        </span>

        {/* standardized Open/Closed badge (no red/green) */}
        <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border"
            style={{
                background: "var(--surface-2)",
                color: "var(--text)",
                borderColor: branch.isOpen ? "var(--accent)" : "var(--border)",
            }}
        >
            {branch.isOpen ? <BadgeCheck size={14} /> : <Ban size={14} />}
            {branch.isOpen ? "Open" : "Closed"}
        </span>
    </div>

    {/* DETAILS */}
    <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-[var(--muted-text)]">
            <Building2 size={16} />
            <span className="font-semibold text-[var(--text)]">Department:</span>
            <span className="truncate">{dept?.name || "Unknown Department"}</span>
        </div>
    </div>

    {/* ACTIONS */}
    <div className="flex items-center gap-2 mt-5">
        <button
            onClick={() => navigate(`/institution/branches/edit/${branch._id}`)}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
            hover:bg-[var(--text)] hover:text-[var(--bg)] transition font-semibold text-sm"
            type="button"
        >
            Edit Branch
        </button>

        {/* standardized delete button (no red hover) */}
        <button
            onClick={() => askDeleteBranch(branch)}
            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
            hover:opacity-90 text-[var(--muted-text)] transition"
            title="Delete"
            type="button"
        >
            <Trash2 size={18} />
        </button>
    </div>
</motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* DELETE MODAL */}
            <ConfirmModal
                open={confirmState.open}
                title="Delete Branch?"
                message={`This will permanently delete "${confirmState.branchName}". This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
                onClose={closeDeleteModal}
                onConfirm={deleteBranch}
            />

            {/* STATUS MODAL */}
            <ConfirmModal
                open={statusModal.open}
                title="Change Branch Status?"
                message={
                    statusModal.nextIsOpen
                        ? `You're about to mark "${statusModal.branchName}" as "Open". Continue?`
                        : `You're about to mark "${statusModal.branchName}" as "Closed". Continue?`
                }
                confirmText={statusModal.nextIsOpen ? "Yes, Mark Open" : "Yes, Mark Closed"}
                cancelText="Cancel"
                variant="warning"
                loading={!!statusUpdatingId}
                onClose={closeStatusModal}
                onConfirm={toggleStatus}
            />
        </div>
    );
};

export default InstitutionBranches;
