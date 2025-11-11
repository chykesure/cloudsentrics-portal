import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";


const UpgradeRequest = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // ✅ Fetch all upgrade requests
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get("https://api.onboardingportal.cloudsentrics.org/api/upgrade/all");
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching upgrade requests:", error);
            toast.error("Failed to fetch upgrade requests");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle Approve/Deny actions
    const handleAction = async (id: string, action: "approve" | "deny") => {
        const confirm = await Swal.fire({
            title: `Are you sure?`,
            text:
                action === "approve"
                    ? "You are about to approve this upgrade request."
                    : "You are about to deny this upgrade request.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: action === "approve" ? "#16a34a" : "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: action === "approve" ? "Yes, Approve" : "Yes, Deny",
        });

        // 🛑 Stop if user cancels
        if (!confirm.isConfirmed) return;

        try {
            setActionLoading(id);
            const url = `https://api.onboardingportal.cloudsentrics.org/api/upgrade/${id}/${action}`;
            await axios.post(url);

            // 🧩 Update UI immediately
            setRequests((prev) =>
                prev.map((req) =>
                    req._id === id
                        ? { ...req, status: action === "approve" ? "approved" : "rejected" }
                        : req
                )
            );

            await Swal.fire({
                title:
                    action === "approve"
                        ? "Approved Successfully!"
                        : "Denied Successfully!",
                text:
                    action === "approve"
                        ? "The user’s upgrade request has been approved."
                        : "The user’s upgrade request has been denied.",
                icon: "success",
                confirmButtonColor: "#032352",
            });
        } catch (error: any) {
            console.error(`Error performing ${action}:`, error);
            Swal.fire("Error", "Something went wrong. Please try again.", "error");
        } finally {
            setActionLoading(null);
        }
    };


    // 🔁 Refresh list
    const refreshList = async () => {
        setRefreshing(true);
        await fetchRequests();
        setTimeout(() => setRefreshing(false), 800);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center bg-white shadow-sm px-6 py-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Upgrade Request(s)</h2>
                <button
                    onClick={refreshList}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    {refreshing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Refreshing
                        </>
                    ) : (
                        <>
                            <RefreshCcw className="w-4 h-4" /> Refresh
                        </>
                    )}
                </button>
            </div>

            {/* Main Table */}
            <div className="flex-1 overflow-x-auto p-6">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
                        <p className="text-sm font-medium">Loading upgrade requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64 text-gray-400">
                        <XCircle className="w-10 h-10 mb-3 text-gray-300" />
                        <p className="text-base font-medium">No upgrade requests found</p>
                        <p className="text-sm text-gray-500 mt-1">Try refreshing to check for new requests.</p>
                    </div>
                ) : (
                    <motion.table
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="min-w-full bg-white shadow-md rounded-xl overflow-hidden"
                    >
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Company Name
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Previous Tier
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    New Tier
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Storage Change
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">Requested On</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">Approved On</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b hover:bg-gray-50 transition text-sm text-gray-700"
                                >
                                    <td className="px-6 py-3">{req.companyName || "N/A"}</td>
                                    <td className="px-6 py-3">{req.email}</td>
                                    <td className="px-6 py-3">{req.previousTier}</td>
                                    <td className="px-6 py-3 font-semibold text-blue-600">
                                        {req.newTier}
                                    </td>
                                    <td className="px-6 py-3">
                                        {req.previousStorage} → {req.newStorage}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${req.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : req.status === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        {req.timestamp ? new Date(req.timestamp).toLocaleDateString() : "N/A"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {req.approvedAt
                                            ? new Date(req.approvedAt).toLocaleDateString()
                                            : req.status === "pending"
                                                ? "—"
                                                : "N/A"}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        {req.status === "Pending" || req.status === "pending" ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    disabled={actionLoading === req._id}
                                                    onClick={() => handleAction(req._id, "approve")}
                                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-60"
                                                >
                                                    {actionLoading === req._id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    disabled={actionLoading === req._id}
                                                    onClick={() => handleAction(req._id, "deny")}
                                                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-60"
                                                >
                                                    {actionLoading === req._id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    Deny
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">
                                                No action needed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </motion.table>
                )}
            </div>
        </div>
    );
};

export default UpgradeRequest;
