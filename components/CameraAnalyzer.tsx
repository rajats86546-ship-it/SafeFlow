import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, Users, AlertCircle, Loader2, Clock, ShieldAlert, Scan, Target } from 'lucide-react';
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
        video: { 
          facingMode: 'environment', 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsActive(true);
        };
      }
    } catch (err: any) {
      setError("Camera Access Refused. Ensure HTTPS and grant browser permissions.");
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
    setIsAnalyzing(false);
  };

  const analyzeFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || isAnalyzing || !isActive) return;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const context = canvas.getContext('2d', { alpha: false });
      if (context) {
        canvas.width = 640; 
        canvas.height = 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        
        if (!base64Image) throw new Error("Capture failure");

        const count = await geminiService.countPeopleInImage(base64Image);
        
        setLastCount(count);
        setLastScanTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        onCountUpdate(count);
      }
    } catch (err: any) {
      console.error("AI Node Inference Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isActive) {
      // 10 second interval for free tier stability
      const initialTimeout = window.setTimeout(analyzeFrame, 2000);
      interval = window.setInterval(analyzeFrame, 10000); 
      
      return () => {
        window.clearTimeout(initialTimeout);
        window.clearInterval(interval);
      };
    }
  }, [isActive]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all h-full flex flex-col group/yolo relative">
      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
          <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-blue-400">
            {zoneName || 'ENTRY_NODE_01'}
          </h3>
        </div>
        <button 
          onClick={isActive ? stopCamera : startCamera}
          className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[200px]">
        {isActive && !error && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="w-full h-full opacity-10 border border-blue-500/30 grid grid-cols-6 grid-rows-6">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-blue-500/10" />
              ))}
            </div>
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-24 h-24 border border-blue-500/30 rounded-full animate-ping"></div>
              </div>
            )}
          </div>
        )}

        {!isActive && !error && (
          <div className="text-center p-8 z-10">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800">
               <Scan className="w-6 h-6 text-slate-700" />
            </div>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Awaiting Uplink</p>
          </div>
        )}

        {error && (
          <div className="text-center p-6 text-red-400 w-full h-full flex flex-col items-center justify-center z-10 bg-red-950/5">
            <ShieldAlert className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em] max-w-[150px] mx-auto leading-relaxed">{error}</p>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-1000 ${isActive && !error ? 'opacity-80 grayscale-[0.3] contrast-125' : 'opacity-0'}`}
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {isActive && !error && (
          <>
            <div className="absolute top-2 left-2 z-30">
              <div className="bg-blue-600/30 backdrop-blur-md border border-blue-500/40 px-2 py-1 rounded-lg flex items-center gap-1.5">
                <div className={`w-1 h-1 rounded-full ${isAnalyzing ? 'bg-blue-400 animate-ping' : 'bg-blue-400'}`}></div>
                <span className="text-[8px] font-black text-blue-100 uppercase tracking-widest">
                  {isAnalyzing ? 'INFERENCE ACTIVE' : 'MONITORING'}
                </span>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-2 px-2 z-30">
              <div className={`bg-slate-950/90 backdrop-blur-2xl border border-white/5 px-4 py-2 rounded-xl flex items-center justify-between transition-all shadow-3xl ${isAnalyzing ? 'ring-1 ring-blue-500/50' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                      {isAnalyzing ? 'SCANNED...' : lastCount !== null ? `${lastCount} PAX DETECTED` : 'WAITING FOR SCAN'}
                    </span>
                    {lastScanTime && (
                      <span className="text-[8px] font-bold text-slate-500 uppercase mt-1">SYNC_T: {lastScanTime}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {isActive && isAnalyzing && !error && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <div className="h-[2px] w-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] absolute animate-yolo-scan"></div>
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
          animation: yolo-scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CameraAnalyzer;