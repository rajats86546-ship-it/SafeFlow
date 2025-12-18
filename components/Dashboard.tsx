
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { Users, Timer, ShieldAlert, Zap, AlertCircle, Camera, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StatCard from './StatCard';
import { geminiService } from '../services/geminiService';
import { VenueSection } from '../types';

interface DashboardProps {
  sections: VenueSection[];
  onUpdateSection: (id: string, count: number) => void;
  lastSyncTime?: string | null;
  netOccupancy: number;
  totalInbound: number;
  totalOutbound: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  sections, 
  onUpdateSection, 
  lastSyncTime, 
  netOccupancy, 
  totalInbound, 
  totalOutbound 
}) => {
  const [aiInsight, setAiInsight] = useState("Waiting for gate scans to generate insights...");

  useEffect(() => {
    const analyzedCount = sections.filter(s => s.lastAnalyzed).length;
    if (analyzedCount > 0) {
      const fetchInsight = async () => {
        const insight = await geminiService.getCrowdFlowInsights(sections);
        setAiInsight(insight);
      };
      fetchInsight();
    } else {
      setAiInsight("Initial system state: 0 pax detected. Please sync gate cameras to begin analysis.");
    }
  }, [sections]);

  const flowData = [
    { time: 'T-30m', in: 0, out: 0 },
    { time: 'T-20m', in: totalInbound * 0.4, out: totalOutbound * 0.3 },
    { time: 'T-10m', in: totalInbound * 0.8, out: totalOutbound * 0.7 },
    { time: 'Current', in: totalInbound, out: totalOutbound },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'congested': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const analyzedSections = sections.filter(s => s.lastAnalyzed);

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Real-Time Command
            {analyzedSections.length === sections.length ? (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-2.5 h-2.5" />
                SYSTEM CALIBRATED
              </span>
            ) : (
              <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                <Camera className="w-2.5 h-2.5" />
                GATES SYNCING...
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-1">Global load tracking via entrance/exit flow analysis</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-4">
           <div className="text-right">
             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Global Status</p>
             <p className="text-xs font-bold text-emerald-400">OPERATIONAL</p>
           </div>
           <div className="w-[1px] h-8 bg-slate-800"></div>
           <Zap className="w-5 h-5 text-blue-400" />
        </div>
      </header>

      {/* AI Header Insight */}
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/50 p-4 rounded-xl flex items-center gap-4">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1 text-glow">AI Verified Insight</p>
          <p className="text-sm text-slate-200">{aiInsight}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primary Net Occupancy Card */}
            <div className="bg-slate-900 border-2 border-blue-600/50 p-5 rounded-2xl shadow-xl relative overflow-hidden group col-span-1 md:col-span-2">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Users className="w-32 h-32 text-blue-400" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex gap-2">
                   <div className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">IN: {totalInbound}</div>
                   <div className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold">OUT: {totalOutbound}</div>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Net Venue Occupancy</p>
                <div className="flex items-baseline gap-2 mt-1">
                   <h3 className="text-4xl font-black text-white">{netOccupancy.toLocaleString()}</h3>
                   <span className="text-slate-500 font-bold uppercase text-[10px]">Pax Inside</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                  Verified by gate-crossing flow logic
                </p>
              </div>
            </div>
            
            <StatCard 
              title="Arrival Flow" 
              value={totalInbound} 
              trend="Entry Gates" 
              trendType="neutral" 
              icon={<ArrowUpRight className="w-5 h-5" />} 
            />
            <StatCard 
              title="Departure Flow" 
              value={totalOutbound} 
              trend="Exit Gates" 
              trendType="neutral" 
              icon={<ArrowDownRight className="w-5 h-5" />} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
                Internal Zone Load
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Snapshots</span>
              </h3>
              <div className="h-[250px]">
                {analyzedSections.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sections}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="id" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc' }}
                        cursor={{ fill: '#334155', opacity: 0.1 }}
                      />
                      <Bar dataKey="occupancy" radius={[6, 6, 0, 0]}>
                        {sections.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.lastAnalyzed ? getStatusColor(entry.status) : '#1e293b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950/20 rounded-xl border border-dashed border-slate-800">
                    <Camera className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Calibrate Gates to Populate</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
                Net Flow Velocity
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">In vs Out</span>
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={flowData}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="in" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} name="Inbound" />
                    <Area type="monotone" dataKey="out" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={3} name="Outbound" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
             <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Node Calibration</h4>
             <div className="space-y-3">
               {sections.map(s => (
                 <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
                   <div className="flex items-center gap-2 overflow-hidden">
                     <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.lastAnalyzed ? 'bg-emerald-500' : 'bg-slate-700 animate-pulse'}`}></div>
                     <span className="text-[10px] font-bold text-slate-300 truncate">{s.name}</span>
                   </div>
                   <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${
                     s.gateType === 'entrance' ? 'text-emerald-500 border-emerald-500/20' : 
                     s.gateType === 'exit' ? 'text-red-500 border-red-500/20' : 'text-slate-500 border-slate-700'
                   }`}>
                     {s.gateType}
                   </span>
                 </div>
               ))}
             </div>
          </div>

          <div className="p-5 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
             <div className="flex gap-3">
               <Zap className="w-5 h-5 text-blue-400 shrink-0" />
               <p className="text-[11px] text-slate-300 leading-tight">
                 Scanning <strong>Exit Gates</strong> will decrease the total PAX count. Direct verification ensures evacuation and flow data integrity.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
