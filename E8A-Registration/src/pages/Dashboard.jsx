import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import StatsCard from "../components/ui/StatsCard";
import Loader from "../components/ui/Loader";
import { useToast } from "../context/ToastContext";
import {
  HiAcademicCap, HiUserGroup, HiCurrencyDollar,
  HiCheckBadge, HiClipboardDocument, HiShare, HiStar,
  HiClock, HiMiniCurrencyDollar
} from "react-icons/hi2";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Determine user role - ambassador role is 'ambassador', admin is 'admin', regular user is 'user'
  const userRole = user?.role?.toLowerCase() || 'user';
  const isAmbassador = userRole === 'ambassador';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard");
        const data = res.data;
        
        // Use the new enhanced response directly
        setStats({
          user_id: data.user_id,
          user_name: data.user_name,
          email: data.email,
          phone_number: data.phone_number,
          role: data.role,
          total_courses_enrolled: data.total_courses_enrolled || 0,
          paid_courses_count: data.paid_courses_count || 0,
          pending_courses_count: data.pending_courses_count || 0,
          total_paid: data.total_paid || 0,
          referral_count: data.referral_count || 0,
          referral_earnings: data.referral_earnings || 0,
          registered_courses: data.registered_courses || [],
          payment_history: data.payment_history || [],
          welcome_notes: data.welcome_notes || [],
        });
        
        // Update user context with fresh data from backend
        if (data.user_name || data.email || data.phone_number) {
          updateUser({
            ...user,
            name: data.user_name,
            email: data.email,
            phone: data.phone_number,
            role: data.role,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Fallback to user object data if API endpoint fails
        setStats({
          user_id: user?.id,
          user_name: user?.full_name || user?.name,
          email: user?.email,
          phone_number: user?.phone_number || user?.phone,
          role: user?.role || 'user',
          total_courses_enrolled: 0,
          paid_courses_count: 0,
          pending_courses_count: 0,
          total_paid: 0,
          referral_count: user?.referral_count || 0,
          referral_earnings: user?.referral_earnings || 0,
          registered_courses: [],
          payment_history: [],
          welcome_notes: [],
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchData();
  }, [user]);

  const copyReferralCode = () => {
    const code = user?.referral_code || "XXXXX";
    navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${code}`);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Loader />;

  // Determine payment status text
  const paymentStatus = stats?.paid_courses_count > 0 
    ? (stats?.pending_courses_count > 0 ? "Partial" : "Paid") 
    : (stats?.pending_courses_count > 0 ? "Pending" : "No Courses");
  
  const paymentStatusColor = stats?.paid_courses_count > 0 ? "success" : "warning";

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.full_name?.split(" ")[0] || user?.name?.split(" ")[0] || "Student"}! Here's your overview.</p>
      </motion.div>

      {/* Stats Grid - Different layout for ambassadors vs regular users */}
      <div className={isAmbassador ? "stats-grid" : "stats-grid-4"}>
        <StatsCard 
          title="Courses Enrolled" 
          value={stats?.total_courses_enrolled || 0} 
          icon={HiAcademicCap} 
          color="primary" 
          index={0} 
        />
        
        <StatsCard 
          title="Paid Courses" 
          value={stats?.paid_courses_count || 0} 
          icon={HiCheckBadge} 
          color="success" 
          index={1} 
        />
        
        <StatsCard 
          title="Pending Courses" 
          value={stats?.pending_courses_count || 0} 
          icon={HiClock} 
          color="warning" 
          index={2} 
        />
        
        <StatsCard 
          title="Total Paid" 
          value={stats?.total_paid || 0} 
          icon={HiMiniCurrencyDollar} 
          color="secondary" 
          prefix="₵" 
          index={3} 
        />
      </div>

      {/* Ambassador-specific stats */}
      {isAmbassador && (
        <div className="stats-grid-2">
          <StatsCard 
            title="Referral Count" 
            value={stats?.referral_count || user?.referral_count || 0} 
            icon={HiUserGroup} 
            color="primary" 
            index={0} 
          />
          <StatsCard 
            title="Referral Earnings" 
            value={stats?.referral_earnings || user?.referral_earnings || 0} 
            icon={HiMiniCurrencyDollar} 
            color="success" 
            prefix="₵" 
            index={1} 
          />
        </div>
      )}

      {/* Ambassador Referral Card - Only show for ambassadors */}
      {isAmbassador && user?.referral_code && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card referral-card" style={{ padding: "24px 32px" }}>
          <div className="referral-card-inner">
            <div className="icon-box icon-box-lg icon-box-gradient" style={{ borderRadius: "var(--radius-2xl)" }}>
              <HiShare style={{ width: 24, height: 24 }} />
            </div>
            <div className="referral-card-content">
              <h3>Your Ambassador Referral Code</h3>
              <p>Share your code and earn commission for every signup!</p>
              <div className="referral-code-row">
                <div className="referral-code-display">
                  <code className="referral-code-text">{user?.referral_code}</code>
                </div>
                <button onClick={copyReferralCode} className={`btn-copy ${copied ? "btn-copy-copied" : "btn-copy-default"}`}>
                  <HiClipboardDocument style={{ width: 20, height: 20 }} />
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Regular user referral prompt - Show if user is not an ambassador */}
      {!isAmbassador && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card" style={{ padding: "24px 32px" }}>
          <div className="referral-card-inner">
            <div className="icon-box icon-box-lg" style={{ borderRadius: "var(--radius-2xl)", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
              <HiStar style={{ width: 24, height: 24, color: "white" }} />
            </div>
            <div className="referral-card-content">
              <h3>Become an Ambassador</h3>
              <p>Want to earn commissions by referring friends? Contact admin to become an ambassador!</p>
              <Link to="/dashboard/profile" className="btn-primary" style={{ display: "inline-flex", marginTop: 8 }}>
                View Profile
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Welcome Note */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card welcome-card" style={{ padding: "24px 32px" }}>
        <div className="welcome-card-inner">
          <div className="welcome-card-icon">📝</div>
          <div className="welcome-card-text">
            <h3>
              {isAmbassador ? "Ambassador Welcome" : "Welcome Note"}
            </h3>
            <p>
              {isAmbassador 
                ? `Welcome back, ${user?.full_name}! As an ambassador, you can earn commissions by sharing your referral code. Track your earnings in the Referral Earnings section. Keep promoting and watch your earnings grow! 🚀`
                : "Welcome to Educ8Africa! We're excited to have you on board. Explore our courses, start learning at your own pace, and don't forget to share your referral code with friends and family to earn commissions. Happy learning! 🚀"
              }
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
