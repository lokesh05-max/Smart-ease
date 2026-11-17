import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error('Failed to load users directory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.includes(term)
    );
  });

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading driver directory..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
            Account Management
          </span>
          <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
            User Directory
          </h1>
          <p className="text-sm text-kabul-500">
            Registered drivers and system administrators.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-cloud-200 rounded-xl text-zeus-900"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-cloud-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cloud-50 text-kabul-500 font-semibold uppercase tracking-wider border-b border-cloud-200">
              <tr>
                <th className="py-3 px-4">Driver Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Lifetime Bookings</th>
                <th className="py-3 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-100">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-cloud-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cloud-200 text-zeus-900 flex items-center justify-center font-bold text-xs shrink-0 border border-cloud-300">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-bold text-zeus-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-kabul-600">{u.email}</td>
                  <td className="py-3.5 px-4 font-mono text-kabul-600">{u.phone || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                        u.role === 'admin'
                          ? 'bg-shadow-100 text-shadow-700 border border-shadow-300'
                          : 'bg-cloud-100 text-zeus-800 border border-cloud-200'
                      }`}
                    >
                      {u.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-shadow-600">
                    {u.bookingsCount || 0} Bookings
                  </td>
                  <td className="py-3.5 px-4 text-kabul-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
