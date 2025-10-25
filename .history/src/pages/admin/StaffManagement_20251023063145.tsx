import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PlusCircle, Edit, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "./Footer";

interface Staff {
  _id: string;
  email: string;
  role: string;
  lastLogin: string;
  active: boolean;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<{ email: string; role: string }>({
    email: "",
    role: "readonly",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // ✅ Fetch current user role and staff list
  useEffect(() => {
    const role = localStorage.getItem("adminRole");
    console.log("Detected role from localStorage:", role);

    if (role) {
      // normalize everything: lowercase, remove underscores/spaces, unify with hyphen
      const normalized = role.trim().toLowerCase().replace(/[_\s]+/g, "-");
      setCurrentUserRole(normalized);
    }

    fetchStaff();
  }, []);

  // ✅ Fetch staff list
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      //const res = await axios.get("https://api.onboardingportal.cloudsentrics.org/api/admin/staff", {
      const res = await axios.get("https://api.onboardingportal.cloudsentrics.org/api/admin/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(res.data.staff || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Open Add Staff Modal (Auto-password feature)
  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ email: "", role: "readonly" });
    setShowModal(true);
  };

  // ✅ Open Edit Modal (You don't handle password here)
  const openEditModal = (s: Staff) => {
    setEditingStaff(s);
    setFormData({ email: s.email, role: s.role.toLowerCase() });
    setShowModal(true);
  };

  // ✅ Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit Add/Edit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem("adminToken");
      if (editingStaff) {
        await axios.put(
          `https://api.onboardingportal.cloudsentrics.org/api/admin/staff/${editingStaff._id}`,
          //`https://api.onboardingportal.cloudsentrics.org/api/admin/staff/${editingStaff._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("/api/admin/staff", formData, {
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

  // ✅ Delete staff (only admin)
  const handleDelete = async (id: string) => {
    if (currentUserRole !== "admin") {
      alert("Only admin can delete staff.");
      return;
    }
    if (!confirm("Are you sure you want to delete this staff?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      //await axios.delete(`https://api.onboardingportal.cloudsentrics.org/api/admin/staff/${id}`, {
      await axios.delete(`https://api.onboardingportal.cloudsentrics.org/api/admin/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStaff();
    } catch (err) {
      console.error("Error deleting staff:", err);
    }
  };

  // ✅ Toggle active status (only admin)
  const toggleActive = async (s: Staff) => {
    if (currentUserRole !== "admin") return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        //`https://api.onboardingportal.cloudsentrics.org/api/admin/staff/${s._id}/toggle`,
        `https://api.onboardingportal.cloudsentrics.org/api/admin/staff/${s._id}/toggle`,
        { active: !s.active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>

          {/* ✅ Add Staff Button (only admin can click) */}
          <button
            onClick={openAddModal}
            disabled={currentUserRole !== "admin"}
            className={`flex items-center gap-2 px-4 py-2 rounded ${currentUserRole === "admin"
              ? "bg-[#032352] text-white hover:bg-blue-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            <PlusCircle className="w-5 h-5" /> Add Staff
          </button>
        </div>

        {/* ✅ Staff Table */}
        {loading ? (
          <p className="text-gray-500">Loading staff...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-[#032352] text-white">
                <tr>
                  {["Email", "Role", "Active", "Last Login", "Actions"].map((h, idx) => (
                    <th key={idx} className="py-3 px-4 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.length ? (
                  staff.map((s, idx) => (
                    <tr
                      key={s._id}
                      className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                    >
                      <td className="py-2 px-4">{s.email}</td>
                      <td className="py-2 px-4 capitalize">{s.role}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => toggleActive(s)}
                          disabled={currentUserRole !== "admin"}
                          className={`p-1 rounded ${s.active
                            ? "bg-green-100 hover:bg-green-200"
                            : "bg-red-100 hover:bg-red-200"
                            } ${currentUserRole !== "admin" ? "cursor-not-allowed opacity-50" : ""
                            }`}
                        >
                          {s.active ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-red-600" />
                          )}
                        </button>
                      </td>
                      <td className="py-2 px-4">
                        {s.lastLogin ? new Date(s.lastLogin).toLocaleString() : "Never"}
                      </td>
                      <td className="py-2 px-4 flex gap-2">
                        {/* ✅ Edit Button */}
                        <button
                          onClick={() => openEditModal(s)}
                          disabled={currentUserRole !== "admin"}
                          className={`p-1 rounded hover:bg-gray-200 ${currentUserRole !== "admin"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                            }`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* ✅ Delete Button (fixed clickable for admin) */}
                        <button
                          onClick={() => handleDelete(s._id)}
                          disabled={currentUserRole !== "admin"}
                          className={`p-1 rounded hover:bg-red-200 ${currentUserRole !== "admin"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                            }`}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                      No staff found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ Add/Edit Modal */}
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
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200"
                >
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



                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={currentUserRole !== "admin"}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-[#032352] focus:border-[#032352] shadow-sm ${currentUserRole !== "admin" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="readonly">Readonly</option>
                    <option value="admin">Admin</option>
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
      </div>

      {/* ✅ Fixed Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default StaffManagement;
