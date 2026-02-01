import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ArrowLeft, User2 } from "lucide-react";

import InstitutionFacultiesCard from "./../faculties/InstitutionFacultiesCard.jsx"

import Loader from "../../../components/Loader";

const InstitutionCourseProfile = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const institutionId = useSelector(
    (s) => s.auth.institution.data?._id
  );

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  const [currentFaculties, setCurrentFaculties] = useState([]);
  const [pastFaculties, setPastFaculties] = useState([]);

  const [facultyLoading, setFacultyLoading] = useState(true);

  /* ================= FETCH ================= */

  const fetchCourse = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${courseId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCourse(data.data);
    } catch (err) {
      toast.error(err.message || "Failed to load course");
    }
  };

  const fetchFaculties = async () => {
    if (!institutionId) return;

    try {
      setFacultyLoading(true);

      const [currentRes, pastRes] = await Promise.allSettled([
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/courses/faculty/course/${courseId}/institution/${institutionId}`,
          { credentials: "include" }
        ),
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/courses/faculty/prev-course/${courseId}/institution/${institutionId}`,
          { credentials: "include" }
        ),
      ]);

      if (currentRes.status === "fulfilled") {
        const data = await currentRes.value.json();
        if (currentRes.value.ok) setCurrentFaculties(data.data);
      }

      if (pastRes.status === "fulfilled") {
        const data = await pastRes.value.json();
        if (pastRes.value.ok) setPastFaculties(data.data);
      }
    } catch {
      // silent fail - handled via empty states
    } finally {
      setFacultyLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) return;

    const init = async () => {
      setLoading(true);
      await fetchCourse();
      await fetchFaculties();
      setLoading(false);
    };

    init();
  }, [courseId, institutionId]);

  if (loading) return <Loader />;
  if (!course) return null;

  /* ================= UI ================= */

  return (
    <div className="px-6 py-8 max-w-6xl">

      {/* ===== Header ===== */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--muted-text)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="mt-4 text-3xl font-bold">
          {course.name}
        </h1>
      </div>

      {/* ===== Course Overview ===== */}
      <section className="border-t border-[var(--border)] pt-8 pb-10">
        <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-6 py-7">
          <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent)] rounded-l-2xl" />

          <div className="mb-6 pl-3">
            <h2 className="text-base font-bold">Course Overview: </h2>
          </div>

          <div className="relative pl-3">
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">

              <div className="hidden sm:block absolute left-1/2 top-1 bottom-1 w-[2px] bg-[var(--text)]" />

              <Info label="Course Code" value={course.code} />
              <Info label="Credits" value={course.credits} />
              <Info label="Semester" value={course.semester} />
              <Info label="Evaluation Scheme" value={course.evaluationScheme} />

              <div>
                <p className="text-xs uppercase font-semibold text-[var(--muted-text)]">
                  Department:
                </p>
                <button
                  onClick={() =>
                    navigate(
                      `/institution/departments/profile/${course.departmentId._id}`
                    )
                  }
                  className="mt-1.5 text-lg font-bold text-[var(--accent)] hover:underline"
                >
                  {course.departmentId.name}
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ===== Course Components ===== */}
      <section className="border-t border-[var(--border)] pt-10 mt-10 max-w-6xl">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[var(--text)]">
            Course Components
          </h2>
          <p className="text-sm text-[var(--muted-text)]">
            Evaluation structure and marks distribution
          </p>
        </div>

        {course.components?.length === 0 ? (
          <div
            className="rounded-xl border border-[var(--border)]
      bg-[var(--surface-2)]
      p-6 text-sm text-[var(--muted-text)]"
          >
            No components defined for this course.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.components.map((comp, idx) => (
              <div
                key={`${comp.name}-${idx}`}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"
              >
                {/* NAME */}
                <p className="text-xs uppercase font-semibold text-[var(--muted-text)]">
                  Component
                </p>
                <p className="mt-1 text-lg font-bold text-[var(--text)]">
                  {comp.name}
                </p>

                {/* DETAILS */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-text)]">Max Marks</span>
                    <span className="font-semibold">{comp.maxMarks}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[var(--muted-text)]">Weightage</span>
                    <span className="font-semibold">
                      {comp.weightage}%
                    </span>
                  </div>
                </div>

                {/* TYPE BADGE */}
                <div className="mt-3">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border"
                    style={{
                      background: "var(--surface-2)",
                      borderColor:
                        comp.type === "LAB"
                          ? "var(--accent)"
                          : "var(--border)",
                    }}
                  >
                    {comp.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* ===== Currently Teaching ===== */}
      <section className="border-t border-[var(--border)] pt-10 mt-10 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              Currently Teaching:
            </h2>
          </div>

          <span
            className="px-3 py-1 rounded-lg text-sm font-bold
            bg-[var(--surface-2)]
            border border-[var(--border)]"
          >
            {currentFaculties.length}
          </span>
        </div>

        {facultyLoading ? (
          <div className="py-10">
            <Loader />
          </div>
        ) : currentFaculties.length === 0 ? (
          <div
            className="rounded-xl border border-[var(--border)]
            bg-[var(--surface-2)]
            p-6 text-sm text-[var(--muted-text)]"
          >
            No faculties are currently teaching this course.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFaculties.map((faculty) => (
              <InstitutionFacultiesCard
                key={faculty._id}
                faculty={faculty}
                departmentName={course.departmentId?.name}
                courseCount={faculty.courses?.length || 0}
                showEdit={false}
                showDelete={false}
                showToggleStatus={false}
              />
            ))}
          </div>
        )}
      </section>


      {/* ===== Past Faculties ===== */}
      <section className="border-t border-[var(--border)] pt-10 mt-10 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              Past Faculties:
            </h2>
          </div>

          <span
            className="px-3 py-1 rounded-lg text-sm font-bold
            bg-[var(--surface-2)]
            border border-[var(--border)]"
          >
            {pastFaculties.length}
          </span>
        </div>

        {facultyLoading ? (
          <div className="py-10">
            <Loader />
          </div>
        ) : pastFaculties.length === 0 ? (
          <div
            className="rounded-xl border border-[var(--border)]
            bg-[var(--surface-2)]
            p-6 text-sm text-[var(--muted-text)]"
          >
            No past faculty records found for this course.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastFaculties.map((faculty) => (
              <InstitutionFacultiesCard
                key={faculty._id}
                faculty={faculty}
                departmentName={course.departmentId?.name}
                courseCount={faculty.prevCourses?.length || 0}
                showEdit={false}
                showDelete={false}
                showToggleStatus={false}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

/* ================= Helpers ================= */

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase font-semibold text-[var(--muted-text)]">
      {label}
    </p>
    <p className="mt-1.5 text-lg font-bold">
      {value || "—"}
    </p>
  </div>
);

const FacultySection = ({ title, faculties, loading, navigate }) => (
  <section className="border-t border-[var(--border)] pt-8">
    <h2 className="font-bold mb-4">{title}</h2>

    {loading ? (
      <Loader />
    ) : faculties.length === 0 ? (
      <p className="text-sm text-[var(--muted-text)]">
        No faculties found.
      </p>
    ) : (
      <div className="space-y-3">
        {faculties.map((f) => (
          <div
            key={f._id}
            onClick={() =>
              navigate(`/institution/faculties/profile/${f._id}`)
            }
            className="
                            flex items-center gap-4 p-3 rounded-lg cursor-pointer
                            hover:bg-[var(--surface-2)]
                        "
          >
            {f.userId?.avatar ? (
              <img
                src={f.userId.avatar}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border grid place-items-center">
                <User2 size={18} />
              </div>
            )}

            <div>
              <p className="font-semibold">
                {f.userId?.name}
              </p>
              <p className="text-sm text-[var(--muted-text)]">
                {f.designation || "Faculty"}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default InstitutionCourseProfile;
