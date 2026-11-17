import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import {
  Car,
  Search,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  MapPin,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const Home = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/locations');
        if (res.data.success) {
          setLocations(res.data.locations);
        }
      } catch (err) {
        console.error('Failed to load locations for homepage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const totalSlotsAcrossAll = locations.reduce((sum, l) => sum + (l.stats?.totalSlots || 0), 0);
  const availableSlotsAcrossAll = locations.reduce(
    (sum, l) => sum + (l.stats?.availableSlots || 0),
    0
  );

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate(`/search?search=${encodeURIComponent(searchCity)}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zeus-950 via-zeus-900 to-zeus-950 text-cloud-100 pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle warm geometric grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cecbc810_1px,transparent_1px),linear-gradient(to_bottom,#cecbc810_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-shadow-500/15 border border-shadow-400/30 text-shadow-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-shadow-300" />
            <span>Smart Urban Parking • Warmth & Stability</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Reserve Your Parking Spot in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cloud-100 via-shadow-300 to-shadow-400">
              Real Time
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-cloud-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate parking search delays. View live bay availability, book guaranteed slots in advance,
            and enjoy seamless check-in with transparent billing.
          </p>

          {/* Quick Search Box */}
          <div className="max-w-3xl mx-auto bg-zeus-900/90 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-cloud-300/20 shadow-2xl">
            <form
              onSubmit={handleQuickSearch}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-3 bg-white text-zeus-900 px-4 py-3 rounded-xl w-full border border-cloud-200">
                <MapPin className="w-5 h-5 text-shadow-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter location, city, or terminal name..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full text-sm font-medium bg-transparent border-none focus:outline-none text-zeus-900 placeholder:text-kabul-400"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-shadow-500 hover:bg-shadow-600 rounded-xl transition-all shadow-lg shadow-zeus-950/40 shrink-0"
              >
                <Search className="w-4 h-4" />
                Find Parking
              </button>
            </form>
          </div>

          {/* Live System Counter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs sm:text-sm text-cloud-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong className="text-white font-bold">{availableSlotsAcrossAll}</strong> Available Bays Right Now
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-shadow-400" />
              <span>
                <strong className="text-white font-bold">{totalSlotsAcrossAll}</strong> Total Monitored Slots
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-kabul-300" />
              <span>
                <strong className="text-white font-bold">{locations.length}</strong> Prime Smart Terminals
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Booking Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-shadow-600">
            Effortless Experience
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zeus-900">
            How Smart Parking Works
          </h3>
          <p className="text-sm text-kabul-500 max-w-xl mx-auto">
            Book guaranteed parking in three simple steps without stress or roaming circles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative p-6 bg-white rounded-2xl border border-cloud-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-cloud-100 text-zeus-900 border border-cloud-300 flex items-center justify-center font-extrabold text-lg mb-4">
              01
            </div>
            <h4 className="text-lg font-bold text-zeus-900 mb-2">Search Location & Time</h4>
            <p className="text-sm text-kabul-500 leading-relaxed">
              Select your desired parking terminal, arrival time, and duration. Our engine checks
              slot availability in real-time.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 bg-white rounded-2xl border border-cloud-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-shadow-100 text-shadow-700 border border-shadow-200 flex items-center justify-center font-extrabold text-lg mb-4">
              02
            </div>
            <h4 className="text-lg font-bold text-zeus-900 mb-2">Select Your Preferred Slot</h4>
            <p className="text-sm text-kabul-500 leading-relaxed">
              View our visual interactive parking bay map. Pick standard, EV charging, or motorcycle
              spaces with transparent hourly pricing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 bg-white rounded-2xl border border-cloud-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-kabul-300/20 text-kabul-700 border border-kabul-300 flex items-center justify-center font-extrabold text-lg mb-4">
              03
            </div>
            <h4 className="text-lg font-bold text-zeus-900 mb-2">Check-in & Park Instantly</h4>
            <p className="text-sm text-kabul-500 leading-relaxed">
              Receive your unique Booking ID. Check-in directly from your phone upon arrival and check-out
              when leaving with automated fare calculation.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Parking Locations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-shadow-600">
              Live Network
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zeus-900">
              Featured Parking Locations
            </h3>
          </div>
          <Link
            to="/locations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-shadow-600 hover:text-zeus-900"
          >
            <span>View All Terminals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {locations.slice(0, 3).map((loc) => (
            <div
              key={loc._id}
              className="bg-white rounded-2xl border border-cloud-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              {/* Image banner */}
              <div className="relative h-44 bg-zeus-900 overflow-hidden">
                <img
                  src={
                    loc.image ||
                    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-zeus-900 shadow-md">
                    ₹{loc.stats?.minPrice || loc.baseHourlyRate}/hr
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-1">
                  {loc.supportedVehicleTypes?.map((vt) => (
                    <span
                      key={vt}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zeus-950/80 text-cloud-100 backdrop-blur-sm"
                    >
                      {vt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-zeus-900 group-hover:text-shadow-600 transition-colors">
                    {loc.name}
                  </h4>
                  <p className="text-xs text-kabul-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-shadow-500 shrink-0" />
                    <span className="truncate">{loc.address}</span>
                  </p>
                  <p className="text-xs text-kabul-600 line-clamp-2 pt-1">{loc.description}</p>
                </div>

                {/* Slot availability progress bar */}
                <div className="space-y-1.5 pt-2 border-t border-cloud-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-kabul-400">Available Slots</span>
                    <span className="font-bold text-zeus-900">
                      {loc.stats?.availableSlots} / {loc.stats?.totalSlots}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cloud-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-500"
                      style={{
                        width: `${
                          loc.stats?.totalSlots
                            ? (loc.stats.availableSlots / loc.stats.totalSlots) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <Link
                  to={`/book/${loc._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-xs"
                >
                  <span>Select Slot & Book</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-shadow-600">
            System Capabilities
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zeus-900">
            Engineered for Smart Cities
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cloud-100 text-zeus-900 flex items-center justify-center">
              <Zap className="w-5 h-5 text-shadow-500" />
            </div>
            <h4 className="font-bold text-zeus-900">Instant Socket Sync</h4>
            <p className="text-xs text-kabul-500 leading-relaxed">
              When any spot is reserved or vacated, changes reflect in milliseconds across all browsers
              without requiring page refreshes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-zeus-900">No Double Bookings</h4>
            <p className="text-xs text-kabul-500 leading-relaxed">
              Protected by atomic locks and database overlap checking to guarantee two users can never
              book the same bay concurrently.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-shadow-100 text-shadow-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-zeus-900">Manual Check-In/Out</h4>
            <p className="text-xs text-kabul-500 leading-relaxed">
              Full academic lifecycle support for manual driver arrival check-in, real duration tracking,
              and checkout fee settlement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-kabul-300/20 text-kabul-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-zeus-900">Admin Live Analytics</h4>
            <p className="text-xs text-kabul-500 leading-relaxed">
              Operators monitor terminal occupancy, revenue trends, peak hours, and manually override
              bay availability on demand.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-zeus-950 via-zeus-900 to-kabul-600 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-zeus-800">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-cloud-100">
              Ready to park without searching?
            </h3>
            <p className="text-cloud-300 text-sm leading-relaxed">
              Explore our live terminals, pick an open parking bay, and book your spot now.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/search"
              className="px-6 py-3.5 rounded-xl font-bold text-zeus-950 bg-cloud-100 hover:bg-white transition-colors shadow-md text-sm"
            >
              Reserve Parking Slot
            </Link>
            <Link
              to="/about"
              className="px-6 py-3.5 rounded-xl font-semibold text-cloud-100 bg-zeus-800/80 hover:bg-zeus-700 transition-colors text-sm border border-kabul-500"
            >
              Learn System Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
