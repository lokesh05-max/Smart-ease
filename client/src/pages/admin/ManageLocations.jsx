import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Clock,
  Car,
  X,
  Loader2,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    city: 'Metropolis',
    address: '',
    description: '',
    openingHours: '24/7 Operations',
    baseHourlyRate: 40,
    supportedVehicleTypes: ['Car', 'SUV', 'EV'],
    image: '',
  });

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
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
  }, []);

  const openAddModal = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      city: 'Downtown Metro',
      address: '',
      description: '',
      openingHours: '24/7 Operations',
      baseHourlyRate: 40,
      supportedVehicleTypes: ['Car', 'SUV', 'EV'],
      image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    });
    setShowModal(true);
  };

  const openEditModal = (loc) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name,
      city: loc.city || '',
      address: loc.address,
      description: loc.description || '',
      openingHours: loc.openingHours || '24/7 Operations',
      baseHourlyRate: loc.baseHourlyRate || 40,
      supportedVehicleTypes: loc.supportedVehicleTypes || ['Car'],
      image: loc.image || '',
    });
    setShowModal(true);
  };

  const handleVehicleTypeToggle = (vt) => {
    setFormData((prev) => {
      const exists = prev.supportedVehicleTypes.includes(vt);
      const updated = exists
        ? prev.supportedVehicleTypes.filter((t) => t !== vt)
        : [...prev.supportedVehicleTypes, vt];
      return { ...prev, supportedVehicleTypes: updated.length ? updated : ['Car'] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingLocation) {
        const res = await api.patch(`/admin/locations/${editingLocation._id}`, formData);
        if (res.data.success) {
          addToast('Parking location updated successfully', 'success');
          fetchLocations();
          setShowModal(false);
        }
      } else {
        const res = await api.post('/admin/locations', formData);
        if (res.data.success) {
          addToast('Parking location created successfully', 'success');
          fetchLocations();
          setShowModal(false);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (locId) => {
    if (!window.confirm('Are you sure you want to deactivate this parking location?')) return;
    try {
      const res = await api.delete(`/admin/locations/${locId}`);
      if (res.data.success) {
        addToast('Parking location deactivated', 'success');
        fetchLocations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading locations..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
            Facility Directory
          </span>
          <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
            Manage Parking Locations
          </h1>
          <p className="text-sm text-kabul-500">
            Create, modify, and monitor smart parking hub facilities.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-3xl border border-cloud-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cloud-50 text-kabul-500 font-semibold uppercase tracking-wider border-b border-cloud-200">
              <tr>
                <th className="py-3 px-4">Terminal Name</th>
                <th className="py-3 px-4">City / Area</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Total Slots</th>
                <th className="py-3 px-4">Base Rate</th>
                <th className="py-3 px-4">Vehicle Types</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-100">
              {locations.map((loc) => (
                <tr key={loc._id} className="hover:bg-cloud-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zeus-900 flex items-center gap-3">
                    <img
                      src={
                        loc.image ||
                        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={loc.name}
                      className="w-10 h-10 rounded-lg object-cover bg-cloud-200"
                    />
                    <div>
                      <span className="block">{loc.name}</span>
                      <span className="text-[10px] text-kabul-400 font-normal">
                        {loc.openingHours}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-zeus-800">{loc.city}</td>
                  <td className="py-3.5 px-4 text-kabul-500 max-w-xs truncate">{loc.address}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-zeus-900">
                    {loc.stats?.totalSlots || 0} Slots
                  </td>
                  <td className="py-3.5 px-4 font-bold text-shadow-700">
                    ₹{loc.baseHourlyRate}/hr
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {loc.supportedVehicleTypes?.map((vt) => (
                        <span
                          key={vt}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cloud-100 text-zeus-800 border border-cloud-200"
                        >
                          {vt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="p-1.5 rounded-lg text-kabul-500 hover:text-zeus-900 hover:bg-cloud-100 transition-colors"
                        title="Edit Location"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc._id)}
                        className="p-1.5 rounded-lg text-kabul-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Deactivate Location"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in border border-cloud-300">
            <div className="flex items-center justify-between border-b border-cloud-100 pb-3">
              <h3 className="text-lg font-bold text-zeus-900">
                {editingLocation ? 'Edit Parking Location' : 'Add New Parking Location'}
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
                <label className="font-bold text-zeus-800">Terminal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Hub Terminal A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zeus-800">City / District</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zeus-800">Base Tariff (₹/hr)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.baseHourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, baseHourlyRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zeus-800">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Full physical street address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zeus-800">Operating Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 24/7 or 06:00 - 23:00"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zeus-800">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  />
                </div>
              </div>

              {/* Supported Vehicle Types */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-zeus-800">Supported Vehicle Types</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Car', 'SUV', 'EV', 'Bike'].map((vt) => {
                    const active = formData.supportedVehicleTypes.includes(vt);
                    return (
                      <button
                        type="button"
                        key={vt}
                        onClick={() => handleVehicleTypeToggle(vt)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          active
                            ? 'bg-shadow-500 text-white'
                            : 'bg-cloud-100 text-kabul-600 hover:bg-cloud-200'
                        }`}
                      >
                        {vt}
                      </button>
                    );
                  })}
                </div>
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
                  <span>Save Location</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
