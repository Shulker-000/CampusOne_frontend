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
    BookOpen,
    Hash,
} from "lucide-react";
import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";
import InstitutionFacultiesCard from "./InstitutionFacultiesCard";
import EditModal from "../EditModal";


const InstitutionFaculties = () => {
    const navigate = useNavigate();
    const institutionId = useSelector((s) => s.auth.institution.data?._id);

    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [faculties, setFaculties] = useState([]);
    const [query, setQuery] = useState("");

    const [statusUpdatingMap, setStatusUpdatingMap] = useState({});
    const [isDeletingFaculty, setIsDeletingFaculty] = useState(false);

    const [actionModal, setActionModal] = useState({
        open: false,
        type: null,
        facultyId: null,
        facultyName: "",
        nextIsActive: null,
    });

    const [isImpactLoading, setIsImpactLoading] = useState(false);
    const [impactError, setImpactError] = useState("");
    const [impactedCourses, setImpactedCourses] = useState([]);
    const [finishLoadingMap, setFinishLoadingMap] = useState({});

    // edit designation modal
const [editFaculty, setEditFaculty] = useState(null);
const [savingDesignation, setSavingDesignation] = useState(false);
const [designation, setDesignation] = useState("");


    const closeActionModal = () => {
        if (isDeletingFaculty) return;
        if (Object.values(finishLoadingMap).some(Boolean)) return;

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

    // ================= Fetch =================
    const fetchDepartments = async () => {
        if (!institutionId) return;
        try {
            setDepartmentsLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
                { credentials: "include" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setDepartments(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch departments");
        } finally {
            setDepartmentsLoading(false);
        }
    };

    const fetchFaculties = async () => {
        if (!institutionId) return;
        try {
            setLoading(true);
            const url =
                selectedDept === "ALL"
                    ? `${import.meta.env.VITE_BACKEND_URL}/api/faculties/by-institution/${institutionId}`
                    : `${import.meta.env.VITE_BACKEND_URL}/api/faculties/by-department/${selectedDept}`;

            const res = await fetch(url, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
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

    // ================= Filters =================
    const filteredFaculties = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return faculties;

        return faculties.filter((f) => {
            const u = f.userId;
            return (
                (u?.name || "").toLowerCase().includes(q) ||
                (u?.email || "").toLowerCase().includes(q) ||
                (u?.phone || "").toLowerCase().includes(q) ||
                (f?.designation || "").toLowerCase().includes(q) ||
                (f?.departmentId?.name || "").toLowerCase().includes(q)
            );
        });
    }, [faculties, query]);

    // ================= Impact helpers =================
    const extractCoursesFromFaculty = (faculty) => {
        const list = Array.isArray(faculty?.courses) ? faculty.courses : [];
        return list.map((item, idx) => {
            const course = item?.courseId;
            const courseId =
                typeof course === "string"
                    ? course
                    : course?._id || item?.courseId;

            return {
                _key: `${courseId}_${item?.batch}_${item?.semester}_${idx}`,
                courseId,
                courseName: course?.name || "Course",
                courseCode: course?.code || "",
                semester: item?.semester ?? "N/A",
                batch: item?.batch ?? "N/A",
            };
        });
    };

    const loadFacultyCoursesImpact = async (faculty) => {
        try {
            setIsImpactLoading(true);
            setImpactError("");
            const list = extractCoursesFromFaculty(faculty);
            setImpactedCourses(list);
            return list;
        } catch (err) {
            setImpactError(err.message);
            setImpactedCourses([]);
            return [];
        } finally {
            setIsImpactLoading(false);
        }
    };

    const finishCourseForFaculty = async ({ facultyId, courseId, batch, itemKey }) => {
        try {
            setFinishLoadingMap((p) => ({ ...p, [itemKey]: true }));
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/courses/${courseId}/finish`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ batch }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Course finished for faculty");
            setImpactedCourses((p) => p.filter((x) => x._key !== itemKey));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setFinishLoadingMap((p) => {
                const c = { ...p };
                delete c[itemKey];
                return c;
            });
        }
    };

    // ================= Modals =================
    const openDeleteFacultyModal = (faculty) => {
        setActionModal({
            open: true,
            type: "delete",
            facultyId: faculty._id,
            facultyName: faculty?.userId?.name || "this faculty",
            nextIsActive: null,
        });
    };

    const openChangeStatusModal = async (faculty) => {
        const nextIsActive = !faculty.isActive;

        if (!nextIsActive) {
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

    const openEditDesignation = (faculty) => {
    setDesignation(faculty.designation || "");
    setEditFaculty(faculty);
};

const saveDesignation = async () => {
    if (!designation.trim()) {
        toast.error("Designation is required");
        return;
    }

    try {
        setSavingDesignation(true);

        const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${editFaculty._id}`,
            {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ designation }),
            }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        toast.success("Designation updated");

        setFaculties((prev) =>
            prev.map((f) =>
                f._id === editFaculty._id
                    ? { ...f, designation }
                    : f
            )
        );

        setEditFaculty(null);
    } catch (err) {
        toast.error(err.message || "Update failed");
    } finally {
        setSavingDesignation(false);
    }
};


    const deleteFaculty = async () => {
        try {
            setIsDeletingFaculty(true);
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${actionModal.facultyId}`,
                { method: "DELETE", credentials: "include" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setFaculties((p) => p.filter((x) => x._id !== actionModal.facultyId));
            toast.success("Faculty deleted");
            closeActionModal();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsDeletingFaculty(false);
        }
    };

    const updateFacultyStatus = async () => {
        const { facultyId, nextIsActive } = actionModal;

        try {
            setStatusUpdatingMap((p) => ({ ...p, [facultyId]: true }));
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/status`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isActive: nextIsActive }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setFaculties((p) =>
                p.map((x) => (x._id === facultyId ? { ...x, ...data.data } : x))
            );

            toast.success(
                `Faculty is now ${nextIsActive ? "Active" : "Inactive"}`
            );
            closeActionModal();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setStatusUpdatingMap((p) => {
                const c = { ...p };
                delete c[facultyId];
                return c;
            });
        }
    };

    const onConfirmAction = () => {
        if (actionModal.type === "delete") return deleteFaculty();
        if (actionModal.type === "status") return updateFacultyStatus();
    };

    const requiresFinishing =
        actionModal.type === "status" && actionModal.nextIsActive === false;

    const confirmDisabled =
        requiresFinishing && (isImpactLoading || impactedCourses.length > 0);

    const isModalBusy =
        isDeletingFaculty ||
        (actionModal.type === "status" &&
            !!statusUpdatingMap[actionModal.facultyId]);

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-6xl mx-auto px-5 py-10">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Faculties</h1>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border
                        border-[var(--border)] bg-[var(--surface-2)] px-4 py-2">
                        <Users size={18} />
                        <p className="text-sm font-semibold">
                            {filteredFaculties.length} Faculties
                        </p>
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="w-full md:basis-3/5">
                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                            Department:
                        </label>
                        <div className="relative mt-1">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                disabled={departmentsLoading}
                                className="w-full rounded-xl border border-[var(--border)]
                                pl-10 pr-4 py-2.5 text-sm bg-[var(--surface-2)]"
                            >
                                <option value="ALL">
                                    {departmentsLoading
                                        ? "Loading departments..."
                                        : "All Departments"}
                                </option>
                                {departments.map((d) => (
                                    <option key={d._id} value={d._id}>
                                        {d.name} ({d.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

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
                                className="pl-10 pr-4 py-2.5 w-full rounded-xl border
                                bg-[var(--surface)] text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* EMPTY / GRID */}
                {filteredFaculties.length === 0 ? (
                    <div className="bg-[var(--surface)] border rounded-2xl p-10 text-center">
                        <h3 className="text-lg font-semibold">No faculties found</h3>
                        <p className="text-sm text-[var(--muted-text)] mt-1">
                            Try changing department or search keyword.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredFaculties.map((f) => {
                            const deptName =
                                f?.departmentId?.name ||
                                departments.find((d) => d._id === f.departmentId)?.name;

                            return (
                                <InstitutionFacultiesCard
                                    key={f._id}
                                    faculty={f}
                                    departmentName={deptName}
                                    courseCount={Array.isArray(f.courses) ? f.courses.length : 0}
                                    isStatusUpdating={!!statusUpdatingMap[f._id]}
                                    onToggleStatus={() => openChangeStatusModal(f)}
                                     onEdit={() => openEditDesignation(f)}
                                    onDelete={() => openDeleteFacultyModal(f)}
                                    showEdit
                                    showDelete
                                />
                            );
                        })}
                    </div>
                )}

                {/* MODAL (unchanged UI) */}
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
                            {/* HEADER */}
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

                            {/* LOADING */}
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
                                                            batch: c.batch,
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

<EditModal
    open={!!editFaculty}
    title="Edit Designation"
    confirmText="Save Changes"
    loading={savingDesignation}
    onClose={() => !savingDesignation && setEditFaculty(null)}
    onConfirm={saveDesignation}
>
    <div className="space-y-1">
        <label className="text-xs font-bold uppercase text-[var(--muted-text)]">
            Designation
        </label>
        <input
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Assistant Professor"
            className="w-full rounded-xl border px-3 py-3 bg-[var(--surface-2)]"
        />
    </div>
</EditModal>

            </div>
        </div>
    );
};

export default InstitutionFaculties;
