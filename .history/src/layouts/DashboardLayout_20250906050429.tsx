import { NavLink, Outlet } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  User,
  Bell,
  Search,
  Settings,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo.png";

const DashboardLayout = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/request-portal", label: "Request Portal", icon: FileText },
    { to: "/report-issue", label: "Report Issue", icon: AlertTriangle },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo */}
        <div className="p-6 flex flex-col items-center justify-center border-b">
          <img src={logo} alt="Logo" className="h-42 mb-2" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#032352] text-white font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#032352]"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t mt-auto">
          <button className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition">
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          {/* Left: Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-[#032352] focus:border-[#032352] text-sm"
            />
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center space-x-6">
            {/* Notifications */}
            <button className="relative text-gray-600 hover:text-[#032352] transition">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src="https://via.placeholder.com/40"
                  alt="User"
                  className="h-9 w-9 rounded-full border"
                />
                <span className="font-medium">Oluwa</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" /> Profile
                  </NavLink>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-gray-100">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
