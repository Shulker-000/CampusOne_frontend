import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admissions = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center px-6 py-12">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl shadow-xl p-10 w-full max-w-xl text-center"
      >

        <div className="mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Campus Admissions
          </h1>

          <p className="text-slate-600 mt-2">
            Start a new admission application or continue an existing one
          </p>
        </div>

        <div className="space-y-4">

          <button
            onClick={() => navigate("/admission/institutions")}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <GraduationCap size={18} />
            Fresh Admission
          </button>

          <button
            onClick={() => navigate("/admission/login")}
            className="w-full py-3 rounded-xl border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            Login Application
          </button>

        </div>

      </motion.div>

    </section>
  );
};

export default Admissions;