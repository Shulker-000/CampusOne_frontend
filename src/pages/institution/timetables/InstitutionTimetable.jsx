import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import EditModal from "../EditModal";

const dayReverseMap = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
};

const InstitutionTimetable = () => {
    const institution = useSelector((s) => s.auth.institution.data);
    const institutionId = institution?._id;

    const BASE = import.meta.env.VITE_BACKEND_URL;

    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState([]);

    const [branches, setBranches] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [courses, setCourses] = useState([]);

    const [mode, setMode] = useState("faculty");

    const [branchId, setBranchId] = useState("");
    const [year, setYear] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    // ================= FETCH =================
    const fetchData = async () => {
        try {
            setLoading(true);

            const [slotRes, branchRes, facultyRes, courseRes] = await Promise.all([
                fetch(`${BASE}/api/timetableSlots/institution/${institutionId}`, { credentials: "include" }),
                fetch(`${BASE}/api/branches/institutions/${institutionId}`, { credentials: "include" }),
                fetch(`${BASE}/api/faculties/by-institution/${institutionId}`, { credentials: "include" }),
                fetch(`${BASE}/api/courses/institution/${institutionId}`, { credentials: "include" })
            ]);

            const slotData = await slotRes.json();
            const branchData = await branchRes.json();
            const facultyData = await facultyRes.json();
            const courseData = await courseRes.json();

            setSlots(slotData.data || []);
            setBranches(branchData.data || []);
            setFaculties((facultyData.data || []).filter(f => f.userId?.active));
            setCourses(courseData.data || []);

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (institutionId) fetchData();
    }, [institutionId]);

    // ================= MAPS =================
    const facultyMap = useMemo(() => {
        const map = {};
        faculties.forEach(f => {
            map[f._id] = f.userId?.name;
        });
        return map;
    }, [faculties]);

    const courseMap = useMemo(() => {
        const map = {};
        courses.forEach(c => {
            map[c._id] = {
                code: c.code,
                name: c.name
            };
        });
        return map;
    }, [courses]);

    // ================= FILTER =================
    const filteredSlots = slots.filter(s => {
        if (mode === "batch") {
            if (!branchId || !year) return false;
            const batch = `${branches.find(b => b._id === branchId)?.code}-${year}`;
            return s.batch === batch;
        }

        if (mode === "faculty") {
            if (!facultyFilter) return false;
            return (s.facultyId?._id || s.facultyId) === facultyFilter;
        }

        return true;
    });

    // ================= EVENTS =================
    const events = filteredSlots.map(s => {
        const facultyId = s.facultyId?._id || s.facultyId;
        const courseId = s.courseId?._id || s.courseId;

        return {
            id: s._id,
            daysOfWeek: [dayReverseMap[s.dayOfWeek]],
            startTime: s.startTime,
            endTime: s.endTime,

            classNames: ["custom-slot"],

            extendedProps: {
                ...s,
                facultyName: facultyMap[facultyId] || "Unknown",
                courseCode: courseMap[courseId]?.code || "CODE",
                courseName: courseMap[courseId]?.name || "Course"
            }
        };
    });

    // ================= CLICK =================
    const handleEventClick = (info) => {
        const data = info.event.extendedProps;

        // split batch → branchCode + year
        const [branchCode, year] = (data.batch || "").split("-");
        const branch = branches.find(b => b.code === branchCode);

        setSelectedEvent({
            ...data,
            _id: info.event.id,
            branchId: branch?._id || "",
            year: year || ""
        });

        setOpenModal(true);
    };

    // ================= UPDATE =================
    const handleUpdate = async () => {
        try {
            const payload = {
                facultyId: selectedEvent.facultyId?._id || selectedEvent.facultyId,
                courseId: selectedEvent.courseId?._id || selectedEvent.courseId,
                batch: computedBatch,
                semester: selectedEvent.semester,
                room: selectedEvent.room,
                type: selectedEvent.type
            };

            await fetch(`${BASE}/api/timetableSlots/slot/${selectedEvent._id}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            toast.success("Updated");
            setOpenModal(false);
            fetchData();

        } catch (err) {
            toast.error(err.message);
        }
    };

    // ================= DELETE =================
    const handleDelete = async () => {
        if (!window.confirm("Delete this slot?")) return;

        try {
            await fetch(`${BASE}/api/timetableSlots/slot/${selectedEvent._id}`, {
                method: "DELETE",
                credentials: "include"
            });

            toast.success("Deleted");
            setOpenModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <Loader />;


    const computedBatch =
        selectedEvent?.branchId && selectedEvent?.year
            ? `${branches.find(b => b._id === selectedEvent.branchId)?.code}-${selectedEvent.year}`
            : null;

    const validFaculties = faculties.filter(f => {
        const allCourses = [
            ...(f.courses || []),
            ...(f.prevCourses || [])
        ];

        return allCourses.some(c =>
            c.batch === computedBatch &&
            Number(c.semester) === Number(selectedEvent?.semester)
        );
    });

    const selectedFaculty = faculties.find(
        f => f._id === (selectedEvent?.facultyId?._id || selectedEvent?.facultyId)
    );

    const validCourseIds =
        selectedFaculty
            ? [
                ...(selectedFaculty.courses || []),
                ...(selectedFaculty.prevCourses || [])
            ]
                .filter(c =>
                    c.batch === computedBatch &&
                    Number(c.semester) === Number(selectedEvent?.semester)
                )
                .map(c => String(c.courseId?._id || c.courseId))
            : [];

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-7xl mx-auto px-5 py-8">

                <h1 className="text-2xl font-bold mb-6">
                    Institution Timetable
                </h1>

                {/* MODE TOGGLE */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setMode("faculty")}
                        className={`px-3 py-2 rounded ${mode === "faculty" ? "bg-[var(--accent)] text-white" : "border"}`}
                    >
                        Faculty View
                    </button>

                    <button
                        onClick={() => setMode("batch")}
                        className={`px-3 py-2 rounded ${mode === "batch" ? "bg-[var(--accent)] text-white" : "border"}`}
                    >
                        Batch View
                    </button>


                </div>

                {/* FILTERS */}
                <div className="flex gap-3 mb-6">
                    {mode === "batch" && (
                        <>
                            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="border px-3 py-2 rounded bg-[var(--surface)]">
                                <option value="">Branch</option>
                                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>

                            <select value={year} onChange={(e) => setYear(e.target.value)} className="border px-3 py-2 rounded bg-[var(--surface)]">
                                <option value="">Year</option>
                                {Array.from(
                                    { length: new Date().getFullYear() - institution.establishedYear + 1 },
                                    (_, i) => new Date().getFullYear() - i
                                ).map(y => <option key={y}>{y}</option>)}
                            </select>
                        </>
                    )}

                    {mode === "faculty" && (
                        <select value={facultyFilter} onChange={(e) => setFacultyFilter(e.target.value)} className="border px-3 py-2 rounded bg-[var(--surface)]">
                            <option value="">Faculty</option>
                            {faculties.map(f => (
                                <option key={f._id} value={f._id}>{f.userId?.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* CALENDAR */}
                <div className="bg-[var(--surface)] border rounded-2xl p-4">
                    <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        events={events}
                        eventClick={handleEventClick}
                        allDaySlot={false}
                        height="auto"

                        slotDuration="01:00:00"
                        slotLabelInterval="01:00:00"

                        slotMinTime="09:00:00"
                        slotMaxTime="17:00:00"

                        hiddenDays={[0]}

                        // SLOT UI
                        eventContent={(arg) => {
                            const { courseCode, courseName, facultyName, room, batch } = arg.event.extendedProps;

                            return (
                                <div
                                    title={`${courseName}\n${facultyName}\n${batch}\nRoom: ${room}`}
                                    className="text-xs p-1"
                                >
                                    <div className="font-semibold mx-auto tracking-wide text-(--text)">{courseCode} ({batch})</div>
                                </div>
                            );
                        }}
                    />
                </div>

                {/* MODAL */}
                <EditModal
                    open={openModal}
                    title="Edit Slot"
                    confirmText="Save"
                    onClose={() => setOpenModal(false)}
                    onConfirm={handleUpdate}
                >
                    <div className="grid grid-cols-2 gap-3">

                        {/* BRANCH */}
                        <select
                            value={selectedEvent?.branchId || ""}
                            onChange={(e) =>
                                setSelectedEvent(p => ({
                                    ...p,
                                    branchId: e.target.value,
                                    facultyId: "",
                                    courseId: ""
                                }))
                            }
                            className="border px-3 py-2 rounded bg-[var(--surface)]"
                        >
                            <option value="">Branch</option>
                            {branches.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>

                        {/* YEAR */}
                        <select
                            value={selectedEvent?.year || ""}
                            onChange={(e) =>
                                setSelectedEvent(p => ({
                                    ...p,
                                    year: e.target.value,
                                    facultyId: "",
                                    courseId: ""
                                }))
                            }
                            className="border px-3 py-2 rounded bg-[var(--surface)]"
                        >
                            <option value="">Year</option>
                            {Array.from(
                                { length: new Date().getFullYear() - institution.establishedYear + 1 },
                                (_, i) => new Date().getFullYear() - i
                            ).map(y => <option key={y}>{y}</option>)}
                        </select>

                        {/* SEM */}
                        <select
                            value={selectedEvent?.semester || ""}
                            onChange={(e) =>
                                setSelectedEvent(p => ({
                                    ...p,
                                    semester: Number(e.target.value),
                                    facultyId: "",
                                    courseId: ""
                                }))
                            }
                            className="border px-3 py-2 rounded bg-[var(--surface)]"
                        >
                            <option value="">Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s}>{s}</option>)}
                        </select>

                        {/* FACULTY */}
                        <select
                            disabled={!computedBatch || !selectedEvent?.semester}
                            value={selectedEvent?.facultyId?._id || selectedEvent?.facultyId || ""}
                            onChange={(e) =>
                                setSelectedEvent(p => ({
                                    ...p,
                                    facultyId: e.target.value,
                                    courseId: ""
                                }))
                            }
                            className="border px-3 py-2 rounded bg-[var(--surface)]"
                        >
                            <option value="">Faculty</option>
                            {validFaculties.map(f => (
                                <option key={f._id} value={f._id}>
                                    {f.userId?.name}
                                </option>
                            ))}
                        </select>

                        {/* COURSE */}
                        <select
                            disabled={!selectedEvent?.facultyId}
                            value={selectedEvent?.courseId?._id || selectedEvent?.courseId || ""}
                            onChange={(e) =>
                                setSelectedEvent(p => ({
                                    ...p,
                                    courseId: e.target.value
                                }))
                            }
                            className="border px-3 py-2 rounded bg-[var(--surface)]"
                        >
                            <option value="">Course</option>
                            {courses
                                .filter(c => validCourseIds.includes(String(c._id)))
                                .map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                        </select>

                        {/* TYPE */}
                        <select
                            value={selectedEvent?.type || ""}
                            onChange={(e) =>
                                setSelectedEvent(p => ({
                                    ...p,
                                    type: e.target.value
                                }))
                            }
                            className="border px-3 py-2 rounded bg-[var(--surface)]"
                        >
                            <option value="LECTURE">Lecture</option>
                            <option value="LAB">Lab</option>
                            <option value="TUTORIAL">Tutorial</option>
                        </select>

                        {/* ROOM */}
                        <input
                            placeholder="Room"
                            value={selectedEvent?.room || ""}
                            onChange={(e) =>
                                setSelectedEvent(p => ({
                                    ...p,
                                    room: e.target.value
                                }))
                            }
                            className="border px-3 py-2 rounded col-span-2 bg-[var(--surface)]"
                        />
                    </div>
                </EditModal>

            </div>
        </div>
    );
};

export default InstitutionTimetable;