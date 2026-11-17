import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ManageSlots = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();
  const { lastSlotUpdate } = useSocket();

  const [formData, setFormData] = useState({
    locationId: '',
    slotNumber: '',
    floor: 'Ground Level',
    vehicleType: 'Car',
    pricePerHour: 40,
    status: 'Available',
  });

  const fetchLocationsAndSlots = async () => {
    try {
      const locRes = await api.get('/locations');
      if (locRes.data.success) {
        setLocations(locRes.data.locations);
      }

      // Fetch all slots
      let allSlots = [];
      for (const loc of locRes.data.locations) {
        const slotsRes = await api.get(`/locations/${loc._id}/slots`);
        if (slotsRes.data.success) {
          const mapped = slotsRes.data.slots.map((s) => ({
            ...s,
            locationName: loc.name,
          }));
          allSlots = [...allSlots, ...mapped];
        }
      }
      setSlots(allSlots);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationsAndSlots();
  }, []);

  // Socket: Update single slot live without full refetch
  useEffect(() => {
    if (lastSlotUpdate?.slot) {
      setSlots((prev) =>
        prev.map((s) => (s._id === lastSlotUpdate.slot._id ? { ...s, ...lastSlotUpdate.slot } : s))
      );
    }
  }, [lastSlotUpdate]);

  const filteredSlots = slots.filter((slot) => {
    const locMatch =
      selectedLocationId === 'all' || slot.locationId === selectedLocationId;
    const vehicleMatch = vehicleFilter === 'all' || slot.vehicleType === vehicleFilter;
    return locMatch && vehicleMatch;
  });

  const openAddModal = () => {
    setEditingSlot(null);
    setFormData({
      locationId: locations[0]?._id || '',
      slotNumber: '',
      floor: 'Ground Level',
      vehicleType: 'Car',
      pricePerHour: 40,
      status: 'Available',
    });
    setShowModal(true);
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setFormData({
      locationId: slot.locationId,
      slotNumber: slot.slotNumber,
      floor: slot.floor || 'Ground Level',
      vehicleType: slot.vehicleType || 'Car',
      pricePerHour: slot.pricePerHour,
      status: slot.status,
    });
    setShowModal(true);
  };

  const handleManualStatusToggle = async (slot, newStatus) => {
    try {
      const res = await api.patch(`/admin/slots/${slot._id}`, { status: newStatus });
      if (res.data.success) {
        addToast(`Slot ${slot.slotNumber} status updated to ${newStatus}`, 'success');
        setSlots((prev) =>
          prev.map((s) => (s._id === slot._id ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Status override failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSlot) {
        const res = await api.patch(`/admin/slots/${editingSlot._id}`, formData);
        if (res.data.success) {
          addToast('Parking slot updated successfully', 'success');
          setShowModal(false);
          fetchLocationsAndSlots();
        }
      } else {
        const res = await api.post('/admin/slots', formData);
        if (res.data.success) {
          addToast('Parking slot created successfully', 'success');
          setShowModal(false);
          fetchLocationsAndSlots();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save slot', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this parking slot?')) return;
    try {
      const res = await api.delete(`/admin/slots/${slotId}`);
      if (res.data.success) {
        addToast('Parking slot deleted', 'success');
        setSlots((prev) => prev.filter((s) => s._id !== slotId));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading parking slots telemetry..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
            Bay Telemetry & Control
          </span>
          <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
            Manage Parking Slots
          </h1>
          <p className="text-sm text-kabul-500">
            Monitor real-time status and override slot states across terminals.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slot</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-cloud-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Location Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-kabul-500">Terminal:</span>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-cloud-50 border border-cloud-200 rounded-lg font-medium text-zeus-900"
            >
              <option value="all">All Locations ({slots.length} slots)</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-kabul-500">Vehicle:</span>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-cloud-50 border border-cloud-200 rounded-lg font-medium text-zeus-900"
            >
              <option value="all">All Vehicle Types</option>
              <option value="Car">Car</option>
              <option value="SUV">SUV</option>
              <option value="EV">EV Charger</option>
              <option value="Bike">Motorcycle</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-zeus-900">
          Showing {filteredSlots.length} Slots
        </span>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-3xl border border-cloud-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cloud-50 text-kabul-500 font-semibold uppercase tracking-wider border-b border-cloud-200">
              <tr>
                <th className="py-3 px-4">Slot Number</th>
                <th className="py-3 px-4">Terminal Facility</th>
                <th className="py-3 px-4">Floor / Bay</th>
                <th className="py-3 px-4">Vehicle Type</th>
                <th className="py-3 px-4">Hourly Tariff</th>
                <th className="py-3 px-4">Live Status</th>
                <th className="py-3 px-4">Manual Override</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-100">
              {filteredSlots.map((slot) => (
                <tr key={slot._id} className="hover:bg-cloud-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-black text-sm text-zeus-900">
                    {slot.slotNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-zeus-800">
                    {slot.locationName || 'Terminal'}
                  </td>
                  <td className="py-3 px-4 text-kabul-500">{slot.floor}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-semibold bg-cloud-100 text-zeus-800 border border-cloud-200">
                      {slot.vehicleType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-zeus-900">₹{slot.pricePerHour}/hr</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={slot.status} size="xs" />
                  </td>

                  {/* Manual Status Override Selector */}
                  <td className="py-3 px-4">
                    <select
                      value={slot.status}
                      onChange={(e) => handleManualStatusToggle(slot, e.target.value)}
                      className="px-2 py-1 text-[11px] bg-cloud-100 border border-cloud-300 rounded-md font-semibold text-zeus-800"
                    >
                      <option value="Available">Mark Available</option>
                      <option value="Occupied">Mark Occupied</option>
                      <option value="Reserved">Mark Reserved</option>
                      <option value="Maintenance">Mark Maintenance</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(slot)}
                        className="p-1.5 rounded-lg text-kabul-500 hover:text-zeus-900 hover:bg-cloud-100 transition-colors"
                        title="Edit Slot"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(slot._id)}
                        className="p-1.5 rounded-lg text-kabul-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zeus-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in border border-cloud-300">
            <div className="flex items-center justify-between border-b border-cloud-100 pb-3">
              <h3 className="text-lg font-bold text-zeus-900">
                {editingSlot ? 'Edit Parking Slot' : 'Add New Parking Slot'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-kabul-400 hover:text-zeus-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zeus-800">Terminal Location</label>
                <select
                  disabled={!!editingSlot}
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                >
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zeus-800">Slot Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-15"
                    value={formData.slotNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, slotNumber: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 text-sm font-mono uppercase bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zeus-800">Floor / Bay</label>
                  <input
                    type="text"
                    placeholder="e.g. Level 1"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zeus-800">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  >
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="EV">EV Charger</option>
                    <option value="Bike">Motorcycle</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zeus-800">Price Per Hour (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.pricePerHour}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerHour: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zeus-800">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="pt-3 border-t border-cloud-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-kabul-500 hover:bg-cloud-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-bold text-white bg-shadow-500 hover:bg-shadow-600 rounded-xl shadow-xs disabled:opacity-70 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
