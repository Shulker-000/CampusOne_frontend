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

      /* ===== AI VERIFICATION ===== */

      let aiResult = null;

      try {

        const aiForm = new FormData();

        aiForm.append("documents", file);
        aiForm.append("doc_types", type);
        console.log("Application: ", application);

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
        console.log("application id: ", application._id);

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

    } finally {

      setUploadingDoc(null);

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

  // return (

  //   <div className="min-h-screen bg-[#f8fafc]">

  //     <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">

  //       {/* STATUS */}

  //       <div className="bg-white border rounded-xl p-6 shadow-sm">

  //         <h2 className="text-lg text-black font-semibold mb-4">
  //           Application Status
  //         </h2>

  //         <p className="text-slate-700">
  //           Application Number:
  //           <span className="ml-2 font-semibold">
  //             {application.applicationNumber}
  //           </span>
  //         </p>

  //         <p className="text-slate-700">
  //           Status:
  //           <span className="ml-2 font-semibold text-indigo-600">
  //             {application.formStatus}
  //           </span>
  //         </p>

  //       </div>


  //       {/* PERSONAL DETAILS */}

  //       <div className="bg-white border rounded-xl p-6 shadow-sm">

  //         <h2 className="text-lg text-black font-semibold mb-6">
  //           Personal Details
  //         </h2>

  //         <div className="grid md:grid-cols-2 gap-5">

  //           {[
  //             ["fullName", "Full Name"],
  //             ["fatherName", "Father Name"],
  //             ["motherName", "Mother Name"],
  //             ["phone", "Phone"],
  //             ["address", "Address"],
  //             ["city", "City"],
  //             ["state", "State"],
  //             ["pincode", "Pincode"]
  //           ].map(([key, label]) => (

  //             <div key={key}>

  //               <label className="text-sm text-slate-700">
  //                 {label}
  //               </label>

  //               <input
  //                 name={key}
  //                 value={application[key] || ""}
  //                 disabled={!isDraft}
  //                 onChange={handleChange}
  //                 placeholder={label}
  //                 className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2
  //             focus:ring-2 focus:ring-indigo-500 outline-none
  //             placeholder:text-slate-700 text-slate-900"
  //               />

  //             </div>

  //           ))}

  //         </div>

  //         {isDraft && (

  //           <button
  //             onClick={saveDetails}
  //             className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
  //           >
  //             Save Changes
  //           </button>

  //         )}

  //       </div>


  //       {/* Email Verified */}
  //       {!application.isEmailVerified && (

  //         <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex justify-between items-center">

  //           <div>

  //             <p className="font-semibold text-yellow-800">
  //               Email not verified
  //             </p>

  //             <p className="text-sm text-yellow-700">
  //               You must verify your email before uploading documents.
  //             </p>

  //           </div>

  //           <button
  //             onClick={sendVerificationEmail}
  //             className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
  //           >
  //             Send Verification Email
  //           </button>

  //         </div>

  //       )}


  //       {/* DOCUMENTS */}

  //       {application.isEmailVerified && <div className="bg-white border rounded-xl p-6 shadow-sm">

  //         <h2 className="text-lg text-black font-semibold mb-5">
  //           Documents
  //         </h2>

  //         <div className="space-y-4">

  //           {DOCUMENT_TYPES.map(docType => {

  //             const doc = getDoc(docType.key);
  //             const status = getStatus(doc);

  //             return (

  //               <div
  //                 key={docType.key}
  //                 className="flex justify-between items-center border rounded-lg p-4 bg-slate-50"
  //               >
  //                 <div>

  //                   <p className="font-medium text-slate-800">
  //                     {docType.label}
  //                   </p>

  //                   <p className="text-sm text-slate-500">
  //                     {status}
  //                     {doc?.verifiedPercentage ? ` (${doc.verifiedPercentage}%)` : ""}
  //                   </p>

  //                   {doc?.fileUrl && (
  //                     <a
  //                       href={doc.fileUrl}
  //                       target="_blank"
  //                       rel="noreferrer"
  //                       className="text-sm text-indigo-600 hover:underline"
  //                     >
  //                       View Document
  //                     </a>
  //                   )}
  //                 </div>

  //                 <div className="flex gap-2">
  //                   {application.isEmailVerified && doc && canUpload(doc) && (
  //                     <button
  //                       onClick={() => removeDocument(doc)}
  //                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
  //                     >
  //                       <Trash2 size={16} />
  //                     </button>
  //                   )}
  //                   {application.isEmailVerified && canUpload(doc) && (
  //                     <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
  //                       {uploadingDoc === docType.key
  //                         ? <Loader2 className="animate-spin w-4 h-4" />
  //                         : <Upload className="w-4 h-4" />}

  //                       {doc ? "Replace" : "Upload"}

  //                       <input
  //                         type="file"
  //                         accept="application/pdf"
  //                         hidden
  //                         onChange={(e) =>
  //                           uploadDocument(docType.key, e.target.files[0], doc)
  //                         }
  //                       />
  //                     </label>
  //                   )}
  //                 </div>
  //               </div>
  //             );
  //           })}
  //         </div>
  //       </div>}

  //       {/* SUBMIT */}

  //       {isDraft && (
  //         <div className="flex justify-end">
  //           <button
  //             onClick={submitApplication}
  //             className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
  //           >
  //             <Send size={18} />
  //             Submit Application
  //           </button>
  //         </div>
  //       )}

  //       {/* LOGOUT */}

  //       <div className="flex justify-end pt-6 border-t">
  //         <button
  //           onClick={handleLogout}
  //           className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
  //         >
  //           <LogOut size={16} />
  //           Logout
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );

  /**/

  //   return (
  //   <div className="min-h-screen bg-slate-100">
  //     <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">

  //       {/* TOP SUMMARY */}
  //       <div className="grid md:grid-cols-3 gap-4">
  //         <div className="bg-white p-5 rounded-xl border">
  //           <p className="text-sm text-slate-500">Application No.</p>
  //           <p className="font-semibold text-slate-800">
  //             {application.applicationNumber}
  //           </p>
  //         </div>

  //         <div className="bg-white p-5 rounded-xl border">
  //           <p className="text-sm text-slate-500">Status</p>
  //           <p className="font-semibold text-indigo-600">
  //             {application.formStatus}
  //           </p>
  //         </div>

  //         <div className="bg-white p-5 rounded-xl border">
  //           <p className="text-sm text-slate-500">Documents</p>
  //           <p className="font-semibold text-slate-800">
  //             {
  //               DOCUMENT_TYPES.filter(d => getDoc(d.key)).length
  //             } / {DOCUMENT_TYPES.length}
  //           </p>
  //         </div>
  //       </div>


  //       {/* EMAIL WARNING */}
  //       {!application.isEmailVerified && (
  //         <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex justify-between items-center">
  //           <div>
  //             <p className="font-semibold text-yellow-900">
  //               Email not verified
  //             </p>
  //             <p className="text-sm text-yellow-700">
  //               Verify email before uploading documents
  //             </p>
  //           </div>

  //           <button
  //             onClick={sendVerificationEmail}
  //             className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
  //           >
  //             Verify Now
  //           </button>
  //         </div>
  //       )}


  //       {/* MAIN LAYOUT */}
  //       <div className="grid md:grid-cols-3 gap-6">

  //         {/* LEFT SIDE */}
  //         <div className="md:col-span-2 space-y-6">

  //           {/* PERSONAL DETAILS */}
  //           <div className="bg-white border rounded-xl p-6">
  //             <h2 className="text-lg font-semibold mb-6">
  //               Personal Details
  //             </h2>

  //             <div className="grid md:grid-cols-2 gap-5">
  //               {[
  //                 ["fullName", "Full Name"],
  //                 ["fatherName", "Father Name"],
  //                 ["motherName", "Mother Name"],
  //                 ["phone", "Phone"],
  //                 ["address", "Address"],
  //                 ["city", "City"],
  //                 ["state", "State"],
  //                 ["pincode", "Pincode"]
  //               ].map(([key, label]) => (
  //                 <div key={key}>
  //                   <label className="text-xs text-slate-500">
  //                     {label}
  //                   </label>

  //                   <input
  //                     name={key}
  //                     value={application[key] || ""}
  //                     disabled={!isDraft}
  //                     onChange={handleChange}
  //                     placeholder={label}
  //                     className="mt-1 w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
  //                   />
  //                 </div>
  //               ))}
  //             </div>

  //             {isDraft && (
  //               <button
  //                 onClick={saveDetails}
  //                 className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
  //               >
  //                 Save Changes
  //               </button>
  //             )}
  //           </div>


  //           {/* DOCUMENTS */}
  //           {application.isEmailVerified && (
  //             <div className="bg-white border rounded-xl p-6">
  //               <h2 className="text-lg font-semibold mb-5">
  //                 Documents Checklist
  //               </h2>

  //               <div className="space-y-3">
  //                 {DOCUMENT_TYPES.map(docType => {
  //                   const doc = getDoc(docType.key);
  //                   const status = getStatus(doc);

  //                   return (
  //                     <div
  //                       key={docType.key}
  //                       className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"
  //                     >
  //                       <div className="flex items-center gap-3">

  //                         <div className={`w-2.5 h-2.5 rounded-full ${
  //                           status === "Verified"
  //                             ? "bg-green-500"
  //                             : status === "Rejected"
  //                             ? "bg-red-500"
  //                             : "bg-gray-300"
  //                         }`} />

  //                         <div>
  //                           <p className="text-sm font-medium">
  //                             {docType.label}
  //                           </p>
  //                           <p className="text-xs text-slate-500">
  //                             {status}
  //                             {doc?.verifiedPercentage ? ` (${doc.verifiedPercentage}%)` : ""}
  //                           </p>
  //                         </div>
  //                       </div>

  //                       <div className="flex gap-2">
  //                         {doc && canUpload(doc) && (
  //                           <button
  //                             onClick={() => removeDocument(doc)}
  //                             className="bg-red-500 text-white px-2 py-1 rounded"
  //                           >
  //                             <Trash2 size={14} />
  //                           </button>
  //                         )}

  //                         {canUpload(doc) && (
  //                           <label className="bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer flex items-center gap-1">
  //                             {uploadingDoc === docType.key
  //                               ? <Loader2 className="animate-spin w-4 h-4" />
  //                               : <Upload className="w-4 h-4" />}

  //                             <input
  //                               type="file"
  //                               hidden
  //                               accept="application/pdf"
  //                               onChange={(e) =>
  //                                 uploadDocument(docType.key, e.target.files[0], doc)
  //                               }
  //                             />
  //                           </label>
  //                         )}
  //                       </div>
  //                     </div>
  //                   );
  //                 })}
  //               </div>
  //             </div>
  //           )}

  //         </div>


  //         {/* RIGHT SIDEBAR */}
  //         <div className="space-y-6">

  //           {/* STATUS CARD */}
  //           <div className="bg-white border rounded-xl p-5">
  //             <p className="text-sm text-slate-500">Current Status</p>
  //             <p className="text-lg font-semibold text-indigo-600">
  //               {application.formStatus}
  //             </p>
  //           </div>

  //           {/* SUBMIT */}
  //           {isDraft && (
  //             <div className="bg-white border rounded-xl p-5 sticky top-6">
  //               <p className="text-sm text-slate-500 mb-3">
  //                 Ready to submit?
  //               </p>

  //               <button
  //                 onClick={submitApplication}
  //                 className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
  //               >
  //                 <Send size={18} />
  //                 Submit Application
  //               </button>
  //             </div>
  //           )}

  //           {/* LOGOUT */}
  //           <div className="bg-white border rounded-xl p-5">
  //             <button
  //               onClick={handleLogout}
  //               className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
  //             >
  //               <LogOut size={16} />
  //               Logout
  //             </button>
  //           </div>

  //         </div>
  //       </div>

  //     </div>
  //   </div>
  // );

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
              {application.formStatus}
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

                const statusStyles =
                  status === "Verified"
                    ? "bg-[#dcfce7] text-[#166534]"
                    : status === "Rejected"
                      ? "bg-[#fee2e2] text-[#991b1b]"
                      : "bg-[#e2e8f0] text-[#334155]";

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
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-md font-medium ${statusStyles}`}>
                        {status}
                      </span>

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

                      {doc && canUpload(doc) && (
                        <button
                          onClick={() => removeDocument(doc)}
                          className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-3 py-2 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {canUpload(doc) && (
                        <label className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 text-sm">
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
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2.5 rounded-md text-sm flex items-center gap-2"
            >
              <Send size={16} />
              Submit Application
            </button>
          )}

        </div>

      </div>
    </div>
  );

};

export default AdmissionDashboard;