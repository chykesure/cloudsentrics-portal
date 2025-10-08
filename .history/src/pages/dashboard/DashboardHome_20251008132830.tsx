import { useEffect, useState } from "react";
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

const WelcomeDashboard = () => {
  const [userName, setUserName] = useState<string>("User");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?.name) setUserName(user.name);

      // Example backend calls
      const [annRes, actionsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/announcements`),
        fetch(`http://localhost:5000/api/quick-actions?companyEmail=${user.companyEmail}`)
      ]);

      const announcementsData = await annRes.json();
      const actionsData = await actionsRes.json();

      setAnnouncements(announcementsData || []);
      setActions(actionsData || [
        // fallback actions
        { title: "Profile Settings", description: "Update your profile info", icon: Settings, link: "/profile" },
        { title: "Submit a Form", description: "Start a new submission", icon: FileText, link: "/submit" },
        { title: "View Resources", description: "Access guides and FAQs", icon: User, link: "/resources" },
        { title: "Notifications", description: "Check alerts and messages", icon: Bell, link: "/notifications" },
      ]);

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading)
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading dashboard...</div>;

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Retry
        </button>
      </div>
    );

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
          {announcements.length > 0 ? announcements.map((ann) => (
            <motion.div key={ann.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="border-l-4 border-blue-600 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{ann.title}</h3>
                <span className="text-gray-400 text-sm">{new Date(ann.date).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600 mt-1">{ann.message}</p>
            </motion.div>
          )) : (
            <p className="text-gray-500 italic">No announcements available.</p>
          )}
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

export default WelcomeDashboard;
