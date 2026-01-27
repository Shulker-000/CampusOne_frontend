// src/pages/institution/courses/EditCourse.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Hash,
  Layers,
  GraduationCap,
  Building2,
} from "lucide-react";
import Loader from "../../../components/Loader";

const EditCourse = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const institutionId = useSelector((s) => s.auth.institution.data?._id);
  const institutionToken = useSelector((s) => s.auth.institution.token);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [course, setCourse] = useState(null);

  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    departmentId: "",
    name: "",
    code: "",
    credits: "",
    semester: "",
  });

  // ========= FETCH COURSE =========
  const fetchCourse = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${courseId}`
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch course");

      const c = data.data;
      setCourse(c);

      setForm({
        departmentId: c?.departmentId?._id || c?.departmentId || "",
        name: c?.name || "",
        code: c?.code || "",
        credits: c?.credits ?? "",
        semester: c?.semester || "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  // ========= FETCH DEPARTMENTS =========
  const fetchDepartments = async () => {
    if (!institutionId) {
      setDepartmentsLoading(false);
      return;
    }

    if (!institutionToken) {
      setDepartmentsLoading(false);
      return;
    }

    try {
      setDepartmentsLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/departments/institution/${institutionId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch departments");

      setDepartments(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch departments");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) return;
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    fetchDepartments();
  }, [institutionId]);

  const departmentById = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d._id, d));
    return map;
  }, [departments]);

  const selectedDept = form.departmentId ? departmentById.get(form.departmentId) : null;

  // ========= INPUT HANDLERS =========
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ========= SAVE COURSE =========
  const handleSave = async () => {
    const { departmentId, name, code, credits, semester } = form;

    if (!departmentId || !name.trim() || !code.trim() || credits === "" || !semester.trim()) {
      toast.error("All fields are required");
      return;
    }

    const creditsNum = Number(credits);
    if (Number.isNaN(creditsNum) || creditsNum < 0) {
      toast.error("Credits must be a valid non-negative number");
      return;
    }

    if (!institutionToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            credentials: "include",
          },
          body: JSON.stringify({
            departmentId,
            name: name.trim(),
            code: code.trim(),
            credits: creditsNum,
            semester: semester.trim(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      toast.success("Course updated");
      setCourse((prev) => ({ ...prev, ...data.data }));
      navigate(-1);
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  if (!course) return null;

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

          <div className="flex items-center gap-2">
            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
              type="button"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <h1 className="text-xl font-bold text-[var(--text)]">Edit Course</h1>
          <p className="text-sm text-[var(--muted-text)] mt-1">
            Update course details.
          </p>

          {/* FORM */}
          <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-5xl">
            {/* Department */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
                Department
              </label>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  disabled={departmentsLoading}
                  className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none
                  focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-60"
                >
                  <option value="">
                    {departmentsLoading ? "Loading departments..." : "Select department"}
                  </option>

                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {selectedDept && (
                <p className="text-[11px] text-[var(--muted-text)]">
                  Selected:{" "}
                  <span className="font-semibold text-[var(--text)]">
                    {selectedDept.name}
                  </span>
                </p>
              )}
            </div>

            <Field
              label="Course Name"
              icon={BookOpen}
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <Field
              label="Course Code"
              icon={Hash}
              name="code"
              value={form.code}
              onChange={handleChange}
            />

            <Field
              label="Credits"
              icon={Layers}
              name="credits"
              value={form.credits}
              onChange={handleChange}
              inputMode="numeric"
            />

            <Field
              label="Semester"
              icon={GraduationCap}
              name="semester"
              value={form.semester}
              onChange={handleChange}
            />
          </div>

          {/* Small info block */}
          <div className="mt-8 max-w-5xl">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
              <p className="text-sm font-semibold text-[var(--text)]">Current Status</p>
              <p className="text-sm text-[var(--muted-text)] mt-1">
                This course is currently{" "}
                <span className="font-bold text-[var(--text)]">
                  {course.isOpen ? "Open" : "Closed"}
                </span>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Field = ({ label, icon: Icon, ...props }) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-[var(--muted-text)] uppercase tracking-wider">
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
        <input
          {...props}
          className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none
          focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted-text)]"
        />
      </div>
    </div>
  );
};

export default EditCourse;
