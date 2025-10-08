import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Settings, FileText, Bell, Star } from "lucide-react";

// Types
interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
}

const DashboardHome = () => {
  const [userName, setUserName] = useState<string>("");
  const [tipOpen, setTipOpen] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem("avatar") || null
  );

  const loadUserInfo = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "User");
      setProfileImage(user.avatar || null);
    }
  };

  useEffect(() => {
    loadUserInfo();
    const handleStorageChange = () => loadUserInfo();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const avatarUrl = profileImage || "";

  const announcements: Announcement[] = [
    { id: 1, title: "Welcome!", message: "Glad to have you on the platform.", date: "2025-10-08" },
    { id: 2, title: "New Feature", message: "Check out the quick action shortcuts.", date: "2025-10-07" },
  ];

  const actions: QuickAction[] = [
    { title: "Profile Settings", description: "Update your profile info", icon: Settings },
    { title: "Request Portal", description: "Submit and manage requests", icon: FileText },
    { title: "Report Issue", description: "Report any issues or problems", icon: Bell },
  ];

  // Updated Stats with richer, more dynamic gradients
  const stats = [
    { title: "Profile", icon: User, color: "from-[#1e3a8a] via-[#2563eb] to-[#3b82f6]" }, // blue gradient
    { title: "Request Portal", icon: FileText, color: "from-[#f97316] via-[#fb923c] to-[#fcd34d]" }, // orange-yellow gradient
    { title: "Report Issue", icon: Bell, color: "from-[#9333ea] via-[#a855f7] to-[#c084fc]" }, // purple gradient
  ];

  // Updated Quick Actions with distinct gradients
  const actionsColors = [
    "from-[#0f766e] via-[#14b8a6] to-[#2dd4bf]", // teal gradient
    "from-[#dc2626] via-[#ef4444] to-[#fca5a5]", // red gradient
    "from-[#4b5563] via-[#6b7280] to-[#9ca3af]", // gray gradient
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 space-y-10">

      {/* Hero Section */}
      <div className="relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#60a5fa] text-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10"
        >
          <div className="md:pr-48">
            <h1 className="text-3xl sm:text-4xl font-bold">
              🚀 Good to see you!
            </h1>
            <p className="mt-2 text-white text-lg">
              Dive into your workspace, make requests, and stay updated with the latest insights.
            </p>
            <p className="mt-1 text-white/80 text-sm">
              Tip: Use the sidebar on the left to quickly navigate through your dashboard.
            </p>
          </div>
        </motion.div>

        {/* Floating Avatar */}
        {avatarUrl && (
          <motion.img
            src={avatarUrl}
            alt="User Avatar"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            className="absolute top-1/2 right-6 transform -translate-y-1/2 w-36 sm:w-40 md:w-48 h-36 sm:h-40 md:h-48 object-cover rounded-full border-4 border-white shadow-xl z-50"
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-r ${stat.color} text-white rounded-2xl shadow-lg p-6 flex items-center gap-4 cursor-pointer transition`}
            >
              <div className="p-4 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold opacity-90">{stat.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-r ${actionsColors[idx]} text-white rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 hover:shadow-2xl transition cursor-pointer`}
            >
              <div className="p-4 rounded-full bg-white/20">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{action.title}</h3>
              <p className="text-white/80 text-sm">{action.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Announcements */}
      <div className="bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#c084fc] rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <Star className="w-5 h-5 text-yellow-400" /> Recent Announcements
        </h2>
        <div className="flex flex-col gap-4">
          {announcements.map((ann) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              className="border-l-4 border-yellow-400 bg-[#7c3aed] p-4 rounded-lg cursor-pointer transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white">{ann.title}</h3>
                <span className="text-white/90 text-sm">{new Date(ann.date).toLocaleDateString()}</span>
              </div>
              <p className="text-white/80 mt-1">{ann.message}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tip Section */}
      {tipOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#4ade80] text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-lg md:text-xl font-semibold">
            💡 Tip of the Day: Keep your profile updated for a smoother experience!
          </p>
          <button
            onClick={() => setTipOpen(false)}
            className="px-6 py-2 bg-white text-[#16a34a] rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardHome;
