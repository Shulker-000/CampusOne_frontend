import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Loader from "../../../components/Loader.jsx";
import CourseCard from "../cards/CourseCard.jsx";

const getBranch = (batch) => {
    const match = batch?.match(/^[A-Z]+/);
    return match ? match[0] : "Unknown";
};

const getYear = (batch) => {
    return parseInt(batch?.match(/\d+/)?.[0] || "0");
};

export default function FacultyPrevCourses() {
    const backend = import.meta.env.VITE_BACKEND_URL;

    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);

    const [branch, setBranch] = useState("");
    const [semester, setSemester] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("batch"); // batch | semester

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
            toast.error(err.message || "Failed to load previous courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    /* ================= TRANSFORM ================= */

    const prevCourses =
        faculty?.prevCourses?.map((c) => ({
            _id: c.courseId._id,
            name: c.courseId.name,
            code: c.courseId.code,
            department: c.courseId.department,
            semester: c.semester,
            batch: c.batch,
        })) || [];

    /* ================= OPTIONS ================= */

    const branches = [
        ...new Set(prevCourses.map((c) => getBranch(c.batch))),
    ];

    const semesters = [
        ...new Set(prevCourses.map((c) => c.semester)),
    ].sort((a, b) => a - b);

    /* ================= FILTER ================= */

    let filtered = prevCourses.filter((c) => {
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

    filtered.sort((a, b) => {
        if (sortBy === "batch") {
            return getYear(b.batch) - getYear(a.batch);
        }
        if (sortBy === "semester") {
            return b.semester - a.semester;
        }
        return 0;
    });

    /* ================= UI ================= */

    if (loading) return <Loader />;

    return (
        <div className="p-6 max-w-6xl mx-auto">

            {/* HEADER + SORT */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Previous Courses</h1>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-[var(--surface)]"
                >
                    <option value="batch">Sort by Batch (Latest)</option>
                    <option value="semester">Sort by Semester</option>
                </select>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-wrap gap-4 mb-6">

                {/* SEARCH */}
                <input
                    type="text"
                    placeholder="Search..."
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

            {/* GRID */}
            {filtered.length === 0 ? (
                <div className="text-center text-[var(--muted-text)] mt-10">
                    No previous courses found
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((course) => (
                        <div
                            key={course._id + course.batch}
                            className="opacity-80 hover:opacity-100 transition"
                        >
                            <CourseCard course={course} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}