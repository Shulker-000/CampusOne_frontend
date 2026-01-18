import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "primary"
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  const confirmBtn =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-indigo-600 hover:bg-indigo-700 text-white";

  const iconWrap =
    variant === "danger"
      ? "bg-red-50 text-red-600 border-red-100"
      : "bg-indigo-50 text-indigo-600 border-indigo-100";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-999 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => !loading && onClose?.()}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.96, y: 8, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.98, y: 8, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`h-10 w-10 rounded-xl border flex items-center justify-center ${iconWrap}`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{message}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => !loading && onClose?.()}
              className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 transition grid place-items-center"
              title="Close"
            >
              <X className="h-5 w-5 text-slate-700" />
            </button>
          </div>

          {/* Footer */}
          <div className="p-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => !loading && onClose?.()}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-sm font-semibold"
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2.5 rounded-xl transition text-sm font-semibold ${confirmBtn} ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
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
