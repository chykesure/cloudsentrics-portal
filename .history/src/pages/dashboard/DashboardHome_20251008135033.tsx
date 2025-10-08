import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Settings, FileText, Star } from "lucide-react";

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [tipOpen, setTipOpen] = useState(true);

  // Load username and avatar from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.name) setUserName(storedUser.name);
    if (storedUser?.image) setProfileImage(storedUser.image);
  }, []);

  // Listen for avatar updates
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setProfileImage(updatedUser?.image || null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

  // Hardcoded announcements
  const announcements: Announcement[] = [
    { id: 1, title: "Welcome!", message: "Glad to have you on the portal.", date: "2025-10-08" },
    { id: 2, title: "Quick Tips", message: "You can access your requests and reports from the cards below.", date: "2025-10-07" },
  ];

  // Quick action cards
  const actions: QuickAction[] = [
    { title: "Request Portal", description: "Submit new requests quickly", icon: FileText },
    { title: "Report Issue", description: "Report an issue in the system", icon: FileText },
    { title: "Profile Settings", description: "Update your profile info", icon: Settings },
  ];

  // Quick stats (just cards, no numbers)
  const stats = [
    { title: "Request Portal", color: "from-green-400 to-green-600", icon: FileText },
    { title: "Report Issue", color: "from-red-400 to-red-600", icon: FileText },
    { title: "Profile Settings", color: "from-blue-400 to-blue-600", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6 sm:p-10 space-y-10">

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profileImage || defaultAvatar}
            alt="User"
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-white object-cover"
          />
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Welcome back, {userName}!</h1>
            <p className="mt-2 text-gray-100 text-lg">Your personalized portal for today’s actions.</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-r ${stat.color} text-white rounded-2xl shadow-lg p-6 flex items-center gap-4 cursor-pointer transition`}>
              <div className="p-4 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold opacity-0"> </p> {/* Placeholder for number */}
                <p className="text-sm opacity-90">{stat.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 hover:shadow-2xl transition cursor-pointer">
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
            <motion.div key={ann.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              className="border-l-4 border-blue-600 bg-gray-50/50 p-4 rounded-lg cursor-pointer transition">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-lg md:text-xl font-semibold">💡 Tip of the Day: Check your requests and reports regularly!</p>
          <button onClick={() => setTipOpen(false)}
            className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition">
            Dismiss
          </button>
        </motion.div>
      )}

    </div>
  );
};

export default DashboardHome;
