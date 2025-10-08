import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FileText,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  CheckSquare,
  XCircle,
  Search,
} from "lucide-react";
import axios from "axios";

// Types for clarity
interface RequestType {
  type: string;
  date: string;
  time: string;
  status: string;
}

interface StatsType {
  totalRequests: number;
  approved: number;
  pending: number;
}

interface IssuesType {
  totalReported: number;
  solved: number;
  pending: number;
}

// Counter animation hook
const useCountUp = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState<number>(0);
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

const DashboardHome = () => {
  const [stats, setStats] = useState<StatsType>({
    totalRequests: 0,
    approved: 0,
    pending: 0,
  });

  const [issues, setIssues] = useState<IssuesType>({
    totalReported: 0,
    solved: 0,
    pending: 0,
  });

  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { stats, issues, requests } = response.data;
        setStats(stats || { totalRequests: 0, approved: 0, pending: 0 });
        setIssues(issues || { totalReported: 0, solved: 0, pending: 0 });
        setRequests(requests || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <motion.div
          className="h-16 w-16 border-4 border-t-blue-800 border-b-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  const pieData = [
    { name: "Approved", value: stats.approved || 0, color: "#16a34a" },
    {
      name: "In progress",
      value: (stats.totalRequests || 0) - (stats.approved || 0) - (stats.pending || 0),
      color: "#032352",
    },
    { name: "Pending", value: stats.pending || 0, color: "#f97316" },
  ];

  const statsArray = [
    {
      label: "Total Portal Request",
      value: stats.totalRequests,
      icon: FileText,
      color: "text-[#032352]",
    },
    {
      label: "Approved Portal Request",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Pending Portal Request",
      value: stats.pending,
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  const issuesArray = [
    {
      label: "Total Issue Reported",
      value: issues.totalReported,
      icon: AlertTriangle,
      color: "bg-[#032352]",
    },
    {
      label: "Total Issue Solved",
      value: issues.solved,
      icon: CheckSquare,
      color: "bg-green-600",
    },
    {
      label: "Pending Issues",
      value: issues.pending,
      icon: XCircle,
      color: "bg-[#032352]",
    },
  ];

  return (
    <div className="space-y-10 bg-gray-100 min-h-screen p-4 sm:p-6">
      {/* ==== Stats Cards ==== */}
      <div className="space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsArray.map((item, idx) => {
            const count = useCountUp(item.value);
            const Icon = item.icon;
            const gradients = [
              "from-[#032352] to-[#3b82f6]",
              "from-emerald-600 to-teal-500",
              "from-rose-500 to-orange-400",
            ];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ scale: 1.04 }}
                className={`bg-gradient-to-br ${gradients[idx]} p-6 sm:p-10 min-h-[160px] sm:min-h-[200px] rounded-2xl shadow-lg flex items-center gap-4 sm:gap-8 hover:shadow-2xl transition text-white`}
              >
                <div className="p-4 sm:p-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon className="h-10 w-10 sm:h-14 sm:w-14" />
                </div>
                <div>
                  <h3 className="text-3xl sm:text-5xl font-extrabold">{count}</h3>
                  <p className="text-base sm:text-lg mt-2 opacity-90">{item.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Issues Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {issuesArray.map((item, idx) => {
            const count = useCountUp(item.value);
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ scale: 1.04 }}
                className={`${item.color} p-6 sm:p-10 min-h-[160px] sm:min-h-[200px] rounded-2xl shadow-lg flex items-center gap-4 sm:gap-8 hover:shadow-2xl transition`}
              >
                <div className="p-4 sm:p-6 rounded-full bg-white/30 flex items-center justify-center">
                  <Icon className="h-10 w-10 sm:h-14 sm:w-14 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl sm:text-5xl font-extrabold text-white">{count}</h3>
                  <p className="text-base sm:text-lg mt-2 text-white opacity-90">{item.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ==== Table + Chart Section ==== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:col-span-2"
        >
          {/* Header with search + filter */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
            <h3 className="text-lg font-semibold text-gray-800">Recent Portal Requests</h3>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-sm border rounded-lg focus:ring-[#032352] focus:border-[#032352] shadow-sm"
                />
              </div>
              <select className="border rounded-lg px-3 py-1.5 text-sm focus:ring-[#032352] focus:border-[#032352] shadow-sm">
                <option>All</option>
                <option>Approved</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full table-fixed border-collapse text-sm">
              <thead className="bg-[#032352] text-white sticky top-0 shadow-sm">
                <tr>
                  {["Request Type", "Date", "Time", "Status", "Action"].map((head, idx) => (
                    <th
                      key={idx}
                      className={`py-3 px-3 font-medium text-left ${
                        head === "Action" ? "text-center" : ""
                      }`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500 italic">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((row, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition cursor-pointer`}
                    >
                      <td className="py-3 px-3 font-medium text-gray-800">{row.type}</td>
                      <td className="py-3 px-3 text-gray-600">{row.date}</td>
                      <td className="py-3 px-3 text-gray-600">{row.time}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                            row.status === "Approved" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {row.status === "Approved" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button className="p-2 rounded-full hover:bg-gray-200 transition" title="View">
                          <Eye className="h-5 w-5 text-[#032352]" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Request Status Identification</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3} isAnimationActive animationDuration={1200}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;
