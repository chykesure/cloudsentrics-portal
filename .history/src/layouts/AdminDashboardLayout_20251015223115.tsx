import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, FileText, User, Bell, Menu, X, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import axios from "axios";

interface AdminType {
  id: string;
  email: string;
  role: string;
}

const AdminDashboardLayout = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminType | null>(null);
  const [adminLoaded, setAdminLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem("adminAvatar") || null
  );

  const navigate = useNavigate();

  // ✅ Add new nav items
  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/dashboard/staff", label: "Staff Management", icon: User },
    { to: "/admin/dashboard/analytics", label: "Analytics", icon: Clock },
    { to: "/admin/dashboard/profile", label: "Profile", icon: User },
  ];

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
    else navigate("/admin/login");
    setAdminLoaded(true);
  }, [navigate]);

  const fetchAdminProfile = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return navigate("/admin/login");

    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.data) {
        setAdmin(data.data);
        localStorage.setItem("admin", JSON.stringify(data.data));

        const avatarUrl = data.data.avatar
          ? data.data.avatar.startsWith("http")
            ? data.data.avatar
            : `http://localhost:5000${data.data.avatar}`
          : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

        setProfileImage(avatarUrl);
        localStorage.setItem("adminAvatar", avatarUrl);
      } else {
        navigate("/admin/login");
      }
    } catch (err) {
      console.error("Error fetching admin profile:", err);
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

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

  const Sidebar = () => (
    <div className="w-64 bg-[#032352] text-white flex flex-col shadow-xl h-full">
      <div className="p-6 flex flex-col items-center justify-center border-b border-blue-900">
        <img src={logo} alt="Logo" className="h-20 mb-2" />
        {admin && <span className="text-white font-semibold text-sm sm:text-base">{admin.email}</span>}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
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
            <button className="relative text-white hover:text-gray-200 transition">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </button>

            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                <img src={profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="Admin" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-white object-cover" />
                <span className="font-medium hidden sm:inline">{admin?.email}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50 text-gray-700">
                  <NavLink to="/admin/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                    <User className="h-4 w-4" /> Profile
                  </NavLink>
                  <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
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

      {/* Logout modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9998]">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 sm:w-96 text-center">
            <h3 className="text-lg font-semibold text-gray-800">Confirm Logout</h3>
            <p className="mt-2 text-gray-600">Are you sure you want to log out?</p>
            <div className="mt-6 flex justify-center space-x-4">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
          <motion.div className="h-16 w-16 border-4 border-t-blue-800 border-b-blue-500 rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
          <p className="mt-4 text-gray-700 font-medium text-lg animate-pulse text-center">Logging out, please wait...</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardLayout;
