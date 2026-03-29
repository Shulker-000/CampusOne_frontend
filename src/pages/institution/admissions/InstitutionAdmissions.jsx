import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Search, Users } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";

const InstitutionAdmissions = () => {
  const institutionId = useSelector((s) => s.auth.institution.data?._id);

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [branches, setBranches] = useState([]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");

  const [isAccepting, setIsAccepting] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  /* ================= FETCH ================= */

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        institutionId,
        page: 1,
        limit: 50,
      });

      if (statusFilter !== "ALL") {
        params.append("formStatus", statusFilter);
      }

      const [appRes, branchRes] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/admissions/filters?${params}`,
          { credentials: "include" }
        ),
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/branches/institutions/${institutionId}`,
          { credentials: "include" }
        ),
      ]);

      const appData = await appRes.json();
      const branchData = await branchRes.json();

      if (!appRes.ok) throw new Error(appData.message);
      if (!branchRes.ok) throw new Error(branchData.message);

      const cleaned = appData.data.applications.filter(
        (app) =>
          app.formStatus !== "DRAFT" &&
          app.formStatus !== "UNDER_AI_REVIEW"
      );

      setApplications(cleaned);
      setBranches(branchData.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutionStatus = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/institutions/${institutionId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setIsAccepting(data.data.isAcceptingApplication);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (institutionId) {
      fetchApplications();
      fetchInstitutionStatus();
    }
  }, [institutionId, statusFilter]);


  const handleToggleApplication = async () => {
    try {
      setToggleLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/institutions/toggle-application-status`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setIsAccepting(data.data.isAcceptingApplication);

      setShowToggleModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggleLoading(false);
    }
  };
  /* ================= MAP ================= */

  const branchById = useMemo(() => {
    const map = new Map();
    branches.forEach((b) => map.set(String(b._id), b));
    return map;
  }, [branches]);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return applications
      .filter((app) => {
        const q = query.toLowerCase();

        const matchQuery =
          app.fullName.toLowerCase().includes(q) ||
          app.applicationNumber.toLowerCase().includes(q);

        const matchBranch =
          branchFilter === "ALL" || app.branchId === branchFilter;

        return matchQuery && matchBranch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 🔥 latest first
  }, [applications, query, branchFilter]);

  const openApplication = (id) => {
    window.open(
      `${window.location.origin}/institution/applications/${id}`,
      "_blank"
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-6xl mx-auto px-5 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admissions</h1>

          <div className="flex items-center gap-4">

            {/* TOGGLE */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">

              {/* Label */}
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">New Applications</span>
                <span className="text-xs text-[var(--muted-text)]">
                  Allow students to apply
                </span>
              </div>

              {/* Toggle */}
              <button
                onClick={() => setShowToggleModal(true)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer
                            ${isAccepting ? "bg-green-500" : "bg-red-500"}
                          `}
              >
                <span
                  className={`absolute inset-y-[2px] w-[20px] bg-white rounded-full shadow-sm transition-all duration-300
                              ${isAccepting ? "right-[3px] h-4/5" : "left-[2px] h-4/5 top-[0.99px]"}
                            `}
                />
              </button>

            </div>

            {/* COUNT */}
            <div className="flex items-center gap-2 border px-4 py-2 rounded-xl bg-[var(--surface-2)]">
              <Users size={16} />
              <span className="text-sm font-semibold">
                {filtered.length} Applications
              </span>
            </div>

          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch">

          {/* SEARCH */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name/app no..."
              className="pl-10 pr-4 py-2.5 w-full rounded-xl border bg-[var(--surface)]"
            />
          </div>

          {/* STATUS */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 bg-[var(--surface-2)] w-[200px] flex-shrink-0"
          >
            <option value="ALL">All</option>
            <option value="AI_APPROVED">AI Approved</option>
            <option value="AI_REJECTED">AI Rejected</option>
            <option value="MANUAL_REVIEW">Manual Review</option>
            <option value="FINAL_APPROVED">Final Approved</option>
            <option value="FINAL_REJECTED">Final Rejected</option>
          </select>

          {/* BRANCH */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 bg-[var(--surface-2)] w-[200px] flex-shrink-0"
          >
            <option value="ALL">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-text)] text-sm">
            No applications found
          </div>
        )}

        {/* TABLE */}
        {filtered.length > 0 && (
          <div className="bg-[var(--surface)] border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)] text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Application No.</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((app) => {
                  const branchName =
                    branchById.get(String(app.branchId))?.name || "N/A";

                  return (
                    <tr
                      key={app._id}
                      onClick={() => openApplication(app._id)}
                      className="border-t hover:bg-[var(--surface-2)] transition cursor-pointer"
                    >
                      <td className="p-3 font-medium text-[var(--text)]">
                        {app.fullName}
                      </td>

                      <td className="p-3 text-[var(--muted-text)]">
                        {app.applicationNumber}
                      </td>

                      <td className="p-3 text-[var(--muted-text)]">
                        {branchName}
                      </td>

                      <td className="p-3">
                        <span className="text-xs font-medium text-[var(--muted-text)]">
                          {app.formStatus}
                        </span>
                      </td>

                      <td className="p-3 text-xs text-[var(--muted-text)]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <ConfirmModal
        open={showToggleModal}
        title="Change Application Status"
        message={`Are you sure you want to ${isAccepting ? "stop" : "start"
          } accepting applications?`}
        confirmText={isAccepting ? "Stop" : "Start"}
        variant={isAccepting ? "danger" : "primary"}
        loading={toggleLoading}
        onConfirm={handleToggleApplication}
        onClose={() => setShowToggleModal(false)}
      />
    </div>
  );
};

export default InstitutionAdmissions;