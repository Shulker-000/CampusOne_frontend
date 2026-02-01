import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    Users,
    UserRoundCog,
    XCircle,
    Loader2,
    User2,
} from "lucide-react";

import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";
import InstitutionBranchesCard from "../branches/InstitutionBranchesCard";
import InstitutionFacultiesCard from "../faculties/InstitutionFacultiesCard";
import InstitutionCoursesCard from "../courses/InstitutionCoursesCard";

const InstitutionDepartmentProfile = () => {
    const navigate = useNavigate();
    const { departmentId } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [department, setDepartment] = useState(null);

    // Branches
    const [branches, setBranches] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(false);

    // Faculties
    const [faculties, setFaculties] = useState([]);
    const [headOfDepartment, setHeadOfDepartment] = useState("");

    // Courses
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);

    // Students count
    const [studentCount, setStudentCount] = useState(0);
    const [studentsLoading, setStudentsLoading] = useState(false);


    // confirming modal
    const [confirmState, setConfirmState] = useState({
        open: false,
        type: null, // assignHod | removeHod
    });

    /* ================= FETCH ================= */

    const fetchDepartment = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/${departmentId}`,
                { credentials: "include" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch department");

            setDepartment(data.data);
            setHeadOfDepartment(data.data?.headOfDepartment?._id || "");
        } catch (err) {
            toast.error(err.message || "Failed to load department");
        } finally {
            setLoading(false);
        }
    };

    const fetchBranchesByDepartment = async () => {
        try {
            setBranchesLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/departments/${departmentId}/branches`,
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

    const fetchFaculties = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/faculties/by-department/${departmentId}`,
                { credentials: "include" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setFaculties(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch faculties");
        }
    };

    const fetchCoursesByDepartment = async () => {
        if (!departmentId) return;

        try {
            setCoursesLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/courses/department/${departmentId}`,
                { credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch courses");

            setCourses(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            toast.error(err.message || "Failed to fetch courses");
        } finally {
            setCoursesLoading(false);
        }
    };


    useEffect(() => {
        if (!departmentId) return;
        fetchDepartment();
        fetchBranchesByDepartment();
        fetchFaculties();
        fetchCoursesByDepartment();
    }, [departmentId]);

    /* ================= HELPERS ================= */

    const facultyById = useMemo(() => {
        const map = new Map();
        faculties.forEach((f) => map.set(f._id, f));
        return map;
    }, [faculties]);

    const hodFaculty = headOfDepartment
        ? facultyById.get(headOfDepartment)
        : null;

    const hodUser = hodFaculty?.userId;

    const goToHodProfile = () => {
        if (!hodFaculty?._id) return;
        navigate(`/institution/faculties/profile/${hodFaculty._id}`);
    };

    /* ================= HOD ACTIONS ================= */

    const assignHodApi = async () => {
        try {
            setSaving(true);
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/add-hod/${departmentId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ headOfDepartment }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("HOD updated");
            await fetchDepartment();
            await fetchFaculties();
            closeConfirm();
        } catch (err) {
            toast.error(err.message || "Failed to assign HOD");
        } finally {
            setSaving(false);
        }
    };

    const removeHodApi = async () => {
        try {
            setSaving(true);
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/remove-hod/${departmentId}`,
                { method: "POST", credentials: "include" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("HOD removed");
            await fetchDepartment();
            await fetchFaculties();
            closeConfirm();
        } catch (err) {
            toast.error(err.message || "Failed to remove HOD");
        } finally {
            setSaving(false);
        }
    };

    const closeConfirm = () =>
        !saving && setConfirmState({ open: false, type: null });

    if (loading) return <Loader />;
    if (!department) return null;

    /* ================= UI ================= */

    return (
        <div className="px-6 py-8 max-w-6xl">

            {/* ===== Header ===== */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-[var(--muted-text)] hover:text-[var(--text)]"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <h1 className="mt-4 text-3xl font-bold">
                    {department.name}
                </h1>
                <p className="text-sm text-[var(--muted-text)]">
                    Department Profile
                </p>
            </div>

            {/* ===== Department Info ===== */}
            <section className="border-t border-[var(--border)] pt-8 pb-10">
                <div
                    className="
                        relative bg-[var(--surface)]
                        border border-[var(--border)]
                        rounded-2xl px-6 py-7
                        "
                >
                    {/* accent rail */}
                    <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent)] rounded-l-2xl" />

                    {/* Header */}
                    <div className="mb-6 pl-3">
                        <h2 className="text-base font-bold text-[var(--text)]">
                            Department Overview
                        </h2>
                        <p className="text-sm text-[var(--muted-text)]">
                            Core identity and official contact
                        </p>
                    </div>

                    {/* ===== Primary Info Grid ===== */}
                    <div className="relative pl-3">
                        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
                            {/* vertical divider */}
                            <div
                                className="
                                    hidden sm:block
                                    absolute
                                    left-1/2
                                    top-1
                                    bottom-1
                                    w-[2px]
                                    bg-[var(--text)]
                                    "
                            />

                            {/* Department Code */}
                            <div className="pr-8">
                                <p className="text-xs uppercase tracking-wider text-[var(--muted-text)] font-semibold">
                                    Department Code
                                </p>
                                <p className="mt-1.5 text-lg font-bold text-[var(--text)]">
                                    {department.code}
                                </p>
                            </div>

                            {/* Contact Email */}
                            <div className="sm:pl-8">
                                <p className="text-xs uppercase tracking-wider text-[var(--muted-text)] font-semibold">
                                    Contact Email
                                </p>
                                <p className="mt-1.5 text-base font-semibold text-[var(--text)] break-all">
                                    {department.contactEmail}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ===== Secondary Stats ===== */}
                    <div className="mt-8 border-t border-[var(--border)] pt-6 pl-3">
                        <p className="text-xs uppercase tracking-wider text-[var(--muted-text)] font-semibold mb-4">
                            Department Stats
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
                                <p className="text-xs text-[var(--muted-text)] font-semibold">
                                    Branches
                                </p>
                                <p className="mt-1 text-xl font-bold text-[var(--text)]">
                                    {branches.length ?? 0}
                                </p>
                            </div>

                            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
                                <p className="text-xs text-[var(--muted-text)] font-semibold">
                                    Faculties
                                </p>
                                <p className="mt-1 text-xl font-bold text-[var(--text)]">
                                    {faculties.length ?? 0 ?? 0}
                                </p>
                            </div>

                            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
                                <p className="text-xs text-[var(--muted-text)] font-semibold">
                                    Students
                                </p>
                                <p className="mt-1 text-xl font-bold text-[var(--text)]">
                                    {department.totalStudents ?? 0}
                                    {/* ======== ToDo ======== */}
                                </p>
                            </div>

                            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
                                <p className="text-xs text-[var(--muted-text)] font-semibold">
                                    Courses
                                </p>
                                <p className="mt-1 text-xl font-bold text-[var(--text)]">
                                    {courses.length ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ===== HOD ===== */}
            <section className="border-t border-[var(--border)] pt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users size={18} className="text-[var(--muted-text)]" />
                    <h2 className="font-bold">Head of Department</h2>
                </div>

                <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 sm:w-4/5 md:w-2/3">
                    {hodUser ? (
                        <div className="flex items-start justify-between gap-6">
                            {/* ROUTABLE PROFILE */}
                            <div
                                onClick={goToHodProfile}
                                className="group flex items-start gap-4 cursor-pointer rounded-lg
                                            p-2 -m-2 transition-all
                                            hover:scale-[1.01]"
                            >

                                {hodUser.avatar ? (
                                    <img
                                        src={hodUser.avatar}
                                        onError={(e) => (e.currentTarget.src = "/user.png")}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full border grid place-items-center">
                                        <User2 size={20} />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="font-semibold transition-colors group-hover:text-[var(--accent)]">
                                        {hodUser.name}
                                    </p>

                                    <p className="text-sm text-[var(--muted-text)] truncate
                                        transition-colors group-hover:text-[var(--accent)]/80">
                                        {hodUser.email}
                                    </p>

                                    <p className="text-sm text-[var(--muted-text)] truncate
                                        transition-colors group-hover:text-[var(--accent)]/80">
                                        {hodFaculty?.designation || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* REMOVE */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmState({ open: true, type: "removeHod" });
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-[var(--surface)] hover:bg-[var(--hover)] text-sm"
                            >
                                <XCircle size={16} />
                                Remove
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--muted-text)]">
                            No HOD assigned yet.
                        </p>
                    )}
                </div>

                {/* Assign */}
                <div className="mt-4 max-w-xl">
                    <label className="text-xs font-bold uppercase text-[var(--muted-text)]">
                        Assign / Change HOD
                    </label>

                    <div className="mt-2 flex gap-2">
                        <select
                            value={headOfDepartment}
                            onChange={(e) => setHeadOfDepartment(e.target.value)}
                            className="w-full rounded-lg border px-3 py-3 text-sm bg-[var(--surface)]"
                        >
                            <option value="">Select faculty</option>
                            {faculties.map((f) => (
                                <option key={f._id} value={f._id}>
                                    {f.userId?.name} - {f.designation || "N/A"}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() =>
                                setConfirmState({ open: true, type: "assignHod" })
                            }
                            disabled={!headOfDepartment || saving}
                            className="inline-flex items-center gap-2 px-4 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <UserRoundCog size={16} />
                            )}
                            Apply
                        </button>
                    </div>
                </div>
            </section>

            {/* ================= Integrated Branches ================= */}
            <section className="border-t border-[var(--border)] pt-10 mt-10 max-w-7xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--text)]">
                            Integrated Branches
                        </h2>
                        <p className="text-sm text-[var(--muted-text)]">
                            All branches operating under this department
                        </p>
                    </div>

                    {/* COUNT */}
                    <span
                        className="px-3 py-1 rounded-lg text-sm font-bold
                 bg-[var(--surface-2)]
                 border border-[var(--border)]"
                    >
                        {branches.length}
                    </span>
                </div>

                {branchesLoading ? (
                    <div className="py-10">
                        <Loader />
                    </div>
                ) : branches.length === 0 ? (
                    <div
                        className="rounded-xl border border-[var(--border)]
                 bg-[var(--surface-2)]
                 p-6 text-sm text-[var(--muted-text)]"
                    >
                        No branches are currently associated with this department.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {branches.map((branch) => (
                            <InstitutionBranchesCard
                                key={branch._id}
                                branch={branch}
                                departmentName={department.name}
                                isUpdatingStatus={true}
                                showEdit={false}
                                showDelete={false}
                                showToggleStatus={false}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ================= Integrated Faculties ================= */}
            <section className="border-t border-[var(--border)] pt-10 mt-10 max-w-7xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--text)]">
                            Integrated Faculties
                        </h2>
                        <p className="text-sm text-[var(--muted-text)]">
                            All faculties associated with this department
                        </p>
                    </div>

                    {/* COUNT */}
                    <span
                        className="px-3 py-1 rounded-lg text-sm font-bold
                 bg-[var(--surface-2)]
                 border border-[var(--border)]"
                    >
                        {faculties.length}
                    </span>
                </div>

                {faculties.length === 0 ? (
                    <div
                        className="rounded-xl border border-[var(--border)]
                 bg-[var(--surface-2)]
                 p-6 text-sm text-[var(--muted-text)]"
                    >
                        No faculties are currently assigned to this department.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {faculties.map((faculty) => (
                            <InstitutionFacultiesCard
                                key={faculty._id}
                                faculty={faculty}
                                departmentName={department.name}
                                courseCount={faculty.courses?.length || 0}
                                isStatusUpdating={false}
                                onToggleStatus={() => { }}
                                onEdit={() => { }}
                                onDelete={() => { }}
                                showEdit={false}
                                showDelete={false}
                                showToggleStatus={false}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ================= Integrated Courses ================= */}
            <section className="border-t border-[var(--border)] pt-10 mt-10 max-w-7xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--text)]">
                            Integrated Courses
                        </h2>
                        <p className="text-sm text-[var(--muted-text)]">
                            All courses offered under this department
                        </p>
                    </div>

                    {/* COUNT */}
                    <span
                        className="px-3 py-1 rounded-lg text-sm font-bold
                 bg-[var(--surface-2)]
                 border border-[var(--border)]"
                    >
                        {courses.length}
                    </span>
                </div>

                {coursesLoading ? (
                    <div className="py-10">
                        <Loader />
                    </div>
                ) : courses.length === 0 ? (
                    <div
                        className="rounded-xl border border-[var(--border)]
                 bg-[var(--surface-2)]
                 p-6 text-sm text-[var(--muted-text)]"
                    >
                        No courses are currently associated with this department.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <InstitutionCoursesCard
                                key={course._id}
                                course={{
                                    ...course,
                                    department: {
                                        name: department.name,
                                        code: department.code,
                                    },
                                }}
                                showEdit={false}
                                showDelete={false}
                                showToggleStatus={false}
                                isStatusUpdating={false}
                                onEdit={() => { }}
                                onDelete={() => { }}
                                onToggleStatus={() => { }}
                            />
                        ))}

                    </div>
                )}
            </section>

            {/* ===== Confirm Modal ===== */}
            <ConfirmModal
                open={confirmState.open}
                title={
                    confirmState.type === "assignHod"
                        ? "Confirm HOD Assignment"
                        : "Confirm HOD Removal"
                }
                message={
                    confirmState.type === "assignHod"
                        ? "This will assign or change the Head of Department."
                        : "This will remove the current Head of Department."
                }
                confirmText={
                    confirmState.type === "assignHod" ? "Assign HOD" : "Remove HOD"
                }
                variant={confirmState.type === "assignHod" ? "primary" : "danger"}
                loading={saving}
                onClose={closeConfirm}
                onConfirm={
                    confirmState.type === "assignHod"
                        ? assignHodApi
                        : removeHodApi
                }
            />
        </div>
    );
};

const Info = ({ label, value }) => (
    <div>
        <p className="text-xs font-bold uppercase text-[var(--muted-text)]">
            {label}
        </p>
        <p className="mt-1 font-semibold">{value || "—"}</p>
    </div>
);

export default InstitutionDepartmentProfile;
