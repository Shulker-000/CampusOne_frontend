import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Loader from "../../../components/Loader.jsx";
import CourseCard from "../cards/CourseCard.jsx";

/* ================= HELPERS ================= */

const getBranch = (batch) => {
    const match = batch?.match(/^[A-Z]+/);
    return match ? match[0] : "Unknown";
};

const getYear = (batch) => {
    return parseInt(batch?.match(/\d+/)?.[0] || "0");
};

/* ================= COMPONENT ================= */

export default function FacultyCourses() {
    const backend = import.meta.env.VITE_BACKEND_URL;

    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);

    const [branch, setBranch] = useState("");
    const [semester, setSemester] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("batch");

    /* ================= FETCH ================= */

    const fetchFaculty = async () => {
        try {
            setLoading(true);

            const res1 = await fetch(`${backend}/api/users/faculty`, {
                credentials: "include",
            });
            const data1 = await res1.json();
            if (!res1.ok) throw new Error(data1.message);

            const res2 = await fetch(
                `${backend}/api/faculties/${data1.data._id}`,
                { credentials: "include" }
            );
            const data2 = await res2.json();
            if (!res2.ok) throw new Error(data2.message);

            setFaculty(data2.data);
        } catch (err) {
            toast.error(err.message || "Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    /* ================= TRANSFORM ================= */

    const formattedCourses =
        faculty?.courses?.map((c) => ({
            _id: c.courseId._id,
            name: c.courseId.name,
            code: c.courseId.code,
            department: c.courseId.department,
            semester: c.semester,
            batch: c.batch,
        })) || [];

    /* ================= OPTIONS ================= */

    const branches = [
        ...new Set(formattedCourses.map((c) => getBranch(c.batch))),
    ];

    const semesters = [
        ...new Set(formattedCourses.map((c) => c.semester)),
    ].sort((a, b) => a - b);

    /* ================= FILTER ================= */

    const filteredCourses = formattedCourses.filter((c) => {
        const matchesBranch =
            !branch || getBranch(c.batch) === branch;

        const matchesSemester =
            !semester || c.semester === Number(semester);

        const matchesSearch =
            !search ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase());

        return matchesBranch && matchesSemester && matchesSearch;
    });

    /* ================= SORT ================= */

    const sortedCourses = [...filteredCourses].sort((a, b) => {
        if (sortBy === "batch") {
            return getYear(b.batch) - getYear(a.batch);
        }

        if (sortBy === "semester") {
            return b.semester - a.semester;
        }

        if (sortBy === "name") {
            return a.name.localeCompare(b.name);
        }

        return 0;
    });

    /* ================= UI ================= */

    if (loading) return <Loader />;

    return (
        <div className="p-6 max-w-6xl mx-auto">

            {/* HEADER */}
            <h1 className="text-2xl font-bold mb-4">My Courses</h1>

            {/* CONTROLS */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

                {/* LEFT: filters */}
                <div className="flex flex-wrap gap-4">

                    {/* SEARCH */}
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-2 rounded-lg border w-64
            bg-[var(--surface)] text-[var(--text)]"
                    />

                    {/* BRANCH */}
                    <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-[var(--surface)]"
                    >
                        <option value="">All Branches</option>
                        {branches.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    {/* SEMESTER */}
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-[var(--surface)]"
                    >
                        <option value="">All Semesters</option>
                        {semesters.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                </div>

                {/* RIGHT: sort */}
                <div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-[var(--surface)]"
                    >
                        <option value="batch">Sort by Batch (Latest)</option>
                        <option value="semester">Sort by Semester (8-1)</option>
                        <option value="name">Sort by Name (A-Z)</option>
                    </select>
                </div>

            </div>

            {/* GRID */}
            {sortedCourses.length === 0 ? (
                <div className="text-center text-[var(--muted-text)] mt-10">
                    No courses found
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sortedCourses.map((course) => (
                        <CourseCard
                            key={course._id + course.batch}
                            course={course}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}