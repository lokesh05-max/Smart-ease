import React from 'react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const getBadgeStyle = (val) => {
    switch (val?.toLowerCase()) {
      case 'available':
        return 'bg-emerald-50/80 text-emerald-800 border-emerald-300/80';
      case 'reserved':
        return 'bg-amber-50/80 text-amber-800 border-amber-300/80';
      case 'occupied':
        return 'bg-rose-50/80 text-rose-800 border-rose-300/80';
      case 'maintenance':
        return 'bg-cloud-100 text-kabul-600 border-cloud-300';
      case 'confirmed':
        return 'bg-shadow-100 text-shadow-700 border-shadow-300';
      case 'completed':
        return 'bg-emerald-50/80 text-emerald-800 border-emerald-300/80';
      case 'cancelled':
        return 'bg-rose-50/80 text-rose-800 border-rose-300/80';
      case 'pending':
        return 'bg-amber-50/80 text-amber-800 border-amber-300/80';
      default:
        return 'bg-cloud-100 text-zeus-700 border-cloud-300';
    }
  };

  const getIndicatorDot = (val) => {
    switch (val?.toLowerCase()) {
      case 'available':
      case 'completed':
        return 'bg-emerald-600';
      case 'reserved':
      case 'pending':
        return 'bg-amber-600';
      case 'occupied':
      case 'cancelled':
        return 'bg-rose-600';
      case 'confirmed':
        return 'bg-shadow-500';
      default:
        return 'bg-kabul-400';
    }
  };

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border shadow-xs ${getBadgeStyle(
        status
      )} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getIndicatorDot(status)}`} />
      {status}
    </span>
  );
};
