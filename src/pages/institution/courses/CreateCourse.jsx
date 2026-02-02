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
  Plus,
  Cross,
  X,
} from "lucide-react";

const CreateCourse = () => {
  const navigate = useNavigate();

  const institutionId = useSelector((s) => s.auth.institution.data?._id);

  const [loading, setLoading] = useState(false);

  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    departmentId: "",
    name: "",
    code: "",
    credits: "",
    semester: "",
    evaluationScheme: "",
    components: [],
  });

  const [showValidity, setShowValidity] = useState(false);

  const [courseCodeStatus, setCourseCodeStatus] = useState({
    checking: false,
    exists: false,
    checked: false,
  });

  // ========= FETCH DEPARTMENTS =========
  const fetchDepartments = async () => {
    if (!institutionId) return;

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

  const lastCheckedRef = React.useRef({ code: null, departmentId: null });

  useEffect(() => {
    const code = form.code.trim();
    const dept = form.departmentId;

    if (!code || !dept) return;

    if (
      lastCheckedRef.current.code === code &&
      lastCheckedRef.current.departmentId === dept
    ) {
      return;
    }

    lastCheckedRef.current = { code, departmentId: dept };
    checkCourseCode();
  }, [form.code, form.departmentId]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((p) => ({
      ...p,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
    // reset code validity when inputs affecting uniqueness change
    if (name === "code" || name === "departmentId") {
      setCourseCodeStatus({
        checking: false,
        exists: false,
        checked: false,
      });
      setShowValidity(false);
    }
  };

  // ========= Check Code =========
  const checkCourseCode = async () => {
    const { code, departmentId } = form;
    const trimmed = code.trim();

    if (!trimmed || !departmentId) return;

    try {
      setCourseCodeStatus({ checking: true, exists: false, checked: false });

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/code-exists`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            departmentId,
            code: trimmed,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCourseCodeStatus({
        checking: false,
        exists: Boolean(data?.data?.exists),
        checked: true,
      });
      setShowValidity(true);
    } catch {
      setCourseCodeStatus({ checking: false, exists: false, checked: false });
    }
  };

  const addComponent = () => {
    setForm(p => ({
      ...p,
      components: [
        ...p.components,
        { name: "", type: "THEORY", maxMarks: "", weightage: "" }
      ]
    }));
  };

  const updateComponent = (index, key, value) => {
    setForm(p => ({
      ...p,
      components: p.components.map((c, i) =>
        i === index
          ? {
            ...c,
            [key]:
              key === "name"
                ? value.toUpperCase()
                : value
          }
          : c
      )
    }));
  };


  const removeComponent = (index) => {
    setForm(p => ({
      ...p,
      components: p.components.filter((_, i) => i !== index)
    }));
  };



  // ========= SUBMIT =========
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      departmentId,
      name,
      code,
      credits,
      semester,
      evaluationScheme,
      components,
    } = form;

    if (
      !departmentId ||
      !name.trim() ||
      !code.trim() ||
      credits === "" ||
      !semester.trim()
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!evaluationScheme) {
      toast.error("Select evaluation scheme");
      return;
    }

    const duplicate = components.some(
      (c, i) =>
        components.findIndex(
          x =>
            x.name.trim().toUpperCase() === c.name.trim().toUpperCase() &&
            x.type === c.type
        ) !== i
    );

    if (duplicate) {
      toast.error("Duplicate component name with same type not allowed");
      return;
    }


    const creditsNum = Number(credits);
    if (Number.isNaN(creditsNum) || creditsNum < 0) {
      toast.error("Credits must be a valid non-negative number");
      return;
    }

    // Optional but strongly recommended
    if (components.length === 0) {
      toast.error("Add at least one evaluation component");
      return;
    }

    const totalWeightage = components.reduce(
      (sum, c) => sum + Number(c.weightage || 0),
      0
    );

    if (totalWeightage !== 100) {
      toast.error("Total weightage must be exactly 100%");
      return;
    }

    for (const c of components) {
      if (!c.name.trim()) {
        toast.error("Component name is required");
        return;
      }

      if (!c.maxMarks || Number(c.maxMarks) <= 0) {
        toast.error(`Invalid max marks for ${c.name} (${c.type})`);
        return;
      }

      if (!c.weightage || Number(c.weightage) <= 0) {
        toast.error(`Invalid weightage for ${c.name} (${c.type})`);
        return;
      }
    }


    const payload = {
      departmentId,
      name: name.trim(),
      code: code.trim(),
      credits: creditsNum,
      semester: semester.trim(),
      evaluationScheme,
      components: components.map((c) => ({
        name: c.name.trim().toUpperCase(),
        type: c.type,
        maxMarks: Number(c.maxMarks),
        weightage: Number(c.weightage),
      })),
    };

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/create-course`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
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
              <div>
                <Input
                  label="Course Code"
                  icon={Hash}
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. CSE201"
                />

                {showValidity && (courseCodeStatus.checked || courseCodeStatus.checking) && (
                  <p
                    className={`text-xs mt-1 ${courseCodeStatus.exists ? "text-red-500" : "text-green-600"
                      }`}
                  >
                    {courseCodeStatus.checking
                      ? "Checking availability..."
                      : courseCodeStatus.exists
                        ? "Course code already exists"
                        : "Course code available"}
                  </p>
                )}
              </div>


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

            {/* Evaluation Scheme */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted-text)]">
                Evaluation Scheme
              </label>

              <select
                value={form.evaluationScheme}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    evaluationScheme: e.target.value,
                  }))
                }

                className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm outline-none
    focus:ring-2 focus:ring-indigo-500 bg-[var(--surface-2)] text-[var(--text)]"
              >
                <option value="">Select</option>
                <option value="MID_END">Mid Sem</option>
                <option value="CT_END">CT End</option>
              </select>

              <div className={`space-y-5 mt-4  ${!form.evaluationScheme ? "hidden" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Evaluation Components</p>

                  <button
                    type="button"
                    onClick={addComponent}
                    disabled={!form.evaluationScheme}
                    className={`text-sm text-indigo-400 flex items-center gap-1`}
                  >
                    <Plus size={14} />
                    Add Component
                  </button>
                </div>

                {form.components.length === 0 && (
                  <p className="text-xs text-[var(--muted-text)]">
                    No components added yet
                  </p>
                )}

                {form.components.map((c, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-3 border border-[var(--border)] rounded-xl p-3"
                  >
                    <input
                      placeholder="Name (CT1, CT2, MID, END)"
                      value={c.name}
                      onChange={(e) => updateComponent(idx, "name", e.target.value)}
                      className="col-span-2 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm"
                    />

                    <select
                      value={c.type}
                      onChange={(e) => updateComponent(idx, "type", e.target.value)}
                      className="rounded-lg bg-[var(--surface-2)] px-2 py-2 text-sm"
                    >
                      <option value="THEORY">Theory</option>
                      <option value="LAB">Lab</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Max"
                      value={c.maxMarks}
                      min={1}
                      max={100}
                      onChange={(e) => updateComponent(idx, "maxMarks", e.target.value)}
                      className="rounded-lg bg-[var(--surface-2)] px-2 py-2 text-sm"
                    />

                    <input
                      type="number"
                      placeholder="Weightage (%)"
                      value={c.weightage}
                      min={0}
                      max={100}
                      onChange={(e) => updateComponent(idx, "weightage", e.target.value)}
                      className="rounded-lg bg-[var(--surface-2)] px-2 py-2 text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => removeComponent(idx)}
                      className="flex items-center gap-1 text-red-500 text-sm hover:text-red-600"
                    >
                      <X size={12} />
                      <span>Remove</span>
                    </button>

                  </div>
                ))}
              </div>

            </div>

            <button
              disabled={loading || courseCodeStatus.exists || courseCodeStatus.checking}
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
