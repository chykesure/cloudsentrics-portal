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
    { name: "Approved", value: 20, color: "#16a34a" }, // green
    { name: "In progress", value: 10, color: "#032352" }, // brand navy
    { name: "Pending", value: 5, color: "#f97316" }, // orange
  ];

  const stats = [
    { label: "Total Portal Request", value: 25, icon: FileText, color: "text-[#032352]" },
    { label: "Approved Portal Request", value: 20, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending Portal Request", value: 5, icon: Clock, color: "text-orange-500" },
  ];

  const issues = [
    { label: "Total Issue Reported", value: 17, icon: AlertTriangle, color: "bg-[#032352]" },
    { label: "Total Issue Solved", value: 12, icon: CheckSquare, color: "bg-green-600" },
    { label: "Pending Issues", value: 5, icon: XCircle, color: "bg-[#032352]" },
  ];

  const requests = [
    { type: "Additional AWS Accounts", date: "Aug 15, 2025", time: "10:34am", status: "Pending", badge: "bg-orange-100 text-orange-700" },
    { type: "Additional S3 Buckets", date: "Aug 15, 2025", time: "09:20am", status: "Approved", badge: "bg-green-100 text-green-700" },
    { type: "IAM Policy Update", date: "Aug 14, 2025", time: "03:45pm", status: "Approved", badge: "bg-green-100 text-green-700" },
    { type: "Database Backup", date: "Aug 13, 2025", time: "11:15am", status: "Pending", badge: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="space-y-8">
      {/* ==== Stats Cards ==== */}
      <div className="space-y-6">
        {/* First row (white cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((item, idx) => {
            const count = useCountUp(item.value);
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 hover:shadow-lg transition"
              >
                <div className={`p-3 rounded-full bg-gray-100 ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{count}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Second row (colored cards) */}
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
                className={`${item.color} p-6 rounded-xl shadow-md flex items-center gap-4 hover:shadow-lg transition`}
              >
                <div className="p-3 rounded-full bg-white/20">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">{count}</h3>
                  <p className="text-white text-sm mt-1">{item.label}</p>
                </div>
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
            <h3 className="text-lg font-semibold text-gray-800">Recent Portal Requests</h3>
            <select className="border rounded-lg px-3 py-1 text-sm focus:ring-[#032352] focus:border-[#032352]">
              <option>Sort by: Approved</option>
              <option>Sort by: Pending</option>
            </select>
          </div>

          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 px-3">Request Type</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((row, idx) => (
                <tr key={idx} className="bg-gray-50 hover:bg-gray-100 transition rounded-lg">
                  <td className="py-3 px-3 font-medium">{row.type}</td>
                  <td className="py-3 px-3">{row.date}</td>
                  <td className="py-3 px-3">{row.time}</td>
                  <td className="py-3 px-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.badge}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Request Status Identification</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
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
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;
