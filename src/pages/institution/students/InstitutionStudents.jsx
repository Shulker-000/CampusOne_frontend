import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Building2, CalendarDays } from "lucide-react";

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

    useEffect(() => {
        fetchBranches();
        fetchStudents();
    }, [institutionId]);

    // ================= FILTER LOGIC =================
    const filteredStudents = useMemo(() => {
        if (!branchId ||
    !admissionYear ||
    String(admissionYear).length !== 4 ||
    Number(admissionYear) < establishmentYear ||
    Number(admissionYear) > currentYear) return [];
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

                            <input
                                type="number"
                                min={establishmentYear}
                                max={currentYear}
                                value={admissionYear}
                                onChange={(e) => {
    const val = e.target.value;

    // allow empty (so user can delete)
    if (val === "") {
        setAdmissionYear("");
        return;
    }

    // allow typing up to 4 digits
    if (val.length > 4) return;

    // always update (no blocking)
    setAdmissionYear(val);
}}
                                placeholder="e.g. 2023"
                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 bg-[var(--surface-2)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

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
        </div>
    );
};

export default InstitutionStudents;