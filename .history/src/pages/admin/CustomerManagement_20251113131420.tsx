import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import Footer from "./Footer";

interface Customer {
  _id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const adminToken = localStorage.getItem("token");

  // ---------------- FETCH CUSTOMERS ----------------
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://api.onboardingportal.cloudsentrics.org/api/admin/customers",
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---------------- DELETE CUSTOMER ----------------
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete this customer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `https://api.onboardingportal.cloudsentrics.org/api/admin/customers/${id}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      toast.success("Customer deleted successfully");
      setCustomers((prev) => prev.filter((cust) => cust._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete customer");
    }
  };

  // ---------------- EXPORT CSV ----------------
  const exportToCSV = () => {
    if (!customers.length) return toast.error("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(customers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "customers_list.csv");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="text-center text-gray-500">No customers found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase">
              <tr>
                <th className="py-3 px-6">Company Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Address</th>
                <th className="py-3 px-6">Created At</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust, index) => (
                <motion.tr
                  key={cust._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-6 font-medium text-gray-800">
                    {cust.companyName}
                  </td>
                  <td className="py-3 px-6">{cust.email}</td>
                  <td className="py-3 px-6">{cust.phoneNumber}</td>
                  <td className="py-3 px-6">{cust.address}</td>
                  <td className="py-3 px-6">
                    {new Date(cust.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cust._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Customer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Footer />
    </div>
  );
}
