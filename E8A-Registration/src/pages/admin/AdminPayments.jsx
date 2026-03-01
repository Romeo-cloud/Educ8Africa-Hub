import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import Loader from "../../components/ui/Loader";
import { HiArrowDownTray } from "react-icons/hi2";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { 
        const res = await api.get("/admin/payments"); 
        // Backend returns { payments: [...], total: N }
        setPayments(res.data.payments || []); 
      }
      catch (error) { 
        console.error("Failed to load payments", error);
        setPayments([]); 
      } finally { 
        setLoading(false); 
      }
    };
    fetch();
  }, []);

  const formatPrice = (val) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 0 }).format(val);
  
  // Calculate total revenue from successful payments
  const totalRevenue = payments
    .filter((p) => (p.status || "").toLowerCase() === "success")
    .reduce((a, p) => a + p.amount, 0);

  const exportCSV = () => {
    const csv = "User,Course,Amount,Reference,Status,Date\n" + 
      payments.map((p) => `${p.user},${p.course},${p.amount},${p.reference},${p.status},${p.date}`).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); 
    a.href = URL.createObjectURL(blob); 
    a.download = "payments.csv"; 
    a.click();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="admin-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Payments</h1>
          <p>Total Revenue: <span className="admin-revenue">{formatPrice(totalRevenue)}</span></p>
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
                <th>User</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => (
                  <motion.tr key={p.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.user}</td>
                    <td style={{ color: "var(--text-muted)" }}>{p.course}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatPrice(p.amount)}</td>
                    <td style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)" }}>{p.reference}</td>
                    <td>
                      <span className={`badge ${(p.status || "").toLowerCase() === "success" ? "badge-success" : (p.status || "").toLowerCase() === "failed" ? "badge-danger" : "badge-warning"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {p.date ? new Date(p.date).toLocaleDateString() : "N/A"}
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