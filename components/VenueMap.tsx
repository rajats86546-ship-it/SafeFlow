
import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle2, Map as MapIcon, Zap, MapPin, Eye } from 'lucide-react';
import { VenueSection } from '../types';
import { geminiService } from '../services/geminiService';

interface VenueMapProps {
  sections: VenueSection[];
}

const VenueMap: React.FC<VenueMapProps> = ({ sections }) => {
  const [showNeuralOverlay, setShowNeuralOverlay] = useState(true);
  const [clusters, setClusters] = useState<{x: number, y: number, intensity: number}[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!showNeuralOverlay) return;
    
    const syncMap = async () => {
      setIsSyncing(true);
      const densityData = await geminiService.getNeuralDensityMap(sections);
      setClusters(densityData);
      setIsSyncing(false);
    };

    syncMap();
    const interval = setInterval(syncMap, 20000); 
    return () => clearInterval(interval);
  }, [sections, showNeuralOverlay]);

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-950/30 border-red-500/40';
      case 'congested': return 'bg-amber-950/30 border-amber-500/40';
      default: return 'bg-slate-900/60 border-slate-800/80';
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-glow">Spatial Monitor</h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.3em] mt-1">Real-time floorplan telemetry and neural clusters</p>
        </div>
        
        <button 
          onClick={() => setShowNeuralOverlay(!showNeuralOverlay)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all border ${
            showNeuralOverlay ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          {showNeuralOverlay ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          Neural Tracking {showNeuralOverlay ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => (
          <div key={section.id} className={`p-5 rounded-[2rem] border transition-all ${getStatusBg(section.status)}`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Node {section.id}</span>
              {section.status !== 'normal' && <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />}
            </div>
            <h3 className="font-black text-lg text-slate-200 leading-tight mb-4">{section.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saturation</span>
                 <span className="text-xs font-black text-slate-100">{Math.round((section.occupancy/section.capacity)*100)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-blue-500 transition-all duration-1000`} style={{ width: `${(section.occupancy/section.capacity)*100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-6 lg:p-12 min-h-[400px] lg:min-h-[600px] relative overflow-hidden group shadow-inner">
        {/* Tactical Grid Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full border border-blue-500/20 grid grid-cols-10 grid-rows-10">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-blue-500/10" />
            ))}
          </div>
        </div>

        {/* Neural Heat Clusters Tracking */}
        {showNeuralOverlay && clusters.map((c, i) => (
          <div 
            key={i} 
            className="absolute z-20 transition-all duration-[3000ms] ease-in-out"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
          >
            <div className={`w-12 h-12 lg:w-20 lg:h-20 rounded-full blur-2xl opacity-40 animate-pulse-soft ${c.intensity > 0.8 ? 'bg-red-500' : c.intensity > 0.4 ? 'bg-amber-500' : 'bg-blue-500'}`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white/40 ${c.intensity > 0.8 ? 'bg-red-500' : 'bg-blue-400'}`} />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center py-20">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-full mb-6 relative">
             <MapIcon className="w-12 h-12 text-slate-700" />
             {isSyncing && <Zap className="w-6 h-6 text-blue-500 absolute top-0 right-0 animate-bounce" />}
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Interactive Venue Schematic</h2>
          <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed mt-2 font-medium">
            SVG map substrate active. Neural clusters represent predictive crowd flow locations based on zone telemetry.
          </p>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
             <div className="flex items-center gap-3 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Normal density</span>
             </div>
             <div className="flex items-center gap-3 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High risk cluster</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueMap;
