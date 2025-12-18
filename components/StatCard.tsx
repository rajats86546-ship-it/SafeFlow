
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendType, icon }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendType === 'up' ? 'bg-red-900/30 text-red-400' : 
            trendType === 'down' ? 'bg-green-900/30 text-green-400' : 
            'bg-slate-800 text-slate-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
