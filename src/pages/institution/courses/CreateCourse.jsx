// src/pages/institution/courses/CreateCourse.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BookOpen,
  Hash,
  Layers,
  GraduationCap,
  Building2,
  Loader2,
} from "lucide-react";

const CreateCourse = () => {
  const navigate = useNavigate();

  const institutionId = useSelector((s) => s.auth.institution.data?._id);
  const institutionToken = useSelector((s) => s.auth.institution.token);

  const [loading, setLoading] = useState(false);

  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    departmentId: "",
    name: "",
    code: "",
    credits: "",
    semester: "",
  });

  // ========= FETCH DEPARTMENTS =========
  const fetchDepartments = async () => {
    if (!institutionId) return;

    if (!institutionToken) {
      setDepartmentsLoading(false);
      toast.error("Session expired. Please login again.");
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
    fetchDepartments();
  }, [institutionId]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ========= SUBMIT =========
  const handleSubmit = async (e) => {
    e.preventDefault();

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
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/create-course`,
        {
          method: "POST",
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
      if (!res.ok) throw new Error(data.message || "Create failed");

      toast.success("Course created successfully");
      navigate("/institution/courses", { replace: true });
    } catch (err) {
      toast.error(err.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-10 py-8">
      <div className="w-full">
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate("/institution/courses")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] hover:opacity-80 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* CONTENT */}
        <div className="w-full">
          <h1 className="text-2xl font-bold text-[var(--text)]">Create Course</h1>
          <p className="text-sm text-[var(--muted-text)] mt-1">
            Add a new course under a specific department.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-3xl">
            {/* Department dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted-text)]">
                Department
              </label>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />

                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  disabled={departmentsLoading}
                  className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none
                  focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)]
                  disabled:opacity-60"
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

              <p className="text-[11px] text-[var(--muted-text)]">
                Course will be attached to this department.
              </p>
            </div>

            <Input
              label="Course Name"
              icon={BookOpen}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Data Structures"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Course Code"
                icon={Hash}
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. CSE201"
              />

              <Input
                label="Credits"
                icon={Layers}
                name="credits"
                value={form.credits}
                onChange={handleChange}
                placeholder="e.g. 4"
                inputMode="numeric"
              />
            </div>

            <Input
              label="Semester"
              icon={GraduationCap}
              name="semester"
              value={form.semester}
              onChange={handleChange}
              placeholder="e.g. 3"
            />

            <button
              disabled={loading}
              className="w-full sm:w-1/2 md:w-1/3 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              type="submit"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-[var(--muted-text)]">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
      <input
        {...props}
        className="w-full rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 text-sm outline-none
        focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)]
        placeholder:text-[var(--muted-text)]"
      />
    </div>
  </div>
);

export default CreateCourse;
