import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import {
  Search,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const { addToast } = useToast();
  const { lastReservationUpdate } = useSocket();

  const fetchReservations = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/admin/reservations', { params });
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  useEffect(() => {
    if (lastReservationUpdate) {
      fetchReservations();
    }
  }, [lastReservationUpdate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReservations();
  };

  const handleCheckIn = async (id) => {
    setActionLoading(id);
    try {
      const res = await api.post(`/reservations/${id}/check-in`);
      if (res.data.success) {
        addToast('Admin manual check-in successful', 'success');
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
        addToast(`Check-out recorded. Final Fee: ₹${res.data.reservation.finalFee}`, 'success');
        fetchReservations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation as Administrator?')) {
      return;
    }
    setActionLoading(id);
    try {
      const res = await api.patch(`/reservations/${id}/cancel`, {
        reason: 'Cancelled by Administrator',
      });
      if (res.data.success) {
        addToast('Reservation cancelled and slot freed', 'success');
        fetchReservations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading reservations..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
          Booking Management
        </span>
        <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
          All Driver Reservations
        </h1>
        <p className="text-sm text-kabul-500">
          Search, audit, and manually manage parking reservations across facilities.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-cloud-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Reference ID, Driver Name, or Slot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 text-zeus-900"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-shadow-500 hover:bg-shadow-600 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['all', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-zeus-900 text-cloud-100'
                  : 'bg-cloud-100 text-kabul-600 hover:bg-cloud-200'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-cloud-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cloud-50 text-kabul-500 font-semibold uppercase tracking-wider border-b border-cloud-200">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Terminal</th>
                <th className="py-3 px-4">Slot</th>
                <th className="py-3 px-4">Arrival Window</th>
                <th className="py-3 px-4">Check-In / Out</th>
                <th className="py-3 px-4">Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-100">
              {reservations.map((r) => (
                <tr key={r._id} className="hover:bg-cloud-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-zeus-900">
                    {r.bookingReference}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-zeus-900 block">{r.userId?.name}</span>
                    <span className="text-[10px] text-kabul-400">{r.userId?.email}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-zeus-800">{r.locationId?.name}</td>
                  <td className="py-3 px-4 font-mono font-black text-shadow-600">
                    {r.slotId?.slotNumber}
                  </td>
                  <td className="py-3 px-4 text-kabul-600">
                    <div>
                      {new Date(r.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(r.endTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-[10px] text-kabul-400">
                      {new Date(r.startTime).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[11px]">
                    {r.checkInTime ? (
                      <span className="text-emerald-800 font-medium block">
                        In:{' '}
                        {new Date(r.checkInTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    ) : (
                      <span className="text-kabul-400 block">Not Checked In</span>
                    )}
                    {r.checkOutTime && (
                      <span className="text-kabul-600 block">
                        Out:{' '}
                        {new Date(r.checkOutTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-black text-zeus-900">
                    ₹{r.finalFee || r.estimatedFee}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} size="xs" />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {r.status === 'Confirmed' && !r.checkInTime && (
                        <button
                          onClick={() => handleCheckIn(r._id)}
                          disabled={actionLoading === r._id}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                        >
                          Check In
                        </button>
                      )}

                      {r.status === 'Confirmed' && r.checkInTime && (
                        <button
                          onClick={() => handleCheckOut(r._id)}
                          disabled={actionLoading === r._id}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                        >
                          Check Out
                        </button>
                      )}

                      {r.status === 'Confirmed' && !r.checkInTime && (
                        <button
                          onClick={() => handleCancel(r._id)}
                          disabled={actionLoading === r._id}
                          className="px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
