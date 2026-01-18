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

import { useAuth } from "../../providers/AuthProvider.jsx"; // ✅ ADDED
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

    return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob), "image/webp")
    );
}

/* ================= COMPONENT ================= */

export default function InstitutionProfile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const { tokens, logoutInstitution } = useAuth(); // ✅ ADDED

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
                            Authorization: `Bearer ${tokens.institutionToken}`, // ✅ ADDED
                        },
                    }
                );

                if (res.status === 401) {
                    toast.error("Session expired");
                    logoutInstitution(); // ✅ provider handles redux + localstorage
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
                        Authorization: `Bearer ${tokens.institutionToken}`, // ✅ ADDED
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
                        Authorization: `Bearer ${tokens.institutionToken}`, // ✅ ADDED
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

            // ✅ optional backend call (fine to keep)
            await fetch(`${backendUrl}/api/institutions/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${tokens.institutionToken}`, // ✅ ADDED
                },
            });
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            logoutInstitution(); // ✅ provider does everything
            toast.success("Logged Out");
            navigate("/institution/login", { replace: true });
        }
    };

    /* ================= UI ================= */

    if (loading)
        return (
            <Loader/>
        );

    if (!institution) return null;

    return (
        <div className="min-h-screen w-full md:w-[80vw] mx-auto pt-16 p-6 text-gray-800">
            {/* TOP */}
            <div className="mb-6">
                <h1 className="text-2xl mt-2 font-bold">
                    {getGreeting()}, {institution.name}!
                </h1>
                <p className="text-sm text-gray-500">
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
                    className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                >
                    <img
                        src={institution.avatar}
                        className={`w-full h-full object-cover ${isAvatarUpdating ? "opacity-50 blur-sm" : ""
                            }`}
                    />
                    {isAvatarUpdating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="animate-spin text-white w-8 h-8" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gray-400/40 opacity-0 group-hover:opacity-80 flex items-center justify-center">
                        <Camera className="text-white w-6 h-6" />
                    </div>
                </div>

                <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{institution.name}</h2>
                    <p className="text-gray-500">{institution.contactEmail}</p>
                </div>
            </div>

            {/* DETAILS */}
            <div className="p-6 rounded-xl border shadow-inner grid md:grid-cols-2 gap-6">
                {[
                    ["Institute Name", institution.name],
                    ["Institute Code", institution.code],
                    ["Type", institution.type],
                    ["Contact Phone", institution.contactPhone],
                    ["Established Year", institution.establishedYear],
                ].map(([label, value]) => (
                    <div key={label}>
                        <label className="text-sm font-medium">{label}</label>
                        <input
                            disabled
                            value={value || ""}
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                        />
                    </div>
                ))}

                <div className="md:col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <textarea
                        disabled
                        rows={3}
                        value={institution.address || ""}
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    />
                </div>
            </div>

            {/* EMAIL */}
            <div className="mt-8 grid md:grid-cols-2 gap-6 border-t pt-6">
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <div className="flex gap-2 items-center px-4 py-2 border rounded-lg">
                        <Mail className="text-blue-500 w-5 h-5" />
                        {institution.contactEmail}
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Verification</label>
                    <div className="flex gap-2 items-center px-4 py-2 border rounded-lg">
                        {institution.isEmailVerified ? (
                            <>
                                <CheckCircle className="text-green-600 w-5 h-5" /> Verified
                            </>
                        ) : (
                            <>
                                <AlertCircle className="text-red-600 w-5 h-5" />
                                <button
                                    onClick={handleSendVerificationEmail}
                                    disabled={isVerifying}
                                    className="text-blue-600"
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
                    className="px-6 py-2 rounded-full bg-red-600 text-white flex items-center gap-2"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {isAvatarViewOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center"
                        onClick={() => setIsAvatarViewOpen(false)}
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white p-6 rounded-xl"
                        >
                            <img
                                src={institution.avatar}
                                className="w-72 h-72 rounded-full object-cover"
                            />
                            <button
                                onClick={() => {
                                    setIsAvatarViewOpen(false);
                                    fileInputRef.current.click();
                                }}
                                className="mt-4 w-full mx-auto px-6 py-2 rounded-full bg-blue-600 text-white"
                            >
                                Change Avatar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {imageSrc && (
                    <motion.div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center">
                        <div className="bg-white p-6 rounded-xl w-full max-w-xl">
                            <div className="relative h-100">
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
                                    className="btn-secondary flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onCropSave}
                                    className="btn-primary flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
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
