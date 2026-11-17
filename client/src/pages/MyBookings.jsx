import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Car,
  LogIn,
  LogOut,
  Eye,
  CalendarCheck,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const MyBookings = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const { addToast } = useToast();
  const { lastReservationUpdate } = useSocket();

  const fetchReservations = async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const res = await api.get('/reservations/my', { params });
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error('Failed to load reservations:', err);
      addToast('Error loading reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filterStatus]);

  useEffect(() => {
    if (lastReservationUpdate) {
      fetchReservations();
    }
  }, [lastReservationUpdate]);

  const handleCheckIn = async (id) => {
    setActionLoading(id);
    try {
      const res = await api.post(`/reservations/${id}/check-in`);
      if (res.data.success) {
        addToast('Checked in successfully! Parking slot marked as Occupied.', 'success');
        fetchReservations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (id) => {
    setActionLoading(id);
    try {
      const res = await api.post(`/reservations/${id}/check-out`);
      if (res.data.success) {
        addToast(`Checked out successfully! Final fee: ₹${res.data.reservation.finalFee}`, 'success');
        fetchReservations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The slot will be released.')) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await api.patch(`/reservations/${id}/cancel`, {
        reason: 'Cancelled by user',
      });
      if (res.data.success) {
        addToast('Reservation cancelled and slot released.', 'success');
        fetchReservations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
            Booking Management
          </span>
          <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
            My Parking Reservations
          </h1>
          <p className="text-sm text-kabul-500">
            Manage your bookings, perform arrival check-in, checkout, or cancellation.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 bg-white p-1.5 rounded-2xl border border-cloud-200 shadow-xs">
          {[
            { label: 'All Bookings', value: 'all' },
            { label: 'Confirmed', value: 'Confirmed' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Cancelled', value: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                filterStatus === tab.value
                  ? 'bg-zeus-900 text-cloud-100 shadow-xs'
                  : 'text-kabul-500 hover:bg-cloud-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner message="Fetching your reservations..." />
      ) : reservations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-cloud-200 space-y-4">
          <CalendarCheck className="w-12 h-12 text-cloud-400 mx-auto" />
          <h3 className="text-lg font-bold text-zeus-800">No reservations found</h3>
          <p className="text-xs text-kabul-500 max-w-sm mx-auto">
            You don't have any reservations under the selected filter.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-shadow-500 hover:bg-shadow-600 shadow-xs"
          >
            <Car className="w-4 h-4" />
            <span>Find & Book a Slot</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((r) => {
            const isConfirmed = r.status === 'Confirmed';
            const isCheckedIn = !!r.checkInTime && !r.checkOutTime;

            return (
              <div
                key={r._id}
                className="bg-white rounded-3xl border border-cloud-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5"
              >
                {/* Header: Ref & Status */}
                <div className="flex items-start justify-between gap-2 border-b border-cloud-100 pb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-zeus-900 block">
                      {r.bookingReference}
                    </span>
                    <span className="text-[10px] text-kabul-400">
                      Booked on {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StatusBadge status={r.status} size="xs" />
                </div>

                {/* Details */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-kabul-400 block text-[11px]">Location</span>
                    <p className="font-bold text-zeus-900 text-sm">{r.locationId?.name}</p>
                    <p className="text-kabul-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-shadow-500 shrink-0" />
                      <span>{r.locationId?.address}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-cloud-100/70 p-3 rounded-2xl border border-cloud-200">
                    <div>
                      <span className="text-kabul-400 block text-[10px]">Bay Number</span>
                      <span className="font-mono text-lg font-black text-shadow-700">
                        {r.slotId?.slotNumber}
                      </span>
                      <p className="text-[10px] text-kabul-500">{r.slotId?.floor}</p>
                    </div>
                    <div>
                      <span className="text-kabul-400 block text-[10px]">Vehicle</span>
                      <span className="font-bold text-zeus-900 text-xs">{r.vehicleType}</span>
                      <p className="font-mono text-[10px] text-kabul-500">
                        {r.vehiclePlate || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Timings */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span className="text-kabul-400">Arrival:</span>
                      <span className="font-semibold text-zeus-800">
                        {new Date(r.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({new Date(r.startTime).toLocaleDateString()})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kabul-400">Departure:</span>
                      <span className="font-semibold text-zeus-800">
                        {new Date(r.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({new Date(r.endTime).toLocaleDateString()})
                      </span>
                    </div>
                    {r.checkInTime && (
                      <div className="flex justify-between text-emerald-800 font-medium">
                        <span>Checked In:</span>
                        <span>
                          {new Date(r.checkInTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                    {r.checkOutTime && (
                      <div className="flex justify-between text-kabul-600">
                        <span>Checked Out:</span>
                        <span>
                          {new Date(r.checkOutTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-cloud-100">
                    <span className="text-kabul-500 font-medium">Tariff:</span>
                    <span className="text-base font-extrabold text-zeus-900">
                      ₹{r.finalFee || r.estimatedFee}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-cloud-100 flex flex-wrap items-center justify-between gap-2">
                  <Link
                    to={`/my-bookings/${r._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-shadow-600 hover:text-zeus-900 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Pass</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    {/* Check In Action */}
                    {isConfirmed && !r.checkInTime && (
                      <button
                        onClick={() => handleCheckIn(r._id)}
                        disabled={actionLoading === r._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Check In</span>
                      </button>
                    )}

                    {/* Check Out Action */}
                    {isConfirmed && isCheckedIn && (
                      <button
                        onClick={() => handleCheckOut(r._id)}
                        disabled={actionLoading === r._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Check Out</span>
                      </button>
                    )}

                    {/* Cancel Action */}
                    {isConfirmed && !r.checkInTime && (
                      <button
                        onClick={() => handleCancel(r._id)}
                        disabled={actionLoading === r._id}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
