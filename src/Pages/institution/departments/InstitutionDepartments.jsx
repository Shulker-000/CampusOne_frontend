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

const InstitutionDepartments = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = localStorage.getItem("institutionToken");

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
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                <p className="text-sm font-medium text-slate-500">Loading departments...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="max-w-6xl mx-auto px-5 py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Departments</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            View and manage your institution departments.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search departments..."
                                className="pl-10 pr-4 py-2.5 w-full sm:w-72 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition text-sm"
                            />
                        </div>

                        <button
                            onClick={() => navigate("/institution/departments/create")}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                        >
                            <Plus size={18} />
                            Add Department
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                {filteredDepartments.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                        <h3 className="text-lg font-semibold">No departments found</h3>
                        <p className="text-slate-500 text-sm mt-1">
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
                                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition"
                                >
                                    {/* Top */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold truncate">{dept.name}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg font-semibold">
                                                    <Hash size={12} />
                                                    {dept.code}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    navigate(`/institution/departments/edit/${dept._id}`)
                                                }
                                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => askDeleteDepartment(dept)}

                                                className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-4">
                                        <Mail size={14} className="text-slate-400" />
                                        <span className="truncate">{dept.contactEmail}</span>
                                    </div>

                                    {/* HOD */}
                                    <div className="mt-4 p-3 flex items-center gap-3">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                className="w-10 h-10 rounded-lg object-cover"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                                                <User2 size={18} />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] text-slate-500 font-semibold">HOD</p>
                                            <p className="text-sm font-semibold truncate">
                                                {user?.name || "Unassigned"}
                                            </p>
                                        </div>

                                        {user && <BadgeCheck className="w-5 h-5 text-emerald-500" />}
                                    </div>

                                    {/* Bottom */}
                                    <button
                                        onClick={() => navigate(`/institution/departments/edit/${dept._id}`)}
                                        className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition font-semibold text-sm flex items-center justify-center gap-2"
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
