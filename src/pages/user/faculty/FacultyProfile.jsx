import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import Loader from "../../../components/Loader.jsx";

/* ================= IMAGE HELPERS ================= */

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
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

export default function FacultyProfile() {
    const backend = import.meta.env.VITE_BACKEND_URL;
    const fileInputRef = useRef(null);

    const userGlobal = useSelector((s) => s.auth.user.data);
    const isFaculty = userGlobal?.role === "Faculty";

    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);

    /* avatar */
    const [isAvatarViewOpen, setIsAvatarViewOpen] = useState(false);
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);

    /* ================= FETCH ================= */

    const fetchFaculty = async () => {
        try {
            setLoading(true);

            const res1 = await fetch(`${backend}/api/users/faculty`, {
                credentials: "include",
            });
            const data1 = await res1.json();
            if (!res1.ok) throw new Error(data1.message);

            const res2 = await fetch(
                `${backend}/api/faculties/${data1.data._id}`,
                { credentials: "include" }
            );
            const data2 = await res2.json();
            if (!res2.ok) throw new Error(data2.message);

            setFaculty(data2.data);
        } catch (err) {
            toast.error(err.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    /* ================= UX FIXES ================= */

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                setIsAvatarViewOpen(false);
                setIsCropOpen(false);
                setImageSrc(null);
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    useEffect(() => {
        if (isAvatarViewOpen || isCropOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isAvatarViewOpen, isCropOpen]);

    /* ================= AVATAR ================= */

    const onSelectFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setIsCropOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const onCropSave = async () => {
        try {
            setIsAvatarUpdating(true);

            const blob = await getCroppedImage(imageSrc, croppedAreaPixels);

            const fd = new FormData();
            fd.append("avatar", blob, "avatar.webp");

            const res = await fetch(`${backend}/api/users/update-avatar`, {
                method: "POST",
                credentials: "include",
                body: fd,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Avatar updated");

            setImageSrc(null);
            setIsCropOpen(false);
            fetchFaculty();
        } catch {
            toast.error("Avatar update failed");
        } finally {
            setIsAvatarUpdating(false);
        }
    };

    /* ================= UI ================= */

    if (loading) return <Loader />;
    if (!faculty) return null;

    const user = faculty.userId;

    return (
        <div className="p-6 max-w-5xl mx-auto">

            {/* HEADER */}
            <h1 className="text-2xl font-bold mb-6">Profile</h1>

            {/* AVATAR */}
            <div className="flex items-center gap-6 mb-8">
                <div
                    onClick={() => setIsAvatarViewOpen(true)}
                    className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer border border-[var(--border-color)]"
                >
                    <img src={user?.avatar} className="w-full h-full object-cover" />

                    {isAvatarUpdating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 className="animate-spin text-white" />
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-bold">{user?.name}</h2>
                    <p className="text-[var(--muted-text)]">{user?.email}</p>
                </div>
            </div>

            {/* DETAILS */}
            <div className="grid md:grid-cols-2 gap-6 border border-[var(--border-color)] p-6 rounded-xl bg-[var(--card-bg)]">

                <Field label="Name" value={user?.name} />
                <Field label="Phone" value={user?.phone} />
                <Field label="Email" value={user?.email} />
                <Field label="Designation" value={faculty.designation} />
                <Field label="Department" value={faculty.departmentId?.name} />
                <Field
                    label="Date of Joining"
                    value={
                        faculty.dateOfJoining
                            ? new Date(faculty.dateOfJoining).toLocaleDateString()
                            : ""
                    }
                />
            </div>

            {/* AVATAR VIEW MODAL */}
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
                            className="bg-[var(--bg)] text-[var(--text)] border border-[var(--border-color)] p-6 rounded-2xl shadow-xl"
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                        >
                            <img
                                src={user?.avatar}
                                className="w-72 h-72 rounded-full object-cover border border-[var(--border-color)]"
                            />

                            {isFaculty && (
                                <button
                                    onClick={() => {
                                        setIsAvatarViewOpen(false);
                                        setTimeout(() => {
                                            fileInputRef.current.click();
                                        }, 0);
                                    }}
                                    className="mt-5 w-full px-6 py-2 text-[var(--text)] rounded-full bg-[var(--primary)] font-semibold"
                                >
                                    Change Avatar
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CROP MODAL */}
            <AnimatePresence>
                {isCropOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl w-full max-w-md shadow-xl">
                            <div className="h-80 relative">
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

                            <div className="flex gap-4 mt-4 justify-center">
                                <button
                                    onClick={() => {
                                        setImageSrc(null);
                                        setIsCropOpen(false);
                                    }}
                                    className="px-6 py-2 rounded-full bg-gray-500 text-white"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={onCropSave}
                                    disabled={isAvatarUpdating}
                                    className="px-6 py-2 rounded-full bg-[var(--primary)] text-white"
                                >
                                    {isAvatarUpdating ? "Saving..." : "Save"}
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

/* ================= FIELD ================= */

const Field = ({ label, value }) => (
    <div>
        <label className="text-xs text-[var(--muted-text)]">{label}</label>
        <input
            disabled
            value={value || ""}
            className="w-full mt-1 px-3 py-2 rounded-lg border
            bg-[var(--card-bg)] text-[var(--text-primary)]
            border-[var(--border-color)] opacity-80"
        />
    </div>
);