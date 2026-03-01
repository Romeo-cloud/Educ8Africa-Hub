import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import StatsCard from "../../components/ui/StatsCard";
import Loader from "../../components/ui/Loader";
import {
  HiUsers,
  HiCurrencyDollar,
  HiAcademicCap,
  HiUserGroup,
  HiCreditCard
} from "react-icons/hi2";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch admin dashboard", error);
        // Fallback to zeros if fetch fails
        setStats({
          total_users: 0,
          total_students: 0,
          total_revenue: 0,
          total_referrals: 0,
          total_courses: 0,
          recent_payments: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatPrice = (val) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 0 }).format(val);

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of platform performance.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard 
          title="Total Students" 
          value={stats?.total_students || 0} 
          icon={HiUsers} 
          color="primary" 
          index={0} 
        />
        <StatsCard 
          title="Total Revenue" 
          value={stats?.total_revenue || 0} 
          icon={HiCurrencyDollar} 
          color="success" 
          prefix="₵" 
          index={1} 
        />
        <StatsCard 
          title="Active Courses" 
          value={stats?.total_courses || 0} 
          icon={HiAcademicCap} 
          color="secondary" 
          index={2} 
        />
        <StatsCard 
          title="Total Referrals" 
          value={stats?.total_referrals || 0} 
          icon={HiUserGroup} 
          color="warning" 
          index={3} 
        />
      </div>

      {/* Recent Payments Section */}
      <div className="grid lg:grid-cols-1 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card" style={{ overflow: "hidden" }}>
          <div className="table-section-header">
            <h3>Recent Payments</h3>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_payments?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty">No recent payments</td>
                  </tr>
                ) : (
                  stats?.recent_payments?.map((payment, i) => (
                    <tr key={payment.payment_id || i}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                        {payment.student_name || "Unknown"}
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{payment.course_name}</td>
                      <td style={{ fontWeight: 600, color: "var(--success)" }}>
                        {formatPrice(payment.amount)}
                      </td>
                      <td>
                        <span className={`badge ${(payment.status || "").toLowerCase() === 'success' ? 'badge-success' : 'badge-warning'}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Quick Actions</h2>
        <div className="quick-actions-grid">
          {[
            { label: "Manage Courses", to: "/admin/courses", bg: "bg-gradient-primary", icon: "📚" },
            { label: "View Payments", to: "/admin/payments", bg: "bg-gradient-success", icon: "💰" },
            { label: "Export Data", to: "/admin/users", bg: "bg-gradient-secondary", icon: "📥" },
          ].map((item, i) => (
            <motion.a key={i} href={item.to} whileHover={{ y: -4 }} className={`quick-action-card ${item.bg}`}>
              <span className="quick-action-icon">{item.icon}</span>
              <p className="quick-action-label">{item.label}</p>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}