import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Clock,
  MapPin,
  QrCode,
  Printer,
  LogIn,
  LogOut,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const BookingDetails = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const { lastReservationUpdate } = useSocket();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/reservations/${id}`);
      if (res.data.success) {
        setReservation(res.data.reservation);
      }
    } catch (err) {
      console.error('Failed to load reservation details:', err);
      addToast('Error fetching booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (lastReservationUpdate && lastReservationUpdate.reservation?._id === id) {
      fetchDetails();
    }
  }, [lastReservationUpdate]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/reservations/${id}/check-in`);
      if (res.data.success) {
        addToast('Checked in successfully! Slot is marked occupied.', 'success');
        fetchDetails();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/reservations/${id}/check-out`);
      if (res.data.success) {
        addToast(`Checked out! Final fee: ₹${res.data.reservation.finalFee}`, 'success');
        fetchDetails();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/reservations/${id}/cancel`, {
        reason: 'User cancelled booking',
      });
      if (res.data.success) {
        addToast('Reservation cancelled and slot released', 'success');
        fetchDetails();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading booking details..." />;
  }

  if (!reservation) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <p className="text-kabul-500">Reservation not found.</p>
        <Link to="/my-bookings" className="text-shadow-600 font-bold underline">
          Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-kabul-500 hover:text-zeus-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Bookings</span>
        </Link>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-3xl border border-cloud-300 overflow-hidden shadow-xl print:shadow-none">
        {/* Pass Header */}
        <div className="bg-gradient-to-r from-zeus-950 via-zeus-900 to-kabul-600 text-white p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zeus-800">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-cloud-300">
              Smart Parking Electronic Pass
            </span>
            <div className="text-3xl font-mono font-black tracking-wide text-cloud-100">
              {reservation.bookingReference}
            </div>
            <p className="text-xs text-cloud-300">
              Created on {new Date(reservation.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <StatusBadge status={reservation.status} size="lg" />
            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-zeus-800/80 hover:bg-zeus-700 text-cloud-100 transition-colors border border-kabul-500"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-8 space-y-8">
          {/* Location & Bay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-cloud-100">
            <div className="space-y-2">
              <span className="text-xs text-kabul-400 font-medium">Terminal Facility</span>
              <h3 className="text-xl font-bold text-zeus-900">
                {reservation.locationId?.name}
              </h3>
              <p className="text-xs text-kabul-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-shadow-500 shrink-0" />
                <span>
                  {reservation.locationId?.address}, {reservation.locationId?.city}
                </span>
              </p>
              <p className="text-xs text-kabul-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-kabul-400 shrink-0" />
                <span>{reservation.locationId?.openingHours}</span>
              </p>
            </div>

            <div className="space-y-2 md:text-right">
              <span className="text-xs text-kabul-400 font-medium">Reserved Slot</span>
              <div className="text-4xl font-mono font-black text-shadow-600">
                {reservation.slotId?.slotNumber}
              </div>
              <p className="text-xs text-zeus-800 font-medium">
                {reservation.slotId?.floor} • {reservation.vehicleType} Bay
              </p>
              <p className="text-xs text-kabul-400">
                Base Rate: ₹{reservation.slotId?.pricePerHour}/hr
              </p>
            </div>
          </div>

          {/* Time & Vehicle Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs pb-6 border-b border-cloud-100">
            <div>
              <span className="text-kabul-400 block mb-1">Scheduled Arrival</span>
              <p className="font-bold text-zeus-900 text-sm">
                {new Date(reservation.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-kabul-500">
                {new Date(reservation.startTime).toLocaleDateString()}
              </p>
            </div>

            <div>
              <span className="text-kabul-400 block mb-1">Scheduled Departure</span>
              <p className="font-bold text-zeus-900 text-sm">
                {new Date(reservation.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-kabul-500">
                {new Date(reservation.endTime).toLocaleDateString()}
              </p>
            </div>

            <div>
              <span className="text-kabul-400 block mb-1">Actual Check-In</span>
              <p className="font-bold text-zeus-900 text-sm">
                {reservation.checkInTime
                  ? new Date(reservation.checkInTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Pending'}
              </p>
              <p className="text-kabul-500">
                {reservation.checkInTime
                  ? new Date(reservation.checkInTime).toLocaleDateString()
                  : 'Not yet recorded'}
              </p>
            </div>

            <div>
              <span className="text-kabul-400 block mb-1">Actual Check-Out</span>
              <p className="font-bold text-zeus-900 text-sm">
                {reservation.checkOutTime
                  ? new Date(reservation.checkOutTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Pending'}
              </p>
              <p className="text-kabul-500">
                {reservation.checkOutTime
                  ? new Date(reservation.checkOutTime).toLocaleDateString()
                  : 'Not yet settled'}
              </p>
            </div>
          </div>

          {/* Fare Summary & QR Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-cloud-100/70 p-6 rounded-2xl border border-cloud-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white border border-cloud-300 flex items-center justify-center p-2 shadow-xs">
                <QrCode className="w-12 h-12 text-zeus-900" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-bold text-zeus-900 block">Verification Pass</span>
                <p className="text-kabul-500 font-mono text-[11px]">
                  Vehicle: {reservation.vehiclePlate || 'N/A'} ({reservation.vehicleType})
                </p>
                <p className="text-kabul-400 text-[10px]">Holder: {reservation.userId?.name}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-kabul-400 block">
                {reservation.status === 'Completed' ? 'Final Settled Tariff' : 'Estimated Tariff'}
              </span>
              <span className="text-3xl font-black text-zeus-900">
                ₹{reservation.finalFee || reservation.estimatedFee}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex flex-wrap items-center justify-end gap-3 print:hidden">
            {reservation.status === 'Confirmed' && !reservation.checkInTime && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  Cancel Booking
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Manual Check In Now</span>
                </button>
              </>
            )}

            {reservation.status === 'Confirmed' && reservation.checkInTime && (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Check Out & Settle Fee</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
