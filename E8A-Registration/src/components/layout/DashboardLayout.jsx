import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom"; // Added Navigate
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext"; // Added useAuth
import { useTheme } from "../../context/ThemeContext";
import { HiBars3, HiMoon, HiSun, HiBell } from "react-icons/hi2";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth(); // Get user from context
  const { dark, toggleTheme } = useTheme();

  // ── FIX: Redirect Admins to Admin Panel ──
  // If an admin tries to access the user dashboard, send them to /admin
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </>
        )}
      </AnimatePresence>

      <div className="dashboard-main">
        <header className="topbar">
          <button onClick={() => setMobileOpen(true)} className="topbar-mobile-toggle">
            <HiBars3 style={{ width: 24, height: 24, color: "var(--text-secondary)" }} />
          </button>
          
          <h2 className="topbar-title">Welcome back! 👋</h2>
          
          <div className="topbar-actions">
            <button className="btn-icon" style={{ position: "relative" }}>
              <HiBell style={{ width: 20, height: 20, color: "var(--gray-500)" }} />
              <span className="notification-dot" />
            </button>
            <button onClick={toggleTheme} className="btn-icon">
              {dark ? (
                <HiSun style={{ width: 20, height: 20, color: "#fbbf24" }} />
              ) : (
                <HiMoon style={{ width: 20, height: 20 }} />
              )}
            </button>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}