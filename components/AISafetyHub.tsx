
import React, { useState } from 'react';
import { Send, Bot, ShieldCheck, Route, AlertTriangle, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { MOCK_SECTIONS } from '../constants';
import { AIResponse } from '../types';

const AISafetyHub: React.FC = () => {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("security");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    setIsLoading(true);
    try {
      const result = await geminiService.analyzeSafety(
        { description, location, type: type as any },
        MOCK_SECTIONS
      );
      setResponse(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bot className="text-blue-500 w-8 h-8" />
          AI Safety Hub
        </h1>
        <p className="text-slate-400 mt-2">Simulate incidents or get real-time response protocols powered by Gemini 3.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <AlertTriangle className="text-amber-500 w-5 h-5" />
            Report/Simulate Incident
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Incident Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="security">Security Threat</option>
                <option value="medical">Medical Emergency</option>
                <option value="fire">Fire/Smoke</option>
                <option value="structural">Structural Issue</option>
                <option value="crowd">Crowd Surge</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Location / Zone</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Gate 4, Section B-12"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Detailed Description</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the situation in detail..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading || !description}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Analyze with AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl min-h-[400px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ShieldCheck className="text-green-500 w-5 h-5" />
            AI Tactical Response Plan
          </h2>
          
          {response ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  response.priority.toLowerCase() === 'critical' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 
                  'bg-amber-500/20 text-amber-500 border border-amber-500/50'
                }`}>
                  Priority: {response.priority}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Immediate Actions</h4>
                <ul className="space-y-2">
                  {response.actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-200 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="mt-1 w-5 h-5 flex items-center justify-center bg-blue-500 rounded-full text-[10px] font-bold shrink-0">{idx + 1}</div>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {response.suggestedRoute && (
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Route className="w-4 h-4 text-blue-400" />
                    Recommended Evacuation Route
                  </h4>
                  <p className="text-slate-200 bg-blue-900/20 border border-blue-800/50 p-3 rounded-lg italic">
                    {response.suggestedRoute}
                  </p>
                </div>
              )}

              <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Risk Assessment Details</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{response.riskAssessment}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <Bot className="w-16 h-16 mb-4 text-slate-700" />
              <p className="text-slate-500">Submit an incident report to generate a tactical response plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISafetyHub;
