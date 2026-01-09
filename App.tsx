
import React, { Component, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { NAVIGATION_ITEMS, MOCK_SECTIONS, MOCK_INCIDENTS } from './constants';
import Dashboard from './components/Dashboard';
import AISafetyHub from './components/AISafetyHub';
import VenueMap from './components/VenueMap';
import IncidentsList from './components/IncidentsList';
import FlowAnalysis from './components/FlowAnalysis';
import Surveillance from './components/Surveillance';
import LiveTracking from './components/LiveTracking';
import { VenueSection, Incident } from './types';
import { 
  ChevronRight,
  Settings as SettingsIcon,
  Zap,
  X,
  Terminal,
  ShieldCheck,
  Activity,
  Key,
  ShieldAlert,
  Menu,
  Map as MapIcon,
  Radar,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Info,
  Unplug,
  Cpu
} from 'lucide-react';
import CameraAnalyzer from './components/CameraAnalyzer';
import { subscribeToApiErrors, resetQuotaStatus } from './services/geminiService';

interface ErrorBoundaryProps { children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };
  constructor(props: ErrorBoundaryProps) { super(props); }
  static getDerivedStateFromError(_: any): ErrorBoundaryState { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50 p-10 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2">System Collision Detected</h1>
          <p className="text-slate-400 mb-6">The neural substrate encountered an unrecoverable exception.</p>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-blue-600 rounded-2xl font-black shadow-2xl hover:scale-105 transition-transform">
            REBOOT SYSTEM
          </button>
        </div>
      );
    }
    return this.props.children || null;
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
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [apiError, setApiError] = useState<{type: string, message: string} | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [totalInbound, setTotalInbound] = useState(0);
  const [totalOutbound, setTotalOutbound] = useState(0);

  const checkSecurityUplink = async () => {
    const envKeyExists = !!process.env.API_KEY;
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      if (!selected && !envKeyExists) setHasApiKey(false);
      else setHasApiKey(true);
    } else if (!envKeyExists) {
      setHasApiKey(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkSecurityUplink();
      const unsubscribe = subscribeToApiErrors((type, message) => {
        setApiError({ type, message });
        if (type !== 'QUOTA') {
          setTimeout(() => setApiError(null), 5000);
        }
      });
      setTimeout(() => setIsBooting(false), 1500);
      return unsubscribe;
    };
    init();
  }, []);

  const handleOpenKeySelection = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      resetQuotaStatus();
      setHasApiKey(true);
      setApiError(null);
      await checkSecurityUplink();
    }
  };

  useEffect(() => {
    let interval: number;
    if (isSimulating) {
      interval = window.setInterval(() => {
        const randomSection = sections[Math.floor(Math.random() * sections.length)];
        const fluctuation = Math.floor(Math.random() * 12) - 3;
        const newCount = Math.max(0, randomSection.occupancy + fluctuation);
        handleUpdateSectionCount(randomSection.id, newCount);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, sections]);

  const handleUpdateSectionCount = useCallback((id: string, count: number) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSections(prev => {
      const target = prev.find(s => s.id === id);
      if (!target) return prev;
      const diff = count - target.occupancy;
      
      if (diff > 0) {
        if (target.gateType === 'entrance') setTotalInbound(t => t + diff);
        else if (target.gateType === 'exit') setTotalOutbound(t => t + diff);
      }
      
      return prev.map(s => {
        if (s.id === id) {
          const status = count > s.capacity * 0.9 ? 'critical' : count > s.capacity * 0.7 ? 'congested' : 'normal';
          return { ...s, occupancy: count, status, lastAnalyzed: now, flowRate: Math.floor(Math.random() * 25) + 5 };
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
        <Terminal className="w-12 h-12 text-blue-500 animate-pulse mb-6" />
        <div className="text-center">
          <p className="text-slate-600 font-black tracking-[0.8em] uppercase text-[10px] mb-3">SafeFlow OS v4.2</p>
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden selection:bg-blue-500/30">
      {/* Dynamic Error Banner */}
      {apiError && (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-500">
          <div className={`flex items-center justify-between px-6 py-3 ${apiError.type === 'QUOTA' ? 'bg-amber-600' : 'bg-red-600'} text-white shadow-2xl`}>
            <div className="flex items-center gap-4">
              {apiError.type === 'QUOTA' ? <Cpu className="w-5 h-5 animate-pulse" /> : <ShieldAlert className="w-5 h-5" />}
              <div>
                <span className="font-black text-[10px] uppercase tracking-widest block leading-none mb-1">
                  {apiError.type === 'QUOTA' ? 'FREE TIER LIMIT: SYNTHETIC MODE' : 'NEURAL LINK OFFLINE'}
                </span>
                <p className="text-xs font-bold opacity-90">{apiError.message}</p>
              </div>
            </div>
            <button onClick={() => setApiError(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-slate-900/50 border-r border-slate-800 flex-col shrink-0 backdrop-blur-3xl">
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-2xl font-black italic text-xl">SF</div>
            <div>
              <h2 className="font-black text-xl leading-none">SafeFlow</h2>
              <span className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em] mt-1 block">Live Command</span>
            </div>
          </div>
          <nav className="space-y-1 flex-1">
            {NAVIGATION_ITEMS.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/50' 
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-auto pt-8 border-t border-slate-800/50">
             <div className="bg-slate-950/40 p-4 rounded-3xl border border-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Load</span>
                  <div className={`w-2 h-2 rounded-full ${apiError?.type === 'QUOTA' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'} animate-pulse`}></div>
                </div>
                <p className="text-2xl font-black italic">{netOccupancy.toLocaleString()}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 lg:h-20 bg-slate-900/20 border-b border-slate-800 flex items-center justify-between px-6 lg:px-10 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span className="hidden sm:inline">OS TERMINAL</span>
            <ChevronRight className="w-4 h-4 text-slate-800 hidden sm:inline" />
            <span className="text-slate-200">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
             <div className="lg:hidden flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 shadow-lg">
               <Activity className={`w-3.5 h-3.5 ${apiError?.type === 'QUOTA' ? 'text-amber-500' : 'text-emerald-500'} animate-pulse`} />
               <span className="text-[10px] font-black">{netOccupancy.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setIsQuickScanOpen(!isQuickScanOpen)} 
              className={`p-2 lg:px-6 lg:py-2.5 rounded-xl border transition-all ${
                isQuickScanOpen ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-slate-800/40 border-slate-700 text-blue-400 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 lg:hidden" />
              <span className="hidden lg:inline text-[11px] font-black tracking-widest uppercase">Scanner</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 lg:pb-0">
          <ErrorBoundary>
            {activeTab === 'dashboard' && <Dashboard sections={sections} onUpdateSection={handleUpdateSectionCount} lastSyncTime={lastSyncTime} netOccupancy={netOccupancy} totalInbound={totalInbound} totalOutbound={totalOutbound} />}
            {activeTab === 'tracking' && <LiveTracking sections={sections} />}
            {activeTab === 'surveillance' && <Surveillance sections={sections} onUpdateSection={handleUpdateSectionCount} />}
            {activeTab === 'map' && <VenueMap sections={sections} />}
            {activeTab === 'incidents' && <IncidentsList incidents={incidents} />}
            {activeTab === 'flow' && <FlowAnalysis sections={sections} />}
            {activeTab === 'ai-assistant' && <AISafetyHub sections={sections} />}
            {activeTab === 'settings' && (
              <div className="p-8 max-w-2xl mx-auto space-y-10">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center">
                     <SettingsIcon className="w-8 h-8 text-blue-400" />
                   </div>
                   <div>
                     <h1 className="text-3xl font-black tracking-tight">System Settings</h1>
                     <p className="text-slate-500">Global neural threshold and relay configs</p>
                   </div>
                </div>
                <div className="grid gap-6">
                   <div className="p-6 bg-slate-900/60 border border-blue-500/20 rounded-3xl flex justify-between items-center group">
                      <div>
                        <span className="font-bold text-blue-400 block text-lg">Simulation Mode</span>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">AUTO_FLUCTUATE_LOAD</p>
                      </div>
                      <button onClick={() => setIsSimulating(!isSimulating)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${isSimulating ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
                        {isSimulating ? 'Offline' : 'Online'}
                      </button>
                   </div>
                   <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-300 block text-lg">AI Uplink</span>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">FREE TIER OPTIMIZED</p>
                      </div>
                      <button onClick={handleOpenKeySelection} className="px-6 py-3 bg-slate-800 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-colors">
                        Refresh Key
                      </button>
                   </div>
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full h-18 bg-slate-900/90 border-t border-slate-800 backdrop-blur-xl flex items-center justify-around px-4 pb-2 z-40">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 p-3 transition-all ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-500'}`}>
            <Activity className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Home</span>
          </button>
          <button onClick={() => setActiveTab('tracking')} className={`flex flex-col items-center gap-1 p-3 transition-all ${activeTab === 'tracking' ? 'text-blue-400' : 'text-slate-500'}`}>
            <Radar className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Live</span>
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center -mt-10 shadow-2xl border-4 border-slate-950 group active:scale-95 transition-transform">
            <Menu className="w-7 h-7" />
          </button>
          <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1 p-3 transition-all ${activeTab === 'map' ? 'text-blue-400' : 'text-slate-500'}`}>
            <MapIcon className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Map</span>
          </button>
          <button onClick={() => setActiveTab('ai-assistant')} className={`flex flex-col items-center gap-1 p-3 transition-all ${activeTab === 'ai-assistant' ? 'text-blue-400' : 'text-slate-500'}`}>
            <ShieldCheck className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Safety</span>
          </button>
        </nav>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-50 flex flex-col animate-in fade-in slide-in-from-bottom-20 duration-300">
             <div className="p-6 border-b border-slate-900 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic shadow-lg">SF</div>
                 <h2 className="text-xl font-black tracking-tight">COMMAND CENTER</h2>
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-900 rounded-full border border-slate-800">
                 <X className="w-6 h-6 text-slate-400" />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
               {NAVIGATION_ITEMS.map((item) => (
                 <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
                  className={`w-full flex items-center justify-between p-6 rounded-[2rem] border transition-all ${
                    activeTab === item.id 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-xl' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-400'
                  }`}
                 >
                    <div className="flex items-center gap-6">
                      {item.icon}
                      <span className="font-black text-lg uppercase tracking-tight">{item.label}</span>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                 </button>
               ))}
             </div>
          </div>
        )}

        {isQuickScanOpen && (
          <div className="fixed bottom-24 right-4 left-4 lg:absolute lg:bottom-10 lg:right-10 lg:left-auto lg:w-80 z-40">
            <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-3xl overflow-hidden ring-1 ring-white/10">
              <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Scanner Interface</span>
                <X className="w-4 h-4 text-slate-500 cursor-pointer" onClick={() => setIsQuickScanOpen(false)} />
              </div>
              <div className="p-5 space-y-4">
                <select value={quickScanZone} onChange={(e) => setQuickScanZone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none">
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="rounded-2xl overflow-hidden border border-slate-800 h-[220px] bg-black shadow-inner">
                  <CameraAnalyzer zoneName={sections.find(s => s.id === quickScanZone)?.name || ''} onCountUpdate={(count) => handleUpdateSectionCount(quickScanZone, count)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {showShowcase && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] max-w-xl w-full p-8 lg:p-14 shadow-3xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>
              <ShieldCheck className="w-16 h-16 text-blue-400 mx-auto mb-8" />
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4 leading-none">SafeFlow Command</h2>
              <p className="text-slate-500 mb-12 uppercase text-[10px] tracking-[0.5em]">Neural Venue Intelligence • Free Tier Enabled</p>
              
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl text-left mb-10 flex gap-4">
                <Info className="w-6 h-6 text-amber-500 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  <strong>SYSTEM NOTE:</strong> Using a free Gemini API key. System is optimized with <span className="text-blue-400">Request Throttling</span> and <span className="text-blue-400">Synthetic AI Fallbacks</span> to ensure stable operations within free tier limits.
                </p>
              </div>

              <button onClick={() => { setShowShowcase(false); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-3xl shadow-xl shadow-blue-900/40 transition-all">
                INITIALIZE COMMAND SYSTEM
              </button>
            </div>
          </div>
        )}
      </main>
      <style>{`
        @keyframes progress-bar { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress-bar { animation: progress-bar 1.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

const App: React.FC = () => (<ErrorBoundary><SafeFlowApp /></ErrorBoundary>);
export default App;
