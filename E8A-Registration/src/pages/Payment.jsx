// src/pages/Payment.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Spinner } from "../components/ui/Loader";
import { HiCreditCard, HiShieldCheck, HiLockClosed } from "react-icons/hi2";
import api from "../services/api";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [processing, setProcessing] = useState(false);
  
  const course = location.state?.course;
  const registration = location.state?.registration;

  if (!course) {
    return (
      <div className="empty-state">
        <p className="empty-state-icon">💳</p>
        <p style={{ marginBottom: 16 }}>No course selected for payment</p>
        <button onClick={() => navigate("/dashboard/courses")} className="btn-primary">Browse Courses</button>
      </div>
    );
  }

  const formatPrice = (val) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 0 }).format(val);

  const payWithPaystack = () => {
    setProcessing(true);
    const publicKey = import.meta.env.VITE_PAYSTACK_KEY;

    if (!publicKey || publicKey.includes("xxxxxxxx")) {
      toast.error("Invalid Paystack Public Key");
      setProcessing(false);
      return;
    }

    const email = user?.email || "user@example.com";
    
    // Ensure amount is a valid number
    const rawAmount = parseFloat(course.amount);
    if (isNaN(rawAmount)) {
        toast.error("Invalid course amount");
        setProcessing(false);
        return;
    }
    const amountInKobo = Math.ceil(rawAmount * 100);

    // Define callback separately to ensure it's a valid function reference
    const onSuccess = (response) => {
        // We make this inner part async
        (async () => {
            try {
                toast.info("Verifying payment...");
                
                // Call the backend to verify payment
                // The backend will link the payment to the registration based on user and course
                await api.verifyPayment(response.reference);
                
                toast.success("Payment verified and recorded!");
                navigate("/dashboard");
            } catch (error) {
                console.error("Verification failed", error);
                toast.error("Payment verified but server update failed.");
                navigate("/dashboard");
            } finally {
                setProcessing(false);
            }
        })();
    };

    const onCancel = () => {
        setProcessing(false);
        toast.warning("Payment cancelled");
    };

    // eslint-disable-next-line no-undef
    const handler = PaystackPop.setup({
      key: publicKey,
      email: email,
      amount: amountInKobo,
      currency: "GHS", 
      ref: "TH-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      metadata: {
        // ── CRITICAL FIX: Send course_id in root of metadata ──
        course_id: course.id, 
        
        custom_fields: [
          { display_name: "Course", variable_name: "course", value: course.name },
          { display_name: "User ID", variable_name: "user_id", value: user.id || "" },
        ]
      },
      callback: onSuccess,
      onClose: onCancel
    });

    handler.openIframe();
  }; // <--- THIS BRACE WAS MISSING

  return (
    <div className="payment-page space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>Complete Payment</h1>
        <p>Review your order and proceed to pay.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: 24 }} className="space-y-4">
          <h3 style={{ fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
            <HiCreditCard style={{ width: 20, height: 20, color: "var(--primary-500)" }} /> Order Summary
          </h3>

          <div className="order-summary">
            <img 
                src={course.image} 
                alt={course.name} 
                className="order-summary-image" 
                onError={(e) => e.target.src="https://placehold.co/100x100?text=Course"} 
            />
            <div>
              <p className="order-summary-name">{course.name}</p>
              <p className="order-summary-meta">{course.duration} • {course.level}</p>
            </div>
          </div>

          <hr className="divider" />

          <div className="space-y-2">
            <div className="order-line">
              <span className="order-line-label">Course Fee</span>
              <span className="order-line-value">{formatPrice(course.amount)}</span>
            </div>
            <div className="order-line">
              <span className="order-line-label">Processing Fee</span>
              <span className="order-line-free">Free</span>
            </div>
            <hr className="divider" />
            <div className="order-total">
              <span className="order-total-label">Total</span>
              <span className="order-total-value">{formatPrice(course.amount)}</span>
            </div>
          </div>
        </div>

        <div className="payment-footer">
          <div className="payment-secure-note">
            <HiShieldCheck style={{ width: 16, height: 16 }} />
            <span>Secured by Paystack. Your payment is safe.</span>
          </div>
          <button onClick={payWithPaystack} disabled={processing} className="btn-primary btn-full btn-lg" style={{ gap: 12 }}>
            {processing ? <><Spinner size="sm" /> Processing...</> : <><HiLockClosed style={{ width: 20, height: 20 }} /> Pay {formatPrice(course.amount)} with Paystack</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}