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
    if (!admissionAuth.authChecked) return;

    if (!admissionAuth.isAuthenticated) {
      navigate("/admission/login");
    }
  }, [admissionAuth]);

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

  if (!areRequiredDocsUploaded()) {
    toast.error("Please upload all required documents before submitting");
    return;
  }

  if (isAIProcessing()) {
    toast.error("Documents are still being verified");
    return;
  }

  try {

    // STEP 1 - submit application
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

    // STEP 2 - compute AI result
    const requiredDocs = DOCUMENT_TYPES.filter(d => d.required);

    let isRejected = false;

    for (const docType of requiredDocs) {
      const doc = getDoc(docType.key);

      if (!doc || doc.verifiedStatus === "REJECTED") {
        isRejected = true;
        break;
      }
    }

    const aiStatus = isRejected ? "AI_REJECTED" : "AI_APPROVED";

    // STEP 3 - update form status (THIS is your required route)
    const statusRes = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${application._id}/form-status`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formStatus: aiStatus })
      }
    );

    const statusData = await statusRes.json();

    if (!statusRes.ok) {
      toast.error(statusData.message || "Failed to update form status");
      return;
    }

    // STEP 4 - refresh
    const refreshed = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admissions/me`,
      { credentials: "include" }
    );

    const refreshedData = await refreshed.json();

    if (refreshed.ok) {
      setApplication(refreshedData.data);
    }

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

  const areRequiredDocsUploaded = () => {
    return DOCUMENT_TYPES
      .filter(doc => doc.required)
      .every(docType => {
        const doc = getDoc(docType.key);
        return !!doc;
      });
  };

  const getStatus = (doc) => {

    if (!doc) return "NOT_UPLOADED";

    return doc.verifiedStatus || "PENDING";

  };

  const showDocStatus = () => {
    return application.formStatus === "MANUAL_REVIEW";
  };

  const canUploadNew = () => {
    return application.formStatus === "DRAFT";
  };

  const canReplace = (doc) => {
    if (!doc) return false;

    return (
      application.formStatus === "DRAFT" ||
      (application.formStatus === "MANUAL_REVIEW" &&
        doc.verifiedStatus === "REJECTED")
    );
  };

  const canDelete = () => {
    return application.formStatus === "DRAFT";
  };

const isAIProcessing = () => {
  const requiredDocs = DOCUMENT_TYPES.filter(d => d.required);

  return requiredDocs.some(docType => {
    const doc = getDoc(docType.key);
    return !doc || !["VERIFIED", "REJECTED"].includes(doc.verifiedStatus);
  });
};

  /* ================= REMOVE DOCUMENT ================= */

  const removeDocument = async (doc) => {

    try {

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${application._id}/document/${encodeURIComponent(doc.publicId)}`,
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
        documents: prev.documents.filter(d => d.publicId !== doc.publicId)
      }));

      toast.success("Document removed");

    } catch (err) {
      console.error("DELETE ERROR:", err);
      toast.error("Delete failed");
    }

  };

  /* ================= UPLOAD DOCUMENT ================= */

  const uploadDocument = async (type, file, existingDoc) => {

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setUploadingDoc(type);

    try {

      /* 1 - DELETE OLD DOCUMENT FIRST */

      if (existingDoc?.publicId) {

        const delRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${application._id}/document/${encodeURIComponent(existingDoc.publicId)}`,
          {
            method: "DELETE",
            credentials: "include"
          }
        );

        const delData = await delRes.json();

        if (!delRes.ok) {
          toast.error(delData.message || "Old document deletion failed");
          setUploadingDoc(null);
          return;
        }

      }

      /* 2 - UPLOAD NEW DOCUMENT */

      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", type);

      const DOC_FIELD_MAP = {
        "10th_marksheet": [
          "name",
          "father_name",
          "mother_name",
          "dob",
          "roll_number_10th",
          "board"
        ],
        "12th_marksheet": [
          "name",
          "father_name",
          "mother_name",
          "dob",
          "roll_number_12th",
          "board"
        ],
        "aadhar_card": [
          "name",
          "aadhar_number"
        ],
        "entrance_exam": [
          "name",
          "application_number",
          "final_percentile_score"
        ]
      };

      const getFilteredFields = (type, fullData) => {
        const allowed = DOC_FIELD_MAP[type] || [];

        const filtered = {};

        allowed.forEach((key) => {
          if (fullData[key]) {
            filtered[key] = fullData[key];
          }
        });

        return filtered;
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${application._id}/document`,
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Document uploaded");
      setUploadingDoc(null);

      /* ===== AI VERIFICATION ===== */

      let aiResult = null;

      try {

        const aiForm = new FormData();

        aiForm.append("documents", file);
        aiForm.append("doc_types", type);

        const inputFields = {
          name: application.fullName,
          father_name: application.fatherName,
          mother_name: application.motherName,
          dob: new Date(application.dateOfBirth).toLocaleDateString("en-GB"),

          roll_number_10th: application.tenthRollNumber,
          roll_number_12th: application.twelfthRollNumber,

          board:
            type === "10th_marksheet"
              ? application.tenthBoard
              : application.twelfthBoard,

          aadhar_number: application.aadharNo,

          application_number: application.applicationNumber,
          final_percentile_score: application.entranceScore,
        };

        const filteredFields = getFilteredFields(type, inputFields);

        aiForm.append("input_fields", JSON.stringify(filteredFields));
        const aiRes = await fetch(
          `${import.meta.env.VITE_AI_URL}/verify`,
          {
            method: "POST",
            body: aiForm
          }
        );

        const aiData = await aiRes.json();
        aiResult = aiData[type];
        console.log("AI result :", aiResult);

      } catch (err) {

        console.error("AI verification failed:", err);

      }

      /* 3 - REFRESH APPLICATION */

      const refreshed = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/me`,
        { credentials: "include" }
      );

      const refreshedData = await refreshed.json();

      if (refreshed.ok) {
        setApplication(refreshedData.data);
      }

      const newDoc = refreshedData?.data?.documents?.find(
        d => d.type === type
      );

      if (aiResult && newDoc) {

        await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${application._id}/update-document/${encodeURIComponent(newDoc.publicId)}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              status: aiResult.verified_status,
              percentage: aiResult.percentage_matched,
              extractedData: aiResult.matched_data
            })
          }
        );

      }

    } catch {

      toast.error("Upload failed");

    }

  };

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {

    try {

      await logoutAdmission();

      navigate("/admission/login");

    } catch {

      toast.error("Logout failed");

    }

  };


  /* ================= Send Verification Email ================= */

  const sendVerificationEmail = async () => {

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admissions/send-verification-email`,
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
      toast.success("Verification email sent");

    } catch {
      toast.error("Failed to send email");

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
    <div className="min-h-screen bg-[#f1f5f9] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* STATUS */}
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
          <p className="text-base text-[#64748b]">Application Number</p>
          <p className="text-lg font-semibold text-[#0f172a] mt-1">
            {application.applicationNumber}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-base text-[#64748b]">Status</p>
            <span className="px-4 py-1.5 text-sm rounded-md bg-[#e0e7ff] text-[#4338ca] font-medium">
              {["AI_APPROVED", "AI_REJECTED"].includes(application.formStatus)
                ? "SUBMITTED"
                : application.formStatus}
            </span>
          </div>
        </div>

        {/* PERSONAL DETAILS */}
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a] mb-6">
            Personal Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <label className="text-sm text-[#64748b]">
                  {label}
                </label>

                <input
                  name={key}
                  value={application[key] || ""}
                  disabled={!isDraft}
                  onChange={handleChange}
                  placeholder={label}
                  className="mt-1.5 w-full border border-[#cbd5e1] rounded-md px-3 py-2.5 text-base
                bg-[#f8fafc] text-[#0f172a]
                focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />
              </div>
            ))}
          </div>

          {isDraft && (
            <button
              onClick={saveDetails}
              className="mt-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2.5 rounded-md text-sm"
            >
              Save Changes
            </button>
          )}
        </div>

        {/* EMAIL WARNING */}
        {!application.isEmailVerified && (
          <div className="bg-[#fef3c7] border border-[#facc15] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-[#92400e] text-base">
                Email not verified
              </p>
              <p className="text-sm text-[#92400e] mt-1">
                Verify email before uploading documents
              </p>
            </div>

            <button
              onClick={sendVerificationEmail}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-5 py-2.5 rounded-md text-sm"
            >
              Verify Email
            </button>
          </div>
        )}

        {/* DOCUMENTS */}
        {application.isEmailVerified && (
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-[#0f172a] mb-5">
              Documents
            </h2>

            <div className="grid gap-4">
              {DOCUMENT_TYPES.map((docType) => {
                const doc = getDoc(docType.key);
                const status = getStatus(doc);

                const statusStyles = showDocStatus()
                  ? (status === "VERIFIED"
                    ? "bg-[#dcfce7] text-[#166534]"
                    : status === "REJECTED"
                      ? "bg-[#fee2e2] text-[#991b1b]"
                      : "bg-[#e2e8f0] text-[#334155]")
                  : "";

                return (
                  <div
                    key={docType.key}
                    className="border border-[#e2e8f0] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#f8fafc]"
                  >
                    {/* LEFT */}
                    <div className="flex-1 space-y-1">
                      <p className="text-base font-medium text-[#0f172a]">
                        {docType.label}
                      </p>

                      {/* STATUS BADGE */}
                      {showDocStatus() && (
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-md font-medium ${statusStyles}`}>
                          {status}
                        </span>
                      )}

                      {doc?.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm text-[#4f46e5] hover:underline mt-1"
                        >
                          View Document
                        </a>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 self-start sm:self-center">

                      {doc && canDelete() && (
                        <button
                          onClick={() => removeDocument(doc)}
                          className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-3 py-2 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {/* UPLOAD NEW */}
                      {!doc && canUploadNew() && (
                        <label className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 text-sm">
                          {uploadingDoc === docType.key
                            ? <Loader2 className="animate-spin w-4 h-4" />
                            : <Upload className="w-4 h-4" />}

                          Upload

                          <input
                            type="file"
                            accept="application/pdf"
                            hidden
                            onChange={(e) =>
                              uploadDocument(docType.key, e.target.files[0], null)
                            }
                          />
                        </label>
                      )}

                      {/* REPLACE */}
                      {doc && canReplace(doc) && (
                        <label className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 text-sm">
                          {uploadingDoc === docType.key
                            ? <Loader2 className="animate-spin w-4 h-4" />
                            : <Upload className="w-4 h-4" />}

                          Replace

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
        )}

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[#e2e8f0]">

          <button
            onClick={handleLogout}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 py-2.5 rounded-md text-sm flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>

          {isDraft && (
            <button
              onClick={submitApplication}
              disabled={!areRequiredDocsUploaded() || isAIProcessing()}
              className={`bg-[#4f46e5] text-white px-6 py-2.5 rounded-md text-sm flex items-center gap-2 ${(!areRequiredDocsUploaded() || isAIProcessing())
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#4338ca]"
                }`}
            >
              <Send size={16} />
              {isAIProcessing()
                ? "Verifying Documents..."
                : "Submit Application"}
            </button>
          )}

        </div>

      </div>
    </div>
  );

};

export default AdmissionDashboard;