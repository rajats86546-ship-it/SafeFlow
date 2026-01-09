
import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, Loader2, ShieldAlert, Scan, Target, AlertTriangle } from 'lucide-react';
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
  const [error, setError] = useState<{type: 'PERMISSION' | 'QUOTA' | 'GENERIC', message: string} | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsActive(true);
      }
    } catch (err: any) {
      setError({ type: 'PERMISSION', message: "Camera Access Refused. Grant browser permissions." });
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
    
    try {
      const context = canvas.getContext('2d', { alpha: false });
      if (context) {
        canvas.width = 640; 
        canvas.height = 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        if (!base64Image) throw new Error("Capture failure");

        const count = await geminiService.countPeopleInImage(base64Image);
        
        if (count === -2) {
          setError({ type: 'QUOTA', message: "API Quota Limit reached. Wait 60s or use a paid key." });
          setLastCount(null);
        } else if (count === -1) {
          setError({ type: 'GENERIC', message: "AI Inference Failed." });
          setLastCount(null);
        } else {
          setError(null);
          setLastCount(count);
          setLastScanTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          onCountUpdate(count);
        }
      }
    } catch (err: any) {
      console.error("AI Node Inference Error:", err);
      setError({ type: 'GENERIC', message: "AI Link fluctuating." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isActive && !error) {
      const initialTimeout = window.setTimeout(analyzeFrame, 2000);
      interval = window.setInterval(analyzeFrame, 15000); 
      return () => {
        window.clearTimeout(initialTimeout);
        window.clearInterval(interval);
      };
    }
  }, [isActive, error]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all h-full flex flex-col group/yolo relative">
      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive && !error ? 'bg-blue-500 animate-pulse' : error ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
          <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-blue-400">{zoneName || 'ENTRY_NODE'}</h3>
        </div>
        <button onClick={isActive ? stopCamera : startCamera} className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {isActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[200px]">
        {!isActive && !error && (
          <div className="text-center p-8 z-10">
            <Scan className="w-8 h-8 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Awaiting Uplink</p>
          </div>
        )}

        {error && (
          <div className="text-center p-6 text-red-400 w-full h-full flex flex-col items-center justify-center z-40 bg-slate-950/90 backdrop-blur-sm absolute inset-0">
            {error.type === 'QUOTA' ? <AlertTriangle className="w-10 h-10 mb-2 text-amber-500" /> : <ShieldAlert className="w-10 h-10 mb-2 text-red-500" />}
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">{error.type === 'QUOTA' ? 'API LIMIT REACHED' : 'UPLINK FAILURE'}</p>
            <p className="text-[9px] text-slate-400 max-w-[180px] mx-auto leading-relaxed">{error.message}</p>
            <button onClick={() => { setError(null); analyzeFrame(); }} className="mt-4 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[9px] font-black text-slate-300 flex items-center gap-2 hover:bg-slate-700 transition-all">
              <RefreshCw className="w-3 h-3" /> RETRY SCAN
            </button>
          </div>
        )}

        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-1000 ${isActive && !error ? 'opacity-80' : 'opacity-0'}`} />
        <canvas ref={canvasRef} className="hidden" />

        {isActive && !error && (
          <div className="absolute inset-x-0 bottom-2 px-2 z-30">
            <div className={`bg-slate-950/90 backdrop-blur-2xl border border-white/5 px-4 py-2 rounded-xl flex items-center justify-between transition-all ${isAnalyzing ? 'ring-1 ring-blue-500/50' : ''}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                  {isAnalyzing ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin" /> : <Target className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                    {isAnalyzing ? 'SCANNED...' : lastCount !== null ? `${lastCount} DETECTED` : 'READY'}
                  </span>
                  {lastScanTime && <span className="text-[8px] font-bold text-slate-500 uppercase mt-1">SYNC: {lastScanTime}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes yolo-scan { 0% { top: 0; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-yolo-scan { animation: yolo-scan 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default CameraAnalyzer;
