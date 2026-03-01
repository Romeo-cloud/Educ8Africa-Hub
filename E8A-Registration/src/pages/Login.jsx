import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Spinner } from "../components/ui/Loader";
import { HiAcademicCap, HiEye, HiEyeSlash } from "react-icons/hi2";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.warning("Please fill all fields");
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(data.user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left" style={{ background: "linear-gradient(135deg, var(--primary-500), var(--primary-600), var(--secondary-500))" }}>
        <div className="auth-panel-left-bg" />
        <div className="blob blob-white" style={{ top: 80, left: 80, width: 256, height: 256 }} />
        <div className="blob" style={{ bottom: 80, right: 80, width: 384, height: 384, background: "rgba(255,255,255,0.05)", borderRadius: "50%", filter: "blur(60px)" }} />
        <div className="auth-panel-left-content">
          <Link to="/" className="auth-panel-left-logo">
            <div className="auth-panel-left-logo-icon"><HiAcademicCap style={{ width: 28, height: 28 }} /></div>
            <span className="auth-panel-left-logo-text">Educ8Africa Hub</span>
          </Link>
          <h2>Welcome Back!</h2>
          <p>Sign in to access your courses, track referrals, and continue your learning journey.</p>
        </div>
      </div>

      <div className="auth-panel-right">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="auth-form-wrapper">
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
              <h1>Sign In</h1>
              <p>Enter your credentials to continue</p>
            </div>

            <form onSubmit={submit} className="form-space">
              <div>
                <label className="input-label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" className="input-field" required />
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="input-group">
                  <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={handle} placeholder="••••••••" className="input-field" style={{ paddingRight: 48 }} required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="input-icon-right">
                    {showPw ? <HiEyeSlash style={{ width: 20, height: 20 }} /> : <HiEye style={{ width: 20, height: 20 }} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary btn-full" style={{ gap: 8 }}>
                {loading && <Spinner size="sm" className="text-white" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="auth-form-footer">
              Don't have an account? <Link to="/signup">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}