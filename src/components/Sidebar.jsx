import React from 'react';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ levees, onSelectLevee, selectedLeveeId }) => {
  const criticalCount = levees.filter(l => l.status === 'CRITICAL').length;
  const moderateCount = levees.filter(l => l.status === 'MODERATE').length;

  return (
    <div className="w-80 h-screen bg-levee-panel border-r border-levee-border flex flex-col overflow-hidden">
      <div className="p-6 border-b border-levee-border bg-gradient-to-br from-levee-panel to-black">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <img src="/demo-leveesat/logo.png" alt="LeveeSat Logo" className="w-8 h-8 object-contain" />
          LeveeSat <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">v0.5</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">SAR/PSI Monitoring Dashboard</p>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-levee-dark/50 p-3 rounded-lg border border-levee-border">
          <p className="text-xs text-slate-500 uppercase">Critical</p>
          <p className="text-2xl font-bold text-levee-critical">{criticalCount}</p>
        </div>
        <div className="bg-levee-dark/50 p-3 rounded-lg border border-levee-border">
          <p className="text-xs text-slate-500 uppercase">Moderate</p>
          <p className="text-2xl font-bold text-levee-moderate">{moderateCount}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 px-2 flex items-center justify-between">
          Active Monitoring Points
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">{levees.length}</span>
        </h2>
        <div className="space-y-2">
          {levees.map((levee) => {
            const isSelected = levee.id === selectedLeveeId;
            return (
              <button
                key={levee.id}
                onClick={() => onSelectLevee(levee)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all duration-200 group",
                  isSelected 
                    ? "bg-blue-600/10 border-blue-500/50" 
                    : "bg-levee-dark/30 border-levee-border hover:border-slate-600"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={cn(
                      "text-sm font-medium leading-tight",
                      isSelected ? "text-blue-400" : "text-slate-200 group-hover:text-white"
                    )}>
                      {levee.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                        levee.status === 'CRITICAL' ? "bg-red-500/20 text-red-400" :
                        levee.status === 'MODERATE' ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-green-500/20 text-green-400"
                      )}>
                        {levee.status}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Δ: {levee.currentDelta}mm
                      </span>
                    </div>
                  </div>
                  {levee.status === 'CRITICAL' ? (
                    <AlertTriangle className="w-4 h-4 text-levee-critical animate-pulse" />
                  ) : levee.status === 'MODERATE' ? (
                    <Info className="w-4 h-4 text-levee-moderate" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-levee-normal" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-levee-border bg-black/20 text-[10px] text-slate-500 flex justify-between items-center">
        <span>System Online</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          Live Feed
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
