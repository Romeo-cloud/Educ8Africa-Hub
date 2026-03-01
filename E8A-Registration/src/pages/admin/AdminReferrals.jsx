import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import Loader from "../../components/ui/Loader";
import { HiArrowDownTray } from "react-icons/hi2";

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { 
        const res = await api.get("/admin/referrals"); 
        // Ensure we handle both array or { data: [] } formats
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        
        // Normalize data structure for the table
        const normalized = data.map(ref => ({
          id: ref.id,
          referrer: ref.referrer?.full_name || ref.referrer_name || "Unknown",
          referrerEmail: ref.referrer?.email || ref.referrer_email || "",
          referred: ref.referred_user?.full_name || ref.referred_user_name || "Unknown",
          referredEmail: ref.referred_user?.email || ref.referred_user_email || "",
          course: ref.course?.course_name || ref.course_name || "N/A",
          courseAmount: ref.course_amount || 0,
          commission: ref.commission || 0,
          commissionPercent: ref.commission_percent || 10,
          // Map is_paid boolean to status string
          status: ref.is_paid === true ? "Paid" : (ref.is_paid === false ? "Pending" : "Pending"),
          isPaid: ref.is_paid || false,
          date: ref.created_at || new Date().toISOString()
        }));

        setReferrals(normalized); 
      }
      catch (error) { 
        console.error("Failed to load referrals", error);
        setReferrals([]); 
      } finally { 
        setLoading(false); 
      }
    };
    fetch();
  }, []);

  const formatPrice = (val) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 0 }).format(val);
  const totalCommission = referrals.reduce((a, r) => a + (r.commission || 0), 0);

  const exportCSV = () => {
    const csv = "Referrer,Referred User,Course,Course Amount,Commission,Commission %,Status,Date\n" + 
      referrals.map((r) => `${r.referrer},${r.referred},${r.course},${r.courseAmount},${r.commission},${r.commissionPercent}%,${r.status},${r.date}`).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); 
    a.href = URL.createObjectURL(blob); 
    a.download = "referrals.csv"; 
    a.click();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="admin-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Referrals</h1>
          <p>Total Commission: <span className="admin-revenue">{formatPrice(totalCommission)}</span> • {referrals.length} referrals</p>
        </div>
        <button onClick={exportCSV} className="btn-outline" style={{ gap: 8, fontSize: 14, padding: "8px 16px" }}>
          <HiArrowDownTray style={{ width: 16, height: 16 }} /> Export CSV
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ overflow: "hidden" }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referrer</th>
                <th>Referred User</th>
                <th>Course</th>
                <th>Course Amount</th>
                <th>Commission</th>
                <th>Commission %</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty">No referrals found.</td>
                </tr>
              ) : (
                referrals.map((r, i) => (
                  <motion.tr key={r.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                      <div>{r.referrer}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.referrerEmail}</div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      <div>{r.referred}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.referredEmail}</div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{r.course}</td>
                    <td style={{ color: "var(--text-muted)" }}>{formatPrice(r.courseAmount)}</td>
                    <td style={{ fontWeight: 600, color: "var(--success)" }}>{formatPrice(r.commission)}</td>
                    <td style={{ color: "var(--text-muted)" }}>{r.commissionPercent}%</td>
                    <td>
                      <span className={`badge ${(r.status || "").toLowerCase() === "paid" ? "badge-success" : "badge-warning"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
