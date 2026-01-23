// src/components/ConfirmModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "warning" | "primary"
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onClose,
  children,
}) => {
  if (!open) return null;

  const variantStyles = {
    danger: {
      ring: "ring-red-500/20",
      iconBg: "bg-red-500/15",
      iconText: "text-red-400",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      ring: "ring-amber-500/20",
      iconBg: "bg-amber-500/15",
      iconText: "text-amber-300",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    primary: {
      ring: "ring-indigo-500/20",
      iconBg: "bg-indigo-500/15",
      iconText: "text-indigo-300",
      confirmBtn: "bg-[var(--accent)] hover:opacity-90 text-white",
    },
  };

  const v = variantStyles[variant] || variantStyles.danger;

  const disableConfirm = loading || confirmDisabled;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => !loading && onClose?.()}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.98, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.98, y: 10, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={`relative w-full max-w-md rounded-2xl border shadow-[var(--shadow)] ring-1 ${v.ring}`}
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
        >
          {/* Header */}
          <div
            className="p-5 border-b flex items-start justify-between gap-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`h-10 w-10 rounded-xl border flex items-center justify-center ${v.iconBg} ${v.iconText}`}
                style={{ borderColor: "var(--border)" }}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-bold truncate">
                  {title}
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--muted-text)" }}
                >
                  {message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => !loading && onClose?.()}
              className="h-10 w-10 rounded-xl border transition grid place-items-center hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
              }}
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          {children && (
            <div
              className="p-5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              {children}
            </div>
          )}

          {/* Footer */}
          <div className="p-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => !loading && onClose?.()}
              className="px-4 py-2.5 rounded-xl border transition text-sm font-semibold hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
              }}
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={disableConfirm}
              className={`px-4 py-2.5 rounded-xl transition text-sm font-semibold ${v.confirmBtn} ${disableConfirm ? "opacity-60 cursor-not-allowed" : ""
                }`}
              title={
                confirmDisabled
                  ? "Finish course for all faculties first"
                  : undefined
              }
            >
              {loading ? "Please wait..." : confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
