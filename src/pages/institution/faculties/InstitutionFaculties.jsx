// src/pages/institution/faculties/InstitutionFaculties.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
    Search,
    Loader2,
    Building2,
    Users,
    User2,
    Phone,
    Mail,
    BadgeCheck,
    Ban,
    Pencil,
    BookOpen,
    Layers,
} from "lucide-react";
import Loader from "../../../components/Loader";

const InstitutionFaculties = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = useSelector((s) => s.auth.institution.token);

    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    const [selectedDept, setSelectedDept] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [faculties, setFaculties] = useState([]);

    const [query, setQuery] = useState("");

    // =============== Fetch Departments ===============
    const fetchDepartments = async () => {
        if (!institutionId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            setDepartmentsLoading(false);
            return;
        }

        try {
            setDepartmentsLoading(true);

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
            setDepartmentsLoading(false);
        }
    };

    // =============== Fetch Faculties ===============
    const fetchFaculties = async () => {
        if (!institutionId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const url =
                selectedDept === "ALL"
                    ? `${import.meta.env.VITE_BACKEND_URL}/api/faculties/institution/${institutionId}`
                    : `${import.meta.env.VITE_BACKEND_URL}/api/faculties/department/${selectedDept}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${institutionToken}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch faculties");

            setFaculties(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch faculties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [institutionId]);

    useEffect(() => {
        fetchFaculties();
    }, [institutionId, selectedDept]);

    const filteredFaculties = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return faculties;

        return faculties.filter((f) => {
            const user = f.userId;
            return (
                (user?.name || "").toLowerCase().includes(q) ||
                (user?.email || "").toLowerCase().includes(q) ||
                (user?.phone || "").toLowerCase().includes(q) ||
                (f?.designation || "").toLowerCase().includes(q) ||
                (f?.departmentId?.name || "").toLowerCase().includes(q)
            );
        });
    }, [faculties, query]);

    const formatDate = (d) => {
        if (!d) return "N/A";
        try {
            return new Date(d).toLocaleDateString();
        } catch {
            return "N/A";
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
                            Faculties
                        </h1>
                        <p className="text-[var(--muted-text)] text-sm mt-1">
                            View and manage faculty members - filter department wise.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2">
                            <Users size={18} className="text-[var(--muted-text)]" />
                            <p className="text-sm font-semibold text-[var(--text)]">
                                {filteredFaculties.length} Faculties
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls row (60/40 like you wanted) */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-6">
                    {/* Department - 60% */}
                    <div className="w-full md:basis-3/5">
                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                            Department
                        </label>

                        <div className="relative mt-1">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                disabled={departmentsLoading}
                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none
                focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)]
                disabled:opacity-60"
                            >
                                <option value="ALL">
                                    {departmentsLoading ? "Loading departments..." : "All Departments"}
                                </option>

                                {departments.map((d) => (
                                    <option key={d._id} value={d._id}>
                                        {d.name} ({d.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Search - 40% */}
                    <div className="w-full md:basis-2/5">
                        <label className="text-xs font-semibold text-[var(--muted-text)]">Search</label>

                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search name/email/designation..."
                                className="pl-10 pr-4 py-2.5 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none
                focus:ring-2 focus:ring-indigo-200 transition text-sm text-[var(--text)] placeholder:text-[var(--muted-text)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Empty */}
                {filteredFaculties.length === 0 ? (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10 text-center shadow-[var(--shadow)]">
                        <h3 className="text-lg font-semibold text-[var(--text)]">No faculties found</h3>
                        <p className="text-[var(--muted-text)] text-sm mt-1">
                            Try changing department or search keyword.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredFaculties.map((f) => {
                            const user = f.userId;
                            const deptName = f?.departmentId?.name || "Unknown Department";

                            const courseCount = Array.isArray(f.courses) ? f.courses.length : 0;

                            return (
                                <motion.div
                                    layout
                                    key={f._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 transition
                    ${f.isActive ? "hover:shadow-[var(--shadow)]" : "opacity-60"}`}
                                >
                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className="h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden shrink-0 grid place-items-center">
                                                    {user?.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user?.name || "Faculty"}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <User2 size={18} onClick={()=>{
                                                            console.log(user)
                                                        }} className="text-[var(--muted-text)]" />
                                                    )}
                                                </div>


                                                <div className="min-w-0">
                                                    <h3 className="text-base font-bold truncate text-[var(--text)]">
                                                        {user?.name || "Faculty"}
                                                    </h3>
                                                    <p className="text-xs text-[var(--muted-text)] truncate">
                                                        {deptName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chips + edit */}
                                        <div className="flex items-center gap-2">
                                            {f.isInCharge && (
                                                <span className="px-2 py-1 rounded-lg text-xs font-bold border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                                                    In-Charge
                                                </span>
                                            )}

                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border
                        ${f.isActive
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                                    }`}
                                            >
                                                {f.isActive ? <BadgeCheck size={14} /> : <Ban size={14} />}
                                                {f.isActive ? "Active" : "Inactive"}
                                            </span>

                                            <button
                                                onClick={() => navigate(`/institution/faculties/edit/${f._id}`)}
                                                className="p-2 rounded-lg hover:bg-[var(--hover)] text-[var(--muted-text)] hover:text-[var(--text)] transition"
                                                title="Edit"
                                                type="button"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-[var(--muted-text)]">
                                            <Mail size={16} />
                                            <span className="truncate">{user?.email || "N/A"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[var(--muted-text)]">
                                            <Phone size={16} />
                                            <span className="truncate">{user?.phone || "N/A"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[var(--muted-text)]">
                                            <Layers size={16} />
                                            <span className="font-semibold text-[var(--text)]">Designation:</span>
                                            <span className="truncate">{f.designation || "N/A"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[var(--muted-text)]">
                                            <Layers size={16} />
                                            <span className="font-semibold text-[var(--text)]">Department:</span>
                                            <span className="truncate">{deptName}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[var(--muted-text)]">
                                            <BookOpen size={16} />
                                            <span className="font-semibold text-[var(--text)]">Courses:</span>
                                            <span>{courseCount}</span>
                                        </div>

                                        <p className="text-[11px] text-[var(--muted-text)]">
                                            Joined:{" "}
                                            <span className="font-semibold text-[var(--text)]">
                                                {formatDate(f.dateOfJoining)}
                                            </span>
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstitutionFaculties;
