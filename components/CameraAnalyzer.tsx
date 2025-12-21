
import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, Users, AlertCircle, Loader2, Clock, ShieldAlert, Scan } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface CameraAnalyzerProps {
  onCountUpdate: (count: number) => void;
  zoneName: string;
  onKeyError?: () => void;
}

const CameraAnalyzer: React.FC<CameraAnalyzerProps> = ({ onCountUpdate, zoneName, onKeyError }) => {
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
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1080 }, 
          height: { ideal: 720 } 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsActive(true);
        };
      }
    } catch (err) {
      setError("Sensor Access Restricted. Check HTTPS/Permissions.");
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
    setLastCount(null);
  };

  const analyzeFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || isAnalyzing) return;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    setIsAnalyzing(true);
    
    try {
      const context = canvas.getContext('2d', { alpha: false });
      if (context) {
        // Higher efficiency resolution for AI processing
        canvas.width = 640; 
        canvas.height = 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // JPEG compression to 0.6 for fast Netlify transit
        const base64Image = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        
        if (!base64Image) throw new Error("Frame drop detected");

        const count = await geminiService.countPeopleInImage(base64Image);
        
        setLastCount(count);
        setLastScanTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        onCountUpdate(count);
      }
    } catch (err: any) {
      console.error("YOLO-Inference Loop Failure:", err);
      if (err.message === "API_KEY_EXPIRED_OR_INVALID" && onKeyError) {
        onKeyError();
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isActive) {
      // Faster stabilization and scan cycle for 'live' feel
      const initialTimeout = window.setTimeout(analyzeFrame, 2000);
      interval = window.setInterval(analyzeFrame, 6000); 
      
      return () => {
        window.clearTimeout(initialTimeout);
        window.clearInterval(interval);
      };
    }
  }, [isActive]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-3xl transition-all h-full flex flex-col group/yolo relative">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-400">
            {zoneName || 'NODE_01'}
          </h3>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={isActive ? stopCamera : startCamera}
             className={`p-2 rounded-xl transition-all ${isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-900/50'}`}
           >
             {isActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
           </button>
        </div>
      </div>

      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[260px]">
        {/* Detection Grid Overlay */}
        {isActive && !error && (
          <div className="absolute inset-0 z-20 pointer-events-none opacity-20">
            <div className="w-full h-full border-[0.5px] border-blue-500/30 grid grid-cols-4 grid-rows-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-blue-500/10" />
              ))}
            </div>
          </div>
        )}

        {!isActive && !error && (
          <div className="text-center p-8 z-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-inner">
               <Scan className="w-8 h-8 text-slate-700" />
            </div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Awaiting Command</p>
          </div>
        )}

        {error && (
          <div className="text-center p-6 text-red-400 w-full h-full flex flex-col items-center justify-center z-10">
            <ShieldAlert className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{error}</p>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-1000 ${isActive && !error ? 'opacity-80 grayscale-[0.2] contrast-125' : 'opacity-0'}`}
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {isActive && !error && (
          <>
            <div className="absolute top-4 left-4 z-30">
              <div className="bg-blue-600/20 backdrop-blur-md border border-blue-500/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></div>
                <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest">YOLO_v3_INF_LIVE</span>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-4 px-4 z-30">
              <div className={`bg-slate-950/90 backdrop-blur-2xl border border-white/5 px-5 py-3 rounded-2xl flex items-center justify-between transition-all shadow-3xl ${isAnalyzing ? 'ring-1 ring-blue-500/50' : ''}`}>
                <div className="flex items-center gap-3">
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 text-blue-400" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      {isAnalyzing ? 'DETECTING OBJECTS...' : lastCount !== null ? `${lastCount} OBJECTS IDENTIFIED` : 'READY'}
                    </span>
                    {lastScanTime && (
                      <span className="text-[8px] font-bold text-slate-500 uppercase">SYNC_T: {lastScanTime}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {isActive && isAnalyzing && !error && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <div className="h-[2px] w-full bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,1)] absolute animate-yolo-scan"></div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes yolo-scan {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-yolo-scan {
          animation: yolo-scan 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CameraAnalyzer;
