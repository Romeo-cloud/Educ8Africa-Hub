import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import Loader, { Spinner } from "../../components/ui/Loader";
import { HiPlus, HiPencil, HiTrash, HiAcademicCap } from "react-icons/hi2";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const toast = useToast();

  // Match backend schema: course_name, description, amount, welcome_note
  const emptyForm = { course_name: "", description: "", amount: "", welcome_note: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      // Backend returns { courses: [...], total: ... } or just [...]
      setCourses(res.data.courses || res.data || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
      toast.error("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      course_name: course.course_name,
      description: course.description || "",
      amount: course.amount,
      welcome_note: course.welcome_note || "",
    });
    setModalOpen(true);
  };

  // ─── CREATE & UPDATE ───
  const save = async (e) => {
    e.preventDefault();
    if (!form.course_name || !form.amount) {
      return toast.warning("Course name and amount are required");
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (editing) {
        // Update logic matches CourseUpdateRequest
        const res = await api.put(`/courses/${editing.id}`, payload);
        setCourses((prev) =>
          prev.map((c) => (c.id === editing.id ? res.data : c))
        );
        toast.success("Course updated successfully!");
      } else {
        // Create logic matches CourseCreateRequest
        const res = await api.post("/courses", payload);
        setCourses((prev) => [...prev, res.data]);
        toast.success("Course created successfully!");
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      const msg = err.response?.data?.detail 
        ? (typeof err.response.data.detail === 'string' 
            ? err.response.data.detail 
            : "Validation error")
        : "Failed to save course";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── DELETE FUNCTIONALITY ───
  const handleDelete = async (courseId) => {
    // 1. Confirm with user
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      // 2. Call Backend DELETE Endpoint
      await api.delete(`/courses/${courseId}`);

      // 3. Remove from UI immediately
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      
      toast.success("Course deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete course. It may have active enrollments.");
    }
  };

  const formatPrice = (val) =>
    new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(val);

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-header"
      >
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Courses</h1>
          <p>Manage all training courses available to students.</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ gap: 8 }}>
          <HiPlus style={{ width: 20, height: 20 }} />
          <span>Create Course</span>
        </button>
      </motion.div>

      {/* ── Grid ── */}
      <div className="admin-course-grid">
        {courses.length === 0 ? (
          <div className="card" style={{ gridColumn: "1 / -1", padding: 48, textAlign: "center" }}>
            <div className="icon-box icon-box-lg icon-box-secondary" style={{ margin: "0 auto 16px" }}>
              <HiAcademicCap style={{ width: 32, height: 32 }} />
            </div>
            <h3>No Courses Found</h3>
            <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
              You haven't created any courses yet. Click "Create Course" to start.
            </p>
          </div>
        ) : (
          courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card admin-course-card"
              style={{ padding: 20, display: "flex", flexDirection: "column", height: "100%" }}
            >
              {/* Image Placeholder */}
              <div 
                className="admin-course-card-image" 
                style={{ 
                  background: "linear-gradient(135deg, var(--gray-100), var(--gray-200))",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "var(--gray-400)"
                }}
              >
                <HiAcademicCap style={{ width: 48, height: 48, opacity: 0.5 }} />
              </div>

              <h3 style={{ fontSize: 18, marginBottom: 8 }}>{course.course_name}</h3>
              
              <p className="line-clamp-2" style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, flex: 1 }}>
                {course.description || "No description provided."}
              </p>
              
              <p className="admin-course-price">{formatPrice(course.amount)}</p>
              
              <div className="admin-course-actions">
                <button onClick={() => openEdit(course)} className="btn-edit">
                  <HiPencil style={{ width: 16, height: 16 }} /> Edit
                </button>
                
                {/* ─── DELETE BUTTON ─── */}
                <button onClick={() => handleDelete(course.id)} className="btn-delete">
                  <HiTrash style={{ width: 16, height: 16 }} /> Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Course" : "Create New Course"}
      >
        <form onSubmit={save} className="form-space">
          <div>
            <label className="input-label">Course Name *</label>
            <input
              name="course_name"
              value={form.course_name}
              onChange={handleChange}
              placeholder="e.g. Advanced Web Development"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="What will students learn?"
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label">Amount (GHS) *</label>
            <div className="input-group">
              <input
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Welcome Note (Optional)</label>
            <textarea
              name="welcome_note"
              value={form.welcome_note}
              onChange={handleChange}
              rows={2}
              placeholder="Sent to students after registration..."
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary btn-full"
            style={{ marginTop: 8 }}
          >
            {saving && <Spinner size="sm" />}
            {saving ? "Saving..." : editing ? "Update Course" : "Create Course"}
          </button>
        </form>
      </Modal>
    </div>
  );
}