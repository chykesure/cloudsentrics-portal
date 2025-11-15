import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Trash2, X, Download } from "lucide-react";
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
  aliases: Record<string, string> | { aliases?: Record<string, string> };
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

  // ------------------- FORMAT ALIASES -------------------
  const formatAliases = (
    aliasesObj?: Record<string, string> | { aliases?: Record<string, string> }
  ) => {
    const obj = aliasesObj && "aliases" in aliasesObj ? aliasesObj.aliases : aliasesObj;
    if (!obj || Object.keys(obj).length === 0) return "-";
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

  // ------------------- DELETE CUSTOMER -------------------
  const handleDelete = async (customer: Customer) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Deleting "${customer.companyInfo.companyName}" will remove all related data.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(
          `https://api.onboardingportal.cloudsentrics.org/api/admin/customers/${customer._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Customer deleted successfully");
        setCustomers(prev => prev.filter(c => c._id !== customer._id));
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete customer");
      }
    }
  };

  // ------------------- CSV EXPORT -------------------
  const exportCSV = () => {
    if (!customers.length) {
      toast.error("No customer data to export");
      return;
    }

    const headers = [
      "S/N",
      "Customer ID",
      "Company Name",
      "Company Email",
      "Primary Name",
      "Primary Email",
      "Primary Phone",
      "Secondary Name",
      "Secondary Email",
      "Secondary Phone",
      "AWS Accounts",
      "Aliases",
      "Created At",
    ];

    const rows = customers.map((c, idx) => [
      idx + 1,
      c.customerId,
      c.companyInfo.companyName,
      c.companyInfo.companyEmail,
      c.companyInfo.primaryName,
      c.companyInfo.primaryEmail,
      c.companyInfo.primaryPhone,
      c.companyInfo.secondaryName || "",
      c.companyInfo.secondaryEmail || "",
      c.companyInfo.secondaryPhone || "",
      c.awsSetup.numberOfAccounts || 0,
      formatAliases(c.aliases),
      new Date(c.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
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
                    "S/N",
                    "Customer ID",
                    "Company Name",
                    "Contacts",
                    "AWS Accounts",
                    "Aliases",
                    "Created At",
                    "Actions",
                  ].map((h, idx) => (
                    <th key={idx} className="py-3 px-4 text-left whitespace-nowrap">
                      {h}
                    </th>
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
                      <td className="py-2 px-4">{idx + 1}</td>
                      <td className="py-2 px-4">{c.customerId}</td>
                      <td className="py-2 px-4 font-semibold">{c.companyInfo?.companyName}</td>
                      <td className="py-2 px-4">
                        <div>
                          <strong>Primary:</strong> {c.companyInfo?.primaryName} <br />
                          <span className="text-xs text-gray-500">
                            {c.companyInfo?.primaryEmail} | {c.companyInfo?.primaryPhone}
                          </span>
                        </div>
                        <div className="mt-1">
                          <strong>Secondary:</strong> {c.companyInfo?.secondaryName || "-"} <br />
                          <span className="text-xs text-gray-500">
                            {c.companyInfo?.secondaryEmail || "-"} | {c.companyInfo?.secondaryPhone || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1 rounded hover:bg-blue-100"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1 rounded hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500 italic">
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
