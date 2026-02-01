import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Search, Plus } from "lucide-react";

import ConfirmModal from "../../../components/ConfirmModal";
import Loader from "../../../components/Loader";
import InstitutionDepartmentsCard from "./InstitutionDepartmentsCard";
import EditModal from "../EditModal";

const InstitutionDepartments = () => {
    const institutionId = useSelector((s) => s.auth.institution.data?._id);

    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [query, setQuery] = useState("");

    // delete state
    const [confirmState, setConfirmState] = useState({
        open: false,
        departmentId: null,
        departmentName: "",
    });
    const [deleting, setDeleting] = useState(false);

    // edit modal state
    const [editDept, setEditDept] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        code: "",
        contactEmail: "",
    });

    // live code check state
    const [codeStatus, setCodeStatus] = useState({
        checking: false,
        exists: false,
        checked: false,
    });

    // ---------- fetch ----------
    const fetchDepartments = async () => {
        if (!institutionId) return;
        try {
            setLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
                { credentials: "include" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setDepartments(Array.isArray(data.data) ? data.data : []);
        } catch (e) {
            toast.error(e.message || "Failed to fetch departments");
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculties = async () => {
        if (!institutionId) return;
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/by-institution/${institutionId}`,
                { credentials: "include" }
            );
            const data = await res.json();
            setFaculties(Array.isArray(data.data) ? data.data : []);
        } catch {
            console.error("Faculty fetch failed");
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchFaculties();
    }, [institutionId]);

    // ---------- helpers ----------
    const facultyById = useMemo(() => {
        const map = new Map();
        faculties.forEach((f) => map.set(f._id, f));
        return map;
    }, [faculties]);

    const filteredDepartments = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return departments;
        return departments.filter((d) => {
            const hodId = d?.headOfDepartment?._id || d?.headOfDepartment;
            const hodUser = hodId ? facultyById.get(hodId)?.userId : null;

            return (
                d.name?.toLowerCase().includes(q) ||
                d.code?.toLowerCase().includes(q) ||
                d.contactEmail?.toLowerCase().includes(q) ||
                hodUser?.name?.toLowerCase().includes(q)
            );
        });
    }, [departments, query, facultyById]);

    // ---------- delete ----------
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
                { method: "DELETE", credentials: "include" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Department removed");
            setDepartments((p) =>
                p.filter((d) => d._id !== confirmState.departmentId)
            );
            setConfirmState({ open: false, departmentId: null, departmentName: "" });
        } catch (e) {
            toast.error(e.message || "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    // ---------- edit ----------
    const openEdit = (dept) => {
        setForm({
            name: dept.name || "",
            code: dept.code || "",
            contactEmail: dept.contactEmail || "",
        });

        // reset status to avoid stale UI
        setCodeStatus({ checking: false, exists: false, checked: false });
        setEditDept(dept);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));

        if (name === "code") {
            setCodeStatus({ checking: false, exists: false, checked: false });
        }
    };

    // live availability check (onBlur)
    const checkDepartmentCode = async (code) => {
        const trimmed = code.trim();
        if (!trimmed || !institutionId) return;

        // Editing same code - skip check
        if (editDept && trimmed === editDept.code) {
            setCodeStatus({ checking: false, exists: false, checked: true });
            return;
        }

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
        } catch (e) {
            console.error(e);
            setCodeStatus({ checking: false, exists: false, checked: false });
        }
    };


    const saveEdit = async () => {
        const { name, code, contactEmail } = form;

        if (codeStatus.exists) {
            toast.error("Department code already exists");
            return;
        }

        if (!name || !code || !contactEmail) {
            toast.error("All fields are required");
            return;
        }

        try {
            setSaving(true);
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/update-department/${editDept._id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Department updated");
            setDepartments((p) =>
                p.map((d) => (d._id === editDept._id ? { ...d, ...form } : d))
            );
            setEditDept(null);
        } catch (e) {
            toast.error(e.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-6xl mx-auto px-5 py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Departments</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search departments..."
                                className="pl-10 pr-4 py-2.5 w-full sm:w-72 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl"
                            />
                        </div>

                    </div>
                </div>

                {/* Grid */}
                {filteredDepartments.length === 0 ? (
                    <div className="border rounded-2xl p-10 text-center bg-[var(--surface-2)]">
                        No departments found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredDepartments.map((dept) => {
                            const hodId =
                                dept?.headOfDepartment?._id || dept?.headOfDepartment;
                            const hodUser = hodId
                                ? facultyById.get(hodId)
                                : null;
                            return (
                                <InstitutionDepartmentsCard
                                    key={dept._id}
                                    dept={dept}
                                    faculty={hodUser}
                                    onEdit={() => openEdit(dept)}
                                    onDelete={() => askDeleteDepartment(dept)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete confirm */}
            <ConfirmModal
                open={confirmState.open}
                title="Delete Department?"
                message={`This will permanently delete "${confirmState.departmentName}".`}
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

            {/* Edit modal */}
            <EditModal
                open={!!editDept}
                title="Edit Department"
                confirmText="Save Changes"
                loading={saving}
                disabled={codeStatus.exists || codeStatus.checking}
                onClose={() => setEditDept(null)}
                onConfirm={saveEdit}
            >
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                        label="Department Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />

                    <div>
                        <Field
                            label="Department Code"
                            name="code"
                            value={form.code}
                            onChange={handleChange}
                            onBlur={(e) => checkDepartmentCode(e.target.value)}
                        />

                        {codeStatus.checked && (
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

                    <Field
                        label="Contact Email"
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleChange}
                    />
                </div>
            </EditModal>
        </div>
    );
};

const Field = ({ label, ...props }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-[var(--muted-text)] uppercase">
            {label}
        </label>
        <input
            {...props}
            className="w-full rounded-xl border px-3 py-3 bg-[var(--surface-2)]"
        />
    </div>
);

export default InstitutionDepartments;
