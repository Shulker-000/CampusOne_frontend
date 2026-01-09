import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Building2, User } from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";

const ContactPage = () => {
    const formRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);

        emailjs
            .sendForm(
                import.meta.env.VITE_EMAIL_SERVICE_ID,
                import.meta.env.VITE_EMAIL_TEMPLATE_ID,
                formRef.current,
                import.meta.env.VITE_EMAIL_PUBLIC_KEY
            )
            .then(() => {
                toast.success("Message sent successfully!");
                formRef.current.reset();
            })
            .catch((err) => {
                console.error("EmailJS Error:", err);
                toast.error("Failed to send message. Please try again.");
            })
            .finally(() => setLoading(false));
    };

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-br from-indigo-50 via-white to-emerald-50">
            {/* Background accents */}
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
                        deployment discussion, reach out with your requirements.
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
                    <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
                        {/* SUBJECT TITLE */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Institute / Organization Name
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="e.g. XYZ University"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* FROM NAME */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Your Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="John Doe"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Official Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="name@institution.edu"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* MESSAGE */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Message
                            </label>
                            <textarea
                                rows={4}
                                name="message"
                                required
                                placeholder="Briefly describe your requirement"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 resize-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* TIME (HIDDEN) */}
                        <input
                            type="hidden"
                            name="time"
                            value={new Date().toLocaleString()}
                        />

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 text-white font-medium py-4 shadow-md hover:shadow-xl transition disabled:opacity-60"
                        >
                            {loading ? "Sending..." : "Send Message"}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactPage;
