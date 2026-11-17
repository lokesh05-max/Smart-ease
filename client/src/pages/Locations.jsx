import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import {
  MapPin,
  Search,
  Clock,
  Car,
  Bike,
  Zap,
  Truck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');
  const { lastOccupancyUpdate } = useSocket();

  const fetchLocations = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedVehicleType !== 'all') params.vehicleType = selectedVehicleType;

      const res = await api.get('/locations', { params });
      if (res.data.success) {
        setLocations(res.data.locations);
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedVehicleType]);

  // Real-time occupancy update from Socket.IO
  useEffect(() => {
    if (lastOccupancyUpdate) {
      setLocations((prev) =>
        prev.map((loc) => {
          if (loc._id === lastOccupancyUpdate.locationId) {
            return {
              ...loc,
              stats: {
                ...loc.stats,
                totalSlots: lastOccupancyUpdate.totalSlots,
                availableSlots: lastOccupancyUpdate.availableSlots,
                occupiedSlots: lastOccupancyUpdate.occupiedSlots,
                reservedSlots: lastOccupancyUpdate.reservedSlots,
                maintenanceSlots: lastOccupancyUpdate.maintenanceSlots,
              },
            };
          }
          return loc;
        })
      );
    }
  }, [lastOccupancyUpdate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLocations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Filter Bar */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
            Terminals Directory
          </span>
          <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
            Smart Parking Locations
          </h1>
          <p className="text-sm text-kabul-500">
            Browse verified smart parking facilities with live bay telemetry and reservations.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-cloud-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search terminal by name, address, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 text-zeus-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-shadow-500 hover:bg-shadow-600 rounded-xl transition-colors shadow-xs shrink-0"
            >
              Search
            </button>
          </form>

          {/* Vehicle Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-kabul-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Vehicle:
            </span>
            {['all', 'Car', 'SUV', 'EV', 'Bike'].map((vt) => (
              <button
                key={vt}
                onClick={() => setSelectedVehicleType(vt)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                  selectedVehicleType === vt
                    ? 'bg-zeus-900 text-cloud-100 font-semibold'
                    : 'bg-cloud-100 text-kabul-600 hover:bg-cloud-200'
                }`}
              >
                {vt === 'all' ? 'All Types' : vt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Locations Cards List */}
      {loading ? (
        <LoadingSpinner message="Retrieving parking locations..." />
      ) : locations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-cloud-200 space-y-3">
          <MapPin className="w-10 h-10 text-cloud-400 mx-auto" />
          <h3 className="text-lg font-bold text-zeus-800">No parking locations found</h3>
          <p className="text-sm text-kabul-500">
            Try adjusting your search query or vehicle type filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => {
            const total = loc.stats?.totalSlots || 0;
            const available = loc.stats?.availableSlots || 0;
            const occupied = loc.stats?.occupiedSlots || 0;
            const reserved = loc.stats?.reservedSlots || 0;
            const occupancyPct = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;

            return (
              <div
                key={loc._id}
                className="bg-white rounded-2xl border border-cloud-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                {/* Header Image */}
                <div className="relative h-48 bg-zeus-900 overflow-hidden">
                  <img
                    src={
                      loc.image ||
                      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-zeus-900 shadow-md">
                      ₹{loc.stats?.minPrice || loc.baseHourlyRate}/hr
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
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

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-zeus-900 group-hover:text-shadow-600 transition-colors">
                        {loc.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-cloud-100 text-zeus-800 font-semibold border border-cloud-200 shrink-0">
                        {loc.city}
                      </span>
                    </div>

                    <p className="text-xs text-kabul-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-shadow-500 shrink-0" />
                      <span className="truncate">{loc.address}</span>
                    </p>

                    <p className="text-xs text-kabul-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-kabul-400 shrink-0" />
                      <span>{loc.openingHours}</span>
                    </p>

                    <p className="text-xs text-kabul-600 line-clamp-2 pt-1">{loc.description}</p>
                  </div>

                  {/* Real-Time Live Occupancy Telemetry Bar */}
                  <div className="space-y-2 pt-3 border-t border-cloud-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-kabul-500 font-medium">Live Availability:</span>
                      <span className="font-bold text-zeus-900">
                        <span className="text-emerald-700">{available} Free</span> / {total} Total
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-cloud-100 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${total ? (available / total) * 100 : 0}%` }}
                        title={`${available} Available`}
                      />
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${total ? (reserved / total) * 100 : 0}%` }}
                        title={`${reserved} Reserved`}
                      />
                      <div
                        className="h-full bg-rose-600 transition-all duration-500"
                        style={{ width: `${total ? (occupied / total) * 100 : 0}%` }}
                        title={`${occupied} Occupied`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-kabul-400 pt-0.5">
                      <span>{occupancyPct}% Occupied</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Live Synced
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/book/${loc._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-xs"
                  >
                    <span>View Slots & Reserve</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
