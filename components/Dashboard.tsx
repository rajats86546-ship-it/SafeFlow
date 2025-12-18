
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { Users, Timer, ShieldAlert, Zap, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import { MOCK_SECTIONS } from '../constants';
import { geminiService } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [sections, setSections] = useState(MOCK_SECTIONS);
  const [aiInsight, setAiInsight] = useState("Analyzing venue patterns...");

  useEffect(() => {
    const fetchInsight = async () => {
      const insight = await geminiService.getCrowdFlowInsights(sections);
      setAiInsight(insight);
    };
    fetchInsight();
  }, [sections]);

  const flowData = [
    { time: '18:00', flow: 400 },
    { time: '18:15', flow: 600 },
    { time: '18:30', flow: 950 },
    { time: '18:45', flow: 1200 },
    { time: '19:00', flow: 800 },
    { time: '19:15', flow: 500 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'congested': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-slate-400 mt-1">Live metrics from Olympic Stadium, Zone A</p>
        </div>
        <div className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Live Update Active
        </div>
      </header>

      {/* AI Header Insight */}
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/50 p-4 rounded-xl flex items-center gap-4">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">AI Safety Insight</p>
          <p className="text-sm text-slate-200">{aiInsight}</p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Occupancy" value="28,450" trend="+12%" trendType="up" icon={<Users className="w-5 h-5" />} />
        <StatCard title="Avg. Entry Wait" value="8.4 min" trend="-2.1m" trendType="down" icon={<Timer className="w-5 h-5" />} />
        <StatCard title="Active Incidents" value="2" trend="stable" icon={<ShieldAlert className="w-5 h-5" />} />
        <StatCard title="Emergency Capacity" value="94%" icon={<Zap className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Occupancy */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Zone Occupancy Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Bar dataKey="occupancy" radius={[4, 4, 0, 0]}>
                  {sections.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Flow Rate */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Entrance Flow Velocity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="flow" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">People entering per 15-minute interval</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
