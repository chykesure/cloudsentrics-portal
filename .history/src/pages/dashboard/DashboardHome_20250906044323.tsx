import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const DashboardHome = () => {
  const data = [
    { name: "Approved", value: 20, color: "#16a34a" },
    { name: "In progress", value: 10, color: "#2563eb" },
    { name: "Pending", value: 5, color: "#f97316" },
  ];

  return (
    <div className="space-y-8">
      {/* ==== Stats Cards ==== */}
      <div className="space-y-6">
        {/* First row (white cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Portal Request", value: 25 },
            { label: "Approved Portal Request", value: 20 },
            { label: "Pending Portal Request", value: 5 },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition"
            >
              <h3 className="text-3xl font-bold text-gray-900">{item.value}</h3>
              <p className="text-gray-500 text-sm mt-2">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Second row (colored cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Issue reported", value: 17, color: "bg-blue-800" },
            { label: "Total Issue Solved", value: 12, color: "bg-green-600" },
            { label: "Pending Issues", value: 5, color: "bg-blue-600" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`${item.color} p-6 rounded-xl shadow-md text-center hover:shadow-lg transition`}
            >
              <h3 className="text-3xl font-bold text-white">{item.value}</h3>
              <p className="text-white text-sm mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ==== Table + Chart Section ==== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Portal Requests</h3>
            <select className="border rounded-lg px-3 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
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
                { type: "Additional AWS Accounts", date: "Aug 15, 2025", time: "10:34am", status: "Pending", color: "bg-orange-100 text-orange-600" },
                { type: "Additional S3 Buckets", date: "Aug 15, 2025", time: "10:34am", status: "Approved", color: "bg-green-100 text-green-600" },
                { type: "Additional AWS Accounts", date: "Aug 15, 2025", time: "10:34am", status: "Approved", color: "bg-green-100 text-green-600" },
                { type: "Additional S3 Buckets", date: "Aug 15, 2025", time: "10:34am", status: "Approved", color: "bg-green-100 text-green-600" },
                { type: "Additional S3 Buckets", date: "Aug 15, 2025", time: "10:34am", status: "Approved", color: "bg-green-100 text-green-600" },
                { type: "Additional AWS Accounts", date: "Aug 15, 2025", time: "10:34am", status: "Pending", color: "bg-orange-100 text-orange-600" },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3">{row.type}</td>
                  <td>{row.date}</td>
                  <td>{row.time}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${row.color}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
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
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
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
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
