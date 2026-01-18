import React from "react";

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-slate-300 border-t-indigo-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-700">{text}</p>
            </div>
        </div>
    );
};

export default Loader;
