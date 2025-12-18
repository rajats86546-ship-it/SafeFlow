
import React, { useState } from 'react';
import { NAVIGATION_ITEMS } from './constants';
import Dashboard from './components/Dashboard';
import AISafetyHub from './components/AISafetyHub';
import VenueMap from './components/VenueMap';
import IncidentsList from './components/IncidentsList';
import FlowAnalysis from './components/FlowAnalysis';
import { 
  Bell, 
  Search, 
  ChevronRight,
  Monitor,
  Settings as SettingsIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'map': return <VenueMap />;
      case 'incidents': return <IncidentsList />;
      case 'flow': return <FlowAnalysis />;
      case 'ai-assistant': return <AISafetyHub />;
      case 'settings': return (
        <div className="p-12 max-w-2xl mx-auto space-y-8">
           <div className="flex items-center gap-4 mb-8">
             <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
               <SettingsIcon className="w-8 h-8 text-blue-400" />
             </div>
             <div>
               <h1 className="text-2xl font-bold">System Configuration</h1>
               <p className="text-slate-400">Control thresholds and external integrations</p>
             </div>
           </div>
           
           <div className="space-y-4">
             {['Alert Sensitivity', 'Automated Triage', 'Gemini Model Selection', 'External Dispatch API'].map((setting) => (
               <div key={setting} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                 <span className="font-medium text-slate-200">{setting}</span>
                 <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                   <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      );
      default: return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
          <Monitor className="w-16 h-16 mb-4 opacity-20" />
          <h2 className="text-xl font-medium">Module under development</h2>
          <p>This section is scheduled for the Oct 2025 release.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="font-black text-xl italic">SF</span>
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-tight">SafeFlow</h2>
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em]">Command Center</span>
            </div>
          </div>

          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Network</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <p className="text-xs text-slate-300 font-medium">Node: stadium-w-04</p>
            <p className="text-[10px] text-slate-500 mt-1">Lat: 14ms | Pkt Loss: 0%</p>
          </div>

          <div className="bg-slate-800/20 rounded-xl p-3 border border-slate-700/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-[10px] border border-indigo-400/30">JD</div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-slate-200 truncate">Jane Doe</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Chief of Ops</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-8 backdrop-blur-xl z-10">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
            <span className="hover:text-slate-300 cursor-pointer">Live</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-400">{activeTab.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search zones, units, incidents..." 
                className="bg-slate-900/50 border border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-72 transition-all placeholder:text-slate-600"
              />
            </div>
            
            <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>

            <button className="relative p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/30 rounded-lg border border-slate-800 hover:border-slate-700">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default App;
