import type { ReactNode } from "react";

import { NavLink, Outlet } from "react-router-dom";
import logo from "../assets/logo.png";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 flex items-center justify-center border-b">
          <img src={logo} alt="Logo" className="h-10" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/dashboard" className="block p-2 rounded hover:bg-gray-200">Dashboard</NavLink>
          <NavLink to="/request-portal" className="block p-2 rounded hover:bg-gray-200">Request Portal</NavLink>
          <NavLink to="/report-issue" className="block p-2 rounded hover:bg-gray-200">Report Issue</NavLink>
          <NavLink to="/profile" className="block p-2 rounded hover:bg-gray-200">Profile</NavLink>
        </nav>
        <button className="p-4 text-red-500 text-left border-t hover:bg-gray-100">
          Log Out
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow flex items-center justify-end px-6">
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
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* Render page content inside layout */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
