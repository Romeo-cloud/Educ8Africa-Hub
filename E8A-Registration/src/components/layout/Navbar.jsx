import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { HiBars3, HiXMark, HiMoon, HiSun, HiAcademicCap } from "react-icons/hi2";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { label: "Home", to: "/" },
    { label: "Courses", to: "/courses" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar glass">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <HiAcademicCap style={{ width: 20, height: 20 }} />
          </div>
          <span className="navbar-logo-text gradient-text">Educ8Africa Hub</span>
        </Link>

        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${isActive(link.to) ? "navbar-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <button onClick={toggleTheme} className="btn-icon">
            {dark ? <HiSun style={{ width: 20, height: 20, color: "#fbbf24" }} /> : <HiMoon style={{ width: 20, height: 20 }} />}
          </button>

          {user ? (
            <>
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="btn-ghost"
                style={{ fontSize: 14 }}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="btn-ghost btn-danger-ghost"
                style={{ fontSize: 14 }}
              >
                Logout
              </button>
              <div className="navbar-user-avatar">
                {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost" style={{ fontSize: 14 }}>
                Login
              </Link>
              <Link to="/signup" className="btn-primary" style={{ fontSize: 14, padding: "8px 16px" }}>
                Get Started
              </Link>
            </>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-toggle" aria-label="Toggle menu">
            {mobileOpen ? <HiXMark style={{ width: 24, height: 24 }} /> : <HiBars3 style={{ width: 24, height: 24 }} />}
          </button>
        </div>
      </div>

      {/* FIXED MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="mobile-menu"
            // Critical fixes:
            style={{
              overflow: "hidden",        // prevents content flash
              display: "block",          // ensures it's in flow
            }}
          >
            <div className="mobile-menu-inner">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`mobile-menu-link ${isActive(link.to) ? "mobile-menu-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mobile-menu-divider" />

              {user ? (
                <>
                  <Link
                    to={user.role === "admin" ? "/admin" : "/dashboard"}
                    onClick={() => setMobileOpen(false)}
                    className="mobile-menu-link"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                      setMobileOpen(false);
                    }}
                    className="mobile-menu-link"
                    style={{ color: "var(--danger)", textAlign: "left", width: "100%" }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="mobile-menu-link">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary btn-full"
                    style={{ marginTop: 12, display: "block", textAlign: "center" }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}