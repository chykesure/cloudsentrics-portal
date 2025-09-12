import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const DashboardHome = () => {
  const data = [
    { name: "Approved", value: 20, color: "#22c55e" },
    { name: "In progress", value: 10, color: "#3b82f6" },
    { name: "Pending", value: 5, color: "#f97316" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-2xl font-bold">25</h3>
          <p className="text-gray-500 text-sm">Total Portal Request</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-2xl font-bold">20</h3>
          <p className="text-gray-500 text-sm">Approved Requests</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-2xl font-bold">5</h3>
          <p className="text-gray-500 text-sm">Pending Requests</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-2xl font-bold">17</h3>
          <p className="text-gray-500 text-sm">Issues Reported</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-2xl font-bold">12</h3>
          <p className="text-gray-500 text-sm">Issues Solved</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-2xl font-bold">5</h3>
          <p className="text-gray-500 text-sm">Pending Issues</p>
        </div>
      </div>

      {/* Table + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Table */}
        <div className="bg-white rounded-xl shadow p-4 md:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Recent Portal Requests</h3>
            <select className="border p-1 rounded">
              <option>Sort by: Approved</option>
              <option>Sort by: Pending</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="p-2">Request Type</th>
                <th className="p-2">Date</th>
                <th className="p-2">Time</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">Additional AWS Accounts</td>
                <td className="p-2">Aug 15, 2025</td>
                <td className="p-2">10:34am</td>
                <td className="p-2"><span className="text-orange-500">Pending</span></td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Additional S3 Buckets</td>
                <td className="p-2">Aug 15, 2025</td>
                <td className="p-2">10:34am</td>
                <td className="p-2"><span className="text-green-500">Approved</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-3">Request Status Identification</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
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
