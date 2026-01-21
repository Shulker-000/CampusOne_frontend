import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  GraduationCap,
  CalendarDays,
  Layers,
  BookOpen,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  User2,
  Building2,
  Mail,
  Phone,
  Clock3,
} from "lucide-react";
import Loader from "./../../../components/Loader.jsx";

const EditFaculty = () => {
  const navigate = useNavigate();
  const { facultyId } = useParams();

  const institutionId = useSelector((s) => s.auth.institution.data?._id);
  const institutionToken = useSelector((s) => s.auth.institution.token);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [faculty, setFaculty] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  const [coursesList, setCoursesList] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [form, setForm] = useState({
    designation: "",
    dateOfJoining: "",
    departmentId: "",
    isActive: true,
    isInCharge: false,
    courses: [],
  });

  // ---------- Helpers ----------
  const authHeaders = useMemo(() => {
    const h = {};
    if (institutionToken) h.Authorization = `Bearer ${institutionToken}`;
    return h;
  }, [institutionToken]);

  const isoDateToInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseFacultyCourses = (arr) => {
    if (!Array.isArray(arr)) return [];

    return arr.map((c) => ({
      courseId: String(c?.courseId?._id || c?.courseId || ""),
      semester: c?.semester ?? "",
      batch: c?.batch ?? "",

      courseName: c?.courseId?.name || "",
      courseCode: c?.courseId?.code || "",
    }));
  };



  const isCourseRowValid = (c) => {
    if (!c) return false;
    if (!c.courseId) return false;
    if (c.semester === "" || c.semester === null || c.semester === undefined)
      return false;
    if (!c.batch?.trim()) return false;
    return true;
  };

  const hasDuplicateCourse = (courses) => {
    // Duplicate definition: same courseId + semester + batch
    const seen = new Set();
    for (const c of courses) {
      const key = `${c.courseId}|${c.semester}|${c.batch?.trim()}`;
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  };

  // ---------- Fetch Faculty ----------
  const fetchFaculty = async () => {
    if (!facultyId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}`,
        {
          headers: {
            ...authHeaders,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch faculty");

      const f = data?.data;
      setFaculty(f);

      setForm({
        designation: f?.designation || "",
        dateOfJoining: isoDateToInput(f?.dateOfJoining),
        departmentId: f?.departmentId?._id || f?.departmentId || "",
        isActive: typeof f?.isActive === "boolean" ? f.isActive : true,
        isInCharge:
          typeof f?.isInCharge === "boolean" ? f.isInCharge : false,
        courses: parseFacultyCourses(f?.courses),
      });
    } catch (err) {
      toast.error(err?.message || "Failed to load faculty");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Fetch Departments ----------
  const fetchDepartments = async () => {
    if (!institutionId) return;

    try {
      setDepartmentsLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
        {
          headers: { ...authHeaders },
        }
      );

      const data = await res.json();
      setDepartments(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      toast.error("Failed to fetch departments");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // ---------- Fetch Courses ----------
  // NOTE: I don't know your exact courses endpoint.
  // Replace this with your real one if needed.
  const fetchCourses = async () => {
    if (!institutionId) return;

    try {
      setCoursesLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/institution/${institutionId}`,
        {
          headers: { ...authHeaders },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setCoursesList([]);
        return;
      }

      setCoursesList(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setCoursesList([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    if (!facultyId) return;
    fetchFaculty();
    fetchDepartments();
    fetchCourses();
  }, [facultyId, institutionId]);

  const departmentById = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d._id, d));
    return map;
  }, [departments]);

  const courseById = useMemo(() => {
    const map = new Map();
    coursesList.forEach((c) => map.set(c._id, c));
    return map;
  }, [coursesList]);

  const currentDept = form.departmentId
    ? departmentById.get(form.departmentId)
    : null;

  // ---------- Form handlers ----------
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleToggle = (key) =>
    setForm((p) => ({ ...p, [key]: !p[key] }));

  const addCourseRow = () => {
    setForm((p) => ({
      ...p,
      courses: [
        ...p.courses,
        {
          courseId: "",
          semester: "",
          batch: "",
        },
      ],
    }));
  };

  const removeCourseRow = (index) => {
    setForm((p) => ({
      ...p,
      courses: p.courses.filter((_, i) => i !== index),
    }));
  };

  const updateCourseRow = (index, key, value) => {
    setForm((p) => {
      const next = [...p.courses];
      next[index] = { ...next[index], [key]: value };
      return { ...p, courses: next };
    });
  };

  // ---------- Save (multi-endpoint) ----------
  const handleSave = async () => {
    if (!institutionToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    // Basic validations
    if (!form.designation.trim()) {
      toast.error("Designation is required");
      return;
    }

    if (!form.dateOfJoining) {
      toast.error("Date of joining is required");
      return;
    }

    if (!form.departmentId) {
      toast.error("Department is required");
      return;
    }

    // Courses validation
    const courses = Array.isArray(form.courses) ? form.courses : [];

    for (let i = 0; i < courses.length; i++) {
      const c = courses[i];
      if (!isCourseRowValid(c)) {
        toast.error(`Course row ${i + 1} is incomplete`);
        return;
      }
    }

    if (hasDuplicateCourse(courses)) {
      toast.error("Duplicate course entries found (same course, semester, batch)");
      return;
    }

    const original = faculty;

    const originalDeptId =
      original?.departmentId?._id || original?.departmentId || "";
    const originalDesignation = original?.designation || "";
    const originalDOJ = isoDateToInput(original?.dateOfJoining);
    const originalIsActive =
      typeof original?.isActive === "boolean" ? original.isActive : true;
    const originalIsInCharge =
      typeof original?.isInCharge === "boolean" ? original.isInCharge : false;

    const originalCourses = parseFacultyCourses(original?.courses);

    const designationChanged = form.designation.trim() !== originalDesignation;
    const dojChanged = form.dateOfJoining !== originalDOJ;

    const deptChanged = form.departmentId !== originalDeptId;

    const isActiveChanged = form.isActive !== originalIsActive;
    const isInChargeChanged = form.isInCharge !== originalIsInCharge;

    const coursesChanged =
      JSON.stringify(
        courses.map((c) => ({
          courseId: c.courseId,
          semester: Number(c.semester),
          batch: c.batch.trim(),
        }))
      ) !==
      JSON.stringify(
        originalCourses.map((c) => ({
          courseId: c.courseId,
          semester: Number(c.semester),
          batch: (c.batch || "").trim(),
        }))
      );

    if (
      !designationChanged &&
      !dojChanged &&
      !deptChanged &&
      !coursesChanged &&
      !isActiveChanged &&
      !isInChargeChanged
    ) {
      toast.info("No changes to save");
      return;
    }

    try {
      setSaving(true);

      if (designationChanged || dojChanged) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/faculties/edit-faculty/${facultyId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify({
              designation: form.designation.trim(),
              dateOfJoining: form.dateOfJoining,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to update faculty details");
      }

      // 2) update department
      if (deptChanged) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/faculties/update-department/${facultyId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify({
              departmentId: form.departmentId,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to update department");
      }

      // 3) update active courses list
      if (coursesChanged) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/faculties/update-courses/${facultyId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify({
              courses: courses.map((c) => ({
                courseId: c.courseId,
                semester: Number(c.semester),
                batch: c.batch.trim(),
              })),
            }),
          }
        );

        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to update courses");
      }

      // 4) toggle active status
      if (isActiveChanged) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/faculties/change-status/${facultyId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify({
              isActive: form.isActive,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to update active status");
      }

      // 5) toggle in-charge
      if (isInChargeChanged) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/faculties/toggle-in-charge/${facultyId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify({
              isInCharge: form.isInCharge,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to update in-charge status");
      }

      toast.success("Faculty updated");
      navigate(-1);
    } catch (err) {
      toast.error(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!faculty) return null;

  const user = faculty?.userId || {};
  const inst = faculty?.institutionId || {};
  const userImage =
    user?.avatar || user?.profileImage || user?.image || user?.photo || "";

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-10 py-8">
      <div className="w-full">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] hover:opacity-80 transition"
            type="button"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
            type="button"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <h1 className="text-xl font-bold text-[var(--text)]">
            Edit Faculty
          </h1>
          <p className="text-sm text-[var(--muted-text)] mt-1">
            Update designation, joining date, department, courses and status.
          </p>

          {/* Info Cards */}
          <div className="mt-6 grid gap-4 max-w-5xl sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-center gap-2">
                <div className="text-[var(--muted-text)]">
                  <User2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text)]">Faculty</h3>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={user?.name || "Faculty"}
                    className="w-12 h-12 rounded-full object-cover border border-[var(--border)]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--muted-text)] text-xs">
                    N/A
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--muted-text)] font-bold">
                    Name
                  </p>
                  <p className="text-sm text-[var(--text)] truncate">
                    {user?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span className="mt-[2px] text-[var(--muted-text)]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--muted-text)] font-bold">
                      Email
                    </p>
                    <p className="text-sm text-[var(--text)] truncate">
                      {user?.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <span className="mt-[2px] text-[var(--muted-text)]">
                    <Phone className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--muted-text)] font-bold">
                      Phone
                    </p>
                    <p className="text-sm text-[var(--text)] truncate">
                      {user?.phone || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>


            <InfoCard
              title="Institution"
              icon={<Building2 className="w-4 h-4" />}
              rows={[
                { icon: <Building2 className="w-4 h-4" />, label: "Name", value: inst?.name || "-" },
                {
                  icon: <Layers className="w-4 h-4" />,
                  label: "Department",
                  value: faculty?.departmentId?.name || "-",
                },
              ]}
            />

            <InfoCard
              title="Timeline"
              icon={<Clock3 className="w-4 h-4" />}
              rows={[
                {
                  icon: <CalendarDays className="w-4 h-4" />,
                  label: "Joined",
                  value: isoDateToInput(faculty?.dateOfJoining) || "-",
                },
                {
                  icon: <Clock3 className="w-4 h-4" />,
                  label: "Created",
                  value: faculty?.createdAt
                    ? new Date(faculty.createdAt).toLocaleString()
                    : "-",
                },
                {
                  icon: <Clock3 className="w-4 h-4" />,
                  label: "Updated",
                  value: faculty?.updatedAt
                    ? new Date(faculty.updatedAt).toLocaleString()
                    : "-",
                },
              ]}
            />
          </div>

          {/* Form */}
          <div className="mt-8 grid gap-4 max-w-5xl">
            {/* Editable core fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldWithIcon
                label="Designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                icon={<GraduationCap className="w-4 h-4" />}
                placeholder="e.g. Assistant Professor"
              />

              <FieldWithIcon
                label="Date of Joining"
                name="dateOfJoining"
                value={form.dateOfJoining}
                onChange={handleChange}
                icon={<CalendarDays className="w-4 h-4" />}
                type="date"
              />
            </div>

            {/* Department Select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                Department
              </label>

              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  disabled={departmentsLoading}
                  className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                >
                  <option value="">
                    {departmentsLoading
                      ? "Loading departments..."
                      : "Select department"}
                  </option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentDept && (
                <p className="text-[11px] text-[var(--muted-text)]">
                  Selected department:{" "}
                  <span className="font-semibold text-[var(--text)]">
                    {currentDept.name}
                  </span>
                </p>
              )}
            </div>

            {/* Toggles */}
            <div className="grid sm:grid-cols-2 gap-4">
              <ToggleCard
                title="Active Status"
                subtitle={form.isActive ? "Faculty is active" : "Faculty is inactive"}
                value={form.isActive}
                onToggle={() => handleToggle("isActive")}
              />

              <ToggleCard
                title="In-Charge"
                subtitle={form.isInCharge ? "Marked as in-charge" : "Not in-charge"}
                value={form.isInCharge}
                onToggle={() => handleToggle("isInCharge")}
              />
            </div>

            {/* Active Courses */}
            <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Active Courses
                  </h2>
                  <p className="text-xs text-[var(--muted-text)] mt-1">
                    Add/update the faculty’s currently assigned courses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addCourseRow}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition"
                >
                  <Plus size={16} />
                  Add Course
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {form.courses.length === 0 ? (
                  <div className="text-sm text-[var(--muted-text)]">
                    No active courses added.
                  </div>
                ) : (
                  form.courses.map((c, idx) => {
                    const courseMeta = c.courseId
                      ? courseById.get(c.courseId)
                      : null;

                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                              Course #{idx + 1}
                            </p>
                            {(c.courseName || c.courseCode) && (
                              <p className="text-[11px] text-[var(--muted-text)] mt-1">
                                Current:{" "}
                                <span className="font-semibold text-[var(--text)]">
                                  {c.courseName} {c.courseCode ? `(${c.courseCode})` : ""}
                                </span>
                              </p>
                            )}


                            {courseMeta && (
                              <p className="text-[11px] text-[var(--muted-text)] mt-1">
                                Selected:{" "}
                                <span className="font-semibold text-[var(--text)]">
                                  {courseMeta.name} ({courseMeta.code})
                                </span>
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeCourseRow(idx)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text)] text-sm font-semibold hover:opacity-80 transition"
                            title="Remove course"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {/* Course dropdown */}
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                              Course
                            </label>

                            <div className="relative">
                              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                              <select
                                value={c.courseId}
                                onChange={(e) =>
                                  updateCourseRow(idx, "courseId", e.target.value)
                                }
                                disabled={coursesLoading}
                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                              >
                                <option value="">
                                  {coursesLoading
                                    ? "Loading courses..."
                                    : "Select course"}
                                </option>
                                {coursesList.map((course) => (
                                  <option key={course._id} value={course._id}>
                                    {course.name} ({course.code})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Semester */}
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                              Semester
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={12}
                              value={c.semester}
                              onChange={(e) =>
                                updateCourseRow(
                                  idx,
                                  "semester",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted-text)]"
                              placeholder="e.g. 5"
                            />
                          </div>

                          {/* Batch */}
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                              Batch
                            </label>
                            <input
                              value={c.batch}
                              onChange={(e) =>
                                updateCourseRow(idx, "batch", e.target.value)
                              }
                              className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted-text)]"
                              placeholder="e.g. CSE2024"
                            />
                          </div>
                        </div>

                        {!isCourseRowValid(c) && (
                          <p className="mt-3 text-[11px] text-red-400">
                            Fill course, semester and batch for this row.
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom save */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                type="button"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const FieldWithIcon = ({ label, icon, ...props }) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]">
          {icon}
        </div>
        <input
          {...props}
          className="w-full rounded-xl border border-[var(--border)] pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted-text)]"
        />
      </div>
    </div>
  );
};

const InfoCard = ({ title, icon, rows = [] }) => {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center gap-2">
        <div className="text-[var(--muted-text)]">{icon}</div>
        <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
      </div>

      <div className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-[2px] text-[var(--muted-text)]">{r.icon}</span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-[var(--muted-text)] font-bold">
                {r.label}
              </p>
              <p className="text-sm text-[var(--text)] truncate">
                {r.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ToggleCard = ({ title, subtitle, value, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full text-left rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 hover:opacity-90 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--text)]">{title}</p>
          <p className="text-xs text-[var(--muted-text)] mt-1">{subtitle}</p>
        </div>

        <div className="shrink-0">
          {value ? (
            <ToggleRight className="w-7 h-7 text-[var(--accent)]" />
          ) : (
            <ToggleLeft className="w-7 h-7 text-[var(--muted-text)]" />
          )}
        </div>
      </div>
    </button>
  );
};

export default EditFaculty;
