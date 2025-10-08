import { useState } from "react";
import { motion } from "framer-motion";
import { User, Settings, FileText, Bell } from "lucide-react";

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
  link: string;
}

const DashboardHome = () => {
  const [userName] = useState<string>("Polycarp Chike"); // hardcoded name

  // Hardcoded announcements
  const announcements: Announcement[] = [
    { id: 1, title: "Welcome!", message: "Glad to have you on the platform.", date: "2025-10-08" },
    { id: 2, title: "New Feature", message: "Check out the new quick action shortcuts.", date: "2025-10-07" },
  ];

  // Hardcoded quick actions
  const actions: QuickAction[] = [
    { title: "Profile Settings", description: "Update your profile info", icon: Settings, link: "/profile" },
    { title: "Submit a Form", description: "Start a new submission", icon: FileText, link: "/submit" },
    { title: "View Resources", description: "Access guides and FAQs", icon: User, link: "/resources" },
    { title: "Notifications", description: "Check alerts and messages", icon: Bell, link: "/notifications" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-10 space-y-10">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Welcome back, {userName}!</h1>
          <p className="mt-2 text-gray-600 text-lg">Here’s what you can do today in your portal.</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1590608897129-79b3b22f96b6?auto=format&fit=crop&w=400&q=80"
          alt="Welcome Illustration"
          className="w-48 h-48 object-cover rounded-lg hidden md:block"
        />
      </motion.div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.a key={idx} href={action.link} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 hover:shadow-2xl transition">
              <div className="p-4 rounded-full bg-gray-100">
                <Icon className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold">{action.title}</h3>
              <p className="text-gray-500 text-sm">{action.description}</p>
            </motion.a>
          );
        })}
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>
        <div className="flex flex-col gap-4">
          {announcements.map((ann) => (
            <motion.div key={ann.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="border-l-4 border-blue-600 bg-gray-50 p-4 rounded-lg">
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-lg md:text-xl font-semibold">💡 Tip of the Day: Keep your profile updated for a smoother experience!</p>
        <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition">
          Update Profile
        </button>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
