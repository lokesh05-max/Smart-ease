import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Clock,
  Car,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { SlotGrid } from '../components/parking/SlotGrid';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const BookSlot = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { lastSlotUpdate, joinLocation, leaveLocation } = useSocket();

  const [location, setLocation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [vehicleType, setVehicleType] = useState('Car');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 10);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [durationHours, setDurationHours] = useState(2);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    joinLocation(locationId);
    return () => leaveLocation(locationId);
  }, [locationId]);

  const fetchLocationAndSlots = async () => {
    try {
      const locRes = await api.get(`/locations/${locationId}`);
      if (locRes.data.success) {
        setLocation(locRes.data.location);
      }

      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

      const slotsRes = await api.get('/slots/availability', {
        params: {
          locationId,
          vehicleType,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        },
      });

      if (slotsRes.data.success) {
        setSlots(slotsRes.data.slots);
        if (selectedSlot) {
          const match = slotsRes.data.slots.find((s) => s._id === selectedSlot._id);
          if (!match || !match.isAvailableForWindow) {
            setSelectedSlot(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load location details:', err);
      addToast('Error loading location data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationAndSlots();
  }, [locationId, vehicleType, date, time, durationHours]);

  useEffect(() => {
    if (lastSlotUpdate && lastSlotUpdate.slot?.locationId === locationId) {
      fetchLocationAndSlots();
    }
  }, [lastSlotUpdate]);

  const handleBookSubmit = async () => {
    if (!isAuthenticated) {
      addToast('Please login to reserve a parking slot', 'info');
      navigate('/login');
      return;
    }

    if (!selectedSlot) {
      addToast('Please select a parking slot', 'error');
      return;
    }

    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

    setBookingLoading(true);
    try {
      const res = await api.post('/reservations', {
        locationId,
        slotId: selectedSlot._id,
        vehicleType,
        vehiclePlate: vehiclePlate || 'N/A',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      if (res.data.success) {
        addToast('Slot booked successfully!', 'success');
        navigate(`/confirmation/${res.data.reservation._id}`, {
          state: { reservation: res.data.reservation },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking conflict or error. Please pick another slot.';
      addToast(msg, 'error');
      fetchLocationAndSlots();
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading && !location) {
    return <LoadingSpinner fullScreen message="Loading parking terminal layout..." />;
  }

  const estimatedFee = selectedSlot ? durationHours * selectedSlot.pricePerHour : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/locations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-kabul-500 hover:text-zeus-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Locations</span>
        </Link>
      </div>

      {/* Location Banner Card */}
      <div className="bg-white rounded-3xl border border-cloud-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-shadow-100 text-shadow-700 font-bold uppercase border border-shadow-200">
              {location?.city}
            </span>
            <span className="text-xs text-kabul-400 font-medium">Terminal Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zeus-900">
            {location?.name}
          </h1>
          <p className="text-xs text-kabul-500 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-shadow-500 shrink-0" />
            <span>{location?.address}</span>
            <span className="text-cloud-300">•</span>
            <Clock className="w-4 h-4 text-kabul-400 shrink-0" />
            <span>{location?.openingHours}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-cloud-50 p-4 rounded-2xl border border-cloud-200">
          <div className="text-right">
            <span className="text-xs text-kabul-400 block">Base Tariff</span>
            <span className="text-xl font-bold text-zeus-900">₹{location?.baseHourlyRate}</span>
            <span className="text-xs text-kabul-400">/hr</span>
          </div>
        </div>
      </div>

      {/* Date, Time, Duration Selector Bar */}
      <div className="bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-zeus-900">1. Configure Parking Time & Vehicle</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zeus-800">Arrival Date</label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zeus-800">Arrival Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zeus-800">Expected Duration</label>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
            >
              <option value={1}>1 Hour</option>
              <option value={2}>2 Hours</option>
              <option value={3}>3 Hours</option>
              <option value={4}>4 Hours</option>
              <option value={6}>6 Hours</option>
              <option value={8}>8 Hours</option>
              <option value={12}>12 Hours</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zeus-800">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => {
                setVehicleType(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full px-3 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
            >
              {location?.supportedVehicleTypes?.map((vt) => (
                <option key={vt} value={vt}>
                  {vt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Slot Selection Grid & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-cloud-100 pb-3">
            <h3 className="text-sm font-bold text-zeus-900">2. Select an Available Bay</h3>
            <span className="text-xs text-kabul-400">Live Socket Synchronized</span>
          </div>

          <SlotGrid
            slots={slots}
            selectedSlotId={selectedSlot?._id}
            onSelectSlot={(slot) => setSelectedSlot(slot)}
          />
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-cloud-200 shadow-lg space-y-6 sticky top-24">
          <h3 className="text-sm font-bold text-zeus-900 border-b border-cloud-100 pb-3">
            3. Reservation Summary
          </h3>

          {selectedSlot ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cloud-100 border border-cloud-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-kabul-500">Bay Number:</span>
                  <span className="font-mono text-base font-extrabold text-shadow-700">
                    {selectedSlot.slotNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kabul-500">Level:</span>
                  <span className="font-semibold text-zeus-900">{selectedSlot.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kabul-500">Rate:</span>
                  <span className="font-semibold text-zeus-900">₹{selectedSlot.pricePerHour}/hr</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-kabul-500">Arrival:</span>
                  <span className="font-semibold text-zeus-900">
                    {date} {time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kabul-500">Duration:</span>
                  <span className="font-semibold text-zeus-900">{durationHours} Hours</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zeus-800">Number Plate (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. DL-04-CA-2026"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm font-mono uppercase bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                />
              </div>

              <div className="p-4 rounded-2xl bg-zeus-950 text-cloud-100 space-y-1 border border-zeus-800">
                <div className="flex justify-between text-xs text-cloud-400">
                  <span>Estimated Total:</span>
                  <span>
                    {durationHours} hrs × ₹{selectedSlot.pricePerHour}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-bold text-cloud-200">Total Tariff:</span>
                  <span className="text-2xl font-extrabold text-shadow-300">₹{estimatedFee}</span>
                </div>
              </div>

              <button
                onClick={handleBookSubmit}
                disabled={bookingLoading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-md shadow-zeus-950/20 flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Reservation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-kabul-500">
              Select a green parking bay from the map above to view pricing and book.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
