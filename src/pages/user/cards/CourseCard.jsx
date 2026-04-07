import { motion } from "framer-motion";
import { Hash, GraduationCap } from "lucide-react";

const CourseCard = ({ course }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] border border-[var(--border)]
      rounded-2xl p-5 transition
      hover:scale-[1.02] hover:shadow-[var(--shadow)]"
        >
            {/* HEADER */}
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-[var(--text)] truncate">
                    {course.name}
                </h3>
                <p className="text-xs text-[var(--muted-text)]">
                    Code: {course.code}
                </p>
            </div>

            {/* BADGES ROW */}
            <div className="flex flex-wrap items-center gap-3 mt-4">

                {/* CODE */}
                <span className="badge">
                    <Hash size={14} />
                    {course.code}
                </span>

                {/* SEM */}
                <span className="badge">
                    <GraduationCap size={14} />
                    Sem {course.semester}
                </span>

                {/* BATCH */}
                <span className="badge">
                    Batch: {course.batch}
                </span>

            </div>

            {/* OPTIONAL DEPT */}
            {course.department && (
                <div className="mt-4 text-sm text-[var(--muted-text)]">
                    Dept:{" "}
                    <span className="text-[var(--text)] font-medium">
                        {course.department.name}
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default CourseCard;