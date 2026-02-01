import { motion } from "framer-motion";
import {
    Hash,
    BookOpen,
    GraduationCap,
    Trash2,
    BadgeCheck,
    Ban,
    Loader2,
    Pencil,
    CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstitutionCoursesCard = ({
    course,
    onEdit,
    onDelete,
    onFinish,
    onToggleStatus,
    isStatusUpdating,
    showEdit = true,
    showDelete = true,
    showToggleStatus = true,
    showFinish = false,
    batch,
    showBatch = false,
}) => {
    const navigate = useNavigate();

    const goToCourseProfile = () => {
        navigate(`/institution/courses/profile/${course._id}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={goToCourseProfile}
            className={`bg-[var(--surface)] border border-[var(--border)]
        rounded-2xl p-5 transition cursor-pointer
        hover:scale-[1.02] hover:shadow-[var(--shadow)]
        ${course.isOpen ? "" : "opacity-60"}`}
        >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-3">
                {/* LEFT */}
                <div className="min-w-0 flex-1 flex items-start gap-3">

                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate text-[var(--text)]">
                            {course.name}
                        </h3>
                        <p className="text-xs text-[var(--muted-text)] truncate">
                            Code: {course.code}
                        </p>
                    </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    {showFinish && (
                        <button
                            onClick={onFinish}
                            className="p-2 rounded-xl border
                            bg-[var(--surface-2)]
                            hover:opacity-80"
                            title="Finish course"
                        >
                            <CheckCircle2 size={16} />
                        </button>
                    )}

                    {/* STATUS TOGGLE */}
                    {showToggleStatus && <button
                        type="button"
                        onClick={onToggleStatus}
                        disabled={isStatusUpdating}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full border
                    ${isStatusUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
                        style={{
                            background: "var(--surface-2)",
                            borderColor: course.isOpen
                                ? "var(--accent)"
                                : "var(--border)",
                        }}
                        title={course.isOpen ? "Open" : "Closed"}
                    >
                        <span
                            className="inline-block h-4 w-4 rounded-full transition"
                            style={{
                                background: "var(--text)",
                                transform: course.isOpen
                                    ? "translateX(22px)"
                                    : "translateX(3px)",
                            }}
                        />

                        {isStatusUpdating && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-3 h-3 animate-spin text-[var(--muted-text)]" />
                            </span>
                        )}
                    </button>}

                    {/* EDIT */}
                    {showEdit && <button
                        onClick={onEdit}
                        className="p-2 rounded-xl border border-[var(--border)]
                    bg-[var(--surface-2)]
                    transition-colors
                    hover:bg-[var(--text)] hover:text-[var(--bg)]"
                        title="Edit"
                        type="button"
                    >
                        <Pencil size={16} />
                    </button>}

                    {/* DELETE */}
                    {showDelete && <button
                        onClick={onDelete}
                        className="p-2 rounded-xl border border-[var(--border)]
                    bg-[var(--surface-2)]
                    transition-opacity hover:opacity-80"
                        title="Delete"
                        type="button"
                    >
                        <Trash2 size={16} />
                    </button>}
                </div>
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                text-xs font-bold border bg-[var(--surface-2)]
                border-[var(--border)]"
                >
                    <Hash size={14} />
                    {course.code || "N/A"}
                </span>

                <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                text-xs font-bold border"
                    style={{
                        background: "var(--surface-2)",
                        borderColor: course.isOpen
                            ? "var(--accent)"
                            : "var(--border)",
                    }}
                >
                    {course.isOpen ? <BadgeCheck size={14} /> : <Ban size={14} />}
                    {course.isOpen ? "Open" : "Closed"}
                </span>
                {showBatch && <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                text-xs font-bold border bg-[var(--surface-2)]
                border-[var(--border)]"
                >
                    Batch: {course.batch || "N/A"}
                </span>}

                <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                text-xs font-bold border bg-[var(--surface-2)]
                border-[var(--border)]"
                >
                    <GraduationCap size={14} />
                    Sem: {course.semester ?? "N/A"}
                </span>

            </div>

            {/* DETAILS */}
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--muted-text)]">
                    <BookOpen size={16} />
                    <span className="font-semibold text-[var(--text)]"
                        onClick={() => {
                            console.log(course);

                        }}>
                        Dept:
                    </span>
                    <span>{`${course.department.name}   |    ${course.department.code}` ?? "N/A"}</span>
                </div>
            </div>
        </motion.div>
    );

};

export default InstitutionCoursesCard;
