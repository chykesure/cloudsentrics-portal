import { useState } from "react";
import { motion } from "framer-motion";
import { User, FileText, Bell, Star } from "lucide-react";

const DashboardHome = () => {
  const [userName] = useState<string>("Polycarp Chike"); // Hardcoded
  const [tipOpen, setTipOpen] = useState(true);

  // Hardcoded portal actions
  const portalActions = [
    { title: "Request Portal", description: "Start a new request", icon: FileText, color: "from-green-400 to-green-600" },
    { title: "Report Issue", description: "Report a problem quickly", icon: Bell, color: "from-red-400 to-red-600" },
    { title: "Profile", description: "View or update your profile", icon: User, color: "from-blue-400 to-blue-600" },
  ];

  // Hardcoded announcements
  const announcements = [
    { id: 1, title: "Welcome!", message: "Glad to have you on the portal.", date: "2025-10-08" },
    { id: 2, title: "Tip", message: "Try using the quick actions for faster navigation.", date: "2025-10-07" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6 sm:p-10 space-y-10">

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Welcome back, {userName}!</h1>
          <p className="mt-2 text-gray-100 text-lg">Your portal for today’s actions.</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1590608897129-79b3b22f96b6?auto=format&fit=crop&w=400&q=80"
          alt="Welcome Illustration"
          className="w-48 h-48 object-cover rounded-lg hidden md:block"
        />
      </motion.div>

      {/* Portal Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {portalActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-r ${action.color} text-white rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 cursor-pointer transition`}>
              <div className="p-4 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{action.title}</h3>
              <p className="text-white/90 text-sm">{action.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Announcements */}
      <div className="bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Announcements
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
          <p className="text-lg md:text-xl font-semibold">💡 Tip: Keep your profile updated for a smoother experience!</p>
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
