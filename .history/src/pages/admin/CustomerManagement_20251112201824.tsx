import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import Footer from "./Footer";

interface Customer {
  _id: string;
  customerId: string;
  companyInfo: {
    companyName: string;
    companyEmail: string;
    primaryName: string;
    primaryEmail: string;
    primaryPhone: string;
    secondaryName: string;
    secondaryEmail: string;
    secondaryPhone: string;
  };
  awsSetup: {
    numberOfAccounts: number;
    selectedAccounts: number;
    moreThanFive: string;
  };
  aliases: {
    aliases: Record<string, string>;
  };
  agreements: {
    agree: boolean;
    acknowledge: boolean;
    confirm: boolean;
  };
  createdAt: string;
  lastUpdated: string;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "https://api.onboardingportal.cloudsentrics.org/api/admin/customers",
        "https://api.onboardingportal.cloudsentrics.org/api/admin/customers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Deleting this customer will remove all related data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(
          `https://api.onboardingportal.cloudsentrics.org/api/admin/customers/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Customer deleted successfully");
        setCustomers(prev => prev.filter(c => c._id !== id));
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete customer");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-500">Loading customers...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-[#032352] text-white">
                <tr>
                  {[
                    "Customer ID",
                    "Company Name",
                    "Primary Contact",
                    "AWS Accounts",
                    "Alias",
                    "Created At",
                    "Actions",
                  ].map((h, idx) => (
                    <th key={idx} className="py-3 px-4 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.length ? (
                  customers.map((c, idx) => (
                    <tr
                      key={c._id}
                      className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                    >
                      <td className="py-2 px-4">{c.customerId}</td>
                      <td className="py-2 px-4 font-semibold">{c.companyInfo?.companyName}</td>
                      <td className="py-2 px-4">
                        {c.companyInfo?.primaryName} <br />
                        <span className="text-xs text-gray-500">{c.companyInfo?.primaryEmail}</span>
                      </td>
                      <td className="py-2 px-4 text-center">
                        {c.awsSetup?.numberOfAccounts || 0}
                      </td>
                      <td className="py-2 px-4">
                        {Object.values(c.aliases?.aliases || {}).join(", ") || "-"}
                      </td>
                      <td className="py-2 px-4">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 flex gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1 rounded hover:bg-blue-100"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1 rounded hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500 italic">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-[#032352] p-4 flex justify-between items-center">
                <h3 className="text-white font-semibold">
                  Customer Details - {selectedCustomer.customerId}
                </h3>
                <button onClick={() => setSelectedCustomer(null)} className="text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-3 text-sm">
                <p><strong>Company Name:</strong> {selectedCustomer.companyInfo?.companyName}</p>
                <p><strong>Company Email:</strong> {selectedCustomer.companyInfo?.companyEmail}</p>
                <p><strong>Primary Contact:</strong> {selectedCustomer.companyInfo?.primaryName} ({selectedCustomer.companyInfo?.primaryEmail})</p>
                <p><strong>Primary Phone:</strong> {selectedCustomer.companyInfo?.primaryPhone}</p>
                <p><strong>Secondary Contact:</strong> {selectedCustomer.companyInfo?.secondaryName}</p>
                <p><strong>Secondary Email:</strong> {selectedCustomer.companyInfo?.secondaryEmail}</p>
                <p><strong>Secondary Phone:</strong> {selectedCustomer.companyInfo?.secondaryPhone}</p>
                <p><strong>AWS Accounts:</strong> {selectedCustomer.awsSetup?.numberOfAccounts}</p>
                <p><strong>Aliases:</strong> {Object.values(selectedCustomer.aliases?.aliases || {}).join(", ") || "N/A"}</p>
                <p><strong>Agreements:</strong> {selectedCustomer.agreements?.agree ? "✅ Agreed" : "❌ Not Agreed"}</p>
                <p><strong>Created:</strong> {new Date(selectedCustomer.createdAt).toLocaleString()}</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default CustomerManagement;
