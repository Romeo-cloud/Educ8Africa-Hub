import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Spinner } from "../components/ui/Loader";
import api from "../services/api";
import { HiCamera, HiPencil, HiCheck, HiAcademicCap, HiCurrencyDollar, HiClock, HiCheckBadge } from "react-icons/hi2";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    name: user?.name || user?.full_name || "", 
    email: user?.email || "", 
    phone: user?.phone || user?.phone_number || "" 
  });

  // Fetch profile data from dashboard endpoint
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get("/dashboard");
        const data = res.data;
        
        setProfileData({
          user_id: data.user_id,
          user_name: data.user_name,
          email: data.email,
          phone_number: data.phone_number,
          role: data.role,
          total_courses_enrolled: data.total_courses_enrolled || 0,
          paid_courses_count: data.paid_courses_count || 0,
          pending_courses_count: data.pending_courses_count || 0,
          total_paid: data.total_paid || 0,
          registered_courses: data.registered_courses || [],
          payment_history: data.payment_history || [],
        });
        
        // Update form with fetched data
        setForm({
          name: data.user_name || "",
          email: data.email || "",
          phone: data.phone_number || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        // Fallback to user context
        setProfileData({
          user_id: user?.id,
          user_name: user?.full_name || user?.name,
          email: user?.email,
          phone_number: user?.phone_number || user?.phone,
          role: user?.role || 'user',
          total_courses_enrolled: 0,
          paid_courses_count: 0,
          pending_courses_count: 0,
          total_paid: 0,
          registered_courses: [],
          payment_history: [],
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchProfileData();
  }, [user]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setSaving(true);
    try {
      // Call the backend API to update profile
      const res = await api.patch("/auth/profile", {
        full_name: form.name,
        phone_number: form.phone,
      });
      
      // Update user context with the response from server
      updateUser({
        ...user,
        name: res.data.full_name,
        full_name: res.data.full_name,
        phone_number: res.data.phone_number,
        phone: res.data.phone_number,
      });
      
      // Update local form state
      setForm({
        ...form,
        name: res.data.full_name,
        phone: res.data.phone_number,
      });
      
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page space-y-8">
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>Profile</h1>
        <p>Manage your personal information and view your course status.</p>
      </motion.div>

      {/* Profile Avatar Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card profile-avatar-section" style={{ padding: 32 }}>
        <div className="profile-avatar-wrapper">
          <div className="avatar avatar-xl">{form.name?.charAt(0).toUpperCase() || "U"}</div>
          <button className="profile-avatar-edit">
            <HiCamera style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
          </button>
        </div>
        <p className="profile-name">{form.name}</p>
        <p className="profile-email">{form.email}</p>
        <span className="role-badge" style={{ 
          marginTop: 8, 
          padding: "4px 12px", 
          background: "var(--primary-500)", 
          color: "white", 
          borderRadius: "var(--radius-full)",
          fontSize: "12px",
          textTransform: "capitalize"
        }}>
          {profileData?.role || 'user'}
        </span>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stats-grid-4">
        <div className="card stat-card" style={{ padding: 20, textAlign: "center" }}>
          <HiAcademicCap style={{ width: 24, height: 24, color: "var(--primary-500)", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{profileData?.total_courses_enrolled || 0}</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Courses Enrolled</p>
        </div>
        <div className="card stat-card" style={{ padding: 20, textAlign: "center" }}>
          <HiCheckBadge style={{ width: 24, height: 24, color: "var(--success)", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{profileData?.paid_courses_count || 0}</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Paid Courses</p>
        </div>
        <div className="card stat-card" style={{ padding: 20, textAlign: "center" }}>
          <HiClock style={{ width: 24, height: 24, color: "var(--warning)", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{profileData?.pending_courses_count || 0}</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Pending</p>
        </div>
        <div className="card stat-card" style={{ padding: 20, textAlign: "center" }}>
          <HiCurrencyDollar style={{ width: 24, height: 24, color: "var(--secondary-500)", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>₵{profileData?.total_paid?.toLocaleString() || 0}</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Total Paid</p>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 32 }}>
        <div className="profile-info-header">
          <h3>Personal Information</h3>
          <button
            onClick={() => (editing ? save() : setEditing(true))}
            disabled={saving}
            className="btn-ghost"
            style={{
              gap: 8, padding: "8px 16px", borderRadius: "var(--radius-lg)",
              background: editing ? "var(--success)" : "var(--hover-bg)",
              color: editing ? "var(--white)" : "var(--text-secondary)",
            }}
          >
            {saving ? <Spinner size="sm" /> : editing ? <HiCheck style={{ width: 16, height: 16 }} /> : <HiPencil style={{ width: 16, height: 16 }} />}
            {saving ? "Saving..." : editing ? "Save" : "Edit"}
          </button>
        </div>

        <div>
          <div className="profile-field">
            <label>Full Name</label>
            {editing ? <input name="name" value={form.name} onChange={handle} className="input-field" /> : <p className="profile-field-value">{form.name}</p>}
          </div>
          <div className="profile-field">
            <label>Email</label>
            {editing ? <input name="email" type="email" value={form.email} onChange={handle} className="input-field" disabled style={{ opacity: 0.7 }} /> : <p className="profile-field-value">{form.email}</p>}
          </div>
          <div className="profile-field">
            <label>Phone Number</label>
            {editing ? <input name="phone" type="tel" value={form.phone} onChange={handle} className="input-field" /> : <p className="profile-field-value">{form.phone || "Not provided"}</p>}
          </div>
        </div>
      </motion.div>

      {/* Enrolled Courses */}
      {profileData?.registered_courses?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card" style={{ padding: 32 }}>
          <h3 style={{ marginBottom: 16 }}>My Courses</h3>
          <div className="courses-list">
            {profileData.registered_courses.map((course, index) => (
              <div key={course.registration_id || index} className="course-item" style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "16px 0",
                borderBottom: index < profileData.registered_courses.length - 1 ? "1px solid var(--border-color)" : "none"
              }}>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{course.course_name}</p>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>₵{course.amount?.toLocaleString()}</p>
                </div>
                <span style={{ 
                  padding: "4px 12px", 
                  borderRadius: "var(--radius-full)",
                  fontSize: 12,
                  fontWeight: 600,
                  background: course.status === "paid" ? "var(--success-light)" : "var(--warning-light)",
                  color: course.status === "paid" ? "var(--success)" : "var(--warning)"
                }}>
                  {course.status === "paid" ? "Paid" : course.status === "pending" ? "Pending" : course.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: 32 }}>
        <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/dashboard/courses" className="btn-primary">
            Browse Courses
          </Link>
          <Link to="/dashboard/referrals" className="btn-secondary">
            View Referrals
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
