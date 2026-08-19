import React from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, enabled, onToggle }) => {
  if (!enabled) {
    return <>{children}</>;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="py-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950/90 backdrop-blur-md">
      
      {/* Top Floating Helper Tooltip */}
      <div className="mb-4 flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-full border border-slate-800 text-xs shadow-lg">
        <Smartphone className="w-4 h-4 text-blue-400" />
        <span className="font-semibold">Simulador Móvil Android (Pixel 8)</span>
        <button
          onClick={onToggle}
          className="text-xs text-blue-400 hover:text-white underline font-bold ml-2"
        >
          Expandir a Pantalla Completa
        </button>
      </div>

      {/* Android Device Outer Frame */}
      <div className="relative w-full max-w-[400px] h-[820px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Notch / Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700" />
        </div>

        {/* Device Inner Screen */}
        <div className="relative w-full h-full bg-slate-50 flex flex-col overflow-hidden">
          
          {/* Android Status Bar */}
          <div className="h-9 bg-slate-900 text-white px-6 flex items-center justify-between text-xs select-none shrink-0 z-20">
            <span className="font-semibold tracking-tight text-[11px]">{timeStr}</span>
            <div className="w-24" /> {/* Space for notch */}
            <div className="flex items-center gap-2 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold">
                <span>98%</span>
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Screen Content Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {children}
          </div>

          {/* Android Gesture Navigation Bar */}
          <div className="h-5 bg-white flex items-center justify-center shrink-0 z-30 border-t border-slate-100">
            <div className="w-28 h-1 bg-slate-400 rounded-full" />
          </div>

        </div>

      </div>

    </div>
  );
};
