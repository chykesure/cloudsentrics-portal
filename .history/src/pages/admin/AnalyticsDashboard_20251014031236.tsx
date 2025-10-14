import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Clock, CheckCircle, FileText, AlertTriangle, CheckSquare } from "lucide-react";

const AnalyticsDashboard = () => {
  const [data, setData] = useState<any>({ totalRequests:0, todo:0, inProgress:0, inReview:0, done:0 });

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const chartData = [
    { name: "To Do", value: data.todo, color: "#f97316" },
    { name: "In Progress", value: data.inProgress, color: "#3b82f6" },
    { name: "In Review", value: data.inReview, color: "#facc15" },
    { name: "Done", value: data.done, color: "#16a34a" },
  ];

  const stats = [
    { label: "Total Requests", value: data.totalRequests, icon: FileText },
    { label: "To Do", value: data.todo, icon: Clock },
    { label: "In Progress", value: data.inProgress, icon: CheckCircle },
    { label: "In Review", value: data.inReview, icon: AlertTriangle },
    { label: "Done", value: data.done, icon: CheckSquare },
  ];

  return (
    <div className="space-y-8 p-4 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div key={idx} className="p-6 rounded-2xl shadow bg-white flex gap-4 items-center">
              <div className="p-4 rounded-full bg-gray-100"><Icon className="w-10 h-10 text-gray-700" /></div>
              <div>
                <h3 className="text-3xl font-bold">{item.value}</h3>
                <p className="text-sm mt-1">{item.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Request Status Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="#fff"/>)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
