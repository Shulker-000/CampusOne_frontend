import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

import Loader from "../../../components/Loader";

const InstitutionBranchProfile = () => {
    const navigate = useNavigate();
    const { branchId } = useParams();

    const [loading, setLoading] = useState(true);
    const [branch, setBranch] = useState(null);
    const [department, setDepartment] = useState(null);

    /* ================= FETCH ================= */

    const fetchBranch = async () => {
        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/branches/${branchId}`,
                { credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch branch");

            setBranch(data.data);

            if (data.data?.departmentId) {
                fetchDepartment(data.data.departmentId);
            }
        } catch (err) {
            toast.error(err.message || "Failed to load branch");
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartment = async (departmentId) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/departments/${departmentId}`,
                { credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setDepartment(data.data);
        } catch (err) {
            toast.error(err.message || "Failed to load department");
        }
    };

    useEffect(() => {
        if (!branchId) return;
        fetchBranch();
    }, [branchId]);

    if (loading) return <Loader />;
    if (!branch) return null;

    /* ================= UI ================= */

    return (
        <div className="px-6 py-8 max-w-6xl">

            {/* ===== Header ===== */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-[var(--muted-text)] hover:text-[var(--text)]"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <h1 className="mt-4 text-3xl font-bold">
                    {branch.name}
                </h1>

            </div>

            {/* ===== Branch Overview ===== */}
            <section className="border-t border-[var(--border)] pt-8 pb-10">
                <div
                    className="
                        relative bg-[var(--surface)]
                        border border-[var(--border)]
                        rounded-2xl px-6 py-7
                    "
                >
                    {/* accent rail (same language as dept) */}
                    <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent)] rounded-l-2xl" />

                    {/* Header */}
                    <div className="mb-6 pl-3">
                        <h2 className="text-base font-bold text-[var(--text)]">
                            Branch Overview:
                        </h2>
                    </div>

                    {/* ===== Info Grid ===== */}
                    <div className="relative pl-3">
                        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">

                            {/* vertical divider */}
                            <div
                                className="
                                    hidden sm:block
                                    absolute
                                    left-1/2
                                    top-1
                                    bottom-1
                                    w-[2px]
                                    bg-[var(--text)]
                                "
                            />

                            {/* Branch Code */}
                            <div className="pr-8">
                                <Info
                                    label="Branch Code"
                                    value={branch.code}
                                />
                            </div>

                            {/* Department */}
                            <div className="sm:pl-8">
                                <p className="text-xs uppercase tracking-wider text-[var(--muted-text)] font-semibold">
                                    Department
                                </p>

                                {department ? (
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/institution/departments/profile/${department._id}`
                                            )
                                        }
                                        className="
                                            mt-1.5 text-lg font-bold
                                            text-[var(--accent)]
                                            hover:underline
                                            underline-offset-4
                                        "
                                    >
                                        {department.name}
                                    </button>
                                ) : (
                                    <p className="mt-1.5 text-lg font-bold text-[var(--muted-text)]">
                                        Loading...
                                    </p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="pr-8">
                                <Info
                                    label="Status"
                                    value={branch.isOpen ? "Open" : "Closed"}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

/* ================= Small Info Component ================= */

const Info = ({ label, value }) => (
    <div>
        <p className="text-xs uppercase tracking-wider text-[var(--muted-text)] font-semibold">
            {label}
        </p>
        <p className="mt-1.5 text-lg font-bold text-[var(--text)]">
            {value || "—"}
        </p>
    </div>
);

export default InstitutionBranchProfile;
