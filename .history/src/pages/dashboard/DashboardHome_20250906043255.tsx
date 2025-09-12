import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const DashboardHome = () => {
  const data = [
    { name: "Approved", value: 20, color: "#16a34a" },
    { name: "In progress", value: 10, color: "#2563eb" },
    { name: "Pending", value: 5, color: "#f97316" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { label: "Total Portal Request", value: 25 },
          { label: "Approved Requests", value: 20 },
          { label: "Pending Requests", value: 5 },
          { label: "Issues Reported", value: 17 },
          { label: "Issues Solved", value: 12 },
          { label: "Pending Issues", value: 5 },
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

      {/* Table + Chart Section */}
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
              <tr>
                <td className="py-3">Additional AWS Accounts</td>
                <td>Aug 15, 2025</td>
                <td>10:34am</td>
                <td>
                  <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-600 text-xs">
                    Pending
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3">Additional S3 Buckets</td>
                <td>Aug 15, 2025</td>
                <td>10:34am</td>
                <td>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-600 text-xs">
                    Approved
                  </span>
                </td>
              </tr>
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
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
