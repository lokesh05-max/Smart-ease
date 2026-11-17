import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  LogIn,
  LogOut,
  CalendarCheck,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const UserDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { lastReservationUpdate } = useSocket();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/reservations/my');
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Socket auto refresh
  useEffect(() => {
    if (lastReservationUpdate) {
      fetchBookings();
    }
  }, [lastReservationUpdate]);

  const activeReservations = reservations.filter(
    (r) => r.status === 'Confirmed' || (r.status === 'Confirmed' && r.checkInTime)
  );
  const completedReservations = reservations.filter((r) => r.status === 'Completed');
  const totalSpent = reservations.reduce((sum, r) => sum + (r.finalFee || r.estimatedFee || 0), 0);

  const currentActive =
    activeReservations.find((r) => r.checkInTime && !r.checkOutTime) || activeReservations[0];

  const handleCheckIn = async (resId) => {
    setActionLoading(resId);
    try {
      const res = await api.post(`/reservations/${resId}/check-in`);
      if (res.data.success) {
        addToast('Checked in successfully! Slot is marked occupied.', 'success');
        fetchBookings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (resId) => {
    setActionLoading(resId);
    try {
      const res = await api.post(`/reservations/${resId}/check-out`);
      if (res.data.success) {
        addToast(`Checked out! Final fee: ₹${res.data.reservation.finalFee}`, 'success');
        fetchBookings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-zeus-950 via-zeus-900 to-kabul-600 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-zeus-800">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cloud-300">
            Driver Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-cloud-100">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-cloud-300 max-w-xl">
            Monitor your ongoing parking session, check in/out easily, or reserve a new bay.
          </p>
        </div>

        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cloud-100 text-zeus-950 hover:bg-white text-sm font-bold transition-all shadow-md shrink-0"
        >
          <Car className="w-4 h-4 text-shadow-500" />
          <span>Book New Slot</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-kabul-400">
            Active / Upcoming
          </span>
          <p className="text-3xl font-extrabold text-shadow-600">{activeReservations.length}</p>
          <p className="text-[11px] text-kabul-500">Live guaranteed reservations</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-kabul-400">
            Completed Trips
          </span>
          <p className="text-3xl font-extrabold text-emerald-700">
            {completedReservations.length}
          </p>
          <p className="text-[11px] text-kabul-500">Successfully parked sessions</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-kabul-400">
            Total Bookings
          </span>
          <p className="text-3xl font-extrabold text-zeus-900">{reservations.length}</p>
          <p className="text-[11px] text-kabul-500">All lifetime reservations</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-kabul-400">
            Total Spent
          </span>
          <p className="text-3xl font-extrabold text-zeus-900">₹{totalSpent}</p>
          <p className="text-[11px] text-kabul-500">Accumulated parking tariff</p>
        </div>
      </div>

      {/* Active Session Spotlight Card */}
      {currentActive && (
        <div className="bg-white rounded-3xl border-2 border-shadow-500/40 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cloud-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
                Active Spotlight
              </span>
              <h2 className="text-xl font-extrabold text-zeus-900">
                Current Parking Reservation
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-cloud-100 px-3 py-1 rounded-xl text-zeus-900 border border-cloud-200">
                {currentActive.bookingReference}
              </span>
              <StatusBadge status={currentActive.status} size="sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-kabul-400 font-medium">Location</span>
              <p className="font-bold text-zeus-900 text-base">
                {currentActive.locationId?.name}
              </p>
              <p className="text-xs text-kabul-500">{currentActive.locationId?.address}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-kabul-400 font-medium">Slot & Vehicle</span>
              <div className="font-mono text-2xl font-black text-shadow-600">
                Bay {currentActive.slotId?.slotNumber}
              </div>
              <p className="text-xs text-kabul-500">
                {currentActive.vehicleType} • Plate: {currentActive.vehiclePlate || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-kabul-400 font-medium">Booking Window</span>
              <p className="font-bold text-zeus-900">
                {new Date(currentActive.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {new Date(currentActive.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-xs text-kabul-500">
                {new Date(currentActive.startTime).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-cloud-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-kabul-500">
              {currentActive.checkInTime ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Vehicle currently parked (Checked in at{' '}
                  {new Date(currentActive.checkInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  )
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Pending Arrival Check-In
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!currentActive.checkInTime ? (
                <button
                  onClick={() => handleCheckIn(currentActive._id)}
                  disabled={actionLoading === currentActive._id}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Manual Check-In</span>
                </button>
              ) : (
                <button
                  onClick={() => handleCheckOut(currentActive._id)}
                  disabled={actionLoading === currentActive._id}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Check-Out & Pay</span>
                </button>
              )}

              <Link
                to={`/my-bookings/${currentActive._id}`}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zeus-900 bg-cloud-100 hover:bg-cloud-200 transition-colors border border-cloud-200"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent History Table */}
      <div className="bg-white rounded-3xl border border-cloud-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zeus-900">Recent Parking Activity</h3>
            <p className="text-xs text-kabul-500">Your latest parking reservations</p>
          </div>
          <Link
            to="/my-bookings"
            className="text-xs font-bold text-shadow-600 hover:text-zeus-900 flex items-center gap-1"
          >
            <span>All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Car className="w-10 h-10 text-cloud-400 mx-auto" />
            <p className="text-sm text-kabul-500">No reservations created yet.</p>
            <Link
              to="/search"
              className="inline-block text-xs font-bold text-shadow-600 hover:underline"
            >
              Find a parking slot now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cloud-50 text-kabul-500 font-semibold uppercase tracking-wider border-y border-cloud-100">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Bay</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {reservations.slice(0, 5).map((r) => (
                  <tr key={r._id} className="hover:bg-cloud-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-zeus-900">
                      {r.bookingReference}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zeus-800">
                      {r.locationId?.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-shadow-600">
                      {r.slotId?.slotNumber}
                    </td>
                    <td className="py-3.5 px-4 text-kabul-600">
                      {new Date(r.startTime).toLocaleDateString()},{' '}
                      {new Date(r.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zeus-900">
                      ₹{r.finalFee || r.estimatedFee}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/my-bookings/${r._id}`}
                        className="text-shadow-600 hover:underline font-semibold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
