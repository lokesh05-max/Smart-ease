import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import {
  Car,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isConnected, lastSlotUpdate, lastReservationUpdate, lastOccupancyUpdate } = useSocket();

  const fetchDashboard = async () => {
    try {
      const [dashRes, repRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/reports'),
      ]);
      if (dashRes.data.success) {
        setData(dashRes.data);
      }
      if (repRes.data.success) {
        setReportsData(repRes.data.reports);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Real-time automatic refresh on socket events
  useEffect(() => {
    if (lastSlotUpdate || lastReservationUpdate || lastOccupancyUpdate) {
      fetchDashboard();
    }
  }, [lastSlotUpdate, lastReservationUpdate, lastOccupancyUpdate]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Synthesizing administrator metrics..." />;
  }

  const metrics = data?.metrics || {};
  const locationStats = data?.locationStats || [];
  const recentLogs = data?.recentLogs || [];
  const recentReservations = data?.recentReservations || [];
  const last7Days = reportsData?.last7Days || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
              Operations Control
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isConnected
                  ? 'bg-cloud-200 text-zeus-900 border border-cloud-300'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isConnected ? 'LIVE TELEMETRY' : 'CONNECTING'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
            System Overview & Metrics
          </h1>
        </div>

        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-zeus-900 bg-white hover:bg-cloud-50 border border-cloud-300 rounded-xl transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-shadow-500" />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Slots */}
        <div className="bg-white p-5 rounded-2xl border border-cloud-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-kabul-400 block">
            Total Slots
          </span>
          <p className="text-2xl font-black text-zeus-900">{metrics.totalSlots}</p>
          <p className="text-[10px] text-kabul-500">Across {metrics.locationsCount} locations</p>
        </div>

        {/* Available Slots */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-xs space-y-1 bg-emerald-50/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block">
            Available
          </span>
          <p className="text-2xl font-black text-emerald-700">{metrics.availableSlots}</p>
          <p className="text-[10px] text-emerald-800 font-medium">Free for booking</p>
        </div>

        {/* Occupied Slots */}
        <div className="bg-white p-5 rounded-2xl border border-rose-300 shadow-xs space-y-1 bg-rose-50/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800 block">
            Occupied
          </span>
          <p className="text-2xl font-black text-rose-700">{metrics.occupiedSlots}</p>
          <p className="text-[10px] text-rose-800 font-medium">Currently parked</p>
        </div>

        {/* Reserved Slots */}
        <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-xs space-y-1 bg-amber-50/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block">
            Reserved
          </span>
          <p className="text-2xl font-black text-amber-700">{metrics.reservedSlots}</p>
          <p className="text-[10px] text-amber-800 font-medium">Booked arrival</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-cloud-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-kabul-400 block">
            Total Revenue
          </span>
          <p className="text-2xl font-black text-zeus-900">₹{metrics.totalRevenue}</p>
          <p className="text-[10px] text-kabul-500">Settled & confirmed</p>
        </div>

        {/* Registered Users */}
        <div className="bg-white p-5 rounded-2xl border border-cloud-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-kabul-400 block">
            Drivers
          </span>
          <p className="text-2xl font-black text-shadow-700">{metrics.usersCount}</p>
          <p className="text-[10px] text-kabul-500">Registered accounts</p>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Occupancy breakdown by location */}
        <div className="bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zeus-900 text-base">Location Capacity Breakdown</h3>
              <p className="text-xs text-kabul-500">Available vs Occupied bays per terminal</p>
            </div>
            <span className="text-xs font-mono font-bold text-shadow-600">Live</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locationStats}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E1DE" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#614E41' }} />
                <YAxis tick={{ fontSize: 11, fill: '#614E41' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="available" name="Available" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                <Bar dataKey="occupied" name="Occupied" fill="#C62828" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reserved" name="Reserved" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 7-Day Revenue Trend */}
        <div className="bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zeus-900 text-base">7-Day Revenue & Booking Trend</h3>
              <p className="text-xs text-kabul-500">Calculated earnings over the last week</p>
            </div>
            <span className="text-xs font-semibold text-shadow-700 bg-shadow-100 px-2.5 py-0.5 rounded-full border border-shadow-200">
              Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7F6951" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7F6951" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E1DE" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#614E41' }} />
                <YAxis tick={{ fontSize: 11, fill: '#614E41' }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  stroke="#7F6951"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity Stream & Recent Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Reservations Table (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zeus-900 text-base">Recent Reservations</h3>
              <p className="text-xs text-kabul-500">Latest driver bookings across all terminals</p>
            </div>
            <Link
              to="/admin/reservations"
              className="text-xs font-bold text-shadow-600 hover:text-zeus-900 hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cloud-50 text-kabul-500 font-semibold uppercase tracking-wider border-y border-cloud-100">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Terminal</th>
                  <th className="py-2.5 px-3">Slot</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {recentReservations.map((r) => (
                  <tr key={r._id} className="hover:bg-cloud-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-zeus-900">
                      {r.bookingReference}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-zeus-800">
                      {r.userId?.name || 'User'}
                    </td>
                    <td className="py-2.5 px-3 text-kabul-600">{r.locationId?.name}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-shadow-600">
                      {r.slotId?.slotNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={r.status} size="xs" />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-zeus-900 text-right">
                      ₹{r.finalFee || r.estimatedFee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Live Activity Log (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-cloud-100 pb-3">
            <div>
              <h3 className="font-bold text-zeus-900 text-sm">Real-Time Activity Audit</h3>
              <p className="text-[11px] text-kabul-500">Live operational events</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {recentLogs.map((log) => (
              <div
                key={log._id}
                className="p-3 rounded-xl bg-cloud-50 border border-cloud-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zeus-900 text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-kabul-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-kabul-600 text-[11px]">
                  Actor: <strong className="text-zeus-900">{log.actorName}</strong>
                </p>
                {log.details && (
                  <p className="text-[10px] text-kabul-500 font-mono truncate">
                    {JSON.stringify(log.details)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
