// src/pages/institution/admissions/InstitutionAdmissionApplication.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";

const DOC_STATUS = ["VERIFIED", "REJECTED"];

const ACTION_LABELS = {
    FINAL_APPROVED: "Approve Application",
    FINAL_REJECTED: "Reject Application",
};

const InstitutionAdmissionApplication = () => {
    const { applicationId } = useParams();

    const [loading, setLoading] = useState(true);
    const [app, setApp] = useState(null);
    const [updating, setUpdating] = useState(false);
    const isFinal = app?.formStatus?.startsWith("FINAL");

    const [confirm, setConfirm] = useState({
        open: false,
        title: "",
        message: "",
        action: null,
    });

    // ================= FETCH =================
    const fetchApplication = async () => {
        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${applicationId}`,
                { credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setApp(data.data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplication();
    }, [applicationId]);

    // ================= CONFIRM EXECUTION =================
    const handleConfirm = async () => {
        try {
            setUpdating(true);
            await confirm.action();
            toast.success("Updated successfully");
            fetchApplication();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdating(false);
            setConfirm({ open: false });
        }
    };

    // ================= HELPERS =================

    const askAppStatusChange = (status) => {
        setConfirm({
            open: true,
            title: ACTION_LABELS[status],
            message: `You are about to change status to "${status}". This affects final decision.`,
            action: async () => {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${applicationId}/set-status`,
                    {
                        method: "PUT",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ formStatus: status }),
                    }
                );

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
            },
        });
    };

    const askDocStatusChange = (doc, status) => {
        setConfirm({
            open: true,
            title: `Update ${doc.type}`,
            message: `Mark this document as "${status}"?`,
            action: async () => {

                // 1. update document
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${applicationId}/document/${encodeURIComponent(doc.publicId)}/status`,
                    {
                        method: "PUT",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status }),
                    }
                );

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                // 2. FORCE MANUAL REVIEW
                await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/admissions/${applicationId}/set-status`,
                    {
                        method: "PUT",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ formStatus: "MANUAL_REVIEW" }),
                    }
                );
            },
        });
    };

    if (loading) return <Loader />;
    if (!app) return <div>No Data</div>;

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{app.fullName}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-mono bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted-text)]">
                                {app.applicationNumber}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${app.formStatus === 'FINAL_APPROVED' ? 'bg-green-500/10 text-green-500' :
                                app.formStatus === 'FINAL_REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                {app.formStatus.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                        >
                            Print Application
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* PERSONAL DETAILS */}
                        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]/30">
                                <h2 className="font-bold text-sm uppercase tracking-wider">Personal Details</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                                {[
                                    { label: "Full Name", value: app.fullName },
                                    { label: "Email Address", value: app.email },
                                    { label: "Phone Number", value: app.phone },
                                    { label: "Aadhaar Number", value: app.aadharNo },
                                    { label: "City", value: app.city },
                                    { label: "State", value: app.state },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <p className="text-[10px] uppercase font-bold text-[var(--muted-text)] mb-1 tracking-tight">{item.label}</p>
                                        <p className="text-sm font-medium">{item.value || "N/A"}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ACADEMIC RECORDS */}
                        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]/30">
                                <h2 className="font-bold text-sm uppercase tracking-wider">Academic Records</h2>
                            </div>
                            <div className="p-0 divide-y divide-[var(--border)]">
                                {/* 10th & 12th loops */}
                                {[
                                    { title: "Class 10th", marks: app.tenthMarks, board: app.tenthBoard, roll: app.tenthRollNumber, year: app.tenthPassingYear },
                                    { title: "Class 12th", marks: app.twelfthMarks, board: app.twelfthBoard, roll: app.twelfthRollNumber, year: app.twelfthPassingYear }
                                ].map((edu, idx) => (
                                    <div key={idx} className="p-6">
                                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            {edu.title}
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-[10px] text-[var(--muted-text)] uppercase mb-1">Marks</p>
                                                <p className="text-sm font-semibold">{edu.marks}%</p>
                                            </div>

                                            <div>
                                                <p className="text-[10px] text-[var(--muted-text)] uppercase mb-1">Roll No</p>
                                                <p className="text-sm font-medium font-mono">{edu.roll}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[var(--muted-text)] uppercase mb-1">Year</p>
                                                <p className="text-sm font-medium">{edu.year}</p>
                                            </div>                      <div>
                                                <p className="text-[10px] text-[var(--muted-text)] uppercase mb-1">Board</p>
                                                <p className="text-sm font-medium">{edu.board}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* DOCUMENTS */}
                        <section className="space-y-4">
                            <h2 className="font-bold text-sm uppercase tracking-wider px-2 text-[var(--muted-text)]">Verification Documents</h2>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                {app.documents.map((doc) => (
                                    <div key={doc.publicId} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-sm">{doc.type}</h4>
                                                <p className={`text-[11px] ${doc.verifiedPercentage < 60
                                                    ? "text-red-500"
                                                    : "text-[var(--muted-text)]"
                                                    }`}>
                                                    AI Match: {doc.verifiedPercentage}%
                                                </p>
                                            </div>
                                            <a
                                                href={doc.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                                title="View Full File"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </a>
                                        </div>

                                        {/* OCR DATA PREVIEW */}
                                        <div className="flex-1 bg-[var(--surface-2)]/50 rounded-lg p-3 space-y-2 mb-4">
                                            {doc.extractedData ? Object.entries(doc.extractedData).map(([k, v]) => (
                                                <div key={k} className="flex justify-between text-[11px]">
                                                    <span className="text-[var(--muted-text)] truncate mr-2">{k}:</span>
                                                    <span className="font-medium truncate">{String(v)}</span>
                                                </div>
                                            )) : <p className="text-[11px] italic text-[var(--muted-text)]">No extraction data available</p>}
                                        </div>

                                        {/* STATUS INFO */}
                                        <div className="text-xs space-y-1 mb-3">
                                            <p className="text-[var(--muted-text)]">
                                                AI Status: {doc.verifiedStatus || "PENDING"}
                                            </p>

                                            <p className="font-medium">
                                                Current Status: {doc.verifiedStatus || "PENDING"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border)]">
                                            {DOC_STATUS.map((s) => (
                                                <button
                                                    key={s}
                                                    disabled={isFinal}
                                                    onClick={() => askDocStatusChange(doc, s)}
                                                    className={`flex-1 py-2 text-xs rounded-md border ${doc.verifiedStatus === s
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "border-[var(--border)] hover:bg-[var(--surface-2)]"
                                                        }`}
                                                >
                                                    {s === "VERIFIED" ? "VERIFY" : "REJECT"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (SIDEBAR) */}
                    <div className="space-y-6">

                        {/* ACTION CENTER */}
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm sticky top-6">
                            <h3 className="font-bold text-xs uppercase tracking-wider mb-2 pb-1 border-b border-[var(--border)]">Current Status: {app.formStatus}</h3>
                            <h3 className="font-bold text-sm uppercase tracking-wider mb-6 pb-2 border-b border-[var(--border)]">Final Decision</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={() => askAppStatusChange('FINAL_APPROVED')}
                                    disabled={isFinal}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                                >
                                    Approve Application
                                </button>

                                <button
                                    onClick={() => askAppStatusChange('FINAL_REJECTED')}
                                    disabled={isFinal}
                                    className="w-full py-3 border border-[var(--border)] hover:bg-[var(--surface-2)] rounded-lg text-sm"
                                >
                                    Reject Application
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={confirm.open}
                title={confirm.title}
                message={confirm.message}
                confirmText="Confirm"
                cancelText="Cancel"
                loading={updating}
                onClose={() => setConfirm({ open: false })}
                onConfirm={handleConfirm}
            />
        </div>
    );
};

export default InstitutionAdmissionApplication;