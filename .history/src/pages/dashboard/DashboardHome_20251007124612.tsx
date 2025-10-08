import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  CheckSquare,
  XCircle,
  Eye,
  Search,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Count-up hook
const useCountUp = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

// Separate component for animated count
const CountUpDisplay = ({ end }: { end: number }) => {
  const count = useCountUp(end);
  return <>{count}</>;
};

interface JiraIssue {
  type: string;
  status: string;
  created: string;
  updated: string;
  jiraKey: string;
}

interface DashboardStats {
  totalRequests: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  issues: JiraIssue[];
}

const DashboardHome = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Fetch Jira dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/dashboard"); // your backend endpoint
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!dashboardData) return <p>No data available</p>;

  // Prepare stats cards
  const stats = [
    {
      label: "To Do Requests",
      value: dashboardData.todo,
      icon: FileText,
      color: "from-blue-800 to-blue-500",
    },
    {
      label: "In Progress Requests",
      value: dashboardData.inProgress,
      icon: Clock,
      color: "from-orange-600 to-yellow-400",
    },
    {
      label: "In Review Requests",
      value: dashboardData.inReview,
      icon: AlertTriangle,
      color: "from-purple-600 to-pink-500",
    },
    {
      label: "Done Requests",
      value: dashboardData.done,
      icon: CheckCircle,
      color: "from-green-600 to-teal-500",
    },
  ];

  // Prepare pie chart
  const pieData = [
    { name: "To Do", value: dashboardData.todo, color: "#3b82f6" },
    { name: "In Progress", value: dashboardData.inProgress, color: "#f59e0b" },
    { name: "In Review", value: dashboardData.inReview, color: "#a855f7" },
    { name: "Done", value: dashboardData.done, color: "#16a34a" },
  ];

  return (
    <div className="space-y-10 bg-gray-100 min-h-screen p-4 sm:p-6">
      {/* ==== Stats Cards ==== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-br ${item.color} p-6 rounded-2xl shadow-lg text-white flex items-center gap-4`}
            >
              <div className="p-4 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold">
                  <CountUpDisplay end={item.value} />
                </h3>
                <p className="mt-1">{item.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ==== Table + Chart ==== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:col-span-2">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Jira Issues</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-3 py-1.5 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border-collapse text-sm">
              <thead className="bg-blue-800 text-white sticky top-0">
                <tr>
                  {["Type", "Status", "Created", "Updated", "Action"].map(
                    (head, idx) => (
                      <th key={idx} className="py-2 px-3 text-left">
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {dashboardData.issues.map((issue, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100`}
                  >
                    <td className="py-2 px-3">{issue.type}</td>
                    <td className="py-2 px-3">{issue.status}</td>
                    <td className="py-2 px-3">{new Date(issue.created).toLocaleDateString()}</td>
                    <td className="py-2 px-3">{new Date(issue.updated).toLocaleDateString()}</td>
                    <td className="py-2 px-3 text-center">
                      <a
                        href={`https://polycarpchike.atlassian.net/browse/${issue.jiraKey}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full hover:bg-gray-200 transition"
                      >
                        <Eye className="h-5 w-5 text-blue-700" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Request Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="#fff" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
