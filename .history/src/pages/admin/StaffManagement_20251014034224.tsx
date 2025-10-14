import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PlusCircle, Edit, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "..//"; // import reusable footer

interface Staff {
  _id: string;
  email: string;
  role: string;
  lastLogin: string;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ email: "", role: "Admin", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(res.data.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ email: "", role: "Admin", password: "" });
    setShowModal(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({ email: staff.email, role: staff.role, password: "" });
    setShowModal(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem("adminToken");
      if (editingStaff) {
        await axios.put(`http://localhost:5000/api/admin/staff/${editingStaff._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:5000/api/admin/staff", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      fetchStaff();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/admin/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen space-y-6 p-4 bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-[#032352] text-white rounded hover:bg-blue-700">
          <PlusCircle className="w-5 h-5" /> Add Staff
        </button>
      </div>

      {/* Staff Table */}
      {loading ? (
        <p className="text-gray-500">Loading staff...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-[#032352] text-white">
              <tr>
                {["Email", "Role", "Last Login", "Actions"].map((h, idx) => (
                  <th key={idx} className="py-3 px-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.length ? staff.map((s, idx) => (
                <tr key={s._id} className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}>
                  <td className="py-2 px-4">{s.email}</td>
                  <td className="py-2 px-4">{s.role}</td>
                  <td className="py-2 px-4">{new Date(s.lastLogin).toLocaleString()}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button onClick={() => openEditModal(s)} className="p-1 rounded hover:bg-gray-200">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="p-1 rounded hover:bg-red-200">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500 italic">No staff found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden"
          >
            <div className="bg-[#032352] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-white" />
                <h3 className="text-white text-lg font-semibold">
                  {editingStaff ? "Edit Staff" : "Add New Staff"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#032352] focus:border-[#032352] shadow-sm"
                  placeholder="Enter user email"
                />
              </div>

              {!editingStaff && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-[#032352] focus:border-[#032352] shadow-sm"
                    placeholder="Enter temporary password"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#032352] focus:border-[#032352] shadow-sm"
                >
                  <option value="Admin">Admin</option>
                  <option value="Super-Admin">Super-Admin</option>
                </select>
              </div>

              {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-[#032352] hover:bg-blue-800 text-white font-semibold rounded-lg shadow-md transition-all"
              >
                {submitting ? "Saving..." : "Save Staff"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StaffManagement;
