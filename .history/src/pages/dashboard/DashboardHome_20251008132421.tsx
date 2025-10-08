import { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { CheckCircle, Clock, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";

// CountUp hook for stats animation
const useCountUp = (end: number = 0, duration: number = 1500) => {
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    const target = Number(end) || 0;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

// Types
interface Activity {
  name: string;
  status: string;
  created: string;
  updated: string;
}

interface DashboardData {
  totalTasks: number;
  completed: number;
  pending: number;
  inProgress: number;
  reportsSubmitted: number;
  storageUsed: number; // in GB
  activities: Activity[];
}

const ITEMS_PER_PAGE = 10;

const DashboardHome = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalTasks: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    reportsSubmitted: 0,
    storageUsed: 0,
    activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data from portal backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const companyEmail = user.companyEmail;
      if (!companyEmail) throw new Error("No company email found");

      const response = await fetch(`http://localhost:5000/api/dashboard?companyEmail=${companyEmail}`);
      const data = await response.json();

      setDashboardData({
        totalTasks: data.totalTasks || 0,
        completed: data.completed || 0,
        pending: data.pending || 0,
        inProgress: data.inProgress || 0,
        reportsSubmitted: data.reportsSubmitted || 0,
        storageUsed: data.storageUsed || 0,
        activities: data.activities || [],
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Stats cards
  const stats = [
    { label: "Total Tasks", value: dashboardData.totalTasks, icon: Clock },
    { label: "Completed", value: dashboardData.completed, icon: CheckCircle },
    { label: "Pending", value: dashboardData.pending, icon: Clock },
    { label: "Reports Submitted", value: dashboardData.reportsSubmitted, icon: Clock },
    { label: "Storage Used (GB)", value: dashboardData.storageUsed, icon: Clock },
  ];

  const counts = stats.map(item => useCountUp(Number(item.value) || 0));

  // Pie chart data
  const chartData = [
    { name: "Completed", value: dashboardData.completed, color: "#16a34a" },
    { name: "In Progress", value: dashboardData.inProgress, color: "#3b82f6" },
    { name: "Pending", value: dashboardData.pending, color: "#f97316" },
  ];

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return dashboardData.activities?.filter(activity => {
      const matchesSearch =
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.status.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || activity.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    }) || [];
  }, [dashboardData.activities, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPrev = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goToNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));

  if (loading)
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading dashboard...</div>;

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          <RefreshCcw className="w-5 h-5" /> Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-10 bg-gray-100 min-h-screen p-4 sm:p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((item, idx) => {
          const count = counts[idx];
          const Icon = item.icon;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.04 }}
              className="p-6 sm:p-8 min-h-[160px] rounded-2xl shadow-lg flex items-center gap-4 sm:gap-6 hover:shadow-2xl transition bg-white">
              <div className="p-4 sm:p-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-700" />
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-extrabold">{String(count)}</h3>
                <p className="text-sm sm:text-base mt-2 opacity-90">{item.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activities Table */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Search activities..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-3 pr-3 py-1.5 text-sm border rounded-lg focus:ring-[#032352] focus:border-[#032352] shadow-sm" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:ring-[#032352] focus:border-[#032352] shadow-sm">
                <option>All</option>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Pending</option>
              </select>
              <button onClick={fetchDashboardData} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                <RefreshCcw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full table-fixed border-collapse text-sm">
              <thead className="bg-[#032352] text-white sticky top-0 shadow-sm">
                <tr>
                  {["Name", "Status", "Created", "Updated"].map((head, idx) => (
                    <th key={idx} className="py-3 px-3 font-medium text-left">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.length > 0 ? (
                  paginatedActivities.map((activity, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}>
                      <td className="py-2 px-3">{activity.name}</td>
                      <td className="py-2 px-3">{activity.status}</td>
                      <td className="py-2 px-3">{new Date(activity.created).toLocaleDateString()}</td>
                      <td className="py-2 px-3">{new Date(activity.updated).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500 italic">No activities found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-4 items-center">
              <button onClick={goToPrev} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                <ChevronLeft />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={goToNext} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                <ChevronRight />
              </button>
            </div>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Workflow Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3} isAnimationActive>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {chartData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
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
