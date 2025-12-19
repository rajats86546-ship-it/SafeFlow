
import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, Users, AlertCircle, Loader2, Clock } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface CameraAnalyzerProps {
  onCountUpdate: (count: number) => void;
  zoneName: string;
}

const CameraAnalyzer: React.FC<CameraAnalyzerProps> = ({ onCountUpdate, zoneName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastCount, setLastCount] = useState<number | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      setError("Failed to access camera. Please check permissions.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        const count = await geminiService.countPeopleInImage(base64Image);
        
        setLastCount(count);
        setLastScanTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        onCountUpdate(count);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isActive) {
      // Small delay after starting to ensure video stream is stable
      const initialTimeout = window.setTimeout(analyzeFrame, 1500);
      interval = window.setInterval(analyzeFrame, 8000); // Analyze every 8 seconds for balance
      return () => {
        window.clearTimeout(initialTimeout);
        window.clearInterval(interval);
      };
    }
  }, [isActive]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200 truncate max-w-[150px] md:max-w-none">
            {zoneName}
          </h3>
        </div>
        <div className="flex items-center gap-2">
           {isActive && lastScanTime && (
             <span className="text-[10px] text-slate-500 font-bold hidden md:flex items-center gap-1">
               <Clock className="w-3 h-3" />
               LAST SYNC: {lastScanTime}
             </span>
           )}
           <button 
             onClick={isActive ? stopCamera : startCamera}
             className={`p-2 rounded-lg transition-all ${isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/40'}`}
           >
             {isActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
           </button>
        </div>
      </div>

      <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
        {!isActive && !error && (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
               <Camera className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Camera offline.</p>
            <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-widest">Awaiting Manual Activation</p>
          </div>
        )}

        {error && (
          <div className="text-center p-6 text-red-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {isActive && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className={`bg-slate-950/80 backdrop-blur-md border border-slate-700/50 px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shadow-2xl ${isAnalyzing ? 'scale-105 border-blue-500/50' : ''}`}>
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              ) : (
                <Users className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className="text-xs font-black text-white">
                {isAnalyzing ? 'SCANNING...' : lastCount !== null ? `${lastCount} PAX` : 'DETECTING...'}
              </span>
            </div>
          </div>
        )}
        
        {/* Scanning Line Animation */}
        {isActive && isAnalyzing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-0.5 w-full bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] absolute animate-scan-line"></div>
          </div>
        )}
      </div>

      {isActive && (
        <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-blue-500"></div>
             <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">AI Intelligence Link Active</span>
          </div>
          <button 
            onClick={analyzeFrame}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 hover:text-white transition-all disabled:opacity-30 group"
          >
            <RefreshCw className={`w-3 h-3 group-hover:rotate-180 transition-transform duration-500 ${isAnalyzing ? 'animate-spin' : ''}`} />
            TRIGGER ANALYTICS
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CameraAnalyzer;
