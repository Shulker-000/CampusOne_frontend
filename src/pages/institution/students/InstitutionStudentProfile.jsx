import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Pencil, Plus } from "lucide-react";

import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";
import InstitutionCoursesCard from "../courses/InstitutionCoursesCard";

const InstitutionStudentProfile = ({ mode = "institution" }) => {
  const { studentId } = useParams();

  const isInstitution = mode === "institution";

  const [student, setStudent] = useState(null);
  const [department, setDepartment] = useState(null);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    dob: "",
  });

  const [showAdd, setShowAdd] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [confirm, setConfirm] = useState({ open: false, type: null, id: null });

  const [statusLoading, setStatusLoading] = useState(false);

  /* ================= FETCH ================= */

  const fetchStudent = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/${studentId}`, {
      credentials: "include",
    });
    const data = await res.json();

    setStudent(data.data);

    setEditForm({
      name: data.data.userId.name,
      phone: data.data.userId.phone,
      dob: data.data.userId.dob,
    });

    await fetchDepartment(data.data.branchId._id);
    setLoading(false);
  };

  const fetchDepartment = async (branchId) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/branches/${branchId}/department`, {
      credentials: "include",
    });
    const data = await res.json();
    setDepartment(data.data);
  };

  const fetchCourses = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/courses/institution/${student.institutionId._id}`,
      { credentials: "include" }
    );
    const data = await res.json();
    setCourses(data.data || []);
  };

  const toggleStatus = async () => {
    try {
      setStatusLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/students/change-status/${studentId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !student.isActive }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      fetchStudent();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  if (loading || !student || !department) return <Loader />;

  const user = student.userId;

  /* ================= HELPERS ================= */

  const getId = (c, prev) => (prev ? c.courseId?._id : c._id);

  const mapCourse = (c, prev = false) => {
    const safeDept = department;

    if (!prev) return { ...c, department: safeDept };

    // 🔴 fallback handling
    return {
      _id: typeof c.courseId === "object" ? c.courseId._id : c.courseId,
      name:
        typeof c.courseId === "object"
          ? c.courseId.name
          : "Course", // fallback
      code:
        typeof c.courseId === "object"
          ? c.courseId.code
          : "-",
      semester: c.semester,
      isOpen: true,
      department: safeDept,
    };
  };
  /* ================= API ================= */

  const updateStudent = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/edit-student/${studentId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: student.userId._id,
          ...editForm,
        }),
      });

      const text = await res.text(); // debug

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        throw new Error("Server returned invalid response");
      }

      if (!res.ok) throw new Error(data.message);

      toast.success("Updated");
      setEditOpen(false);
      fetchStudent();
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async () => {
    const { type, id } = confirm;

    try {
      setSaving(true);

      if (type === "delete")
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/delete-courses/${studentId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseIds: [id] }),
        });

      if (type === "deletePrev")
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/delete-prev-courses/${studentId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseIds: [id] }),
        });

      if (type === "toggleStatus") {
        await toggleStatus();
        return;
      }

      fetchStudent();
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
      setConfirm({ open: false });
    }
  };

  const addCourse = async () => {
    if (!selectedCourse) return;

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/add-courses/${studentId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseIds: [selectedCourse] }),
    });

    fetchStudent();
    setShowAdd(false);
  };

  /* ================= UI ================= */

return (
  <div className="px-6 py-8 max-w-6xl mx-auto">

    {/* ===== HEADER ===== */}
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)]">
          {user.name}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Student Profile
        </p>
      </div>

      {(isInstitution || mode === "user") && (
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
          bg-[var(--accent)] text-white hover:opacity-90"
        >
          <Pencil size={16} />
          Edit
        </button>
      )}
    </div>

    {/* ===== OVERVIEW ===== */}
    <section className="border-t border-[var(--border)] pt-8 pb-10">
      <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-6 py-7">

        <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent)] rounded-l-2xl" />

        <div className="pl-3 grid sm:grid-cols-2 gap-x-10 gap-y-4">

          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.phone} />
          <Info label="Department" value={department.name} />
          <Info label="Branch" value={student.branchId.name} />
          <Info label="Semester" value={student.semester} />

          {/* STATUS */}
          <div>
            <p className="text-xs uppercase font-semibold text-[var(--muted-text)]">
              Status
            </p>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() =>
                  setConfirm({ open: true, type: "toggleStatus" })
                }
                disabled={statusLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition
                ${statusLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                style={{
                  background: student.isActive
                    ? "var(--accent)"
                    : "var(--surface-2)",
                }}
              >
                <span
                  className="inline-block h-4 w-4 bg-white rounded-full transition"
                  style={{
                    transform: student.isActive
                      ? "translateX(22px)"
                      : "translateX(3px)",
                  }}
                />
              </button>

              <span className="text-sm font-semibold text-[var(--text)]">
                {student.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>

    {/* ===== STATS ===== */}
    <section className="border-t border-[var(--border)] pt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

        <Stat
          label="Current Courses"
          value={student.courseIds.length}
        />

        <Stat
          label="Previous Courses"
          value={(student.prevCourses || []).length}
        />

        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-semibold text-[var(--muted-text)]">
            Status
          </p>
          <p className="mt-1 text-xl font-bold">
            {student.isActive ? "Active" : "Inactive"}
          </p>
        </div>

      </div>
    </section>

    {/* ===== ACTION ===== */}
    {isInstitution && (
      <div className="mt-8 flex justify-end">
        <button
          onClick={async () => {
            await fetchCourses();
            setShowAdd(true);
          }}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={16} />
          Add Course
        </button>
      </div>
    )}

    {/* ===== COURSES ===== */}
    <div className="mt-10 space-y-10">

      <CourseSection
        title="Current Courses"
        courses={student.courseIds}
        mapFn={(c) => mapCourse(c)}
        isInstitution={isInstitution}
        onAction={(type, id) =>
          setConfirm({ open: true, type, id })
        }
      />

      <CourseSection
        title="Previous Courses"
        courses={student.prevCourses || []}
        mapFn={(c) => mapCourse(c, true)}
        prev
        isInstitution={isInstitution}
        onAction={(type, id) =>
          setConfirm({ open: true, type, id })
        }
      />

    </div>

    {/* ===== ADD COURSE MODAL ===== */}
    <ConfirmModal
      open={showAdd}
      title="Add Course"
      onConfirm={addCourse}
      onClose={() => setShowAdd(false)}
    >
      <div className="space-y-3">

        <label className="text-sm text-[var(--muted)]">
          Select Course
        </label>

        <select
          className="w-full rounded-lg px-3 py-2
          bg-[var(--surface)]
          text-[var(--text)]
          border border-[var(--border)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

      </div>
    </ConfirmModal>

    {/* ===== CONFIRM MODAL ===== */}
    <ConfirmModal
      open={confirm.open}
      title={
        confirm.type === "toggleStatus"
          ? "Change Status"
          : confirm.type === "delete"
            ? "Remove Course"
            : confirm.type === "deletePrev"
              ? "Remove Previous Course"
              : confirm.type === "finish"
                ? "Finish Course"
                : "Confirm Action"
      }
      message={
        confirm.type === "toggleStatus"
          ? `Are you sure you want to ${
              student.isActive ? "deactivate" : "activate"
            } this student?`
          : confirm.type === "finish"
            ? "This will move course to previous courses"
            : "Are you sure you want to proceed?"
      }
      onConfirm={handleAction}
      onClose={() => setConfirm({ open: false })}
    />

    {/* ===== EDIT MODAL ===== */}
    <ConfirmModal
      open={editOpen}
      title="Edit Student"
      onConfirm={updateStudent}
      onClose={() => setEditOpen(false)}
    >
      <div className="flex flex-col gap-4">

        <div>
          <label className="text-sm text-[var(--muted)]">Full Name</label>
          <input
            value={editForm.name}
            onChange={(e) =>
              setEditForm({ ...editForm, name: e.target.value })
            }
            className="w-full mt-1 rounded-lg px-3 py-2
            bg-[var(--surface)]
            border border-[var(--border)]
            focus:ring-2 focus:ring-[var(--accent)] outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-[var(--muted)]">Phone</label>
          <input
            value={editForm.phone}
            onChange={(e) =>
              setEditForm({ ...editForm, phone: e.target.value })
            }
            className="w-full mt-1 rounded-lg px-3 py-2
            bg-[var(--surface)]
            border border-[var(--border)]
            focus:ring-2 focus:ring-[var(--accent)] outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-[var(--muted)]">Date of Birth</label>
          <input
            type="date"
            value={editForm.dob || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, dob: e.target.value })
            }
            className="w-full mt-1 rounded-lg px-3 py-2
            bg-[var(--surface)]
            border border-[var(--border)]
            focus:ring-2 focus:ring-[var(--accent)] outline-none"
          />
        </div>

      </div>
    </ConfirmModal>

  </div>
);
};

/* ================= COURSE SECTION ================= */
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
  prev = false,
  isInstitution,
  onAction,
}) => (
  <div className="mt-8">
    <h2 className="font-bold text-lg">{title}</h2>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {courses.map((c) => {
        const course = mapFn(c);
        const id = prev ? c.courseId?._id : c._id;

        return (
          <InstitutionCoursesCard
            key={`${id}-${course.semester || "curr"}`}
            course={course}
            showEdit={false}
            showToggleStatus={false}
            showDelete={isInstitution}
            onDelete={() =>
              onAction(prev ? "deletePrev" : "delete", id)
            }
            onFinish={() => onAction("finish", id)}
          />
        );
      })}
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-[var(--muted-text)]">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);

export default InstitutionStudentProfile;