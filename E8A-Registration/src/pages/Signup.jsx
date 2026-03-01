import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Spinner } from "../components/ui/Loader";
import { HiAcademicCap, HiEye, HiEyeSlash } from "react-icons/hi2";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ← you had this, but wasn't used correctly

  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Optional: password match check
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await signup({
        full_name: form.name.trim(),        // ← correct field name
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone.trim(),    // ← correct field name
      });

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.message || "Signup failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left" style={{ background: "linear-gradient(135deg, var(--secondary-500), var(--primary-600), var(--primary-500))" }}>
        <div className="auth-panel-left-bg" />
        <div className="blob blob-white" style={{ top: 80, right: 80, width: 256, height: 256 }} />
        <div className="auth-panel-left-content">
          <Link to="/" className="auth-panel-left-logo">
            <div className="auth-panel-left-logo-icon"><HiAcademicCap style={{ width: 28, height: 28 }} /></div>
            <span className="auth-panel-left-logo-text">Educ8Africa Hub</span>
          </Link>
          <h2>Start Learning Today</h2>
          <p>Create your account and join thousands of students building high-income skills.</p>
        </div>
      </div>

      <div className="auth-panel-right">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-form-wrapper">
          <div className="auth-mobile-logo">
            <Link to="/" className="auth-mobile-logo-inner">
              <div className="icon-box icon-box-md icon-box-gradient" style={{ borderRadius: "var(--radius-xl)" }}>
                <HiAcademicCap style={{ width: 24, height: 24, color: "var(--white)" }} />
              </div>
              <span className="gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>Educ8Africa Hub</span>
            </Link>
          </div>

          <div className="card auth-form-card">
            <div className="auth-form-header">
              <h1>Create Account</h1>
              <p>Fill in your details to get started</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={submit} className="form-space">
              <div>
                <label className="input-label">Full Name</label>
                <input name="name" value={form.name} onChange={handle} placeholder="John Doe" className="input-field" required />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" className="input-field" required />
              </div>
              <div>
                <label className="input-label">Phone</label>
                <input name="phone" type="tel" value={form.phone} onChange={handle} placeholder="08012345678" className="input-field" required />
              </div>
              <div>
                <label className="input-label">Password</label>
                <div className="input-group">
                  <input
                    name="password"
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={handle}
                    placeholder="••••••••"
                    className="input-field"
                    style={{ paddingRight: 48 }}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="input-icon-right">
                    {showPw ? <HiEyeSlash style={{ width: 20, height: 20 }} /> : <HiEye style={{ width: 20, height: 20 }} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="input-label">Confirm Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} placeholder="••••••••" className="input-field" required />
              </div>

              <button type="submit" disabled={loading} className="btn-primary btn-full" style={{ gap: 8 }}>
                {loading && <Spinner size="sm" />}
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p className="auth-form-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}