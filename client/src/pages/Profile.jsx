import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { User, Mail, Phone, Lock, Save, Loader2 } from 'lucide-react';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, phone };
      if (newPassword) {
        if (!currentPassword) {
          addToast('Current password required to set a new password', 'error');
          setSaving(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.patch('/auth/profile', payload);
      if (res.data.success) {
        addToast('Profile updated successfully!', 'success');
        updateUser({ ...user, ...res.data.user });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
          Account Settings
        </span>
        <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-sm text-kabul-500">
          Manage your personal details and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-shadow-100 text-shadow-700 flex items-center justify-center font-black text-2xl mx-auto shadow-md border border-shadow-300">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-zeus-900">{user?.name}</h3>
            <p className="text-xs text-kabul-500">{user?.email}</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cloud-100 text-zeus-900 border border-cloud-300 uppercase">
                {user?.role === 'admin' ? 'Administrator' : 'Standard Driver'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-cloud-100 text-left text-xs space-y-2 text-kabul-600">
            <div className="flex justify-between">
              <span className="text-kabul-400">Account Type:</span>
              <span className="font-semibold text-zeus-900">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kabul-400">Registered:</span>
              <span className="font-semibold text-zeus-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-cloud-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-zeus-900 border-b border-cloud-100 pb-3">
            Edit Information
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zeus-800">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 text-zeus-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zeus-800">Email Address (Read-Only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-cloud-100 text-kabul-500 border border-cloud-200 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zeus-800">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 text-zeus-900"
                />
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-4 border-t border-cloud-100 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-kabul-400 block">
                Security & Password Update (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zeus-800">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zeus-800">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-cloud-50 border border-cloud-200 rounded-xl text-zeus-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-xl text-sm font-bold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-md shadow-zeus-950/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
