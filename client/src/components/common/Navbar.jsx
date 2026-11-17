import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  Car,
  CalendarCheck,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isConnected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
      isActive
        ? 'text-zeus-900 bg-cloud-200/80 font-semibold'
        : 'text-kabul-500 hover:text-zeus-900 hover:bg-cloud-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cloud-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Live Status */}
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-zeus-900 text-cloud-100 flex items-center justify-center shadow-md border border-kabul-600 group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5 text-shadow-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-zeus-900">
                  Park<span className="text-shadow-500">Ease</span>
                </span>
                <span className="text-[10px] font-semibold text-kabul-400 tracking-wider uppercase -mt-1">
                  Smart Parking
                </span>
              </div>
            </Link>

            {/* Socket Live Status Indicator */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isConnected
                  ? 'bg-cloud-100 text-zeus-800 border-cloud-300'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
              title={isConnected ? 'Real-Time Sync Connected' : 'Reconnecting to Real-Time Server...'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px] font-semibold tracking-wide">
                {isConnected ? 'LIVE SYNC' : 'CONNECTING'}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/locations" className={navLinkClass}>
              Parking Locations
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              Search & Reserve
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About System
            </NavLink>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-bookings"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zeus-800 hover:text-shadow-600 hover:bg-cloud-100 rounded-lg transition-colors"
                >
                  <CalendarCheck className="w-4 h-4 text-shadow-500" />
                  My Bookings
                </Link>

                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-zeus-900 bg-cloud-200 hover:bg-cloud-300 rounded-lg border border-cloud-300 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-kabul-500" />
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zeus-800 hover:text-shadow-600 hover:bg-cloud-100 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-kabul-400" />
                    Dashboard
                  </Link>
                )}

                <div className="h-6 w-px bg-cloud-300 mx-1" />

                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1 pl-2 text-sm text-zeus-800 hover:bg-cloud-100 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-shadow-100 text-shadow-700 flex items-center justify-center font-bold text-xs border border-shadow-200">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold text-zeus-900 text-xs max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-kabul-400 hover:text-rose-600 hover:bg-cloud-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-zeus-800 hover:text-shadow-600 hover:bg-cloud-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-shadow-500 hover:bg-shadow-600 rounded-xl shadow-xs transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zeus-800 hover:text-zeus-950 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cloud-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/locations" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
              Parking Locations
            </NavLink>
            <NavLink to="/search" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
              Search & Reserve
            </NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
              About System
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                  My Bookings
                </NavLink>
                {isAdmin ? (
                  <NavLink
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold px-3 py-1.5 rounded-lg text-zeus-900 bg-cloud-200"
                  >
                    Admin Panel
                  </NavLink>
                ) : (
                  <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                    Dashboard
                  </NavLink>
                )}
                <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                  Profile ({user?.name})
                </NavLink>
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-cloud-200 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-rose-700 bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold text-zeus-800 bg-cloud-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-bold text-white bg-shadow-500 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
