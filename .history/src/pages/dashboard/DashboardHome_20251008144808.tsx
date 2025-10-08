import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Settings, FileText, Bell, Star } from "lucide-react";

// Types
interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
  colorIdx: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  colorIdx: number;
}

interface Stat {
  title: string;
  icon: any;
  colorIdx: number;
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

  // Two-color palette: dark blue shades + white
  const darkBlues = ["#032352", "#043a5e", "#054a6b"];
  const lighterBlues = ["#0b3b6a", "#0d4c7f", "#0f5d94"];

  // Stats
  const stats: Stat[] = [
    { title: "Profile", icon: User, colorIdx: 0 },
    { title: "Request Portal", icon: FileText, colorIdx: 1 },
    { title: "Report Issue", icon: Bell, colorIdx: 2 },
  ];

  // Quick Actions
  const actions: QuickAction[] = [
    { title: "Profile Settings", description: "Update your profile info", icon: Settings, colorIdx: 0 },
    { title: "Request Portal", description: "Submit and manage requests", icon: FileText, colorIdx: 1 },
    { title: "Report Issue", description: "Report any issues or problems", icon: Bell, colorIdx: 2 },
  ];

  // Announcements
  const announcements: Announcement[] = [
    { id: 1, title: "Welcome!", message: "Glad to have you on the platform.", date: "2025-10-08", colorIdx: 0 },
    { id: 2, title: "New Feature", message: "Check out the quick action shortcuts.", date: "2025-10-07", colorIdx: 1 },
  ];

  return (
    <div className="min-h-screen bg-white p-6 sm:p-10 space-y-10">

      {/* Hero Section */}
      <div className="relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r from-[${darkBlues[0]}] to-[${lighterBlues[0]}] text-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10`}
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
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-r from-[${darkBlues[stat.colorIdx]}] to-[${lighterBlues[stat.colorIdx]}] text-white rounded-2xl shadow-md p-6 flex items-center gap-4 cursor-pointer transition`}
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
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-r from-[${darkBlues[action.colorIdx]}] to-[${lighterBlues[action.colorIdx]}] text-white rounded-2xl shadow-md p-6 flex flex-col items-start gap-4 hover:shadow-lg transition cursor-pointer`}
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
      <div className="grid grid-cols-1 gap-4">
        {announcements.map((ann) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`border-l-4 border-white bg-gradient-to-r from-[${darkBlues[ann.colorIdx]}] to-[${lighterBlues[ann.colorIdx]}] p-4 rounded-lg cursor-pointer transition`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white">{ann.title}</h3>
              <span className="text-white/90 text-sm">{new Date(ann.date).toLocaleDateString()}</span>
            </div>
            <p className="text-white/80 mt-1">{ann.message}</p>
          </motion.div>
        ))}
      </div>

      {/* Tip Section */}
      {tipOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r from-[${darkBlues[1]}] to-[${lighterBlues[1]}] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4`}
        >
          <p className="text-lg md:text-xl font-semibold">
            💡 Tip of the Day: Keep your profile updated for a smoother experience!
          </p>
          <button
            onClick={() => setTipOpen(false)}
            className={`px-6 py-2 bg-white text-[${darkBlues[1]}] rounded-lg font-semibold hover:bg-gray-100 transition`}
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardHome;
