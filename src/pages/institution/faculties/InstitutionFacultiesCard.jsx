// src/pages/institution/faculties/InstitutionFacultiesCard.jsx
import {
    User2,
    Phone,
    Mail,
    BadgeCheck,
    Ban,
    UserStar,
    BookOpen,
    Trash2,
    Pencil,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstitutionFacultiesCard = ({
    faculty,
    departmentName,
    courseCount,
    isStatusUpdating,
    onToggleStatus,
    onEdit,
    onDelete,
    showEdit = true,
    showDelete = true,
    showToggleStatus = true,
}) => {
    const navigate = useNavigate();
    const user = faculty.userId;

    const goToFacultyProfile = () => {
        navigate(`/institution/faculties/profile/${faculty._id}`);
    };

return (
    <div
        onClick={goToFacultyProfile}
        className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5
        cursor-pointer transition-transform duration-200
        hover:scale-[1.02] hover:shadow-[var(--shadow)]
        ${faculty.isActive ? "" : "opacity-60"}`}
    >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
            {/* LEFT */}
            <div className="min-w-0 flex-1 flex items-start gap-3">
                <div
                    className="h-12 w-12  rounded-full border border-[var(--border)]
                    bg-[var(--surface-2)] overflow-hidden grid place-items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user?.name}
                            onError={(e) => (e.currentTarget.src = "/user.png")}
                        />
                    ) : (
                        <User2 className="h-10 w-10 text-[var(--muted-text)]" />
                    )}
                </div>

                <div className="min-w-0">
                    <h3 className="text-lg font-semibold truncate">
                        {user?.name || "Faculty"}
                    </h3>
                    <p className="text-xs text-[var(--muted-text)] truncate">
                        {departmentName}
                    </p>
                </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
            >
                {/* STATUS TOGGLE */}
                {showToggleStatus && <button
                    type="button"
                    onClick={onToggleStatus}
                    disabled={isStatusUpdating}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border
                    ${isStatusUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
                    style={{
                        background: "var(--surface-2)",
                        borderColor: faculty.isActive
                            ? "var(--accent)"
                            : "var(--border)",
                    }}
                    title={faculty.isActive ? "Active" : "Inactive"}
                >
                    <span
                        className="inline-block h-4 w-4 rounded-full transition"
                        style={{
                            background: "var(--text)",
                            transform: faculty.isActive
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
                {showEdit && (
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-xl border border-[var(--border)]
                        bg-[var(--surface-2)]
                        transition-colors
                        hover:bg-[var(--text)] hover:text-[var(--bg)]"
                        title="Edit"
                        type="button"
                    >
                        <Pencil size={16} />
                    </button>
                )}

                {/* DELETE */}
                {showDelete && (
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-xl border border-[var(--border)]
                        bg-[var(--surface-2)]
                        transition-opacity hover:opacity-80"
                        title="Delete"
                        type="button"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>

        {/* BADGES */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
            {faculty.isInCharge && (
                <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                    text-xs font-bold border"
                    style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--accent)",
                    }}
                >
                    <UserStar size={14} />
                    In-Charge
                </span>
            )}

            <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                text-xs font-bold border"
                style={{
                    background: "var(--surface-2)",
                    borderColor: faculty.isActive
                        ? "var(--accent)"
                        : "var(--border)",
                }}
            >
                {faculty.isActive ? <BadgeCheck size={14} /> : <Ban size={14} />}
                {faculty.isActive ? "Active" : "Inactive"}
            </span>

            <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                text-xs font-bold border bg-[var(--surface-2)] border-[var(--border)]"
            >
                <BookOpen size={14} />
                {courseCount} Courses
            </span>
        </div>

        {/* DETAILS */}
        <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-[var(--muted-text)]">
                <Mail size={16} />
                <span className="truncate">{user?.email || "N/A"}</span>
            </div>

            <div className="flex items-center gap-2 text-[var(--muted-text)]">
                <Phone size={16} />
                <span className="truncate">{user?.phone || "N/A"}</span>
            </div>
        </div>
    </div>
);

};

export default InstitutionFacultiesCard;
