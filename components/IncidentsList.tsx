
import React from 'react';
import { MOCK_INCIDENTS } from '../constants';
import { 
  ShieldAlert, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ExternalLink,
  Flame,
  Stethoscope,
  ShieldIcon,
  AlertOctagon
} from 'lucide-react';

const IncidentsList: React.FC = () => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Stethoscope className="w-4 h-4" />;
      case 'fire': return <Flame className="w-4 h-4" />;
      case 'security': return <ShieldIcon className="w-4 h-4" />;
      default: return <AlertOctagon className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold">Incident Management</h1>
          <p className="text-slate-400 text-sm">Real-time alerts and response status</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-full border border-red-500/20">
            {MOCK_INCIDENTS.filter(i => i.status !== 'resolved').length} Active
          </span>
          <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-full border border-slate-700">
            {MOCK_INCIDENTS.filter(i => i.status === 'resolved').length} Resolved
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_INCIDENTS.map((incident) => (
          <div 
            key={incident.id} 
            className="group bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="flex gap-6">
              <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getSeverityStyles(incident.severity)} border shadow-sm`}>
                {getTypeIcon(incident.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500 tracking-wider">{incident.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${getSeverityStyles(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-100">{incident.description}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      incident.status === 'active' ? 'bg-red-500/20 text-red-400' :
                      incident.status === 'responding' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Reported {incident.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{incident.location}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-slate-800 rounded-lg text-blue-400">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-600/10 border border-blue-500/20 rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold">Need AI Tactical Support?</h4>
            <p className="text-sm text-slate-400">Get generated evacuation routes and triage steps.</p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
          Go to Safety Hub
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default IncidentsList;
