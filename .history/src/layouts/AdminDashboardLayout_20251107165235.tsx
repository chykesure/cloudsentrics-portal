import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, User, Menu, X, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import axios from "axios";
import {
  ArrowUpCircle,
  Users,
  BarChart3,
  UserCircle,
} from "lucide-react";

interface AdminType {
  id: string;
  email: string;
  role: string;
}

interface UpgradeRequest {
  _id: string;
  fullName: string;
  email: string;
  newTier: string;
  status: string;
  timestamp: string;
  companyName?: string; // ✅ added field
}

const AdminDashboardLayout = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  //const [showLogoutModal, setShowLogoutModal] = useState(false);
  //const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminType | null>(null);
  const [adminLoaded, setAdminLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem("adminAvatar") || null
  );

  const [showNotifications, setShowNotifications] = useState(false);
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [blink, setBlink] = useState(false);

  const navigate = useNavigate();

  const navItems = [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/admin/dashboard/upgrade-requests",
      label: "Upgrade Request(s)",
      icon: ArrowUpCircle, // 📈 Represents tier or upgrade
    },
    {
      to: "/admin/dashboard/staff",
      label: "Staff Management",
      icon: Users, // 👥 Represents team/staff
    },
    {
      to: "/admin/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3, // 📊 Clean, modern analytics icon
    },
    {
      to: "/admin/dashboard/profile",
      label: "Profile",
      icon: UserCircle, // 🧑‍💼 Distinct from "Users"
    },
  ];

  // ✅ Fetch admin profile
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
    else navigate("/admin/login");
    setAdminLoaded(true);
  }, [navigate]);

  const fetchAdminProfile = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      const { data } = await axios.get("https://api.onboardingportal.cloudsentrics.org/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.data) {
        setAdmin(data.data);
        localStorage.setItem("admin", JSON.stringify(data.data));

        const avatarUrl = data.data.avatar
          ? data.data.avatar.startsWith("http")
            ? data.data.avatar
            : `https://api.onboardingportal.cloudsentrics.org${data.data.avatar}`
          : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

        setProfileImage(avatarUrl);
        localStorage.setItem("adminAvatar", avatarUrl);
      }
    } catch (err) {
      console.error("Error fetching admin profile:", err);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // ✅ Fetch upgrade requests
  const fetchUpgradeRequests = async () => {
    try {
      setRefreshing(true);
      const { data } = await axios.get("https://api.onboardingportal.cloudsentrics.org/api/upgrade/all");
      const pending = data.filter((req: UpgradeRequest) => req.status.toLowerCase() === "pending");

      // 🔔 Trigger red blink when new requests appear
      if (pending.length > upgradeRequests.length) {
        setBlink(true);
        setTimeout(() => setBlink(false), 4000);
      }

      setUpgradeRequests(pending);
    } catch (err) {
      console.error("Error fetching upgrade requests:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpgradeRequests();
    const interval = setInterval(fetchUpgradeRequests, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // ✅ Approve or Deny request
  const handleUpgradeAction = async (id: string, action: "approve" | "deny") => {
    try {
      await axios.post(`https://api.onboardingportal.cloudsentrics.org/api/upgrades/${id}/${action}`);
      await fetchUpgradeRequests(); // refresh immediately after action
    } catch (err) {
      console.error(`Error trying to ${action} request:`, err);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    setShowLogoutModal(false);
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminAvatar");
      setLoading(false);
      navigate("/admin/login");
    }, 1000);
  };

  // ✅ Sidebar Component
  const Sidebar = () => (
    <div className="w-64 bg-[#032352] text-white flex flex-col shadow-xl h-full">
      <div className="p-6 flex flex-col items-center justify-center border-b border-blue-900">
        <img src={logo} alt="Logo" className="h-20 mb-2" />
        {admin && <span className="text-white font-semibold text-sm sm:text-base">{admin.email}</span>}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems
          .filter(({ label }) => !(admin?.role === "readonly" && label === "Staff Management"))
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin/dashboard"}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-gray-300 hover:bg-blue-800 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-5 w-5 ${isActive ? "text-black" : "text-gray-300"}`} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
      </nav>

      <div className="p-6 border-t border-blue-900 mt-auto">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center space-x-3 text-red-400 hover:text-red-500 transition"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-semibold">Log Out</span>
        </button>
      </div>
    </div>
  );

  // ✅ Loading screen
  if (!adminLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <motion.div
          className="h-16 w-16 border-4 border-t-blue-800 border-b-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  // ✅ Main layout
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50" />
          <div className="relative z-50 h-full">
            <Sidebar />
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-[#032352] shadow-md flex items-center justify-between px-4 sm:px-6 text-white">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-2">
            <Menu className="h-6 w-6" />
          </button>

          <img src={logo} alt="Logo" className="h-8 md:hidden" />
          <h2 className="text-lg sm:text-xl font-semibold">Admin Dashboard</h2>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* 🔔 Modern Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative focus:outline-none transition-transform duration-200 hover:scale-105"
              >
                <motion.div
                  animate={
                    blink
                      ? { scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={{ repeat: blink ? Infinity : 0, duration: 1 }}
                >
                  <div className="relative">
                    <Bell
                      className={`h-6 w-6 drop-shadow-md ${upgradeRequests.length > 0
                        ? "text-red-500 animate-pulse"
                        : "text-white"
                        }`}
                    />

                    {/* 🔴 Notification Count */}
                    {upgradeRequests.length > 0 && (
                      <span className="absolute -top-1 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow-sm">
                        {upgradeRequests.length > 9 ? "9+" : upgradeRequests.length}
                      </span>
                    )}
                  </div>
                </motion.div>
              </button>

              {/* 🔽 Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm"
                >
                  <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      Notifications
                    </h4>
                    <button
                      onClick={fetchUpgradeRequests}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                    >
                      {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {upgradeRequests.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-6">
                        No pending upgrade requests
                      </p>
                    ) : (
                      upgradeRequests.map((req) => (
                        <motion.div
                          key={req._id}
                          whileHover={{ scale: 1.02 }}
                          className="px-4 py-3 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors duration-150"
                        >
                          <p className="font-medium text-gray-800 flex justify-between items-center">
                            {req.companyName}
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md font-semibold">
                              {req.newTier}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {req.email}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {new Date(req.timestamp).toLocaleString()}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {upgradeRequests.length > 0 && (
                    <div className="text-center text-xs text-gray-500 py-2 bg-gray-50">
                      {upgradeRequests.length} total request
                      {upgradeRequests.length > 1 ? "s" : ""}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* 👤 Profile */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src={profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="Admin"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-white object-cover"
                />
                <span className="font-medium hidden sm:inline">{admin?.email}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50 text-gray-700">
                  <NavLink
                    to="/admin/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" /> Profile
                  </NavLink>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-0 sm:px-2 md:px-4 lg:px-12 py-4 overflow-y-auto bg-white w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
