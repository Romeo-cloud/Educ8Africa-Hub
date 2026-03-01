import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark } from "react-icons/hi2";

const sizeMap = { sm: 448, md: 512, lg: 672, xl: 896 };

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "relative", width: "100%", maxWidth: sizeMap[size],
              background: "var(--card-bg)", borderRadius: "var(--radius-2xl)",
              boxShadow: "var(--shadow-2xl)", overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid var(--card-border)",
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{title}</h3>
              <button
                onClick={onClose}
                style={{
                  padding: 8, borderRadius: "var(--radius-lg)",
                  transition: "var(--transition)", cursor: "pointer",
                  display: "flex", background: "none", border: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <HiXMark style={{ width: 20, height: 20, color: "var(--gray-500)" }} />
              </button>
            </div>
            <div style={{ padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}