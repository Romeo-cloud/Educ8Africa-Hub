import React from "react";
import { motion } from "framer-motion";

export function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: 20, md: 32, lg: 48, xl: 64 };
  const s = sizes[size] || sizes.md;

  return (
    <svg
      className={className}
      style={{ animation: "spin 1s linear infinite", width: s, height: s }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function Loader({ text = "Loading..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
        gap: 16,
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: "50%",
            border: "4px solid var(--gray-200)",
          }}
        />
        <div
          style={{
            position: "absolute", top: 0, left: 0,
            width: 64, height: 64, borderRadius: "50%",
            border: "4px solid transparent",
            borderTopColor: "var(--primary-500)",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500, animation: "pulse 2s ease-in-out infinite" }}>
        {text}
      </p>
    </motion.div>
  );
}

export function PageLoader() {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
      }}
    >
      <Loader text="Please wait..." />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ height: 160, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 16, width: "75%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 40 }} />
    </div>
  );
}