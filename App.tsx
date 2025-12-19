
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
  ExternalLink
} from 'lucide-react';
import CameraAnalyzer from './components/CameraAnalyzer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sections, setSections] = useState<VenueSection[]>(MOCK_SECTIONS);
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);
  const [quickScanZone, setQuickScanZone] = useState(sections[0].id);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  
  const [totalInbound, setTotalInbound] = useState(0);
  const [totalOutbound, setTotalOutbound] = useState(0);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true); // Fallback for environments where key selection is not required
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Proceed assuming selection or platform injection
    }
  };

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

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50 p-6 text-center">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-4">API Configuration Required</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            To enable real-time AI crowd analysis and safety protocols, please select a paid Google Cloud Project API key.
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleOpenKeySelector}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-slate-500 hover:text-blue-400 flex items-center justify-center gap-2"
            >
              View Billing Documentation <ExternalLink className="w-3 h-3" />
            </a>
          </div>
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
             {['AI Calibration Mode', 'Privacy Masking', 'Subtractive Exit Logic', 'Gemini Inference Budget'].map((setting) => (
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
          <p>This section is scheduled for the next release.</p>
        </div>
      );
    }
  };

  const activeQuickScanSection = sections.find(s => s.id === quickScanZone);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden selection:bg-blue-500/30">
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
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Venue Status</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            </div>
            <p className="text-xs text-slate-300 font-medium">{netOccupancy} Pax Inside</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-8 backdrop-blur-xl z-10">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
            <span className="hover:text-slate-300 cursor-pointer text-blue-400 font-bold uppercase">{activeTab === 'ai-assistant' ? 'AI SAFETY HUB' : activeTab.toUpperCase()}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-200">LIVE COMMAND</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsQuickScanOpen(!isQuickScanOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isQuickScanOpen 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-slate-800/50 border-slate-700 text-blue-400 hover:bg-slate-800'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isQuickScanOpen ? 'animate-pulse' : ''}`} />
              SYNC GATE CAMERA
            </button>
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/30 rounded-lg border border-slate-800">
              <Bell className="w-4 h-4" />
              {lastSyncTime && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>

        {isQuickScanOpen && (
          <div className="absolute bottom-6 right-6 w-80 z-50 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden ring-4 ring-blue-600/20">
              <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Gate Camera Sync</span>
                </div>
                <button onClick={() => setIsQuickScanOpen(false)} className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-slate-400"><X className="w-3 h-3" /></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">Select Gate</label>
                  <select 
                    value={quickScanZone}
                    onChange={(e) => setQuickScanZone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.gateType.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-800">
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

export default App;
