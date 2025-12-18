
import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, Users, AlertCircle, Loader2 } from 'lucide-react';
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

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
        const count = await geminiService.countPeopleInImage(base64Image);
        
        setLastCount(count);
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
      interval = window.setInterval(analyzeFrame, 5000); // Analyze every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Live AI Feed: {zoneName}</h3>
        </div>
        <button 
          onClick={isActive ? stopCamera : startCamera}
          className={`p-2 rounded-lg transition-all ${isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative aspect-video bg-black flex items-center justify-center group">
        {!isActive && !error && (
          <div className="text-center p-6">
            <Camera className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Camera offline. Click the icon above to start AI monitoring.</p>
          </div>
        )}

        {error && (
          <div className="text-center p-6 text-red-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {isActive && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              ) : (
                <Users className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className="text-xs font-bold text-white">
                {lastCount !== null ? `${lastCount} detected` : 'Detecting...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Autoscan every 5s</span>
          <button 
            onClick={analyzeFrame}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            FORCE RE-SCAN
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraAnalyzer;
