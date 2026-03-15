import React, { useEffect, useState } from "react";
import { Loader2, Upload, Trash2, LogOut, Send } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const DOCUMENT_TYPES = [
  { key: "10th_marksheet", label: "10th Marksheet", required: true },
  { key: "12th_marksheet", label: "12th Marksheet", required: true },
  { key: "aadhar_card", label: "Aadhaar Card", required: true },
  { key: "entrance_exam", label: "Entrance Exam", required: false }
];

const AdmissionDashboard = () => {

  const navigate = useNavigate();
  const { logoutAdmission } = useAuth();

  const admissionAuth = useSelector((s) => s.auth.admission);

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const isDraft = application?.formStatus === "DRAFT";

  /* ================= AUTH GUARD ================= */

  useEffect(() => {

    if (admissionAuth.authChecked && !admissionAuth.isAuthenticated) {
      navigate("/admissions/login");
    }

  }, [admissionAuth.authChecked, admissionAuth.isAuthenticated]);


  /* ================= FETCH APPLICATION ================= */

  useEffect(() => {

    const fetchApplication = async () => {

      try {

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/admissions/me`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message);
          return;
        }

        setApplication(data.data);

      } catch {

        toast.error("Network error");

      } finally {

        setLoading(false);

      }

    };

    fetchApplication();

  }, []);


  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setApplication(prev => ({
      ...prev,
      [name]: value
    }));

  };


  /* ================= SAVE DETAILS ================= */

  const saveDetails = async () => {

    try {

      const payload = {
        fullName: application.fullName,
        fatherName: application.fatherName,
        motherName: application.motherName,
        phone: application.phone,
        address: application.address,
        city: application.city,
        state: application.state,
        pincode: application.pincode
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/me`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      setApplication(data.data);

      toast.success("Details updated");

    } catch {

      toast.error("Network error");

    }

  };


  /* ================= SUBMIT APPLICATION ================= */

  const submitApplication = async () => {

    try {

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/submit`,
        {
          method: "POST",
          credentials: "include"
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      setApplication(data.data);

      toast.success("Application submitted");

    } catch {

      toast.error("Network error");

    }

  };


  /* ================= DOCUMENT HELPERS ================= */

  const documents = application?.documents || [];

  const getDoc = (type) => {
    const docs = documents.filter(d => d.type === type);
    return docs[docs.length - 1];
  };

  const getStatus = (doc) => {

    if (!doc) return "NOT_UPLOADED";

    return doc.verifiedStatus || "PENDING";

  };

  const canUpload = (doc) => {

    if (!doc) return true;

    if (
      doc.verifiedStatus === "REJECTED" &&
      application.formStatus !== "FINAL_REJECTED"
    ) {
      return false;
    }

    return true;

  };


  /* ================= REMOVE DOCUMENT ================= */

  const removeDocument = async (doc) => {

    try {

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${application._id}/document/${doc._id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      setApplication(prev => ({
        ...prev,
        documents: prev.documents.filter(d => d._id !== doc._id)
      }));

      toast.success("Document removed");

    } catch {

      toast.error("Delete failed");

    }

  };

  /* ================= UPLOAD DOCUMENT ================= */

  const uploadDocument = async (type, file, existingDoc) => {

    if (!file) return;

    /* STRICT PDF CHECK */

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setUploadingDoc(type);

    try {

      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", type);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${application._id}/document`,
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );

      const data = await res.json();
console.log("Data : " , data);

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      /* delete old doc AFTER new upload */

      if (existingDoc?._id) {

        const delRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${application._id}/document/${existingDoc._id}`,
          {
            method: "DELETE",
            credentials: "include"
          }
        );

        if (!delRes.ok) {
          toast.error("Old document deletion failed");
        }

      }

      toast.success("Document uploaded");

      const refreshed = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/me`,
        { credentials: "include" }
      );

      const refreshedData = await refreshed.json();

      if (refreshed.ok) {
        setApplication(refreshedData.data);
      }

    } catch {

      toast.error("Upload failed");

    } finally {

      setUploadingDoc(null);

    }

  };

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {

    try {

      await logoutAdmission();

      navigate("/admissions/login");

    } catch {

      toast.error("Logout failed");

    }

  };


  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8fafc]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );

  }

  if (!application) {

    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8fafc]">
        Failed to load application
      </div>
    );

  }


  /* ================= DASHBOARD ================= */

  return (

    <div className="min-h-screen bg-[#f8fafc]">

      <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">

        {/* STATUS */}

        <div className="bg-white border rounded-xl p-6 shadow-sm">

          <h2 className="text-lg text-black font-semibold mb-4">
            Application Status
          </h2>

          <p className="text-slate-700">
            Application Number:
            <span className="ml-2 font-semibold">
              {application.applicationNumber}
            </span>
          </p>

          <p className="text-slate-700">
            Status:
            <span className="ml-2 font-semibold text-indigo-600">
              {application.formStatus}
            </span>
          </p>

        </div>


        {/* PERSONAL DETAILS */}

        <div className="bg-white border rounded-xl p-6 shadow-sm">

          <h2 className="text-lg text-black font-semibold mb-6">
            Personal Details
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            {[
              ["fullName", "Full Name"],
              ["fatherName", "Father Name"],
              ["motherName", "Mother Name"],
              ["phone", "Phone"],
              ["address", "Address"],
              ["city", "City"],
              ["state", "State"],
              ["pincode", "Pincode"]
            ].map(([key, label]) => (

              <div key={key}>

                <label className="text-sm text-slate-700">
                  {label}
                </label>

                <input
                  name={key}
                  value={application[key] || ""}
                  disabled={!isDraft}
                  onChange={handleChange}
                  placeholder={label}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2
              focus:ring-2 focus:ring-indigo-500 outline-none
              placeholder:text-slate-700 text-slate-900"
                />

              </div>

            ))}

          </div>

          {isDraft && (

            <button
              onClick={saveDetails}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
            >
              Save Changes
            </button>

          )}

        </div>


        {/* DOCUMENTS */}

        <div className="bg-white border rounded-xl p-6 shadow-sm">

          <h2 className="text-lg text-black font-semibold mb-5">
            Documents
          </h2>

          <div className="space-y-4">

            {DOCUMENT_TYPES.map(docType => {

              const doc = getDoc(docType.key);
              const status = getStatus(doc);

              return (

                <div
                  key={docType.key}
                  className="flex justify-between items-center border rounded-lg p-4 bg-slate-50"
                >
                  <div>

                    <p className="font-medium text-slate-800">
                      {docType.label}
                    </p>

                    <p className="text-sm text-slate-500">
                      {status}
                      {doc?.verifiedPercentage ? ` (${doc.verifiedPercentage}%)` : ""}
                    </p>

                    {doc?.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        View Document
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {doc && canUpload(doc) && (
                      <button
                        onClick={() => removeDocument(doc)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {canUpload(doc) && (
                      <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                        {uploadingDoc === docType.key
                          ? <Loader2 className="animate-spin w-4 h-4" />
                          : <Upload className="w-4 h-4" />}

                        {doc ? "Replace" : "Upload"}

                        <input
                          type="file"
                          accept="application/pdf"
                          hidden
                          onChange={(e) =>
                            uploadDocument(docType.key, e.target.files[0], doc)
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SUBMIT */}

        {isDraft && (
          <div className="flex justify-end">
            <button
              onClick={submitApplication}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              <Send size={18} />
              Submit Application
            </button>
          </div>
        )}

        {/* LOGOUT */}

        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdmissionDashboard;