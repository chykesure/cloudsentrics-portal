import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Bell, User } from "lucide-react";

const DashboardHome = () => {
  const [tipOpen, setTipOpen] = useState(true);

  // Main portal cards
  const portalCards = [
    { title: "Request Portal", description: "Start a new request", icon: FileText, color: "from-green-400 to-green-600" },
    { title: "Report Issue", description: "Report a problem quickly", icon: Bell, color: "from-red-400 to-red-600" },
    { title: "Profile", description: "View or update your profile", icon: User, color: "from-blue-400 to-blue-600" },
  ];

  // Quick action cards (can mirror portalCards for simplicity)
  const quickActions = [
    { title: "Request Portal", description: "Start a new request", icon: FileText },
    { title: "Report Issue", description: "Report a problem quickly", icon: Bell },
    { title: "Profile", description: "View or update your profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-10 space-y-10">

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Welcome to Your Portal!</h1>
          <p className="mt-2 text-gray-100 text-lg">Choose what you want to do today</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1590608897129-79b3b22f96b6?auto=format&fit=crop&w=400&q=80"
          alt="Welcome Illustration"
          className="w-48 h-48 object-cover rounded-lg hidden md:block"
        />
      </motion.div>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {portalCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-r ${card.color} text-white rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 cursor-pointer transition`}>
              <div className="p-4 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="text-white/90 text-sm">{card.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 cursor-pointer hover:shadow-2xl transition">
              <div className="p-4 rounded-full bg-blue-100">
                <Icon className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold">{action.title}</h3>
              <p className="text-gray-500 text-sm">{action.description}</p>
            </motion.div>
          );
        })}
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
