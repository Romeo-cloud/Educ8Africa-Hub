import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CourseCard from "../components/ui/CourseCard";
import Loader, { SkeletonCard } from "../components/ui/Loader";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { HiMagnifyingGlass } from "react-icons/hi2";

/*
 * Normalize course data from backend to frontend format.
 * Your backend might use different field names:
 *   title vs name
 *   price vs amount
 *   uuid vs integer id
 *   image_url vs image
 */
function normalizeCourse(raw) {
  return {
    // ID — could be UUID string or integer
    id: raw.id || raw._id || raw.course_id || "",

    // Name — backend might call it "title" or "name"
    name: raw.name || raw.title || raw.course_name || "Untitled Course",

    // Description — might be null
    description: raw.description || raw.desc || raw.summary || "",

    // Price — backend might call it "price", "amount", "cost", "fee"
    amount: raw.amount || raw.price || raw.cost || raw.fee || 0,

    // Image
    image:
      raw.image ||
      raw.image_url ||
      raw.thumbnail ||
      raw.cover_image ||
      raw.banner ||
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",

    // Duration
    duration: raw.duration || raw.course_duration || "",

    // Level
    level: raw.level || raw.difficulty || raw.skill_level || "All Levels",

    // Students count
    students: raw.students || raw.student_count || raw.enrolled_count || 0,

    // Welcome note
    welcome_note: raw.welcome_note || raw.welcome_message || raw.note || "",

    // Active status
    is_active: raw.is_active !== undefined ? raw.is_active : true,

    // Keep all original fields too
    ...raw,
  };
}

/*
 * Extract courses array from various backend response formats:
 *   { courses: [...], total: N }
 *   { data: [...] }
 *   { results: [...] }
 *   [...]  (direct array)
 */
function extractCourses(responseData) {
  if (!responseData) return [];

  // Direct array
  if (Array.isArray(responseData)) {
    return responseData.map(normalizeCourse);
  }

  // Nested under a key
  const arr =
    responseData.courses ||
    responseData.data ||
    responseData.results ||
    responseData.items ||
    [];

  if (Array.isArray(arr)) {
    return arr.map(normalizeCourse);
  }

  return [];
}

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [registeredCourseIds, setRegisteredCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const location = useLocation();
  const isPublic = !location.pathname.startsWith("/dashboard");

  // Fetch user's registrations to know which courses they're already registered for
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await api.get("/registrations");
        const registrations = res.data || [];
        
        // Extract course IDs from registrations
        const courseIds = new Set(
          registrations
            .map(reg => reg.course_id)
            .filter(Boolean)
        );
        
        setRegisteredCourseIds(courseIds);
      } catch (err) {
        console.error("[Courses] Failed to fetch registrations:", err);
      }
    };

    fetchRegistrations();
  }, [user]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");

        // Debug: see exactly what backend returns
        console.log("[Courses] Raw API response:", res.data);

        const normalized = extractCourses(res.data);
        console.log("[Courses] Normalized:", normalized);

        setCourses(normalized);
        setError(null);
      } catch (err) {
        console.error("[Courses] Fetch failed:", err);
        setError("Failed to load courses");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Safe search filter — handles null/undefined fields
  const filtered = courses.filter((c) => {
    if (!search.trim()) return true;

    const q = search.toLowerCase();
    const name = (c.name || "").toLowerCase();
    const description = (c.description || "").toLowerCase();

    return name.includes(q) || description.includes(q);
  });

  const content = (
    <div className={isPublic ? "courses-page-public" : ""}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
        style={{ marginBottom: 24 }}
      >
        <h1>{isPublic ? "All Courses" : "Available Courses"}</h1>
        <p>Choose a course and start your learning journey today.</p>
      </motion.div>

      {/* Search */}
      <div className="search-bar">
        <div className="input-group">
          <HiMagnifyingGlass
            className="input-icon-left"
            style={{ width: 20, height: 20 }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="input-field input-field-with-icon"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            padding: 16,
            background: "var(--danger-light)",
            color: "#b91c1c",
            borderRadius: "var(--radius-xl)",
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="courses-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-icon">
            {search ? "🔍" : "📚"}
          </p>
          <p>
            {search
              ? `No courses matching "${search}"`
              : "No courses available yet"}
          </p>
        </div>
      ) : (
        <div className="courses-grid">
          {filtered.map((course, i) => (
            <CourseCard 
              key={course.id || i} 
              course={course} 
              index={i}
              isRegistered={registeredCourseIds.has(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (isPublic) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
        <Navbar />
        {content}
        <Footer />
      </div>
    );
  }

  return content;
}