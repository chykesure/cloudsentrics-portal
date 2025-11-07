import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  CheckSquare,
  RefreshCcw,
} from "lucide-react";

interface Issue {
  type: string;
  status: string;
  created: string;
  updated: string;
  jiraKey: string;
}

interface DashboardData {
  issues: Issue[];
}

const AnalyticDashboard = () => {
  const [data, setData] = useState<DashboardData>({ issues: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch analytics data from your backend (no DB needed)
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://api.onboardingportal.cloudsentrics.org/api/admin/dashboard",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData({ issues: response.data.issues || [] });
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Compute status counts
  const counts = useMemo(() => {
    const c = { todo: 0, inProgress: 0, blocked: 0, done: 0, total: data.issues.length };
    data.issues.forEach((i) => {
      const s = i.status?.toLowerCase();
      if (s.includes("to do")) c.todo++;
      else if (s.includes("in progress")) c.inProgress++;
      else if (s.includes("blocked")) c.blocked++;
      else if (s.includes("done")) c.done++;
    });
    return c;
  }, [data.issues]);

  // ✅ Prepare Bar Chart data
  const barData = [
    { name: "To Do", count: counts.todo },
    { name: "In Progress", count: counts.inProgress },
    { name: "Blocked", count: counts.blocked },
    { name: "Done", count: counts.done },
  ];

  // ✅ Prepare Line Graph data (trending by created date)
  const trendData = useMemo(() => {
    const grouped: Record<string, number> = {};
    data.issues.forEach((issue) => {
      const date = new Date(issue.created).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }, [data.issues]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading analytics...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-10">
      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, icon: FileText, color: "bg-blue-600" },
          { label: "To Do", value: counts.todo, icon: Clock, color: "bg-orange-500" },
          { label: "In Progress", value: counts.inProgress, icon: CheckCircle, color: "bg-yellow-500" },
          { label: "Done", value: counts.done, icon: CheckSquare, color: "bg-green-600" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className={`flex items-center gap-4 p-4 rounded-2xl text-white shadow-md ${item.color}`}
            >
              <Icon className="w-8 h-8" />
              <div>
                <p className="text-sm">{item.label}</p>
                <h3 className="text-2xl font-bold">{item.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ✅ Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#032352" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticDashboard;
