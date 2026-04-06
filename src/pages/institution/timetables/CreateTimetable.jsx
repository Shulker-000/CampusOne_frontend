import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import EditModal from "../EditModal";

const formatTime = (dateStr) =>
    new Date(dateStr).toTimeString().slice(0, 5);

const CreateTimetable = () => {
    const institution = useSelector((s) => s.auth.institution.data);
    const institutionId = institution?._id;

    const [loading, setLoading] = useState(true);

    const [courses, setCourses] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [branches, setBranches] = useState([]);

    const [selectedSlot, setSelectedSlot] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    // dynamic years
    const currentYear = new Date().getFullYear();
    const years = [];
    for (
        let y = currentYear;
        y >= (institution?.establishedYear || currentYear);
        y--
    ) {
        years.push(y);
    }

    // ================= FETCH =================

    const fetchData = async () => {
        try {
            setLoading(true);

            const BASE = import.meta.env.VITE_BACKEND_URL;
            // course, faculties, branch
            const [cRes, fRes, bRes] = await Promise.all([
                fetch(`${BASE}/api/courses/institution/${institutionId}`, {
                    credentials: "include",
                }),
                fetch(`${BASE}/api/faculties/by-institution/${institutionId}`, {
                    credentials: "include",
                }),
                fetch(`${BASE}/api/branches/institutions/${institutionId}`, {
                    credentials: "include",
                }),
            ]);

            const cData = await cRes.json();
            const fData = await fRes.json();
            const bData = await bRes.json();

            setCourses(cData.data || []);
            setBranches(bData.data || []);

            const active = (fData.data || []).filter(
                (f) => f.userId?.active
            );
            setFaculties(active);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (institutionId) fetchData();
    }, [institutionId]);

    // ================= SLOT SELECT =================
    const handleSelect = (info) => {
        const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayIndex = info.start.getDay();

        if (dayIndex === 0) {
            toast.error("Sunday not allowed");
            return;
        }

        setSelectedSlot({
            startTime: formatTime(info.startStr),
            endTime: formatTime(info.endStr),
            dayOfWeek: dayMap[dayIndex],
            courseId: "",
            facultyId: "",
            branchId: "",
            year: "",
            semester: "",
            type: "Lecture",
            room: "",
        });

        setOpenModal(true);
    };
    // ================= COMPUTED =================

    const computedBatch =
        selectedSlot?.branchId && selectedSlot?.year
            ? `${branches.find((b) => b._id === selectedSlot.branchId)?.code
            }-${selectedSlot.year}`
            : null;

    const validFaculties = faculties.filter(f => {
        const allCourses = [
            ...(f.courses || []),
            ...(f.prevCourses || [])
        ];

        return allCourses.some(c =>
            c.batch === computedBatch &&
            Number(c.semester) === Number(selectedSlot?.semester)
        );
    });

    const selectedFaculty = faculties.find(
        f => f._id === selectedSlot?.facultyId
    );

    const validCourseIds =
        selectedFaculty
            ? [
                ...(selectedFaculty.courses || []),
                ...(selectedFaculty.prevCourses || [])
            ]
                .filter(c =>
                    c.batch === computedBatch &&
                    Number(c.semester) === Number(selectedSlot?.semester)
                )
                .map(c => String(c.courseId?._id || c.courseId))
            :
            [];

    // ================= SAVE =================

    const handleSave = async () => {
        try {
            if (!computedBatch) {
                toast.error("Select batch properly");
                return;
            }

            const BASE = import.meta.env.VITE_BACKEND_URL;

            const res = await fetch(`${BASE}/api/timetableSlots/slot`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...selectedSlot,
                    type: selectedSlot.type, // already correct now
                    dayOfWeek: selectedSlot.dayOfWeek,
                    batch: computedBatch,
                    institutionId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Slot created");
            setOpenModal(false);
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-7xl mx-auto px-5 py-8">

                <h1 className="text-2xl font-bold mb-6">
                    Create Timetable
                </h1>

                {/* CALENDAR */}
                <div className="bg-[var(--surface)] border rounded-2xl p-4">
                    <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        selectable
                        select={handleSelect}
                        allDaySlot={false}
                        height="auto"

                        slotDuration="01:00:00"
                        slotLabelInterval="01:00:00"

                        slotMinTime="09:00:00"
                        slotMaxTime="17:00:00"

                        hiddenDays={[0]}
                        selectAllow={(selectInfo) => {
                            return selectInfo.start.getDay() !== 0;
                        }}

                        events={[
                            {
                                daysOfWeek: [1, 2, 3, 4, 5],
                                startTime: "10:40",
                                endTime: "11:00",
                                display: "background",
                                color: "#fff"
                            },
                            {
                                daysOfWeek: [1, 2, 3, 4, 5],
                                startTime: "12:40",
                                endTime: "14:00",
                                display: "background",
                                color: "#444"
                            }
                        ]}
                    />
                </div>

                {/* MODAL */}
                <EditModal
                    open={openModal}
                    title="Add Slot"
                    confirmText="Create"
                    onClose={() => setOpenModal(false)}
                    onConfirm={handleSave}
                >
                    <div className="grid grid-cols-2 gap-3">

                        {/* BRANCH */}
                        <select
                            className="border rounded-lg px-3 py-2 bg-[var(--surface)]"
                            value={selectedSlot?.branchId || ""}
                            onChange={(e) =>
                                setSelectedSlot((p) => ({
                                    ...p,
                                    branchId: e.target.value,
                                    facultyId: "",
                                    courseId: "",
                                }))
                            }
                        >
                            <option value="">Branch</option>
                            {branches.map((b) => (
                                <option key={b._id} value={b._id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>

                        {/* YEAR */}
                        <select
                            className="border rounded-lg px-3 py-2 bg-[var(--surface)]"
                            value={selectedSlot?.year || ""}
                            onChange={(e) =>
                                setSelectedSlot((p) => ({
                                    ...p,
                                    year: e.target.value,
                                    facultyId: "",
                                    courseId: "",
                                }))
                            }
                        >
                            <option value="">Year</option>
                            {years.map((y) => (
                                <option key={y}>{y}</option>
                            ))}
                        </select>

                        {/* SEM */}
                        <select
                            className="border rounded-lg px-3 py-2 bg-[var(--surface)]"
                            value={selectedSlot?.semester || ""}
                            onChange={(e) =>
                                setSelectedSlot((p) => ({
                                    ...p,
                                    semester: Number(e.target.value),
                                    facultyId: "",
                                    courseId: "",
                                }))
                            }
                        >
                            <option value="">Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                        {computedBatch && selectedSlot?.semester && validFaculties.length === 0 && (
                            <p className="text-red-400 text-sm col-span-2">
                                No faculty available for this batch & semester
                            </p>
                        )}
                        {/* FACULTY */}
                        <select
                            disabled={!computedBatch || !selectedSlot?.semester}
                            className="border rounded-lg px-3 py-2 bg-[var(--surface)]"
                            value={selectedSlot?.facultyId || ""}
                            onChange={(e) =>
                                setSelectedSlot((p) => ({
                                    ...p,
                                    facultyId: e.target.value,
                                    courseId: "",
                                }))
                            }
                        >
                            <option value="">Faculty</option>
                            {validFaculties.map((f) => (
                                <option key={f._id} value={f._id}>
                                    {f.userId?.name}
                                </option>
                            ))}
                        </select>

                        {/* COURSE */}
                        <select
                            disabled={!selectedSlot?.facultyId}
                            className="border rounded-lg px-3 py-2 bg-[var(--surface)]"
                            value={selectedSlot?.courseId || ""}
                            onChange={(e) =>
                                setSelectedSlot((p) => ({
                                    ...p,
                                    courseId: e.target.value,
                                }))
                            }
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
                            className="border rounded-lg px-3 py-2 bg-[var(--surface)]"
                            value={selectedSlot?.type || ""}
                            onChange={(e) =>
                                setSelectedSlot((p) => ({
                                    ...p,
                                    type: e.target.value,
                                }))
                            }
                            onClick={() => {
                                console.log(computedBatch);

                            }}
                        >
                            <option value="LECTURE">Lecture</option>
                            <option value="LAB">Lab</option>
                            <option value="TUTORIAL">Tutorial</option>
                        </select>

                        {/* ROOM */}
                        <input
                            placeholder="Room"
                            className="border rounded-lg px-3 py-2 col-span-2 bg-[var(--surface)]"
                            value={selectedSlot?.room || ""}
                            onChange={(e) =>
                                setSelectedSlot((p) => ({
                                    ...p,
                                    room: e.target.value,
                                }))
                            }
                        />
                    </div>
                </EditModal>
            </div>
        </div>
    );
};

export default CreateTimetable;