import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiClock, HiAcademicCap, HiUsers } from "react-icons/hi2";

export default function CourseCard({ course, index = 0, onRegister, isRegistered = false }) {
  const navigate = useNavigate();

  // Safe accessors — handles any field name
  const name = course.name || course.title || "Untitled Course";
  const description = course.description || course.desc || "";
  const amount = course.amount || course.price || course.cost || 0;
  const image =
    course.image ||
    course.image_url ||
    course.thumbnail ||
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600";
  const duration = course.duration || "";
  const level = course.level || course.difficulty || "All Levels";
  const students = course.students || course.student_count || 0;

  const handleRegister = () => {
    if (isRegistered) return;
    if (onRegister) return onRegister(course);
    navigate(`/dashboard/register/${course.id}`);
  };

  const formatPrice = (val) => {
    if (!val) return "Free";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "GHC",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="card"
      style={{ overflow: "hidden" }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 192, overflow: "hidden" }}>
        <img
          src={image}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600";
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
          }}
        />
        {level && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "4px 12px",
              background: "rgba(255,255,255,0.9)",
              borderRadius: "var(--radius-full)",
              color: "var(--primary-500)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {level}
          </span>
        )}
        <span
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            color: "var(--white)",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {formatPrice(amount)}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h3
          className="line-clamp-1"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {name}
        </h3>

        {description && (
          <p
            className="line-clamp-2"
            style={{ fontSize: 14, color: "var(--text-muted)" }}
          >
            {description}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 12,
            color: "var(--gray-400)",
          }}
        >
          {duration && (
            <span
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <HiClock style={{ width: 14, height: 14 }} /> {duration}
            </span>
          )}
          {level && (
            <span
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <HiAcademicCap style={{ width: 14, height: 14 }} />{" "}
              {level}
            </span>
          )}
          {students > 0 && (
            <span
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <HiUsers style={{ width: 14, height: 14 }} />{" "}
              {students.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={handleRegister}
          disabled={isRegistered}
          className={isRegistered ? "btn-ghost btn-full" : "btn-primary btn-full"}
          style={{ 
            fontSize: 14, 
            padding: "10px 24px", 
            marginTop: 4,
            color: isRegistered ? "#fff" : undefined,
            background: isRegistered ? "var(--success)" : undefined,
            cursor: isRegistered ? "not-allowed" : "pointer"
          }}
        >
          {isRegistered ? "Registered" : "Register Now"}
        </button>
      </div>
    </motion.div>
  );
}