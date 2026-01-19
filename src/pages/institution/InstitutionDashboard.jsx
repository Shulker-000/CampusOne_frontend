import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PlusCircle, Users, User } from "lucide-react";

const InstitutionDashboard = () => {
  const navigate = useNavigate();

  const institution = useSelector((state) => state.auth.institution.data);

  if (!institution) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 space-y-8 shadow-[var(--shadow)]">
        {/* HEADER */}
        <div className="flex flex-col items-center gap-3">
          {institution.avatar && (
            <img
              src={institution.avatar}
              alt="Institution Avatar"
              className="w-20 h-20 rounded-full object-cover border border-[var(--border)]"
            />
          )}

          <h1 className="text-2xl font-bold text-center text-[var(--text)]">
            {institution.name}
          </h1>

          <button
            onClick={() => navigate("/institution/profile")}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:opacity-80 transition"
            type="button"
          >
            <User size={16} />
            View Profile
          </button>
        </div>

        {/* ACTION CARDS */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* CREATE USER */}
          <div
            onClick={() => navigate("/institution/create")}
            className="cursor-pointer border border-[var(--border)] bg-[var(--surface)] rounded-xl p-6 flex flex-col items-center gap-4 hover:bg-[var(--surface-2)] hover:shadow-[var(--shadow)] transition"
            role="button"
            tabIndex={0}
          >
            <PlusCircle className="w-10 h-10 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">Create User</h2>
            <p className="text-sm text-[var(--muted-text)] text-center">
              Add a new member to your institution
            </p>
          </div>

          {/* VIEW FACULTIES */}
          <div
            onClick={() => navigate("/institution/faculty")}
            className="cursor-pointer border border-[var(--border)] bg-[var(--surface)] rounded-xl p-6 flex flex-col items-center gap-4 hover:bg-[var(--surface-2)] hover:shadow-[var(--shadow)] transition"
            role="button"
            tabIndex={0}
          >
            <Users className="w-10 h-10 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">View Faculties</h2>
            <p className="text-sm text-[var(--muted-text)] text-center">
              Manage and view all registered faculties
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
