import { NavLink, Outlet } from "react-router-dom";
import { LogOut, LayoutDashboard, FileText, AlertTriangle, User } from "lucide-react";
import logo from "../assets/logo.png";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-6 flex flex-col items-center justify-center border-b">
          <img src={logo} alt="Logo" className="h-12 mb-2" />
          <span className="text-xs font-semibold tracking-wide text-gray-600">
            CLOUD SENTRICS
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "text-white font-semibold"
                  : "text-gray-600 hover:text-[#032352]"
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#032352" : "transparent",
            })}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/request-portal"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "text-white font-semibold"
                  : "text-gray-600 hover:text-[#032352]"
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#032352" : "transparent",
            })}
          >
            <FileText className="h-5 w-5" />
            <span>Request Portal</span>
          </NavLink>

          <NavLink
            to="/report-issue"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "text-white font-semibold"
                  : "text-gray-600 hover:text-[#032352]"
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#032352" : "transparent",
            })}
          >
            <AlertTriangle className="h-5 w-5" />
            <span>Report Issue</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "text-white font-semibold"
                  : "text-gray-600 hover:text-[#032352]"
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#032352" : "transparent",
            })}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="p-6 border-t mt-auto">
          <button className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition">
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">LOG OUT</span>
          </button>
        </div>
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
