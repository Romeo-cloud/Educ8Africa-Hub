import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { Spinner } from "../components/ui/Loader";
import Loader from "../components/ui/Loader";

/*
 * Same normalizer as Courses page
 */
function normalizeCourse(raw) {
  return {
    id: raw.id || raw._id || "",
    name: raw.name || raw.title || "Untitled Course",
    description: raw.description || raw.desc || "",
    amount: raw.amount || raw.price || raw.cost || 0,
    image:
      raw.image ||
      raw.image_url ||
      raw.thumbnail ||
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
    duration: raw.duration || "",
    level: raw.level || "All Levels",
    welcome_note: raw.welcome_note || "",
    ...raw,
  };
}

export default function CourseRegistration() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    surname: "",
    phone: "",
    university: "",
    level: "",
    guardian_name: "",
    guardian_phone: "",
    referral_code: "",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Try fetching single course first
        try {
          const res = await api.get(`/courses/${courseId}`);
          console.log("[Registration] Single course response:", res.data);

          // Response could be the course directly or { course: {...} }
          const raw = res.data.course || res.data;
          setCourse(normalizeCourse(raw));
          setLoading(false);
          return;
        } catch (singleErr) {
          console.log(
            "[Registration] Single course fetch failed, trying list..."
          );
        }

        // Fallback: fetch all courses and find by ID
        const res = await api.get("/courses");
        const allCourses =
          res.data.courses || res.data.data || res.data || [];

        const coursesArray = Array.isArray(allCourses)
          ? allCourses
          : [];

        // Find by ID — handle both UUID strings and integers
        const found = coursesArray.find(
          (c) =>
            String(c.id) === String(courseId) ||
            String(c._id) === String(courseId) ||
            String(c.course_id) === String(courseId)
        );

        if (found) {
          setCourse(normalizeCourse(found));
        } else {
          console.error("[Registration] Course not found:", courseId);
          setCourse(null);
        }
      } catch (err) {
        console.error("[Registration] Fetch failed:", err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.surname || !form.phone) {
      return toast.warning("Please fill required fields");
    }
    setSubmitting(true);
    try {
      // CRITICAL FIX: Call the backend to create the registration FIRST
      const registrationResponse = await api.post("/course/select", {
        course_id: course.id,
        referral_code: form.referral_code || null,
        referrer_name: form.referral_code ? form.first_name + " " + form.surname : null,
      });
      
      // Get the created registration from response
      const createdRegistration = registrationResponse.data;
      
      // Now navigate to payment with both course AND registration data
      navigate("/dashboard/payment", {
        state: { 
          course, 
          registration: {
            ...form,
            id: createdRegistration.id,
            status: createdRegistration.status,
          }
        },
      });
      toast.success("Registration saved! Proceed to payment.");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (val) => {
    if (!val) return "Free";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(val);
  };

  if (loading) return <Loader />;

  if (!course) {
    return (
      <div className="empty-state">
        <p className="empty-state-icon">🔍</p>
        <p style={{ fontSize: 20, color: "var(--text-muted)", marginBottom: 16 }}>
          Course not found
        </p>
        <button
          onClick={() => navigate("/dashboard/courses")}
          className="btn-primary"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="registration-page space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <h1>Course Registration</h1>
        <p>Fill in your details to register for this course.</p>
      </motion.div>

      {/* Course Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
        style={{ padding: 24 }}
      >
        <div className="course-info-card">
          <img
            src={course.image}
            alt={course.name}
            className="course-info-image"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600";
            }}
          />
          <div className="course-info-details">
            <h3>{course.name}</h3>
            {course.description && <p>{course.description}</p>}
            <p className="course-info-price">
              {formatPrice(course.amount)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
        style={{ padding: 32 }}
      >
        <form onSubmit={submit} className="form-space">
          <div className="form-row">
            <div>
              <label className="input-label">First Name *</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handle}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Surname *</label>
              <input
                name="surname"
                value={form.surname}
                onChange={handle}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Phone Number *</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handle}
              className="input-field"
              required
            />
          </div>

          <div className="form-row">
            <div>
              <label className="input-label">University</label>
              <input
                name="university"
                value={form.university}
                onChange={handle}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Level</label>
              <select
                name="level"
                value={form.level}
                onChange={handle}
                className="input-field"
              >
                <option value="">Select level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="Graduate">Graduate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div>
              <label className="input-label">Guardian Name</label>
              <input
                name="guardian_name"
                value={form.guardian_name}
                onChange={handle}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Guardian Phone</label>
              <input
                name="guardian_phone"
                type="tel"
                value={form.guardian_phone}
                onChange={handle}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Referral Code</label>
            <input
              name="referral_code"
              value={form.referral_code}
              onChange={handle}
              placeholder="Enter referral code (optional)"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary btn-full btn-lg"
            style={{ gap: 8 }}
          >
            {submitting && <Spinner size="sm" />}
            Proceed to Payment
          </button>
        </form>
      </motion.div>
    </div>
  );
}