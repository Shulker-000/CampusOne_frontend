import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  User2,
  Plus,
  BadgeCheck,
  Ban,
} from "lucide-react";

import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";
import InstitutionCoursesCard from "../courses/InstitutionCoursesCard";

const InstitutionFacultyProfile = () => {
  const navigate = useNavigate();
  const { facultyId } = useParams();

  const institutionId = useSelector(
    (s) => s.auth.institution.data?._id
  );

  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState(null);

  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);

  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null, // "finish" | "delete"
    payload: null,
  });


  /* ============ ADD COURSE STATE ============ */
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    courseId: "",
    branchCode: "",
    year: "",
    semester: "",
  });

  const batch = useMemo(() => {
    if (!form.branchCode || !form.year) return "";
    return `${form.branchCode}-${form.year}`;
  }, [form.branchCode, form.year]);

  /* ================= FETCH ================= */

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFaculty(data.data); // THIS WAS MISSING
    } catch (err) {
      toast.error(err.message || "Failed to load faculty");
    } finally {
      setLoading(false);
    }
  };

  const openFinishConfirm = (courseId, batch) => {
    setConfirmState({
      open: true,
      type: "finish",
      payload: { courseId, batch },
    });
  };

  const openDeleteConfirm = (courseId, semester, batch, prev) => {
    setConfirmState({
      open: true,
      type: "delete",
      payload: { courseId, semester, batch, prev },
    });
  };


  const fetchCoursesAndBranches = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/courses/department/${faculty.departmentId._id}`,
          { credentials: "include" }
        ),
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${institutionId}`,
          { credentials: "include" }
        ),
      ]);

      const cData = await cRes.json();
      const bData = await bRes.json();

      if (cRes.ok) setCourses(cData.data || []);
      if (bRes.ok) setBranches(bData.data || []);
    } catch {
      toast.error("Failed to load courses or branches");
    }
  };

  useEffect(() => {
    if (!facultyId) return;
    fetchFaculty();
  }, [facultyId]);

  if (loading) return <Loader />;
  if (!faculty) return null;

  /* ================= HELPERS ================= */

  const mapFacultyCourse = (fc) => ({
    _id: fc.courseId?._id || `deleted-${fc.batch}`,
    name: fc.courseId?.name || "Deleted Course",
    code: fc.courseId?.code || "N/A",
    semester: fc.semester,
    isOpen: true,
    batch: fc.batch,
    department: faculty.departmentId,
    __meta: {
      batch: fc.batch,
      semester: fc.semester,
      deleted: !fc.courseId,
    },
  });

  /* ================= ACTIONS ================= */

  const addCourse = async () => {
    if (!form.courseId || !form.semester || !batch) {
      toast.error("All fields are required");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/courses`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course: {
              courseId: form.courseId,
              semester: Number(form.semester),
              batch,
            },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await fetchFaculty();
      toast.success("Course added");
      setShowAdd(false);
      setForm({ courseId: "", branchCode: "", year: "", semester: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const finishCourse = async (courseId, batch) => {
    try {
      setSaving(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/courses/${courseId}/finish`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batch }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await fetchFaculty();
      toast.success("Course finished");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (courseId, semester, batch, prev) => {
    try {
      setSaving(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/${prev ? "prev-courses" : "courses"}/${courseId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ semester, batch }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await fetchFaculty();
      toast.success("Course removed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleInCharge = async () => {
    try {
      setSaving(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/in-charge`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isInCharge: !faculty.isInCharge }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await fetchFaculty();
      toast.success("In-charge status updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  const user = faculty.userId;

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
          {user?.name}
        </h1>
      </div>

      {/* ===== Faculty Overview ===== */}
      <section className="border-t border-[var(--border)] pt-8 pb-10">
        <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-6 py-7">
          <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent)] rounded-l-2xl" />

          <div className="flex gap-6 pl-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                onError={(e) => (e.currentTarget.src = "/user.png")}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border grid place-items-center">
                <User2 size={28} />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4 flex-1">
              <Info label="Email" value={user?.email} />
              <Info label="Phone" value={user?.phone} />
              <Info label="Designation" value={faculty.designation} />
              <Info
                label="Department"
                value={faculty.departmentId?.name}
                clickable
                onClick={() =>
                  navigate(`/institution/departments/profile/${faculty.departmentId._id}`)
                }
              />
              <Info
                label="In-charge"
                value={faculty.isInCharge ? "Yes" : "No"}
              />
              <Info
                label="Date of Joining"
                value={new Date(faculty.dateOfJoining).toLocaleDateString()}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Secondary Stats ===== */}
      <section className="border-t border-[var(--border)] pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Current Courses" value={faculty.courses.length} />
          <Stat label="Previous Courses" value={faculty.prevCourses.length} />
          <Stat
            label="In-charge"
            value={
              faculty.isInCharge ? (
                <BadgeCheck className="text-green-600" />
              ) : (
                <Ban className="text-red-500" />
              )
            }
          />
          <button
            onClick={toggleInCharge}
            disabled={saving}
            className="bg-[var(--surface-2)] border border-[var(--border)]
            rounded-xl p-4 text-sm font-bold hover:opacity-80"
          >
            Toggle In-charge
          </button>
        </div>
      </section>

      {/* ===== Add Course ===== */}
      <div className="mt-10">
        <button
          onClick={async () => {
            await fetchCoursesAndBranches();
            setShowAdd(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
          bg-[var(--accent)] text-white font-semibold"
        >
          <Plus size={16} />
          Add Course
        </button>
      </div>

      {/* ===== Current Courses ===== */}
      <CourseSection
        title="Currently Teaching:"
        courses={faculty.courses}
        mapFn={mapFacultyCourse}
        onFinishConfirm={openFinishConfirm}
        onDeleteConfirm={openDeleteConfirm}
        prev={false}
      />

      <CourseSection
        title="Previously Taught Courses:"
        courses={faculty.prevCourses}
        mapFn={mapFacultyCourse}
        onDeleteConfirm={openDeleteConfirm}
        prev
      />


      {/* ===== Add Course Modal ===== */}
      <ConfirmModal
        open={showAdd}
        title="Add Course"
        loading={saving}
        onClose={() => setShowAdd(false)}
        onConfirm={addCourse}
      >
        <div className="space-y-3">
          <select
            className="w-full rounded-lg px-3 py-2
  bg-[var(--surface)]
  text-[var(--text)]
  border border-[var(--border)]
  focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={form.courseId}
            onChange={(e) =>
              setForm({ ...form, courseId: e.target.value })
            }
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-lg px-3 py-2
  bg-[var(--surface)]
  text-[var(--text)]
  border border-[var(--border)]
  focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={form.branchCode}
            onChange={(e) =>
              setForm({ ...form, branchCode: e.target.value })
            }
          >
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b._id} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Year of Admission (YYYY)"
            className="w-full border rounded-lg px-3 py-2"
            value={form.year}
            onChange={(e) =>
              setForm({ ...form, year: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Semester"
            className="w-full border rounded-lg px-3 py-2"
            value={form.semester}
            onChange={(e) =>
              setForm({ ...form, semester: e.target.value })
            }
          />

          <input
            disabled
            value={batch}
            placeholder="Batch"
            className="w-full border rounded-lg px-3 py-2 bg-[var(--surface-2)]"
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={confirmState.open}
        title={
          confirmState.type === "finish"
            ? "Finish Course"
            : "Delete Course"
        }
        message={
          confirmState.type === "finish"
            ? "This will move the course to previously taught courses."
            : "This will permanently remove the course from the faculty record."
        }
        confirmText={
          confirmState.type === "finish" ? "Finish" : "Delete"
        }
        variant={confirmState.type === "delete" ? "danger" : "primary"}
        loading={saving}
        onClose={() =>
          !saving && setConfirmState({ open: false, type: null, payload: null })
        }
        onConfirm={async () => {
          if (confirmState.type === "finish") {
            await finishCourse(
              confirmState.payload.courseId,
              confirmState.payload.batch
            );
          }

          if (confirmState.type === "delete") {
            const { courseId, semester, batch, prev } =
              confirmState.payload;

            await deleteCourse(courseId, semester, batch, prev);
          }

          setConfirmState({ open: false, type: null, payload: null });
        }}
      />
    </div>
  );
};

/* ================= Helpers ================= */

const Info = ({ label, value, clickable, onClick }) => (
  <div>
    <p className="text-xs uppercase font-semibold text-[var(--muted-text)]">
      {label}
    </p>
    <p
      onClick={onClick}
      className={`mt-1.5 text-lg font-bold ${clickable
        ? "text-[var(--accent)] hover:underline cursor-pointer"
        : ""
        }`}
    >
      {value || "—"}
    </p>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
    <p className="text-xs font-semibold text-[var(--muted-text)]">
      {label}
    </p>
    <p className="mt-1 text-xl font-bold">
      {value}
    </p>
  </div>
);

const CourseSection = ({
  title,
  courses,
  mapFn,
  onFinishConfirm,
  onDeleteConfirm,
  prev,
}) => (

  <section className="border-t border-[var(--border)] pt-10 mt-10 max-w-7xl">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-[var(--text)]">
        {title}
      </h2>
      <span
        className="px-3 py-1 rounded-lg text-sm font-bold
        bg-[var(--surface-2)]
        border border-[var(--border)]"
      >
        {courses.length}
      </span>
    </div>

    {courses.length === 0 ? (
      <div
        className="rounded-xl border border-[var(--border)]
        bg-[var(--surface-2)]
        p-6 text-sm text-[var(--muted-text)]"
      >
        No courses found.
      </div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((fc) => {
          const course = mapFn(fc);
          return (
            <InstitutionCoursesCard
              key={`${course._id}-${fc.batch}`}
              course={course}
              showEdit={false}
              showToggleStatus={false}
              showBatch={true}
              showFinish={!prev && !course.__meta.deleted}
              onFinish={() =>
                onFinishConfirm?.(
                  course._id,
                  course.__meta.batch
                )
              }
              onDelete={() =>
                onDeleteConfirm?.(
                  course._id,
                  course.__meta.semester,
                  course.__meta.batch,
                  prev
                )
              }
            />
          );
        })}
      </div>
    )}
  </section>
);

export default InstitutionFacultyProfile;
