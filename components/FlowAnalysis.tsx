
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  ArrowRightLeft, 
  TrendingUp, 
  Wind, 
  AlertCircle,
  Clock,
  Navigation
} from 'lucide-react';
import StatCard from './StatCard';

const FLOW_DATA = [
  { time: '17:00', inflow: 120, outflow: 45, density: 10 },
  { time: '17:30', inflow: 250, outflow: 80, density: 15 },
  { time: '18:00', inflow: 800, outflow: 120, density: 45 },
  { time: '18:30', inflow: 1450, outflow: 200, density: 78 },
  { time: '19:00', inflow: 1200, outflow: 350, density: 85 },
  { time: '19:30', inflow: 900, outflow: 600, density: 92 },
  { time: '20:00', inflow: 500, outflow: 1200, density: 70 },
];

const FlowAnalysis: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Flow Velocity & Bottlenecks</h1>
        <p className="text-slate-400 text-sm">Deep analysis of movement patterns across access points</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Peak Flow Rate" value="1,450 p/h" trend="+22%" trendType="up" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Avg. Movement Speed" value="1.2 m/s" trend="stable" icon={<Wind className="w-5 h-5" />} />
        <StatCard title="Bottleneck Risk" value="High (Zone E)" trend="Critical" trendType="up" icon={<AlertCircle className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-semibold flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              Inflow vs Outflow
            </h3>
            <span className="text-xs text-slate-500">Live Telemetry</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FLOW_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="inflow" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="outflow" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Density Saturation Trend
            </h3>
            <span className="text-xs text-slate-500">Predicted Threshold: 95%</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FLOW_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Line type="stepAfter" dataKey="density" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400" />
          Detected Congestion Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { zone: 'West Gate', impact: 'Heavy', time: '14 min wait', trend: 'rising' },
            { zone: 'VIP Tunnel', impact: 'Critical', time: 'Overflow risk', trend: 'stagnant' },
            { zone: 'South Bleachers', impact: 'Moderate', time: '8 min wait', trend: 'falling' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm">{item.zone}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  item.impact === 'Critical' ? 'bg-red-500/20 text-red-400' :
                  item.impact === 'Heavy' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.impact}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-1">{item.time}</p>
              <div className="flex items-center gap-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${item.trend === 'rising' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                 <span className="text-[10px] text-slate-400 uppercase tracking-widest">{item.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowAnalysis;
