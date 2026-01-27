// src/pages/institution/faculty/EditFaculty.jsx
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
  User2,
  Building2,
  Mail,
  Phone,
  Clock3,
  CheckCircle2,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import Loader from "./../../../components/Loader.jsx";
import ConfirmModal from "../../../components/ConfirmModal.jsx";

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

  const [branchesList, setBranchesList] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const [finishLoadingMap, setFinishLoadingMap] = useState({});

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: "", // "remove" | "finish" | "incharge"
    index: null,
    title: "",
    message: "",
    confirmText: "",
    variant: "danger",
    payload: null,
  });

  const [form, setForm] = useState({
    designation: "",
    dateOfJoining: "",
    departmentId: "",
    isInCharge: false,
    courses: [],
  });

  const isoDateToInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // batch format: BRANCHCODE-YYYY
  const splitBatch = (batch) => {
    const str = String(batch || "").trim();
    if (!str) return { branchCode: "", year: "" };

    const match = str.match(/^(.+)-(\d{4})$/);
    if (!match) return { branchCode: "", year: "" };

    return { branchCode: match[1].trim(), year: match[2] };
  };


  const findBranchIdFromCode = (code, branches) => {
    const clean = String(code || "").trim().toLowerCase();
    if (!clean) return "";

    const match = (Array.isArray(branches) ? branches : []).find(
      (b) => String(b?.code || "").trim().toLowerCase() === clean
    );

    return match?._id || "";
  };

  const parseFacultyCourses = (arr) => {
    if (!Array.isArray(arr)) return [];

    return arr.map((c) => {
      const batch = String(c?.batch || "").trim();
      const { branchCode, year } = splitBatch(batch);

      return {
        courseId: String(c?.courseId?._id || c?.courseId || ""),
        semester: c?.semester ?? "",

        branchId: "",
        branchCode: branchCode || "",
        yearOfAdmission: year || "",
        batch,

        courseName: c?.courseId?.name || "",
        courseCode: c?.courseId?.code || "",

        isExisting: true,
      };
    });
  };

  const isCourseRowValid = (c) => {
    if (!c) return false;
    if (!c.courseId) return false;

    if (c.semester === "" || c.semester === null || c.semester === undefined)
      return false;

    if (!String(c.batch || "").trim()) return false;

    // existing rows: batch must exist, branch/year not required
    if (c.isExisting) return true;

    // new row requires branch/year
    const code = String(c.branchCode || "").trim();
    const year = String(c.yearOfAdmission || "").trim();

    if (!code) return false;
    if (!year) return false;
    if (!/^\d{4}$/.test(year)) return false;

    return true;
  };

  const hasDuplicateCourse = (courses) => {
    const seen = new Set();
    for (const c of courses) {
      const key = `${c.courseId}|${Number(c.semester)}|${String(
        c.batch || ""
      ).trim()}`;
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  };

  const fetchFaculty = async () => {
    if (!facultyId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}`,
        {
          headers: {
            credentials: "include",
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
        isInCharge: typeof f?.isInCharge === "boolean" ? f.isInCharge : false,
        courses: parseFacultyCourses(f?.courses),
      });
    } catch (err) {
      toast.error(err?.message || "Failed to load faculty");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    if (!institutionId) return;

    try {
      setDepartmentsLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
        {
          headers: {
            credentials: "include",
          },
        }
      );

      const data = await res.json();
      setDepartments(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("Failed to fetch departments");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!institutionId) return;

    try {
      setCoursesLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/institution/${institutionId}`,
        {
          headers: {
            credentials: "include",
          },
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

  const fetchBranches = async () => {
    if (!institutionId) return;

    try {
      setBranchesLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${institutionId}/branches`,
        {
          headers: {
           credentials: "include",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch branches");

      setBranchesList(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      toast.error(err?.message || "Failed to fetch branches");
      setBranchesList([]);
    } finally {
      setBranchesLoading(false);
    }
  };

  useEffect(() => {
    if (!facultyId) return;
    fetchFaculty();
    fetchDepartments();
    fetchCourses();
    fetchBranches();
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

  const branchById = useMemo(() => {
    const map = new Map();
    branchesList.forEach((b) => map.set(b._id, b));
    return map;
  }, [branchesList]);

  const activeCoursesList = useMemo(() => {
    return (Array.isArray(coursesList) ? coursesList : []).filter(
      (c) => c?.isOpen === true
    );
  }, [coursesList]);

  const currentDept = form.departmentId
    ? departmentById.get(form.departmentId)
    : null;

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addCourseRow = () => {
    if (faculty?.isActive === false) return;

    setForm((p) => ({
      ...p,
      courses: [
        ...p.courses,
        {
          courseId: "",
          semester: "",
          branchId: "",
          branchCode: "",
          yearOfAdmission: "",
          batch: "",
          courseName: "",
          courseCode: "",
          isExisting: false,
        },
      ],
    }));
  };

  const removeCourseRow = (index) => {
    if (faculty?.isActive === false) return;

    setForm((p) => ({
      ...p,
      courses: p.courses.filter((_, i) => i !== index),
    }));
  };

  const updateCourseRow = (index, key, value) => {
    if (faculty?.isActive === false) return;

    if (key === "courseId" && value) {
      const meta = courseById.get(value);
      if (meta && meta.isOpen === false) {
        toast.error("This course is inactive. You cannot assign it.");
        return;
      }
    }

    setForm((p) => {
      const next = [...p.courses];
      const prevRow = next[index];
      const row = { ...prevRow, [key]: value };

      // only new rows can change branch/year and auto-generate batch now
      if (!row.isExisting) {
        if (key === "branchId") {
          const branch = value ? branchById.get(value) : null;
          row.branchCode = String(branch?.code || "").trim();
        }

        if (key === "branchCode") {
          row.branchCode = String(value || "").trim();
          row.branchId = findBranchIdFromCode(row.branchCode, branchesList);
        }

        const code = String(row.branchCode || "").trim();
        const year = String(row.yearOfAdmission || "").trim();
        row.batch = code && year ? `${code}-${year}` : "";
      }

      next[index] = row;
      return { ...p, courses: next };
    });
  };

  const resetConfirmState = () => {
    setConfirmState({
      open: false,
      type: "",
      index: null,
      title: "",
      message: "",
      confirmText: "",
      variant: "danger",
      payload: null,
    });
  };

  const askRemoveCourse = (row, index) => {
    if (faculty?.isActive === false) return;

    const name =
      row?.courseName ||
      (row?.courseCode ? `(${row.courseCode})` : "") ||
      "this course";

    setConfirmState({
      open: true,
      type: "remove",
      index,
      title: "Remove Course?",
      message:
        `This will remove "${name}" from the list. ` +
        `It will be removed from DB only after you click "Save Changes".`,
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      variant: "danger",
      payload: row,
    });
  };

  const askFinishCourse = (row, index) => {
    if (faculty?.isActive === false) return;

    const name =
      row?.courseName ||
      (row?.courseCode ? `(${row.courseCode})` : "") ||
      "this course";

    const sem = row?.semester ?? "-";
    const batch = String(row?.batch || "").trim() || "-";

    setConfirmState({
      open: true,
      type: "finish",
      index,
      title: "Finish Course?",
      message: `This will move "${name}" (Sem ${sem}, Batch ${batch}) to previous courses.`,
      confirmText: "Yes, Finish",
      cancelText: "Cancel",
      variant: "danger",
      payload: row,
    });
  };

  const askToggleInCharge = () => {
    if (faculty?.isActive === false) return;

    setConfirmState({
      open: true,
      type: "incharge",
      index: null,
      title: form.isInCharge ? "Remove In-Charge?" : "Mark as In-Charge?",
      message: form.isInCharge
        ? "This will remove the In-Charge status from this faculty. Continue?"
        : "This will mark this faculty as In-Charge. Continue?",
      confirmText: form.isInCharge ? "Yes, Remove" : "Yes, Mark",
      cancelText: "Cancel",
      variant: "danger",
      payload: null,
    });
  };

  const confirmToggleInCharge = () => {
    setForm((p) => ({ ...p, isInCharge: !p.isInCharge }));
  };

  const handleToggleInChargeClick = () => {
    askToggleInCharge();
  };

  const handleConfirmAction = async () => {
    if (!confirmState.open) return;

    if (faculty?.isActive === false) {
      resetConfirmState();
      return;
    }

    if (confirmState.type === "remove") {
      removeCourseRow(confirmState.index);
      resetConfirmState();
      return;
    }

    if (confirmState.type === "finish") {
      await finishCourseRow(confirmState.payload, confirmState.index);
      resetConfirmState();
      return;
    }

    if (confirmState.type === "incharge") {
      confirmToggleInCharge();
      resetConfirmState();
      return;
    }
  };

  const finishCourseRow = async (courseRow, index) => {
    if (faculty?.isActive === false) return;

    if (!institutionToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (!courseRow?.isExisting) {
      toast.error("You can only finish an already assigned course.");
      return;
    }

    const courseId = courseRow?.courseId;
    if (!courseId) {
      toast.error("Invalid course row");
      return;
    }

    try {
      setFinishLoadingMap((p) => ({ ...p, [index]: true }));

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/courses/${courseId}/finish`,
        {
          method: "PUT",
          headers: {
            credentials: "include",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to finish course");

      toast.success("Course finished");
      removeCourseRow(index);
    } catch (err) {
      toast.error(err?.message || "Failed to finish course");
    } finally {
      setFinishLoadingMap((p) => ({ ...p, [index]: false }));
    }
  };

  const handleSave = async () => {
    if (faculty?.isActive === false) return;

    if (!institutionToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

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

    const inactiveSelected = courses.find((c) => {
      const meta = courseById.get(c.courseId);
      return meta && meta.isOpen === false;
    });

    if (inactiveSelected) {
      const meta = courseById.get(inactiveSelected.courseId);
      toast.error(`"${meta?.name || "Selected course"}" is inactive. Remove it first.`);
      return;
    }

    const original = faculty;

    const originalDeptId =
      original?.departmentId?._id || original?.departmentId || "";
    const originalDesignation = original?.designation || "";
    const originalDOJ = isoDateToInput(original?.dateOfJoining);
    const originalIsInCharge =
      typeof original?.isInCharge === "boolean" ? original.isInCharge : false;

    const originalCourses = parseFacultyCourses(original?.courses);

    const designationChanged = form.designation.trim() !== originalDesignation;
    const dojChanged = form.dateOfJoining !== originalDOJ;
    const deptChanged = form.departmentId !== originalDeptId;
    const isInChargeChanged = form.isInCharge !== originalIsInCharge;

    const coursesChanged =
      JSON.stringify(
        courses.map((c) => ({
          courseId: String(c.courseId),
          semester: Number(c.semester),
          batch: String(c.batch || "").trim(),
        }))
      ) !==
      JSON.stringify(
        originalCourses.map((c) => ({
          courseId: String(c.courseId),
          semester: Number(c.semester),
          batch: String(c.batch || "").trim(),
        }))
      );

    if (
      !designationChanged &&
      !dojChanged &&
      !deptChanged &&
      !coursesChanged &&
      !isInChargeChanged
    ) {
      toast.info("No changes to save");
      return;
    }

    try {
      setSaving(true);

      if (designationChanged || dojChanged) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/faculties/self/${facultyId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              credentials: "include",
            },
            body: JSON.stringify({
              designation: form.designation.trim(),
              dateOfJoining: form.dateOfJoining,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to update faculty details");
        }
      }

      if (deptChanged) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/department/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              credentials: "include",
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

      if (coursesChanged) {
        const normalizedNow = courses.map((c) => ({
          courseId: String(c.courseId),
          semester: Number(c.semester),
          batch: String(c.batch || "").trim(),
        }));

        const normalizedOriginal = originalCourses.map((c) => ({
          courseId: String(c.courseId),
          semester: Number(c.semester),
          batch: String(c.batch || "").trim(),
        }));

        const makeKey = (x) => `${x.courseId}|${x.semester}|${x.batch}`;

        const nowSet = new Set(normalizedNow.map(makeKey));
        const originalSet = new Set(normalizedOriginal.map(makeKey));

        const toAdd = normalizedNow.filter((x) => !originalSet.has(makeKey(x)));
        const toRemove = normalizedOriginal.filter((x) => !nowSet.has(makeKey(x)));

        // remove deleted
        for (const r of toRemove) {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/courses/${r.courseId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                credentials: "include",
              },
              body: JSON.stringify({
                semester: Number(r.semester),
                batch: String(r.batch || "").trim(),
              }),
            }
          );

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.message || "Failed to remove course");
          }
        }

        // add new ones
        for (const a of toAdd) {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/courses`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                credentials: "include",
              },
              body: JSON.stringify({
                course: {
                  courseId: String(a.courseId),
                  semester: Number(a.semester),
                  batch: String(a.batch || "").trim(),
                },
              }),
            }
          );

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.message || "Failed to add course");
          }
        }
      }

      if (isInChargeChanged) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/faculties/${facultyId}/in-charge`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              credentials: "include",
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

  const isFacultyBlocked = faculty?.isActive === false;

  const user = faculty?.userId || {};
  const inst = faculty?.institutionId || {};
  const userImage =
    user?.avatar || user?.profileImage || user?.image || user?.photo || "";

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-10 py-8">
      <div className="w-full">
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
            disabled={saving || isFacultyBlocked}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
            type="button"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>

        {/* ✅ Inactive Faculty Banner (theme dependent) */}
        {isFacultyBlocked && (
          <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex items-start gap-3">

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-[var(--text)]">
                    Faculty is disabled
                  </p>

                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 text-[10px] font-bold text-[var(--muted-text)]">
                    LOCKED
                  </span>
                </div>

                <p className="text-xs text-[var(--muted-text)] mt-1 leading-relaxed">
                  This faculty is currently inactive, so editing is blocked. You can still
                  view details.
                </p>
              </div>
            </div>
          </div>
        )}


        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <h1 className="text-xl font-bold text-[var(--text)]">Edit Faculty</h1>
          <p className="text-sm text-[var(--muted-text)] mt-1">
            Update designation, joining date, department, courses and status.
          </p>

          <div className="mt-6 grid gap-4 max-w-5xl sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-center gap-2">
                <div className="text-[var(--muted-text)]">
                  <User2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                  Faculty
                  {isFacultyBlocked && (
                    <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-300">
                      DISABLED
                    </span>
                  )}
                </h3>
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
                  <p className="text-sm text-[var(--text)] truncate">{user?.name || "-"}</p>
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
                    <p className="text-sm text-[var(--text)] truncate">{user?.email || "-"}</p>
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
                    <p className="text-sm text-[var(--text)] truncate">{user?.phone || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <InfoCard
              title="Institution"
              icon={<Building2 className="w-4 h-4" />}
              rows={[
                {
                  icon: <Building2 className="w-4 h-4" />,
                  label: "Name",
                  value: inst?.name || "-",
                },
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

          <div className="mt-8 grid gap-4 max-w-5xl">
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldWithIcon
                label="Designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                icon={<GraduationCap className="w-4 h-4" />}
                placeholder="e.g. Assistant Professor"
                disabled={isFacultyBlocked}
              />

              <FieldWithIcon
                label="Date of Joining"
                name="dateOfJoining"
                value={form.dateOfJoining}
                onChange={handleChange}
                icon={<CalendarDays className="w-4 h-4" />}
                type="date"
                inputClassName="date-dark-fix"
                disabled={isFacultyBlocked}
              />
            </div>

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
                  disabled={departmentsLoading || isFacultyBlocked}
                  className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                >
                  <option value="">
                    {departmentsLoading ? "Loading departments..." : "Select department"}
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

            <div className="grid sm:grid-cols-2 gap-4">
              <ToggleCard
                title="In-Charge"
                subtitle={form.isInCharge ? "Marked as in-charge" : "Not in-charge"}
                value={form.isInCharge}
                onToggle={() => !isFacultyBlocked && handleToggleInChargeClick()}
              />
            </div>

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
                  onClick={() => !isFacultyBlocked && addCourseRow()}
                  disabled={isFacultyBlocked}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
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
                    const courseMeta = c.courseId ? courseById.get(c.courseId) : null;
                    const finishLoading = !!finishLoadingMap[idx];

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

                            {String(c.batch || "").trim() && (
                              <>
                                <p className="text-[11px] text-[var(--muted-text)] mt-1">
                                  Batch:{" "}
                                  <span className="font-semibold text-[var(--text)]">
                                    {c.batch}
                                  </span>
                                </p>

                                <p className="text-[11px] text-[var(--muted-text)] mt-1">
                                  Derived:{" "}
                                  <span className="font-semibold text-[var(--text)]">
                                    {c.branchCode || "?"} - {c.yearOfAdmission || "?"}
                                  </span>
                                </p>
                              </>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 items-end self-start">
                            <button
                              type="button"
                              disabled={isFacultyBlocked}
                              onClick={() => !isFacultyBlocked && askRemoveCourse(c, idx)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text)] text-sm font-semibold hover:opacity-80 transition disabled:opacity-60"
                              title="Remove course"
                            >
                              <Trash2 size={16} />
                              Remove
                            </button>

                            <button
                              type="button"
                              disabled={isFacultyBlocked || finishLoading || !c.isExisting}
                              onClick={() => !isFacultyBlocked && askFinishCourse(c, idx)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                              title="Finish course"
                            >
                              {finishLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                              Finish
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                              Course
                            </label>

                            <div className="relative">
                              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                              <select
                                value={c.courseId}
                                onChange={(e) =>
                                  !isFacultyBlocked &&
                                  updateCourseRow(idx, "courseId", e.target.value)
                                }
                                disabled={coursesLoading || isFacultyBlocked}
                                className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                              >
                                <option value="">
                                  {coursesLoading ? "Loading courses..." : "Select course"}
                                </option>
                                {activeCoursesList.map((course) => (
                                  <option key={course._id} value={course._id}>
                                    {course.name} ({course.code})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                              Semester
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={12}
                              value={c.semester}
                              disabled={isFacultyBlocked}
                              onChange={(e) =>
                                !isFacultyBlocked &&
                                updateCourseRow(idx, "semester", e.target.value)
                              }
                              className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted-text)]"
                              placeholder="e.g. 5"
                            />
                          </div>

                          {!c.isExisting && (
                            <>
                              <div className="space-y-1 sm:col-span-1">
                                <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                                  Branch
                                </label>

                                <div className="relative">
                                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                                  <select
                                    value={c.branchId}
                                    onChange={(e) =>
                                      !isFacultyBlocked &&
                                      updateCourseRow(idx, "branchId", e.target.value)
                                    }
                                    disabled={branchesLoading || isFacultyBlocked}
                                    className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                                  >
                                    <option value="">
                                      {branchesLoading
                                        ? "Loading branches..."
                                        : "Select branch"}
                                    </option>

                                    {branchesList.map((b) => (
                                      <option key={b._id} value={b._id}>
                                        {b.name} ({b.code})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {c.branchCode && (
                                  <p className="text-[11px] text-[var(--muted-text)]">
                                    Code:{" "}
                                    <span className="font-semibold text-[var(--text)]">
                                      {c.branchCode}
                                    </span>
                                  </p>
                                )}
                              </div>

                              <div className="space-y-1 sm:col-span-1">
                                <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                                  Year of Admission
                                </label>
                                <input
                                  type="number"
                                  min={2000}
                                  max={2100}
                                  value={c.yearOfAdmission}
                                  disabled={isFacultyBlocked}
                                  onChange={(e) =>
                                    !isFacultyBlocked &&
                                    updateCourseRow(idx, "yearOfAdmission", e.target.value)
                                  }
                                  className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted-text)]"
                                  placeholder="e.g. 2021"
                                />
                              </div>

                              <div className="space-y-1 sm:col-span-1">
                                <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                                  Batch (Auto)
                                </label>
                                <input
                                  value={c.batch}
                                  readOnly
                                  className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-sm bg-[var(--surface-2)] text-[var(--text)] opacity-80 cursor-not-allowed"
                                  placeholder="Auto generated"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {!isCourseRowValid(c) && (
                          <p className="mt-3 text-[11px] text-red-400">
                            {c.isExisting
                              ? "This course row is missing batch."
                              : "Fill course, semester, and valid branch/year for this row."}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving || isFacultyBlocked}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                type="button"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText="Cancel"
        variant={confirmState.variant}
        loading={
          confirmState.type === "finish" &&
          confirmState.index !== null &&
          !!finishLoadingMap[confirmState.index]
        }
        onClose={() => {
          const finishing =
            confirmState.type === "finish" &&
            confirmState.index !== null &&
            !!finishLoadingMap[confirmState.index];

          if (finishing) return;
          resetConfirmState();
        }}
        onConfirm={handleConfirmAction}
      />

      <style>{`
        input[type="date"].date-dark-fix {
          color-scheme: dark;
        }
      `}</style>
    </div>
  );
};

const FieldWithIcon = ({ label, icon, inputClassName = "", ...props }) => {
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
          className={`w-full rounded-xl border border-[var(--border)] pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted-text)] ${inputClassName}`}
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
              <p className="text-sm text-[var(--text)] truncate">{r.value}</p>
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
