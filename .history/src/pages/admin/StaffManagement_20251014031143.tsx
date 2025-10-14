import { useState, useEffect } from "react";
import axios from "axios";
import { User, PlusCircle, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const StaffManagement = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Staff Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          <PlusCircle className="w-5 h-5" /> Add Staff
        </button>
      </div>

      {loading ? (
        <p>Loading staff...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-[#032352] text-white">
              <tr>
                {["Email", "Role", "Last Login", "Actions"].map((h, idx) => (
                  <th key={idx} className="py-2 px-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.length ? staff.map((s, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}>
                  <td className="py-2 px-3">{s.email}</td>
                  <td className="py-2 px-3">{s.role}</td>
                  <td className="py-2 px-3">{new Date(s.lastLogin).toLocaleString()}</td>
                  <td className="py-2 px-3 flex gap-2">
                    <button className="p-1 rounded hover:bg-gray-200"><Edit className="w-4 h-4" /></button>
                    <button className="p-1 rounded hover:bg-red-200"><Trash2 className="w-4 h-4 text-red-600" /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500 italic">No staff found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
