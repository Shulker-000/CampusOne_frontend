import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 rounded-full border-4 animate-spin"
          style={{
            borderColor: "var(--border)",
            borderTopColor: "var(--accent)",
          }}
        />
        <p className="text-sm font-semibold text-[var(--muted-text)]">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
