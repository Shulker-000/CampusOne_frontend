import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function VerifyAdmissionEmail() {

    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {

        if (!token) {
            toast.error("Invalid verification link");
            navigate("/admission/login");
            return;
        }

        let mounted = true;

        const verify = async () => {

            try {

                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/admissions/verify-email/${token}`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                let data = {};
                try {
                    data = await res.json();
                } catch {
                    throw new Error("Invalid server response");
                }

                if (!res.ok) throw new Error(data.message || "Verification failed");

                if (!mounted) return;

                toast.success("Email verified successfully");

                setTimeout(() => {
                    navigate("/admission/login");
                }, 2500);

            } catch (err) {

                if (!mounted) return;

                toast.error(err.message || "Verification failed");

                setTimeout(() => {
                    navigate("/admission/login");
                }, 3000);
            }

        };

        verify();

        return () => {
            mounted = false;
        };

    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
        </div>
    );
}