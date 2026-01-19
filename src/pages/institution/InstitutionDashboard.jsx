import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PlusCircle, Users, User } from "lucide-react";

const InstitutionDashboard = () => {
  const navigate = useNavigate();

  // ✅ PROPER SOURCE OF TRUTH
  const institution = useSelector(
    (state) => state.auth.institution.data
  );

  if (!institution) return null;

  return (
    <div className="min-h-screen  bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white border rounded-2xl p-8 space-y-8 shadow-sm">

        {/* HEADER */}
        <div className="flex flex-col items-center gap-3">
          {institution.avatar && (
            <img
              src={institution.avatar}
              alt="Institution Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          )}

          <h1 className="text-2xl font-bold text-center">
            {institution.name}
          </h1>

          <button
            onClick={() => navigate("/institution/profile")}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            <User size={16} />
            View Profile
          </button>
        </div>

        {/* ACTION CARDS */}
        <div className="grid sm:grid-cols-2 gap-6">

          {/* CREATE FACULTY */}
          <div
            onClick={() => navigate("/institution/create")}
            className="cursor-pointer border rounded-xl p-6 flex flex-col items-center gap-4 hover:shadow-md transition"
          >
            <PlusCircle className="w-10 h-10 text-blue-600" />
            <h2 className="text-lg font-semibold">Create User</h2>
            <p className="text-sm text-slate-500 text-center">
              Add a new member to your institution
            </p>
          </div>

          {/* VIEW FACULTIES */}
          <div
            onClick={() => navigate("/institution/faculty")}
            className="cursor-pointer border rounded-xl p-6 flex flex-col items-center gap-4 hover:shadow-md transition"
          >
            <Users className="w-10 h-10 text-green-600" />
            <h2 className="text-lg font-semibold">View Faculties</h2>
            <p className="text-sm text-slate-500 text-center">
              Manage and view all registered faculties
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
