import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import { useTheme } from "../../context/ThemeContext";
import { HiBars3, HiMoon, HiSun } from "react-icons/hi2";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggleTheme } = useTheme();

  return (
    <div className="dashboard-wrapper">
      <AdminSidebar />
      <AnimatePresence>
        {mobileOpen && (
          <>
            <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            <AdminSidebar mobile onClose={() => setMobileOpen(false)} />
          </>
        )}
      </AnimatePresence>
      <div className="dashboard-main">
        <header className="topbar">
          <button onClick={() => setMobileOpen(true)} className="topbar-mobile-toggle">
            <HiBars3 style={{ width: 24, height: 24 }} />
          </button>
          <h2 className="topbar-title">Admin Control Panel</h2>
          <button onClick={toggleTheme} className="btn-icon">
            {dark ? <HiSun style={{ width: 20, height: 20, color: "#fbbf24" }} /> : <HiMoon style={{ width: 20, height: 20 }} />}
          </button>
        </header>
        <main className="content-area"><Outlet /></main>
      </div>
    </div>
  );
}