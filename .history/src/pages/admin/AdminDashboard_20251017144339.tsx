import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import {
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    CheckSquare,
    Eye,
    Search,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

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

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        totalRequests: 0,
        todo: 0,
        inProgress: 0,
        inReview: 0,
        done: 0,
        issues: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("adminToken"); // ← get token from login
            const response = await axios.get("https://api.onboardingportal.cloudsentrics.org/api/admin/dashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data || {};
            setDashboardData({
                totalRequests: Number(data.totalRequests) || 0,
                todo: Number(data.todo) || 0,
                inProgress: Number(data.inProgress) || 0,
                inReview: Number(data.inReview) || 0,
                done: Number(data.done) || 0,
                issues: data.issues || [],
            });
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const stats = [
        { label: "Total Requests", value: dashboardData.totalRequests, icon: FileText },
        { label: "To Do", value: dashboardData.todo, icon: Clock },
        { label: "In Progress", value: dashboardData.inProgress, icon: CheckCircle },
        { label: "In Review", value: dashboardData.inReview, icon: AlertTriangle },
        { label: "Done", value: dashboardData.done, icon: CheckSquare },
    ];

    const counts = stats.map(item => useCountUp(Number(item.value) || 0));

    const chartData = [
        { name: "To Do", value: dashboardData.todo, color: "#f97316" },
        { name: "In Progress", value: dashboardData.inProgress, color: "#3b82f6" },
        { name: "In Review", value: dashboardData.inReview, color: "#facc15" },
        { name: "Done", value: dashboardData.done, color: "#16a34a" },
    ];

    const filteredIssues = useMemo(() => {
        return (
            dashboardData.issues?.filter(issue => {
                const matchesSearch =
                    issue.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    issue.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    issue.jiraKey.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus =
                    statusFilter === "All" || issue.status.toLowerCase() === statusFilter.toLowerCase();
                return matchesSearch && matchesStatus;
            }) || []
        );
    }, [dashboardData.issues, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);
    const paginatedIssues = filteredIssues.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const goToPrev = () => setCurrentPage(p => Math.max(p - 1, 1));
    const goToNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Loading dashboard...
            </div>
        );

    if (error)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
                <p>{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    <RefreshCcw className="w-5 h-5" /> Retry
                </button>
            </div>
        );

    return (
        <div className="space-y-10 bg-gray-100 min-h-screen p-3 sm:p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {stats.map((item, idx) => {
                    const count = counts[idx];
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            className="p-4 sm:p-6 md:p-8 min-h-[140px] sm:min-h-[160px] rounded-2xl shadow-md flex items-center gap-3 sm:gap-5 hover:shadow-xl transition bg-white"
                        >
                            <div className="p-3 sm:p-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-700" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
                                    {String(count)}
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base mt-1 opacity-80">
                                    {item.label}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Table + Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Issues Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:col-span-2 overflow-hidden"
                >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6 gap-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                            Recent Jira Issues
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search issues..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs sm:text-sm border rounded-lg focus:ring-[#032352] focus:border-[#032352] shadow-sm"
                                />
                            </div>
                            <select
                                className="border rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:ring-[#032352] focus:border-[#032352] shadow-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option>All</option>
                                <option>To Do</option>
                                <option>In Progress</option>
                                <option>In Review</option>
                                <option>Done</option>
                            </select>
                            <button
                                onClick={fetchDashboardData}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm"
                            >
                                <RefreshCcw className="w-4 h-4" /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Responsive Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full table-auto border-collapse text-xs sm:text-sm">
                            <thead className="bg-[#032352] text-white sticky top-0 shadow-sm">
                                <tr>
                                    {["Type", "Status", "Created", "Updated", "Action"].map((head, idx) => (
                                        <th
                                            key={idx}
                                            className={`py-3 px-3 font-medium text-left ${head === "Action" ? "text-center" : ""
                                                }`}
                                        >
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedIssues.length > 0 ? (
                                    paginatedIssues.map((issue, idx) => (
                                        <tr
                                            key={idx}
                                            className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                                } hover:bg-gray-100`}
                                        >
                                            <td className="py-2 px-3">{issue.type}</td>
                                            <td className="py-2 px-3">{issue.status}</td>
                                            <td className="py-2 px-3">
                                                {new Date(issue.created).toLocaleDateString()}
                                            </td>
                                            <td className="py-2 px-3">
                                                {new Date(issue.updated).toLocaleDateString()}
                                            </td>
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
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-6 text-center text-gray-500 italic"
                                        >
                                            No issues found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 sm:gap-3 mt-4 items-center text-xs sm:text-sm">
                            <button
                                onClick={goToPrev}
                                disabled={currentPage === 1}
                                className="px-2 sm:px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                                <ChevronLeft />
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={goToNext}
                                disabled={currentPage === totalPages}
                                className="px-2 sm:px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
                >
                    <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800 text-center sm:text-left">
                        Request Status Overview
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={3}
                                isAnimationActive={true}
                                animationDuration={1200}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4">
                        {chartData.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                                <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
