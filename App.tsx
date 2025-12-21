
import React, { Component, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
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
  Settings as SettingsIcon,
  Zap,
  X,
  Loader2,
  AlertCircle,
  Terminal,
  Play,
  Pause,
  Info,
  ShieldCheck,
  Eye,
  Activity,
  Key,
  ExternalLink
} from 'lucide-react';
import CameraAnalyzer from './components/CameraAnalyzer';

/**
 * Interfaces for ErrorBoundary
 */
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: any): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50 p-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2">System Reboot Required</h1>
          <p className="text-slate-400 mb-8">An unexpected protocol error occurred in the command center core.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Reboot Command Center
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
  const [showShowcase, setShowShowcase] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true); // Default to true to allow direct app access
  
  const [totalInbound, setTotalInbound] = useState(0);
  const [totalOutbound, setTotalOutbound] = useState(0);

  // Tactical System Boot Sequence
  useEffect(() => {
    const checkKeySelection = async () => {
      // If we are in an environment that supports the select key dialog
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        // If it's false, and we don't have a direct env var, we show the setup screen
        if (!selected && !process.env.API_KEY) {
          setHasApiKey(false);
        }
      }
      
      const timer = setTimeout(() => {
        setIsBooting(false);
      }, 1200); 
      return () => clearTimeout(timer);
    };
    checkKeySelection();

    // Listen for failures that suggest an invalid or missing key/project
    const handleRequestKey = () => setHasApiKey(false);
    window.addEventListener('aistudio:request-key', handleRequestKey);
    return () => window.removeEventListener('aistudio:request-key', handleRequestKey);
  }, []);

  const handleOpenKeySelection = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    } else {
      // Manual fallback for production
      alert("Please ensure the API_KEY is set in your Netlify dashboard.");
    }
  };

  // Simulation Logic
  useEffect(() => {
    let interval: number;
    if (isSimulating) {
      interval = window.setInterval(() => {
        const randomSection = sections[Math.floor(Math.random() * sections.length)];
        const fluctuation = Math.floor(Math.random() * 15) - 4;
        const newCount = Math.max(0, randomSection.occupancy + fluctuation);
        handleUpdateSectionCount(randomSection.id, newCount);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, sections]);

  const handleUpdateSectionCount = useCallback((id: string, count: number) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setSections(prev => {
      const existingSection = prev.find(s => s.id === id);
      if (!existingSection) return prev;

      const oldCount = existingSection.occupancy;
      const diff = count - oldCount;

      if (diff > 0) {
        if (existingSection.gateType === 'entrance') {
          setTotalInbound(t => t + diff);
        } else if (existingSection.gateType === 'exit') {
          setTotalOutbound(t => t + diff);
        }
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
            flowRate: Math.floor(Math.random() * 30) + 5
          };
        }
        return s;
      });
    });
    
    setLastSyncTime(now);
  }, []);

  const netOccupancy = useMemo(() => Math.max(0, totalInbound - totalOutbound), [totalInbound, totalOutbound]);

  if (isBooting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50">
        <div className="relative mb-8">
          <Terminal className="w-16 h-16 text-blue-500 animate-pulse" />
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className="text-slate-500 font-black tracking-[0.6em] uppercase text-[10px] mb-2">SafeFlow Command Center</p>
          <p className="text-blue-500 text-[10px] font-black tracking-widest uppercase animate-pulse">Initializing Neural Uplink...</p>
        </div>
      </div>
    );
  }

  if (hasApiKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-3xl text-center relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
            <Key className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">Security Relay Required</h1>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            SafeFlow AI requires a connection to a valid Google Cloud project to perform vision analysis and triage logic.
          </p>
          <button 
            onClick={handleOpenKeySelection}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3 mb-6"
          >
            <Zap className="w-4 h-4" /> CONNECT PROJECT UPLINK
          </button>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed px-4">
            If you've set the key in Netlify, please ensure the environment variable name is exactly <code className="text-blue-400">API_KEY</code>.
          </p>
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
        <div className="p-12 max-w-2xl mx-auto space-y-8">
          <div className="flex items-center gap-6 mb-12">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-xl">
              <SettingsIcon className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">System Configuration</h1>
              <p className="text-slate-400">Manage telemetry feeds and neural thresholds</p>
            </div>
          </div>
          
          <div className="grid gap-4">
             <div className="p-6 bg-slate-900 border border-blue-500/30 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-400 block">Live Data Simulation</span>
                  <p className="text-xs text-slate-500">Auto-fluctuate occupancy for stress testing</p>
                </div>
                <button 
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isSimulating ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isSimulating ? <><Pause className="w-3 h-3"/> Stop Simulation</> : <><Play className="w-3 h-3"/> Start Simulation</>}
                </button>
             </div>
             <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-300 block">Neural Key Rotation</span>
                  <p className="text-xs text-slate-500">Update your Gemini API project connection</p>
                </div>
                <button 
                  onClick={handleOpenKeySelection}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700"
                >
                  Reconnect
                </button>
             </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  const activeQuickScanSection = sections.find(s => s.id === quickScanZone);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col shrink-0 backdrop-blur-3xl">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-900/40">
              <span className="font-black text-white italic tracking-tighter text-xl">SF</span>
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight leading-none">SafeFlow</h2>
              <span className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em] mt-1 block">Venue Command</span>
            </div>
          </div>

          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/50' 
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span className={activeTab === item.id ? 'text-white' : 'text-slate-600'}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-slate-800/20 rounded-3xl p-6 border border-slate-700/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Global PAX</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></div>
                <span className={`text-[9px] font-bold ${isSimulating ? 'text-amber-500' : 'text-emerald-500'}`}>{isSimulating ? 'SIM' : 'LIVE'}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-slate-100 tracking-tighter">{netOccupancy.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Active Load</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-slate-900/20 border-b border-slate-800 flex items-center justify-between px-10 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3 text-xs font-black text-slate-600 uppercase tracking-widest">
            <span className="text-slate-400">Terminal</span>
            <ChevronRight className="w-4 h-4 text-slate-800" />
            <span className="text-slate-200">{activeTab}</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsQuickScanOpen(!isQuickScanOpen)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black tracking-widest transition-all border ${
                isQuickScanOpen 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/50' 
                  : 'bg-slate-800/40 border-slate-700 text-blue-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Zap className={`w-4 h-4 ${isQuickScanOpen ? 'animate-pulse' : ''}`} />
              NODE SCANNER
            </button>
            <button className="relative p-3 text-slate-500 hover:text-white transition-all bg-slate-800/30 rounded-xl border border-slate-800">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>

        {/* Quick Scan Widget */}
        {isQuickScanOpen && (
          <div className="absolute bottom-10 right-10 w-80 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden ring-1 ring-white/10">
              <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Vision Inference Node</span>
                <X className="w-4 h-4 cursor-pointer text-slate-500 hover:text-red-400 transition-colors" onClick={() => setIsQuickScanOpen(false)} />
              </div>
              <div className="p-6 space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Target Entry Gate</label>
                <select 
                  value={quickScanZone}
                  onChange={(e) => setQuickScanZone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="rounded-3xl overflow-hidden border border-slate-800 h-[260px] shadow-inner bg-black">
                  <CameraAnalyzer 
                    zoneName={activeQuickScanSection?.name || ''} 
                    onCountUpdate={(count) => handleUpdateSectionCount(quickScanZone, count)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Showcase Modal */}
        {showShowcase && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] max-w-2xl w-full p-10 shadow-3xl relative overflow-hidden ring-1 ring-white/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight leading-none">SafeFlow Showcase</h2>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Next-Gen Crowd Command Center</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="space-y-4 text-sm text-slate-400">
                  <p>• Tactical <strong className="text-blue-400">Vision Nodes</strong> for gate counting.</p>
                  <p>• Automated <strong className="text-blue-400">Incident Triage</strong> protocols.</p>
                  <p>• Dynamic <strong className="text-blue-400">Load Charts</strong> for exit/entry flow.</p>
                  <p>• Predictive <strong className="text-blue-400">Bottleneck Analysis</strong>.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setShowShowcase(false); setIsSimulating(true); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3"
                >
                  <Play className="w-4 h-4" /> BEGIN COMMAND DEMO
                </button>
                <button 
                  onClick={() => setShowShowcase(false)}
                  className="px-8 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all border border-slate-700"
                >
                  SKIP
                </button>
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
