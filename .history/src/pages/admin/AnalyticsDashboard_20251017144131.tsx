import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList
} from "recharts";
import { motion } from "framer-motion";
import { Clock, CheckCircle, FileText, AlertTriangle, CheckSquare } from "lucide-react";
import Footer from "./Footer"; // make sure your Footer component is exported

// Function to export CSV
const exportToCSV = (data: any[], filename = "analytics.csv") => {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));
  data.forEach(row => {
    csvRows.push(headers.map(field => row[field]).join(","));
  });
  const csvData = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(csvData);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState<any>({
    totalRequests: 0,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
  });

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("https://api.onboardingportal.cloudsentrics.org/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const pieData = [
    { name: "To Do", value: data.todo, color: "#f97316" },
    { name: "In Progress", value: data.inProgress, color: "#3b82f6" },
    { name: "In Review", value: data.inReview, color: "#facc15" },
    { name: "Done", value: data.done, color: "#16a34a" },
  ];

  const barData = pieData.map(item => ({ status: item.name, count: item.value }));

  const stats = [
    { label: "Total Requests", value: data.totalRequests, icon: FileText },
    { label: "To Do", value: data.todo, icon: Clock },
    { label: "In Progress", value: data.inProgress, icon: CheckCircle },
    { label: "In Review", value: data.inReview, icon: AlertTriangle },
    { label: "Done", value: data.done, icon: CheckSquare },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 space-y-8 p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                className="p-6 rounded-2xl shadow bg-white flex gap-4 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="p-4 rounded-full bg-gray-100">
                  <Icon className="w-10 h-10 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{item.value}</h3>
                  <p className="text-sm mt-1">{item.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <motion.div
            className="bg-white rounded-2xl shadow p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Request Status Overview</h3>
              <button
                className="px-3 py-1 bg-[#032352] text-white rounded hover:bg-blue-800 text-sm"
                onClick={() => exportToCSV(barData)}
              >
                Export CSV
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#fff" />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            className="bg-white rounded-2xl shadow p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold text-gray-800 mb-4">Request Counts by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6">
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
