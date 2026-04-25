import React from 'react';
import { X, Navigation, Clock, Thermometer, Radio, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LeveeDetailPanel = ({ levee, onClose }) => {
  if (!levee) return null;

  const percentage = Math.min(100, (Math.abs(levee.currentDelta) / levee.alertThreshold) * 100);
  
  return (
    <div className="absolute top-6 right-6 bottom-6 w-96 bg-levee-panel border border-levee-border rounded-xl shadow-2xl flex flex-col z-[1000] overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-levee-border flex justify-between items-center bg-black/20">
        <h2 className="font-bold text-slate-200">Levee Report</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white mb-2">{levee.name}</h1>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Navigation className="w-4 h-4" />
            <span>{levee.coordinates[0].toFixed(4)}, {levee.coordinates[1].toFixed(4)}</span>
          </div>
        </div>

        <div className="bg-levee-dark/50 rounded-lg p-4 border border-levee-border space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Current Status</span>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold border",
              levee.status === 'CRITICAL' ? "bg-red-500/20 text-red-400 border-red-500/30" :
              levee.status === 'MODERATE' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
              "bg-green-500/20 text-green-400 border-green-500/30"
            )}>
              {levee.status}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 uppercase">Weekly Discrepancy</span>
              <span className="font-mono">{levee.currentDelta} mm/week</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000",
                  levee.status === 'CRITICAL' ? "bg-red-500" :
                  levee.status === 'MODERATE' ? "bg-yellow-500" : "bg-green-500"
                )}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-levee-dark/50 p-4 rounded-lg border border-levee-border flex flex-col items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] text-slate-500 uppercase">Last Pass</span>
            <span className="text-xs font-semibold text-center">{new Date(levee.lastUpdated).toLocaleDateString()}</span>
          </div>
          <div className="bg-levee-dark/50 p-4 rounded-lg border border-levee-border flex flex-col items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-slate-500 uppercase">Satellite</span>
            <span className="text-xs font-semibold">{levee.satellite}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300">Technical Data</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs p-2 bg-levee-dark/30 rounded">
              <span className="text-slate-500">Base Height</span>
              <span className="text-slate-300">{levee.baseHeight}m</span>
            </div>
            <div className="flex justify-between text-xs p-2 bg-levee-dark/30 rounded">
              <span className="text-slate-500">Alert Threshold</span>
              <span className="text-slate-300">±{levee.alertThreshold} mm/week</span>
            </div>
            <div className="flex justify-between text-xs p-2 bg-levee-dark/30 rounded">
              <span className="text-slate-500">Avg. Deformation</span>
              <span className="text-slate-300">{(levee.currentDelta / 7).toFixed(2)} mm/day</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-levee-border bg-black/20">
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20">
          <Send className="w-4 h-4" />
          Dispatch Inspection Team
        </button>
      </div>
    </div>
  );
};

export default LeveeDetailPanel;
