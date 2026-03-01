import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  HiHome,
  HiAcademicCap,
  HiCurrencyDollar,
  HiCreditCard,
  HiUser,
  HiArrowRightOnRectangle,
  HiStar,
} from "react-icons/hi2";

// Menu items for regular users
const userMenuItems = [
  { label: "Dashboard", to: "/dashboard", icon: HiHome, end: true },
  { label: "My Courses", to: "/dashboard/courses", icon: HiAcademicCap },
  { label: "Payments", to: "/dashboard/payment", icon: HiCreditCard },
  { label: "Profile", to: "/dashboard/profile", icon: HiUser },
];

// Menu items for ambassadors (includes referral earnings)
const ambassadorMenuItems = [
  { label: "Dashboard", to: "/dashboard", icon: HiHome, end: true },
  { label: "My Courses", to: "/dashboard/courses", icon: HiAcademicCap },
  { label: "Referral Earnings", to: "/dashboard/referrals", icon: HiCurrencyDollar },
  { label: "Payments", to: "/dashboard/payment", icon: HiCreditCard },
  { label: "Profile", to: "/dashboard/profile", icon: HiUser },
];

export default function Sidebar({ mobile = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Determine menu items based on user role
  // Ambassador role is 'ambassador', admin is 'admin', regular user is 'user'
  const userRole = user?.role?.toLowerCase() || 'user';
  const isAmbassador = userRole === 'ambassador';
  const menuItems = isAmbassador ? ambassadorMenuItems : userMenuItems;

  const handleLogout = () => {
    logout();
    navigate("/");
    onClose();
  };

  return (
    <motion.aside
      // ✅ 1. YOUR RESTORED ANIMATIONS
      initial={mobile ? { x: "-100%" } : false}
      animate={{ x: 0 }}
      exit={mobile ? { x: "-100%" } : false}
      transition={{ type: "spring", damping: 25, stiffness: 250 }} // Smooth spring
      
      className="sidebar"
      
      // ✅ 2. CRITICAL VISIBILITY FIX
      style={{
        // Override CSS 'display: none' on mobile
        display: mobile ? "flex" : undefined, 
        // Ensure it fits the wrapper
        width: mobile ? "100%" : undefined,
        height: "100%",
        // Remove double borders/shadows on mobile (wrapper has them)
        boxShadow: mobile ? "none" : undefined,
        border: mobile ? "none" : undefined,
      }}
    >
      {/* ─── HEADER (Avatar & Info) ─── */}
      <div className="sidebar-header">
        <div className="sidebar-header-avatar">
          {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="sidebar-header-info">
          <p className="sidebar-header-name">{user?.full_name || "Guest User"}</p>
          <p className="sidebar-header-email">{user?.email || "guest@Educ8Africa Hub.com"}</p>
          {/* Show ambassador badge if user is an ambassador */}
          {isAmbassador && (
            <div className="ambassador-badge">
              <HiStar style={{ width: 12, height: 12 }} />
              <span>Ambassador</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── NAVIGATION LINKS ─── */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? false}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <item.icon className="sidebar-link-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ─── FOOTER (Logout) ─── */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout">
          <HiArrowRightOnRectangle className="sidebar-link-icon" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
