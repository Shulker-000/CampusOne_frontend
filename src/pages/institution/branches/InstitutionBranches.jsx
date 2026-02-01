import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Search, Plus, Loader2, Layers } from "lucide-react";

import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";
import InstitutionBranchesCard from "./InstitutionBranchesCard";
import EditModal from "../EditModal";

const InstitutionBranches = () => {
    const institutionId = useSelector((s) => s.auth.institution.data?._id);

    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [query, setQuery] = useState("");

    // delete
    const [confirmState, setConfirmState] = useState({
        open: false,
        branch: null,
    });
    const [deleting, setDeleting] = useState(false);

    // status
    const [statusModal, setStatusModal] = useState({
        open: false,
        branch: null,
    });
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);

    // edit
    const [editBranch, setEditBranch] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        code: "",
        departmentId: "",
    });

    // code validity
    const [codeStatus, setCodeStatus] = useState({
        checking: false,
        exists: false,
        checked: false,
    });

    const [showValidity, setShowValidity] = useState(false);
    const lastCheckedRef = React.useRef({ code: null });


    // ================= FETCH =================
    const fetchData = async () => {
        if (!institutionId) return;

        try {
            setLoading(true);

            const [branchRes, deptRes] = await Promise.all([
                fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${institutionId}/branches`,
                    { credentials: "include" }
                ),
                fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
                    { credentials: "include" }
                ),
            ]);

            const branchData = await branchRes.json();
            const deptData = await deptRes.json();

            if (!branchRes.ok) throw new Error(branchData.message);
            if (!deptRes.ok) throw new Error(deptData.message);

            setBranches(Array.isArray(branchData.data) ? branchData.data : []);
            setDepartments(Array.isArray(deptData.data) ? deptData.data : []);
        } catch (e) {
            toast.error(e.message || "Failed to load branches");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [institutionId]);

    useEffect(() => {
        if (!editBranch) return;

        const code = form.code.trim();
        if (!code || !institutionId) return;

        if (lastCheckedRef.current.code === code) return;

        lastCheckedRef.current = { code };
        checkBranchCode(code);
    }, [form.code]);


    // ================= HELPERS =================
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
                b.name?.toLowerCase().includes(q) ||
                b.code?.toLowerCase().includes(q) ||
                dept?.name?.toLowerCase().includes(q)
            );
        });
    }, [branches, query, departmentById]);

    // ================= DELETE =================
    const askDelete = (branch) => {
        setConfirmState({ open: true, branch });
    };

    const deleteBranch = async () => {
        if (!confirmState.branch?._id) return;

        try {
            setDeleting(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/branches/${confirmState.branch._id}`,
                { method: "DELETE", credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Branch removed");
            setBranches((p) => p.filter((b) => b._id !== confirmState.branch._id));
            setConfirmState({ open: false, branch: null });
        } catch (e) {
            toast.error(e.message || "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    // ================= STATUS =================
    const openStatusModal = (branch) => {
        setStatusModal({ open: true, branch });
    };

    const toggleStatus = async () => {
        const branch = statusModal.branch;
        if (!branch) return;

        try {
            setStatusUpdatingId(branch._id);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/branches/${branch._id}/status`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isOpen: !branch.isOpen }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setBranches((p) =>
                p.map((b) => (b._id === data.data._id ? data.data : b))
            );

            toast.success(`Branch marked as ${data.data.isOpen ? "Open" : "Closed"}`);
            setStatusModal({ open: false, branch: null });
        } catch (e) {
            toast.error(e.message || "Status update failed");
        } finally {
            setStatusUpdatingId(null);
        }
    };

    // ================= EDIT =================
    const openEdit = (branch) => {
        setForm({
            name: branch.name || "",
            code: branch.code || "",
            departmentId: branch.departmentId || "",
        });
        setEditBranch(branch);
        setCodeStatus({ checking: false, exists: false, checked: false });
        setShowValidity(false);
        lastCheckedRef.current = { code: null };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));

        if (name === "code") {
            setCodeStatus({ checking: false, exists: false, checked: false });
            setShowValidity(false);
            lastCheckedRef.current = { code: null };
        }

    };

    const saveEdit = async () => {
        const { name, code, departmentId } = form;

        if (!name || !code || !departmentId) {
            toast.error("All fields are required");
            return;
        }

        if (codeStatus.exists) {
            toast.error("Branch code already exists");
            return;
        }

        try {
            setSaving(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/branches/${editBranch._id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setBranches((p) =>
                p.map((b) => (b._id === data.data._id ? data.data : b))
            );

            toast.success("Branch updated");
            setEditBranch(null);
        } catch (e) {
            toast.error(e.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const checkBranchCode = async (code) => {
        const trimmed = code.trim();
        if (!trimmed || !institutionId) return;

        // editing same code → skip
        if (editBranch && trimmed === editBranch.code) {
            setCodeStatus({ checking: false, exists: false, checked: true });
            setShowValidity(true);
            return;
        }

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


    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-6xl mx-auto px-5 py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold">Branches</h1>

                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search branches..."
                                className="pl-10 pr-4 py-2.5 w-72 rounded-xl border bg-[var(--surface-2)]"
                            />
                        </div>
                    </div>
                </div>

                {/* EMPTY STATE */}
                {filteredBranches.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--muted-text)]">
                        <Layers className="w-10 h-10 mb-3 opacity-60" />
                        <p className="text-sm font-semibold">
                            {query.trim()
                                ? "No branches match your search"
                                : "No branches created yet"}
                        </p>
                    </div>
                )}

                {/* GRID */}
                {filteredBranches.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredBranches.map((branch) => {
                            const dept = departmentById.get(String(branch.departmentId));

                            return (
                                <InstitutionBranchesCard
                                    key={branch._id}
                                    branch={branch}
                                    departmentName={dept?.name}
                                    onEdit={() => openEdit(branch)}
                                    onDelete={() => askDelete(branch)}
                                    onToggleStatus={() => openStatusModal(branch)}
                                    isUpdatingStatus={statusUpdatingId === branch._id}
                                />
                            );
                        })}
                    </div>
                )}

            </div>

            {/* DELETE MODAL */}
            <ConfirmModal
                open={confirmState.open}
                title="Delete Branch?"
                message={`This will permanently delete "${confirmState.branch?.name}".`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
                onClose={() => !deleting && setConfirmState({ open: false, branch: null })}
                onConfirm={deleteBranch}
            />

            {/* STATUS MODAL */}
            <ConfirmModal
                open={statusModal.open}
                title="Change Branch Status?"
                message={`You're about to mark "${statusModal.branch?.name}" as ${statusModal.branch?.isOpen ? "Closed" : "Open"
                    }.`}
                confirmText="Confirm"
                cancelText="Cancel"
                variant="warning"
                loading={!!statusUpdatingId}
                onClose={() => !statusUpdatingId && setStatusModal({ open: false, branch: null })}
                onConfirm={toggleStatus}
            />

            {/* EDIT MODAL */}
            <EditModal
                open={!!editBranch}
                title="Edit Branch"
                confirmText="Save Changes"
                loading={saving}
                disabled={codeStatus.exists || codeStatus.checking}
                onClose={() => setEditBranch(null)}
                onConfirm={saveEdit}
            >
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Branch Name" name="name" value={form.name} onChange={handleChange} />
                    
                    <div>
                        <Field
                            label="Branch Code"
                            name="code"
                            value={form.code}
                            onChange={handleChange}
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

                    <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold uppercase text-[var(--muted-text)]">
                            Department
                        </label>

                        <div className="relative">
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                            <select
                                name="departmentId"
                                value={form.departmentId}
                                onChange={handleChange}
                                className="w-full rounded-xl border pl-10 pr-4 py-3 bg-[var(--surface-2)]"
                            >
                                <option value="">Select department</option>
                                {departments.map((d) => (
                                    <option key={d._id} value={d._id}>
                                        {d.name} ({d.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </EditModal>
        </div>
    );
};

const Field = ({ label, ...props }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold uppercase text-[var(--muted-text)]">
            {label}
        </label>
        <input
            {...props}
            className="w-full rounded-xl border px-3 py-3 bg-[var(--surface-2)]"
        />
    </div>
);

export default InstitutionBranches;
