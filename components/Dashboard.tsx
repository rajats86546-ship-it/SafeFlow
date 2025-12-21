
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { Users, Timer, ShieldAlert, Zap, AlertCircle, Camera, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
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
      setAiInsight("Initial system state: 0 pax detected. Please sync gate cameras or start simulation to begin analysis.");
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
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            Real-Time Command
            {analyzedSections.length === sections.length ? (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-black uppercase tracking-widest">
                <CheckCircle2 className="w-2.5 h-2.5" />
                SYSTEM CALIBRATED
              </span>
            ) : analyzedSections.length > 0 ? (
              <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-black uppercase tracking-widest animate-pulse">
                <Activity className="w-2.5 h-2.5" />
                ACTIVE_RELAY
              </span>
            ) : (
              <span className="text-[10px] bg-slate-500/10 text-slate-500 border border-slate-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-black uppercase tracking-widest">
                <Camera className="w-2.5 h-2.5" />
                GATES_IDLE
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Global load tracking via entrance/exit flow analysis</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
           <div className="text-right">
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Relay Status</p>
             <p className="text-xs font-black text-emerald-400">OPERATIONAL</p>
           </div>
           <div className="w-[1px] h-8 bg-slate-800"></div>
           <Zap className="w-6 h-6 text-blue-400" />
        </div>
      </header>

      {/* AI Header Insight */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 p-5 rounded-2xl flex items-center gap-5 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse-soft"></div>
        <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-900/40 relative z-10">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="flex-1 relative z-10">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1.5">AI Strategic Insight</p>
          <p className="text-sm text-slate-100 font-medium leading-relaxed italic">"{aiInsight}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primary Net Occupancy Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group col-span-1 md:col-span-2 ring-1 ring-blue-500/10">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Users className="w-40 h-40 text-blue-400" />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-900/40">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex gap-3">
                   <div className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl font-black uppercase tracking-widest">IN: {totalInbound}</div>
                   <div className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-xl font-black uppercase tracking-widest">OUT: {totalOutbound}</div>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest">Global Load</p>
                <div className="flex items-baseline gap-3 mt-1">
                   <h3 className="text-5xl font-black text-white tracking-tighter">{netOccupancy.toLocaleString()}</h3>
                   <span className="text-slate-500 font-black uppercase text-xs tracking-widest">Pax Inside</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500 font-bold">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  REAL-TIME VERIFIED FLOW
                </div>
              </div>
            </div>
            
            <StatCard 
              title="Arrival Flux" 
              value={totalInbound} 
              trend="Entry Nodes" 
              trendType="neutral" 
              icon={<ArrowUpRight className="w-5 h-5" />} 
            />
            <StatCard 
              title="Departure Flux" 
              value={totalOutbound} 
              trend="Exit Nodes" 
              trendType="neutral" 
              icon={<ArrowDownRight className="w-5 h-5" />} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">
                Spatial Density Grid
                <span className="px-2 py-0.5 bg-slate-800 rounded-lg text-[10px] text-slate-500 tracking-normal font-bold">8 monitored zones</span>
              </h3>
              <div className="h-[280px]">
                {analyzedSections.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sections}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="id" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} fontWeights="900" />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', color: '#f8fafc', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                        cursor={{ fill: '#1e293b', opacity: 0.3 }}
                      />
                      <Bar dataKey="occupancy" radius={[8, 8, 0, 0]}>
                        {sections.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.lastAnalyzed ? getStatusColor(entry.status) : '#1e293b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950/20 rounded-3xl border-2 border-dashed border-slate-800 group hover:border-blue-500/30 transition-colors">
                    <Camera className="w-10 h-10 mb-3 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <p className="text-xs font-black uppercase tracking-widest">Awaiting Spatial Data</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">
                Flow Velocity Delta
                <span className="px-2 py-0.5 bg-slate-800 rounded-lg text-[10px] text-slate-500 tracking-normal font-bold">Rolling 30m</span>
              </h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={flowData}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} fontWeights="900" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
                    <Area type="monotone" dataKey="in" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIn)" strokeWidth={4} name="Inbound" />
                    <Area type="monotone" dataKey="out" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOut)" strokeWidth={4} name="Outbound" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Live Node Topology</h4>
             <div className="space-y-3">
               {sections.map(s => (
                 <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:bg-slate-950 transition-colors">
                   <div className="flex items-center gap-3 overflow-hidden">
                     <div className={`w-2 h-2 rounded-full shrink-0 ${s.lastAnalyzed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                     <span className="text-[11px] font-black text-slate-300 truncate">{s.name}</span>
                   </div>
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg border uppercase ${
                     s.gateType === 'entrance' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : 
                     s.gateType === 'exit' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-slate-500 border-slate-700 bg-slate-800'
                   }`}>
                     {s.gateType}
                   </span>
                 </div>
               ))}
             </div>
          </div>

          <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Zap className="w-12 h-12 text-blue-400" />
             </div>
             <div className="flex gap-4 relative z-10">
               <Activity className="w-5 h-5 text-blue-400 shrink-0" />
               <div>
                 <p className="text-xs font-black text-blue-200 uppercase tracking-widest mb-2">Relay Logic</p>
                 <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                   Current PAX count is derived from active delta logic. <strong>Exit Node</strong> scans subtract from the global pool while <strong>Entry Nodes</strong> increase load.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
