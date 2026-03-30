import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Building2, CalendarDays } from "lucide-react";
import ConfirmModal from "../../../components/ConfirmModal";

const InstitutionStudents = () => {
    const navigate = useNavigate();
    const institutionId = useSelector((s) => s.auth.institution.data?._id);
    const establishmentYear = useSelector((s) => s.auth.institution.data?.establishedYear);
    const currentYear = new Date().getFullYear();

    const [branches, setBranches] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(true);

    const [allStudents, setAllStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(true);

    const [branchId, setBranchId] = useState("");
    const [admissionYear, setAdmissionYear] = useState("");

    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [promoteLoading, setPromoteLoading] = useState(false);

    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivateLoading, setDeactivateLoading] = useState(false);

    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courseLoading, setCourseLoading] = useState(false);

    // ================= FETCH BRANCHES =================
    const fetchBranches = async () => {
        if (!institutionId) return;

        try {
            setBranchesLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${institutionId}`,
                { credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setBranches(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch branches");
        } finally {
            setBranchesLoading(false);
        }
    };

    // ================= FETCH ALL STUDENTS =================
    const fetchStudents = async () => {
        if (!institutionId) return;

        try {
            setStudentsLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/students/institution/${institutionId}`,
                { credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setAllStudents(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch students");
        } finally {
            setStudentsLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/institution/${institutionId}`,
                { credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setCourses(data.data);
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        fetchBranches();
        fetchStudents();
        fetchCourses();


    }, [institutionId]);

    // ================= FILTER LOGIC =================
    const filteredStudents = useMemo(() => {
        if (!branchId || !admissionYear) return [];
        if (
            Number(admissionYear) < establishmentYear ||
            Number(admissionYear) > currentYear
        ) {
            return [];
        }

        return allStudents.filter((s) => {
            const studentBranchId = s.branchId?._id || s.branchId;

            return (
                String(studentBranchId) === String(branchId) &&
                String(s.admissionYear) === String(admissionYear)
            );
        });
    }, [allStudents, branchId, admissionYear]);

    // ================= UI =================
    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-10 py-8">

            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Students</h1>
                <p className="text-sm text-[var(--muted-text)]">
                    Select branch and admission year to view students
                </p>
            </div>

            {/* FILTER CARD */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 mb-6">
                <div className="grid md:grid-cols-2 gap-4">

                    {/* BRANCH */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                            Branch
                        </label>

                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                            <select
                                value={branchId}
                                onChange={(e) => setBranchId(e.target.value)}
                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 bg-[var(--surface-2)]"
                            >
                                <option value="">
                                    {branchesLoading ? "Loading branches..." : "Select Branch"}
                                </option>

                                {branches.map((b) => (
                                    <option key={b._id} value={b._id}>
                                        {b.name} ({b.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* YEAR */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[var(--muted-text)]">
                            Admission Year
                        </label>

                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                            <select
                                value={admissionYear}
                                onChange={(e) => setAdmissionYear(e.target.value)}
                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 bg-[var(--surface-2)]"
                            >
                                <option value="">Select Year</option>

                                {Array.from(
                                    { length: currentYear - establishmentYear + 1 },
                                    (_, i) => currentYear - i
                                ).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {branchId && admissionYear && (
                <div className="mb-4 text-sm text-[var(--muted-text)]">
                    Batch:{" "}
                    <span className="font-semibold text-[var(--text)]">
                        {
                            branches.find(b => String(b._id) === String(branchId))?.code
                        }-{admissionYear}
                    </span>
                </div>
            )}

            {branchId && admissionYear && <div className="mb-4 flex justify-end gap-2">
                <button
                    disabled={!branchId || !admissionYear}
                    onClick={() => setShowPromoteModal(true)}
                    className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
                >
                    Promote Batch
                </button>

                <button
                    disabled={!branchId || !admissionYear}
                    onClick={() => setShowDeactivateModal(true)}
                    className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
                >
                    Deactivate Batch
                </button>
            </div>}

            {branchId && admissionYear && <div className="mb-4 flex justify-end gap-2">

                <button
                    disabled={!branchId || !admissionYear}
                    onClick={() => setShowCourseModal(true)}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Add Courses
                </button>
            </div>}

            {/* RESULTS */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">

                {/* INITIAL STATE */}
                {!branchId || !admissionYear ? (
                    <div className="p-6 text-center text-[var(--muted-text)]">
                        Select branch and admission year
                    </div>
                ) : studentsLoading ? (
                    <div className="p-6 text-center text-[var(--muted-text)]">
                        Loading students...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="p-6 text-center text-[var(--muted-text)]">
                        No students found
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-[var(--surface-2)] text-left">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Enrollment</th>
                                <th className="p-3">Branch</th>
                                <th className="p-3">Semester</th>
                                <th className="p-3">Year</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStudents.map((s) => (
                                <tr
                                    key={s._id}
                                    onClick={() =>
                                        navigate(`/institution/students/profile/${s._id}`)
                                    }
                                    className="border-t hover:bg-[var(--surface-2)] transition cursor-pointer"
                                >
                                    <td className="p-3 font-medium text-[var(--text)]">
                                        {s.userId?.name || s.name || "N/A"}
                                    </td>

                                    <td className="p-3 text-[var(--muted-text)]">
                                        {s.enrollmentNumber}
                                    </td>

                                    <td className="p-3 text-[var(--muted-text)]">
                                        {s.branchId?.name || "N/A"}
                                    </td>

                                    <td className="p-3 text-[var(--muted-text)]">
                                        {s.semester}
                                    </td>

                                    <td className="p-3 text-[var(--muted-text)]">
                                        {s.admissionYear}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Promote */}
            <ConfirmModal
                open={showPromoteModal}
                onClose={() => !promoteLoading && setShowPromoteModal(false)}
                onConfirm={async () => {
                    try {
                        setPromoteLoading(true);
                        if (filteredStudents.every(s => s.semester >= 8)) {
                            toast.error("All students already at max semester");
                            setShowPromoteModal(false);
                            setPromoteLoading(false);
                            return;
                        }
                        const res = await fetch(
                            `${import.meta.env.VITE_BACKEND_URL}/api/students/updateSemesterByBatch`,
                            {
                                method: "PUT",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ branchId, admissionYear })
                            }
                        );

                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message);

                        toast.success(`Promoted ${data.data.updatedCount} students`);

                        setShowPromoteModal(false);
                        fetchStudents(); // refresh
                    } catch (err) {
                        toast.error(err.message);
                    } finally {
                        setPromoteLoading(false);
                    }
                }}
                title="Promote Batch"
                message="This will move all students to next semester. This action cannot be undone."
                confirmText="Promote"
                variant="warning"
                loading={promoteLoading}
            >
                {/* EXTRA CONTEXT - THIS IS IMPORTANT */}
                <div className="text-sm">
                    Batch:{" "}
                    <span className="font-semibold">
                        {
                            branches.find(b => String(b._id) === String(branchId))?.code
                        }-{admissionYear}
                    </span>
                </div>
            </ConfirmModal>

            {/* Deactivate */}

            <ConfirmModal
                open={showDeactivateModal}
                onClose={() => !deactivateLoading && setShowDeactivateModal(false)}
                onConfirm={async () => {
                    try {
                        setDeactivateLoading(true);

                        const res = await fetch(
                            `${import.meta.env.VITE_BACKEND_URL}/api/students/deactivateBatch`,
                            {
                                method: "PUT",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ branchId, admissionYear })
                            }
                        );

                        const data = await res.json();

                        console.log(data);
                        console.log(branchId);

                        if (!res.ok) throw new Error(data.message);

                        toast.success(`Deactivated ${data.data.usersDeactivated} users`);

                        setShowDeactivateModal(false);
                    } catch (err) {
                        toast.error(err.message);
                    } finally {
                        setDeactivateLoading(false);
                    }
                }}
                title="Deactivate Batch"
                message="This will deactivate ALL students in this batch."
                confirmText="Deactivate"
                variant="danger"
                loading={deactivateLoading}
            >
                <div className="text-sm">
                    Batch: <span className="font-semibold">
                        {
                            branches.find(b => String(b._id) === String(branchId))?.code
                        }-{admissionYear}
                    </span>
                </div>
            </ConfirmModal>

            {/* Add Course */}

            <ConfirmModal
                open={showCourseModal}
                onClose={() => !courseLoading && setShowCourseModal(false)}
                onConfirm={async () => {
                    try {
                        setCourseLoading(true);

                        const res = await fetch(
                            `${import.meta.env.VITE_BACKEND_URL}/api/students/addCoursesByBatch`,
                            {
                                method: "PUT",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    branchId,
                                    admissionYear,
                                    courseIds: selectedCourses
                                })
                            }
                        );

                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message);

                        toast.success(`Courses added to ${data.data.modified} students`);

                        setShowCourseModal(false);
                        setSelectedCourses([]);
                    } catch (err) {
                        toast.error(err.message);
                    } finally {
                        setCourseLoading(false);
                    }
                }}
                title="Add Courses to Batch"
                message="This will assign selected courses to all active students."
                confirmText="Add Courses"
                loading={courseLoading}
            >
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {courses.map(c => (
                        <label key={c._id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                value={c._id}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedCourses(prev => [...prev, c._id]);
                                    } else {
                                        setSelectedCourses(prev => prev.filter(id => id !== c._id));
                                    }
                                }}
                            />
                            {c.name}
                        </label>
                    ))}
                </div>
            </ConfirmModal>

        </div>
    );
};

export default InstitutionStudents;