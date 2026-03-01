import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

const colorMap = {
  primary: {
    iconBg: "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
    iconColor: "var(--white)",
    accent: "var(--primary-500)",
    lightBg: "var(--primary-50)",
  },
  secondary: {
    iconBg: "linear-gradient(135deg, var(--secondary-500), var(--secondary-600))",
    iconColor: "var(--white)",
    accent: "var(--secondary-500)",
    lightBg: "var(--secondary-50)",
  },
  success: {
    iconBg: "linear-gradient(135deg, #22c55e, #16a34a)",
    iconColor: "var(--white)",
    accent: "#22c55e",
    lightBg: "var(--success-light)",
  },
  warning: {
    iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
    iconColor: "var(--white)",
    accent: "#f59e0b",
    lightBg: "var(--warning-light)",
  },
  danger: {
    iconBg: "linear-gradient(135deg, #ef4444, #dc2626)",
    iconColor: "var(--white)",
    accent: "#ef4444",
    lightBg: "var(--danger-light)",
  },
  purple: {
    iconBg: "linear-gradient(135deg, #9333ea, #7c3aed)",
    iconColor: "var(--white)",
    accent: "#9333ea",
    lightBg: "rgba(147,51,234,0.1)",
  },
};

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color = "primary", 
  prefix = "", 
  suffix = "", 
  subtitle = "",
  index = 0,
  trend = null // { value: number, isPositive: boolean }
}) {
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="stats-card"
      style={{
        padding: "24px",
        background: "var(--card-bg)",
        borderRadius: "var(--radius-2xl)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-card)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background accent */}
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "100px",
        height: "100px",
        background: c.lightBg,
        borderRadius: "50%",
        transform: "translate(30%, -30%)",
        opacity: 0.5,
      }} />

      <div style={{ 
        display: "flex", 
        alignItems: "flex-start", 
        justifyContent: "space-between",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: 13, 
            fontWeight: 600, 
            color: "var(--text-secondary)", 
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            {title}
          </p>
          <div style={{ 
            display: "flex", 
            alignItems: "baseline", 
            gap: 4,
            flexWrap: "wrap",
          }}>
            {prefix && (
              <span style={{ 
                fontSize: 18, 
                fontWeight: 600, 
                color: c.accent,
              }}>
                {prefix}
              </span>
            )}
            <span style={{ 
              fontSize: 32, 
              fontWeight: 800, 
              color: "var(--text-primary)",
              lineHeight: 1.2,
              fontFamily: "'Inter', sans-serif",
            }}>
              {typeof value === "number" ? (
                <CountUp end={value} duration={1.5} separator="," />
              ) : (
                value
              )}
            </span>
            {suffix && (
              <span style={{ 
                fontSize: 14, 
                fontWeight: 500, 
                color: "var(--text-secondary)",
              }}>
                {suffix}
              </span>
            )}
          </div>
          
          {/* Optional subtitle */}
          {subtitle && (
            <p style={{ 
              fontSize: 12, 
              color: "var(--text-muted)", 
              marginTop: 8,
            }}>
              {subtitle}
            </p>
          )}

          {/* Optional trend indicator */}
          {trend && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 4, 
              marginTop: 8,
            }}>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: trend.isPositive ? "#22c55e" : "#ef4444",
              }}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                vs last month
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "var(--radius-xl)",
            background: c.iconBg,
            color: c.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${c.accent}40`,
            flexShrink: 0,
          }}
        >
          {Icon && <Icon style={{ width: 26, height: 26 }} />}
        </div>
      </div>
    </motion.div>
  );
}
