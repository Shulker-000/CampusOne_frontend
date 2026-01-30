import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";

const EditModal = ({
  open,
  title,
  confirmText,
  loading,
  onClose,
  onConfirm,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        {children}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-semibold flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditModal;
