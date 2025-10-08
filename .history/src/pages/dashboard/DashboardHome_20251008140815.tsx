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
  const [userName, setUserName] = useState<string>("User");
  const [tipOpen, setTipOpen] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem("avatar") || null
  );

  // Load user info and avatar from localStorage
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

  // Hardcoded announcements and actions
  const announcements: Announcement[] = [
    { id: 1, title: "Welcome!", message: "Glad to have you on the platform.", date: "2025-10-08" },
    { id: 2, title: "New Feature", message: "Check out the quick action shortcuts.", date: "2025-10-07" },
  ];

  const actions: QuickAction[] = [
    { title: "Profile Settings", description: "Update your profile info", icon: Settings },
    { title: "Request Portal", description: "Submit and manage requests", icon: FileText },
    { title: "Report Issue", description: "Report any issues or problems", icon: Bell },
  ];

  const stats = [
    { title: "Profile", icon: User, color: "from-blue-400 to-blue-600" },
    { title: "Request Portal", icon: FileText, color: "from-green-400 to-green-600" },
    { title: "Report Issue", icon: Bell, color: "from-red-400 to-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6 sm:p-10 space-y-10">

      {/* Hero Section Wrapper */}
      <div className="relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Welcome back, {userName}!</h1>
            <p className="mt-2 text-gray-100 text-lg">Your personalized portal for today’s actions and updates.</p>
          </div>
        </motion.div>

        {/* Floating Avatar */}
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="User Avatar"
            className="w-48 h-48 object-cover rounded-full border-4 border-white absolute top-1/2 right-6 transform -translate-y-1/2 shadow-xl z-20"
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
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 hover:shadow-2xl transition cursor-pointer"
            >
              <div className="p-4 rounded-full bg-blue-100">
                <Icon className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold">{action.title}</h3>
              <p className="text-gray-500 text-sm">{action.description}</p>
            </motion.div>
          );
        })}
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
                <span className="text-gray-400 text-sm">{new Date(ann.date).toLocaleDateString()}</span>
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
          <p className="text-lg md:text-xl font-semibold">💡 Tip of the Day: Keep your profile updated for a smoother experience!</p>
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
