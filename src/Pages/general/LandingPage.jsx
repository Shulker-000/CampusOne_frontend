import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layers,
    Users,
    ShieldCheck,
    Building2,
    CalendarCheck,
    FileText,
    ArrowRight,
} from "lucide-react";

import University from "./../../assets/landingPage/university.png";
import Students from "./../../assets/landingPage/students.png";
import Faculties from "./../../assets/landingPage/faculties.png";
import Admin from "./../../assets/landingPage/admin.png";
import Hostel from "./../../assets/landingPage/hostel.png";
import Security from "./../../assets/landingPage/security.png";
import Certificates from "./../../assets/landingPage/certificate.png";

const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.2 },
    },
};

/* ------------------ Login Options ------------------ */
const loginOptions = [
    {
        label: "Institution Admin",
        description: "Register or manage an institution",
        route: "/institution/login",
    },
    {
        label: "Faculty / HOD",
        description: "Academic approvals & governance",
        route: "/faculty/login",
    },
    {
        label: "Student",
        description: "Requests, attendance & certificates",
        route: "/student/login",
    },
];

/* ------------------ Data ------------------ */
const modules = [
    {
        icon: Users,
        title: "Student Ecosystem",
        description:
            "Comprehensive profile management encompassing academic records, attendance tracking, and template-based application submissions for leaves or certificates with real-time status updates.",
        image: Students,
        alt: "Students using a university digital system",
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    {
        icon: Building2,
        title: "Academic Governance",
        description:
            "Empower HODs and Faculty with tools for workload balancing, course assignments, and multi-level approval chains for student requests and departmental notices.",
        image: Faculties,
        alt: "Faculty members working in a university office",
        color: "text-indigo-600",
        bg: "bg-indigo-100",
    },
    {
        icon: Layers,
        title: "Institutional Control",
        description:
            "Centralized management of universities, institutes, and departments. Configure fee structures, academic calendars, and role-based permissions with complete audit trails.",
        image: Admin,
        alt: "Administrative workspace for system configuration",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
    },
    {
        icon: CalendarCheck,
        title: "Residential & Hostel Life",
        description:
            "Automated room allocation, hostel-specific attendance, and rule violation tracking integrated directly into the academic leave and fine management system.",
        image: Hostel,
        alt: "University hostel management environment",
        color: "text-amber-600",
        bg: "bg-amber-100",
    },
    {
        icon: ShieldCheck,
        title: "Gate & Campus Security",
        description:
            "Digital gate registers with ID verification. Validates approved leaves and day-outs in real-time while maintaining detailed entry-exit logs and incident reports.",
        image: Security,
        alt: "Campus security gate and monitoring system",
        color: "text-rose-600",
        bg: "bg-rose-100",
    },
    {
        icon: FileText,
        title: "Document Automation",
        description:
            "Eliminate manual formatting with template-driven generation of Bonafide certificates, NOCs, and event permissions, featuring secure admin verification before issuance.",
        image: Certificates,
        alt: "Official academic documents and certificates",
        color: "text-slate-600",
        bg: "bg-slate-100",
    },
];

const LandingPage = () => {
    const [active, setActive] = useState(0);
    const [showLoginOptions, setShowLoginOptions] = useState(false);

    return (
        <div className="bg-white text-slate-900">
            {/* ================= HERO ================= */}
            <section className="relative h-screen overflow-hidden bg-gray-200">
                <div className="h-full max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            University Operations,
                            <br />
                            <span className="text-indigo-600">
                                Logic-Driven & Secure
                            </span>
                        </h1>

                        <p className="mt-8 text-lg text-slate-600 max-w-xl">
                            A robust full-stack solution designed to digitize academic,
                            administrative, and hostel workflows through standardized rules
                            and secure role-based access control.
                        </p>

                        {/* LOGIN CTA */}
                        <button
                            onClick={() => setShowLoginOptions((p) => !p)}
                            className="mt-12 inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-indigo-600 text-white font-medium shadow hover:shadow-lg transition"
                        >
                            Login to Platform
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        {/* ROLE OPTIONS */}
                        <AnimatePresence>
                            {showLoginOptions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl"
                                >
                                    {loginOptions.map((opt) => (
                                        <a
                                            key={opt.label}
                                            href={opt.route}
                                            className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition text-left"
                                        >
                                            <p className="font-semibold text-slate-900">
                                                {opt.label}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {opt.description}
                                            </p>
                                        </a>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <img
                        src={University}
                        alt="Integrated university management interface"
                        className="hidden lg:block rounded-2xl object-contain max-h-[70vh]"
                    />
                </div>
            </section>

            {/* ================= MODULES ================= */}
            <section
                id="modules"
                className="min-h-screen md:h-screen bg-slate-50 flex flex-col overflow-hidden"
            >
                <div className="pt-12 pb-8 px-6 text-center shrink-0">
                    <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Workflow-Driven Modules
                        </h2>
                        <p className="text-slate-500 mt-2">
                            Standardized automation across all university stakeholders.
                        </p>
                    </motion.div>
                </div>

                <div className="flex-1 max-w-7xl mx-auto w-full px-6 pb-12 flex gap-8">
                    {/* LEFT */}
                    <div className="w-1/4 hidden md:block">
                        {modules.map((m, i) => (
                            <button
                                key={m.title}
                                onClick={() => setActive(i)}
                                className={`w-full mb-3 p-4 rounded-xl flex items-center gap-3 ${active === i
                                    ? "bg-white shadow border"
                                    : "hover:bg-slate-200/60"
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${m.bg}`}>
                                    <m.icon className={`w-5 h-5 ${m.color}`} />
                                </div>
                                <span className="font-medium">{m.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* RIGHT */}
                    <div className="flex-1 bg-white rounded-3xl shadow-xl border overflow-hidden">
                        <img
                            src={modules[active].image}
                            alt={modules[active].alt}
                            className="w-full h-80 object-contain bg-slate-50"
                        />
                        <div className="p-8">
                            <p className="text-slate-600">
                                {modules[active].description}
                            </p>
                        </div>
                    </div>
                </div>
            </section>



            {/* ================= FINAL ================= */}
            <section className="relative h-screen flex items-center overflow-hidden bg-gray-200">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-4xl md:text-5xl font-bold tracking-tight"
                    >
                        Built for Accountability,
                        <br />
                        <span className="text-indigo-600">Driven by Governance</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.7 }}
                        className="mt-8 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
                    >
                        Moving beyond basic dashboards, this system implements multi-level
                        approval chains (Faculty → HOD → Hostel → Guard) to ensure every
                        action is validated and recorded in a permanent audit trail.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mt-14 flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <button
                            className="px-10 py-4 rounded-xl bg-indigo-600 text-white font-medium shadow-md hover:shadow-xl transition"
                        >
                            View Technical Documentation
                        </button>

                        <a
                            href="#modules"
                            className="px-10 py-4 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-white transition"
                        >
                            Review System Modules
                        </a>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
