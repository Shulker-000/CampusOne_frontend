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
    UserStar,
    Building,
    Trash2,
    Hash,
} from "lucide-react";
import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";

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

    // ========= Per-faculty loading states =========
    const [statusUpdatingMap, setStatusUpdatingMap] = useState({}); // facultyId -> boolean
    const [isDeletingFaculty, setIsDeletingFaculty] = useState(false);

    // ========= Confirm Modal State =========
    const [actionModal, setActionModal] = useState({
        open: false,
        type: null, // "delete" | "status"
        facultyId: null,
        facultyName: "",
        nextIsActive: null,
    });

    // ========= Impact (Courses of faculty to finish before deactivating) =========
    const [isImpactLoading, setIsImpactLoading] = useState(false);
    const [impactError, setImpactError] = useState("");
    const [impactedCourses, setImpactedCourses] = useState([]); // faculty.courses[]
    const [finishLoadingMap, setFinishLoadingMap] = useState({}); // key -> boolean

    const closeActionModal = () => {
        if (isDeletingFaculty) return;

        // prevent closing while any finish request is running
        const anyFinishing = Object.values(finishLoadingMap).some(Boolean);
        if (anyFinishing) return;

        setActionModal({
            open: false,
            type: null,
            facultyId: null,
            facultyName: "",
            nextIsActive: null,
        });

        setIsImpactLoading(false);
        setImpactError("");
        setImpactedCourses([]);
        setFinishLoadingMap({});
    };

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

    // ========= Helper: read courses safely =========
    const extractCoursesFromFaculty = (facultyObj) => {
        const list = Array.isArray(facultyObj?.courses) ? facultyObj.courses : [];
        return list.map((item, idx) => {
            const course = item?.courseId;
            const courseId =
                typeof course === "string"
                    ? course
                    : course?._id || course?.id || item?.courseId;

            return {
                _key: `${String(courseId)}_${String(item?.batch)}_${String(item?.semester)}_${idx}`,
                courseId: courseId ? String(courseId) : "",
                courseName: course?.name || "Course",
                courseCode: course?.code || "",
                semester: item?.semester ?? "N/A",
                batch: item?.batch ?? "N/A",
            };
        });
    };

    // ========= Impact Load (Faculty -> Courses) =========
    const loadFacultyCoursesImpact = async (faculty) => {
        if (!faculty?._id) return [];

        try {
            setIsImpactLoading(true);
            setImpactError("");
            setImpactedCourses([]);

            // courses are already inside faculty array
            const list = extractCoursesFromFaculty(faculty);

            setImpactedCourses(list);
            return list;
        } catch (err) {
            setImpactError(err.message || "Failed to load courses");
            setImpactedCourses([]);
            return [];
        } finally {
            setIsImpactLoading(false);
        }
    };

    // ========= Finish Course for Faculty (manual, one by one) =========
    const finishCourseForFaculty = async ({ facultyId, courseId, itemKey }) => {
        if (!facultyId || !courseId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setFinishLoadingMap((p) => ({ ...p, [itemKey]: true }));

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

            // remove from impacted list (UI gate)
            setImpactedCourses((prev) => prev.filter((x) => x._key !== itemKey));
        } catch (err) {
            toast.error(err.message || "Failed to finish course");
        } finally {
            setFinishLoadingMap((p) => {
                const copy = { ...p };
                delete copy[itemKey];
                return copy;
            });
        }
    };

    // ========= Open Delete Modal =========
    const openDeleteFacultyModal = async (faculty) => {
        if (!faculty?._id) return;

        const name = faculty?.userId?.name || "this faculty";

        setActionModal({
            open: true,
            type: "delete",
            facultyId: faculty._id,
            facultyName: name,
            nextIsActive: null,
        });
    };

    // ========= Delete Faculty =========
    const deleteFaculty = async () => {
        if (!actionModal.facultyId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setIsDeletingFaculty(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/delete-faculty/${actionModal.facultyId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${institutionToken}` },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");

            toast.success("Faculty deleted");
            setFaculties((prev) => prev.filter((x) => x._id !== actionModal.facultyId));
            closeActionModal();
        } catch (err) {
            toast.error(err.message || "Delete failed");
        } finally {
            setIsDeletingFaculty(false);
        }
    };

    // ========= Open Status Modal =========
    const openChangeStatusModal = async (faculty) => {
        if (!faculty?._id) return;

        const nextIsActive = !faculty.isActive;

        // Only enforce finish-course when trying to DEACTIVATE
        if (nextIsActive === false) {
            await loadFacultyCoursesImpact(faculty);
        } else {
            setImpactedCourses([]);
            setImpactError("");
        }

        setActionModal({
            open: true,
            type: "status",
            facultyId: faculty._id,
            facultyName: faculty?.userId?.name || "this faculty",
            nextIsActive,
        });
    };

    // ========= Update Faculty Active Status =========
    const updateFacultyStatus = async () => {
        const { facultyId, nextIsActive } = actionModal;

        if (!facultyId || typeof nextIsActive !== "boolean") return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setStatusUpdatingMap((prev) => ({ ...prev, [facultyId]: true }));

            // ✅ If deactivating, remove incharge first
            const currentFaculty = faculties.find((x) => String(x._id) === String(facultyId));

            if (nextIsActive === false && currentFaculty?.isInCharge) {
                const resInCharge = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/faculties/toggle-in-charge/${facultyId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${institutionToken}`,
                        },
                        body: JSON.stringify({ isInCharge: false }),
                    }
                );

                const dataInCharge = await resInCharge.json();
                if (!resInCharge.ok) {
                    throw new Error(dataInCharge?.message || "Failed to remove in-charge");
                }


                // update UI so badge disappears instantly
                setFaculties((prev) =>
                    prev.map((x) =>
                        String(x._id) === String(facultyId) ? { ...x, isInCharge: false } : x
                    )
                );
            }

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/change-status/${facultyId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${institutionToken}`,
                    },
                    body: JSON.stringify({ isActive: nextIsActive }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Status update failed");

            const updated = data?.data;

            setFaculties((prev) =>
                prev.map((x) => (x._id === facultyId ? { ...x, ...updated } : x))
            );

            toast.success(`Faculty is now ${nextIsActive ? "Active" : "Inactive"}`);
            closeActionModal();
        } catch (err) {
            toast.error(err.message || "Status update failed");
        } finally {
            setStatusUpdatingMap((prev) => {
                const copy = { ...prev };
                delete copy[facultyId];
                return copy;
            });
        }
    };

    const onConfirmAction = () => {
        if (actionModal.type === "delete") return deleteFaculty();
        if (actionModal.type === "status") return updateFacultyStatus();
    };

    // ========= Confirmation Guard =========
    const requiresFinishing =
        actionModal.type === "status" && actionModal.nextIsActive === false;

    const pendingImpactCount = impactedCourses.length;

    const confirmDisabled =
        requiresFinishing && (isImpactLoading || pendingImpactCount > 0);

    const isModalBusy =
        isDeletingFaculty ||
        (actionModal.type === "status" && !!statusUpdatingMap[actionModal.facultyId]);

    if (loading) {
        return <Loader />;
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

                {/* Controls row */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-6">
                    {/* Department */}
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

                    {/* Search */}
                    <div className="w-full md:basis-2/5">
                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                            Search
                        </label>

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
                        <h3 className="text-lg font-semibold text-[var(--text)]">
                            No faculties found
                        </h3>
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

                            const isStatusUpdating = !!statusUpdatingMap[f._id];

                            return (
                                <motion.div
                                    layout
                                    key={f._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 transition
    ${f.isActive ? "hover:shadow-[var(--shadow)]" : "opacity-60"}`}
                                >
                                    {/* ===== TOP HEADER (like Courses) ===== */}
                                    <div className="flex items-start justify-between gap-3">
                                        {/* Left: Avatar + Name */}
                                        <div className="min-w-0 flex-1 flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden shrink-0 grid place-items-center">
                                                {user?.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user?.name || "Faculty"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User2 size={18} className="text-[var(--muted-text)]" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg font-semibold truncate text-[var(--text)]">
                                                    {user?.name || "Faculty"}
                                                </h3>

                                                <p className="text-xs text-[var(--muted-text)] truncate">
                                                    {deptName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Toggle */}
                                        <div className="shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => openChangeStatusModal(f)}
                                                disabled={isStatusUpdating}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full border transition
          ${f.isActive
                                                        ? "bg-emerald-500/20 border-emerald-500/30"
                                                        : "bg-red-500/15 border-red-500/25"}
          ${isStatusUpdating ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        `}
                                                title={f.isActive ? "Active" : "Inactive"}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-[var(--text)] transition
            ${f.isActive ? "translate-x-6" : "translate-x-1"}
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

                                    {/* ===== BADGES ROW ===== */}
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
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

                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]">
                                            <BookOpen size={14} />
                                            {courseCount} Courses
                                        </span>
                                    </div>

                                    {/* ===== DETAILS ===== */}
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
                                            <UserStar size={16} />
                                            <span className="font-semibold text-[var(--text)]">Designation:</span>
                                            <span className="truncate">{f.designation || "N/A"}</span>
                                        </div>

                                        <p className="text-[11px] text-[var(--muted-text)]">
                                            Joined:{" "}
                                            <span className="font-semibold text-[var(--text)]">
                                                {formatDate(f.dateOfJoining)}
                                            </span>
                                        </p>
                                    </div>

                                    {/* ===== ACTIONS (BOTTOM, CLEAN) ===== */}
                                    <div className="flex items-center gap-2 mt-5">
                                        <button
                                            onClick={() => navigate(`/institution/faculties/edit/${f._id}`)}
                                            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
        hover:bg-[var(--text)] hover:text-[var(--bg)] transition font-semibold text-sm"
                                            type="button"
                                        >
                                            Edit Faculty
                                        </button>

                                        <button
                                            onClick={() => openDeleteFacultyModal(f)}
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

                {/* ========= ACTION MODAL ========= */}
                <ConfirmModal
                    open={actionModal.open}
                    title={
                        actionModal.type === "delete"
                            ? "Delete Faculty?"
                            : "Change Faculty Status?"
                    }
                    message={
                        actionModal.type === "delete"
                            ? `Are you sure you want to delete "${actionModal.facultyName}"? This action cannot be undone.`
                            : actionModal.nextIsActive === false
                                ? `Before deactivating "${actionModal.facultyName}", you must finish all assigned courses.`
                                : `You're about to mark "${actionModal.facultyName}" as "Active". Continue?`
                    }
                    confirmText={
                        actionModal.type === "delete"
                            ? "Yes, Delete"
                            : `Yes, Mark ${actionModal.nextIsActive ? "Active" : "Inactive"}`
                    }
                    cancelText="Cancel"
                    variant={actionModal.type === "delete" ? "danger" : "warning"}
                    loading={isModalBusy}
                    confirmDisabled={actionModal.type === "status" ? confirmDisabled : false}
                    onClose={closeActionModal}
                    onConfirm={onConfirmAction}
                >
                    {requiresFinishing && (
                        <div className="space-y-3">
                            {/* Heading */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                                    <BookOpen className="w-4 h-4 text-[var(--muted-text)]" />
                                    Courses Assigned To Faculty
                                </div>

                                <span
                                    className="text-xs font-bold px-2 py-1 rounded-lg border"
                                    style={{
                                        background: "var(--surface-2)",
                                        color: "var(--text)",
                                        borderColor: "var(--border)",
                                    }}
                                >
                                    {impactedCourses.length}
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
                                    Loading courses...
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
                            ) : impactedCourses.length === 0 ? (
                                <div
                                    className="text-sm rounded-xl border px-3 py-2"
                                    style={{
                                        background: "var(--surface-2)",
                                        color: "var(--muted-text)",
                                        borderColor: "var(--border)",
                                    }}
                                >
                                    No active course is assigned. You can continue.
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-auto space-y-2 pr-1">
                                    {impactedCourses.map((c) => {
                                        const finishing = !!finishLoadingMap[c._key];

                                        return (
                                            <div
                                                key={c._key}
                                                className="rounded-xl border p-3 flex items-center justify-between gap-3"
                                                style={{
                                                    background: "var(--surface)",
                                                    borderColor: "var(--border)",
                                                }}
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-[var(--text)] truncate leading-tight">
                                                        {c.courseName}
                                                        {c.courseCode ? ` (${c.courseCode})` : ""}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border"
                                                            style={{
                                                                background: "var(--surface-2)",
                                                                color: "var(--text)",
                                                                borderColor: "var(--border)",
                                                            }}
                                                        >
                                                            <Hash size={12} />
                                                            Sem: {c.semester}
                                                        </span>

                                                        <span
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border"
                                                            style={{
                                                                background: "var(--surface-2)",
                                                                color: "var(--text)",
                                                                borderColor: "var(--border)",
                                                            }}
                                                        >
                                                            Batch: {c.batch}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        finishCourseForFaculty({
                                                            facultyId: actionModal.facultyId,
                                                            courseId: c.courseId,
                                                            itemKey: c._key,
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

                            {impactedCourses.length > 0 && (
                                <div
                                    className="text-xs rounded-xl border px-3 py-2"
                                    style={{
                                        background: "var(--surface-2)",
                                        color: "var(--muted-text)",
                                        borderColor: "var(--border)",
                                    }}
                                >
                                    You must finish every course before continuing.
                                </div>
                            )}
                        </div>
                    )}
                </ConfirmModal>
            </div>
        </div>
    );
};

export default InstitutionFaculties;
