import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import Loader from "../../components/ui/Loader";
import { useToast } from "../../context/ToastContext";
import { HiMagnifyingGlass, HiArrowDownTray, HiStar, HiPencil, HiCheck, HiXMark } from "react-icons/hi2";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState("");
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get("/admin/users"); setUsers(res.data.users || res.data); }
      catch { setUsers([]); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      console.log(`Updating user ${userId} to role ${newRole}`);
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      console.log("Role update response:", res.data);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingId(null);
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error("Failed to update role:", error);
      const errorMsg = error.response?.data?.detail || "Failed to update user role";
      toast.error(errorMsg);
    }
  };

  const filtered = users.filter((u) => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const exportCSV = () => {
    const csv = "Name,Email,Phone,Role,Referral Code,Payment Status\n" + users.map((u) => `${u.full_name},${u.email},${u.phone_number},${u.role},${u.referral_code || ""},${u.payment_status || "N/A"}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "users.csv"; a.click();
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'badge-danger';
      case 'ambassador': return 'badge-warning';
      default: return 'badge-success';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="admin-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Users</h1>
          <p>{users.length} total users</p>
        </div>
        <button onClick={exportCSV} className="btn-outline" style={{ gap: 8, fontSize: 14, padding: "8px 16px" }}>
          <HiArrowDownTray style={{ width: 16, height: 16 }} /> Export CSV
        </button>
      </motion.div>

      <div className="search-bar">
        <div className="input-group">
          <HiMagnifyingGlass className="input-icon-left" style={{ width: 20, height: 20 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field input-field-with-icon" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ overflow: "hidden" }}>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Referral Code</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">No users found</td></tr>
              ) : (
                filtered.map((u, i) => (
                  <motion.tr key={u.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div className="table-user-cell">
                        <div className="table-avatar">{u.full_name?.charAt(0).toUpperCase() || "U"}</div>
                        <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{u.full_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                    <td style={{ color: "var(--text-muted)" }}>{u.phone_number}</td>
                    <td>
                      {editingId === u.id ? (
                        <select value={editingRole} onChange={(e) => setEditingRole(e.target.value)} className="input-field" style={{ padding: "4px 8px", fontSize: 12 }}>
                          <option value="user">User</option>
                          <option value="ambassador">Ambassador</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                          {u.role === 'ambassador' && <HiStar style={{ width: 12, height: 12, marginRight: 4 }} />}
                          {u.role || "user"}
                        </span>
                      )}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>{u.referral_code || "-"}</td>
                    <td>
                      {editingId === u.id ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => handleRoleChange(u.id, editingRole)} className="btn-icon btn-icon-success" title="Confirm" style={{ padding: 4 }}><HiCheck style={{ width: 16, height: 16 }} /></button>
                          <button onClick={() => setEditingId(null)} className="btn-icon btn-icon-danger" title="Cancel" style={{ padding: 4 }}><HiXMark style={{ width: 16, height: 16 }} /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(u.id); setEditingRole(u.role || "user"); }} className="btn-icon" title="Edit Role" disabled={u.role === 'admin'} style={{ padding: 4, opacity: u.role === 'admin' ? 0.5 : 1 }}><HiPencil style={{ width: 16, height: 16 }} /></button>
                      )}
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
