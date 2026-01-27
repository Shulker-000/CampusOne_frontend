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
    Building2,
    Users,
    BadgeCheck,
    Ban,
    CheckCircle2,
    X,
    Trash,
} from "lucide-react";

import ConfirmModal from "../../../components/ConfirmModal";
import Loader from "../../../components/Loader";

/**
 * ✅ Small, reusable tab button UI (top-left)
 */
const ModalTabs = ({ active, onChange, tabs = [] }) => {
    return (
        <div className="flex items-center gap-2">
            {tabs.map((t) => {
                const isActive = active === t.key;

                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => onChange(t.key)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition ${isActive ? "" : "hover:opacity-90"
                            }`}
                        style={{
                            background: isActive ? "var(--surface)" : "var(--surface-2)",
                            borderColor: isActive ? "var(--accent)" : "var(--border)",
                            color: "var(--text)",
                        }}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
};

/**
 * ✅ One row = one Faculty + one Batch
 * Supports:
 * - Previous tag
 * - Delete (current/previous)
 */
const FacultyBatchRow = ({
    row,
    busy = false,
    onDelete,
}) => {
    const avatar = row?.avatar || "/user.png";
    const name = row?.name || "Faculty";
    const designation = row?.designation || "Faculty";
    const batch = row?.batch || "N/A";
    const isPrev = !!row?.isPrev;

    return (
        <div
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
                        {name}{" "}
                        <span className="text-xs font-semibold text-[var(--muted-text)]">
                            ({batch})
                        </span>
                    </p>

                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-[var(--muted-text)] truncate leading-tight">
                            {designation}
                        </p>

                        {isPrev && (
                            <span
                                className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                                style={{
                                    background: "var(--surface-2)",
                                    borderColor: "var(--border)",
                                    color: "var(--muted-text)",
                                }}
                                title="This entry is from previous courses"
                            >
                                Previous
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition ${busy ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                    }`}
                style={{
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                }}
                title="Remove this faculty-course entry"
            >
                {busy ? "Deleting..." : "Delete"}
            </button>
        </div>
    );
};

/**
 * ✅ One row = one Student
 * Supports:
 * - Previous tag
 * - Delete (current/previous)
 */
const StudentRow = ({ row, busy = false, onDelete }) => {
    const avatar = row?.avatar || "/user.png";
    const name = row?.name || "Student";
    const enrollmentNumber = row?.enrollmentNumber || "N/A";
    const isPrev = !!row?.isPrev;

    return (
        <div
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

                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-[var(--muted-text)] truncate leading-tight">
                            Enrollment: {enrollmentNumber}
                        </p>

                        {isPrev && (
                            <span
                                className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                                style={{
                                    background: "var(--surface-2)",
                                    borderColor: "var(--border)",
                                    color: "var(--muted-text)",
                                }}
                                title="This entry is from previous courses"
                            >
                                Previous
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition ${busy ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                    }`}
                style={{
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                }}
                title="Remove this student-course entry"
            >
                {busy ? "Deleting..." : "Delete"}
            </button>
        </div>
    );
};

const InstitutionCourses = () => {
    const navigate = useNavigate();

    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const institutionToken = useSelector((s) => s.auth.institution.token);

    // ========= Departments =========
    const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("all");

    // ========= Courses =========
    const [isCoursesLoading, setIsCoursesLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // ========= Per-course loading states =========
    const [statusUpdatingMap, setStatusUpdatingMap] = useState({});
    const [isDeletingCourse, setIsDeletingCourse] = useState(false);

    // ========= Confirm Modal State =========
    const [actionModal, setActionModal] = useState({
        open: false,
        type: null, // "delete" | "status"
        courseId: null,
        courseName: "",
        nextIsOpen: null,
    });

    // ========= Modal UI states =========
    const [activeImpactTab, setActiveImpactTab] = useState("faculties"); // "faculties" | "students"

    // ========= Impact loading + errors =========
    const [isImpactLoading, setIsImpactLoading] = useState(false);
    const [impactError, setImpactError] = useState("");
    const [studentsImpactError, setStudentsImpactError] = useState("");

    // ========= Impacted Lists =========
    // Faculty rows will include both current + previous; row.isPrev tells previous
    const [facultyBatchRows, setFacultyBatchRows] = useState([]);
    // Student rows will include both current + previous; row.isPrev tells previous
    const [impactedStudents, setImpactedStudents] = useState([]);

    // ========= Delete Row loading maps =========
    const [deleteFacultyRowLoading, setDeleteFacultyRowLoading] = useState({});
    const [deleteStudentRowLoading, setDeleteStudentRowLoading] = useState({});

    // ========= Bulk delete loading flags =========
    const [deleteAllFacultiesBusy, setDeleteAllFacultiesBusy] = useState(false);
    const [deleteAllStudentsBusy, setDeleteAllStudentsBusy] = useState(false);

    const closeActionModal = () => {
        // Guard: if delete/status update is running, don't allow closing the modal
        if (isDeletingCourse) return;

        const statusBusy =
            actionModal.type === "status" && !!statusUpdatingMap[actionModal.courseId];
        if (statusBusy) return;

        // Guard: bulk delete busy flags
        if (deleteAllFacultiesBusy || deleteAllStudentsBusy) return;

        // Guard: any row delete running
        const anyDeletingFaculty = Object.values(deleteFacultyRowLoading).some(Boolean);
        const anyDeletingStudent = Object.values(deleteStudentRowLoading).some(Boolean);
        if (anyDeletingFaculty || anyDeletingStudent) return;

        setActionModal({
            open: false,
            type: null,
            courseId: null,
            courseName: "",
            nextIsOpen: null,
        });

        // Reset modal UI state
        setActiveImpactTab("faculties");

        // Reset impact states
        setIsImpactLoading(false);
        setImpactError("");
        setStudentsImpactError("");
        setFacultyBatchRows([]);
        setImpactedStudents([]);

        // Reset delete loading maps
        setDeleteFacultyRowLoading({});
        setDeleteStudentRowLoading({});
        setDeleteAllFacultiesBusy(false);
        setDeleteAllStudentsBusy(false);
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
                { credentials: "include" }
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
                { credentials: "include" }
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

    // ========= Helpers =========
    const getDepartmentIdOfCourse = (courseId) => {
        const selectedCourse = courses.find((c) => String(c._id) === String(courseId));
        return selectedCourse?.departmentId;
    };

    /**
     * Flatten Faculty list -> FacultyBatch rows
     * adds isPrev flag
     */
    const flattenFacultyToRows = (faculties, courseId, isPrev = false) => {
        const cid = String(courseId);
        const out = [];

        for (const f of faculties) {
            const listKey = isPrev ? "prevCourses" : "courses";
            const fcourses = Array.isArray(f?.[listKey]) ? f[listKey] : [];

            for (const c of fcourses) {
                if (String(c?.courseId) !== cid) continue;

                out.push({
                    key: `${f._id}__${c.batch}__${isPrev ? "prev" : "curr"}`,
                    facultyId: f._id,
                    courseId: courseId,
                    batch: c.batch,
                    semester: c.semester,

                    isPrev,

                    // presentation
                    name: f?.userId?.name || "Faculty",
                    avatar: f?.userId?.avatar || "/user.png",
                    designation: f?.designation || "Faculty",
                });
            }
        }

        return out;
    };

    /**
     * Normalize Student list -> Student rows
     * adds isPrev flag
     */
    const normalizeStudents = (list, isPrev = false) => {
        const arr = Array.isArray(list) ? list : [];

        return arr.map((s) => ({
            key: `${s._id}__${isPrev ? "prev" : "curr"}`,
            _id: s._id,
            name: s?.userId?.name || s?.user?.name || "Student",
            avatar: s?.userId?.avatar || s?.user?.avatar || "/user.png",
            enrollmentNumber: s?.enrollmentNumber || s?.userId?.enrollmentNumber || "N/A",
            isPrev,
        }));
    };

    // ========= Impact Fetchers =========

    /**
     * Fetch impacted faculties for course:
     * - current:  GET /api/courses/faculty/course/:courseId/institution/:institutionId
     * - previous: GET /api/courses/faculty/prev-course/:courseId/institution/:institutionId
     */
    const fetchFacultyRowsForDelete = async (courseId) => {
        if (!courseId) return [];

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return [];
        }

        try {
            setIsImpactLoading(true);
            setImpactError("");
            setFacultyBatchRows([]);

            const [currRes, prevRes] = await Promise.allSettled([
                fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/courses/faculty/course/${courseId}/institution/${institutionId}`,
                    { credentials: "include" }
                ),
                fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/courses/faculty/prev-course/${courseId}/institution/${institutionId}`,
                    { credentials: "include" }
                ),
            ]);

            const currList = [];
            const prevList = [];

            // Current
            if (currRes.status === "fulfilled") {
                const res = currRes.value;
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    const list = Array.isArray(data?.data) ? data.data : [];
                    currList.push(...flattenFacultyToRows(list, courseId, false));
                } else if (res.status !== 404) {
                    throw new Error(data?.message || "Failed to fetch faculties");
                }
            }

            // Previous
            if (prevRes.status === "fulfilled") {
                const res = prevRes.value;
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    const list = Array.isArray(data?.data) ? data.data : [];
                    prevList.push(...flattenFacultyToRows(list, courseId, true));
                } else if (res.status !== 404) {
                    throw new Error(data?.message || "Failed to fetch previous faculties");
                }
            }

            const merged = [...currList, ...prevList];

            setFacultyBatchRows(merged);
            return merged;
        } catch (err) {
            setImpactError(err.message || "Failed to fetch impacted faculties");
            setFacultyBatchRows([]);
            return [];
        } finally {
            setIsImpactLoading(false);
        }
    };

    /**
     * Fetch impacted students for course:
     * - current:  GET /api/courses/student/course/:courseId/institution/:institutionId
     * - previous: GET /api/courses/student/prev-course/:courseId/institution/:institutionId
     */
    const fetchStudentsForDelete = async (courseId) => {
        if (!courseId) return [];

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return [];
        }

        try {
            setIsImpactLoading(true);
            setStudentsImpactError("");
            setImpactedStudents([]);

            const [currRes, prevRes] = await Promise.allSettled([
                fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/courses/student/course/${courseId}/institution/${institutionId}`,
                    { credentials: "include" }
                ),
                fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/courses/student/prev-course/${courseId}/institution/${institutionId}`,
                    { credentials: "include" }
                ),
            ]);

            const currList = [];
            const prevList = [];

            // Current
            if (currRes.status === "fulfilled") {
                const res = currRes.value;
                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    currList.push(...normalizeStudents(data?.data, false));
                } else if (res.status !== 404) {
                    throw new Error(data?.message || "Failed to fetch students");
                }
            }

            // Previous
            if (prevRes.status === "fulfilled") {
                const res = prevRes.value;
                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    prevList.push(...normalizeStudents(data?.data, true));
                } else if (res.status !== 404) {
                    throw new Error(data?.message || "Failed to fetch previous students");
                }
            }

            const merged = [...currList, ...prevList];

            setImpactedStudents(merged);
            return merged;
        } catch (err) {
            setStudentsImpactError(err.message || "Failed to fetch impacted students");
            setImpactedStudents([]);
            return [];
        } finally {
            setIsImpactLoading(false);
        }
    };

    // ========= Status Modal existing handlers (UNCHANGED logic) =========

    /**
     * ✅ Fetch impacted faculties for status close (current only)
     * Route used:
     * GET /api/courses/faculty/course/:courseId/institution/:institutionId
     */
    const fetchFacultyBatchRowsForCourse = async (courseId) => {
        if (!courseId) return [];

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return [];
        }

        const departmentIdOfCourse = getDepartmentIdOfCourse(courseId);
        if (!departmentIdOfCourse) {
            toast.error("Department not found for this course.");
            return [];
        }

        try {
            setIsImpactLoading(true);
            setImpactError("");
            setFacultyBatchRows([]);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/faculty/course/${courseId}/institution/${institutionId}`,
                { credentials: "include" }
            );

            const data = await res.json();

            if (res.status === 404) {
                setFacultyBatchRows([]);
                return [];
            }

            if (!res.ok) throw new Error(data?.message || "Failed to fetch faculties");

            const list = Array.isArray(data?.data) ? data.data : [];
            const rows = flattenFacultyToRows(list, courseId, false);

            setFacultyBatchRows(rows);
            return rows;
        } catch (err) {
            setImpactError(err.message || "Failed to fetch impacted faculties");
            setFacultyBatchRows([]);
            return [];
        } finally {
            setIsImpactLoading(false);
        }
    };

    /**
     * ✅ Fetch impacted students for status close (current only)
     * Route used:
     * GET /api/courses/student/course/:courseId/institution/:institutionId
     */
    const fetchStudentsForCourse = async (courseId) => {
        if (!courseId) return [];

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return [];
        }

        const departmentIdOfCourse = getDepartmentIdOfCourse(courseId);
        if (!departmentIdOfCourse) {
            toast.error("Department not found for this course.");
            return [];
        }

        try {
            setIsImpactLoading(true);
            setStudentsImpactError("");
            setImpactedStudents([]);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/student/course/${courseId}/institution/${institutionId}`,
                { credentials: "include" }
            );

            const data = await res.json();

            if (res.status === 404) {
                setImpactedStudents([]);
                return [];
            }

            if (!res.ok) throw new Error(data?.message || "Failed to fetch students");

            const list = Array.isArray(data?.data) ? data.data : [];

            const normalized = list.map((s) => ({
                _id: s._id,
                name: s?.userId?.name || "Student",
                avatar: s?.userId?.avatar || "/user.png",
                enrollmentNumber: s?.enrollmentNumber || s?.userId?.enrollmentNumber || "N/A",
            }));

            setImpactedStudents(normalized);
            return normalized;
        } catch (err) {
            setStudentsImpactError(err.message || "Failed to fetch impacted students");
            setImpactedStudents([]);
            return [];
        } finally {
            setIsImpactLoading(false);
        }
    };

    // ========= Finish Handlers (status close) =========

    const [finishFacultyRowLoading, setFinishFacultyRowLoading] = useState({});
    const [finishStudentLoading, setFinishStudentLoading] = useState({});
    const [finishAllFacultiesBusy, setFinishAllFacultiesBusy] = useState(false);
    const [finishAllStudentsBusy, setFinishAllStudentsBusy] = useState(false);

    const finishOneFacultyBatchRow = async (row) => {
        if (!row?.facultyId || !row?.courseId || !row?.batch) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        const key = row.key;

        try {
            setFinishFacultyRowLoading((p) => ({ ...p, [key]: true }));

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${row.facultyId}/courses/${row.courseId}/finish`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        credentials: "include",
                    },
                    body: JSON.stringify({ batch: row.batch }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to finish faculty course");

            setFacultyBatchRows((prev) => prev.filter((r) => r.key !== key));
            toast.success(`Finished: ${row.name} (${row.batch})`);
        } catch (err) {
            toast.error(err.message || "Failed to finish faculty course");
        } finally {
            setFinishFacultyRowLoading((p) => {
                const copy = { ...p };
                delete copy[key];
                return copy;
            });
        }
    };

    const finishAllFaculties = async () => {
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (facultyBatchRows.length === 0) return;

        setFinishAllFacultiesBusy(true);

        const rows = [...facultyBatchRows];
        let successCount = 0;

        try {
            for (const row of rows) {
                const stillPending = facultyBatchRows.some((r) => r.key === row.key);
                if (!stillPending) continue;

                setFinishFacultyRowLoading((p) => ({ ...p, [row.key]: true }));

                try {
                    const res = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${row.facultyId}/courses/${row.courseId}/finish`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                credentials: "include",
                            },
                            body: JSON.stringify({ batch: row.batch }),
                        }
                    );

                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.message || "Failed to finish faculty course");

                    successCount++;
                    setFacultyBatchRows((prev) => prev.filter((r) => r.key !== row.key));
                } catch (err) {
                    toast.error(`${row.name} (${row.batch}): ${err.message || "Failed"}`);
                } finally {
                    setFinishFacultyRowLoading((p) => {
                        const copy = { ...p };
                        delete copy[row.key];
                        return copy;
                    });
                }
            }

            if (successCount > 0) {
                toast.success(`Finished ${successCount} faculty-batch entries`);
            }
        } finally {
            setFinishAllFacultiesBusy(false);
        }
    };

    const finishOneStudent = async (studentId) => {
        if (!studentId || !actionModal.courseId) return;

        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setFinishStudentLoading((p) => ({ ...p, [studentId]: true }));

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/students/finish-courses/${studentId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        credentials: "include",
                    },
                    body: JSON.stringify({ courseIds: [actionModal.courseId] }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to finish student course");

            setImpactedStudents((prev) => prev.filter((s) => s._id !== studentId));
            toast.success("Student course finished");
        } catch (err) {
            toast.error(err.message || "Failed to finish student course");
        } finally {
            setFinishStudentLoading((p) => {
                const copy = { ...p };
                delete copy[studentId];
                return copy;
            });
        }
    };

    const finishAllStudents = async () => {
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (!actionModal.courseId) return;
        if (impactedStudents.length === 0) return;

        setFinishAllStudentsBusy(true);

        const list = [...impactedStudents];
        let successCount = 0;

        try {
            for (const s of list) {
                if (!s?._id) continue;

                const stillPending = impactedStudents.some((x) => x._id === s._id);
                if (!stillPending) continue;

                setFinishStudentLoading((p) => ({ ...p, [s._id]: true }));

                try {
                    const res = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/students/finish-courses/${s._id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                credentials: "include",
                            },
                            body: JSON.stringify({ courseIds: [actionModal.courseId] }),
                        }
                    );

                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.message || "Failed");

                    successCount++;
                    setImpactedStudents((prev) => prev.filter((x) => x._id !== s._id));
                } catch (err) {
                    toast.error(`${s.name}: ${err.message || "Failed"}`);
                } finally {
                    setFinishStudentLoading((p) => {
                        const copy = { ...p };
                        delete copy[s._id];
                        return copy;
                    });
                }
            }

            if (successCount > 0) {
                toast.success(`Finished ${successCount} students`);
            }
        } finally {
            setFinishAllStudentsBusy(false);
        }
    };

    // ========= Open Delete Modal =========
    const openDeleteCourseModal = async (course) => {
        if (!course?._id) return;

        setActiveImpactTab("faculties");

        setActionModal({
            open: true,
            type: "delete",
            courseId: course._id,
            courseName: course.name || "this course",
            nextIsOpen: null,
        });

        // Fetch impacted lists for delete modal (current + previous merged)
        await Promise.all([
            fetchFacultyRowsForDelete(course._id),
            fetchStudentsForDelete(course._id),
        ]);
    };

    // ========= Delete Course (Delete Everything + Basic Delete both use this) =========
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
                    credentials: "include",
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

    // ========= Delete Faculty Row =========
    const deleteOneFacultyRow = async (row) => {
        if (!row?.facultyId || !row?.courseId || !row?.batch || !row?.semester) return;
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        const key = row.key;

        try {
            setDeleteFacultyRowLoading((p) => ({ ...p, [key]: true }));

            const endpoint = row.isPrev
                ? `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${row.facultyId}/prev-courses/${row.courseId}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${row.facultyId}/courses/${row.courseId}`;

            const res = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    credentials: "include",
                },
                body: JSON.stringify({
                    semester: row.semester,
                    batch: row.batch,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to delete faculty entry");

            setFacultyBatchRows((prev) => prev.filter((r) => r.key !== key));
            toast.success("Faculty entry deleted");
        } catch (err) {
            toast.error(err.message || "Failed to delete faculty entry");
        } finally {
            setDeleteFacultyRowLoading((p) => {
                const copy = { ...p };
                delete copy[key];
                return copy;
            });
        }
    };

    // ========= Delete Student Row =========
    const deleteOneStudentRow = async (row) => {
        if (!row?._id || !actionModal.courseId) return;
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        const key = row.key || row._id;

        try {
            setDeleteStudentRowLoading((p) => ({ ...p, [key]: true }));

            const endpoint = row.isPrev
                ? `${import.meta.env.VITE_BACKEND_URL}/api/students/delete-prev-courses/${row._id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/students/delete-courses/${row._id}`;

            const res = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    credentials: "include",
                },
                body: JSON.stringify({ courseIds: [actionModal.courseId] }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to delete student entry");

            setImpactedStudents((prev) => prev.filter((s) => s.key !== key));
            toast.success("Student entry deleted");
        } catch (err) {
            toast.error(err.message || "Failed to delete student entry");
        } finally {
            setDeleteStudentRowLoading((p) => {
                const copy = { ...p };
                delete copy[key];
                return copy;
            });
        }
    };

    // ========= Delete All Faculties (bulk pull, current + prev) =========
    const deleteAllFacultiesFromCourse = async () => {
        if (!actionModal.courseId) return;
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (facultyBatchRows.length === 0) return;

        try {
            setDeleteAllFacultiesBusy(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/faculty/pull-course/${actionModal.courseId}/institution/${institutionId}`,
                { credentials: "include" }
            );

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to delete all faculties");

            setFacultyBatchRows([]);
            toast.success("All faculty entries deleted");
        } catch (err) {
            toast.error(err.message || "Failed to delete all faculties");
        } finally {
            setDeleteAllFacultiesBusy(false);
        }
    };

    // ========= Delete All Students (bulk pull, current + prev) =========
    const deleteAllStudentsFromCourse = async () => {
        if (!actionModal.courseId) return;
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (impactedStudents.length === 0) return;

        try {
            setDeleteAllStudentsBusy(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/student/pull-course/${actionModal.courseId}/institution/${institutionId}`,
                { credentials: "include" }
            );

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Failed to delete all students");

            setImpactedStudents([]);
            toast.success("All student entries deleted");
        } catch (err) {
            toast.error(err.message || "Failed to delete all students");
        } finally {
            setDeleteAllStudentsBusy(false);
        }
    };

    // ========= Open Status Modal =========
    const openChangeStatusModal = async (course) => {
        if (!course?._id) return;

        const nextIsOpen = !course.isOpen;

        if (nextIsOpen === false) {
            setActiveImpactTab("faculties");

            await Promise.all([
                fetchFacultyBatchRowsForCourse(course._id),
                fetchStudentsForCourse(course._id),
            ]);
        } else {
            setFacultyBatchRows([]);
            setImpactedStudents([]);
            setImpactError("");
            setStudentsImpactError("");
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
                        credentials: "include",
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

    // ========= Confirm Guard =========
    const requiresFinishingToClose =
        actionModal.type === "status" && actionModal.nextIsOpen === false;

    const isDeleteModal = actionModal.type === "delete";

    const pendingFacultyBatchCount = facultyBatchRows.length;
    const pendingStudentsCount = impactedStudents.length;

    // For delete modal:
    // - Basic delete disabled until both lists empty
    // - Delete everything always enabled (we add a separate button top-right)
    const basicDeleteDisabled =
        isDeleteModal &&
        (isImpactLoading || pendingFacultyBatchCount > 0 || pendingStudentsCount > 0);

    // For status close modal confirm disabled same as before
    const confirmDisabled =
        requiresFinishingToClose &&
        (isImpactLoading || pendingFacultyBatchCount > 0 || pendingStudentsCount > 0);

    const isModalBusy =
        isDeletingCourse ||
        (actionModal.type === "status" && !!statusUpdatingMap[actionModal.courseId]);

    // When delete modal open, also disable interactions if any row delete is running
    const isAnyRowDeleteBusy =
        Object.values(deleteFacultyRowLoading).some(Boolean) ||
        Object.values(deleteStudentRowLoading).some(Boolean) ||
        deleteAllFacultiesBusy ||
        deleteAllStudentsBusy;

    const deleteModalConfirmDisabled = basicDeleteDisabled || isModalBusy || isAnyRowDeleteBusy;

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
                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                            Search
                        </label>

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
                        <h3 className="text-lg font-semibold text-[var(--text)]">
                            No courses found
                        </h3>
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
                                    className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 transition ${course.isOpen ? "hover:shadow-[var(--shadow)]" : "opacity-60"
                                        }`}
                                >
                                    {/* TOP HEADER */}
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

                                        {/* Toggle (standardized colors - no red/green) */}
                                        <div className="shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => openChangeStatusModal(course)}
                                                disabled={isStatusUpdating}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${isStatusUpdating ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                                                    }`}
                                                style={{
                                                    background: course.isOpen
                                                        ? "var(--surface-2)"
                                                        : "var(--surface-2)",
                                                    borderColor: course.isOpen
                                                        ? "var(--accent)"
                                                        : "var(--border)",
                                                }}
                                                title={course.isOpen ? "Open" : "Closed"}
                                            >
                                                <span
                                                    className="inline-block h-5 w-5 transform rounded-full transition"
                                                    style={{
                                                        background: "var(--text)",
                                                        transform: course.isOpen
                                                            ? "translateX(24px)"
                                                            : "translateX(4px)",
                                                    }}
                                                />

                                                {isStatusUpdating && (
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
                                            {course.code || "N/A"}
                                        </span>

                                        {/* standardized Open/Closed badge (no red/green) */}
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border"
                                            style={{
                                                background: "var(--surface-2)",
                                                color: "var(--text)",
                                                borderColor: course.isOpen ? "var(--accent)" : "var(--border)",
                                            }}
                                        >
                                            {course.isOpen ? <BadgeCheck size={14} /> : <Ban size={14} />}
                                            {course.isOpen ? "Open" : "Closed"}
                                        </span>

                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]">
                                            <GraduationCap size={14} />
                                            Sem: {course.semester ?? "N/A"}
                                        </span>
                                    </div>

                                    {/* DETAILS */}
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

                                    {/* ACTIONS */}
                                    <div className="flex items-center gap-2 mt-5">
                                        <button
                                            onClick={() => navigate(`/institution/courses/edit/${course._id}`)}
                                            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]
                        hover:bg-[var(--text)] hover:text-[var(--bg)] transition font-semibold text-sm"
                                            type="button"
                                        >
                                            Edit Course
                                        </button>

                                        {/* standardized delete button (no red hover) */}
                                        <button
                                            onClick={() => openDeleteCourseModal(course)}
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

            {/* ========= ACTION MODAL ========= */}
            <ConfirmModal
                open={actionModal.open}
                title={
                    actionModal.type === "delete"
                        ? "Delete Course?"
                        : actionModal.type === "status" && actionModal.nextIsOpen === false
                            ? "Close Course?"
                            : "Change Course Status?"
                }
                message={
                    actionModal.type === "delete"
                        ? `You're about to delete "${actionModal.courseName}". Manage students/faculties if needed.`
                        : actionModal.nextIsOpen === false
                            ? `Before closing "${actionModal.courseName}", finish this course for all faculties and students.`
                            : `You're about to mark "${actionModal.courseName}" as "Open". Continue?`
                }
                confirmText={
                    actionModal.type === "delete"
                        ? "Yes, Delete"
                        : `Yes, Mark ${actionModal.nextIsOpen ? "Open" : "Closed"}`
                }
                cancelText="Cancel"
                variant={
                    actionModal.type === "delete"
                        ? "danger"
                        : actionModal.nextIsOpen === false
                            ? "warning"
                            : "primary"
                }
                loading={isModalBusy}
                confirmDisabled={actionModal.type === "delete" ? deleteModalConfirmDisabled : confirmDisabled}
                onClose={closeActionModal}
                onConfirm={onConfirmAction}
            >
                {/* DELETE MODAL UI */}
                {actionModal.type === "delete" && (
                    <div className="space-y-4">
                        {/* top row: tabs + delete everything */}
                        <div className="flex items-center justify-between gap-3">
                            <ModalTabs
                                active={activeImpactTab}
                                onChange={setActiveImpactTab}
                                tabs={[
                                    {
                                        key: "faculties",
                                        label: `Faculties (${pendingFacultyBatchCount})`,
                                        icon: <Users className="w-4 h-4 text-[var(--muted-text)]" />,
                                    },
                                    {
                                        key: "students",
                                        label: `Students (${pendingStudentsCount})`,
                                        icon: <GraduationCap className="w-4 h-4 text-[var(--muted-text)]" />,
                                    },
                                ]}
                            />

                            {/* Delete Everything (top-right) */}
                            <button
                                type="button"
                                onClick={deleteCourse}
                                disabled={isModalBusy || isAnyRowDeleteBusy}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${isModalBusy || isAnyRowDeleteBusy
                                    ? "opacity-60 cursor-not-allowed"
                                    : "hover:opacity-90"
                                    }`}
                                style={{
                                    background: "var(--surface-2)",
                                    borderColor: "var(--border)",
                                    color: "var(--text)",
                                }}
                                title="Delete everything linked with this course"
                            >
                                <Trash className="w-4 h-4" />
                                Delete Everything
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeImpactTab === "faculties" ? (
                            <div className="space-y-3">
                                {/* Actions */}
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-[var(--muted-text)]">
                                        Current + Previous faculty entries are shown together.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={deleteAllFacultiesFromCourse}
                                        disabled={
                                            deleteAllFacultiesBusy ||
                                            pendingFacultyBatchCount === 0 ||
                                            isModalBusy ||
                                            isAnyRowDeleteBusy
                                        }
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${deleteAllFacultiesBusy ||
                                            pendingFacultyBatchCount === 0 ||
                                            isModalBusy ||
                                            isAnyRowDeleteBusy
                                            ? "opacity-60 cursor-not-allowed"
                                            : "hover:opacity-90"
                                            }`}
                                        style={{
                                            background: "var(--surface-2)",
                                            borderColor: "var(--border)",
                                            color: "var(--text)",
                                        }}
                                        title="Delete all faculty course links (current + previous)"
                                    >
                                        {deleteAllFacultiesBusy ? "Deleting..." : "Delete All Faculties"}
                                    </button>
                                </div>

                                {/* Loading/Error/Empty/List */}
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
                                ) : facultyBatchRows.length === 0 ? (
                                    <div
                                        className="text-sm rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "var(--muted-text)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        No faculty is linked with this course. ✅
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-auto space-y-2 pr-1">
                                        {facultyBatchRows.map((row) => {
                                            const busy = !!deleteFacultyRowLoading[row.key] || isModalBusy;

                                            return (
                                                <FacultyBatchRow
                                                    key={row.key}
                                                    row={row}
                                                    busy={busy}
                                                    onDelete={() => deleteOneFacultyRow(row)}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Actions */}
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-[var(--muted-text)]">
                                        Current + Previous student entries are shown together.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={deleteAllStudentsFromCourse}
                                        disabled={
                                            deleteAllStudentsBusy ||
                                            pendingStudentsCount === 0 ||
                                            isModalBusy ||
                                            isAnyRowDeleteBusy
                                        }
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${deleteAllStudentsBusy ||
                                            pendingStudentsCount === 0 ||
                                            isModalBusy ||
                                            isAnyRowDeleteBusy
                                            ? "opacity-60 cursor-not-allowed"
                                            : "hover:opacity-90"
                                            }`}
                                        style={{
                                            background: "var(--surface-2)",
                                            borderColor: "var(--border)",
                                            color: "var(--text)",
                                        }}
                                        title="Delete all student course links (current + previous)"
                                    >
                                        {deleteAllStudentsBusy ? "Deleting..." : "Delete All Students"}
                                    </button>
                                </div>

                                {/* Loading/Error/Empty/List */}
                                {isImpactLoading ? (
                                    <div
                                        className="text-sm rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "var(--muted-text)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        Loading students...
                                    </div>
                                ) : studentsImpactError ? (
                                    <div
                                        className="text-sm rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "#ef4444",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        {studentsImpactError}
                                    </div>
                                ) : impactedStudents.length === 0 ? (
                                    <div
                                        className="text-sm rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "var(--muted-text)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        No student is linked with this course. ✅
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-auto space-y-2 pr-1">
                                        {impactedStudents.map((s) => {
                                            const busy = !!deleteStudentRowLoading[s.key] || isModalBusy;

                                            return (
                                                <StudentRow
                                                    key={s.key}
                                                    row={s}
                                                    busy={busy}
                                                    onDelete={() => deleteOneStudentRow(s)}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* info + basic delete state */}
                        <div
                            className="text-xs rounded-xl border px-3 py-2"
                            style={{
                                background: "var(--surface-2)",
                                color: "var(--muted-text)",
                                borderColor: "var(--border)",
                            }}
                        >
                            <span className="font-bold">Basic Delete</span> becomes available only when both tabs are empty.
                            Use <span className="font-bold">Delete Everything</span> to delete directly.
                        </div>
                    </div>
                )}

                {/* STATUS CLOSE UI (unchanged) */}
                {requiresFinishingToClose && (
                    <div className="space-y-4">
                        {/* Tabs (top-left) */}
                        <div className="flex items-center justify-between gap-3">
                            <ModalTabs
                                active={activeImpactTab}
                                onChange={setActiveImpactTab}
                                tabs={[
                                    {
                                        key: "faculties",
                                        label: `Faculties (${pendingFacultyBatchCount})`,
                                        icon: <Users className="w-4 h-4 text-[var(--muted-text)]" />,
                                    },
                                    {
                                        key: "students",
                                        label: `Students (${pendingStudentsCount})`,
                                        icon: <GraduationCap className="w-4 h-4 text-[var(--muted-text)]" />,
                                    },
                                ]}
                            />

                            {pendingFacultyBatchCount === 0 && pendingStudentsCount === 0 && (
                                <div
                                    className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border"
                                    style={{
                                        background: "var(--surface-2)",
                                        borderColor: "var(--border)",
                                        color: "var(--text)",
                                    }}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Ready to close
                                </div>
                            )}
                        </div>

                        {activeImpactTab === "faculties" ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-[var(--muted-text)]">
                                        Each row is one faculty + one batch for this course.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={finishAllFaculties}
                                        disabled={
                                            finishAllFacultiesBusy ||
                                            pendingFacultyBatchCount === 0 ||
                                            isModalBusy
                                        }
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${finishAllFacultiesBusy ||
                                            pendingFacultyBatchCount === 0 ||
                                            isModalBusy
                                            ? "opacity-60 cursor-not-allowed"
                                            : "hover:opacity-90"
                                            }`}
                                        style={{
                                            background: "var(--surface-2)",
                                            borderColor: "var(--border)",
                                            color: "var(--text)",
                                        }}
                                        title="Finish all faculties for all batches"
                                    >
                                        {finishAllFacultiesBusy ? "Finishing..." : "Finish All"}
                                    </button>
                                </div>

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
                                ) : facultyBatchRows.length === 0 ? (
                                    <div
                                        className="text-sm rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "var(--muted-text)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        No faculty-batch is currently teaching this course. ✅
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-auto space-y-2 pr-1">
                                        {facultyBatchRows.map((row) => {
                                            const busy = !!finishFacultyRowLoading[row.key] || isModalBusy;

                                            return (
                                                <div
                                                    key={row.key}
                                                    className="rounded-xl border p-3 flex items-center justify-between gap-3"
                                                    style={{
                                                        background: "var(--surface)",
                                                        borderColor: "var(--border)",
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <img
                                                            src={row?.avatar || "/user.png"}
                                                            alt={row?.name || "Faculty"}
                                                            className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                                                            onError={(e) => {
                                                                e.currentTarget.src = "/user.png";
                                                            }}
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-[var(--text)] truncate leading-tight">
                                                                {row?.name || "Faculty"}{" "}
                                                                <span className="text-xs font-semibold text-[var(--muted-text)]">
                                                                    ({row?.batch || "N/A"})
                                                                </span>
                                                            </p>
                                                            <p className="text-xs text-[var(--muted-text)] truncate leading-tight">
                                                                {row?.designation || "Faculty"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => finishOneFacultyBatchRow(row)}
                                                        disabled={busy}
                                                        className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition ${busy ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                                                            }`}
                                                        style={{
                                                            background: "var(--surface-2)",
                                                            color: "var(--text)",
                                                            borderColor: "var(--border)",
                                                        }}
                                                    >
                                                        {busy ? "Finishing..." : "Finish"}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {facultyBatchRows.length > 0 && (
                                    <div
                                        className="text-xs rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "var(--muted-text)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        Finish all faculty-batch entries before closing the course.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-[var(--muted-text)]">
                                        Finish course for each student before closing.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={finishAllStudents}
                                        disabled={
                                            finishAllStudentsBusy ||
                                            pendingStudentsCount === 0 ||
                                            isModalBusy
                                        }
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${finishAllStudentsBusy ||
                                            pendingStudentsCount === 0 ||
                                            isModalBusy
                                            ? "opacity-60 cursor-not-allowed"
                                            : "hover:opacity-90"
                                            }`}
                                        style={{
                                            background: "var(--surface-2)",
                                            borderColor: "var(--border)",
                                            color: "var(--text)",
                                        }}
                                        title="Finish course for all students"
                                    >
                                        {finishAllStudentsBusy ? "Finishing..." : "Finish All"}
                                    </button>
                                </div>

                                {isImpactLoading ? (
                                    <div
                                        className="text-sm rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "var(--muted-text)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        Loading students...
                                    </div>
                                ) : studentsImpactError ? (
                                    <div
                                        className="text-sm rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "#ef4444",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        {studentsImpactError}
                                    </div>
                                ) : impactedStudents.length === 0 ? (
                                    <div
                                        className="text-sm rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "var(--muted-text)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        No students are currently studying this course. ✅
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-auto space-y-2 pr-1">
                                        {impactedStudents.map((s) => {
                                            const busy = !!finishStudentLoading[s._id] || isModalBusy;

                                            return (
                                                <div
                                                    key={s._id}
                                                    className="rounded-xl border p-3 flex items-center justify-between gap-3"
                                                    style={{
                                                        background: "var(--surface)",
                                                        borderColor: "var(--border)",
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <img
                                                            src={s?.avatar || "/user.png"}
                                                            alt={s?.name || "Student"}
                                                            className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                                                            onError={(e) => {
                                                                e.currentTarget.src = "/user.png";
                                                            }}
                                                        />

                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-[var(--text)] truncate leading-tight">
                                                                {s?.name || "Student"}
                                                            </p>
                                                            <p className="text-xs text-[var(--muted-text)] truncate leading-tight">
                                                                Enrollment: {s?.enrollmentNumber || "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => finishOneStudent(s._id)}
                                                        disabled={busy}
                                                        className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition ${busy ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                                                            }`}
                                                        style={{
                                                            background: "var(--surface-2)",
                                                            color: "var(--text)",
                                                            borderColor: "var(--border)",
                                                        }}
                                                    >
                                                        {busy ? "Finishing..." : "Finish"}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {impactedStudents.length > 0 && (
                                    <div
                                        className="text-xs rounded-xl border px-3 py-2"
                                        style={{
                                            background: "var(--surface-2)",
                                            color: "var(--muted-text)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        Finish all students before closing the course.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </ConfirmModal>

            {/* Patch: When delete modal is open, confirm should be blocked until empty lists */}
            {actionModal.type === "delete" && (
                <style>
                    {`
            /* Block the default confirm button if disabled state doesn't reflect (ConfirmModal internal) */
          `}
                </style>
            )}
        </div>
    );
};

export default InstitutionCourses;
