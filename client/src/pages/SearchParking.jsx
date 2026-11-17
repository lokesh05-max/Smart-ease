import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Search,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { SlotGrid } from '../components/parking/SlotGrid';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SearchParking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { lastSlotUpdate, lastReservationUpdate, joinLocation, leaveLocation } = useSocket();

  // Search parameters state
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 10);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [durationHours, setDurationHours] = useState(2);
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Availability & Selection state
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availableCount, setAvailableCount] = useState(0);

  // Load locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        if (res.data.success && res.data.locations.length > 0) {
          setLocations(res.data.locations);
          const initialLoc =
            searchParams.get('locationId') || res.data.locations[0]._id;
          setSelectedLocationId(initialLoc);
        }
      } catch (err) {
        console.error('Failed to load locations:', err);
      }
    };

    fetchLocations();
  }, [searchParams]);

  // Join location room for live socket updates
  useEffect(() => {
    if (selectedLocationId) {
      joinLocation(selectedLocationId);
      return () => leaveLocation(selectedLocationId);
    }
  }, [selectedLocationId]);

  // Fetch slot availability whenever location, date, time, duration, or vehicleType changes
  const fetchAvailability = async () => {
    if (!selectedLocationId) return;

    setLoading(true);
    try {
      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

      const res = await api.get('/slots/availability', {
        params: {
          locationId: selectedLocationId,
          vehicleType,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        },
      });

      if (res.data.success) {
        setSlots(res.data.slots);
        setAvailableCount(res.data.availableCount);
        if (selectedSlot) {
          const match = res.data.slots.find((s) => s._id === selectedSlot._id);
          if (!match || !match.isAvailableForWindow) {
            setSelectedSlot(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to query availability:', err);
      addToast('Error fetching slot availability', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLocationId) {
      fetchAvailability();
    }
  }, [selectedLocationId, vehicleType, date, time, durationHours]);

  // Socket: Real-time update listener
  useEffect(() => {
    if (lastSlotUpdate) {
      fetchAvailability();
    }
  }, [lastSlotUpdate, lastReservationUpdate]);

  // Handle Slot Reservation submission
  const handleConfirmReservation = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in or register to complete your reservation', 'info');
      navigate('/login');
      return;
    }

    if (!selectedSlot) {
      addToast('Please select an available parking slot from the map', 'error');
      return;
    }

    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

    setBookingLoading(true);
    try {
      const res = await api.post('/reservations', {
        locationId: selectedLocationId,
        slotId: selectedSlot._id,
        vehicleType,
        vehiclePlate: vehiclePlate || 'N/A',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      if (res.data.success) {
        addToast('Parking slot reserved successfully!', 'success');
        navigate(`/confirmation/${res.data.reservation._id}`, {
          state: { reservation: res.data.reservation },
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to reserve slot. It may have been just booked by another user.';
      addToast(msg, 'error');
      fetchAvailability();
    } finally {
      setBookingLoading(false);
    }
  };

  const currentLocation = locations.find((l) => l._id === selectedLocationId);
  const estimatedCost = selectedSlot ? durationHours * selectedSlot.pricePerHour : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
          Interactive Booking Engine
        </span>
        <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
          Find & Reserve a Parking Bay
        </h1>
        <p className="text-sm text-kabul-500">
          Check real-time bay status for your arrival time and prevent double-booking.
        </p>
      </div>

      {/* Search and Filter Panel */}
      <div className="bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Location Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zeus-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-shadow-500" />
              Terminal Location
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => {
                setSelectedLocationId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full px-3 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 font-medium text-zeus-900"
            >
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name} ({loc.city})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zeus-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-shadow-500" />
              Arrival Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 font-medium text-zeus-900"
            />
          </div>

          {/* Time Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zeus-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-shadow-500" />
              Arrival Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 font-medium text-zeus-900"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zeus-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-shadow-500" />
              Duration
            </label>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 font-medium text-zeus-900"
            >
              <option value={1}>1 Hour</option>
              <option value={2}>2 Hours</option>
              <option value={3}>3 Hours</option>
              <option value={4}>4 Hours</option>
              <option value={6}>6 Hours</option>
              <option value={8}>8 Hours</option>
              <option value={12}>12 Hours</option>
              <option value={24}>24 Hours</option>
            </select>
          </div>

          {/* Vehicle Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zeus-800 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-shadow-500" />
              Vehicle Type
            </label>
            <select
              value={vehicleType}
              onChange={(e) => {
                setVehicleType(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full px-3 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 font-medium text-zeus-900"
            >
              <option value="Car">Car (Standard)</option>
              <option value="SUV">SUV / Large Vehicle</option>
              <option value="EV">Electric Vehicle (EV Charger)</option>
              <option value="Bike">Motorcycle / Two-Wheeler</option>
            </select>
          </div>
        </div>

        {/* Live Status Header */}
        <div className="pt-4 border-t border-cloud-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-semibold text-zeus-900">
              {availableCount} Available Spots for Selected Window
            </span>
            <span className="text-kabul-500">
              ({new Date(`${date}T${time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
              to{' '}
              {new Date(
                new Date(`${date}T${time}:00`).getTime() + durationHours * 60 * 60 * 1000
              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              )
            </span>
          </div>

          <button
            onClick={fetchAvailability}
            className="text-shadow-600 hover:text-zeus-900 font-semibold flex items-center gap-1"
          >
            <span>Refresh Availability</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Slot Grid */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-cloud-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zeus-900">
                Visual Parking Grid: {currentLocation?.name}
              </h3>
              <p className="text-xs text-kabul-500">
                Click any green "Available" slot to select it for reservation
              </p>
            </div>
            {selectedSlot && (
              <span className="px-3 py-1 rounded-xl bg-shadow-100 text-shadow-700 border border-shadow-300 text-xs font-bold font-mono">
                Selected: {selectedSlot.slotNumber}
              </span>
            )}
          </div>

          {loading ? (
            <LoadingSpinner message="Calculating time-overlap availability..." />
          ) : slots.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-kabul-400">
              <Car className="w-8 h-8 mx-auto" />
              <p className="text-sm">No slots found matching this vehicle type.</p>
            </div>
          ) : (
            <SlotGrid
              slots={slots}
              selectedSlotId={selectedSlot?._id}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          )}
        </div>

        {/* Right: Booking Summary Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-cloud-200 shadow-lg space-y-6 sticky top-24">
          <div className="border-b border-cloud-100 pb-4">
            <h3 className="text-lg font-bold text-zeus-900">Reservation Summary</h3>
            <p className="text-xs text-kabul-500">Review details before confirming</p>
          </div>

          {selectedSlot ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cloud-100 border border-cloud-200 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-kabul-500 font-medium">Selected Bay:</span>
                  <span className="font-mono text-base font-extrabold text-shadow-700">
                    {selectedSlot.slotNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-kabul-500 font-medium">Floor Level:</span>
                  <span className="font-semibold text-zeus-900">{selectedSlot.floor}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-kabul-500 font-medium">Vehicle Type:</span>
                  <span className="font-semibold text-zeus-900">{selectedSlot.vehicleType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-kabul-500 font-medium">Hourly Tariff:</span>
                  <span className="font-semibold text-zeus-900">₹{selectedSlot.pricePerHour}/hr</span>
                </div>
              </div>

              {/* Time Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-kabul-500">Scheduled Arrival:</span>
                  <span className="font-semibold text-zeus-900">
                    {date} at {time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kabul-500">Duration:</span>
                  <span className="font-semibold text-zeus-900">{durationHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kabul-500">Estimated Departure:</span>
                  <span className="font-semibold text-zeus-900">
                    {new Date(
                      new Date(`${date}T${time}:00`).getTime() + durationHours * 60 * 60 * 1000
                    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Vehicle Number Plate input */}
              <div className="space-y-1.5 pt-2 border-t border-cloud-100">
                <label className="text-xs font-bold text-zeus-800">
                  Vehicle Registration Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH 02 AB 1234"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm uppercase font-mono bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 text-zeus-900"
                />
              </div>

              {/* Total Calculation */}
              <div className="p-4 rounded-2xl bg-zeus-950 text-cloud-100 space-y-2 border border-zeus-800">
                <div className="flex justify-between text-xs text-cloud-400">
                  <span>
                    Calculation ({durationHours} hrs × ₹{selectedSlot.pricePerHour})
                  </span>
                  <span>₹{estimatedCost}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-zeus-800">
                  <span className="text-sm font-bold text-cloud-200">Estimated Total Fee:</span>
                  <span className="text-2xl font-extrabold text-shadow-300">₹{estimatedCost}</span>
                </div>
                <p className="text-[10px] text-cloud-400 leading-tight">
                  * Final fee is computed upon check-out based on actual parked duration.
                </p>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmReservation}
                disabled={bookingLoading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-md shadow-zeus-950/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving Slot Atomically...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Reserve Slot</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cloud-100 text-kabul-500 flex items-center justify-center mx-auto">
                <Car className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zeus-800">No Bay Selected</h4>
              <p className="text-xs text-kabul-500 max-w-xs mx-auto">
                Choose an available slot from the grid on the left to view the booking summary and lock in your reservation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
