import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    CheckSquare,
    XCircle,
    Search,
} from "lucide-react";

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
    const data = [
        { name: "Approved", value: 20, color: "#16a34a" },
        { name: "In progress", value: 10, color: "#032352" },
        { name: "Pending", value: 5, color: "#f97316" },
    ];

    const stats = [
        {
            label: "Total Portal Request",
            value: 25,
            icon: FileText,
            color: "text-[#032352]",
        },
        {
            label: "Approved Portal Request",
            value: 20,
            icon: CheckCircle,
            color: "text-green-600",
        },
        {
            label: "Pending Portal Request",
            value: 5,
            icon: Clock,
            color: "text-orange-500",
        },
    ];

    const issues = [
        {
            label: "Total Issue Reported",
            value: 17,
            icon: AlertTriangle,
            color: "bg-[#032352]",
        },
        {
            label: "Total Issue Solved",
            value: 12,
            icon: CheckSquare,
            color: "bg-green-600",
        },
        {
            label: "Pending Issues",
            value: 5,
            icon: XCircle,
            color: "bg-[#032352]",
        },
    ];

    const requests = [
        {
            type: "Additional AWS Accounts",
            date: "Aug 15, 2025",
            time: "10:34am",
            status: "Pending",
        },
        {
            type: "Additional S3 Buckets",
            date: "Aug 15, 2025",
            time: "09:20am",
            status: "Approved",
        },
        {
            type: "IAM Policy Update",
            date: "Aug 14, 2025",
            time: "03:45pm",
            status: "Approved",
        },
        {
            type: "Database Backup",
            date: "Aug 13, 2025",
            time: "11:15am",
            status: "Pending",
        },
        {
            type: "VPC Peering",
            date: "Aug 12, 2025",
            time: "04:00pm",
            status: "Approved",
        },
    ];

    return (
        <div className="space-y-10 bg-gray-100 min-h-screen p-6">
            {/* ==== Stats Cards ==== */}
            <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((item, idx) => {
                        const count = useCountUp(item.value);
                        const Icon = item.icon;

                        // assign gradient colors per card
                        const gradients = [
                            "from-[#032352] to-[#3b82f6]",  // deep blue
                            "from-emerald-600 to-teal-500", // green/teal
                            "from-rose-500 to-orange-400"   // rose/orange
                        ];

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                whileHover={{ scale: 1.04 }}
                                className={`bg-gradient-to-br ${gradients[idx]} p-10 min-h-[200px] rounded-2xl shadow-lg flex items-center gap-8 hover:shadow-2xl transition text-white`}
                            >
                                <div className="p-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <Icon className="h-14 w-14" /> {/* bigger icon */}
                                </div>
                                <div>
                                    <h3 className="text-5xl font-extrabold">{count}</h3> {/* larger number */}
                                    <p className="text-lg mt-2 opacity-90">{item.label}</p> {/* larger label */}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Issues Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {issues.map((item, idx) => {
                        const count = useCountUp(item.value);
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                whileHover={{ scale: 1.03 }}
                                className={`${item.color} p-8 min-h-[150px] rounded-2xl shadow-md flex items-center gap-6 hover:shadow-xl transition`}
                            >
                                <div className="p-4 rounded-full bg-white/30">
                                    <Icon className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-extrabold text-white">{count}</h3>
                                    <p className="text-white text-base mt-1">{item.label}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ==== Table + Chart Section ==== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table */}
                <div className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Recent Portal Requests
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    className="pl-8 pr-3 py-1 text-sm border rounded-lg focus:ring-[#032352] focus:border-[#032352]"
                                />
                            </div>
                            <select className="border rounded-lg px-3 py-1 text-sm focus:ring-[#032352] focus:border-[#032352]">
                                <option>All</option>
                                <option>Approved</option>
                                <option>Pending</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-80 rounded-lg border border-gray-200">
                        <table className="w-full text-sm">
                            <thead className="bg-[#032352] text-white sticky top-0">
                                <tr>
                                    <th className="py-3 px-3 text-left">Request Type</th>
                                    <th className="py-3 px-3">Date</th>
                                    <th className="py-3 px-3">Time</th>
                                    <th className="py-3 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            } hover:bg-gray-100 transition`}
                                    >
                                        <td className="py-3 px-3 font-medium text-gray-800">
                                            {row.type}
                                        </td>
                                        <td className="py-3 px-3">{row.date}</td>
                                        <td className="py-3 px-3">{row.time}</td>
                                        <td className="py-3 px-3">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${row.status === "Approved"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-orange-100 text-orange-700"
                                                    }`}
                                            >
                                                {row.status === "Approved" ? (
                                                    <CheckCircle className="h-3 w-3" />
                                                ) : (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-md p-6"
                >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Request Status Identification
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={50}
                                outerRadius={90}
                                label
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardHome;
