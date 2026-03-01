import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../context/ToastContext";
import {
  HiCheckCircle,
  HiXCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXMark,
} from "react-icons/hi2";

const icons = {
  success: HiCheckCircle,
  error: HiXCircle,
  warning: HiExclamationTriangle,
  info: HiInformationCircle,
};

const toastStyles = {
  success: {
    borderLeft: "4px solid #22c55e",
    background: "var(--success-light)",
    color: "#15803d",
  },
  error: {
    borderLeft: "4px solid var(--danger)",
    background: "var(--danger-light)",
    color: "#b91c1c",
  },
  warning: {
    borderLeft: "4px solid var(--warning)",
    background: "var(--warning-light)",
    color: "#b45309",
  },
  info: {
    borderLeft: "4px solid var(--info)",
    background: "var(--info-light)",
    color: "#1e40af",
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      style={{
        position: "fixed", top: 16, right: 16, zIndex: 9999,
        maxWidth: 384, width: "100%", pointerEvents: "none",
        display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || icons.info;
          const style = toastStyles[toast.type] || toastStyles.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              style={{
                ...style,
                pointerEvents: "auto",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: 16,
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <Icon style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ flexShrink: 0, opacity: 0.6, cursor: "pointer", background: "none", border: "none", color: "inherit" }}
              >
                <HiXMark style={{ width: 16, height: 16 }} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}