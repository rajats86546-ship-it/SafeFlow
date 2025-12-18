
import React from 'react';
import { MOCK_SECTIONS } from '../constants';
// Added Map as MapIcon to fix the missing component error
import { Users, AlertTriangle, CheckCircle2, Map as MapIcon } from 'lucide-react';

const VenueMap: React.FC = () => {
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-950/40 border-red-500/50 shadow-red-900/20';
      case 'congested': return 'bg-amber-950/40 border-amber-500/50 shadow-amber-900/20';
      default: return 'bg-slate-900/60 border-slate-700/50 shadow-slate-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'congested': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Venue Spatial Monitor</h1>
        <p className="text-slate-400 text-sm">Real-time status of all monitored zones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_SECTIONS.map((section) => {
          const occupancyPercent = (section.occupancy / section.capacity) * 100;
          return (
            <div 
              key={section.id} 
              className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] cursor-default ${getStatusBg(section.status)} shadow-lg`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-tighter bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  Zone {section.id}
                </span>
                {getStatusIcon(section.status)}
              </div>
              
              <h3 className="font-bold text-lg mb-1">{section.name}</h3>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Occupancy</span>
                  <span className="font-medium text-slate-200">{section.occupancy} / {section.capacity}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      section.status === 'critical' ? 'bg-red-500' : 
                      section.status === 'congested' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-2">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-400">Flow: {section.flowRate} p/min</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex items-center justify-center border-dashed min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
            <MapIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Live Floorplan Integration</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            SVG map overlay active. Heatmap layer is being calculated from current flow rates across all {MOCK_SECTIONS.length} zones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VenueMap;
