
import React, { useState } from 'react';
import CameraAnalyzer from './CameraAnalyzer';
import { VenueSection } from '../types';
import { Camera, Eye, Zap, Activity, Info, LayoutGrid, List, AlertCircle, X, Maximize2, Layers } from 'lucide-react';

interface SurveillanceProps {
  sections: VenueSection[];
  onUpdateSection: (id: string, count: number) => void;
}

const Surveillance: React.FC<SurveillanceProps> = ({ sections, onUpdateSection }) => {
  const [selectedGateIds, setSelectedGateIds] = useState<string[]>([sections[0].id]);

  const toggleGateSelection = (id: string) => {
    setSelectedGateIds(prev => 
      prev.includes(id) 
        ? prev.filter(gid => gid !== id) 
        : [...prev, id]
    );
  };

  const selectedSections = sections.filter(s => selectedGateIds.includes(s.id));
  const totalOccupancy = sections.reduce((acc, s) => acc + s.occupancy, 0);
  const analyzedCount = sections.filter(s => s.lastAnalyzed).length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header with Global Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
            <Layers className="w-8 h-8 text-blue-500" />
            Multi-Gate Command Grid
          </h1>
          <p className="text-slate-400 mt-1">Simultaneous side-by-side AI analysis for high-throughput zones</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-2xl text-center min-w-[140px] shadow-inner">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Global Load</p>
            <p className="text-2xl font-black text-blue-400 leading-none">{totalOccupancy.toLocaleString()}</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-2xl text-center min-w-[140px] shadow-inner">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sync Progress</p>
            <p className="text-2xl font-black text-slate-200 leading-none">{analyzedCount}/{sections.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Rail: Multi-Select Gate List */}
        <div className="lg:col-span-3 space-y-4 sticky top-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col max-h-[calc(100vh-200px)] shadow-lg">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <List className="w-4 h-4" />
                GATE DIRECTORY
              </h2>
              <span className="text-[9px] font-bold bg-slate-800 px-2 py-0.5 rounded text-blue-400">
                {selectedGateIds.length} SELECTED
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => toggleGateSelection(section.id)}
                  className={`w-full text-left p-4 border-b border-slate-800/50 transition-all hover:bg-slate-800/50 flex items-center justify-between group ${
                    selectedGateIds.includes(section.id) ? 'bg-blue-600/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      selectedGateIds.includes(section.id) 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-slate-800 border-slate-700'
                    }`}>
                      {selectedGateIds.includes(section.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${selectedGateIds.includes(section.id) ? 'text-blue-400' : 'text-slate-200'}`}>
                        {section.name}
                      </p>
                      <span className={`text-[9px] font-bold uppercase ${
                        section.lastAnalyzed ? 'text-emerald-500' : 'text-slate-600'
                      }`}>
                        {section.lastAnalyzed ? 'LIVE' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${section.lastAnalyzed ? 'text-emerald-400' : 'text-slate-700'}`}>
                      {section.occupancy}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-3 bg-slate-950/50 border-t border-slate-800">
              <button 
                onClick={() => setSelectedGateIds([])}
                className="w-full py-2 text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
              >
                Clear All Selections
              </button>
            </div>
          </div>
        </div>

        {/* Right Content: Multi-Camera Grid */}
        <div className="lg:col-span-9">
          {selectedGateIds.length > 0 ? (
            <div className={`grid gap-6 ${
              selectedGateIds.length === 1 ? 'grid-cols-1' : 
              selectedGateIds.length === 2 ? 'grid-cols-1 xl:grid-cols-2' : 
              'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3'
            }`}>
              {selectedSections.map((section) => (
                <div 
                  key={section.id} 
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative group"
                >
                  <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-600/10 rounded-lg">
                        <Camera className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-100">{section.name}</h3>
                        <p className="text-[9px] text-slate-500 font-mono">GATE-ID: {section.id}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleGateSelection(section.id)}
                      className="text-slate-600 hover:text-red-400 p-1 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <CameraAnalyzer 
                    zoneName={section.name} 
                    onCountUpdate={(count) => onUpdateSection(section.id, count)} 
                  />

                  <div className="p-4 bg-slate-950/30 grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Live Occupancy</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-100">{section.occupancy}</span>
                        <span className="text-[10px] text-slate-500">/ {section.capacity}</span>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          section.status === 'critical' ? 'bg-red-500' : 
                          section.status === 'congested' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span className="text-[10px] font-black uppercase text-slate-200">{section.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[3rem] backdrop-blur-sm">
              <div className="p-10 bg-slate-900 rounded-full mb-8 border border-slate-800 shadow-2xl relative">
                <LayoutGrid className="w-16 h-16 text-slate-700" />
                <div className="absolute top-4 right-4 bg-blue-600 rounded-full p-2 animate-bounce">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-black mb-4 text-slate-100 tracking-tight">Grid View Disconnected</h2>
              <p className="text-slate-500 max-w-md text-lg leading-relaxed font-medium">
                Select multiple gates from the directory to build your custom monitoring layout. View side-by-side analytics and AI streams in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Informational Footer */}
      <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-blue-600/20 rounded-2xl">
          <Info className="w-8 h-8 text-blue-400" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-lg font-bold text-blue-300">Multi-Channel Synchronization</h4>
          <p className="text-sm text-slate-400 max-w-3xl">
            Each active camera feed in the grid uses localized computer vision to independently verify gate loads. 
            All data points are aggregated in the <strong>Global Hub</strong> to ensure the total venue load is accurate and verifiable.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400">LATENCY: LOW</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-slate-400">GEMINI 3 PRO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Surveillance;
