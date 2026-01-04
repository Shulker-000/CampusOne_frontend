import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, X, Save } from "lucide-react";
import { toast } from "react-toastify";

/**
 * CampusOne Institution Change Password Modal
 * - Cookie based auth
 * - Forces logout after success
 */
const InstitutionChangePasswordModal = ({ isVisible, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdate = async () => {
        setError("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/institutions/change-password`,
                {
                    method: "POST",
                    credentials: "include", // 🔑 COOKIE AUTH
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Password updated. Please login again.");

            // 🔥 HARD LOGOUT AFTER PASSWORD CHANGE
            localStorage.clear();
            sessionStorage.clear();

            setTimeout(() => {
                window.location.href = "/institution/login";
            }, 1500);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to update password.");
            toast.error(err.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="fixed top-1/2 left-1/2 bg-white rounded-xl shadow-2xl z-50 w-[90vw] max-w-lg"
                        initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Change Password</h3>
                            <button onClick={onClose}>
                                <X size={22} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate();
                            }}
                            className="p-6 space-y-5"
                        >
                            {[{
                                label: "Current Password",
                                value: currentPassword,
                                setValue: setCurrentPassword,
                                placeholder: "Enter current password",
                            }, {
                                label: "New Password",
                                value: newPassword,
                                setValue: setNewPassword,
                                placeholder: "Enter new password",
                            }, {
                                label: "Confirm New Password",
                                value: confirmPassword,
                                setValue: setConfirmPassword,
                                placeholder: "Re-enter new password",
                            }].map(({ label, value, setValue, placeholder }) => (
                                <div key={label} className="relative">
                                    <label className="text-sm font-medium">{label}</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-xl pr-10"
                                        placeholder={placeholder}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-8 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            ))}

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 rounded-full bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 rounded-full bg-blue-600 text-white flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? "Updating..." : <><Save size={16} /> Update</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default InstitutionChangePasswordModal;
