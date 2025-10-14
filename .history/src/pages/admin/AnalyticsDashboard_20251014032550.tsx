import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Clock, CheckCircle, FileText, AlertTriangle, CheckSquare } from "lucide-react";

const COLORS = { todo: "#f97316", inProgress: "#3b82f6", inReview: "#facc15", done: "#16a34a" };

const AnalyticsDashboard = () => {
  const [data, setData] = useState<any>({
    totalRequests: 0,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
    trend: [],
  });

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/dashboard", {
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

  const chartData = [
    { name: "To Do", value: data.todo, color: COLORS.todo },
    { name: "In Progress", value: data.inProgress, color: COLORS.inProgress },
    { name: "In Review", value: data.inReview, color: COLORS.inReview },
    { name: "Done", value: data.done, color: COLORS.done },
  ];

  const stats = [
    { label: "Total Requests", value: data.totalRequests, icon: FileText },
    { label: "To Do", value: data.todo, icon: Clock },
    { label: "In Progress", value: data.inProgress, icon: CheckCircle },
    { label: "In Review", value: data.inReview, icon: AlertTriangle },
    { label: "Done", value: data.done, icon: CheckSquare },
  ];

  const trendData = data.trend || [];

  const exportCSV = () => {
    if (!trendData.length) return;
    const headers = Object.keys(trendData[0]).join(",");
    const rows = trendData.map((row: any) => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "analytics_trend.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 p-4 bg-gray-100 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              className="p-6 rounded-2xl shadow bg-white flex gap-4 items-center"
              initial={{ opacity: 0, y: 30 }}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Request Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="#fff" />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} requests`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart Card */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Request Trend Over Time</h3>
            <button
              onClick={exportCSV}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" label={{ value: "Date", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "Requests", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="todo" stroke={COLORS.todo} strokeWidth={2} dot />
                <Line type="monotone" dataKey="inProgress" stroke={COLORS.inProgress} strokeWidth={2} dot />
                <Line type="monotone" dataKey="inReview" stroke={COLORS.inReview} strokeWidth={2} dot />
                <Line type="monotone" dataKey="done" stroke={COLORS.done} strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No trend data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
