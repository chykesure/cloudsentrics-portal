import { NavLink, Outlet } from "react-router-dom";
import { LogOut, LayoutDashboard, FileText, AlertTriangle, User } from "lucide-react";
import logo from "../assets/logo.png";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center justify-center border-b">
          <img src={logo} alt="Logo" className="h-12" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "hover:bg-gray-100"
              }`
            }
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/request-portal"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "hover:bg-gray-100"
              }`
            }
          >
            <FileText className="h-5 w-5" />
            <span>Request Portal</span>
          </NavLink>

          <NavLink
            to="/report-issue"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "hover:bg-gray-100"
              }`
            }
          >
            <AlertTriangle className="h-5 w-5" />
            <span>Report Issue</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "hover:bg-gray-100"
              }`
            }
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <button className="flex items-center space-x-3 px-6 py-4 text-red-600 border-t hover:bg-red-50 transition">
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <div className="flex items-center space-x-3">
            <span className="font-medium">Johnson James</span>
            <img
              src="https://via.placeholder.com/40"
              alt="User"
              className="h-10 w-10 rounded-full border"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
