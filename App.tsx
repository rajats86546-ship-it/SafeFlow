
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { NAVIGATION_ITEMS, MOCK_SECTIONS, MOCK_INCIDENTS } from './constants';
import Dashboard from './components/Dashboard';
import AISafetyHub from './components/AISafetyHub';
import VenueMap from './components/VenueMap';
import IncidentsList from './components/IncidentsList';
import FlowAnalysis from './components/FlowAnalysis';
import Surveillance from './components/Surveillance';
import { VenueSection, Incident } from './types';
import { 
  Bell, 
  ChevronRight,
  Monitor,
  Settings as SettingsIcon,
  Zap,
  X,
  Key,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import CameraAnalyzer from './components/CameraAnalyzer';

/**
 * Top-level Error Boundary Component to handle unexpected runtime crashes.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50 p-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2">System Encountered a Critical Error</h1>
          <p className="text-slate-400 mb-8">The command center needs to be rebooted to restore operational integrity.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SafeFlowApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sections, setSections] = useState<VenueSection[]>(MOCK_SECTIONS);
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);
  const [quickScanZone, setQuickScanZone] = useState(MOCK_SECTIONS[0].id);
  const [isBooting, setIsBooting] = useState(true);
  
  const [totalInbound, setTotalInbound] = useState(0);
  const [totalOutbound, setTotalOutbound] = useState(0);

  // Direct initialization without blocking UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateSectionCount = useCallback((id: string, count: number) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setSections(prev => {
      const existingSection = prev.find(s => s.id === id);
      if (!existingSection) return prev;

      const oldCount = existingSection.occupancy;
      const diff = count - oldCount;

      // Logic to track global in/out flow based on gate type
      if (diff > 0) {
        if (existingSection.gateType === 'entrance') {
          setTotalInbound(t => t + diff);
        } else if (existingSection.gateType === 'exit') {
          setTotalOutbound(t => t + diff);
        }
      } else if (diff < 0 && existingSection.gateType === 'exit') {
         // This logic could be expanded for more complex gate behaviors
      }

      return prev.map(s => {
        if (s.id === id) {
          const newStatus = count > s.capacity * 0.9 ? 'critical' : 
                           count > s.capacity * 0.7 ? 'congested' : 'normal';
          return { 
            ...s, 
            occupancy: count, 
            status: newStatus,
            lastAnalyzed: now,
            flowRate: Math.floor(Math.random() * 50) + 10
          };
        }
        return s;
      });
    });
    
    setLastSyncTime(now);
  }, []);

  const netOccupancy = useMemo(() => Math.max(0, totalInbound - totalOutbound), [totalInbound, totalOutbound]);

  // Bootup / Loading State
  if (isBooting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
          <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px] mb-1">Synchronizing Nodes</p>
          <p className="text-blue-500 text-[10px] font-black tracking-widest uppercase">SafeFlow OS 3.2</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return (
          <Dashboard 
            sections={sections} 
            onUpdateSection={handleUpdateSectionCount} 
            lastSyncTime={lastSyncTime}
            netOccupancy={netOccupancy}
            totalInbound={totalInbound}
            totalOutbound={totalOutbound}
          />
        );
      case 'surveillance': return <Surveillance sections={sections} onUpdateSection={handleUpdateSectionCount} />;
      case 'map': return <VenueMap sections={sections} />;
      case 'incidents': return <IncidentsList incidents={incidents} />;
      case 'flow': return <FlowAnalysis sections={sections} />;
      case 'ai-assistant': return <AISafetyHub sections={sections} />;
      case 'settings': return (
        <div className="p-12 max-w-2xl mx-auto space-y-12">
           <div className="flex items-center gap-6 mb-8">
             <div className="p-5 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-xl">
               <SettingsIcon className="w-10 h-10 text-blue-400" />
             </div>
             <div>
               <h1 className="text-3xl font-black tracking-tight">System Node Config</h1>
               <p className="text-slate-400 font-medium">Global thresholds and AI processing parameters</p>
             </div>
           </div>
           
           <div className="grid gap-4">
             {['AI Visual Calibration', 'Anonymized Privacy Masking', 'Real-Time Telemetry Sync', 'Inference Optimization'].map((setting) => (
               <div key={setting} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex justify-between items-center group hover:bg-slate-900 transition-colors">
                 <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{setting}</span>
                 <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                 </div>
               </div>
             ))}
           </div>

           <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem]">
              <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-4">Core Analytics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Gemini Inference Engine</span>
                  <span className="text-emerald-400 font-bold">STABLE</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Environment API Key</span>
                  <span className="text-blue-400 font-bold">CONNECTED</span>
                </div>
              </div>
           </div>
        </div>
      );
      default: return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
          <Monitor className="w-16 h-16 mb-4 opacity-10" />
          <h2 className="text-xl font-black uppercase tracking-widest opacity-20">Accessing Node...</h2>
        </div>
      );
    }
  };

  const activeQuickScanSection = sections.find(s => s.id === quickScanZone);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden selection:bg-blue-500/30">
      <aside className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col shrink-0 backdrop-blur-3xl">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 border border-blue-400/20">
              <span className="font-black text-2xl italic tracking-tighter text-white">SF</span>
            </div>
            <div>
              <h2 className="font-black text-xl leading-none tracking-tight">SafeFlow</h2>
              <span className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em] mt-1 block">Tactical AI</span>
            </div>
          </div>

          <nav className="space-y-2">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/50' 
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
          <div className="bg-slate-800/30 rounded-3xl p-5 border border-slate-700/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Venue Sync</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
                <span className="text-[9px] font-bold text-emerald-500">LIVE</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-100">{netOccupancy.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">PAX INSIDE</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-slate-900/30 border-b border-slate-800 flex items-center justify-between px-10 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3 text-xs font-black text-slate-600 uppercase tracking-[0.2em]">
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Command</span>
            <ChevronRight className="w-4 h-4 text-slate-800" />
            <span className="text-slate-300 font-black">{activeTab.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsQuickScanOpen(!isQuickScanOpen)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[11px] font-black tracking-widest transition-all border ${
                isQuickScanOpen 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/40' 
                  : 'bg-slate-800/40 border-slate-700 text-blue-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Zap className={`w-4 h-4 ${isQuickScanOpen ? 'animate-pulse' : ''}`} />
              GATE SCANNER
            </button>
            <button className="relative p-3 text-slate-500 hover:text-white transition-all bg-slate-800/30 rounded-2xl border border-slate-800 hover:border-slate-700">
              <Bell className="w-5 h-5" />
              {lastSyncTime && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-950"></span>}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>

        {isQuickScanOpen && (
          <div className="absolute bottom-10 right-10 w-96 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-3xl overflow-hidden ring-1 ring-white/10">
              <div className="p-5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/10 rounded-xl">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Tactical Gate Sync</span>
                </div>
                <button onClick={() => setIsQuickScanOpen(false)} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Target Gate Node</label>
                  <select 
                    value={quickScanZone}
                    onChange={(e) => setQuickScanZone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-800 rounded-2xl p-4 text-xs text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.gateType.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
                <div className="rounded-[2rem] overflow-hidden border border-slate-800 shadow-inner">
                  <CameraAnalyzer 
                    zoneName={activeQuickScanSection?.name || ''} 
                    onCountUpdate={(count) => handleUpdateSectionCount(quickScanZone, count)} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <SafeFlowApp />
  </ErrorBoundary>
);

export default App;
