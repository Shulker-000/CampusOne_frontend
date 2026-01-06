import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

/* ---------------- MOBILE MENU ---------------- */

const MobileMenu = ({ open, onClose, links, actions }) => {
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "unset";
        return () => (document.body.style.overflow = "unset");
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-60 lg:hidden">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
                <div className="h-16 px-4 flex items-center justify-between border-b">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" className="h-8" alt="CampusOne" />
                        <span className="font-bold text-lg">CampusOne</span>
                    </div>
                    <button onClick={onClose}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    {links.map((r) => (
                        <Link
                            key={r.to}
                            to={r.to}
                            onClick={onClose}
                            className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100"
                        >
                            {r.label}
                        </Link>
                    ))}
                </div>

                {actions && (
                    <div className="border-t p-4 space-y-3">
                        {actions.map((a) => (
                            <Link
                                key={a.to}
                                to={a.to}
                                onClick={onClose}
                                className={a.className}
                            >
                                {a.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ---------------- BASE NAVBAR ---------------- */

const BaseNavbar = ({ centerLinks, actions, logoLink }) => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const [visible, setVisible] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const timeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    /* -------- Auto-hide (desktop) -------- */
    useEffect(() => {
        if (isMobile) return;

        const resetTimer = () => {
            setVisible(true);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setVisible(false);
            }, 3000);
        };

        const events = ["mousemove", "scroll", "keydown"];
        events.forEach((e) =>
            window.addEventListener(e, resetTimer, { passive: true })
        );

        resetTimer();

        return () => {
            events.forEach((e) =>
                window.removeEventListener(e, resetTimer)
            );
            clearTimeout(timeoutRef.current);
        };
    }, [isMobile]);

    /* -------- Click outside dropdown -------- */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setAuthOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <>
            <nav
                className={`
          fixed top-0 left-0 w-full z-50
          transition-all duration-500 ease-out
          ${!isMobile && !visible ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}
        `}
            >
                <div className="h-16 px-6 flex items-center backdrop-blur-xl bg-white/30 border-b border-white/20">
                    {/* LEFT */}
                    <Link to={logoLink} className="flex items-center gap-2">
                        <img src="/logo.png" className="h-8" alt="CampusOne" />
                        <span className="font-bold text-lg">CampusOne</span>
                    </Link>

                    {/* CENTER */}
                    <div className="hidden lg:flex flex-1 justify-center gap-10 text-sm font-semibold">
                        {centerLinks.map((r) => (
                            <Link
                                key={r.to}
                                to={r.to}
                                className="text-slate-700 hover:text-indigo-600"
                            >
                                {r.label}
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT */}
                    <div className="ml-auto hidden lg:flex items-center gap-4" ref={dropdownRef}>
                        {actions?.type === "dropdown" && (
                            <div className="relative">
                                <button
                                    onClick={() => setAuthOpen(v => !v)}
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
                                >
                                    {actions.label}
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {authOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl">
                                        {actions.items.map((i) => (
                                            <Link
                                                key={i.to}
                                                to={i.to}
                                                onClick={() => setAuthOpen(false)}
                                                className="block px-4 py-3 text-sm hover:bg-indigo-50"
                                            >
                                                {i.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {actions?.type === "links" &&
                            actions.items.map((i) => (
                                <Link key={i.to} to={i.to} className={i.className}>
                                    {i.label}
                                </Link>
                            ))}
                    </div>

                    <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            <MobileMenu
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                links={centerLinks}
                actions={actions?.mobile}
            />
        </>
    );
};

export default BaseNavbar;
