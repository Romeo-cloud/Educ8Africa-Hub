import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  HiHome, HiAcademicCap, HiUsers, HiCreditCard,
  HiCurrencyDollar, HiArrowRightOnRectangle, HiShieldCheck,
} from "react-icons/hi2";

const menuItems = [
  { label: "Dashboard", to: "/admin", icon: HiHome, end: true },
  { label: "Courses", to: "/admin/courses", icon: HiAcademicCap },
  { label: "Users", to: "/admin/users", icon: HiUsers },
  { label: "Payments", to: "/admin/payments", icon: HiCreditCard },
  { label: "Referrals", to: "/admin/referrals", icon: HiCurrencyDollar },
];

export default function AdminSidebar({ mobile, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={mobile ? { x: -300 } : false}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className={`admin-sidebar ${mobile ? "admin-sidebar-mobile" : ""}`}
    >
      <div className="sidebar-header">
        <div className="sidebar-header-avatar" style={{ background: "linear-gradient(135deg, var(--primary-500), var(--accent))" }}>
          <HiShieldCheck style={{ width: 24, height: 24 }} />
        </div>
        <div className="sidebar-header-info">
          <p className="sidebar-header-name" style={{ color: "var(--white)" }}>Admin Panel</p>
          <p className="sidebar-header-email">Educ8Africa Hub</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => `admin-sidebar-link ${isActive ? "admin-sidebar-link-active" : ""}`}
          >
            <item.icon style={{ width: 20, height: 20 }} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTopColor: "var(--gray-800)" }}>
        <button onClick={() => { logout(); navigate("/"); }} className="sidebar-logout" style={{ color: "#f87171" }}>
          <HiArrowRightOnRectangle style={{ width: 20, height: 20 }} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}