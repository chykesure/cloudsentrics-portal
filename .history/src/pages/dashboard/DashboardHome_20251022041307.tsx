import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Settings, FileText, Bell, Star } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
}

interface QuickAction {
  title: string;
  description: string;
  Icon: any; // must be uppercase for JSX
  to: string; // path to navigate
}

const DashboardHome = () => {
  const [tipOpen, setTipOpen] = useState(true);
  const navigate = useNavigate();

  // Load user info if needed
  useEffect(() => {
    const handleStorageChange = () => {};
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const announcements: Announcement[] = [
    {
      id: 1,
      title: "Welcome to Cloud Sentrics!",
      message: "Glad to have you on the platform. Start by submitting your first report or request.",
      date: "2025-10-08",
    },
    {
      id: 2,
      title: "Profile Tips",
      message: "Keep your profile updated to get the most out of the platform.",
      date: "2025-10-05",
    },
  ];

  // Add the "to" path for navigation
  const actions: QuickAction[] = [
    { title: "Profile Settings", description: "Update your profile info", Icon: Settings, to: "/dashboard/profile" },
    { title: "Request Portal", description: "Submit and manage requests", Icon: FileText, to: "/dashboard/request-portal" },
    { title: "Report Issue", description: "Report any issues or problems", Icon: Bell, to: "/dashboard/report-issue" },
  ];

  // --------------------
  // Components
  // --------------------
  const QuickActionCard = ({ title, description, Icon, to }: QuickAction) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 hover:shadow-2xl transition cursor-pointer"
      onClick={() => navigate(to)}
    >
      <div className="p-4 rounded-full bg-blue-100">
        <Icon className="w-8 h-8 text-blue-700" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6 sm:p-10 space-y-10">

      {/* Hero Section */}
      <div className="relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10"
        >
          <div className="md:pr-48">
            <h1 className="text-3xl sm:text-4xl font-bold">🚀 Good to see you!</h1>
            <p className="mt-2 text-gray-100 text-lg">
              Dive into your workspace, make requests, and stay updated with the latest insights.
            </p>
            <p className="mt-1 text-gray-200 text-sm">
              Tip: Use the sidebar on the left to quickly navigate through your dashboard.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, idx) => (
          <QuickActionCard key={idx} {...action} />
        ))}
      </div>

      {/* Announcements */}
      <div className="bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Recent Announcements
        </h2>
        <div className="flex flex-col gap-4">
          {announcements.map((ann) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              className="border-l-4 border-blue-600 bg-gray-50/50 p-4 rounded-lg cursor-pointer transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{ann.title}</h3>
              </div>
              <p className="text-gray-600 mt-1">{ann.message}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tip Section */}
      {tipOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-lg md:text-xl font-semibold">
            💡 Tip of the Day: Keep your profile updated for a smoother experience!
          </p>
          <button
            onClick={() => setTipOpen(false)}
            className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardHome;
