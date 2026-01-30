import { motion } from "framer-motion";
import {
    Mail,
    Hash,
    Pencil,
    Trash2,
    User2,
    BadgeCheck,
    Building,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstitutionDepartmentsCard = ({
    dept,
    faculty,
    onEdit,
    onDelete,
}) => {
    const navigate = useNavigate();
    const hoduser = faculty?.userId;
    const goToDepartment = () => {
        
        navigate(`/institution/departments/profile/${dept._id}`);
    };
    
    const goToHod = (e) => {
        if (!faculty) return;
        e.stopPropagation();
        navigate(`/institution/faculties/profile/${faculty._id}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={goToDepartment}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5
                 cursor-pointer transition-transform duration-200
                 hover:scale-[1.02] hover:shadow-[var(--shadow)]"
        >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 flex items-start gap-3">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate">
                            {dept.name}
                        </h3>
                        <p className="text-xs text-[var(--muted-text)] truncate">
                            Code: {dept.code}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="p-2.5 rounded-xl border border-[var(--border)]
                       bg-[var(--surface-2)]
                       transition-colors duration-200
                       hover:bg-[var(--text)] hover:text-[var(--bg)]"
                    >
                        <Pencil size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-2.5 rounded-xl border border-[var(--border)]
                       bg-[var(--surface-2)]
                       transition-opacity duration-200 hover:opacity-80"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                         text-xs font-bold border bg-[var(--surface-2)]
                         border-[var(--border)]">
                    <Hash size={14} />
                    {dept.code}
                </span>

                <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                     text-xs font-bold border bg-[var(--surface-2)]"
                    style={{
                        borderColor: hoduser ? "var(--accent)" : "var(--border)",
                    }}
                >
                    <BadgeCheck size={14} />
                    {hoduser ? "HOD Assigned" : "No HOD"}
                </span>
            </div>

            {/* EMAIL */}
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--muted-text)]">
                <Mail size={16} />
                <span className="truncate">{dept.contactEmail}</span>
            </div>

            {/* HOD BLOCK */}
            <div
                className={`group mt-4 p-3 flex items-center gap-3 rounded-xl
                    border border-[var(--border)]
                    bg-[var(--surface-2)]
                    transition-all duration-300 ease-out
                    ${hoduser
                        ? "cursor-pointer hover:border-[var(--accent)] hover:shadow-sm"
                        : ""
                    }`}
                style={
                    hoduser
                        ? {
                            // smooth theme-dependent tint
                            background:
                                "linear-gradient(0deg, var(--surface-2), var(--surface-2))",
                        }
                        : undefined
                }
            >
                {hoduser?.avatar ? (
                    <img
                        src={hoduser.avatar}
                        onClick={goToHod}
                        onError={(e) => (e.currentTarget.src = "/user.png")}
                        className="w-12 h-12 rounded-full object-cover
                       transition-transform duration-300 ease-out
                       group-hover:scale-105"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--surface)]
                          border grid place-items-center">
                        <User2 size={18} />
                    </div>
                )}

                <div
                    onClick={goToHod}
                    className={`min-w-0 flex-1 transition-colors duration-300 ease-out
                      ${hoduser
                            ? "group-hover:text-[var(--accent)]"
                            : ""
                        }`}
                >
                    <p className="text-[11px] text-[var(--muted-text)] font-semibold">
                        HOD
                    </p>

                    <p className="text-sm font-semibold truncate">
                        {hoduser?.name || "Not Assigned"}
                    </p>

                    {hoduser?.email && (
                        <p className="text-xs font-semibold truncate">
                            {hoduser.email}
                        </p>
                    )}
                </div>

                {hoduser && (
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold
                           border border-[var(--border)]
                           transition-colors duration-300
                           group-hover:border-[var(--accent)]
                           group-hover:text-[var(--accent)]">
                        Assigned
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default InstitutionDepartmentsCard;
