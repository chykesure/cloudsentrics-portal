import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { motion } from "framer-motion";
import { Clock, CheckCircle, FileText, AlertTriangle, CheckSquare } from "lucide-react";

const AnalyticsDashboard = () => {
  const [data, setData] = useState<any>({ totalRequests:0, todo:0, inProgress:0, inReview:0, done:0 });
  const [trendData, setTrendData] = useState<any[]>([]); // line chart data

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);

      // Example: create trend data from API (you can replace this with real data)
      setTrendData(res.data.trend || [
        { date: '2025-10-08', total: 5 },
        { date: '2025-10-09', total: 10 },
        { date: '2025-10-10', total: 8 },
        { date: '2025-10-11', total: 15 },
      ]);
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

  const exportCSV = () => {
    const csvRows = [
      ["Date", "Total Requests"],
      ...trendData.map(item => [item.date, item.total])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "analytics_trend.csv";
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Pie Chart Card */}
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

  {/* Line Chart Card */}
  <div className="bg-white rounded-2xl shadow p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-gray-800">Request Trend Over Time</h3>
      <button onClick={exportCSV} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Export CSV</button>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="todo" stroke="#f97316" strokeWidth={2} />
        <Line type="monotone" dataKey="inProgress" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="done" stroke="#16a34a" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

  );
};

export default AnalyticsDashboard;
