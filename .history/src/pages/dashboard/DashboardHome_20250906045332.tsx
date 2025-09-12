import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
        { name: "Approved", value: 20, color: "#16a34a" }, // green
        { name: "In progress", value: 10, color: "#032352" }, // brand navy
        { name: "Pending", value: 5, color: "#f97316" }, // orange
    ];

    const stats = [
        { label: "Total Portal Request", value: 25 },
        { label: "Approved Portal Request", value: 20 },
        { label: "Pending Portal Request", value: 5 },
    ];

    const issues = [
        { label: "Total Issue reported", value: 17, color: "bg-[#032352]" },
        { label: "Total Issue Solved", value: 12, color: "bg-green-600" },
        { label: "Pending Issues", value: 5, color: "bg-[#032352]" },
    ];

    const activities = [
        { action: "New portal request submitted", time: "2 mins ago" },
        { action: "Issue marked as resolved", time: "1 hr ago" },
        { action: "Admin approved S3 bucket request", time: "3 hrs ago" },
        { action: "New issue reported", time: "Yesterday" },
    ];

    return (
        <div className="space-y-8">
            {/* ==== Stats Cards ==== */}
            <div className="space-y-6">
                {/* First row (white cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((item, idx) => {
                        const count = useCountUp(item.value);
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition"
                            >
                                <h3 className="text-3xl font-bold text-gray-900">{count}</h3>
                                <p className="text-gray-500 text-sm mt-2">{item.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Second row (colored cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {issues.map((item, idx) => {
                        const count = useCountUp(item.value);
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className={`${item.color} p-6 rounded-xl shadow-md text-center hover:shadow-lg transition`}
                            >
                                <h3 className="text-3xl font-bold text-white">{count}</h3>
                                <p className="text-white text-sm mt-2">{item.label}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ==== Table + Chart Section ==== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table */}
                <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Recent Portal Requests
                        </h3>
                        <select className="border rounded-lg px-3 py-1 text-sm focus:ring-[#032352] focus:border-[#032352]">
                            <option>Sort by: Approved</option>
                            <option>Sort by: Pending</option>
                        </select>
                    </div>

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="py-2">Request Type</th>
                                <th className="py-2">Date</th>
                                <th className="py-2">Time</th>
                                <th className="py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {[
                                {
                                    type: "Additional AWS Accounts",
                                    date: "Aug 15, 2025",
                                    time: "10:34am",
                                    status: "Pending",
                                    color: "bg-orange-100 text-orange-600",
                                },
                                {
                                    type: "Additional S3 Buckets",
                                    date: "Aug 15, 2025",
                                    time: "10:34am",
                                    status: "Approved",
                                    color: "bg-green-100 text-green-600",
                                },
                                {
                                    type: "Additional AWS Accounts",
                                    date: "Aug 15, 2025",
                                    time: "10:34am",
                                    status: "Approved",
                                    color: "bg-green-100 text-green-600",
                                },
                                {
                                    type: "Additional S3 Buckets",
                                    date: "Aug 15, 2025",
                                    time: "10:34am",
                                    status: "Approved",
                                    color: "bg-green-100 text-green-600",
                                },
                                {
                                    type: "Additional S3 Buckets",
                                    date: "Aug 15, 2025",
                                    time: "10:34am",
                                    status: "Approved",
                                    color: "bg-green-100 text-green-600",
                                },
                                {
                                    type: "Additional AWS Accounts",
                                    date: "Aug 15, 2025",
                                    time: "10:34am",
                                    status: "Pending",
                                    color: "bg-orange-100 text-orange-600",
                                },
                            ].map((row, idx) => (
                                <tr key={idx}>
                                    <td className="py-3">{row.type}</td>
                                    <td>{row.date}</td>
                                    <td>{row.time}</td>
                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${row.color}`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Progress bar */}
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">
                            Request Progress
                        </h4>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="h-3 rounded-full"
                                style={{
                                    width: `${(20 / 25) * 100}%`,
                                    backgroundColor: "#032352",
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-md p-6"
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

                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4 text-sm">
                        {data.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                ></span>
                                <span>{item.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ==== Activity Timeline ==== */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Recent Activity
                </h3>
                <ul className="space-y-3">
                    {activities.map((activity, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-[#032352] rounded-full"></span>
                            <p className="text-sm text-gray-700 flex-1">{activity.action}</p>
                            <span className="text-xs text-gray-400">{activity.time}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DashboardHome;
