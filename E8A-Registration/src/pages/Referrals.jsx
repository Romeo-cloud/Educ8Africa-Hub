import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import StatsCard from "../components/ui/StatsCard";
import Loader from "../components/ui/Loader";
import { HiUserGroup, HiCurrencyDollar, HiClipboardDocument, HiHashtag, HiClock } from "react-icons/hi2";

export default function Referrals() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    code: "",
    count: 0,
    earnings: 0,
    paidEarnings: 0,
    unpaidEarnings: 0
  });
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try { 
        // Fetch from dashboard/referrals endpoint for user-specific data
        const res = await api.get("/dashboard/referrals"); 
        
        // Handle both response formats
        const data = res.data;
        
        setStats({
          code: user?.referral_code || "",
          count: data.total_referrals || 0,
          earnings: data.total_commission || 0,
          paidEarnings: data.paid_commission || 0,
          unpaidEarnings: data.unpaid_commission || 0
        });
        
        // Normalize referrals data
        const normalizedRefs = (data.referrals || []).map(ref => ({
          id: ref.id,
          referredUserName: ref.referred_user_name || "Unknown User",
          courseName: ref.course_name || "Unknown Course",
          commission: ref.commission || 0,
          isPaid: ref.is_paid || false,
          createdAt: ref.created_at ? new Date(ref.created_at).toLocaleDateString() : "N/A"
        }));
        
        setReferrals(normalizedRefs);
      }
      catch { 
        setStats({ 
          code: user?.referral_code || "", 
          count: 0, 
          earnings: 0,
          paidEarnings: 0,
          unpaidEarnings: 0
        });
        setReferrals([]);
      }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const copyCode = () => {
    navigator.clipboard.writeText(stats.code || "");
    toast.success("Referral code copied!");
  };

  const copyLink = () => {
    const link = `${window.location.origin}/signup?ref=${stats.code}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  const formatCurrency = (val) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "GHS", minimumFractionDigits: 0 }).format(val || 0);

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>Referral Earnings</h1>
        <p>Track your referral performance and earnings.</p>
      </motion.div>

      <div className="stats-grid stats-grid-4">
        <StatsCard title="Referral Code" value={stats.code || "N/A"} icon={HiHashtag} color="primary" index={0} />
        <StatsCard title="Total Referrals" value={stats.count || 0} icon={HiUserGroup} color="secondary" index={1} />
        <StatsCard title="Total Earnings" value={stats.earnings || 0} icon={HiCurrencyDollar} color="success" prefix="₵" index={2} />
        <StatsCard title="Pending Earnings" value={stats.unpaidEarnings || 0} icon={HiClock} color="warning" prefix="₵" index={3} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: 24 }}>
        <div className="referral-link-card">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>Share your referral link</p>
            <p className="referral-link-url">{window.location.origin}/signup?ref={stats.code}</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button onClick={copyCode} className="btn-outline" style={{ gap: 8 }}>
              <HiClipboardDocument style={{ width: 20, height: 20 }} /> Copy Code
            </button>
            <button onClick={copyLink} className="btn-primary" style={{ gap: 8 }}>
              <HiClipboardDocument style={{ width: 20, height: 20 }} /> Copy Link
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card" style={{ overflow: "hidden" }}>
        <div className="table-section-header"><h3>Referred Users</h3></div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Course</th>
                <th>Commission</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">No referrals yet. Share your code to start earning!</td></tr>
              ) : referrals.map((ref, i) => (
                <motion.tr key={ref.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{ref.referredUserName}</td>
                  <td style={{ color: "var(--text-muted)" }}>{ref.courseName}</td>
                  <td style={{ fontWeight: 600, color: "var(--success)" }}>{formatCurrency(ref.commission)}</td>
                  <td style={{ color: "var(--text-muted)" }}>{ref.createdAt}</td>
                  <td>
                    <span className={`badge ${ref.isPaid ? "badge-success" : "badge-warning"}`}>
                      {ref.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
