
import React, { useEffect, useState, useCallback } from 'react';
import { Radar, Target, MapPin, Activity, Zap, ShieldCheck, Map as MapIcon, Users, Navigation, Crosshair, AlertTriangle } from 'lucide-react';
import { VenueSection } from '../types';
import { geminiService } from '../services/geminiService';

interface LiveTrackingProps {
  sections: VenueSection[];
}

const LiveTracking: React.FC<LiveTrackingProps> = ({ sections }) => {
  const [clusters, setClusters] = useState<{x: number, y: number, intensity: number}[]>([]);
  const [userLocation, setUserLocation] = useState<{x: number, y: number} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'radar'>('map');

  const fetchNeuralData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const densityData = await geminiService.getNeuralDensityMap(sections);
      setClusters(densityData);
    } catch (err) {
      console.error("Neural tracking error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [sections]);

  useEffect(() => {
    fetchNeuralData();
    const interval = setInterval(fetchNeuralData, 15000); 
    return () => clearInterval(interval);
  }, [fetchNeuralData]);

  const trackUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Map GPS to schematic coordinates (mock logic for demo)
        const x = (position.coords.longitude % 1) * 1000 % 100;
        const y = (position.coords.latitude % 1) * 1000 % 100;
        setUserLocation({ x, y });
        setIsLocating(false);
      },
      (error) => {
        console.error("Location error:", error);
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Mobile-Friendly Header */}
      <div className="p-4 lg:p-6 border-b border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/20 backdrop-blur-md sticky top-0 z-30">
        <div>
          <h1 className="text-xl lg:text-2xl font-black tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Neural Tracking
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Spatial Analysis v4.0</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 flex-1 sm:flex-none">
            <button 
              onClick={() => setViewMode('map')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
            >
              Map
            </button>
            <button 
              onClick={() => setViewMode('radar')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'radar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
            >
              Radar
            </button>
          </div>
          <button 
            onClick={trackUserLocation}
            className={`p-2 rounded-xl border border-slate-800 transition-all ${userLocation ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-slate-900 text-slate-400'}`}
            title="Locate Me"
          >
            {isLocating ? <Zap className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Tactical Viewport */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden cursor-crosshair group">
          {/* Tactical Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-full grid grid-cols-10 grid-rows-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-blue-500/20" />
              ))}
            </div>
          </div>

          {/* Map Schematic Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-10">
            <div className="w-full h-full max-w-4xl max-h-[600px] border-2 border-slate-900 rounded-[3rem] relative bg-slate-900/5">
               {/* Zone Outlines */}
               <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] border border-slate-800 rounded-2xl flex items-center justify-center">
                 <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">ALPHA_WING</span>
               </div>
               <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] border border-slate-800 rounded-2xl flex items-center justify-center">
                 <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">BETA_WING</span>
               </div>
               <div className="absolute bottom-[15%] left-[1/2] -translate-x-1/2 w-[40%] h-[40%] border border-slate-800 rounded-full flex items-center justify-center">
                 <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">CENTRAL_PLAZA</span>
               </div>
            </div>
          </div>

          {/* Scan Line */}
          {viewMode === 'radar' && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="w-full h-1 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-scan"></div>
            </div>
          )}

          {/* Neural Clusters */}
          {clusters.map((c, i) => (
            <div 
              key={i} 
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-[3000ms] ease-in-out"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <div className={`relative flex items-center justify-center`}>
                <div className={`absolute w-12 h-12 lg:w-20 lg:h-20 rounded-full blur-2xl opacity-40 animate-pulse-soft ${
                  c.intensity > 0.8 ? 'bg-red-500' : c.intensity > 0.4 ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className={`w-3 h-3 rounded-full border-2 border-white/50 shadow-2xl ${
                  c.intensity > 0.8 ? 'bg-red-500' : 'bg-blue-500'
                }`} />
              </div>
            </div>
          ))}

          {/* User Location Ping */}
          {userLocation && (
            <div 
              className="absolute z-40 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
              style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%` }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/20 rounded-full animate-ping"></div>
                <div className="bg-emerald-500 p-1.5 rounded-full shadow-lg border-2 border-white">
                  <Navigation className="w-3 h-3 text-white fill-white" />
                </div>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[8px] font-black text-white whitespace-nowrap shadow-xl">
                  YOU ARE HERE
                </div>
              </div>
            </div>
          )}

          {/* UI Overlays */}
          <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-2">
             <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Normal Flow</span>
             </div>
             <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Congestion Risk</span>
             </div>
          </div>

          <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-2">
            <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl">
               <div className="flex items-center gap-3 mb-1">
                 <Users className="w-4 h-4 text-blue-400" />
                 <span className="text-xl font-black italic">4.2k</span>
               </div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Telemetry</p>
            </div>
          </div>
        </div>

        {/* Tactical List - Visible on all screens, collapsible/scrollable */}
        <div className="w-full lg:w-80 bg-slate-900/50 border-t lg:border-t-0 lg:border-l border-slate-900 flex flex-col shrink-0 h-48 lg:h-full backdrop-blur-3xl">
          <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-900/30">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Spatial Alerts
            </h3>
            {isSyncing && <Zap className="w-3 h-3 text-blue-500 animate-bounce" />}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {clusters.filter(c => c.intensity > 0.6).map((c, idx) => (
              <div key={idx} className="p-3 bg-red-950/10 border border-red-500/20 rounded-2xl flex items-center gap-3 group hover:bg-red-950/20 transition-all">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                   <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-red-400 uppercase truncate">Density Surge</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">ZONE_{Math.round(c.x)}/{Math.round(c.y)}</p>
                </div>
                <Target className="w-3.5 h-3.5 text-slate-700 group-hover:text-red-500 transition-colors" />
              </div>
            ))}
            {clusters.filter(c => c.intensity > 0.6).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center grayscale py-10">
                <ShieldCheck className="w-8 h-8 mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest leading-none">All sectors nominal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LiveTracking;
