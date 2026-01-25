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
} from "lucide-react";

import ConfirmModal from "../../../components/ConfirmModal";
import Loader from "../../../components/Loader";

/**
 * ✅ Small, reusable tab button UI (top-left like your screenshot)
 * - Keep it generic so you can add more tabs later
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
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition
              ${isActive ? "" : "hover:opacity-90"}`}
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
 * This is exactly what you asked:
 * - No grouping/chips
 * - Same faculty can appear multiple times for different batches
 */
const FacultyBatchRow = ({
    row,
    busy = false,
    onFinish,
}) => {
    const avatar = row?.avatar || "/user.png";
    const name = row?.name || "Faculty";
    const designation = row?.designation || "Faculty";
    const batch = row?.batch || "N/A";

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
                    <p className="text-xs text-[var(--muted-text)] truncate leading-tight">
                        {designation}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onFinish}
                disabled={busy}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition
          ${busy ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
                style={{
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                }}
                title="Finish this batch course for this faculty"
            >
                {busy ? "Finishing..." : "Finish"}
            </button>
        </div>
    );
};

/**
 * ✅ One row = one Student
 * - Student can be finished individually
 * - Finish all just loops over these
 */
const StudentRow = ({ row, busy = false, onFinish }) => {
    const avatar = row?.avatar || "/user.png";
    const name = row?.name || "Student";
    const enrollmentNumber = row?.enrollmentNumber || "N/A";

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
                    <p className="text-xs text-[var(--muted-text)] truncate leading-tight">
                        Enrollment: {enrollmentNumber}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onFinish}
                disabled={busy}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition
          ${busy ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
                style={{
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                }}
                title="Finish this course for this student"
            >
                {busy ? "Finishing..." : "Finish"}
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

    // ========= Modal UI states =========
    const [activeImpactTab, setActiveImpactTab] = useState("faculties"); // "faculties" | "students"

    // ========= Impact loading + errors =========
    const [isImpactLoading, setIsImpactLoading] = useState(false);
    const [impactError, setImpactError] = useState("");

    // ========= Impacted Lists =========
    /**
     * Faculties list from backend is at faculty-level.
     * We convert it into rows = (facultyId + courseId + batch)
     * so UI shows EXACT rows you asked: "FacultyName (Batch)"
     */
    const [facultyBatchRows, setFacultyBatchRows] = useState([]);

    /**
     * Students are already one per row.
     */
    const [impactedStudents, setImpactedStudents] = useState([]);
    const [studentsImpactError, setStudentsImpactError] = useState("");

    // ========= Finish loading maps =========
    // Faculty batch finishing is keyed by `${facultyId}__${batch}`
    const [finishFacultyRowLoading, setFinishFacultyRowLoading] = useState({});
    // Student finishing is keyed by `studentId`
    const [finishStudentLoading, setFinishStudentLoading] = useState({});

    // ========= Finish all busy flags =========
    const [finishAllFacultiesBusy, setFinishAllFacultiesBusy] = useState(false);
    const [finishAllStudentsBusy, setFinishAllStudentsBusy] = useState(false);

    const closeActionModal = () => {
        // Guard: if delete/status update is running, don't allow closing the modal
        if (isDeletingCourse) return;

        const statusBusy =
            actionModal.type === "status" && !!statusUpdatingMap[actionModal.courseId];
        if (statusBusy) return;

        // Guard: if bulk finish is running, block close to avoid half-finished UI confusion
        if (finishAllFacultiesBusy || finishAllStudentsBusy) return;

        // Guard: if any individual finishing is running, block close
        const anyFinishingFaculty = Object.values(finishFacultyRowLoading).some(Boolean);
        const anyFinishingStudent = Object.values(finishStudentLoading).some(Boolean);
        if (anyFinishingFaculty || anyFinishingStudent) return;

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

        // Reset loading maps
        setFinishFacultyRowLoading({});
        setFinishStudentLoading({});
        setFinishAllFacultiesBusy(false);
        setFinishAllStudentsBusy(false);
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

    // ========= Helpers =========
    const getDepartmentIdOfCourse = (courseId) => {
        const selectedCourse = courses.find((c) => String(c._id) === String(courseId));
        return selectedCourse?.departmentId;
    };

    /**
     * ✅ Convert Faculty list -> FacultyBatch rows
     *
     * Backend returns faculty documents that include:
     * - f._id
     * - f.userId.name
     * - f.courses[] = [{ courseId, semester, batch }]
     *
     * We only keep those course entries matching the selected courseId
     * and turn each batch entry into its own UI row.
     */
    const flattenFacultyToRows = (faculties, courseId) => {
        const cid = String(courseId);

        const out = [];

        for (const f of faculties) {
            const fcourses = Array.isArray(f?.courses) ? f.courses : [];

            for (const c of fcourses) {
                if (String(c?.courseId) !== cid) continue;

                out.push({
                    key: `${f._id}__${c.batch}`, // unique per faculty-batch
                    facultyId: f._id,
                    courseId: courseId,
                    batch: c.batch,

                    // presentation
                    name: f?.userId?.name || "Faculty",
                    avatar: f?.userId?.avatar || "/user.png",
                    designation: f?.designation || "Faculty",
                });
            }
        }

        return out;
    };

    // ========= Impact Fetchers =========

    /**
     * ✅ Fetch impacted faculties for a course (no batch filter)
     * Then we flatten each faculty's course batches into UI rows.
     *
     * Route used:
     * GET /api/courses/faculty/course/:courseId/department/:departmentId
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
                { headers: { Authorization: `Bearer ${institutionToken}` } }
            );

            const data = await res.json();

            if (res.status === 404) {
                setFacultyBatchRows([]);
                return [];
            }

            if (!res.ok) throw new Error(data?.message || "Failed to fetch faculties");

            const list = Array.isArray(data?.data) ? data.data : [];
            const rows = flattenFacultyToRows(list, courseId);

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
     * ✅ Fetch impacted students for a course
     *
     * Route used:
     * GET /api/courses/student/course/:courseId/department/:departmentId
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
                { headers: { Authorization: `Bearer ${institutionToken}` } }
            );

            const data = await res.json();

            if (res.status === 404) {
                setImpactedStudents([]);
                return [];
            }

            if (!res.ok) throw new Error(data?.message || "Failed to fetch students");

            const list = Array.isArray(data?.data) ? data.data : [];

            // Normalize student list for UI rendering
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

    // ========= Finish Handlers =========

    /**
     * ✅ Finish course for one faculty-batch row
     * Endpoint:
     * PUT /api/faculties/:facultyId/courses/:courseId/finish
     * body: { batch }
     */
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
                        Authorization: `Bearer ${institutionToken}`,
                    },
                    body: JSON.stringify({ batch: row.batch }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to finish faculty course");

            // Remove this row from pending list (this is what enables confirm)
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

    /**
     * ✅ Finish all faculties (all faculty-batch rows)
     * - Runs sequentially to avoid backend overload and rate limits
     */
    const finishAllFaculties = async () => {
        if (!institutionToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (facultyBatchRows.length === 0) return;

        setFinishAllFacultiesBusy(true);

        // Snapshot of current rows (so UI changes while finishing doesn't break the loop)
        const rows = [...facultyBatchRows];

        let successCount = 0;

        try {
            for (const row of rows) {
                // If it already disappeared (finished manually), skip
                const stillPending = facultyBatchRows.some((r) => r.key === row.key);
                if (!stillPending) continue;

                // Mark this row busy
                setFinishFacultyRowLoading((p) => ({ ...p, [row.key]: true }));

                try {
                    const res = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${row.facultyId}/courses/${row.courseId}/finish`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${institutionToken}`,
                            },
                            body: JSON.stringify({ batch: row.batch }),
                        }
                    );

                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.message || "Failed to finish faculty course");

                    successCount++;
                    setFacultyBatchRows((prev) => prev.filter((r) => r.key !== row.key));
                } catch (err) {
                    // Do NOT stop the whole loop on one failure
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

    /**
     * ✅ Finish one student for this course
     * Endpoint:
     * PUT /api/students/finish-courses/:studentId
     * body: { courseIds: [courseId] }
     */
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
                        Authorization: `Bearer ${institutionToken}`,
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

    /**
     * ✅ Finish all students for this course
     * - Runs sequentially for safety
     */
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

                // If already finished manually, skip
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
                                Authorization: `Bearer ${institutionToken}`,
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
        // For delete, you might later show impacted lists too.
        // For now we keep delete action simple.
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

        // Only when closing (Open -> Closed), we must show impact and force finish flow
        if (nextIsOpen === false) {
            setActiveImpactTab("faculties");

            // Fetch both impacted groups in parallel
            await Promise.all([
                fetchFacultyBatchRowsForCourse(course._id),
                fetchStudentsForCourse(course._id),
            ]);
        } else {
            // When opening (Closed -> Open), no impact flow required
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

    // ========= Confirm Guard (THIS is the main rule you wanted) =========
    /**
     * Only require finishing when:
     * - Action is status change
     * - We're closing the course (Open -> Closed)
     *
     * In that case:
     * - Confirm must stay disabled until both lists are empty
     */
    const requiresFinishingToClose =
        actionModal.type === "status" && actionModal.nextIsOpen === false;

    const pendingFacultyBatchCount = facultyBatchRows.length;
    const pendingStudentsCount = impactedStudents.length;

    const confirmDisabled =
        requiresFinishingToClose &&
        (isImpactLoading || pendingFacultyBatchCount > 0 || pendingStudentsCount > 0);

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
                                    className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 transition
                    ${course.isOpen ? "hover:shadow-[var(--shadow)]" : "opacity-60"}`}
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

                                        {/* Toggle */}
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

                                    {/* BADGES */}
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
                title={
                    actionModal.type === "delete"
                        ? "Delete Course?"
                        : actionModal.type === "status" && actionModal.nextIsOpen === false
                            ? "Close Course?"
                            : "Change Course Status?"
                }
                message={
                    actionModal.type === "delete"
                        ? `You're about to delete "${actionModal.courseName}". Continue?`
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
                confirmDisabled={confirmDisabled}
                onClose={closeActionModal}
                onConfirm={onConfirmAction}
            >
                {/* Only show impact tabs when closing (Open -> Closed) */}
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
                                        icon: (
                                            <GraduationCap className="w-4 h-4 text-[var(--muted-text)]" />
                                        ),
                                    },
                                ]}
                            />

                            {/* Quick “done” indicator */}
                            {pendingFacultyBatchCount === 0 && pendingStudentsCount === 0 && (
                                <div className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border"
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

                        {/* Tab Content */}
                        {activeImpactTab === "faculties" ? (
                            <div className="space-y-3">
                                {/* Actions */}
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
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition
                      ${finishAllFacultiesBusy || pendingFacultyBatchCount === 0 || isModalBusy
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
                                        No faculty-batch is currently teaching this course. ✅
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-auto space-y-2 pr-1">
                                        {facultyBatchRows.map((row) => {
                                            const busy = !!finishFacultyRowLoading[row.key] || isModalBusy;

                                            return (
                                                <FacultyBatchRow
                                                    key={row.key}
                                                    row={row}
                                                    busy={busy}
                                                    onFinish={() => finishOneFacultyBatchRow(row)}
                                                />
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
                                {/* Actions */}
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
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition
                      ${finishAllStudentsBusy || pendingStudentsCount === 0 || isModalBusy
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
                                        No students are currently studying this course. ✅
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-auto space-y-2 pr-1">
                                        {impactedStudents.map((s) => {
                                            const busy = !!finishStudentLoading[s._id] || isModalBusy;

                                            return (
                                                <StudentRow
                                                    key={s._id}
                                                    row={s}
                                                    busy={busy}
                                                    onFinish={() => finishOneStudent(s._id)}
                                                />
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
        </div>
    );
};

export default InstitutionCourses;
