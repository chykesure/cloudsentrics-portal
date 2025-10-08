import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  User,
  Bell,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import defaultAvatar from "../../src/assets/pic.png";

interface UserType {
  id: string;
  companyEmail: string;
  companyName: string;
  customerId: string;
}

const DashboardLayout = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem("avatar") || null
  );

  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/request-portal", label: "Request Portal", icon: FileText },
    { to: "/dashboard/report-issue", label: "Report Issue", icon: AlertTriangle },
    { to: "/dashboard/profile", label: "Profile", icon: User },
  ];

  // ✅ Load user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    setUserLoaded(true);
  }, [navigate]);

  // ✅ Listen for changes in localStorage (avatar updates)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedAvatar = localStorage.getItem("avatar");
      setProfileImage(updatedAvatar || null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(false);
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("avatar");
      setLoading(false);
      navigate("/login");
    }, 1000);
  };

  const Sidebar = () => (
    <div className="w-64 bg-[#032352] text-white flex flex-col shadow-xl h-full">
      <div className="p-6 flex flex-col items-center justify-center border-b border-blue-900">
        <img src={logo} alt="Logo" className="h-20 mb-2" />
        {user && (
          <span className="text-white font-semibold text-sm sm:text-base">
            {user.companyEmail}
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
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

  // ✅ Show loader until user is loaded
  if (!userLoaded) {
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

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50"
          />
          <div className="relative z-50 h-full">
            <Sidebar />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-[#032352] shadow-md flex items-center justify-between px-4 sm:px-6 text-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mr-2"
          >
            <Menu className="h-6 w-6" />
          </button>

          <img src={logo} alt="Logo" className="h-8 md:hidden" />

          <h2 className="text-lg sm:text-xl font-semibold">Dashboard</h2>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <button className="relative text-white hover:text-gray-200 transition">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src={
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 

                  }
                  alt="User"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-white object-cover"
                />
                <span className="font-medium hidden sm:inline">
                  {user?.companyEmail}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50 text-gray-700">
                  <NavLink
                    to="/dashboard/profile"
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

        <main
          id="main-scroll"
          className="flex-1 px-0 sm:px-2 md:px-4 lg:px-12 py-4 overflow-y-auto bg-white w-full"
        >
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9998]">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 sm:w-96 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Confirm Logout
            </h3>
            <p className="mt-2 text-gray-600">
              Are you sure you want to log out?
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
          <motion.div
            className="h-16 w-16 border-4 border-t-blue-800 border-b-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="mt-4 text-gray-700 font-medium text-lg animate-pulse text-center">
            Logging out, please wait...
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
