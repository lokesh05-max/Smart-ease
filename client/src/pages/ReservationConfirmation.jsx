import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import {
  CheckCircle2,
  MapPin,
  QrCode,
  Printer,
  ArrowRight,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';

export const ReservationConfirmation = () => {
  const { id } = useParams();
  const locationState = useLocation();
  const [reservation, setReservation] = useState(locationState.state?.reservation || null);
  const [loading, setLoading] = useState(!reservation);

  useEffect(() => {
    if (!reservation) {
      const fetchReservation = async () => {
        try {
          const res = await api.get(`/reservations/${id}`);
          if (res.data.success) {
            setReservation(res.data.reservation);
          }
        } catch (err) {
          console.error('Failed to load reservation confirmation:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchReservation();
    }
  }, [id, reservation]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading confirmation details..." />;
  }

  if (!reservation) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <p className="text-kabul-500">Reservation not found.</p>
        <Link to="/my-bookings" className="text-shadow-600 font-bold underline">
          View My Bookings
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
          Reservation Confirmed!
        </h1>
        <p className="text-sm text-kabul-500">
          Your smart parking bay is locked in. We have sent the confirmation to your email.
        </p>
      </div>

      {/* Ticket Pass Card */}
      <div className="bg-white rounded-3xl border-2 border-cloud-300 overflow-hidden shadow-xl print:shadow-none">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-zeus-950 via-zeus-900 to-kabul-600 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zeus-800">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-cloud-300">
              Official Parking Pass
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-cloud-100">
              {reservation.bookingReference}
            </div>
            <p className="text-xs text-cloud-300">
              Show or scan this reference upon reaching the terminal
            </p>
          </div>

          <div className="bg-zeus-950/80 px-4 py-2 rounded-2xl border border-kabul-500 text-right">
            <span className="text-[10px] uppercase font-bold text-cloud-300 block">
              Estimated Fee
            </span>
            <span className="text-2xl font-black text-shadow-300">
              ₹{reservation.estimatedFee}
            </span>
          </div>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-cloud-100 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-kabul-400 font-medium">Terminal Location</span>
              <p className="font-bold text-zeus-900 text-base">
                {reservation.locationId?.name || 'ParkEase Terminal'}
              </p>
              <p className="text-xs text-kabul-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-shadow-500 shrink-0" />
                <span>
                  {reservation.locationId?.address}, {reservation.locationId?.city}
                </span>
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-xs text-kabul-400 font-medium">Allocated Bay Number</span>
              <div className="font-mono text-3xl font-black text-shadow-600">
                {reservation.slotId?.slotNumber || 'BAY'}
              </div>
              <p className="text-xs text-kabul-500">
                {reservation.slotId?.floor || 'Ground Level'} • {reservation.vehicleType} Bay
              </p>
            </div>
          </div>

          {/* Time & Vehicle Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-kabul-400 font-medium">Arrival Time</span>
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

            <div className="space-y-1">
              <span className="text-kabul-400 font-medium">Departure Time</span>
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

            <div className="space-y-1">
              <span className="text-kabul-400 font-medium">Vehicle Plate</span>
              <p className="font-mono font-bold text-zeus-900 text-sm">
                {reservation.vehiclePlate || 'NOT SPECIFIED'}
              </p>
              <p className="text-kabul-500">{reservation.vehicleType}</p>
            </div>

            <div className="space-y-1">
              <span className="text-kabul-400 font-medium">Status</span>
              <div>
                <StatusBadge status={reservation.status} size="sm" />
              </div>
              <p className="text-[10px] text-kabul-400 mt-0.5">Ready for Check-In</p>
            </div>
          </div>

          {/* QR Code Demo Section */}
          <div className="pt-6 border-t border-cloud-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-cloud-100/70 p-4 rounded-2xl border border-cloud-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white border border-cloud-300 flex items-center justify-center p-2 shadow-xs">
                <QrCode className="w-12 h-12 text-zeus-900" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-bold text-zeus-900 block">Digital Check-In QR</span>
                <p className="text-kabul-500 text-[11px] leading-relaxed">
                  Scan at facility entry kiosk or click "Check In" from your My Bookings dashboard
                  when you park.
                </p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zeus-900 bg-white hover:bg-cloud-50 border border-cloud-300 rounded-xl transition-colors shadow-xs shrink-0"
            >
              <Printer className="w-4 h-4 text-shadow-500" />
              Print / Save Pass
            </button>
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/my-bookings"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-md shadow-zeus-950/20"
        >
          <span>Go to My Bookings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/search"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-zeus-900 bg-white hover:bg-cloud-50 border border-cloud-300 transition-colors"
        >
          <span>Book Another Spot</span>
        </Link>
      </div>
    </div>
  );
};
