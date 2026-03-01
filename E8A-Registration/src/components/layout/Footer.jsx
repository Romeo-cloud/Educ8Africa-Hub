import React from "react";
import { Link } from "react-router-dom";
import { HiAcademicCap } from "react-icons/hi2";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <Link to="/" className="navbar-logo" style={{ marginBottom: 0 }}>
              <div className="navbar-logo-icon">
                <HiAcademicCap style={{ width: 20, height: 20 }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "var(--white)" }}>Educ8Africa Hub</span>
            </Link>
            <p className="footer-brand-desc">
              Empowering careers through world-class tech training. Join thousands of students building the future.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-list">
              <li><Link to="/courses" className="footer-list-item">Browse Courses</Link></li>
              <li><Link to="/signup" className="footer-list-item">Create Account</Link></li>
              <li><Link to="/login" className="footer-list-item">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Programs</h4>
            <ul className="footer-list">
              <li><span className="footer-list-item">Web Development</span></li>
              <li><span className="footer-list-item">Data Science</span></li>
              <li><span className="footer-list-item">Mobile Dev</span></li>
              <li><span className="footer-list-item">UI/UX Design</span></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-list">
              <li style={{ fontSize: 14 }}>hello@Educ8Africa Hub.com</li>
              <li style={{ fontSize: 14 }}>+234 801 234 5678</li>
              <li style={{ fontSize: 14 }}>Lagos, Nigeria</li>
            </ul>
            <div className="footer-social">
              {["T", "L", "G"].map((s) => (
                <a key={s} href="#!" className="footer-social-icon">{s}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Educ8Africa Hub. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}