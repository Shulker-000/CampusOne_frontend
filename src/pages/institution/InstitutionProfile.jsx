import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import {
    Camera,
    LogOut,
    Mail,
    CheckCircle,
    AlertCircle,
    Crop,
    Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

import { useAuth } from "../../providers/AuthProvider.jsx";
import Loader from "../../components/Loader.jsx";

/* ================= IMAGE HELPERS ================= */

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.crossOrigin = "anonymous";
        img.src = url;
    });

async function getCroppedImage(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/webp"));
}

/* ================= COMPONENT ================= */

export default function InstitutionProfile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const { tokens, logoutInstitution } = useAuth();

    const [institution, setInstitution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [isVerifying, setIsVerifying] = useState(false);
    const [isAvatarViewOpen, setIsAvatarViewOpen] = useState(false);
    const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);

    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    /* ================= FETCH ================= */

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                if (!tokens.institutionToken) {
                    setLoading(false);
                    toast.error("Not logged in");
                    navigate("/institution/login", { replace: true });
                    return;
                }

                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/institutions/current-institution`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokens.institutionToken}`,
                        },
                    }
                );

                if (res.status === 401) {
                    toast.error("Session expired");
                    logoutInstitution();
                    navigate("/institution/login", { replace: true });
                    return;
                }

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                setInstitution(data.data);
            } catch {
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchInstitution();
    }, [navigate, tokens.institutionToken, logoutInstitution]);

    /* ================= CLOCK ================= */

    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    const getGreeting = () => {
        const h = currentTime.getHours();
        if (h < 12) return "Good Morning";
        if (h < 16) return "Good Afternoon";
        return "Good Evening";
    };

    /* ================= EMAIL VERIFY ================= */

    const handleSendVerificationEmail = async () => {
        setIsVerifying(true);
        try {
            if (!tokens.institutionToken) {
                toast.error("Not logged in");
                return;
            }

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/institutions/send-email-verification`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${tokens.institutionToken}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Verification email sent");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    /* ================= AVATAR ================= */

    const onSelectFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result);
        reader.readAsDataURL(file);
    };

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const onCropSave = async () => {
        try {
            if (!tokens.institutionToken) {
                toast.error("Not logged in");
                return;
            }

            setIsAvatarUpdating(true);
            const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
            const fd = new FormData();
            fd.append("avatar", blob, "avatar.webp");

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/institutions/update-avatar`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${tokens.institutionToken}`,
                    },
                    body: fd,
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setInstitution(data.data);
            setImageSrc(null);
            toast.success("Avatar updated");
        } catch (err) {
            toast.error(err.message || "Avatar update failed");
        } finally {
            setIsAvatarUpdating(false);
        }
    };

    /* ================= LOGOUT ================= */

    const handleLogout = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            await fetch(`${backendUrl}/api/institutions/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${tokens.institutionToken}`,
                },
            });
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            logoutInstitution();
            toast.success("Logged Out");
            navigate("/institution/login", { replace: true });
        }
    };

    /* ================= UI ================= */

    if (loading) return <Loader />;

    if (!institution) return null;

    return (
        <div className="min-h-screen w-full md:w-[80vw] mx-auto pt-16 p-6 bg-[var(--bg)] text-[var(--text)]">
            {/* TOP */}
            <div className="mb-6">
                <h1 className="text-2xl mt-2 font-bold">
                    {getGreeting()}, {institution.name}!
                </h1>
                <p className="text-sm text-[var(--muted-text)]">
                    {currentTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pt-8">
                <div
                    onClick={() => setIsAvatarViewOpen(true)}
                    className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group border border-[var(--border)]"
                >
                    <img
                        src={institution.avatar}
                        alt="Institution Avatar"
                        className={`w-full h-full object-cover ${isAvatarUpdating ? "opacity-50 blur-sm" : ""
                            }`}
                    />
                    {isAvatarUpdating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="animate-spin text-white w-8 h-8" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Camera className="text-white w-6 h-6" />
                    </div>
                </div>

                <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-[var(--text)]">{institution.name}</h2>
                    <p className="text-[var(--muted-text)]">{institution.contactEmail}</p>
                </div>
            </div>

            {/* DETAILS */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] grid md:grid-cols-2 gap-6">
                {[
                    ["Institute Name", institution.name],
                    ["Institute Code", institution.code],
                    ["Type", institution.type],
                    ["Contact Phone", institution.contactPhone],
                    ["Established Year", institution.establishedYear],
                ].map(([label, value]) => (
                    <div key={label}>
                        <label className="text-sm font-semibold text-[var(--text)]">{label}</label>
                        <input
                            disabled
                            value={value || ""}
                            className="w-full mt-2 px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface-2)] text-[var(--text)]"
                        />
                    </div>
                ))}

                <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-[var(--text)]">Address</label>
                    <textarea
                        disabled
                        rows={3}
                        value={institution.address || ""}
                        className="w-full mt-2 px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface-2)] text-[var(--text)]"
                    />
                </div>
            </div>

            {/* EMAIL */}
            <div className="mt-8 grid md:grid-cols-2 gap-6 border-t border-[var(--border)] pt-6">
                <div>
                    <label className="text-sm font-semibold text-[var(--text)]">Email</label>
                    <div className="mt-2 flex gap-2 items-center px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
                        <Mail className="text-[var(--accent)] w-5 h-5" />
                        <span className="text-[var(--text)]">{institution.contactEmail}</span>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold text-[var(--text)]">Verification</label>
                    <div className="mt-2 flex gap-2 items-center px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
                        {institution.isEmailVerified ? (
                            <>
                                <CheckCircle className="text-green-500 w-5 h-5" />{" "}
                                <span className="text-[var(--text)]">Verified</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="text-red-500 w-5 h-5" />
                                <button
                                    onClick={handleSendVerificationEmail}
                                    disabled={isVerifying}
                                    className="text-[var(--accent)] font-semibold hover:opacity-80 transition disabled:opacity-50"
                                    type="button"
                                >
                                    {isVerifying ? "Sending..." : "Send Verification"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-10 flex justify-end gap-3">
                <button
                    onClick={handleLogout}
                    className="px-6 py-2 rounded-full bg-red-600 text-white flex items-center gap-2 hover:bg-red-700 transition"
                    type="button"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {isAvatarViewOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center px-4"
                        onClick={() => setIsAvatarViewOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl shadow-[var(--shadow)]"
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                        >
                            <img
                                src={institution.avatar}
                                alt="Institution Avatar"
                                className="w-72 h-72 rounded-full object-cover border border-[var(--border)]"
                            />
                            <button
                                onClick={() => {
                                    setIsAvatarViewOpen(false);
                                    fileInputRef.current.click();
                                }}
                                className="mt-4 w-full mx-auto px-6 py-2 rounded-full bg-[var(--accent)] text-white hover:opacity-90 transition"
                                type="button"
                            >
                                Change Avatar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {imageSrc && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl w-full max-w-xl shadow-[var(--shadow)]">
                            <div className="relative h-[360px] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)]">
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape="round"
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>

                            <div className="flex gap-4 mt-4 w-full justify-center">
                                <button
                                    onClick={() => setImageSrc(null)}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 transition"
                                    type="button"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={onCropSave}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 transition"
                                    type="button"
                                >
                                    <Crop size={16} /> Crop & Save
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".jpg,.jpeg,.png,.webp"
                onChange={onSelectFile}
            />
        </div>
    );
}
