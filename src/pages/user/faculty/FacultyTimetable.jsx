import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

import Loader from "../../../components/Loader.jsx";

const dayReverseMap = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
};

const FacultyTimetable = () => {
    const BASE = import.meta.env.VITE_BACKEND_URL;

    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState([]);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // updates every second

        return () => clearInterval(interval);
    }, []);

    /* ================= FETCH ================= */

    const fetchData = async () => {
        try {
            setLoading(true);

            const res1 = await fetch(`${BASE}/api/users/faculty`, {
                credentials: "include",
            });
            const data1 = await res1.json();
            if (!res1.ok) throw new Error(data1.message);

            const res2 = await fetch(
                `${BASE}/api/timetableSlots/faculty/${data1.data._id}`,
                { credentials: "include" }
            );

            const data2 = await res2.json();
            if (!res2.ok) throw new Error(data2.message);

            setSlots(data2.data || []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* ================= EVENTS ================= */

    const events = slots.map((s) => ({
        id: s._id,
        daysOfWeek: [dayReverseMap[s.dayOfWeek]],
        startTime: s.startTime,
        endTime: s.endTime,

        classNames: ["custom-slot"],   // 🔥 SAME AS INST

        extendedProps: {
            courseCode: s.courseId?.code,
            batch: s.batch,
            room: s.room,
        },
    }));

    /* ================= UI ================= */

    if (loading) return <Loader />;
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col gap-8">

                <div className="px-8 py-4 tracking-wide text-[var(--text)]">

                    <div className="text-sm md:text-base opacity-70">
                        {currentTime.toLocaleString("en-IN", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </div>

                    <div className="text-lg md:text-2xl font-bold">
                        {currentTime.toLocaleString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                        })}
                    </div>

                </div>

                <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-4 overflow-x-auto">

                    <h2 className="text-lg font-semibold mb-4">
                        My Timetable
                    </h2>

                    {events.length === 0 ? (
                        <p className="text-sm text-[var(--muted-text)]">
                            No timetable assigned
                        </p>
                    ) : (
                        <div className="min-w-[700px]">
                            <FullCalendar
                                plugins={[timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                events={events}
                                allDaySlot={false}
                                height="auto"

                                slotDuration="01:00:00"
                                slotLabelInterval="01:00:00"

                                slotMinTime="09:00:00"
                                slotMaxTime="17:20:00"

                                hiddenDays={[0]}

                                eventContent={(arg) => {
                                    const { courseCode, batch, room } =
                                        arg.event.extendedProps;

                                    return (
                                        <div className="px-1 py-[2px] leading-tight"
                                            title={`Code: ${courseCode}\nBatch: ${batch}\nRoom No: ${room}`}>
                                            <div className="font-semibold break-words whitespace-normal">
                                                {/* Always visible */}
                                                <span>{courseCode}</span>

                                                {/* Only visible on md and larger */}
                                                <span className="hidden xl:inline">
                                                    {" "}({batch})
                                                </span>
                                                <span> ({room})</span>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default FacultyTimetable;