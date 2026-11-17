import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  LayoutDashboard,
  MapPin,
  Grid,
  CalendarCheck2,
  Users,
  BarChart3,
  LogOut,
  Car,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-shadow-500 text-white shadow-md font-semibold'
        : 'text-cloud-400 hover:text-white hover:bg-zeus-900'
    }`;

  return (
    <div className="min-h-screen bg-cloud-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-zeus-950 text-white p-4 flex items-center justify-between border-b border-zeus-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-shadow-500 flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-cloud-100">ParkEase Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-cloud-400 hover:text-white hover:bg-zeus-900"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-zeus-950 text-cloud-200 z-40 flex flex-col justify-between p-4 transition-transform duration-200 border-r border-zeus-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-shadow-500 flex items-center justify-center text-white shadow-md">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-cloud-100">ParkEase</span>
                <span className="block text-[10px] font-semibold tracking-wider text-shadow-300 uppercase">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Real-time Status Card */}
          <div className="px-3 py-2 rounded-xl bg-zeus-900 border border-zeus-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-medium text-cloud-300">
                {isConnected ? 'Socket Active' : 'Connecting...'}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zeus-800 text-cloud-300 font-mono">
              Live
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <NavLink
              to="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard Overview
            </NavLink>
            <NavLink
              to="/admin/locations"
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <MapPin className="w-4 h-4" />
              Manage Locations
            </NavLink>
            <NavLink
              to="/admin/slots"
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <Grid className="w-4 h-4" />
              Manage Parking Slots
            </NavLink>
            <NavLink
              to="/admin/reservations"
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <CalendarCheck2 className="w-4 h-4" />
              All Reservations
            </NavLink>
            <NavLink
              to="/admin/users"
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <Users className="w-4 h-4" />
              User Directory
            </NavLink>
            <NavLink
              to="/admin/reports"
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <BarChart3 className="w-4 h-4" />
              Reports & Analytics
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-zeus-800 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-cloud-400 hover:text-white rounded-lg hover:bg-zeus-900 transition-colors"
          >
            <span>Return to User Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-shadow-700 border border-shadow-500 text-cloud-100 flex items-center justify-center text-xs font-bold">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-cloud-100 truncate max-w-[100px]">
                  {user?.name}
                </p>
                <p className="text-[10px] text-shadow-300 font-mono">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-cloud-400 hover:text-rose-400 hover:bg-zeus-900 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
