import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") return saved;

        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
        return prefersDark ? "dark" : "light";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const value = useMemo(() => {
        return {
            theme,
            isDark: theme === "dark",
            toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        };
    }, [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
};
