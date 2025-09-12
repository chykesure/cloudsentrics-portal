import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, LogOut, Home, User, Settings } from "lucide-react";
import logo from "../assets/logo.png";

const DashboardLayout = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navItems = [
    { name: "Home", icon: Home, active: true },
    { name: "Profile", icon: User, active: false },
    { name: "Settings", icon: Settings, active: false },
  ];

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLogoutModal(false);
      console.log("Logged out");
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white shadow-lg flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 flex flex-col items-center justify-center border-b">
          <img src={logo} alt="Logo" className="h-20 w-auto mb-2" />
          <h1 className="text-lg font-bold text-gray-700">CloudSentric</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ name, icon: Icon, active }) => (
            <a
              key={name}
              href="#"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                active
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{name}</span>
            </a>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">Dashboard</h2>

          <div className="flex items-center space-x-4 relative">
            <button className="relative">
              <Bell className="h-6 w-6 text-gray-600" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src="https://via.placeholder.com/40"
                  alt="profile"
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-gray-700 font-medium">John Doe</span>
              </button>

              {dropdownOpen && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-2 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50"
                >
                  <button
                    onClick={() => setLogoutModal(true)}
                    className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">
              Welcome back, John Doe!
            </h3>
            <p className="text-gray-600 mt-2">
              This is your dashboard. Here you can manage everything.
            </p>
          </div>
        </main>
      </div>

      {/* Logout Modal */}
      {logoutModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-700">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mt-2">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
            <p className="text-white font-medium">Logging out...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
