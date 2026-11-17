import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// Warm palette swatches: Shadow, Kabul, Zeus, Cloud accent
const WARM_COLORS = ['#7F6951', '#614E41', '#28221E', '#9E8873'];

export const ReportsAnalytics = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports');
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const exportCSV = () => {
    if (!reports?.last7Days) return;
    const headers = 'Date,Day,Bookings,Revenue (INR)\n';
    const rows = reports.last7Days
      .map((d) => `${d.date},${d.day},${d.bookings},${d.revenue}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ParkEase_Revenue_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Synthesizing intelligence reports..." />;
  }

  const { last7Days, vehicleChartData, locationComparison, summary } = reports || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-shadow-600">
            Business Intelligence
          </span>
          <h1 className="text-3xl font-extrabold text-zeus-900 tracking-tight">
            Reports & Occupancy Analytics
          </h1>
          <p className="text-sm text-kabul-500">
            Utilization ratios, tariff revenue streams, and fleet classification metrics.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase text-kabul-400">Total Bookings</span>
          <p className="text-3xl font-black text-zeus-900">{summary?.totalBookings}</p>
          <p className="text-xs text-kabul-500">Recorded across system lifetime</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase text-kabul-400">7-Day Revenue</span>
          <p className="text-3xl font-black text-shadow-700">₹{summary?.totalRevenue}</p>
          <p className="text-xs text-kabul-500">Last 7 operating days</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase text-kabul-400">Daily Average</span>
          <p className="text-3xl font-black text-zeus-900">{summary?.averagePerDay}</p>
          <p className="text-xs text-kabul-500">Reservations per day</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicle Classification Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-zeus-900 text-base">Vehicle Fleet Distribution</h3>
            <p className="text-xs text-kabul-500">Breakdown of reservations by vehicle category</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {vehicleChartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={WARM_COLORS[index % WARM_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Utilization Ratio Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-cloud-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-zeus-900 text-base">Terminal Occupancy Rate (%)</h3>
            <p className="text-xs text-kabul-500">
              Percentage of bays reserved or occupied per terminal
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locationComparison}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E1DE" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#614E41' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#614E41' }} />
                <Tooltip />
                <Bar
                  dataKey="occupancyRate"
                  name="Occupancy %"
                  fill="#7F6951"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-cloud-200 overflow-hidden shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-zeus-900 text-base">7-Day Summary Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cloud-50 text-kabul-500 font-semibold uppercase tracking-wider border-y border-cloud-200">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Weekday</th>
                <th className="py-2.5 px-4">Total Reservations</th>
                <th className="py-2.5 px-4 text-right">Computed Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-100">
              {last7Days?.map((d) => (
                <tr key={d.date} className="hover:bg-cloud-50/60">
                  <td className="py-3 px-4 font-mono font-bold text-zeus-900">{d.date}</td>
                  <td className="py-3 px-4 text-kabul-600 font-medium">{d.day}</td>
                  <td className="py-3 px-4 font-bold text-shadow-600">{d.bookings}</td>
                  <td className="py-3 px-4 font-black text-zeus-900 text-right">₹{d.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
