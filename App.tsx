
import React, { useState, useCallback, useMemo, useEffect, Component, ReactNode } from 'react';
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
  Loader2,
  AlertCircle,
  Terminal
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

// Fixed ErrorBoundary by using explicit Component import and ensuring state/props are correctly typed
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    // Accessing this.state which is now correctly recognized due to Component inheritance
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50 p-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2">System Error</h1>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Reset Terminal
          </button>
        </div>
      );
    }
    // Accessing this.props which is now correctly recognized
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 1200); 
    return () => clearTimeout(timer);
  }, []);

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
            flowRate: Math.floor(Math.random() * 50) + 10
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
        <Terminal className="w-12 h-12 text-blue-500 animate-pulse mb-6" />
        <p className="text-slate-500 font-black tracking-[0.5em] uppercase text-[10px]">Initializing SafeFlow Hub</p>
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
        <div className="p-12 max-w-2xl mx-auto text-center">
          <SettingsIcon className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4">Node Configuration</h1>
          <p className="text-slate-400">All local nodes are synchronized with the primary command relay.</p>
        </div>
      );
      default: return null;
    }
  };

  const activeQuickScanSection = sections.find(s => s.id === quickScanZone);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden selection:bg-blue-500/30">
      <aside className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-black text-white">SF</span>
            </div>
            <h2 className="font-black text-xl tracking-tight">SafeFlow</h2>
          </div>

          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-xl' 
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-slate-800/30 rounded-3xl p-5 border border-slate-700/20">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">Venue Load</span>
            <p className="text-3xl font-black text-slate-100">{netOccupancy.toLocaleString()}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-slate-900/20 border-b border-slate-800 flex items-center justify-between px-10">
          <div className="flex items-center gap-3 text-xs font-black text-slate-600 uppercase">
            <span>COMMAND</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-300">{activeTab}</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsQuickScanOpen(!isQuickScanOpen)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 rounded-xl text-[11px] font-black tracking-widest text-white shadow-lg"
            >
              <Zap className="w-4 h-4" />
              QUICK SCAN
            </button>
            <Bell className="w-5 h-5 text-slate-500" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>

        {isQuickScanOpen && (
          <div className="absolute bottom-10 right-10 w-80 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-3xl overflow-hidden">
              <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <span className="text-[10px] font-black text-blue-400">GATE SCANNER</span>
                <X className="w-4 h-4 cursor-pointer" onClick={() => setIsQuickScanOpen(false)} />
              </div>
              <div className="p-6 space-y-4">
                <select 
                  value={quickScanZone}
                  onChange={(e) => setQuickScanZone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none"
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="rounded-[1.5rem] overflow-hidden border border-slate-800 h-[240px]">
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
