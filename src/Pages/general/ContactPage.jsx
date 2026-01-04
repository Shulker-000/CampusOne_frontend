import React from "react";
import { motion } from "framer-motion";
import { Mail, Building2, User } from "lucide-react";

const ContactPage = () => {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-br from-indigo-50 via-white to-emerald-50">
            {/* Soft background accents */}
            <div className="absolute -top-32 -left-32 w-md h-md bg-indigo-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-md h-md bg-emerald-200/40 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                {/* LEFT CONTENT */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Let’s Talk About
                        <br />
                        <span className="text-indigo-600">Your Institution</span>
                    </h1>

                    <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
                        Whether you want a system walkthrough, academic evaluation, or
                        deployment discussion, reach out with your requirements. This
                        project is designed for real institutional workflows.
                    </p>

                    <div className="mt-10 space-y-4 text-slate-600">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                            <span>Universities and Institutes</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-indigo-600" />
                            <span>Admins, Faculty, and Review Panels</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-indigo-600" />
                            <span>Formal communication preferred</span>
                        </div>
                    </div>
                </motion.div>

                {/* FORM */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
                    className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-8 md:p-10"
                >
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Institute / Organization Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. XYZ University"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Official Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="name@institution.edu"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Your Role
                            </label>
                            <select className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option>Select role</option>
                                <option>University Administrator</option>
                                <option>Faculty Member</option>
                                <option>Student</option>
                                <option>Reviewer / Evaluator</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Message
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Briefly describe your requirement or query"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full mt-4 rounded-xl bg-indigo-600 text-white font-medium py-4 shadow-md hover:shadow-xl transition"
                        >
                            Send Message
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactPage;
