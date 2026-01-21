// src/pages/institution/courses/InstitutionCourses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
    Search,
    Plus,
    Loader2,
    Hash,
    BookOpen,
    GraduationCap,
    Trash2,
    Pencil,
    Building2,
} from "lucide-react";
import ConfirmModal from "../../../components/ConfirmModal";
import Loader from "../../../components/Loader";

const InstitutionCourses = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = useSelector((s) => s.auth.institution.token);

    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    // ✅ DEFAULT = ALL
    const [departmentId, setDepartmentId] = useState("all");

    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);

    const [query, setQuery] = useState("");

    const [statusLoadingMap, setStatusLoadingMap] = useState({});

    const [confirmState, setConfirmState] = useState({
        open: false,
        type: null, // "delete" | "status"
        courseId: null,
        courseName: "",
        nextIsOpen: null,
    });

    const [deleting, setDeleting] = useState(false);

    const closeConfirm = () => {
        if (deleting) return;
        setConfirmState({
            open: false,
            type: null,
            courseId: null,
            courseName: "",
            nextIsOpen: null,
        });
    };

    // ========= FETCH DEPARTMENTS =========
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

            const list = Array.isArray(data.data) ? data.data : [];
            setDepartments(list);

            // ✅ keep dropdown default as "all"
            // no auto select first department anymore
        } catch (err) {
            toast.error(err.message || "Failed to fetch departments");
        } finally {
            setDepartmentsLoading(false);
        }
    };

    // ========= FETCH COURSES BY INSTITUTION =========
    const fetchCoursesByInstitution = async () => {
        if (!institutionId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/institution/${institutionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${institutionToken}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch courses");

            setCourses(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch courses");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [institutionId]);

    useEffect(() => {
        fetchCoursesByInstitution();
    }, [institutionId]);

    // ========= FILTERING =========
    const filteredCourses = useMemo(() => {
        const q = query.trim().toLowerCase();

        return courses
            .filter((c) => {
                // ✅ show all when "all"
                if (departmentId === "all") return true;
                return String(c?.departmentId) === String(departmentId);
            })
            .filter((c) => {
                if (!q) return true;
                return (
                    (c?.name || "").toLowerCase().includes(q) ||
                    (c?.code || "").toLowerCase().includes(q) ||
                    String(c?.credits ?? "").toLowerCase().includes(q) ||
                    String(c?.semester ?? "").toLowerCase().includes(q)
                );
            });
    }, [courses, departmentId, query]);

    // ========= DELETE =========
    const askDeleteCourse = (course) => {
        setConfirmState({
            open: true,
            type: "delete",
            courseId: course._id,
            courseName: course.name || "this course",
            nextIsOpen: null,
        });
    };

    const deleteCourse = async () => {
        if (!confirmState.courseId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setDeleting(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/${confirmState.courseId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${institutionToken}` },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");

            toast.success("Course deleted");
            setCourses((prev) => prev.filter((c) => c._id !== confirmState.courseId));
            closeConfirm();
        } catch (err) {
            toast.error(err.message || "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    // ========= STATUS TOGGLE =========
    const askToggleStatus = (course) => {
        const next = !course.isOpen;

        setConfirmState({
            open: true,
            type: "status",
            courseId: course._id,
            courseName: course.name || "this course",
            nextIsOpen: next,
        });
    };

    const updateCourseStatus = async () => {
        const { courseId, nextIsOpen } = confirmState;

        if (!courseId || typeof nextIsOpen !== "boolean") return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setStatusLoadingMap((prev) => ({ ...prev, [courseId]: true }));

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/change-status/${courseId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${institutionToken}`,
                    },
                    body: JSON.stringify({ isOpen: nextIsOpen }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Status update failed");

            const updatedCourse = data?.data;

            setCourses((prev) =>
                prev.map((c) => (c._id === courseId ? { ...c, ...updatedCourse } : c))
            );

            toast.success(`Course is now ${nextIsOpen ? "Open" : "Closed"}`);
            closeConfirm();
        } catch (err) {
            toast.error(err.message || "Status update failed");
        } finally {
            setStatusLoadingMap((prev) => {
                const copy = { ...prev };
                delete copy[courseId];
                return copy;
            });
        }
    };

    const onConfirmAction = () => {
        if (confirmState.type === "delete") return deleteCourse();
        if (confirmState.type === "status") return updateCourseStatus();
    };

    const confirmTitle =
        confirmState.type === "delete"
            ? "Delete Course?"
            : "Change Course Status?";

    const confirmMessage =
        confirmState.type === "delete"
            ? `This will permanently delete "${confirmState.courseName}". This action cannot be undone.`
            : `You're about to mark "${confirmState.courseName}" as "${confirmState.nextIsOpen ? "Open" : "Closed"
            }". Continue?`;

    const confirmVariant = confirmState.type === "delete" ? "danger" : "warning";

    const confirmText =
        confirmState.type === "delete"
            ? "Yes, Delete"
            : `Yes, Mark ${confirmState.nextIsOpen ? "Open" : "Closed"}`;

    const modalLoading =
        deleting ||
        (confirmState.type === "status" &&
            !!statusLoadingMap[confirmState.courseId]);

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-6xl mx-auto px-5 py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
                            Courses
                        </h1>
                        <p className="text-[var(--muted-text)] text-sm mt-1">
                            Filter department-wise and manage courses.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/institution/courses/create")}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                        type="button"
                    >
                        <Plus size={18} />
                        Add Course
                    </button>
                </div>

                {/* Controls row */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-6">
                    {/* Department Filter */}
                    <div className="w-full md:basis-1/2">
                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                            Department
                        </label>

                        <div className="relative mt-1">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                            <select
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                disabled={departmentsLoading}
                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none
                focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)]
                disabled:opacity-60"
                            >
                                <option value="all">All Courses</option>

                                {departmentsLoading ? (
                                    <option value="" disabled>
                                        Loading departments...
                                    </option>
                                ) : departments.length === 0 ? (
                                    <option value="" disabled>
                                        No departments found
                                    </option>
                                ) : (
                                    departments.map((d) => (
                                        <option key={d._id} value={d._id}>
                                            {d.name} ({d.code})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                            Search
                        </label>

                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name, code, credits, semester..."
                                className="pl-10 pr-4 py-2.5 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none
                focus:ring-2 focus:ring-indigo-200 transition text-sm text-[var(--text)] placeholder:text-[var(--muted-text)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Loader / Empty States / Grid */}
                {loading ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
                        <Loader />
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10 text-center shadow-[var(--shadow)]">
                        <h3 className="text-lg font-semibold text-[var(--text)]">
                            No courses found
                        </h3>
                        <p className="text-[var(--muted-text)] text-sm mt-1">
                            Try changing department or search keyword.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCourses.map((course) => {
                            const isStatusLoading = !!statusLoadingMap[course._id];

                            return (
                                <motion.div
                                    layout
                                    key={course._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-[var(--shadow)] transition"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-lg font-semibold truncate text-[var(--text)]">
                                                    {course.name}
                                                </h3>

                                                {/* REAL TOGGLE */}
                                                <button
                                                    type="button"
                                                    onClick={() => askToggleStatus(course)}
                                                    disabled={isStatusLoading}
                                                    className={`shrink-0 relative inline-flex h-7 w-12 items-center rounded-full border transition
                            ${course.isOpen
                                                            ? "bg-emerald-500/20 border-emerald-500/30"
                                                            : "bg-red-500/15 border-red-500/25"
                                                        }
                            ${isStatusLoading
                                                            ? "opacity-60 cursor-not-allowed"
                                                            : "cursor-pointer"
                                                        }
                          `}
                                                    title={course.isOpen ? "Open" : "Closed"}
                                                >
                                                    <span
                                                        className={`inline-block h-5 w-5 transform rounded-full bg-[var(--text)] transition
                              ${course.isOpen
                                                                ? "translate-x-6"
                                                                : "translate-x-1"
                                                            }
                            `}
                                                    />

                                                    {isStatusLoading && (
                                                        <span className="absolute inset-0 flex items-center justify-center">
                                                            <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-text)]" />
                                                        </span>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--text)]">
                                                    <Hash size={12} />
                                                    {course.code}
                                                </span>

                                                <span
                                                    className={`text-xs font-bold px-2 py-1 rounded-lg border
                          ${course.isOpen
                                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                            : "bg-red-500/10 text-red-500 border-red-500/20"
                                                        }`}
                                                >
                                                    {course.isOpen ? "Open" : "Closed"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    navigate(`/institution/courses/edit/${course._id}`)
                                                }
                                                className="p-2 rounded-lg hover:bg-[var(--hover)] text-[var(--muted-text)] hover:text-[var(--text)] transition"
                                                title="Edit"
                                                type="button"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button
                                                onClick={() => askDeleteCourse(course)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted-text)] hover:text-red-500 transition"
                                                title="Delete"
                                                type="button"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-[var(--muted-text)]">
                                            <BookOpen size={16} />
                                            <span className="font-semibold text-[var(--text)]">
                                                Credits:
                                            </span>
                                            <span>{course.credits}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[var(--muted-text)]">
                                            <GraduationCap size={16} />
                                            <span className="font-semibold text-[var(--text)]">
                                                Semester:
                                            </span>
                                            <span>{course.semester}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            navigate(`/institution/courses/edit/${course._id}`)
                                        }
                                        className="w-full mt-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
                    hover:bg-[var(--text)] hover:text-[var(--bg)] transition font-semibold text-sm"
                                        type="button"
                                    >
                                        Edit Course
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmModal
                open={confirmState.open}
                title={
                    confirmState.type === "delete"
                        ? "Delete Course?"
                        : "Change Course Status?"
                }
                message={
                    confirmState.type === "delete"
                        ? `This will permanently delete "${confirmState.courseName}". This action cannot be undone.`
                        : `You're about to mark "${confirmState.courseName}" as "${confirmState.nextIsOpen ? "Open" : "Closed"
                        }". Continue?`
                }
                confirmText={
                    confirmState.type === "delete"
                        ? "Yes, Delete"
                        : `Yes, Mark ${confirmState.nextIsOpen ? "Open" : "Closed"}`
                }
                cancelText="Cancel"
                variant={confirmState.type === "delete" ? "danger" : "warning"}
                loading={deleting || (confirmState.type === "status" && modalLoading)}
                onClose={closeConfirm}
                onConfirm={onConfirmAction}
            />
        </div>
    );
};

export default InstitutionCourses;
