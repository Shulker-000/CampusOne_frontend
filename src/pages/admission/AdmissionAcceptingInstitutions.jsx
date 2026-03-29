import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdmissionAcceptingInstitutions = () => {

  const [institutions, setInstitutions] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/institutions`)
      .then(r => r.json())
      .then(d => {
        const list = d.data || [];

        const filtered = list.filter(
          i => i.isAcceptingApplication || i.isAcceptingAdmissions
        );

        setInstitutions(filtered);
      })
      .catch(() => toast.error("Failed to load institutions"));
  }, []);

  const filteredList = institutions.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex justify-center pt-24 px-4">

      <div className="w-full max-w-5xl">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Select Institution
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Choose an institution to start your admission
          </p>
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">

          <table className="w-full text-left">

            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                  Institution Name
                </th>
                <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                  Code
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredList.map((inst, index) => (
                <tr
                  key={inst._id}
                  onClick={() => navigate(`/admission/institutions/${inst._id}`)}
                  className={`cursor-pointer transition 
                    hover:bg-indigo-50 
                    ${index !== filteredList.length - 1 ? "border-b border-slate-100" : ""}`}
                >
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {inst.name}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {inst.code}
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="2" className="py-10 text-center text-slate-500">
                    No institutions found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default AdmissionAcceptingInstitutions;