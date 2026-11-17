import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Cpu, Clock, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-zeus-950 text-cloud-300 pt-16 pb-12 border-t border-zeus-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: System info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-shadow-500 flex items-center justify-center text-white shadow-md">
                <Car className="w-5 h-5 text-cloud-100" />
              </div>
              <span className="text-xl font-bold tracking-tight text-cloud-100">
                Park<span className="text-shadow-300">Ease</span>
              </span>
            </div>
            <p className="text-xs text-cloud-400 leading-relaxed">
              Real-Time Smart Parking Reservation & Occupancy Management System.
              Engineered with full-stack Node.js, React, MongoDB, and Socket.IO for warm, reliable urban mobility.
            </p>
            <div className="flex items-center gap-3 text-xs text-cloud-400 pt-2">
              <span className="inline-flex items-center gap-1 text-shadow-300">
                <Cpu className="w-3.5 h-3.5" />
                Socket.IO
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-cloud-200">
                <Shield className="w-3.5 h-3.5" />
                JWT Auth
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-kabul-300">
                <Clock className="w-3.5 h-3.5" />
                Instant Sync
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-cloud-100 mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-cloud-400 hover:text-cloud-100 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-cloud-400 hover:text-cloud-100 transition-colors">
                  Parking Locations
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-cloud-400 hover:text-cloud-100 transition-colors">
                  Find & Reserve Slot
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cloud-400 hover:text-cloud-100 transition-colors">
                  System Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: User Portal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-cloud-100 mb-4">
              User & Management
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="text-cloud-400 hover:text-cloud-100 transition-colors">
                  User / Admin Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-cloud-400 hover:text-cloud-100 transition-colors">
                  Create User Account
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-cloud-400 hover:text-cloud-100 transition-colors">
                  Check-in / Check-out
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-cloud-400 hover:text-cloud-100 transition-colors">
                  Administrator Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Academic Project Metadata */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-cloud-100 mb-4">
              Final Year Project
            </h4>
            <div className="p-4 rounded-xl bg-zeus-900 border border-zeus-800 space-y-2 text-xs text-cloud-300">
              <p className="font-semibold text-cloud-100">B.Tech / B.E. Computer Science</p>
              <p className="text-cloud-400">
                Department of Computer Science & Engineering
              </p>
              <div className="pt-2 border-t border-zeus-800 flex items-center justify-between text-[11px] text-cloud-400">
                <span>Academic Session</span>
                <span className="font-mono text-shadow-300 font-semibold">2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zeus-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cloud-500">
          <p>© 2026 ParkEase Smart Parking Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for college project presentation with
            <Heart className="w-3.5 h-3.5 text-shadow-400 fill-shadow-400" />
            Warmth, Stability & Sophistication
          </p>
        </div>
      </div>
    </footer>
  );
};
