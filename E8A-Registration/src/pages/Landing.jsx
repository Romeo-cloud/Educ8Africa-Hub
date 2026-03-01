import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CourseCard from "../components/ui/CourseCard";
import {
  HiShieldCheck, HiCurrencyDollar, HiAcademicCap, HiRocketLaunch,
  HiStar, HiUserGroup, HiPlay, HiArrowRight, HiCheckCircle,
} from "react-icons/hi2";
import api from "../services/api";

const courses = [
  { id: 1, name: "Full-Stack Web Development", description: "Master React, Node.js, and databases.", amount: 75000, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600", duration: "12 Weeks", level: "Intermediate", students: 1240 },
  { id: 2, name: "Data Science & Analytics", description: "Learn Python, Pandas, and Machine Learning.", amount: 85000, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600", duration: "10 Weeks", level: "Beginner", students: 980 },
  { id: 3, name: "UI/UX Design Mastery", description: "Master Figma and create stunning experiences.", amount: 55000, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600", duration: "6 Weeks", level: "Beginner", students: 1456 },
];

const features = [
  { icon: HiShieldCheck, title: "Secure Payments", desc: "Bank-grade security with Paystack.", colorClass: "icon-box-success" },
  { icon: HiCurrencyDollar, title: "Earn Referral Income", desc: "Invite friends and earn commission.", colorClass: "icon-box-warning" },
  { icon: HiAcademicCap, title: "Expert Training", desc: "Learn from industry professionals.", colorClass: "icon-box-primary" },
  { icon: HiRocketLaunch, title: "Career Growth", desc: "Get job-ready skills and guidance.", colorClass: "icon-box-secondary" },
];

const stats = [
  { value: "5,000+", label: "Students Trained" },
  { value: "20+", label: "Expert Instructors" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "₵15M+", label: "Referral Paid" },
];

const gradients = [
  "linear-gradient(135deg, #f472b6, #ef4444)",
  "linear-gradient(135deg, #60a5fa, #06b6d4)",
  "linear-gradient(135deg, #4ade80, #10b981)",
  "linear-gradient(135deg, #a78bfa, #8b5cf6)",
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Landing() {
  const [previewCourses, setPreviewCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        const raw = res.data.courses || res.data.data || res.data || [];
        const arr = Array.isArray(raw) ? raw : [];

        // Normalize and take first 3
        const normalized = arr.slice(0, 3).map((c) => ({
          id: c.id || "",
          name: c.name || c.title || "Course",
          description: c.description || c.desc || "",
          amount: c.amount || c.price || 0,
          image:
            c.image ||
            c.image_url ||
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
          duration: c.duration || "",
          level: c.level || "All Levels",
          students: c.students || c.student_count || 0,
        }));

        setPreviewCourses(normalized);
      } catch (err) {
        console.log("[Landing] Failed to fetch courses:", err);
        // Use fallback hardcoded courses
        setPreviewCourses([
          { id: 1, name: "Full-Stack Web Development", description: "Master React, Node.js, and databases.", amount: 75000, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600", duration: "12 Weeks", level: "Intermediate", students: 1240 },
          { id: 2, name: "Data Science & Analytics", description: "Learn Python, Pandas, and ML.", amount: 85000, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600", duration: "10 Weeks", level: "Beginner", students: 980 },
          { id: 3, name: "UI/UX Design Mastery", description: "Master Figma and create stunning UX.", amount: 55000, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600", duration: "6 Weeks", level: "Beginner", students: 1456 },
        ]);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="landing-page">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="blob blob-primary" style={{ top: 80, left: 40, width: 288, height: 288 }} />
        <div className="blob blob-secondary" style={{ bottom: 80, right: 40, width: 384, height: 384 }} />
        <div className="blob blob-accent" style={{ top: 160, right: 160, width: 192, height: 192 }} />

        <div className="hero-inner">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="hero-badge">
              <HiStar style={{ width: 16, height: 16 }} />
              <span>Top-Rated Training Platform</span>
            </div>

            <h1 className="hero-title">
              Advance Your Career with <span className="gradient-text">Industry Training</span>
            </h1>

            <p className="hero-subtitle">
              Join thousands of students learning high-income tech skills. Get certified, earn referral income, and transform your career.
            </p>

            <div className="hero-buttons">
              <Link to="/signup" className="btn-primary btn-lg">
                Get Started <HiArrowRight style={{ width: 20, height: 20 }} />
              </Link>
              <Link to="/courses" className="btn-outline btn-lg">
                <HiPlay style={{ width: 20, height: 20 }} /> Browse Courses
              </Link>
            </div>

            <div className="hero-social-proof">
              <div className="hero-avatars">
                {gradients.map((g, i) => (
                  <div key={i} className="hero-avatar-bubble" style={{ background: g }} />
                ))}
              </div>
              <div>
                <strong className="hero-social-text">5,000+ Students</strong>
                <div className="hero-stars">
                  {[...Array(5)].map((_, i) => <HiStar key={i} style={{ width: 14, height: 14 }} />)}
                  <span>4.9/5</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-image-wrapper"
          >
            <div className="hero-image-glow" />
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700" alt="Students" className="hero-image" />

            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="hero-float-card hero-float-card-left">
              <div className="hero-float-icon" style={{ background: "#dcfce7" }}>
                <HiCheckCircle style={{ width: 24, height: 24, color: "#22c55e" }} />
              </div>
              <div>
                <p className="hero-float-label">Enrolled</p>
                <p className="hero-float-value">1,240 Students</p>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="hero-float-card hero-float-card-right">
              <div className="hero-float-icon" style={{ background: "#fef3c7" }}>
                <HiCurrencyDollar style={{ width: 24, height: 24, color: "#f59e0b" }} />
              </div>
              <div>
                <p className="hero-float-label">Referral Earned</p>
                <p className="hero-float-value">₵36,000</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

8
      {/* FEATURES */}
      <section className="features-section">
        <div className="features-inner">
          <motion.div {...fadeUp} className="section-header">
            <h2 className="section-title">Why Choose <span className="gradient-text">Educ8Africa Hub</span>?</h2>
            <p className="section-subtitle">We provide everything you need to launch your tech career.</p>
          </motion.div>

          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="card card-hover feature-card" style={{ padding: 24 }}>
                <div className={`icon-box icon-box-lg ${f.colorClass}`}>
                  <f.icon style={{ width: 28, height: 28 }} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section className="courses-section">
        <div className="courses-section-inner">
          <motion.div {...fadeUp} className="courses-header">
            <div>
              <h2>Popular Courses</h2>
              <p>Start learning today with our top programs.</p>
            </div>
            <Link to="/courses" className="btn-outline" style={{ fontSize: 14, padding: "8px 20px" }}>
              View All <HiArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </motion.div>

        <div className="courses-grid">
          {previewCourses.map((course, i) => (
            <CourseCard key={course.id || i} course={course} index={i} />
          ))}
        </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <motion.div {...fadeUp} className="card cta-card">
            <div className="blob blob-primary" style={{ top: -80, right: -80, width: 240, height: 240 }} />
            <div className="blob blob-secondary" style={{ bottom: -80, left: -80, width: 240, height: 240 }} />
            <div style={{ position: "relative" }}>
              <div className="icon-box icon-box-xl icon-box-gradient" style={{ margin: "0 auto 24px", borderRadius: "var(--radius-2xl)" }}>
                <HiUserGroup style={{ width: 32, height: 32 }} />
              </div>
              <h2>Ready to Start Your Journey?</h2>
              <p>Join 5,000+ students already building their future. Get started today and earn while you learn.</p>
              <div className="cta-buttons">
                <Link to="/signup" className="btn-primary btn-lg">Create Free Account</Link>
                <Link to="/courses" className="btn-outline btn-lg">Explore Courses</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}