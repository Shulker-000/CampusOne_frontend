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
    Users,
    BadgeCheck,
    Ban,
} from "lucide-react";
import ConfirmModal from "../../../components/ConfirmModal";
import Loader from "../../../components/Loader";

const InstitutionCourses = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = useSelector((s) => s.auth.institution.token);

    // ========= Departments =========
    const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    // ✅ DEFAULT = ALL
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("all");

    // ========= Courses =========
    const [isCoursesLoading, setIsCoursesLoading] = useState(false);
    const [courses, setCourses] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");

    // ========= Per-course loading states =========
    const [statusUpdatingMap, setStatusUpdatingMap] = useState({}); // courseId -> boolean
    const [isDeletingCourse, setIsDeletingCourse] = useState(false);

    // ========= Confirm Modal State =========
    const [actionModal, setActionModal] = useState({
        open: false,
        type: null, // "delete" | "status"
        courseId: null,
        courseName: "",
        nextIsOpen: null,
    });

    // ========= Impact (Faculties teaching this course) =========
    const [isImpactLoading, setIsImpactLoading] = useState(false);
    const [impactError, setImpactError] = useState("");
    const [impactedFaculties, setImpactedFaculties] = useState([]);
    const [finishLoadingMap, setFinishLoadingMap] = useState({}); // facultyId -> boolean

    const closeActionModal = () => {
        if (isDeletingCourse) return;

        const anyFinishing = Object.values(finishLoadingMap).some(Boolean);
        if (anyFinishing) return;

        setActionModal({
            open: false,
            type: null,
            courseId: null,
            courseName: "",
            nextIsOpen: null,
        });

        setIsImpactLoading(false);
        setImpactError("");
        setImpactedFaculties([]);
        setFinishLoadingMap({});
    };

    // ========= Fetch Departments =========
    const fetchDepartments = async () => {
        if (!institutionId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            setIsDepartmentsLoading(false);
            return;
        }

        try {
            setIsDepartmentsLoading(true);

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
            setIsDepartmentsLoading(false);
        }
    };

    // ========= Fetch Courses (by Institution) =========
    const fetchCoursesByInstitution = async () => {
        if (!institutionId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setIsCoursesLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/institution/${institutionId}`,
                { headers: { Authorization: `Bearer ${institutionToken}` } }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch courses");

            setCourses(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch courses");
            setCourses([]);
        } finally {
            setIsCoursesLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [institutionId]);

    useEffect(() => {
        fetchCoursesByInstitution();
    }, [institutionId]);

    // ========= Filtering =========
    const visibleCourses = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        return courses
            .filter((c) => {
                if (selectedDepartmentId === "all") return true;
                return String(c?.departmentId) === String(selectedDepartmentId);
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
    }, [courses, selectedDepartmentId, searchQuery]);

    // ========= Impact Fetch (Course -> Faculties Teaching It) =========
    const fetchFacultiesTeachingCourse = async (courseId) => {
        if (!courseId) return [];

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return [];
        }

        try {
            setIsImpactLoading(true);
            setImpactError("");
            setImpactedFaculties([]);

            const selectedCourse = courses.find((c) => String(c._id) === String(courseId));
            const departmentIdOfCourse = selectedCourse?.departmentId;

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/faculty/course/${courseId}/department/${departmentIdOfCourse}`,
                { headers: { Authorization: `Bearer ${institutionToken}` } }
            );

            const data = await res.json();

            if (res.status === 404) {
                setImpactedFaculties([]);
                return [];
            }

            if (!res.ok) throw new Error(data?.message || "Failed to fetch faculties");

            const list = Array.isArray(data?.data) ? data.data : [];
            setImpactedFaculties(list);
            return list;
        } catch (err) {
            setImpactError(err.message || "Failed to fetch faculty impact");
            setImpactedFaculties([]);
            return [];
        } finally {
            setIsImpactLoading(false);
        }
    };

    // ========= Finish Course for a Faculty =========
    const finishCourseForFaculty = async ({ facultyId, courseId }) => {
        if (!facultyId || !courseId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setFinishLoadingMap((p) => ({ ...p, [facultyId]: true }));

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/finish-course-by-faculty/${facultyId}/${courseId}`,
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${institutionToken}` },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to finish course");

            toast.success("Course finished for faculty");
            setImpactedFaculties((prev) => prev.filter((f) => f._id !== facultyId));
        } catch (err) {
            toast.error(err.message || "Failed to finish course");
        } finally {
            setFinishLoadingMap((p) => {
                const copy = { ...p };
                delete copy[facultyId];
                return copy;
            });
        }
    };

    // ========= Open Delete Modal =========
    const openDeleteCourseModal = async (course) => {
        if (!course?._id) return;

        await fetchFacultiesTeachingCourse(course._id);

        setActionModal({
            open: true,
            type: "delete",
            courseId: course._id,
            courseName: course.name || "this course",
            nextIsOpen: null,
        });
    };

    // ========= Delete Course =========
    const deleteCourse = async () => {
        if (!actionModal.courseId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setIsDeletingCourse(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/${actionModal.courseId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${institutionToken}` },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");

            toast.success("Course deleted");
            setCourses((prev) => prev.filter((c) => c._id !== actionModal.courseId));
            closeActionModal();
        } catch (err) {
            toast.error(err.message || "Delete failed");
        } finally {
            setIsDeletingCourse(false);
        }
    };

    // ========= Open Status Modal =========
    const openChangeStatusModal = async (course) => {
        if (!course?._id) return;

        const nextIsOpen = !course.isOpen;

        if (nextIsOpen === false) {
            await fetchFacultiesTeachingCourse(course._id);
        } else {
            setImpactedFaculties([]);
            setImpactError("");
        }

        setActionModal({
            open: true,
            type: "status",
            courseId: course._id,
            courseName: course.name || "this course",
            nextIsOpen,
        });
    };

    // ========= Update Course Status =========
    const updateCourseStatus = async () => {
        const { courseId, nextIsOpen } = actionModal;

        if (!courseId || typeof nextIsOpen !== "boolean") return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setStatusUpdatingMap((prev) => ({ ...prev, [courseId]: true }));

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

            const updated = data?.data;

            setCourses((prev) =>
                prev.map((c) => (c._id === courseId ? { ...c, ...updated } : c))
            );

            toast.success(`Course is now ${nextIsOpen ? "Open" : "Closed"}`);
            closeActionModal();
        } catch (err) {
            toast.error(err.message || "Status update failed");
        } finally {
            setStatusUpdatingMap((prev) => {
                const copy = { ...prev };
                delete copy[courseId];
                return copy;
            });
        }
    };

    const onConfirmAction = () => {
        if (actionModal.type === "delete") return deleteCourse();
        if (actionModal.type === "status") return updateCourseStatus();
    };

    // ========= Confirmation Guard =========
    const requiresFinishing =
        actionModal.type === "delete" ||
        (actionModal.type === "status" && actionModal.nextIsOpen === false);

    const pendingImpactCount = impactedFaculties.length;

    const confirmDisabled = requiresFinishing && (isImpactLoading || pendingImpactCount > 0);

    const isModalBusy =
        isDeletingCourse ||
        (actionModal.type === "status" && !!statusUpdatingMap[actionModal.courseId]);

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
                                value={selectedDepartmentId}
                                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                                disabled={isDepartmentsLoading}
                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none
                  focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)]
                  disabled:opacity-60"
                            >
                                <option value="all">All Courses</option>

                                {isDepartmentsLoading ? (
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
                        <label className="text-xs font-semibold text-[var(--muted-text)]">Search</label>

                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, code, credits, semester..."
                                className="pl-10 pr-4 py-2.5 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none
                  focus:ring-2 focus:ring-indigo-200 transition text-sm text-[var(--text)] placeholder:text-[var(--muted-text)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Loader / Empty States / Grid */}
                {isCoursesLoading ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
                        <Loader />
                    </div>
                ) : visibleCourses.length === 0 ? (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10 text-center shadow-[var(--shadow)]">
                        <h3 className="text-lg font-semibold text-[var(--text)]">No courses found</h3>
                        <p className="text-[var(--muted-text)] text-sm mt-1">
                            Try changing department or search keyword.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleCourses.map((course) => {
                            const isStatusUpdating = !!statusUpdatingMap[course._id];

                            return (
                                <motion.div
                                    layout
                                    key={course._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 transition
                    ${course.isOpen ? "hover:shadow-[var(--shadow)]" : "opacity-60"}`}
                                >
                                    {/* ===== TOP HEADER (Faculty style) ===== */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden shrink-0 grid place-items-center">
                                                <BookOpen size={18} className="text-[var(--muted-text)]" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg font-semibold truncate text-[var(--text)]">
                                                    {course.name}
                                                </h3>
                                                <p className="text-xs text-[var(--muted-text)] truncate">
                                                    Code: {course.code}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Toggle top-right */}
                                        <div className="shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => openChangeStatusModal(course)}
                                                disabled={isStatusUpdating}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full border transition
                          ${course.isOpen
                                                        ? "bg-emerald-500/20 border-emerald-500/30"
                                                        : "bg-red-500/15 border-red-500/25"
                                                    }
                          ${isStatusUpdating ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                        `}
                                                title={course.isOpen ? "Open" : "Closed"}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-[var(--text)] transition
                            ${course.isOpen ? "translate-x-6" : "translate-x-1"}
                          `}
                                                />

                                                {isStatusUpdating && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-text)]" />
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* ===== BADGES ROW (Faculty style) ===== */}
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]">
                                            <Hash size={14} />
                                            {course.code || "N/A"}
                                        </span>

                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border
                        ${course.isOpen
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                                }`}
                                        >
                                            {course.isOpen ? <BadgeCheck size={14} /> : <Ban size={14} />}
                                            {course.isOpen ? "Open" : "Closed"}
                                        </span>

                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]">
                                            <GraduationCap size={14} />
                                            Sem: {course.semester ?? "N/A"}
                                        </span>
                                    </div>

                                    {/* ===== DETAILS ===== */}
                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-[var(--muted-text)]">
                                            <BookOpen size={16} />
                                            <span className="font-semibold text-[var(--text)]">Credits:</span>
                                            <span>{course.credits ?? "N/A"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[var(--muted-text)]">
                                            <GraduationCap size={16} />
                                            <span className="font-semibold text-[var(--text)]">Semester:</span>
                                            <span>{course.semester ?? "N/A"}</span>
                                        </div>
                                    </div>

                                    {/* ===== ACTIONS (bottom like Faculty) ===== */}
                                    <div className="flex items-center gap-2 mt-5">
                                        <button
                                            onClick={() => navigate(`/institution/courses/edit/${course._id}`)}
                                            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
                        hover:bg-[var(--text)] hover:text-[var(--bg)] transition font-semibold text-sm"
                                            type="button"
                                        >
                                            Edit Course
                                        </button>

                                        <button
                                            onClick={() => openDeleteCourseModal(course)}
                                            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
                        hover:bg-red-500/10 text-[var(--muted-text)] hover:text-red-500 transition"
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

            {/* ========= ACTION MODAL ========= */}
            <ConfirmModal
                open={actionModal.open}
                title={actionModal.type === "delete" ? "Delete Course?" : "Change Course Status?"}
                message={
                    actionModal.type === "delete"
                        ? `Before deleting "${actionModal.courseName}", you must finish this course for all assigned faculties.`
                        : actionModal.nextIsOpen === false
                            ? `Before closing "${actionModal.courseName}", you must finish this course for all assigned faculties.`
                            : `You're about to mark "${actionModal.courseName}" as "Open". Continue?`
                }
                confirmText={
                    actionModal.type === "delete"
                        ? "Yes, Delete"
                        : `Yes, Mark ${actionModal.nextIsOpen ? "Open" : "Closed"}`
                }
                cancelText="Cancel"
                variant={actionModal.type === "delete" ? "danger" : "warning"}
                loading={isModalBusy}
                confirmDisabled={confirmDisabled}
                onClose={closeActionModal}
                onConfirm={onConfirmAction}
            >
                {requiresFinishing && (
                    <div className="space-y-3">
                        {/* Heading */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                                <Users className="w-4 h-4 text-[var(--muted-text)]" />
                                Faculty Teaching This Course
                            </div>

                            <span
                                className="text-xs font-bold px-2 py-1 rounded-lg border"
                                style={{
                                    background: "var(--surface-2)",
                                    color: "var(--text)",
                                    borderColor: "var(--border)",
                                }}
                            >
                                {impactedFaculties.length}
                            </span>
                        </div>

                        {/* Loading / Error */}
                        {isImpactLoading ? (
                            <div
                                className="text-sm rounded-xl border px-3 py-2"
                                style={{
                                    background: "var(--surface-2)",
                                    color: "var(--muted-text)",
                                    borderColor: "var(--border)",
                                }}
                            >
                                Loading faculties...
                            </div>
                        ) : impactError ? (
                            <div
                                className="text-sm rounded-xl border px-3 py-2"
                                style={{
                                    background: "var(--surface-2)",
                                    color: "#ef4444",
                                    borderColor: "var(--border)",
                                }}
                            >
                                {impactError}
                            </div>
                        ) : impactedFaculties.length === 0 ? (
                            <div
                                className="text-sm rounded-xl border px-3 py-2"
                                style={{
                                    background: "var(--surface-2)",
                                    color: "var(--muted-text)",
                                    borderColor: "var(--border)",
                                }}
                            >
                                No faculty is currently teaching this course. You can continue.
                            </div>
                        ) : (
                            <div className="max-h-60 overflow-auto space-y-2 pr-1">
                                {impactedFaculties.map((f) => {
                                    const avatar = f?.userId?.avatar || "/user.png";
                                    const name = f?.userId?.name || "Faculty";
                                    const finishing = !!finishLoadingMap[f._id];

                                    return (
                                        <div
                                            key={f._id}
                                            className="rounded-xl border p-3 flex items-center justify-between gap-3"
                                            style={{
                                                background: "var(--surface)",
                                                borderColor: "var(--border)",
                                            }}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={avatar}
                                                    alt={name}
                                                    className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/user.png";
                                                    }}
                                                />

                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-[var(--text)] truncate leading-tight">
                                                        {name}
                                                    </p>
                                                    <p className="text-xs text-[var(--muted-text)] truncate leading-tight">
                                                        {f?.designation || "Faculty"}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    finishCourseForFaculty({
                                                        facultyId: f._id,
                                                        courseId: actionModal.courseId,
                                                    })
                                                }
                                                disabled={finishing || isModalBusy}
                                                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition ${finishing || isModalBusy
                                                        ? "opacity-60 cursor-not-allowed"
                                                        : "hover:opacity-90"
                                                    }`}
                                                style={{
                                                    background: "var(--surface-2)",
                                                    color: "var(--text)",
                                                    borderColor: "var(--border)",
                                                }}
                                                title="Finish this course for this faculty"
                                            >
                                                {finishing ? "Finishing..." : "Finish"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {impactedFaculties.length > 0 && (
                            <div
                                className="text-xs rounded-xl border px-3 py-2"
                                style={{
                                    background: "var(--surface-2)",
                                    color: "var(--muted-text)",
                                    borderColor: "var(--border)",
                                }}
                            >
                                You must finish the course for every faculty before continuing.
                            </div>
                        )}
                    </div>
                )}
            </ConfirmModal>
        </div>
    );
};

export default InstitutionCourses;
