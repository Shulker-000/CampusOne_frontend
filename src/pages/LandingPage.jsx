import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Users,
  ShieldCheck,
  Building2,
  CalendarCheck,
  FileText,
  ArrowRight,
} from "lucide-react";

import University from "./../assets/landingPage/university.png";
import Students from "./../assets/landingPage/students.png";
import Faculties from "./../assets/landingPage/faculties.png";
import Admin from "./../assets/landingPage/admin.png";
import Hostel from "./../assets/landingPage/hostel.png";
import Security from "./../assets/landingPage/security.png";
import Certificates from "./../assets/landingPage/certificate.png";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.2 },
  },
};

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

  return (
    <div className="bg-white text-slate-900">
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >

            <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              University Operations,
              <br />
              <span className="text-indigo-600">Logic-Driven & Secure</span>
            </h1>

            <p className="mt-7 text-lg text-slate-600 max-w-xl leading-relaxed">
              A robust full-stack system to digitize academic, administrative,
              and hostel workflows through standardized rules and role-based
              access control.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="#user-login"
                className="px-9 py-4 rounded-xl bg-indigo-600 text-white font-medium shadow-md hover:shadow-xl hover:bg-indigo-700 transition inline-flex items-center justify-center gap-2"
              >
                Login to CampusOne <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="#modules"
                className="px-9 py-4 rounded-xl border border-slate-300 bg-white/60 text-slate-700 font-medium hover:bg-white transition inline-flex items-center justify-center"
              >
                Review System Modules
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="hidden lg:block"
          >
            <div className="bg-white/60 border border-slate-200 rounded-3xl shadow-xl p-6">
              <img
                src={University}
                alt="Integrated university management interface"
                className="w-full max-h-[72vh] object-contain rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STUDENT / FACULTY LOGIN ================= */}
      <section
        id="user-login"
        className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white to-slate-50"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >

            <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
              Login to Your Portal
              <br />
              <span className="text-emerald-600">Student or Faculty</span>
            </h2>

            <p className="mt-7 text-lg text-slate-600 max-w-xl leading-relaxed">
              Get direct access to requests, approvals, notices, and academic
              workflows - without confusion and without wrong permissions.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="/student/login"
                className="px-9 py-4 rounded-xl bg-emerald-600 text-white font-medium shadow-md hover:shadow-xl hover:bg-emerald-700 transition inline-flex items-center justify-center gap-2"
              >
                Continue as Student <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="/faculty/login"
                className="px-9 py-4 rounded-xl border border-slate-300 bg-white/60 text-slate-700 font-medium hover:bg-white transition inline-flex items-center justify-center"
              >
                Continue as Faculty / HOD
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.05 }}
            className="hidden lg:block"
          >
            <div className="bg-white/70 border border-slate-200 rounded-3xl shadow-xl p-6">
              <img
                src={Students}
                alt="Student and faculty portal view"
                className="w-full max-h-[62vh] object-contain rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= MODULES ================= */}
      <section
        id="modules"
        className="min-h-screen md:h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col overflow-hidden"
      >
        <div className="pt-14 pb-8 px-6 text-center shrink-0">
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
            <p className="text-slate-500 mt-3">
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
                className={`w-full mb-3 p-4 rounded-xl flex items-center gap-3 transition ${
                  active === i
                    ? "bg-white shadow-md border border-slate-200"
                    : "hover:bg-white/70"
                }`}
              >
                <div className={`p-2 rounded-lg ${m.bg}`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <span className="font-medium text-slate-900">{m.title}</span>
              </button>
            ))}
          </div>

          {/* RIGHT */}
          <div className="flex-1 bg-white rounded-3xl shadow-xl border mb-9 border-slate-200 overflow-hidden">
            <img
              src={modules[active].image}
              alt={modules[active].alt}
              className="w-full h-80 object-contain bg-slate-50"
            />
            <div className="p-8">
              <p className="text-slate-600 text-lg leading-relaxed">
                {modules[active].description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INSTITUTION ADMIN LOGIN / SIGNUP ================= */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-indigo-50 to-slate-50">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="order-1 lg:order-2"
          >
            <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
              Institution Admin
              <br />
              <span className="text-indigo-600">Login or Register</span>
            </h2>

            <p className="mt-7 text-lg text-slate-600 max-w-xl leading-relaxed">
              Register your institution, create departments, assign roles, and
              control governance workflows with permanent audit trails.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="/institution/login"
                className="px-9 py-4 rounded-xl bg-indigo-600 text-white font-medium shadow-md hover:shadow-xl hover:bg-indigo-700 transition inline-flex items-center justify-center gap-2"
              >
                Login as Institution Admin <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="/institution/signup"
                className="px-9 py-4 rounded-xl border border-slate-300 bg-white/60 text-slate-700 font-medium hover:bg-white transition inline-flex items-center justify-center"
              >
                Register Institution
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.05 }}
            className="hidden lg:block order-2 lg:order-1"
          >
            <div className="bg-white/70 border border-slate-200 rounded-3xl shadow-xl p-6">
              <img
                src={Admin}
                alt="Institution admin management view"
                className="w-full max-h-[62vh] object-contain rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
