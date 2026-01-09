import React from "react";
import { useNavigate } from "react-router-dom";

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const institution =
    JSON.parse(localStorage.getItem("authInstitution")) || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white border rounded-lg p-6 space-y-4">

        {/* Avatar */}
        {institution.avatar && (
          <div className="flex justify-center">
            <img
              src={institution.avatar}
              alt="Institution Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
        )}

        {/* Name */}
        <h1 className="text-xl font-semibold text-center">
          {institution.name || "-"}
        </h1>

        {/* Info */}
        <div className="text-sm text-slate-600 space-y-2">
          <div><b>Code:</b> {institution.code || "-"}</div>
          <div><b>Type:</b> {institution.type || "-"}</div>
          <div><b>Established:</b> {institution.establishedYear || "-"}</div>
          <div><b>Address:</b> {institution.address || "-"}</div>
          <div><b>Email:</b> {institution.contactEmail || "-"}</div>
          <div><b>Phone:</b> {institution.contactPhone || "-"}</div>
        </div>

        <div className="flex justify-center">
          <button
            className="border-blue-800 border-4 bg-blue-500 rounded-xl px-6 py-3 text-black font-bold transition-transform hover:scale-110 text-lg"
            onClick={()=>navigate('/institution/profile')}
          >
            Profile Page
          </button>
        </div>


      </div>
    </div>
  );
};

export default InstitutionDashboard;
