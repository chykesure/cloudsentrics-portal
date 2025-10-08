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

// Count animation hook
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

interface Issue {
  type: string;
  status: string;
  created: string;
  updated: string;
  jiraKey: string;
}

interface DashboardData {
  totalRequests: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  issues: Issue[];
}

const DashboardHome = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = "polycarpchike@gmail.com"; // replace with dynamic user if needed
        const res = await axios.get(`/api/dashboard/${email}`);
        setData(res.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading dashboard...</p>;
  if (!data) return <p className="p-4">No data available.</p>;

  const stats = [
    { label: "Total Requests", value: data.totalRequests, icon: FileText, color: "from-[#032352] to-[#3b82f6]" },
    { label: "To Do", value: data.todo, icon: Clock, color: "from-rose-500 to-orange-400" },
    { label: "In Progress", value: data.inProgress, icon: CheckCircle, color: "from-emerald-600 to-teal-500" },
    { label: "In Review", value: data.inReview, icon: AlertTriangle, color: "from-yellow-400 to-orange-500" },
    { label: "Done", value: data.done, icon: CheckSquare, color: "from-green-600 to-teal-500" },
  ];

  const pieData = [
    { name: "To Do", value: data.todo, color: "#f59e0b" },
    { name: "In Progress", value: data.inProgress, color: "#2563eb" },
    { name: "In Review", value: data.inReview, color: "#eab308" },
    { name: "Done", value: data.done, color: "#16a34a" },
  ];

  return (
    <div className="space-y-10 bg-gray-100 min-h-screen p-4 sm:p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((item, idx) => {
          const count = useCountUp(item.value);
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${item.color} p-6 rounded-2xl shadow-lg flex items-center gap-4 text-white hover:shadow-2xl transition`}
            >
              <div className="p-4 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold">{count}</h3>
                <p className="text-sm mt-1 opacity-90">{item.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Issues Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Jira Requests</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-3 py-1.5 border rounded-lg text-sm focus:ring-[#032352] focus:border-[#032352]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm table-fixed border-collapse">
              <thead className="bg-[#032352] text-white sticky top-0">
                <tr>
                  {["Type", "Status", "Created", "Updated", "Action"].map((head, idx) => (
                    <th key={idx} className="py-2 px-3 text-left">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.issues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500 italic">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  data.issues.map((issue, idx) => (
                    <tr
                      key={idx}
                      className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                    >
                      <td className="py-2 px-3">{issue.type}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                            issue.status.toLowerCase().includes("done")
                              ? "bg-green-100 text-green-700"
                              : issue.status.toLowerCase().includes("in progress")
                              ? "bg-blue-100 text-blue-700"
                              : issue.status.toLowerCase().includes("in review")
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">{new Date(issue.created).toLocaleString()}</td>
                      <td className="py-2 px-3">{new Date(issue.updated).toLocaleString()}</td>
                      <td className="py-2 px-3 text-center">
                        <button className="p-2 rounded-full hover:bg-gray-200 transition" title="View">
                          <Eye className="h-5 w-5 text-[#032352]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Request Status Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="#fff" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;
