import React, { useState } from 'react';
import { Car, Bike, Zap, Truck, Check, AlertTriangle, Lock } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const SlotGrid = ({
  slots = [],
  selectedSlotId = null,
  onSelectSlot = () => {},
  showLegend = true,
}) => {
  const [selectedFloor, setSelectedFloor] = useState('all');

  // Extract unique floors
  const floors = ['all', ...new Set(slots.map((s) => s.floor || 'Ground Level'))];

  const filteredSlots =
    selectedFloor === 'all'
      ? slots
      : slots.filter((s) => (s.floor || 'Ground Level') === selectedFloor);

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'Bike':
        return <Bike className="w-4 h-4 text-kabul-600" />;
      case 'EV':
        return <Zap className="w-4 h-4 text-emerald-700" />;
      case 'SUV':
        return <Truck className="w-4 h-4 text-kabul-600" />;
      case 'Car':
      default:
        return <Car className="w-4 h-4 text-kabul-600" />;
    }
  };

  const getSlotCardStyles = (slot) => {
    const isSelected = selectedSlotId === slot._id;
    const status = slot.effectiveStatus || slot.status;
    const isAvailable =
      slot.isAvailableForWindow !== undefined ? slot.isAvailableForWindow : status === 'Available';

    if (isSelected) {
      return 'border-shadow-500 bg-shadow-100 ring-2 ring-shadow-500 shadow-md scale-102';
    }

    if (!isAvailable) {
      if (status === 'Occupied') {
        return 'border-rose-200 bg-rose-50/40 opacity-80 cursor-not-allowed';
      }
      if (status === 'Reserved') {
        return 'border-amber-200 bg-amber-50/40 opacity-80 cursor-not-allowed';
      }
      if (status === 'Maintenance') {
        return 'border-cloud-300 bg-cloud-100 opacity-60 cursor-not-allowed';
      }
      return 'border-cloud-200 bg-cloud-50 opacity-70 cursor-not-allowed';
    }

    return 'border-emerald-200/90 bg-white hover:border-shadow-400 hover:shadow-md cursor-pointer';
  };

  return (
    <div className="space-y-6">
      {/* Floor Filter Tabs */}
      {floors.length > 2 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-cloud-200 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-kabul-400 mr-2">
            Filter Floor:
          </span>
          {floors.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedFloor === f
                  ? 'bg-zeus-900 text-cloud-100 font-bold'
                  : 'bg-cloud-100 text-kabul-600 hover:bg-cloud-200'
              }`}
            >
              {f === 'all' ? 'All Floors' : f}
            </button>
          ))}
        </div>
      )}

      {/* Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {filteredSlots.map((slot) => {
          const status = slot.effectiveStatus || slot.status;
          const isAvailable =
            slot.isAvailableForWindow !== undefined ? slot.isAvailableForWindow : status === 'Available';
          const isSelected = selectedSlotId === slot._id;

          return (
            <div
              key={slot._id}
              onClick={() => {
                if (isAvailable) {
                  onSelectSlot(slot);
                }
              }}
              className={`parking-slot-card relative flex flex-col justify-between p-3.5 rounded-xl border-2 transition-all ${getSlotCardStyles(
                slot
              )}`}
            >
              {/* Header: Slot Number & Vehicle Type */}
              <div className="flex items-start justify-between gap-1 mb-2">
                <div>
                  <span className="font-mono text-base font-bold text-zeus-900 tracking-tight">
                    {slot.slotNumber}
                  </span>
                  <p className="text-[10px] text-kabul-400 font-medium">
                    {slot.floor || 'Ground'}
                  </p>
                </div>
                <div
                  className="p-1 rounded-md bg-cloud-100 border border-cloud-200"
                  title={slot.vehicleType}
                >
                  {getVehicleIcon(slot.vehicleType)}
                </div>
              </div>

              {/* Middle: Price & Status */}
              <div className="space-y-1.5 my-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[11px] text-kabul-400">Rate:</span>
                  <span className="font-semibold text-zeus-900">
                    ₹{slot.pricePerHour}
                    <span className="text-[10px] font-normal text-kabul-400">/hr</span>
                  </span>
                </div>

                <div className="flex justify-start">
                  <StatusBadge status={status} size="xs" />
                </div>
              </div>

              {/* Footer Selection Status */}
              <div className="mt-2 pt-2 border-t border-cloud-100 flex items-center justify-between text-[11px]">
                {isSelected ? (
                  <span className="font-bold text-shadow-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                ) : isAvailable ? (
                  <span className="text-emerald-700 font-medium hover:underline">
                    Click to reserve
                  </span>
                ) : status === 'Occupied' ? (
                  <span className="text-rose-600 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Parked
                  </span>
                ) : status === 'Maintenance' ? (
                  <span className="text-kabul-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Offline
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Booked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Status Legend */}
      {showLegend && (
        <div className="p-4 bg-cloud-100/70 rounded-xl border border-cloud-300 flex flex-wrap items-center justify-between gap-4 text-xs text-zeus-800">
          <span className="font-bold text-zeus-900">Slot Status Legend:</span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-600 border border-emerald-700" />
              <span>Available (Selectable)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-600 border border-amber-700" />
              <span>Reserved (Booked for time)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-600 border border-rose-700" />
              <span>Occupied (Vehicle parked)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-cloud-300 border border-cloud-400" />
              <span>Maintenance (Inactive)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-shadow-500 border border-shadow-600 ring-1 ring-shadow-400" />
              <span className="font-bold text-shadow-700">Your Selection</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
