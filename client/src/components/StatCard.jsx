import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'brand', subtext }) => {
  const colorMap = {
    brand: {
      bg: 'bg-brand-50 text-brand-600',
      border: 'border-brand-100',
      glow: 'group-hover:border-brand-300'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      glow: 'group-hover:border-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      glow: 'group-hover:border-amber-300'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      glow: 'group-hover:border-rose-300'
    }
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div
      className={`group relative bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${scheme.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.border} border`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500 font-medium">{subtext}</p>}
    </div>
  );
};

export default StatCard;
